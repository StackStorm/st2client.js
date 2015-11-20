/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , config = require('./config.js')
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
  , st2client = require('../index')(config)
  ;

var MINIMUM_ENTITIES = 3;

describe('Executions', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#list()', function () {
    it('should return a promise of a list of history records', function () {
      var result = auth.then(function () {
        return st2client.executions.list();
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        // 'length.of.at.least' is broken when used along with 'evantually'
        //expect(result).to.eventually.have.length.of.at.least(100)
        result.then(function (records) {
          expect(records).to.have.length.of.at.least(MINIMUM_ENTITIES);
        })
      ]);
    });

    it('should set total count of elements', function () {
      var result = auth.then(function () {
        return st2client.executions.list();
      });

      return result.then(function () {
        expect(st2client.executions).to.have.property('total');
        expect(st2client.executions.total).to.be.a('number');
        expect(st2client.executions.total).to.be.at.least(MINIMUM_ENTITIES);
      });
    });

    it('should limit the list', function () {
      var LIMIT = 10;

      var result = auth.then(function () {
        return st2client.executions.list({
          limit: LIMIT
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (records) {
          expect(records).to.have.length.within(MINIMUM_ENTITIES, LIMIT);
          expect(st2client.executions.limit).to.be.within(MINIMUM_ENTITIES, LIMIT);
        })
      ]);
    });

    it('should paginate through the list', function () {
      var LIMIT = 10
        , OFFSET = 10;

      var result = auth.then(function () {
        return st2client.executions.list({
          limit: LIMIT,
          offset: OFFSET
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (records) {
          expect(records).to.have.length.within(0, LIMIT);
          // What else? How do we determine we got another set of history here?
        })
      ]);
    });
  });

  describe('#get()', function () {
    it('should return a promise of a single action', function () {
      var result = auth.then(function () {
        return st2client.executions.list({
          limit: 1
        }).then(function (records) {
          return st2client.executions.get(records[0].id);
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });
  });

  after(function () {
    st2client.close();
  });
});
