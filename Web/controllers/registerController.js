module.exports = {
    register : async (req, res) => {

        let contractInfo = {
            //owner : config.development.contractOwner,
            //address : config.development.contractAddress,
            //abi : config.development.contractAbi,

            shouldGetProducts : true
        };

        res.render('partials/registerDomain', contractInfo);
    },
    getPrice : async (req, res) => {

        res.render('partials/getDomainPrice');
    },
    isRegistered : async (req, res) => {

        res.render('partials/isDomainRegistered');
    }

};