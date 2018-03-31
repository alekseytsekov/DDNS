const solc = require('solc');
const fs = require('fs');

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
//const web3 = new Web3('http://127.0.0.1:8545');

const ownerAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";

const code = fs.readFileSync('./../../Contract/contracts/ddns.sol').toString();
const compiledCode = solc.compile(code);
const abiDefinition = JSON.parse(compiledCode.contracts[':DDNS'].interface);

const byteCode = compiledCode.contracts[':DDNS'].bytecode;

var account = web3.eth.accounts[0];
const DDNSContract = new web3.eth.Contract(abiDefinition);

DDNSContract.deploy({
		data: byteCode,
	})
	.send({
		from: ownerAddress,
		gas: 4000000,
		//gasPrice: '3000',
	})
	.then((instance) => {
		let data = {};

		data.owner = ownerAddress;
		data.address = instance.options.address;
		data.abi = abiDefinition;

		fs.writeFileSync('./contractData.json', JSON.stringify(data), 'utf8', function (e) {
			if (e) {
				console.log('Has error! File does not been saved!');
			}

			console.log('File saved successfully!');
			console.log('address: ' + data.address);
		});

		//console.log(`Address: ${JSON.parse(instance.options)}`);
	});