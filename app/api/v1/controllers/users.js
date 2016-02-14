var users = require('../../../models/users');
var phs = require('../../../lib/phs');


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

function *listOffers() {
    var id = this.params.id;
    var user;

    user = yield users.findById(id);
    if (!user) {
        this.throw('Not Found', 404);
    }

    user = yield users.updateOffers(user._id);

    this.body = {
        data: user.offers,
    };
}

function *createVoucher() {
    var userId = this.params.id;
    var offerId = this.request.body.offerId;
    var user, voucher;

    if (!offerId) {
        this.thow('Bad Request', 400);
    }

    user = yield users.findById(userId);
    if (!user) {
        this.throw('Not Found', 404);
    }

    voucher = yield phs.createVoucher(offerId);

    this.body = {
        data: voucher,
    };
}

module.exports = {
    list:   listUsers,
    get:    getUser,
    create: createUser,
    update: updateUser,
    remove: removeUser,
    offers: {
        list: listOffers,
    },
    vouchers: {
        create: createVoucher,
    }
};
