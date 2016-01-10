var koa = require('koa');
var config = require('./config');

var app = koa();

app.use(function *(next) {
    this.body = 'PromoPay';
    yield next;
});

console.log('Starting server on port: ' + config.port);
app.listen(config.port);
