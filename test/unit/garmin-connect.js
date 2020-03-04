'use strict';

const expect = require('chai').expect;

const gc = require('../../src/garmin-connect');

describe('Garmin Connect', () => {

    let jar, userId;

    describe('#login()', () => {
        it('should fail with wrong credentials', async function() {
            const response = await gc.login('alexa_fail', 'xxx', 'de-DE');
            expect(response.error).to.equal('Ungültige Anmeldung. (Bei Kennwörtern ist die Groß- und Kleinschreibung zu beachten.)');
        });

        it('should work with correct credentials', async function() {
            const response = await gc.login('alexa_german@web.de', 'AlexaGerman42', 'de-DE');
            expect(response.error, 'no error').to.equal('');
            expect(response.jar.getCookies('https://garmin.com/'), 'cookies set').to.be.an('array');
            expect(response.userPreferences.displayName, 'userPreferences read').to.be.a('string');
            expect(response.socialProfile.displayName, 'socialProfile has displayName').to.be.a('string');
            expect(response.socialProfile.id, 'socialProfile has userId').to.be.a('number');
            jar = response.jar;
            userId = response.socialProfile.id;
        });
    });

    describe('#dailySummary()', () => {
        it('should work for date', async function() {
            const response = await gc.wellnessService.dailySummary(userId, { date: '2020-03-04' }, jar);
            expect(response.id, 'id').to.equal('5ce44e911a854ee88b31de583e3d77f5');
            expect(response.startTimestampLocal, 'startTimestampLocal').to.equal('2020-03-04T00:00:00.0');
            expect(response.endTimestampLocal, 'endTimestampLocal').to.equal('2020-03-04T14:06:00.0');
            expect(response.steps, 'steps').to.equal(591);
        });

        it('should work for id', async function() {
            const response = await gc.wellnessService.dailySummary(userId, { uuid: '5ce44e911a854ee88b31de583e3d77f5' }, jar);
            expect(response.id, 'id').to.equal('5ce44e911a854ee88b31de583e3d77f5');
            expect(response.startTimestampLocal, 'startTimestampLocal').to.equal('2020-03-04T00:00:00.0');
            expect(response.endTimestampLocal, 'endTimestampLocal').to.equal('2020-03-04T14:06:00.0');
            expect(response.steps, 'steps').to.equal(591);
        });
    });

    describe('#activities()', () => {
        it('should work', async function() {
            const response = await gc.activitylistService.activities('378206723', jar, 0, 1);
            expect(response.activityList).to.be.an('array');
            expect(response.activityList).have.length(1);
            expect(response.activityList[0].activityName, 'activityName').to.equal('Würzburg Laufen');
            expect(response.activityList[0].activityType.typeKey, 'activityType').equal('running');
            expect(response.activityList[0].eventType.typeKey, 'eventType').equal('training');
        });
    });
});
