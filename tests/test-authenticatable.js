/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , Opts = require('./opts')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var expect = chai.expect
  , Authenticatable = require('../lib/mixins/authenticatable')
  , mock = nock('http://localhost:9100', {
    reqheaders: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
  ;

describe('Authenticatable', function () {

  var api = endpoint('/tokens', Opts, Authenticatable).value;

  describe('#create()', function () {

    it('should return a promise of a single entity', function () {
      var username = 'stanley'
        , password = 'rocks'
        , response = {}
        ;

      mock.post('/tokens')
        .matchHeader('authorization', 'Basic c3RhbmxleTpyb2Nrcw==')
        .reply(201, response);

      var result = api.authenticate(username, password);

      return Promise.all([
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

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 400);
          expect(err).to.have.property('message', 'some');
        })
      ]);
    });

    it('should connect to custom url if auth object provided', function () {
      var api = endpoint('/tokens', Opts, {
        protocol: {
          value: 'https'
        },
        auth: {
          value: {
            protocol: 'http',
            host: 'custom',
            port: '999'
          }
        }
      }, Authenticatable).value;

      nock('http://custom:999').post('/tokens')
        .reply(201);

      var result = api.authenticate('stanley', 'rocks');

      return expect(result).to.be.fulfilled;
    });

    it('should use API protocol when it is not specifically defined for auth', function () {
      var api = endpoint('/tokens', Opts, {
        protocol: {
          value: 'https'
        }
      }, Authenticatable).value;

      nock('https://localhost:9100').post('/tokens')
        .reply(201);

      var result = api.authenticate('stanley', 'rocks');

      return expect(result).to.be.fulfilled;
    });

  });

});
