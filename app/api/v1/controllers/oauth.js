var users = require('../../../models/users');


function *createToken() {
    var grant = this.request.body['grant_type'];
    var clientId = this.request.body['client_id'];
    var user = this.request.user;
    var token;

    if (grant !== 'client_credentials') {
        this.throw(400, 'Unsupported grant type');
    }

    if (!clientId) {
        this.throw(400, 'client_id is required');
    }

    if (!user) {
        this.throw(403);
    }

    token = yield users.createToken(user._id, clientId);

    this.body = {
        data: {
            'access_token': token.value,
            'token_type': token.type,
        },
    };
}

module.exports = {
    token: createToken,
};
