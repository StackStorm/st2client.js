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
  , Writable = require('../lib/mixins/writable')
  , mock = nock('http://localhost', {
    reqheaders: {
      'content-type': 'application/json;charset=utf-8'
    }
  })
  ;

describe('Writable', function () {

  var api = endpoint('/test', Opts, Writable).value;

  describe('#create()', function () {

    it('should return a promise of a single entity', function () {
      var request = {}
        , response = {}
        ;

      mock.post('/v1/test', request)
        .reply(201, response);

      var result = api.create(request);

      return Promise.all([
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
