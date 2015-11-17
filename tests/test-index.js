/*jshint -W030*/
/*global Promise:true, describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
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

    expect(index).to.have.property('on').that.is.a('function');
    expect(index).to.have.property('emit').that.is.a('function');
    expect(index).to.have.property('removeListener').that.is.a('function');
    expect(index).to.have.property('removeAllListeners').that.is.a('function');

    expect(index).to.have.property('actions');
    expect(index).to.have.property('actionOverview');
    expect(index).to.have.property('actionEntryPoint');
    expect(index).to.have.property('executions');
    expect(index).to.have.property('executionsFilters');
    expect(index).to.have.property('rules');
    expect(index).to.have.property('triggerTypes');
  });

  it('should not leak the token into opts', function () {
    var Index = require('../index');
    var opts = {};

    var index = Index(opts);

    index.setToken({ token: 'DEADBEEF' });

    expect(opts.token).to.be.equal(undefined);
  });

  it('should accept token being declared', function () {
    var Index = require('../index');
    var opts = { token: { token: 'some' } };

    var index = Index(opts);

    expect(index.token).to.be.deep.equal(opts.token);
  });

  it('should accept token being declared by undefined', function () {
    var Index = require('../index');
    var opts = { token: undefined };

    var index = Index(opts);

    expect(index.token).to.be.an('object').and.empty;
  });

  describe('#setToken()', function () {

    it('should update the token on the endpoints', function () {
      var token = { token: 'DEADBEEF' };

      index.setToken(token);

      expect(index.actions.token).to.deep.equal(token);
    });

  });

  describe('#authenticate()', function () {

    it('should update the token on the endpoints', function () {
      var token = { token: 'DEADBEEF' };

      Object.defineProperty(index, 'auth', { writable: true });

      index.auth = {
        authenticate: function () {
          return new Promise(function (resolve) {
            return resolve(token);
          });
        }
      };

      var promise = index.authenticate();

      return Promise.all([
        expect(promise).to.eventually.fulfill,
        expect(promise).to.eventually.be.deep.equal(token),
        promise.then(function () {
          expect(index.actions.token).to.deep.equal(token);
        })
      ]);
    });

  });

});
