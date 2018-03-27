
module.exports = {
    editIp : async (req, res) => {


        res.render('partials/editIp');
    },
    transferDomainOwner : async (req, res) => {


        res.render('partials/transferDomainOwner');
    },
    extendDomainExpDate : async (req, res) => {


        res.render('partials/extendDomainExpDate');
    },
};