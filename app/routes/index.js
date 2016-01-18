var router = require('koa-router')();


module.exports = function (config) {
    router.use('/api/v1', require('../api/v1/routes')(config));

    return router.routes();
};
