/*global Promise:true, describe, it*/
'use strict';

var assign = Object.assign || require('object.assign')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , Opts = require('./opts')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var expect = chai.expect
  , Watchable = require('../lib/mixins/watchable')
  ;

describe('Watchable', function () {

  var api = endpoint('/test', Opts, Watchable).value;

  describe('#_watchMethod()', function () {

    it('should return a promise of a state', function () {
      var response = {};

      var get = function () {
        return new Promise(function (resolve) {
          return resolve(response);
        });
      };

      var result = api._watchMethod(get, 1, function () {
        return true;
      });

      return Promise.all([
        expect(result).to.eventually.be.an('object'),
        expect(result).to.eventually.be.deep.equal(response)
      ]);
    });

    it('should throw an error if no method is provided', function () {
      var fn = function () {
        api._watchMethod();
      };

      expect(fn).to.throw('is not a valid method');
    });

    it('should throw an error if no query is provided', function () {
      var get = function () {};

      var fn = function () {
        api._watchMethod(get);
      };

      expect(fn).to.throw('is not a valid query');
    });

    it('should throw an error if no condition is provided', function () {
      var get = function () {};

      var fn = function () {
        api._watchMethod(get, 1);
      };

      expect(fn).to.throw('is not a valid condition');
    });

    it('should reject the promise if method\'s promise gets rejected', function () {
      var error = {};

      var get = function () {
        return new Promise(function (resolve, reject) {
          return reject(error);
        });
      };

      var result = api._watchMethod(get, 1, function () {
        return true;
      });

      return Promise.all([
        expect(result).to.be.rejected,
        result.catch(function (err) {
          expect(err).to.be.equal(error);
        })
      ]);
    });

    it('should bind method function to the right context', function (done) {
      var get = function () {
        expect(this).to.be.equal(api);
        done();
        return new Promise(function () {});
      };

      api._watchMethod(get, 1, function () {
        return true;
      });
    });

    it('should bind condition function to the right context', function (done) {
      var get = function () {
        return new Promise(function (resolve) {
          return resolve();
        });
      };

      api._watchMethod(get, 1, function () {
        expect(this).to.be.equal(api);
        done();
        return true;
      });
    });

  });

  describe('#watch()', function () {

    it('should be a shortcut for the #_watchMethod(this.get)', function (done) {
      var id = 'DEADBEEF'
        , condition = function () {
          return true;
        };

      var api = Object.create(null, assign({}, Opts, Watchable, {
        get: {
          value: function () {}
        },
        _watchMethod: {
          value: function (method, _query, _condition) {
            expect(method).to.be.equal(this.get);
            expect(_query).to.be.equal(id);
            expect(_condition).to.be.equal(condition);
            done();
          }
        }
      }));

      api.watch(id, condition);
    });

    it('should throw an error if no method is provided', function () {
      var fn = function () {
        api.watch();
      };

      expect(fn).to.throw('#watch() requires endpoint to be Readable');
    });

    it('should throw an error if no id is provided', function () {
      var api = Object.create(null, assign({}, Opts, Watchable, {
        get: {
          value: function () {}
        }
      }));

      var fn = function () {
        api.watch();
      };

      expect(fn).to.throw('is not a valid id');
    });

  });

  describe('#watchCollection()', function () {

    it('should be a shortcut for the #_watchMethod(this.list)', function (done) {
      var query = {}
        , condition = function () {
          return true;
        };

      var api = Object.create(null, assign({}, Opts, Watchable, {
        list: {
          value: function () {}
        },
        _watchMethod: {
          value: function (method, _query, _condition) {
            expect(method).to.be.equal(this.list);
            expect(_query).to.be.equal(query);
            expect(_condition).to.be.equal(condition);
            done();
          }
        }
      }));

      api.watchCollection(query, condition);
    });

    it('should throw an error if no method is provided', function () {
      var fn = function () {
        api.watchCollection();
      };

      expect(fn).to.throw('#watchCollection() requires endpoint to be Enumerable or Paginatable');
    });

  });

});
