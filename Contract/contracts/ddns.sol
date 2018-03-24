pragma solidity ^0.4.19;

contract Ownable {
    
    address public owner;
    
    function Ownable() public {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
}

contract DDNS is Ownable {
    
    struct Receipt{
        bytes domainName;
        uint amountPaidWei; 
        uint timestamp; // created on 
        uint expires;
    }
    
    struct Domain {
        bytes domainName;
    }
    
    // useless mapping ?!?!
    //This will create an automatic getter with 2 arguments: address and index of receipt
    //mapping(address => Receipt[]) public receipts; 
    
    mapping(address => Domain[]) private ownerAllDomains;
    
    // quick check is domain already registered
    mapping(bytes32 => bool) private registeredDomains;
    
    // if we need to known which domain is owned by
    mapping(bytes32 => address) private domainOwners;
    
    // get ip of domain
    mapping(bytes32 => bytes4) private domainIp;
    
    // get domain expiration update
    mapping(bytes32 => uint) domainExpirationDate;
    
    // all info about owner  and its domains
    mapping(address => mapping(bytes32 => Receipt[])) private ownerDomains;
    
    event LogRegister(address indexed addr, bytes indexed _domain, uint indexed createdOn);
    event LogTransferDomain(address indexed newOwner, address indexed oldOwner, bytes indexed _domain);
    event LogUpdateExipationDate(address owner, bytes indexed _domain, uint indexed expirationDate);
    
    modifier domainMinLenght(bytes domain){
        require(domain.length >= 5);
        _;
    }
    
    modifier isDomainFree(bytes domain){
        require(!registeredDomains[keccak256(domain)]);
        _;
    }
    
    modifier isDomainExist(bytes domain){
        require(registeredDomains[keccak256(domain)]);
        _;
    }
    
    modifier isPriceMatch(bytes domain) {
        require(msg.value == getPrice(domain));
        _;
    }
    
    modifier canEdit(bytes domain) {
        require(domainOwners[keccak256(domain)] == msg.sender);
        _;
    }
    
    modifier isActive(bytes domain) {
        if(domainExpirationDate[keccak256(domain)] < now){
            require(true);
        } else {
            registeredDomains[keccak256(domain)] = false;
            
            // depends on business logic
            domainOwners[keccak256(domain)] = address(0);
            
            require(false);
        }
        
        _;
    }
    
    function getPrice(bytes domain) public pure domainMinLenght(domain) returns (uint) {
        if(domain.length >= 5 && domain.length < 10){
            return 1 ether;
        } else if(domain.length >= 10 && domain.length < 15){
            return 0.8 ether;
        } else {
            return 0.5 ether;
        }
    }
    
    //the domain is bytes, because string is UTF-8 encoded and we cannot get its length
    //the IP is bytes4 because it is more efficient in storing the sequence
    function register(bytes domain, bytes4 ip) public payable isDomainFree(domain) isPriceMatch(domain) {
        
        bytes32 domainHash = keccak256(domain);
        
        registeredDomains[domainHash] = true;
        domainOwners[domainHash] = msg.sender;
        ownerDomains[msg.sender][domainHash].push(Receipt({domainName : domain, amountPaidWei : msg.value, timestamp: now, expires: now + 1 years}));
        domainIp[domainHash] = ip;
        domainExpirationDate[domainHash] = now + 1 years;
        
        if(ownerDomains[msg.sender][domainHash].length < 1) {
            ownerAllDomains[msg.sender].push(Domain({domainName : domain}));
        }
        
        
        emit LogRegister(msg.sender, domain, now);
    }
    
    
    
    function edit(bytes domain, bytes4 newIp) public isDomainExist(domain) isActive(domain) canEdit(domain) {
        domainIp[keccak256(domain)] = newIp;
    }
    
    function transferDomain(bytes domain, address newOwner) public isActive(domain) canEdit(domain) {
        
        bytes32 domainHash = keccak256(domain);
        
        domainOwners[domainHash] = newOwner;
        
        if(ownerDomains[newOwner][domainHash].length < 1) {
            ownerAllDomains[msg.sender].push(Domain({domainName : domain}));
        }
        
        
        // mapping(address => mapping(bytes32 => Receipt[])) private ownerDomains;
        // get index of last receipt
        uint lastReceipt = ownerDomains[msg.sender][domainHash].length;
        
        // assign domain to new owner and create receipt to describe transfer event paid amound should be 0 
        ownerDomains[newOwner][domainHash].push(Receipt({domainName : domain, amountPaidWei : 0, timestamp: now, expires: ownerDomains[msg.sender][domainHash][lastReceipt - 1].expires }));
        
        emit LogTransferDomain(newOwner, msg.sender, domain);
    }
    
    function extendExirationDate(bytes domain) public payable isActive(domain) canEdit(domain) isPriceMatch(domain) {
        
        bytes32 domainHash = keccak256(domain);
        uint lastReceiptIndex = ownerDomains[msg.sender][domainHash].length;
        ownerDomains[msg.sender][domainHash].push(Receipt({domainName : domain, amountPaidWei : msg.value, timestamp: now, expires: ownerDomains[msg.sender][domainHash][lastReceiptIndex - 1].expires + 1 years }));
        
        domainExpirationDate[domainHash] = ownerDomains[msg.sender][domainHash][lastReceiptIndex].expires;
        
        emit LogUpdateExipationDate(msg.sender, domain, ownerDomains[msg.sender][domainHash][lastReceiptIndex].expires);
    }
    
    function getIP(bytes domain) public isDomainExist(domain) isActive(domain) returns (bytes4) {
        //require(registeredDomains[keccak256(domain)]);
        
        return (domainIp[keccak256(domain)]);
    }
    
    function getDomainCount() public view returns (uint) {
        return ownerAllDomains[msg.sender].length;
    }
    
    function getOwnerDomain(uint index) public view returns (bytes) {
        return ownerAllDomains[msg.sender][index].domainName;
    }
}