'use strict';

const cheerio = require('cheerio');
const request = require('request-promise-native');

const SSO_URL = 'https://sso.garmin.com/sso/signin';
const GC_URL = 'https://connect.garmin.com/modern';

const ssoRequest = request.defaults({
    url: SSO_URL,
    resolveWithFullResponse: true,
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

const gcRequest = request.defaults({
    baseUrl: GC_URL,
    gzip: true,
    json: true,
});

var exports = module.exports = {};

exports.login = async(username, password, locale) => {
    console.log('logging in using locale "' + locale + '"');
    const gcLocale = locale.replace('-', '_');
    const jar = request.jar();
    let response = await ssoRequest.get({
        jar: jar,
        qs: {
            locale: gcLocale,
        },
    });
    console.log('login status ' + response.statusCode);
    let $ = cheerio.load(response.body);
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
    console.log(response.statusCode);
    $ = cheerio.load(response.body);
    const statusError = $('div#status.error').text();
    console.log('error: ', statusError);

    console.log('headers', response.headers['set-cookie']);
    console.log('jar', jar);
    console.log('garmin.com', typeof jar.getCookies('https://garmin.com/'));

    return {
        error: statusError,
        jar: jar,
    };
};
