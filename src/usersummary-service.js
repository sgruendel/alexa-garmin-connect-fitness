'use strict';

const request = require('request-promise-native');

const GC_URL = 'https://connect.garmin.com/modern/proxy/usersummary-service';

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
exports.hydrationAllData = async(userId, date, jar) => {
    return gcRequest.get({
        url: '/usersummary/hydration/allData/' + date,
        headers: {
            USER_ID: userId,
        },
        jar: jar,
    });
};

// date is yyyy-mm-dd
exports.hydrationLog = async(userId, date, valueInML, jar) => {
    // calendarDate should be "2020-03-03T23:59:59.00" for date in the past
    const now = new Date().toISOString();
    let timestampLocal;
    if (now.startsWith(date)) {
        timestampLocal = now;
    } else {
        timestampLocal = date + 'T23:59:59.00';
    }

    return gcRequest.put({
        url: '/usersummary/hydration/log',
        headers: {
            USER_ID: userId,
        },
        jar: jar,
        body: {
            calendarDate: date,
            timestampLocal: timestampLocal,
            valueInML: valueInML,
        },
    });
};
