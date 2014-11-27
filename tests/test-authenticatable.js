/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , Authenticatable = require('../lib/mixins/authenticatable')
  , mock = nock('https://test:9100', {
    reqheaders: {
      'content-type': 'application/json'
    }
  })
  ;

var Opts = {
  host: {
    value: 'test'
  },
  auth: {
    value: {}
  }
};

describe('Authenticatable', function () {

  var api = endpoint('/tokens', Opts, Authenticatable);

  describe('#create()', function () {

    it('should return a promise of a single entity', function () {
      var username = 'stanley'
        , password = 'rocks'
        , response = {}
        ;

      // TODO: Find how to check the auth information. It doesn't get exposed to reqHeaders for
      // some reason
      mock.post('/tokens')
        .reply(201, response);

      var result = api.authenticate(username, password);

      return all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no username is provided', function () {
      var fn = function () {
        api.authenticate();
      };

      expect(fn).to.throw('is not a valid username');
    });

    it('should throw an error if no password is provided', function () {
      var fn = function () {
        api.authenticate('stanley');
      };

      expect(fn).to.throw('is not a valid password');
    });

    it('should update token based on response', function () {
      var response = {
        token: 'some'
      };

      mock.post('/tokens')
        .reply(201, response);

      var result = api.authenticate('stanley', 'rocks');

      return result.then(function () {
        expect(api).to.have.property('token');
        expect(api.token).to.be.deep.equal(response);
      });
    });

    it('should reject the promise if server returns other than 201 status code', function () {
      mock.post('/tokens')
        .reply(400, 'some');

      var result = api.authenticate('stanley', 'rocks');

      return all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 400);
          expect(err).to.have.property('message', 'some');
        })
      ]);
    });

  });

});
