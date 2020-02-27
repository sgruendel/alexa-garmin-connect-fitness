'use strict';

const request = require('request-promise-native');

const GC_URL = 'https://connect.garmin.com/modern/proxy/wellness-service';

const gcRequest = request.defaults({
    baseUrl: GC_URL,
    gzip: true,
    json: true,
});

var exports = module.exports = {};

// For a specific date, pass params.date
// for a specific id, pass params.uuid
exports.dailySummary = async(userId, params, jar) => {
    let url = '/wellness/dailySummary';
    let qs = {};
    if (params.date) {
        qs.date = params.date;
    } else if (params.uuid) {
        url += '/' + params.uuid;
    }

    return gcRequest.get({
        url: url,
        headers: {
            USER_ID: userId,
        },
        jar: jar,
        qs: qs,
    });
};
