var users = require('../../../models/users');

function *listUsers() {
    var data = yield users.find();
    this.body = {
        data: data,
    };
}

function *getUser() {
    var id = this.params.id;
    var data;

    data = yield users.findById(id);

    if (!data) {
        this.throw('Not Found', 404);
    }

    this.body = {
        data: data,
    };
}

function *createUser() {
    var body = this.request.body;

    this.body = {
        data: yield users.insert(body),
    };
}

function *updateUser() {
    var id = this.params.id;
    var body = this.request.body;
    var data;

    data = yield users.update(id, body);

    if (!data) {
        this.throw('Not Found', 404);
    }

    this.body = {
        data: data,
    };
}

function *removeUser() {
    var id = this.params.id;
    var result;

    result = yield users.remove(id);

    if (!result) {
        this.throw('Not Found', 404);
    }

    this.body = '';
}

module.exports = {
    list:   listUsers,
    get:    getUser,
    create: createUser,
    update: updateUser,
    remove: removeUser,
};
