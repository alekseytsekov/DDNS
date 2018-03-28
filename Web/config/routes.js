

const homeController = require('./../controllers/homeController');
const registerController = require('./../controllers/registerController');
const editController = require('./../controllers/editController');

// const ipfs = require('./../controllers/ipfsController');

module.exports = app => {
    
    //home
    app.get('/', homeController.browse);
    app.get('/browse', homeController.browse);
    app.get('/domain/register', registerController.register);
    app.get('/domain/isregistered', registerController.isRegistered);
    app.get('/domain/getPrice', registerController.getPrice);

    app.get('/domain/edit', editController.editIp);
    app.get('/domain/transfer', editController.transferDomainOwner);
    app.get('/domain/extend', editController.extendDomainExpDate);

    app.get('/domain/receipt', homeController.viewReceipt);
    app.get('/withdraw', homeController.withdraw);
    
    // app.post('/ipfs/upload', ipfs.upload);


    // handle all path that missing!
    app.all('*', (req,res) => {
        res.status(404);
        res.send('404 Not Found!');
        res.end();
    });
};