const ipConverter = {
    ipToHex : function (ip) {
        let tokens = ip.split('.');

        if (tokens.length != 4) {
            throw 'Input is not valid ip address';
        }

        let asHex = '0x';

        for (let i = 0; i < 4; i++) {

            if (!Number.isInteger(parseInt(tokens[i])) || parseInt(tokens[i]) < 0 || parseInt(tokens[i]) > 255) {
                throw 'Input is not valid ip address';
            }

            if (parseInt(tokens[i]) < 10) {
                asHex += '0' + tokens[i];
            } else {
                asHex += parseInt(tokens[i]).toString(16);
            }

        }

        return asHex;
    },
    hex2ip : function(hex) {

        if (hex.length != 10) {
            return '';
        }

        let ip = '';

        for (let i = 2; i < 10; i += 2) {
            let digit = hex[i] + hex[i + 1];

            if (i == 8) {
                ip += parseInt(digit, 16);
            } else {
                ip += parseInt(digit, 16) + '.';
            }
        }

        return ip;
    }
};

