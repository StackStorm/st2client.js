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
  , Paginatable = require('../lib/mixins/paginatable')
  , mock = nock('http://localhost')
  ;

describe('Paginatable', function () {

  var api;

  beforeEach(function () {
    api = endpoint('/test', Opts, Paginatable).value;
  });

  describe('#listPage()', function () {

    it('should have a default value for limit', function () {
      expect(api).to.have.property('limit');
      expect(api.limit).to.be.a('number');
    });

    it('should return a promise of multiple entities', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=10&offset=0')
        .reply(200, response);

      var result = api.listPage();

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should support fetching a partucular page', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=10&offset=50')
        .reply(200, response);

      var result = api.listPage(6);

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should support additional query parameters', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=10&a=b&offset=0')
        .reply(200, response);

      var result = api.listPage(null, { a: 'b' });

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should update total and limit based on response headers', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=10&offset=0')
        .reply(200, response, {
          'x-limit': 42,
          'x-total-count': 66
        });

      var result = api.listPage();

      return result.then(function () {
        expect(api).to.have.property('limit', 42);
        expect(api).to.have.property('total', 66);
      });
    });

    it('should reject the promise if server returns 4xx or 5xx status code', function () {
      mock.get('/v1/test?limit=10&offset=0')
        .reply(400, 'some');

      var result = api.listPage();

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 400);
          expect(err).to.have.property('message', 'some');
        })
      ]);
    });

    it('should prioritize query limit over default', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=100&a=b&offset=0')
        .reply(200, response);

      var result = api.listPage(null, { a: 'b', limit: 100 });

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should calculate offset properly for query limit', function () {
      var response = []
        ;

      mock.get('/v1/test?limit=100&a=b&offset=400')
        .reply(200, response);

      var result = api.listPage(5, { a: 'b', limit: 100 });

      return Promise.all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

  });

  describe('#list()', function () {

    it('should be a shortcut for the #listPage()', function (done) {
      var query = {
        a: 'b',
        page: 3
      };

      var api = Object.create(null, assign({}, Paginatable, {
        listPage: {
          value: function (page, q) {
            expect(page).to.be.equal(query.page);
            delete query.page;
            expect(q).to.be.deep.equal(query);
            done();
          }
        }
      }));

      api.list(query);
    });

    it('should not throw an error if called without arguments', function (done) {
      var api = Object.create(null, assign({}, Paginatable, {
        listPage: {
          value: function () {
            done();
          }
        }
      }));

      api.list();
    });

  });

});
