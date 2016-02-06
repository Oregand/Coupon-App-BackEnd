var defaults = require('defaults');


var env = process.env.NODE_ENV || 'development';

var defaultConfig = {
    env: env,
    port: process.env.PORT || 3000,
};

module.exports = defaults(require('./' + env), defaultConfig);
