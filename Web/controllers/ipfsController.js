const ipfsAPI = require('ipfs-api');

//const ipfsAPI = require('./../lib/ipfs');
//var ipfsAPI = require('https://unpkg.com/ipfs-api@9.0.0/dist/index.js');

const fs = require('fs');

module.exports = {
    upload: async (req, res) => {

        let buf = req.body.buffer.data;

        var myBuffer = new Buffer(buf.length);
        for (var i = 0; i < buf.length; i++) {
            myBuffer[i] = buf[i];
        }

        // working
        // fs.writeFile("./temp/test-al.jpg", myBuffer, function (err) {
        //     if (err) {
        //         return console.log(err);
        //     }

            
        // });
        // working


        console.log('asdadadadadasdad');
        var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
        //aaa();
        //bb();
        cc();

        function aaa(){


            try {

                const files = [{
                    path: './temp/file',
                    content : myBuffer
                }];

                console.log(ipfs.add);

                ipfs.files.add([files], function(err, result) { // Upload buffer to IPFS

                    console.log('4');
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.error('=== success ===');
                    console.error(result);
                    console.error(result[0].hash);
                    //let url = `https://ipfs.io/ipfs/${result[0].hash}`
    
                    res.status(200);
                    res.send('some url');
                    res.end();
                });
            } catch (e) {
                console.error('=== err ===');
                console.error(e);
    
                res.status(500);
                res.send(url);
                res.end();
            }
        }

        function bb(){
            ipfs.files.add(myBuffer, (err, result) => { // Upload buffer to IPFS
					if (err) {
						console.error(err);
						return;
					}

                    let url = `https://ipfs.io/ipfs/${result[0].hash}`;
                    
                    console.log(result);
				});
        }

        function cc(){
            ipfs.files.add([new Buffer(myBuffer)]).then((result) => {
                // do something with res
                //console.log(result);

                res.status(200);
                res.send(result[0].path);
                res.end();
                }).catch((err) => { 
                    /* handle err */ 
                    console.log(err);
                })
        }
    }
}