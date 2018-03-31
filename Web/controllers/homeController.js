
//const config = require('./../config/config');


module.exports = {
    browse : async (req, res) => {

        res.render('partials/browse'); // { contractInfo }
    },
    viewReceipt : async (req, res) => {


        res.render('partials/receipts');
    },
    withdraw : async (req, res) => {


        res.render('partials/withdraw');
    },
};