var omit = require('omit');

var password = require('../lib/password');
var users = require('../lib/db').get('users');

// Ensure 'name' unique
users.index('name', {unique: true});


function *findUsers(query) {
    query = query || {};
    return yield users.find(query);
}

function *findOneUser(query) {
    query = query || {};
    return yield users.findOne(query);
}

function *findUserById(id) {
    return yield users.findById(id);
}

function *insertUser(data) {
    // TODO: validation

    if (data.password) {
        data.auth = data.auth || {};
        data.auth.hash = yield password.hash(data.password, 10);
        data = omit('password', data);
    }

    return yield users.insert(data);
}

function *updateUser(id, data) {
    // TODO: validation

    if (data.password) {
        data.auth = data.auth || {};
        data.auth.hash = yield password.hash(data.password, 10);
        data = omit('password', data);
    }

    return users.updateById(id, data);
}

function *removeUser(id) {
    return yield users.remove({'_id': id});
}

module.exports = {
    find:           findUsers,
    findOne:        findOneUser,
    findById:       findUserById,
    insert:         insertUser,
    update:         updateUser,
    remove:         removeUser,
};
