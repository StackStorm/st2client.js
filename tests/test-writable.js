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
  , Writable = require('../lib/mixins/writable')
  , mock = nock('http://test:9101', {
    reqheaders: {
      'content-type': 'application/json'
    }
  })
  ;

var Opts = {
  protocol: {
    value: 'http'
  },
  host: {
    value: 'test'
  },
  port: {
    value: 9101
  },
  api_version: {
    value: 'v1'
  }
};

describe('Writable', function () {

  var api = endpoint('/test', Opts, Writable);

  describe('#create()', function () {

    it('should return a promise of a single entity', function () {
      var request = {}
        , response = {}
        ;

      mock.post('/v1/test', request)
        .reply(201, response);

      var result = api.create(request);

      return all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no payload is provided', function () {
      var fn = function () {
        api.create();
      };

      expect(fn).to.throw('is not a valid payload');
    });

    it('should reject the promise if server returns other than 201 status code', function () {
      mock.post('/v1/test')
        .reply(400, 'some');

      var result = api.create({});

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
