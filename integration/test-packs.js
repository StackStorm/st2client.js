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

describe('Packs', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#get()', function () {
    it('should return a promise of a single pack', function () {
      var result = auth.then(function () {
        return st2client.packs.get('core');
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.have.property('name', 'core')
      ]);
    });
  });

  after(function () {
    st2client.close();
  });
});
