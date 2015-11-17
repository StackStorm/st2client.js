/*global describe, it*/
'use strict';

// Due to the trouble to get EventSource working in PhantomJS, we just mocking it.
function EventSourceStub(url) {

  Object.defineProperty(this, 'url', {
    get: function () {
      return url;
    }
  });

}

EventSourceStub.prototype.close = function () {};

global.EventSource = global.EventSource && EventSourceStub;

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , Opts = require('./opts')
  , EventSource = global.EventSource || require('eventsource')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var expect = chai.expect
  , Streamable = require('../lib/mixins/streamable')
  , mock = nock('http://localhost')
  ;

describe('Streamable', function () {

  var api = endpoint('/stream', Opts, Streamable).value;

  describe('#listen()', function () {

    it('should return a promise of an event source', function () {
      var response = "data: some\n\n"
        ;

      mock.get('/v1/stream')
        .reply(200, response);

      var result = api.listen();

      return Promise.all([
        expect(result).to.be.fulfilled,
        result.then(function (source) {
          expect(source).to.be.instanceOf(EventSource);
          expect(source).to.have.property('url', '/v1/stream');
          source.close();
        })
      ]);
    });

    it('should cache the stream instance', function () {
      mock.get('/v1/stream')
        .reply(200);

      var result1 = api.listen()
        , result2 = api.listen();

      return Promise.all([
        expect(result1).to.be.fulfilled,
        expect(result1).to.be.fulfilled,
        result1.then(function (source1) {
          return result2.then(function (source2) {
            expect(source1).to.be.equal(source2);
          });
        })
      ]);
    });

    it('should include a token as a query parameter', function () {
      var api = endpoint('/stream', Opts, {
        token: {
          value: {
            token: 'DEADBEEF'
          }
        },
        cacheStream: {
          value: false
        }
      }, Streamable).value;

      mock.get('/v1/stream')
        .reply(200);

      var result = api.listen();

      return Promise.all([
        expect(result).to.be.fulfilled,
        result.then(function (source) {
          expect(source).to.be.instanceOf(EventSource);
          expect(source).to.have.property('url', '/v1/stream?x-auth-token=DEADBEEF');
          source.close();
        })
      ]);
    });

  });

});
