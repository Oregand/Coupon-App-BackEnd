var assert = require('assert');
var uuid = require('uuid');

var config = require('../config');
var tokens = require('../lib/db').get('tokens');

// Tokens expire
tokens.index('createdAt', {expireAfterSeconds: config.authTokenExpiry});


function *findTokens(query) {
    query = query || {};
    return yield tokens.find(query);
}

function *findTokenByValue(value) {
    return yield tokens.findOne({value: value});
}

function *createToken(userId, clientId) {
    var token;

    assert(userId, 'tokens.createToken: userId required');

    token = {
        value: uuid.v4(),
        type: 'Bearer',
        userId: userId,
        clientId: clientId,
        createdAt: new Date(),
    };

    yield tokens.insert(token);

    return token;
}

module.exports = {
    find:           findTokens,
    findByValue:    findTokenByValue,
    create:         createToken,
};
