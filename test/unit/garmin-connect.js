'use strict';

const expect = require('chai').expect;

//const fs = require('fs');
const gc = require('../../src/garmin-connect');

describe('Garmin Connect', () => {

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
            expect(response.error).to.equal('');
            expect(response.jar.getCookies('https://garmin.com/')).to.be.an('array');
            expect(response.jar.getCookies('https://garmin.com/')).to.be.an('array');
            expect(response.jar.getCookies('https://garmin.com/')).to.have.lengthOf(4);
        });
    });
});
