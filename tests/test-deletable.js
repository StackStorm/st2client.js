/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , rsvp = require('rsvp')
  , Opts = require('./opts')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , Deletable = require('../lib/mixins/deletable')
  , mock = nock('http://test:9101')
  ;

describe('Deletable', function () {

  var api = endpoint('/test', Opts, Deletable);

  describe('#delete()', function () {

    it('should return a promise of a single entity', function () {
      var response = {};

      mock.delete('/v1/test/1')
        .reply(204, response);

      var result = api.delete(1);

      return all([
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

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      var response = {
        faultstring: 'some'
      };

      mock.delete('/v1/test/1')
        .reply(400, response);

      var result = api.delete(1);

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
