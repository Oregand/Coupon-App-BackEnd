var request = require('co-request');
var defaults = require('defaults');

var config = require('../config');


var getOffersBody = {
    msgId: '987987654654654625465',
    cId: 'DAG',
    sId: '1234',
    salPntId: '56b6aa4b184fd4fc16e0161a',
    salPntType: '3',
    iTx: '1',
    authProv: 'phs',
    body: {
        sOfferLbl: 'DAG'
    }
};

var getVoucherBody = {
    msgId: '987987654654654625465',
    cId: 'DAG',
    sId: '1234',
    salPntId: '56b6aa4b184fd4fc16e0161a',
    salPntType: '3',
    iTx: '1',
};

function *doApiRequest(opts) {
    var response;

    opts = opts || {};

    response = yield request({
        method: opts.method || 'GET',
        url: config.phs.baseUrl + opts.path,
        json: opts.body,
    });

    if (response.statusCode !== 200) {
        return null;
    }

    return response.body;
}

function *getOffers(userId) {
    var result;

    result = yield doApiRequest({
        path: '/offerImpressions/getEligible',
        method: 'POST',
        body: defaults({userId: userId}, getOffersBody),
    });

    if (!result || !result.body || !result.body.oImps) {
        return [];
    }

    return result.body.oImps;
}

function *createVoucher(offerId) {
    var result;

    result = yield doApiRequest({
        path: '/vouchers/getOrCreateForOfferImpression',
        method: 'POST',
        body: defaults({body: {oImpId: offerId}}, getVoucherBody),
    });

    if (!result || !result.body || !result.body.vchr) {
        return null;
    }

    return result.body.vchr;
}

module.exports = {
    getOffers: getOffers,
    createVoucher: createVoucher,
};
