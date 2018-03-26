let config = require('./../config/config');

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

        res.render('partials/buyerRegister', obj);
    }
};