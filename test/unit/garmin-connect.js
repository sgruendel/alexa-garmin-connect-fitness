'use strict';

const expect = require('chai').expect;

const gc = require('../../src/garmin-connect');

describe('Garmin Connect', () => {

    let jar;

    describe('#login()', () => {
        xit('should fail with wrong locale', async function() {
            const response = await gc.login('alexa', 'xxx', '');
            expect(response).to.throw();
        });

        // don't execute normally , otherwise account gets deactivated
        it('should fail with wrong credentials', async function() {
            const response = await gc.login('alexa', 'xxx', 'de-DE');
            expect(response.error).to.equal('Ungültige Anmeldung. (Bei Kennwörtern ist die Groß- und Kleinschreibung zu beachten.)');
        });

        it('should work with correct credentials', async function() {
            const response = await gc.login('stefan.gruendel', '83oJ1GBIpr*w', 'de-DE');
            expect(response.error, 'no error').to.equal('');
            expect(response.jar.getCookies('https://garmin.com/'), 'cookies set').to.be.an('array');
            expect(response.userPreferences.displayName, 'userPreferences read').to.be.a('string');
            expect(response.socialProfile.displayName, 'socialProfile has displayName').to.be.a('string');
            expect(response.socialProfile.id, 'socialProfile has userId').to.be.a('number');
            jar = response.jar;
        });
    });

    describe('#dailySummary()', () => {
        it('should work for date', async function() {
            const response = await gc.wellnessService.dailySummary('7858235', {date: '2020-02-27'}, jar);
            console.log(response);
            expect(response.steps).to.be.a('number');
        });

        it('should work for id', async function() {
            const response = await gc.wellnessService.dailySummary('7858235', {uuid: '31329d01b0be48ee8f6d6cd1cee1a7dd'}, jar);
            console.log(response);
            expect(response.steps).to.be.a('number');
        });
    });

    describe('#activities()', () => {
        it('should work', async function() {
            const response = await gc.activitylistService.activities('7858235', jar, 0, 1);
            console.log(response);
            expect(response.activityList).to.be.an('array');
            expect(response.activityList[0].activityName).to.be.a('string');
        });
    });
});
