'use strict';

const request = require('request-promise-native');

const GC_URL = 'https://connect.garmin.com/modern/proxy/activitylist-service';

const gcRequest = request.defaults({
    baseUrl: GC_URL,
    gzip: true,
    json: true,
});

var exports = module.exports = {};

// //connectapi.garmin.com/activitylist-service/activities?start=0&limit=20&exclude_untitled=false&parentActivityTypeId=123
exports.activities = async(userId, jar, start = 0, limit = 20, excludeUntitled = false) => {
    return gcRequest.get({
        url: '/activities',
        headers: {
            USER_ID: userId,
        },
        jar: jar,
        qs: {
            start: start,
            limit: limit,
            exclude_untitled: excludeUntitled,
            // parentActivityTypeId:
        },
    });
};
