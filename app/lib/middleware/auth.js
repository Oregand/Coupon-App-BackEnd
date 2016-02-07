var basicAuth = require('basic-auth');

var password = require('../password');
var users = require('../../models/users');


function makeBasicAuth(opts) {
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

module.exports = {
    basicAuth: makeBasicAuth,
};
