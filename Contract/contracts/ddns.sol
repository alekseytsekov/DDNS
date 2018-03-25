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
    mapping(bytes32 => uint) private domainExpirationDate;
    
    // all info about owner  and its domains
    mapping(address => mapping(bytes32 => Receipt[])) private ownerReceipts;
    
    event LogRegister(address indexed addr, bytes32 _domain, uint indexed createdOn);
    event LogTransferDomain(address indexed newOwner, address indexed oldOwner, bytes32 indexed _domain);
    event LogUpdateExipationDate(address owner, bytes32 indexed _domain, uint indexed expirationDate);
    
    modifier domainMinLenght(bytes domain){
        require(domain.length >= 5);
        _;
    }
    
    modifier isDomainFree(bytes domain){
        bytes32 domainHash = keccak256(domain);
        
        if(!registeredDomains[domainHash]){
            require(true);
        } else {
            
            // check is domain active
            if(now < domainExpirationDate[domainHash]){
                require(false);
            } else {
                
                clearDomain(domainHash);
                require(true);
            }
        }
        
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
        
        bytes32 domainHash = keccak256(domain);
        
        if(now < domainExpirationDate[domainHash]){
            require(true);
        } else {
            //clearDomain(domainHash);
            require(false);
        }

        _;
    }
    
    function clearDomain(bytes32 domainHash) private {
        
        registeredDomains[domainHash] = false;
            
        // depends on business logic
        domainOwners[domainHash] = address(0);
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
        ownerReceipts[msg.sender][domainHash].push(Receipt({domainName : domain, amountPaidWei : msg.value, timestamp: now, expires: now + 1 years}));
        domainIp[domainHash] = ip;
        domainExpirationDate[domainHash] = now + 1 years;
        
        if(ownerReceipts[msg.sender][domainHash].length == 1) {
            ownerAllDomains[msg.sender].push(Domain({domainName : domain}));
        }
        
        //emit LogRegister(msg.sender, domainHash, now);
        LogRegister(msg.sender, domainHash, now);
    }
    
    
    
    function edit(bytes domain, bytes4 newIp) public isDomainExist(domain) isActive(domain) canEdit(domain) {
        domainIp[keccak256(domain)] = newIp;
    }
    
    function transferDomain(bytes domain, address newOwner) public isActive(domain) canEdit(domain) {
        
        bytes32 domainHash = keccak256(domain);
        
        domainOwners[domainHash] = newOwner;
        
        if(ownerReceipts[newOwner][domainHash].length < 1) {
            ownerAllDomains[msg.sender].push(Domain({domainName : domain}));
        }
        
        // get index of last receipt
        uint lastReceipt = ownerReceipts[msg.sender][domainHash].length;
        
        // assign domain to new owner and create receipt to describe transfer event paid amound should be 0 
        ownerReceipts[newOwner][domainHash].push(Receipt({domainName : domain, amountPaidWei : 0, timestamp: now, expires: ownerReceipts[msg.sender][domainHash][lastReceipt - 1].expires }));
        
        //emit LogTransferDomain(newOwner, msg.sender, domainHash);
        LogTransferDomain(newOwner, msg.sender, domainHash);
    }
    
    function extendExpirationDate(bytes domain) public payable isActive(domain) canEdit(domain) isPriceMatch(domain) {
        
        bytes32 domainHash = keccak256(domain);
        uint lastReceiptIndex = ownerReceipts[msg.sender][domainHash].length;
        ownerReceipts[msg.sender][domainHash].push(Receipt({domainName : domain, amountPaidWei : msg.value, timestamp: now, expires: ownerReceipts[msg.sender][domainHash][lastReceiptIndex - 1].expires + 1 years }));
        
        domainExpirationDate[domainHash] = ownerReceipts[msg.sender][domainHash][lastReceiptIndex].expires;
        
        //emit LogUpdateExipationDate(msg.sender, domainHash, ownerReceipts[msg.sender][domainHash][lastReceiptIndex].expires);
        LogUpdateExipationDate(msg.sender, domainHash, ownerReceipts[msg.sender][domainHash][lastReceiptIndex].expires);
    }

    function getOwnerReceiptByDomain(bytes domain) public view returns (uint[], uint[], uint[]) {
        //uint amountPaidWei; 
        //uint timestamp; // created on 
        //uint expires;
        
        bytes32 domainHash = keccak256(domain);
        
        uint[] memory price = new uint[](ownerReceipts[msg.sender][domainHash].length);
        uint[] memory createdOn = new uint[](ownerReceipts[msg.sender][domainHash].length);
        uint[] memory expires = new uint[](ownerReceipts[msg.sender][domainHash].length);
        
        // ownerAllDomains[msg.sender].length - is number of receipts per domain
        
        for(uint i = 0; i < ownerReceipts[msg.sender][domainHash].length; i++){
            price[i] = ownerReceipts[msg.sender][domainHash][i].amountPaidWei;
            createdOn[i] = ownerReceipts[msg.sender][domainHash][i].timestamp;
            expires[i] = ownerReceipts[msg.sender][domainHash][i].expires;
        }
        
        return (price, createdOn, expires);
    }
    
    function getIP(bytes domain) public view isDomainExist(domain) isActive(domain) returns (bytes4) {
        //isActive(domain)
        return domainIp[keccak256(domain)];
    }

    function getDomainOwner(bytes domain) public view returns (address) {
        return domainOwners[keccak256(domain)];
    }
    
    function getDomainCount() public view returns (uint) {
        return ownerAllDomains[msg.sender].length;
    }
    
    function getOwnerDomain(uint index) public view returns (bytes) {
        return ownerAllDomains[msg.sender][index].domainName;
    }
    
    function isDomainRegister(bytes domain) public view returns (bool) {
        return registeredDomains[keccak256(domain)];
    }
    
    function withdraw() public isOwner {
        require(address(this).balance > 0);
        owner.transfer(address(this).balance);
    }
}