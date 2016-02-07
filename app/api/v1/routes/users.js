var Router = require('koa-router');

var users = require('../controllers/users');
var auth = require('../../../lib/auth');
var authorization = require('../../../lib/middleware/authorization');


module.exports = function (config) {
    var router = new Router();
    var requireBearerAuth;

    requireBearerAuth = authorization.bearerAuth({
        deserializeUser: auth.user.deserializeByToken,
    });

    router.get('/',
        requireBearerAuth,
        users.list
    );

    router.get('/:id',
        requireBearerAuth,
        users.get
    );

    router.post('/',
        requireBearerAuth,
        users.create
    );

    router.put('/:id',
        requireBearerAuth,
        users.update
    );

    router.del('/:id',
        requireBearerAuth,
        users.remove
    );

    return router.routes();
};
