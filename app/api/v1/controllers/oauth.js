var tokens = require('../../../models/tokens');


function *createToken() {
    var grant = this.request.body['grant_type'];
    var clientId = this.request.body['client_id'];
    var user = this.request.user;
    var token;

    if (grant !== 'client_credentials') {
        this.throw('Unsupported grant type', 400);
    }

    if (!clientId) {
        this.throw('client_id is required', 400);
    }

    if (!user) {
        this.throw('Unauthorized', 401);
    }

    token = yield tokens.create(user._id, clientId);

    this.body = {
        data: {
            'access_token': token.value,
            'token_type': token.type,
        },
    };
}

module.exports = {
    tokens: {
        create: createToken,
    },
};
