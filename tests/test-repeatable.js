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
  , Writable = require('../lib/mixins/repeatable')
  , mock = nock('http://localhost', {
    reqheaders: {
      'content-type': 'application/json;charset=utf-8'
    }
  })
  ;

describe('Repeatable', function () {

  var api = endpoint('/test', Opts, Writable).value;

  describe('#repeat()', function () {

    it('should return a promise of a single entity', function () {
      var id = 'DEADBEEF'
        , request = {}
        , response = {}
        ;

      mock.post('/v1/test/' + id + '/re_run', request)
        .reply(201, response);

      var result = api.repeat(id, request);

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should send an auth token', function () {
      var id = 'DEADBEEF'
        , request = {}
        , response = {}
        ;

      mock.post('/v1/test/' + id + '/re_run', request)
        .matchHeader('x-auth-token', 'token-aaaa')
        .reply(201, response);

      var result = api.repeat(id, request, 'test', {token: 'token-aaaa'});

      return result.then(function (response) {
        expect(mock.isDone()).to.be.true;
      });
    });

    it('should send an API key', function () {
      var id = 'DEADBEEF'
        , request = {}
        , response = {}
        ;

      mock.post('/v1/test/' + id + '/re_run', request)
        .matchHeader('st2-api-key', 'key-cccc')
        .reply(201, response);

      var result = api.repeat(id, request, 'test', {api_key: 'key-cccc'});

      return result.then(function (response) {
        expect(mock.isDone()).to.be.true;
      });
    });

    it('should throw an error if no id is provided', function () {
      var fn = function () {
        api.repeat();
      };

      expect(fn).to.throw('is not a valid id');
    });

    it('should throw an error if no payload is provided', function () {
      var fn = function () {
        api.repeat('DEADBEEF');
      };

      expect(fn).to.throw('is not a valid payload');
    });

    it('should reject the promise if server returns other than 201 status code', function () {
      mock.post('/v1/test/DEADBEEF/re_run')
        .reply(400, 'some');

      var result = api.repeat('DEADBEEF', {});

      return Promise.all([
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
