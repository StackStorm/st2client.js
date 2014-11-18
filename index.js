/*global -Promise*/
'use strict';

var endpoint = require('./lib/endpoint')
  , Readable = require('./lib/mixins/readable')
  , Writable = require('./lib/mixins/writable')
  , Enumerable = require('./lib/mixins/enumerable')
  , Paginatable = require('./lib/mixins/paginatable')
  ;

module.exports = function (opts) {
  opts = opts || {};

  var Opts = {
    protocol: {
      value: opts.protocol || 'http'
    },
    host: {
      value: opts.host || '172.168.50.50'
    },
    port: {
      value: opts.port || 9101
    }
  };

  return {
    actions: endpoint('/actions', Opts, Readable, Enumerable),
    actionOverview: endpoint('/actions/views/overview', Opts, Readable, Enumerable),
    actionEntryPoint: endpoint('/actions/views/entry_point', Opts, Readable),
    actionExecutions: endpoint('/actionexecutions', Opts, Readable, Writable, Enumerable),
    history: endpoint('/history/executions', Opts, Readable, Paginatable),
    historyFilters: endpoint('/history/executions/views/filters', Opts, Enumerable),
    rules: endpoint('/rules', Opts, Readable, Writable, Enumerable),
    triggerTypes: endpoint('/triggertypes', Opts, Readable, Enumerable)
  };
};
