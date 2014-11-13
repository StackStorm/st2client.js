/*global describe, it*/
'use strict';

var _ = require('lodash')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , nock = require('nock')
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , st2api = require('../index')
  , mock = nock('http://172.168.50.50:9101')
  ;

describe('ActionExecutions', function () {
  describe('#create()', function () {
    it('should return a promise of a newly created actionexecution', function () {
      mock.post('/actionexecutions', require('./fixtures/actionpayload.json'))
        .reply(201, require('./fixtures/actionexecution.json'));

      var result = st2api.actionExecutions.create(require('./fixtures/actionpayload.json'));

      return all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(require('./fixtures/actionexecution.json'))
      ]);
    });
  });
});