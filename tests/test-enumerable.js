/*global describe, it*/
'use strict';

var assign = Object.assign || require('object.assign')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , Opts = require('./opts')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var expect = chai.expect
  , Enumerable = require('../lib/mixins/enumerable')
  , mock = nock('http://localhost')
  ;

describe('Enumerable', function () {

  var api = endpoint('/test', Opts, Enumerable).value;

  describe('#listAll()', function () {

    it('should return a promise of multiple entities', function () {
      var response = []
        ;

      mock.get('/v1/test')
        .reply(200, response);

      var result = api.listAll();

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should support additional query parameters', function () {
      var response = []
        ;

      mock.get('/v1/test?a=b')
        .reply(200, response);

      var result = api.listAll({ a: 'b' });

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      mock.get('/v1/test')
        .reply(400, 'some');

      var result = api.listAll({});

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

  describe('#list()', function () {

    it('should be a shortcut for the #listAll()', function (done) {
      var query = {};

      var api = Object.create(null, assign({}, Enumerable, {
        listAll: {
          value: function (q) {
            expect(q).to.be.equal(query);
            done();
          }
        }
      }));

      api.list(query);
    });

  });

});
