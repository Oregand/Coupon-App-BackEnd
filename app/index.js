var koa = require('koa');
var logger = require('koa-logger');

var config = require('./config');


var app = koa();

app.use(logger());

if (config.env === 'development') {
    app.use(require('kcors')());
}

app.use(require('./routes')(config));

app.listen(config.port);
