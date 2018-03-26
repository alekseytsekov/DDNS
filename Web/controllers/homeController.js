
const config = require('./../config/config');
const fs = require("fs");

module.exports = {
    // index : async (req, res) => {

    //     let obj = {
    //         isAdmin : false,
    //         title : 'DApp Market Place',
    //         message : "Hello world!"
    //     };

    //     let error = req.query.error;
    //     let success = req.query.success;
    //     if (error) {
    //         obj.error = error;
    //     }

    //     if (success) {
    //         data.success = success;
    //     }

    //     res.render('partials/index', obj);
    // },
    list : async (req, res) => {

        let contractInfo = {
            //owner : config.development.contractOwner,
            //address : config.development.contractAddress,
            //abi : config.development.contractAbi,

            shouldGetProducts : true
        };

        res.render('partials/list', contractInfo);
    }
};