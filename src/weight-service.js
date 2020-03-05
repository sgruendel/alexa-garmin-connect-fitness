'use strict';

const request = require('request-promise-native');

const GC_URL = 'https://connect.garmin.com/modern/proxy/weight-service';

const gcRequest = request.defaults({
    baseUrl: GC_URL,
    headers: {
        NK: 'NT', // seems to be needed
    },
    gzip: true,
    json: true,
});

var exports = module.exports = {};

// date is yyyy-mm-dd
exports.weightLatest = async(userId, date, jar) => {
    const qs = {
        date: date,
    };
    return gcRequest.get({
        url: '/weight/latest',
        headers: {
            USER_ID: userId,
        },
        jar: jar,
        qs: qs,
    });
};

// date is yyyy-mm-dd
exports.userWeight = async(userId, date, value, jar) => {
    return gcRequest.post({
        url: '/user-weight',
        headers: {
            USER_ID: userId,
        },
        jar: jar,
        body: {
            value: value,
            unitKey: 'kg',
            date: date,
            // dateTimestamp: '2020-03-05T09:07:00.00',
            // gmtTimestamp: '2020-03-05T08:07:00.00',
        },
    });
};
