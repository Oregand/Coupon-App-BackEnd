var bcrypt = require('co-bcrypt');

module.exports = {
    hash: bcrypt.hash,
    compare: bcrypt.compare,
};
