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
  , Readable = require('../lib/mixins/readable')
  , mock = nock('http://localhost')
  ;

describe('Readable', function () {

  var api = endpoint('/test', Opts, Readable).value;

  describe('#get()', function () {

    it('should return a promise of a single entity', function () {
      var response = {};

      mock.get('/v1/test/1?a=b')
        .reply(200, response);

      var result = api.get(1, {a: 'b'});

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no id is provided', function () {
      var fn = function () {
        api.get();
      };

      expect(fn).to.throw('is not a valid id');
    });

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      var response = {
        faultstring: 'some'
      };

      mock.get('/v1/test/1')
        .reply(400, response);

      var result = api.get(1);

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
