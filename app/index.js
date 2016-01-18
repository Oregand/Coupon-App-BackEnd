var koa = require('koa');

var config = require('./config');

var app = koa();

app.use(require('./routes')(config));

app.listen(config.port);
