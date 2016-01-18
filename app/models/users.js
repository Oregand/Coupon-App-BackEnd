/****
 * Place holder model
 */
var users = [{
    id: '1',
    username: 'joe',
}];

var lastId = 1;

function *findUsers() {
    return users;
}

function *findUserById(id) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return users[i];
        }
    }
}

function *insertUser(data) {
    var user = {
        id: (++lastId).toString(),
        username: data.username,
    };

    users.push(user);

    return user;
}

function *updateUser(id, data) {
    var user = yield findUserById(id);

    if (!user) {
        return null;
    }

    user.username = data.username;
    return user;
}

function *removeUser(id) {
    var i;

    for (i = 0; i < users.length; ++i) {
        if (users[i].id === id) {
            users.splice(i, 1);
            return true;
        }
    }

    return false;
}


module.exports = {
    find:       findUsers,
    findById:   findUserById,
    insert:     insertUser,
    update:     updateUser,
    remove:     removeUser,
};
