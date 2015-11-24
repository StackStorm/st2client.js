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

var MINIMUM_ENTITIES = 3;

var ACTION1 = {
  name: 'st2.dummy.action1',
  description: 'test description',
  enabled: true,
  pack: 'default',
  entry_point: '/tmp/test/action1.sh',
  runner_type: 'local-shell-script',
  parameters: {
    a: {
      type: 'string',
      default: 'A1'
    },
    b: {
      type: 'string',
      default: 'B1'
    }
  },
  tags: [{
    name: 'tag1',
    value: 'dont-care'
  }, {
    name: 'tag2',
    value: 'dont-care'
  }]
};

describe('Actions', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#list()', function () {
    it('should return a promise of a list of actions', function () {
      var result = auth.then(function () {
        return st2client.actions.list();
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        // 'length.of.at.least' is broken when used along with 'evantually'
        //expect(result).to.eventually.have.length.of.at.least(100)
        result.then(function (actions) {
          expect(actions).to.have.length.of.at.least(MINIMUM_ENTITIES);
        })
      ]);
    });

    it('should paginate through the list', function () {
      var LIMIT = 10
        , OFFSET = 10;

      var result = auth.then(function () {
        return st2client.actions.list({
          limit: LIMIT,
          offset: OFFSET
        });
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (actions) {
          expect(actions).to.have.length.within(0, LIMIT);
          // What else? How do we determine we got another set of actions here?
        })
      ]);
    });
  });

  describe('#get()', function () {
    it('should return a promise of a single action', function () {
      var result = auth.then(function () {
        return st2client.actions.get('core.local');
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });
  });

  describe('#create()', function () {
    it('should return a promise of created action', function () {
      var result = auth.then(function () {
        return st2client.actions.create(ACTION1);
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object')
        // TODO: consider checking against jsonschema
      ]);
    });

    after(function () {
      auth.then(function () {
        st2client.actions.delete(ACTION1.pack + '.' + ACTION1.name);
      });
    });
  });

  describe('#edit()', function () {
    var action;

    before(function () {
      action = auth.then(function () {
        return st2client.actions.create(ACTION1);
      });
    });

    it('should return a promise of edited action', function () {
      var resultEdit = action.then(function (existing) {
        var changed = assign({}, existing, { description: 'some' });
        return st2client.actions.edit(changed);
      });
      var resultGet = resultEdit.then(function (changed) {
        return st2client.actions.get(changed.pack + '.' + changed.name);
      });

      return Promise.all([
        expect(resultEdit).to.be.fulfilled,
        expect(resultEdit).to.eventually.be.an('object'),
        expect(resultEdit).to.eventually.have.property('description', 'some'),
        expect(resultGet).to.be.fulfilled,
        expect(resultGet).to.eventually.be.an('object'),
        expect(resultGet).to.eventually.have.property('description', 'some'),
      ]);
    });

    after(function () {
      auth.then(function () {
        st2client.actions.delete(ACTION1.pack + '.' + ACTION1.name);
      });
    });
  });

  describe('#delete()', function () {
    before(function () {
      return auth.then(function () {
        return st2client.actions.create(ACTION1);
      });
    });

    it('should return a promise of deleted action', function () {
      var result = auth.then(function () {
        return st2client.actions.delete(ACTION1.pack + '.' + ACTION1.name);
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
