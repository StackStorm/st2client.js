/*global describe, it*/
'use strict';

var assign = Object.assign || require('object.assign')
  , chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , nock = require('nock')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var expect = chai.expect
  , request = require('../lib/request')
  , mock = nock('http://test:9101')
  ;

var params = {
  host: 'test',
  port: '9101',
  path: '/test'
};

describe('Request factory', function () {

  it('should return a promise of a response', function () {
    mock.get('/test')
      .reply(200, 'some');

    var promise = request(params);

    return Promise.all([
      expect(promise).to.eventually.be.an('object'),
      expect(promise).to.eventually.have.property('statusCode', 200),
      expect(promise).to.eventually.have.property('body', 'some')
    ]);
  });

  it('should handle query parameters', function () {
    mock.get('/test?a=b')
      .reply(200, 'some');

    var promise = request(assign({}, params, {
      query: {
        a: 'b'
      }
    }));

    return expect(promise).to.be.fulfilled;
  });

  it('should return an empty string as a body if server did not return anything', function () {
    mock.get('/test')
      .reply(200);

    var promise = request(params);

    return expect(promise).to.eventually.have.property('body', '');
  });

  it('should parse json if proper content type is provided', function () {
    mock.get('/test')
      .reply(200, '{"a": "b"}', {
        'content-type': 'application/json'
      });

    var promise = request(params);

    return Promise.all([
      expect(promise).to.eventually.have.property('body'),
      promise.then(function (res) {
        expect(res.body).to.be.an('object');
        expect(res.body).to.be.deep.equal({ a: 'b' });
      })
    ]);
  });

  it('should reject the promise if there was an error during json parsing', function () {
    mock.get('/test')
      .reply(200, '{"a": b}', {
        'content-type': 'application/json'
      });

    var promise = request(params);

    return expect(promise).to.be.rejectedWith(SyntaxError);
  });

  it('should send body if provided', function () {
    mock.get('/test', 'some')
      .reply(200);

    var promise = request(params, 'some');

    return expect(promise).to.be.fulfilled;
  });

  it('should stringify body as json', function () {
    mock.post('/test')
      .reply(200);

    var promise = request(assign({}, params, {
      method: 'post'
    }), {a: 'b'});

    return expect(promise).to.be.fulfilled;
  });

  it('should throw an error if no params are provided', function () {
    var promise = request({});

    return Promise.all([
      expect(promise).to.be.rejected,
      promise.catch(function (err) {
        expect(err.name).to.be.equal('RequestError');
      })
    ]);
  });

});
