/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , rsvp = require('rsvp')
  , config = require('./config.js')
  ;

chai.use(chaiAsPromised);

var all = rsvp.all
  , expect = chai.expect
  , Promise = rsvp.Promise
  , st2client = require('../index')(config)
  ;

describe('Pack Files', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#get()', function () {
    it('should return a promise of a single file', function () {
      var result = auth.then(function () {
        return st2client.packFiles.get('core/action/local.yaml');
      });

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.a('string')
      ]);
    });
  });
});
