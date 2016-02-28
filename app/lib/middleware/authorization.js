var assert = require('assert');
var basicAuth = require('basic-auth');


function cloneWithLowercaseKeys(obj) {
    var keys = Object.keys(obj);
    var clone, i, key;

    clone = {};
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        clone[key.toLowerCase()] = obj[key];
    }

    return clone;
}

function doBasicAuth(opts) {
    var deserializeUser;

    opts = opts || {};

    deserializeUser = opts.deserializeUser;

    assert(deserializeUser, 'basicAuth: deserializeUser required');

    return function *(next) {
        var authUser = basicAuth(this);
        var user;

        if (!authUser) {
            this.throw('Unauthorized', 401);
        }

        user = yield deserializeUser(authUser.name, authUser.pass);
        if (!user) {
            this.throw('Unauthorized', 401);
        }

        this.request.user = user;
        yield next;
    };
}

function doBearerAuth(opts) {
    var deserializers;

    opts = opts || {};

    deserializers = cloneWithLowercaseKeys(opts.deserializers);

    assert(deserializers, 'bearerAuth: deserializers required');

    return function *(next) {
        var authHeader, authType, token;
        var user;

        authHeader = this.headers['authorization'];
        if (!authHeader) {
            this.throw('Unauthorized', 401);
        }

        authHeader = authHeader.trim().split(/\s+/);
        authType = authHeader[0].toLowerCase();
        token = authHeader[1];

        if (!authHeader[1]) {
            this.throw('Unauthorized', 401);
        }

        if (!deserializers[authType]) {
            this.throw('Unauthorized', 401);
        }

        user = yield deserializers[authType](token);
        if (!user) {
            this.throw('Unauthorized', 401);
        }

        this.request.user = user;
        yield next;
    };
}

module.exports = {
    basicAuth: doBasicAuth,
    bearerAuth: doBearerAuth,

};
