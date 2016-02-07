var Router = require('koa-router');
var oauth = require('../controllers/oauth');
var auth = require('../../../lib/middleware/auth');

module.exports = function (config) {
    var router = new Router();

    router.post('/token',
        auth.basicAuth(),
        oauth.token
    );

    return router.routes();
};
