
//const config = require('./../config/config');


module.exports = {
    browse : async (req, res) => {

        let contractInfo = {
            //owner : config.development.contractOwner,
            //address : config.development.contractAddress,
            //abi : config.development.contractAbi,
        };

        res.render('partials/browse');
    },
    viewReceipt : async (req, res) => {


        res.render('partials/receipts');
    },
};