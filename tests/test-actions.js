/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , nock = require('nock')
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , st2api = require('../index')()
  , mock = nock('http://172.168.50.50:9101')
  ;

describe('Actions', function () {
  describe('#list()', function () {
    it('should return a promise of a list of actions', function () {
      mock.get('/actions')
        .reply(200, require('./fixtures/actions.json'));

      var result = st2api.actions.list();

      return all([
        expect(result).to.eventually.be.an('array'),
        expect(result).to.eventually.have.length(3),
        expect(result).to.eventually.be.deep.equal(require('./fixtures/actions.json'))
      ]);
    });

    it('should reject a promise in case of connection error', function () {
      var result = st2api.actions.list();

      return expect(result).to.be.rejected;
    });

    it('should reject a promise in case of server returning error status code', function () {
      mock.get('/actions')
        .reply(500, require('./fixtures/500.json'));

      var result = st2api.actions.list();

      return expect(result).to.be.rejected;
    });

    it('should set total count of elements', function () {
      var actions = require('./fixtures/actions.json');

      mock.get('/actions')
        .reply(200, actions, {
          'X-Total-Count': actions.length
        });

      var result = st2api.actions.list();

      return result.then(function (actions) {
        expect(st2api.actions).to.have.property('total');
        expect(st2api.actions.total).to.be.a('number');
        expect(st2api.actions.total).to.be.equal(actions.length);
      });
    });

    it('should set the limit', function () {
      var LIMIT = 7;

      mock.get('/actions?limit=' + LIMIT)
        .reply(200, require('./fixtures/actions.json'), {
          'X-Limit': LIMIT
        });

      var result = st2api.actions.list({ limit: LIMIT });

      return result.then(function () {
        expect(st2api.actions).to.have.property('total');
        expect(st2api.actions.limit).to.be.a('number');
        expect(st2api.actions.limit).to.be.equal(LIMIT);
      });
    });
  });

  describe('#get()', function () {
    it('should return a promise of a single action', function () {
      mock.get('/actions/1')
        .reply(200, require('./fixtures/action.json'));

      var result = st2api.actions.get(1);

      return all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(require('./fixtures/action.json'))
      ]);
    });
  });
});