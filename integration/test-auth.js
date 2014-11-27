/*global describe, it*/
'use strict';

var _ = require('lodash')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);

var all = rsvp.all
  , expect = chai.expect
  , st2client = require('../index')({
    rejectUnauthorized: false
  })
  ;

describe('Auth', function () {
  describe('#authenticate()', function () {

    it('should return a promise of a token', function () {
      var result = st2client.auth.authenticate('test', 'test');

      return all([
        expect(result).to.be.fulfilled,
        expect(result).to.eventually.be.an('object'),
        result.then(function (token) {
          expect(token).to.have.property('id');
          expect(token).to.have.property('user', 'test');
          expect(token).to.have.property('token');
          expect(token).to.have.property('expiry');
        })
      ]);
    });

  });

});
