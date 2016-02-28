var users = require('../models/users');
var tokens = require('../models/tokens');


function *deserializeUserByNameAndPassword(name, password) {
    var user;

    user = yield users.findOne({email: name});
    if (!user) {
        return null;
    }

    if (yield users.verifyPassword(user, password)) {
        return user;
    }

    return null;
}

function *deserializeUserByToken(value) {
    var token;

    token = yield tokens.findByValue(value);
    if (!token) {
        return null;
    }

    return yield users.findById(token.userId);
}

function *deserializeUserByFacebookToken(token) {
    if (!token) {
        return null;
    }

    return yield users.findOne({'auth.facebook': token});
}

function *deserializeUserByTwitterToken(token) {
    if (!token) {
        return null;
    }

    return yield users.findOne({'auth.twitter': token});
}

module.exports = {
    user: {
        deserializeByNameAndPassword: deserializeUserByNameAndPassword,
        deserializeByToken: deserializeUserByToken,
        deserializeByFacebookToken: deserializeUserByFacebookToken,
        deserializeByTwitterToken: deserializeUserByTwitterToken,
    },
};
