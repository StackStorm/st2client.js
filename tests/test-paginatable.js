/*global describe, it*/
'use strict';

var assign = Object.assign || require('object.assign')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , Paginatable = require('../lib/mixins/paginatable')
  , mock = nock('http://test:9101')
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
  }
};

describe('Paginatable', function () {

  var api;

  beforeEach(function () {
    api = endpoint('/test', Opts, Paginatable);
  });

  describe('#listPage()', function () {

    it('should have a default value for limit', function () {
      expect(api).to.have.property('limit');
      expect(api.limit).to.be.a('number');
    });

    it('should return a promise of multiple entities', function () {
      var response = []
        ;

      mock.get('/test?limit=10&offset=0')
        .reply(200, response);

      var result = api.listPage();

      return all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should support fetching a partucular page', function () {
      var response = []
        ;

      mock.get('/test?limit=10&offset=50')
        .reply(200, response);

      var result = api.listPage(6);

      return all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should support additional query parameters', function () {
      var response = []
        ;

      mock.get('/test?a=b&limit=10&offset=0')
        .reply(200, response);

      var result = api.listPage(null, { a: 'b' });

      return all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should update total and limit based on response headers', function () {
      var response = []
        ;

      mock.get('/test?limit=10&offset=0')
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
      mock.get('/test?limit=10&offset=0')
        .reply(400, 'some');

      var result = api.listPage();

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

  describe('#list()', function () {

    it('should be a shortcut for the #listPage()', function (done) {
      var query = {
        a: 'b',
        page: 3
      };

      var api = Object.create(null, assign(Paginatable, {
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

  });

});
