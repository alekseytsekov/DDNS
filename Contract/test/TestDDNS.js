const ddns = artifacts.require("../contracts/ddns.sol");
const utils = require('./utils');

contract('DDNS', function (accounts) {

    const day = 60 * 60 * 24;
    const year = day * 365;

    let contractInstance;

    const _owner = accounts[0];
    const _user = accounts[1];
    const _user2 = accounts[2];

    const ip1 = '101.203.1.56';
    const ip2 = '101.20.200.205';
    const ip3 = '255.255.255.255';

    const ips = [
        ip1,
        ip2,
        ip3
    ]

    let ownerOptions = {
        from: _owner,
        //value: '1000000000000000000', 
        //gas: 100000
    };

    let userOptions = {
        from: _user,
    };

    let secondUserOptions = {
        from: _user2,
    };

    // run tests => 
    let initContractTests = true;
    let registerDomainTests = true;

    let editFunc = true;
    let transferFunc = true;
    let expirationFunc = true;
    let withdrawFunc = true;

    if (initContractTests) {

        describe('Init contract', () => {
            beforeEach(async function () {
                contractInstance = await ddns.new({
                    from: _owner
                });
            });

            it("Should set owner correctly.", async function () {
                let owner = await contractInstance.owner.call();

                assert.strictEqual(owner, _owner, "The expected owner is not set");
            });

            it("Get IP. There are no domains. Should throw exception missing domain.", async function () {
                let ip;

                try {
                    let domain = utils.str2bytes('hello');
                    //console.log(domain);
                    ip = await contractInstance.getIP(domain);
                    assert.isTrue(false, 'Get ip of not registered domain.');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("User should have 0 registered domains.", async function () {

                let domainCount = await contractInstance.getDomainCount(userOptions);

                assert.equal(0, JSON.parse(domainCount), 'There are some registered domains.')
            });

            it("Owner should have 0 registered domains.", async function () {

                let domainCount = await contractInstance.getDomainCount(ownerOptions);

                assert.equal(0, JSON.parse(domainCount), 'There are some registered domains.')
            });

            it("Owner try withdraw funds. Should throw exception. Balance is 0.", async function () {

                try {
                    await contractInstance.withdraw(ownerOptions);
                    assert.isTrue(false, 'Successfully withdraw some funds!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("User try withdraw funds. Should throw exception. Balance is 0. Withdraw is restricted only for owner.", async function () {

                try {
                    await contractInstance.withdraw(userOptions);
                    assert.isTrue(false, 'Successfully withdraw some funds!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Get price of short domain name. Should throw exception, domain name is less than 5 symbols!", async function () {

                let domain = utils.str2bytes('koko');

                try {
                    await contractInstance.getPrice(domain);
                    assert.isTrue(false, 'Domain name min length does not work!');
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Get price of short domain name. Should return 1 ether. domain name length range is 5-9 inclusive!", async function () {

                // let domain = utils.str2bytes('aleks');

                // console.log(domain.length);

                let price = await contractInstance.getPrice('aleks');

                assert.equal(toEthers(1), JSON.parse(price), 'Price does not match!');
            });

            it("Get price of standart domain name. Should return 0.8 ether. domain name length range is 10-14 inclusive!", async function () {

                let price = await contractInstance.getPrice('aleksaleks');

                assert.equal(toEthers(0.8), JSON.parse(price), 'Price does not match!');
            });

            it("Get price of long name. Should return 0.5 ether. domain name length range is greater than 15 inclusive!", async function () {

                let price = await contractInstance.getPrice('domainaleksaleks');

                assert.equal(toEthers(0.5), JSON.parse(price), 'Price does not match!');
            });
        });

    }

    if (registerDomainTests) {

        describe('On domain register. For all TIME TRAVEL test you should start TRUFFLE!', () => {
            beforeEach(async function () {
                contractInstance = await ddns.new({
                    from: _owner
                });
            });

            it("Should register domain correctly for 1 ether.", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let isExist = await contractInstance.isDomainRegister(domainName);

                assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
            });

            it("Should register domain correctly for 0.8 ether.", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                let isExist = await contractInstance.isDomainRegister(domainName);

                assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
            });

            it("Should register domain correctly for 0.5 ether.", async function () {

                let domainName = 'hello_hello_hello';

                userOptions.value = toEthers(0.5);

                await contractInstance.register(domainName, ipToHex(ip3), userOptions);

                let isExist = await contractInstance.isDomainRegister(domainName);

                assert.equal(true, JSON.parse(isExist), "The expected owner is not set");
            });

            it("Should throw exception when you try to register domain with higher price. Current price is 0.5", async function () {

                let domainName = 'hello_hello_hello';

                userOptions.value = toEthers(0.7);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Should throw exception when you try to register domain with lower price. Current price is 0.5", async function () {

                let domainName = 'hello_hello_hello';

                userOptions.value = toEthers(0.3);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Should throw exception when you try to register domain with higher price. Current price is 0.8", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(2);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Should throw exception when you try to register domain with lower price. Current price is 0.8", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.3);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Should throw exception when you try to register domain with higher price. Current price is 1", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(2);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Should throw exception when you try to register domain with lower price. Current price is 1", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(0.95);

                try {
                    await contractInstance.register(domainName, ipToHex(ip3), userOptions);
                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }

            });

            it("Register domain correctly, another domain should not exist", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                let isExist = await contractInstance.isDomainRegister('some domain');

                assert.equal(false, JSON.parse(isExist), "The expected owner is not set");
            });

            it("Try register domain twice. Different users. Should throw exception!", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                try {
                    secondUserOptions.value = toEthers(1);
                    await contractInstance.register(domainName, ipToHex(ip2), secondUserOptions);

                    assert.isTrue(false, 'Domain is registered twice!')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Try register domain twice. Same user. Should throw exception!", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                try {
                    await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                    assert.isTrue(false, 'Domain is registered twice!')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Try register domain with short name. Should throw exception!", async function () {

                let domainName = 'hell';

                userOptions.value = toEthers(1);

                try {
                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    //await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Try register domain with long name. Should throw exception!", async function () {

                let domainName = '0123456789aleks0123456789aleks0123456789aleks0123456789aleks';

                userOptions.value = toEthers(1);

                

                try {
                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    //await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                    assert.isTrue(false, 'Domain is registered!')
                } catch (e) {
                    assert.isTrue(true);
                }
            });

            it("Register domain twice. Time span 1 year + 2 day. Different users. Should register!", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                try {

                    await utils.timeTravel(web3, year + (day * 2));

                    secondUserOptions.value = toEthers(1);
                    await contractInstance.register(domainName, ipToHex(ip2), secondUserOptions);

                    assert.isTrue(true)
                } catch (e) {

                    assert.isTrue(false, 'Domain cant be registered!');
                }
            });

            it("Register domain twice. Time span 1 year + 1 day. Same user. Should register!", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                try {

                    await utils.timeTravel(web3, year + day);

                    await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                    assert.isTrue(true)
                } catch (e) {

                    assert.isTrue(false, 'Domain cant be registered!');
                }
            });

            it("Register Nth unique domains, count should match", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                let numOfDomains = getRandomInt(2, 10);

                for (let i = 0; i < numOfDomains; i++) {

                    let ipIndex = getRandomInt(0, 3);
                    await contractInstance.register(domainName + '_' + i, ipToHex(ips[ipIndex]), userOptions);
                }

                let uniqueDomainCount = await contractInstance.getDomainCount({
                    from: _user
                });

                assert.equal(numOfDomains, JSON.parse(uniqueDomainCount), "Count does not match!");
            });

            it("Register unique domain twice. Time span 1 year + 1 day. Same user. Count should be 1 !", async function () {

                let domainName = 'hello';

                userOptions.value = toEthers(1);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                await utils.timeTravel(web3, year + day);
                await contractInstance.register(domainName, ipToHex(ip2), userOptions);

                let uniqueDomainCount = await contractInstance.getDomainCount({
                    from: _user
                });

                assert.equal(1, JSON.parse(uniqueDomainCount), "Count does not match!");
            });

            it("Check IP address of registered domain. Should match", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                // '101.203.1.56'
                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let ip = await contractInstance.getIP(domainName, {
                    from: _user
                });

                //console.log(ip);
                ip = hex2ip(ip);

                assert.equal(ip, ip1, "Invalid IP address");
            });

            it("Check owner of registered domain. Should match", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let domainOwner = await contractInstance.getDomainOwner(domainName, {
                    from: _user2
                });

                assert.equal(_user, domainOwner, "Owner do not match!");
            });

            it("Check owner of registered domain. Should NOT match", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let domainOwner = await contractInstance.getDomainOwner(domainName, {
                    from: _user2
                });

                assert.notEqual(_user, _user2, "Owner do not match!");
            });

            it("Get domain receipt.", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                    from: _user
                });

                //console.log(result[0].length);
                //console.log(JSON.parse(result[0][0]))
                //console.log(JSON.parse(result[1][0]))
                //console.log(JSON.parse(result[2][0]))

                let numOfReceipt = result[0].length;

                assert.equal(1, numOfReceipt, "Number of receipt does not match!");
            });

            it("Try get domain receipt. USer do not own domain!", async function () {

                let domainName = 'hello_hello';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                    from: _user2
                });

                let numOfReceipt = result[0].length;

                assert.equal(0, numOfReceipt, "Number of receipt does not match!");
            });

            it("Get domain receipts. Extend expiration date.", async function () {

                let domainName = 'hello_hell';

                userOptions.value = toEthers(0.8);

                await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                await contractInstance.extendExpirationDate(domainName, userOptions);

                let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                    from: _user
                });

                let numOfReceipt = result[0].length;

                assert.equal(2, numOfReceipt, "Number of receipt does not match!");
            });

            it("Get domain receipt. Add Nth domains", async function () {

                let domainName = 'hello_hell';

                userOptions.value = toEthers(0.8);
                let numOfDomains = getRandomInt(2, 10);
                let domains = [];

                for (let i = 0; i < numOfDomains; i++) {
                    let name = domainName + '_' + i;
                    await contractInstance.register(name, ipToHex(ip1), userOptions);

                    domains.push(name);
                }

                let countOfReceipt = 0;

                //console.log(domains);

                for (let i = 0; i < domains.length; i++) {
                    let result = await contractInstance.getOwnerReceiptByDomain(domains[i], {
                        from: _user
                    });

                    countOfReceipt += parseInt(result[0].length);
                }

                assert.equal(numOfDomains, countOfReceipt, "Number of receipt does not match!");
            });

        });
    }

    describe('Functionality', () => {

        beforeEach(async function () {
            contractInstance = await ddns.new({
                from: _owner
            });
        });

        if (editFunc) {

            describe('Edit domain', () => {

                it("Edit - Owner should edit ip address.", async function () {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.edit(domainName, ipToHex(ip2), {
                        from: _user
                    });
                    let newIp = await contractInstance.getIP(domainName);
                    newIp = hex2ip(newIp);

                    assert.equal(ip2, newIp, "The IP is not edited!");
                });

                

                it("Edit - Owner should edit ip address. Multiple domains", async function () {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register('hello1', ipToHex(ip1), userOptions);
                    await contractInstance.register('hello2', ipToHex(ip1), userOptions);
                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    await contractInstance.edit(domainName, ipToHex(ip2), {
                        from: _user
                    });
                    let newIp = await contractInstance.getIP(domainName);
                    newIp = hex2ip(newIp);

                    assert.equal(ip2, newIp, "The IP is not edited!");
                });

                it("Edit - Not owner should NOT edit ip address. Throw exception", async function () {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    let ipEdit = ipToHex(ip2);


                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.edit(domainName, ipEdit, {
                            from: _user2
                        });
                        let newIp = await contractInstance.getIP(domainName);
                        newIp = hex2ip(newIp);
                        assert.isEqual(false, "Ip address is edited!")
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Edit - Owner should NOT edit ip address of NOT existing domain.  Throw exception", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    let ipEdit = ipToHex(ip2);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.edit('hello1', ipEdit, {
                            from: _user
                        });
                        let newIp = await contractInstance.getIP('hello1');
                        newIp = hex2ip(newIp);

                        assert.isEqual(false, "The IP is edited!");
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Edit - Should NOT edit ip address of expired domain. Throw exception", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    let ipEdit = ipToHex(ip2);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    await utils.timeTravel(web3, year + (day * 1));

                    try {
                        await contractInstance.edit(domainName, ipEdit, {
                            from: _user
                        });

                        let newIp = await contractInstance.getIP(domainName);
                        newIp = hex2ip(newIp);

                        assert.isEqual(false, "The IP is edited!");
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

            });

        }

        if (transferFunc) {

            describe('Transfer domain', () => {

                ////// Transfer //////
                it("Transfer - Owner should transfer domain.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.transferDomain(domainName, _user2, {
                        from: _user
                    });

                    let currentOwner = await contractInstance.getDomainOwner(domainName);


                    assert.equal(_user2, currentOwner, "The owner is not changed!");
                });

                it("Transfer - Owner should transfer domain. Check receipt of the new owner.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.register(domainName + 1, ipToHex(ip1), userOptions);
                    await contractInstance.transferDomain(domainName, _user2, {
                        from: _user
                    });

                    let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                        from: _user2
                    });
                    let numOfReceipt = result[0].length;

                    assert.equal(1, numOfReceipt, "After transfer receipt does not transfer to the new owner!");
                });

                it("Transfer - Owner should transfer domain. Check receipt of the old owner.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.extendExpirationDate(domainName, userOptions);
                    await contractInstance.transferDomain(domainName, _user2, {
                        from: _user
                    });

                    let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                        from: _user
                    });
                    let numOfReceipt = result[0].length;

                    assert.equal(2, numOfReceipt, "After transfer receipt does not transfer to the new owner!");
                });

                it("Transfer - Not owner should NOT transfer domain. Throw exception", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.transferDomain(domainName, _owner, {
                            from: _user2
                        });
                        let currentOwner = await contractInstance.getDomainOwner(domainName);

                        assert.isTrue(false, "The owner is changed!");
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Transfer - Should NOT transfer domain of NOT existing one. Throw exception", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.transferDomain('hello1', _owner, {
                            from: _user
                        });

                        assert.isTrue(false, "The domain is transfer!");
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Transfer - Should NOT transfer expired domain. Throw exception", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await utils.timeTravel(web3, year + (day * 1));

                    try {
                        await contractInstance.transferDomain(domainName, _owner, {
                            from: _user
                        });

                        assert.isTrue(false, "The domain is transfer!");
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

            })

        }

        if (expirationFunc) {

            describe('Extend expiration date', () => {

                showReceiptListInfo();

                //////// Extend expiration date ///////////
                it("Expiration Date - Owner check expiration date after registration.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    let currentTime = utils.web3Now(web3);
                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                        from: _user
                    });

                    //console.log(result[0].length);
                    //console.log(JSON.parse(result[0][0]))
                    //console.log(JSON.parse(result[1][0]))
                    //console.log(JSON.parse(result[2][0]))

                    let expirationDate = parseInt(result[2][0]);

                    // console.log('now');
                    // console.log(currentTime);
                    // console.log(currentTime + year);
                    // console.log(expirationDate);
                    // console.log(result[2][0]);

                    if (currentTime + year <= expirationDate + 10) {
                        assert.isTrue(true);
                    } else {
                        assert.isTrue(false, 'Expiration date is not same!');
                    }

                });

                it("Expiration Date - Owner should extend expiration date.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    let currentTime = utils.web3Now(web3);
                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.extendExpirationDate(domainName, userOptions);

                    let result = await contractInstance.getOwnerReceiptByDomain(domainName, {
                        from: _user
                    });
                    // result from receipt[x][y]
                    // X - 0 - array that contain array of prices
                    // X - 1 - array that contain array of creations
                    // X - 2 - array that contain array of expires
                    //
                    // get second receipt record /index 1/ from ownerReceipt ....
                    // Y - index Nth - is every additional record when extend expiration date or register again is executed
                    let expirationDate = parseInt(result[2][1]);

                    if (currentTime + year * 2 <= expirationDate + 10) {
                        assert.isTrue(true);
                    } else {
                        assert.isTrue(false, 'Expiration date is not same!');
                    }

                });

                it("Expiration Date - Owner should NOT extend expiration date of expired domain. Throw exception!", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    await utils.timeTravel(web3, year + (day * 1));

                    try {
                        await contractInstance.extendExpirationDate(domainName, userOptions);

                        assert.isTrue(false, 'Expiration date is changed!');
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Expiration Date - Owner should NOT extend expiration date without payment. Throw exception!", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.extendExpirationDate(domainName, {
                            from: _user
                        });

                        assert.isTrue(false, 'Expiration date is changed without payment!');
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Expiration Date - Not owner should NOT extend expiration date. Throw exception!", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.extendExpirationDate(domainName, {
                            from: _user2,
                            value: toEthers(1)
                        });

                        assert.isTrue(false, 'Expiration date is changed from not owner!');
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Expiration Date - Not owner should NOT extend expiration date without payment. Throw exception!", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.extendExpirationDate(domainName, {
                            from: _user2,
                            value: toEthers(1)
                        });

                        assert.isTrue(false, 'Expiration date is changed from not owner!');
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

                it("Expiration Date - Should NOT extend expiration date of NOT existing domain.", async function () {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.extendExpirationDate('hello1', userOptions);

                        assert.isTrue(false, 'Change expiration date of unregister domain!');
                    } catch (e) {
                        assert.isTrue(true);
                    }
                });

            });

        }

        if(withdrawFunc){

            describe('Withdraw / payments tests', () => {
                ////////////// Withdraw /////////////////

                it("Contract should receive 1 ether.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    let balance = web3.eth.getBalance(contractInstance.contract.address);
                    
                    assert.equal(toEthers(1), balance, "Withdraw does not work correct!");
                });

                it("Contract should receive 1.8 ether.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});

                    let balance = web3.eth.getBalance(contractInstance.contract.address);
                    
                    assert.equal(toEthers(1.8), balance, "Withdraw does not work correct!");
                });

                it("Contract should receive 2.3 ether.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});
                    await contractInstance.register('aleksaleksaleks1', ipToHex(ip3), { from : _owner, value : toEthers(0.5)});

                    let balance = web3.eth.getBalance(contractInstance.contract.address);
                    
                    assert.equal(toEthers(2.3), balance, "Withdraw does not work correct!");
                });

                it("Owner should withdraw 1 /all/ ethers.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    let beforeWithdraw = web3.eth.getBalance(contractInstance.contract.address);
                    
                    await contractInstance.withdraw({ from : _owner});

                    let afterWithdraw = web3.eth.getBalance(contractInstance.contract.address);

                    assert.equal(0, afterWithdraw, "Withdraw does not work correct!");
                });

                it("Owner should withdraw 3.3 /all/ ethers.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);
                    await contractInstance.register('hello1', ipToHex(ip1), userOptions);
                    await contractInstance.register('aleksaleks', ipToHex(ip2), { from : _user2, value : toEthers(0.8)});
                    await contractInstance.register('aleksaleksaleks1', ipToHex(ip3), { from : _owner, value : toEthers(0.5)});

                    let beforeWithdraw = web3.eth.getBalance(contractInstance.contract.address);
                    
                    await contractInstance.withdraw({ from : _owner});

                    let afterWithdraw = web3.eth.getBalance(contractInstance.contract.address);

                    assert.equal(0, afterWithdraw, "Withdraw does not work correct!");
                });

                it("NOT owner should try to withdraw. Throw exception!", async function() {
                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    let beforeWithdraw = web3.eth.getBalance(contractInstance.contract.address);

                    try {
                        await contractInstance.withdraw({ from : _user2});
                        assert.isTrue(false, 'User can use withdraw func!')
                    } catch(e) {
                        assert.isTrue(true);
                    }
                });

                it("Not owner should withdraw 1 ether. Balance should be the same /1 ether/.", async function() {

                    let domainName = 'hello';
                    userOptions.value = toEthers(1);

                    await contractInstance.register(domainName, ipToHex(ip1), userOptions);

                    try {
                        await contractInstance.withdraw({ from : _user2});
                        assert.isTrue(false, 'User can use withdraw func!')
                    } catch(e) {
                        assert.isTrue(true);
                    }

                    let balance = web3.eth.getBalance(contractInstance.contract.address);

                    assert.equal(toEthers(1), balance, "Withdraw does not work correct!");
                });
            });

        }
    });
});

