var omit = require('omit');

var password = require('../lib/password');
var users = require('../lib/db').get('users');
var phs = require('../lib/phs');


// Ensure 'name' unique
users.index('userName', {unique: true});


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
        data.auth.hash = yield password.hash(data.password);
        data = omit('password', data);
    }

    return yield users.insert(data);
}

function *updateUser(id, data) {
    // TODO: validation

    if (data.password) {
        data.auth = data.auth || {};
        data.auth.hash = yield password.hash(data.password);
        data = omit('password', data);
    }

    return users.updateById(id, data);
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

function *updateOffersForUser(id) {
    var user = yield findUserById(id);
    var offers;

    if (!user) {
        return;
    }

    offers = yield phs.getOffers(id.toString());

    user.offers = combineOfferArrays(user.offers, offers);
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
