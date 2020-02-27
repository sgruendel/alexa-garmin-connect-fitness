'use strict';

const cheerio = require('cheerio');
const request = require('request-promise-native');

const SSO_URL = 'https://sso.garmin.com/sso/signin';

const ssoRequest = request.defaults({
    url: SSO_URL,
    qs: {
        service: 'https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F',
        webhost: 'https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F',
        source: 'https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F',
        redirectAfterAccountLoginUrl: 'https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F',
        redirectAfterAccountCreationUrl: 'https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F',
        gauthHost: 'https%3A%2F%2Fsso.garmin.com%2Fsso',
        id: 'gauth-widget',
        cssUrl: 'https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css',
        privacyStatementUrl: 'https%3A%2F%2Fwww.garmin.com%2Fde-DE%2Fprivacy%2Fconnect%2F',
        clientId: 'Alexa',
        rememberMeShown: true,
        rememberMeChecked: false,
        createAccountShown: true,
        openCreateAccount: false,
        displayNameShown: false,
        consumeServiceTicket: false,
        initialFocus: true,
        embedWidget: false,
        generateExtraServiceTicket: true,
        generateTwoExtraServiceTickets: false,
        generateNoServiceTicket: false,
        globalOptInShown: true,
        globalOptInChecked: false,
        mobile: false,
        connectLegalTerms: true,
        showTermsOfUse: false,
        showPrivacyPolicy: false,
        showConnectLegalAge: false,
        locationPromptShown: true,
        showPassword: true,
        useCustomHeader: false,
    },
    gzip: true,
});

var exports = module.exports = {};

exports.wellnessService = require('./wellness-service');

exports.login = async(username, password, locale) => {
    const gcLocale = locale.replace('-', '_');
    const jar = request.jar();
    let response = await ssoRequest.get({
        jar: jar,
        qs: {
            locale: gcLocale,
        },
    });
    let $ = cheerio.load(response);
    const csrf = $('input[name=_csrf]').attr('value');

    response = await ssoRequest.post({
        headers: {
            // Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': locale,
            // 'Cache-Control': 'max-age=0',
            // Connection: 'keep-alive',
            // Host: 'sso.garmin.com',
            Origin: 'https://sso.garmin.com',
            // Referer: 'https://sso.garmin.com/sso/signin?service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&webhost=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&source=https%3A%2F%2Fconnect.garmin.com%2Fsignin%2F&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=en_US&id=gauth-widget&cssUrl=https%3A%2F%2Fconnect.garmin.com%2Fgauth-custom-v1.2-min.css&privacyStatementUrl=https%3A%2F%2Fwww.garmin.com%2Fen-US%2Fprivacy%2Fconnect%2F&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=true&generateTwoExtraServiceTickets=false&generateNoServiceTicket=false&globalOptInShown=true&globalOptInChecked=false&mobile=false&connectLegalTerms=true&showTermsOfUse=false&showPrivacyPolicy=false&showConnectLegalAge=false&locationPromptShown=true&showPassword=true&useCustomHeader=false',
            'Sec-Fetch-Dest': 'iframe',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            // 'Upgrade-Insecure-Requests': '1',
            // 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Mobile Safari/537.36',
        },
        jar: jar,
        qs: {
            locale: gcLocale,
        },
        formData: {
            username: username,
            password: password,
            embed: 'false',
            _csrf: csrf,
        },
    });
    $ = cheerio.load(response);
    const statusError = $('div#status.error').text();
    let responseUrl = response.match(/response_url\s*=\s*[\'"]*(.*)[\'"]/);

    let userPreferences;
    let socialProfile;
    if (!statusError) {
        if (!responseUrl || !responseUrl[1]) {
            throw new Error('response_url not found');
        }

        responseUrl = responseUrl[1].replace(/\\/g, '');
        response = await request.get({
            url: responseUrl,
            jar: jar,
        });

        userPreferences = response.match(/VIEWER_USERPREFERENCES\s*=\s*(.*)/);
        socialProfile = response.match(/VIEWER_SOCIAL_PROFILE\s*=\s*(.*)/);
        // window.VIEWER_DASHBOARDS
        if (!userPreferences || !userPreferences[1]) {
            throw new Error('VIEWER_USERPREFERENCES not found');
        }
        if (!socialProfile || !socialProfile[1]) {
            throw new Error('VIEWER_SOCIAL_PROFILE not found');
        }

        /* eslint-disable no-eval */
        userPreferences = eval(userPreferences[1]);
        socialProfile = eval(socialProfile[1]);
        /* eslint no-eval: "error" */
    }

    return {
        error: statusError,
        jar: jar,
        userPreferences: userPreferences,
        socialProfile: socialProfile,
    };
};