function showReceiptListInfo(){
    console.log();
    console.log('-------- Receipt list info ----------');
    console.log('result from receipt[x][y]');
    console.log();
    console.log('X - 0 - array that contain array of prices');
    console.log('X - 1 - array that contain array of creations');
    console.log('X - 2 - array that contain array of expires');
    console.log();
    console.log('get second receipt record /index 1/ from ownerReceipt ....');
    console.log('Y - index Nth - is every additional record when extend expiration date or register again is executed');
    console.log();
}

function toEthers(amount) {
    return web3._extend.utils.toWei(amount, 'ether');
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function ipToHex(ip) {
    let tokens = ip.split('.');

    if (tokens.length != 4) {
        throw 'Input is not valid ip address';
    }

    let asHex = '0x';

    for (let i = 0; i < 4; i++) {

        if (!Number.isInteger(parseInt(tokens[i])) || parseInt(tokens[i]) < 0 || parseInt(tokens[i]) > 255) {
            throw 'Input is not valid ip address';
        }

        //console.log('==> ' + web3._extend.utils.toHex(tokens[i]));
        //console.log('=> ' + parseInt(tokens[i]).toString(16));
        //console.log('=> ' + tokens[i].toString(16));

         if (parseInt(tokens[i]) < 10) {
            
            asHex += '0' + tokens[i];
        } else {

            let hex = parseInt(tokens[i]).toString(16);
            if(hex.length < 2){
                hex = '0' + hex;
            }
            asHex += hex;
        }

    }

    return asHex;
}

function hex2ip(hex) {

    if (hex.length != 10) {
        return '';
    }

    let ip = '';

    for (let i = 2; i < 10; i += 2) {
        let digit = hex[i] + hex[i + 1];

        if (i == 8) {
            ip += parseInt(digit, 16);
        } else {
            ip += parseInt(digit, 16) + '.';
        }
    }

    return ip;
}