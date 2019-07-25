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
  , Schedulable = require('../lib/mixins/schedulable')
  , mock = nock('http://localhost', {
    reqheaders: {
      'content-type': 'application/json;charset=utf-8'
    }
  })
  ;

describe('Schedulable', function () {

  var api = endpoint('/test', Opts, Schedulable).value;

  describe('#schedule()', function () {

    it('should return a promise of a single entity', function () {
      var request = {}
        , response = {}
        ;

      mock.post('/v1/test', request)
        .reply(202, response);

      var result = api.schedule({}, 'test');

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should send an auth token', function () {
      var request = {}
        , response = {}
        ;

      mock.post('/v1/test', request)
        .matchHeader('x-auth-token', 'token-aaaa')
        .reply(202, response);

      var result = api.schedule({}, 'test', {token: 'token-aaaa'});

      return result.then(function (response) {
        expect(mock.isDone()).to.be.true;
      });
    });

    it('should send an API key', function () {
      var request = {}
        , response = {}
        ;

      mock.post('/v1/test', request)
        .matchHeader('st2-api-key', 'key-cccc')
        .reply(202, response);

      var result = api.schedule({}, 'test', {api_key: 'key-cccc'});

      return result.then(function (response) {
        expect(mock.isDone()).to.be.true;
      });
    });

    it('should reject the promise if server returns other than 202 status code', function () {
      var request = {}
        , response = 'accepted instead of scheduled'
        ;

      mock.post('/v1/test', request)
        .reply(201, response);

      var result = api.schedule({}, 'test');

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 201);
          expect(err).to.have.property('message', response);
        })
      ]);
    });

  });

});
