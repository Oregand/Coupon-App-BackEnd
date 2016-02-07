var koa = require('koa');
var logger = require('koa-logger');

var config = require('./config');

var app = koa();

app.use(logger());
app.use(require('./routes')(config));

app.listen(config.port);
