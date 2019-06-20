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
  , Editable = require('../lib/mixins/editable')
  , mock = nock('http://localhost', {
    reqheaders: {
      'content-type': 'application/json;charset=utf-8'
    }
  })
  ;

describe('Editable', function () {

  var api = endpoint('/test', Opts, Editable).value;

  describe('#edit()', function () {

    it('should return a promise of a single entity', function (done) {
      var request = {
          id: '1'
        }
        , response = {
          id: '1'
        }
        ;

      mock.put('/v1/test/1', request)
        .reply(200, response);

      var result = api.edit(request);

      Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);

      done();
    });

    it('should allow to provide ref for endpoints separately from payload', function (done) {
      var ref = 'some'
        , request = {
          id: '1'
        }
        , response = {
          id: '1'
        }
        ;

      mock.put('/v1/test/some', request)
        .reply(200, response);

      var result = api.edit(ref, request);

      Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);

      done();
    });

    it('should use ref when id is not provided as a part of the payload', function (done) {
      var request = {
          ref: '1'
        }
        , response = {
          ref: '1'
        }
        ;

      mock.put('/v1/test/1', request)
        .reply(200, response);

      var result = api.edit(request);

      Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ])

      done();
    });

    it('should allow to provide query parameters', function (done) {
      var ref = 'some'
        , request = {
          id: '1'
        }
        , response = {
          id: '1'
        }
        , query = {
          a: 'b'
        }
        ;

      mock.put('/v1/test/some?a=b', request)
        .reply(200, response);

      var result = api.edit(ref, request, query);

      Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);

      done();
    });

    it('should throw an error if no payload is provided', function () {
      var fn = function () {
        api.edit();
      };

      expect(fn).to.throw('is not a valid payload');
    });

    it('should throw an error if no id is provided', function () {
      var fn = function () {
        api.edit({});
      };

      expect(fn).to.throw('is not a valid id');
    });

    it('should reject the promise if server returns other than 200 status code', function (done) {
      mock.put('/v1/test/1')
        .reply(400, 'some');

      var result = api.edit({id: 1});

      Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'RequestError');
          expect(err).to.have.property('message', 'Request failed with status code 400');
        })
      ]);

      done();
    });

  });

});
