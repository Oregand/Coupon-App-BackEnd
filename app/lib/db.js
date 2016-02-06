var monk = require('monk');
var wrap = require('co-monk');

var config = require('../config');

var db = monk(config.mongo.uri);

// wrap the db.get method to support generators
var _get = db.get.bind(db);

db.get = function (collection) {
    return wrap(_get(collection));
};

module.exports = db;
