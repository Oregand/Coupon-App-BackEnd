var assert = require('assert');
var basicAuth = require('basic-auth');


function doBasicAuth(opts) {
    var deserializeUser;

    opts = opts || {};

    deserializeUser = opts.deserializeUser;

    assert(deserializeUser, 'basicAuth: deserializeUser required');

    return function *(next) {
        var authUser = basicAuth(this);
        var user;

        if (!authUser) {
            this.throw(401);
        }

        user = yield deserializeUser(authUser.name, authUser.pass);
        if (!user) {
            this.throw(401);
        }

        this.request.user = user;
        yield next;
    };
}

function doBearerAuth(opts) {
    var deserializeUser;

    opts = opts || {};

    deserializeUser = opts.deserializeUser;

    assert(deserializeUser, 'bearerAuth: deserializeUser required');

    return function *(next) {
        var authHeader;
        var user;

        authHeader = this.headers['authorization'];
        if (!authHeader) {
            this.throw(401);
        }

        authHeader = authHeader.trim().split(/\s+/);
        if (authHeader[0] !== 'Bearer' || !authHeader[1]) {
            this.throw(401);
        }

        user = yield deserializeUser(authHeader[1]);
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
