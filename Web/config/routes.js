
// const auth = require('./../utils/auth');
// const globals = require('./globals');

const home = require('./../controllers/homeController');
const register = require('./../controllers/registerController');

// const ipfs = require('./../controllers/ipfsController');

module.exports = app => {
    
    //home
    app.get('/', home.list);
    app.get('/domain/register', register.register);
    app.get('/domain/isregistered', register.isRegistered);
    app.get('/domain/getPrice', register.getPrice);
    // app.get('/seller/checkBalance', seller.checkBalance);
    // app.get('/seller/withdraw', seller.withdraw);
    // app.post('/ipfs/upload', ipfs.upload);


    // handle all path that missing!
    app.all('*', (req,res) => {
        res.status(404);
        res.send('404 Not Found!');
        res.end();
    });
};