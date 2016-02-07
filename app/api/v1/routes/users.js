var Router = require('koa-router');
var users = require('../controllers/users');
var auth = require('../../../lib/middleware/auth');


module.exports = function (config) {
    var router = new Router();

    router.get('/',
        auth.bearerAuth(),
        users.list
    );

    router.get('/:id',
        auth.bearerAuth(),
        users.get
    );

    router.post('/',
        auth.bearerAuth(),
        users.create
    );

    router.put('/:id',
        auth.bearerAuth(),
        users.update
    );

    router.del('/:id',
        auth.bearerAuth(),
        users.remove
    );

    return router.routes();
};
