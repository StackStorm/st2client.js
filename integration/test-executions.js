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

var EXECUTION1 = {
  action: 'core.local',
  parameters: {
    cmd: 'date'
  }
}

describe('Executions', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#post()', function () {
    it('should return result for a single execution', function () {
      var result = auth.then(function () {
        return st2client.executions.create(EXECUTION1);
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });

    it('should return result for a single execution for the rerun', function () {
      var result = auth.then(function () {
        return st2client.executions.list({}).then(function (records) {
          return st2client.executions.repeat(records[0].id, {});
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });

    it('should return error for nonexistent action', function () {
      var result = auth.then(function () {
        return st2client.executions.create({
          action: 'mock.foobar'
        });
      });

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 400);
          expect(err).to.have.property('message');
        })
      ]);
    });

    it('should return error for rerunning nonexistent execution', function () {
      var result = auth.then(function () {
        return st2client.executions.repeat('12345', {});
      });

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 404);
          expect(err).to.have.property('message');
        })
      ]);
    });
  });

  describe('#list()', function () {

    before(function () {
      return auth.then(function () {
        for (var i = 0; i < MINIMUM_ENTITIES; i++) {
          st2client.executions.create(EXECUTION1);
        };
      });
    });

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
    it('should return a promise of a single execution', function () {
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

    it('should return error for nonexistent execution', function () {
      var result = auth.then(function () {
        return st2client.executions.get('foobar');
      });

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.have.property('name', 'APIError');
          expect(err).to.have.property('status', 404);
          expect(err).to.have.property('message');
        })
      ]);
    });
  });

  after(function () {
    st2client.close();
  });
});
