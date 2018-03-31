
const fs = require('fs');
let contractData = fs.readFileSync('./config/contractData.json', 'utf8')

contractData = JSON.parse(contractData)
console.log(contractData.address);


module.exports = {
    development :{
        port : process.env.PORT || 5000,
        //contractOwner : contractData.owner, //'0x627306090abab3a6e1400e9345bc60c78a8bef57',
        //contractAbi : contractData.abi
        contractAddress : contractData.address,
    }
    //production : {}
};