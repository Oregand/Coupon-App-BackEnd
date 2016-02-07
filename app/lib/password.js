var bcrypt = require('co-bcrypt');


function *hashPassword(password) {
    return yield bcrypt.hash(password, 10);
}

function *verifyPassword(password, hash) {
    return yield bcrypt.compare(password, hash);
}

module.exports = {
    hash: hashPassword,
    verify: verifyPassword,
};
