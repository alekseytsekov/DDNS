const util = {

    expectThrow : async promise => {
        try{
            let result = await promise;
            console.log(result);
        } catch (err) {
            const invalidJump = err.message.search('invalid JUMP') >= 0;
            const invalidOpcode = err.message.search('invalid opcode') >= 0;
            const outOfGas =err.message.search('out of gas') >= 0;
            const revert = err.message.search('revert') >= 0;

            assert(invalidJump || invalidOpcode || outOfGas || revert, "Expected throw got '" + err + "' instead");
            return;
        }

        assert.fail('Expected throw not received');
    },

    web3Now : (web3) => {
        return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    },

    web3FutureTime : (web3, seconds) => {
        return web3.eth.getBlock(web3.eth.blockNumber).timestamp + seconds;
    },
    timeTravel: (web3, seconds) => {
        return new Promise((resolve, reject) => {
            web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [seconds],
                id: new Date().getTime()
            }, (err, result) => {
                if (err) {
                    reject(err);
                }
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: new Date().getTime()
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        });
    },
    str2bytes : (str) => {
        
        var result = [];
        for (var i = 0; i < str.length; i++) {
          result.push(str.charCodeAt(i));
        }
        return result;
    }
}

module.exports = util;