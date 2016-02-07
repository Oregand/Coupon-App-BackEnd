var router = require('koa-router')();

var errors = require('../../../lib/middleware/errors');
var json = require('../../../lib/middleware/json');


module.exports = function (config) {
    router.use(errors(config));
    router.use(json.request());
    router.use(json.response());

    router.use('/oauth', require('./oauth')(config));
    router.use('/users', require('./users')(config));

    return router.routes();
};
