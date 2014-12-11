/*global describe, it*/
'use strict';

// Due to the trouble to get EventSource working in PhantomJS, we just mocking it.
function EventSourceStub() {}

EventSourceStub.prototype.close = function () {};

global.EventSource = global.EventSource && EventSourceStub;

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , endpoint = require('../lib/endpoint')
  , nock = require('nock')
  , rsvp = require('rsvp')
  , Opts = require('./opts')
  , EventSource = global.EventSource || require('eventsource')
  ;

chai.use(chaiAsPromised);
nock.disableNetConnect();

var all = rsvp.all
  , expect = chai.expect
  , Streamable = require('../lib/mixins/streamable')
  , mock = nock('http://test:9101')
  ;

describe('Streamable', function () {

  var api = endpoint('/stream', Opts, Streamable);

  describe('#listen()', function () {

    it('should return a promise of an event source', function () {
      var response = "data: some\n\n"
        ;

      mock.get('/v1/stream')
        .reply(200, response);

      var result = api.listen();

      return all([
        expect(result).to.be.fulfilled,
        result.then(function (source) {
          expect(source).to.be.instanceOf(EventSource);
          source.close();
        })
      ]);
    });

  });

});
