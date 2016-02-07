var basicAuth = require('basic-auth');

var password = require('../password');
var tokens = require('../../models/tokens');
var users = require('../../models/users');


function doBasicAuth(opts) {
    opts = opts || {};

    return function *(next) {
        var authUser = basicAuth(this);
        var user;

        if (!authUser) {
            this.throw(401);
        }

        user = yield users.findOne({name: authUser.name});
        if (!user || !user.auth || !user.auth.hash) {
            this.throw(401);
        }

        if (!(yield password.compare(authUser.pass, user.auth.hash))) {
            this.throw(401);
        }

        this.request.user = user;
        yield next;
    };
}

function doBearerAuth(opts) {
    opts = opts || {};

    return function *(next) {
        var authHeader;
        var token, user;

        authHeader = this.headers['authorization'];
        if (!authHeader) {
            this.throw(401);
        }

        authHeader = authHeader.trim().split(/\s+/);
        if (authHeader[0] !== 'Bearer' || !authHeader[1]) {
            this.throw(401);
        }

        token = yield tokens.findByValue(authHeader[1]);
        if (!token) {
            this.throw(401);
        }

        user = yield users.findById(token.userId);
        if (!user) {
            this.throw(401);
        }

        this.request.user = user;
        yield next;
    };
}

module.exports = {
    basicAuth: doBasicAuth,
    bearerAuth: doBearerAuth,
};
