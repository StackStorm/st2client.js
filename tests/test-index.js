/*global Promise:true, describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , rsvp = require('rsvp')
  ;

chai.use(chaiAsPromised);

var all = rsvp.all
  , expect = chai.expect
  , Promise = rsvp.Promise
  , index;

describe('Index', function () {

  beforeEach(function () {
    index = require('../index')();
  });

  it('should return a factory function for the list of endpoints', function () {
    var Index = require('../index');

    expect(Index).to.be.a('function');

    var index = Index();

    expect(index).to.be.an('object');
    expect(index).to.have.property('actions');
    expect(index).to.have.property('actionOverview');
    expect(index).to.have.property('actionEntryPoint');
    expect(index).to.have.property('actionExecutions');
    expect(index).to.have.property('history');
    expect(index).to.have.property('historyFilters');
    expect(index).to.have.property('rules');
    expect(index).to.have.property('triggerTypes');
  });

  describe('#setToken()', function () {

    it('should update the token on the endpoints', function () {
      var token = 'DEADBEEF';

      index.setToken(token);

      expect(index.actions.token).to.equal(token);
    });

  });

  describe('#authenticate()', function () {

    it('should update the token on the endpoints', function () {
      var token = 'DEADBEEF';

      index.auth = {
        authenticate: function () {
          return new Promise(function (resolve) {
            return resolve(token);
          });
        }
      };

      var promise = index.authenticate();

      return all([
        expect(promise).to.eventually.fulfill,
        expect(promise).to.eventually.be.equal(token),
        promise.then(function () {
          expect(index.actions.token).to.equal(token);
        })
      ]);
    });

  });

});
