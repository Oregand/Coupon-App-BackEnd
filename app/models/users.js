var pick = require('lodash.pick');
var omit = require('lodash.omit');
var defaults = require('lodash.defaults');
var emailValidator = require('email-validator');

var errors = require('../lib/errors');
var password = require('../lib/password');
var users = require('../lib/db').get('users');
var phs = require('../lib/phs');


// Ensure 'email' is unique
users.index('email', {unique: true});


var validUserProps = [
    '_id',
    'name',
    'userName',
    'email',
    'phone',
    'age',
    'picture',
    'auth',
];

function cleanUserData(data) {
    return pick(data, validUserProps);
}

function *findUsers(query) {
    query = query || {};
    return (yield users.find(query)).map((user) => {
        return omit(user, 'auth');
    });
}

function *findOneUser(query) {
    query = query || {};
    return omit(yield users.findOne(query), 'auth');
}

function *findUserById(id) {
    return omit(yield users.findById(id), 'auth');
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

//    data = cleanUserData(data);

    try {
     return omit(yield users.insert(data), 'auth');
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

    if (data.password) {
        user.auth = user.auth || {};
        user.auth.hash = yield password.hash(data.password);
        data = omit(data, 'password');
    }

//    data = cleanUserData(data);

    user.auth = defaults(user.auth, data.auth);
    user = defaults(user, data);

    try {
        yield users.updateById(user._id, user);
    } catch (err) {
        if (errors.isMongoDuplicateKeyError(err)) {
            throw new errors.DuplicateKeyError('email');
        } else {
            throw err;
        }
    }

    return omit(user, 'auth');
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

function combineOfferArrays(existingOffers, newOffers) {
    var combinedOffers = [];
    var existingIds = [];

    if (Array.isArray(existingOffers)) {
        existingOffers.forEach(offer => {
            combinedOffers.push(offer);
            existingIds.push(offer.id);
        });
    }

    if (Array.isArray(newOffers)) {
        newOffers.forEach(offer => {
            if (existingIds.indexOf(offer.id) === -1) {
                combinedOffers.push(offer);
            }
        });
    }

    return combinedOffers;
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

    user.offers = offers;//combineOfferArrays(offers, user.offers);
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
