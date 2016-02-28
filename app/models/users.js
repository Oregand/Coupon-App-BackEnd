var omit = require('lodash.omit');
var defaultsDeep = require('lodash.defaultsdeep');
var cloneDeep = require('lodash.clonedeep');
var emailValidator = require('email-validator');

var errors = require('../lib/errors');
var password = require('../lib/password');
var users = require('../lib/db').get('users');
var phs = require('../lib/phs');


// Ensure 'email' is unique
users.index('email', {unique: true});


function *findUsers(query) {
    query = query || {};
    return (yield users.find(query)).map((user) => {
        return user;
    });
}

function *findOneUser(query) {
    query = query || {};
    return yield users.findOne(query);
}

function *findUserById(id) {
    return yield users.findById(id);
}

function *insertUser(data) {
    if (!data) {
        throw new errors.InternalError('Invalid user data');
    }

    if (!emailValidator.validate(data.email)) {
        throw new errors.ValidationError('email');
    }

    if (data.password) {
        data.auth = data.auth || {};
        data.auth.hash = yield password.hash(data.password);
        data = omit(data, 'password');
    }

    try {
     return yield users.insert(data);
    } catch (err) {
        if (errors.isMongoDuplicateKeyError(err)) {
            throw new errors.DuplicateKeyError('email');
        } else {
            throw err;
        }
    }
}

function *updateUser(id, data) {
    var user = yield users.findById(id);

    if (!user) {
        return null;
    }

    if (!data) {
        throw new errors.InternalError('Invalid user data');
    }

    if (data.email && !emailValidator.validate(data.email)) {
        throw new errors.ValidationError('email');
    }

    // Clone data as we will be mutating it
    data = cloneDeep(data);

    data.auth = data.auth || {};

    // Don't allow mudification of _id
    delete data._id;

    // Don't allow modification of password hash value
    delete data.auth.hash;

    // hash the password if provided
    if (data.password) {
        data.auth.hash = yield password.hash(data.password);
        delete data.password;
    }

    user = defaultsDeep(data, user);

    try {
        yield users.updateById(user._id, user);
    } catch (err) {
        if (errors.isMongoDuplicateKeyError(err)) {
            throw new errors.DuplicateKeyError('email');
        } else {
            throw err;
        }
    }

    return user;
}

function *removeUser(id) {
    return yield users.remove({'_id': id});
}


function *verifyPasswordForUser(user, passwd) {
    if (!user || !user.auth || !user.auth.hash || !passwd) {
        return false;
    }

    return yield password.verify(passwd, user.auth.hash);
}

function getSavingsForOfferArray(offers) {
    var savings = 0;

    if (!offers || !offers.length) {
        return 0;
    }

    savings = offers.reduce((total, offer) => {
        var vchr = offer.vchr;

        if (!vchr || !vchr.spends || !vchr.spends.length) {
            return total;
        }

        return total + (vchr.val * vchr.spends.length);
    }, 0);

    return savings;
}

// TODO: remove once testing is complete
function simulateUsedVouchers(offers) {
    var vchr;
    var now = new Date().toISOString();
    var i;

    if (!offers || !offers.length) {
        return;
    }

    for (i = 0; i < offers.length && i < 2; i++) {
        vchr = offers[i].vchr;
        if (vchr && (!vchr.spends || !vchr.spends.length)) {
            vchr.spends = [{
                procT: now,
                finT: now,
                sId: '1',
                salPntId: '1',
                salPntType: '1',
            }];
        }
    }
}

function *updateOffersForUser(id) {
    var user = yield findUserById(id);
    var offers;

    if (!user) {
        return;
    }

    offers = yield phs.getOffers(id.toString());

    simulateUsedVouchers(offers);

    user.offers = offers;
    user.savings = getSavingsForOfferArray(user.offers);

    yield updateUser(user._id, user);

    return user;
}

module.exports = {
    find:           findUsers,
    findOne:        findOneUser,
    findById:       findUserById,
    insert:         insertUser,
    update:         updateUser,
    remove:         removeUser,
    verifyPassword: verifyPasswordForUser,
    updateOffers:   updateOffersForUser,
};
