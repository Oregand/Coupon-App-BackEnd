var Router = require('koa-router');
var users = require('../controllers/users');


module.exports = function (config) {
    var router = new Router();

    router.get('/',
        users.list
    );

    router.get('/:id',
        users.get
    );

    router.post('/',
        users.create
    );

    router.put('/:id',
        users.update
    );

    router.del('/:id',
        users.remove
    );

    return router.routes();
};
