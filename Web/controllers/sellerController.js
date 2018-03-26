
const config = require('./../config/config');

module.exports = {
    register : async (req, res) => {

        let obj = {
            contractCreator : config.development.contractCreator,
            contractAddress : config.development.contractAddress,
        };

        let error = req.query.error;
        let success = req.query.success;
        if (error) {
            obj.error = error;
        }

        if (success) {
            data.success = success;
        }

        res.render('partials/sellerRegister', obj);
    },
    addProduct : async (req, res) => {

        let obj = {
            contractCreator : config.development.contractCreator,
            contractAddress : config.development.contractAddress,
        };

        res.render('partials/sellerAddProduct', obj);
    },
    checkBalance : async (req, res) => {
        let obj = {
            contractCreator : config.development.contractCreator,
            contractAddress : config.development.contractAddress,
        };

        res.render('partials/sellerCheckBalance', obj);
    },
    withdraw : async (req, res) => {
        let obj = {
            contractCreator : config.development.contractCreator,
            contractAddress : config.development.contractAddress,
        };

        res.render('partials/withdraw', obj);
    }
};