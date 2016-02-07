var Router = require('koa-router');

var oauth = require('../controllers/oauth');
var auth = require('../../../lib/auth');
var authorization = require('../../../lib/middleware/authorization');


module.exports = function (config) {
    var router = new Router();
    var requireBasicAuth;

    requireBasicAuth = authorization.basicAuth({
        deserializeUser: auth.user.deserializeByNameAndPassword,
    });

    router.post('/tokens',
        requireBasicAuth,
        oauth.tokens.create
    );

    return router.routes();
};
