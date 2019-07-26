/*global describe, it*/
'use strict';

var expect = require('chai').expect
  , nock = require('nock')
  ;

var endpoint = require('../lib/endpoint');

describe('Endpoint', function () {
  describe('#factory', function () {

    it('should return an endpoint object', function () {
      var mixin1 = {
        a: {
          value: 'a'
        },
        b: {
          value: 'b'
        }
      };

      var mixin2 = {
        a: {
          value: 'b'
        },
        c: {
          value: 'd'
        }
      };

      var obj = endpoint('url', mixin1, mixin2);

      expect(obj).to.be.an('object');
      expect(obj.value).to.have.property('a', 'b');
      expect(obj.value).to.have.property('b', 'b');
      expect(obj.value).to.have.property('c', 'd');
      expect(obj.value).to.have.property('path', 'url');
    });
  });

  describe('#request', function () {

    before(function () {
      nock.disableNetConnect();
      // Uncomment this and the nock.recorder.clear() lines for easier debugging
      // nock.recorder.rec({
      //   dont_print: true,
      //   output_objects: true,
      //   enable_reqheaders_recording: true
      // });
    });

    after(function () {
      nock.cleanAll();
      // nock.recorder.clear();
    });

    beforeEach(function () {
      nock.disableNetConnect();
      nock.cleanAll();
      // nock.recorder.clear();
    });

    it('should use the passed API token', function () {
      var nock_mixin = {
        protocol: {
          enumerable: true,
          value: 'http'
        },
        host: {
          enumerable: true,
          value: 'localhost'
        },
        port: {
          enumerable: true,
          value: '8080'
        },
        token: {
          enumerable: true,
          value: {}
        },
        key: {
          enumerable: true,
          value: {}
        }
      };
      var test_endpoint_descriptor = Object.assign({}, endpoint('/test', nock_mixin), {enumerable: true});

      var test_endpoint = Object.create({}, {test: test_endpoint_descriptor});

      nock('http://localhost:8080')
        .get('/test')
        .matchHeader('x-auth-token', 'token-aaaa')
        .reply(200, {});

      var params = {
        method: 'GET',
        headers: {
          'x-auth-token': 'token-aaaa'
        }
      };
      return test_endpoint.test.request(params, {})
        .then(function (response) {
          expect(response.config.headers).to.be.an('object').and.to.have.property('x-auth-token');
          expect(response.config.headers['x-auth-token']).to.equal('token-aaaa');
        });
    });

    it('should use the passed API key', function () {
      var nock_mixin = {
        protocol: {
          enumerable: true,
          value: 'http'
        },
        host: {
          enumerable: true,
          value: 'localhost'
        },
        port: {
          enumerable: true,
          value: '8080'
        },
        token: {
          enumerable: true,
          value: {}
        },
        key: {
          enumerable: true,
          value: {}
        }
      };
      var test_endpoint_descriptor = Object.assign({}, endpoint('/test', nock_mixin), {enumerable: true});

      var test_endpoint = Object.create({}, {test: test_endpoint_descriptor});

      nock('http://localhost:8080')
        .get('/test')
        .matchHeader('st2-api-key', 'key-cccc')
        .reply(200, {});

      var params = {
        method: 'GET',
        headers: {
          'st2-api-key': 'key-cccc'
        }
      };
      return test_endpoint.test.request(params, {})
        .then(function (response) {
          expect(response.config.headers).to.be.an('object').and.to.have.property('st2-api-key');
          expect(response.config.headers['st2-api-key']).to.equal('key-cccc');
        });
    });
  });
});
