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

describe('Pack Files', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#get()', function () {
    it('should return a promise of a all the files', function () {
      var result = auth.then(function () {
        return st2client.packFiles.get('core');
      });

      return Promise.all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('array'),
        result.then(function (files) {
          expect(files).to.have.length.above(0);
          return files.forEach(function (file) {
            expect(file).to.have.property('content');
            expect(file).to.have.property('file_path');
          });
        })
      ]);
    });
  });

  after(function () {
    st2client.close();
  });
});
