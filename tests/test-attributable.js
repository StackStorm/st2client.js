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
  , Attributable = require('../lib/mixins/attributable')
  , mock = nock('http://localhost')
  ;

describe('Attributable', function () {

  var api = endpoint('/test', Opts, Attributable).value;

  describe('#attribute()', function () {

    it('should return a promise of a single entity', function () {
      var response = {};

      mock.get('/v1/test/1/attribute/some')
        .reply(200, response);

      var result = api.attribute(1, 'some');

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no id is provided', function () {
      var fn = function () {
        api.attribute();
      };

      expect(fn).to.throw('is not a valid id');
    });

    it('should throw an error if no attribute is provided', function () {
      var fn = function () {
        api.attribute(1);
      };

      expect(fn).to.throw('is not a valid attribute name');
    });

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      var response = {
        faultstring: 'errortext'
      };

      mock.get('/v1/test/1/attribute/some')
        .reply(400, response);

      var result = api.attribute(1, 'some');

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 400);
          expect(err).to.have.property('message', 'errortext');
        })
      ]);
    });

  });

});
