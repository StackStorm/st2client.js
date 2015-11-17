/*global describe, it*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , Opts = require('./opts')
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
  , Routable = require('../lib/mixins/routable')
  ;

describe('Routable', function () {

  var api = endpoint('/test', Opts, Routable).value;

  describe('#route()', function () {

    it('should return a route of an API method', function () {
      var url = '/v1/test/1';
      var result = api.route(1);

      return expect(result).to.be.equal(url);
    });

    it('should return a route of an API method with a query', function () {
      var url = '/v1/test/1?a=b';
      var result = api.route(1, {a: 'b'});

      return expect(result).to.be.equal(url);
    });

  });

});
