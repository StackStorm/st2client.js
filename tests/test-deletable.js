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
  , Deletable = require('../lib/mixins/deletable')
  , mock = nock('http://localhost')
  ;

describe('Deletable', function () {

  var api = endpoint('/test', Opts, Deletable).value;

  describe('#delete()', function () {

    it('should return a promise of a single entity', function () {
      var response = {};

      mock.delete('/v1/test/1')
        .reply(204, response);

      var result = api.delete(1);

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no id is provided', function () {
      var fn = function () {
        api.delete();
      };

      expect(fn).to.throw('is not a valid id');
    });

    it('should resolve the promise in case of 200 and 204 status codes', function () {
      var response = {
        status: 'cancelled'
      };

      mock.delete('/v1/test/1')
        .reply(200, response);

      var result200 = api.delete(1);

      mock.delete('/v1/test/1')
        .reply(204);

      var result204 = api.delete(1);

      return Promise.all([
        expect(result204).to.be.resolved,
        expect(result200).to.be.resolved,
        expect(result200).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      var response = {
        faultstring: 'some'
      };

      mock.delete('/v1/test/1')
        .reply(400, response);

      var result = api.delete(1);

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
