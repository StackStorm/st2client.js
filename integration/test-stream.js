/*global describe, it, Promise:true*/
'use strict';

var chai = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , EventSource = global.EventSource || require('eventsource')
  , config = require('./config.js')
  ;

chai.use(chaiAsPromised);

var expect = chai.expect
  , st2client = require('../index')(config)
  ;

describe('Stream', function () {
  var auth = (function () {
    if (config.credentials) {
      return st2client.authenticate(config.credentials.user, config.credentials.password);
    } else {
      return new Promise(function (resolve) { resolve(st2client); });
    }
  })();

  describe('#listen()', function () {
    it('should return a promise of an event source', function () {
      var listen = auth.then(function () {
        return st2client.stream.listen();
      });

      return Promise.all([
        expect(listen).to.be.fulfilled,
        listen.then(function (source) {
          expect(source).to.be.instanceOf(EventSource);
        })
      ]);
    });

    it('should return the same event source', function () {

      var result1 = auth.then(function () {
          return st2client.stream.listen();
        })
        , result2 = auth.then(function () {
          return st2client.stream.listen();
        });

      return Promise.all([
        expect(result1).to.be.fulfilled,
        expect(result2).to.be.fulfilled,
        Promise.all([result1, result2]).then(function (sources) {
          expect(sources).to.be.an('array');
          expect(sources).to.have.length(2);
          expect(sources[0]).to.be.equal(sources[1]);
        })
      ]);
    });

    it('should notify about creation of ActionExecution', function () {
      var listen = auth.then(function () {
        return st2client.stream.listen();
      });

      return listen.then(function (stream) {
        var eventName = "st2.execution__create";
        var payload = {
          action: 'core.local',
          parameters: {
            cmd: 'echo beee'
          }
        };

        var response = new Promise(function (resolve, reject) {
          var resolver = function (event) {
            request.then(function (execution) {
              var data = JSON.parse(event.data);

              if (execution.id === data.id) {
                resolve(event);
              }
            });
          };

          stream.onerror = reject;
          stream.addEventListener(eventName, resolver);
        }).then(function (event) {

          expect(event).to.have.property('type', eventName);
          expect(event).to.have.property('data');
          expect(event.data).to.be.a('string');

          var data = JSON.parse(event.data);
          expect(data).to.have.property('action');
          expect(data.action.ref).to.be.equal(payload.action);
          expect(data.parameters).to.be.deep.equal(payload.parameters);
        });

        response.catch(function () {
          return;
        }).then(function () {
          stream.removeAllListeners(eventName);
        });

        var request = st2client.executions.create(payload);

        return Promise.all([request, response]);
      });

    });

    it('should notify about updates during ActionExecution', function () {
      var listen = auth.then(function () {
        return st2client.stream.listen();
      });

      return listen.then(function (stream) {
        var eventName = "st2.execution__update";
        var payload = {
          action: 'core.local',
          parameters: {
            cmd: 'echo wee'
          }
        };

        var response = new Promise(function (resolve, reject) {
          var resolver = function (event) {
            request.then(function (execution) {
              var data = JSON.parse(event.data);

              if (execution.id === data.id) {
                resolve(event);
              }
            });
          };

          stream.onerror = reject;
          stream.addEventListener(eventName, resolver);
        }).then(function (event) {
          expect(event).to.have.property('type', eventName);
          expect(event).to.have.property('data');
          expect(event.data).to.be.a('string');

          var data = JSON.parse(event.data);
          expect(data).to.have.property('action');
          expect(data.action.ref).to.be.equal(payload.action);
          expect(data.parameters).to.be.deep.equal(payload.parameters);
        });

        response.catch(function () {
          return;
        }).then(function () {
          stream.removeAllListeners(eventName);
        });

        var request = st2client.executions.create(payload);

        return Promise.all([request, response]);
      });

    });


  });

  after(function () {
    auth.then(function () {
      return st2client.stream.listen();
    }).then(function (stream) {
      stream.close();
    });
  });

  after(function () {
    st2client.close();
  });
});
