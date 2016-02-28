var Router = require('koa-router');

var users = require('../controllers/users');
var auth = require('../../../lib/auth');
var authorization = require('../../../lib/middleware/authorization');


module.exports = function (config) {
    var router = new Router();
    var requireBearerAuth;

    requireBearerAuth = authorization.bearerAuth({
        deserializers: {
            'bearer': auth.user.deserializeByToken,
            'facebook': auth.user.deserializeByFacebookToken,
            'twitter': auth.user.deserializeByTwitterToken,
        }
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

    router.get('/:id/offers',
        requireBearerAuth,
        users.offers.list
    );

    router.post('/:id/vouchers',
        requireBearerAuth,
        users.vouchers.create
    );

    return router.routes();
};
