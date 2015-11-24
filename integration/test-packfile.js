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
  data_files: [{
    file_path: 'stuff/some.txt',
    content: '{"a": "b"}'
  }]
};


describe('Pack File', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#get()', function () {
    before(function () {
      return auth.then(function () {
        return st2client.actions.create(ACTION1);
      });
    });

    it('should return a promise of a single file', function () {
      var result = auth.then(function () {
        return st2client.packFile.get('default/actions/stuff/some.txt');
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.a('string'),
        expect(result).to.eventually.be.equal(ACTION1.data_files[0].content)
      ]);
    });

    after(function () {
      auth.then(function () {
        st2client.actions.delete(ACTION1.pack + '.' + ACTION1.name);
      });
    });
  });

  after(function () {
    st2client.close();
  });
});
