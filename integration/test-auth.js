/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , config = require('./config.js')
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
  , st2client = require('../index')(config)
  ;

var prescribe = config.credentials ? describe : describe.skip;

prescribe('Auth', function () {
  describe('#authenticate()', function () {

    // Apache takes a lot of time to spin up so the test may fail by timeout. Increase timeout or
    // run it multiple times.
    it('should return a promise of a token', function () {
      var result = st2client.authenticate(config.credentials.user, config.credentials.password);

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object'),
        result.then(function (token) {
          expect(token).to.have.property('id');
          expect(token).to.have.property('user', config.credentials.user);
          expect(token).to.have.property('token');
          expect(token).to.have.property('expiry');
        })
      ]);
    });

    it('should reject the promise in case of wrong password', function () {
      var result = st2client.auth.authenticate(config.credentials.user, 'wrongpassword');

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('message');
        })
      ]);

    });

    it('should reject the promise in case of wrong user name', function () {
      var username = 'wronguser' + Math.floor(Math.random() * 10000);
      var result = st2client.auth.authenticate(username, 'wrongpassword');

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 401);
          expect(err).to.have.property('message');
        })
      ]);

    });

  });

  after(function () {
    st2client.close();
  });
});
