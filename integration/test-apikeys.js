/*global describe, it*/
'use strict';

var assign = Object.assign || require('object.assign')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , config = require('./config.js')
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
  , st2client = require('../index')(config)
  ;

var MINIMUM_ENTITIES = 1;

describe('API Keys', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#create()', function () {
    it('should return a promise of created API key', function () {
      var result = auth.then(function () {
        return st2client.apikeys.create({});
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });
  });

  describe('#list()', function () {
    it('should return a promise of a list of API keys', function () {
      var result = auth.then(function () {
        return st2client.apikeys.list();
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
  });

  describe('#get()', function () {
    it('should return a promise of a single API key', function () {
      var result = auth.then(function () {
        return st2client.apikeys.list({
          limit: 1
        }).then(function (records) {
          return st2client.apikeys.get(records[0].id);
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.have.property('enabled', true)
        // TODO: consider checking against jsonschema
      ]);
    });
  });

  describe('#delete()', function () {
    before(function () {
      return auth.then(function () {
        return st2client.apikeys.create({});
      });
    });

    it('should return a promise of deleted API key', function () {
      var result = auth.then(function () {
        return st2client.apikeys.list({
          limit: 1
        }).then(function (records) {
          return st2client.apikeys.delete(records[0].id);
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.equal('')
      ]);
    });
  });

  after(function () {
    st2client.close();
  });
});
