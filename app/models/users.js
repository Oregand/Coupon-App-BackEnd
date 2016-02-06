var users = require('../lib/db').get('users');


function *findUsers() {
    return yield users.find({});
}

function *findUserById(id) {
    return yield users.findById(id);
}

function *insertUser(data) {
    // TODO: validation
    return yield users.insert(data);
}

function *updateUser(id, data) {
    // TODO: validation
    return users.updateById(id, data);
}

function *removeUser(id) {
    return yield users.remove({'_id': id});
}


module.exports = {
    find:       findUsers,
    findById:   findUserById,
    insert:     insertUser,
    update:     updateUser,
    remove:     removeUser,
};
