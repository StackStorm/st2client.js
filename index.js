'use strict';

var url = require('url')
  , endpoint = require('./lib/endpoint')
  , Readable = require('./lib/mixins/readable')
  , Writable = require('./lib/mixins/writable')
  , Editable = require('./lib/mixins/editable')
  , Deletable = require('./lib/mixins/deletable')
  , Enumerable = require('./lib/mixins/enumerable')
  , Paginatable = require('./lib/mixins/paginatable')
  , Watchable = require('./lib/mixins/watchable')
  , Authenticatable = require('./lib/mixins/authenticatable')
  , Streamable = require('./lib/mixins/streamable')
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
    },
    api_version: {
      value: 'v' + (opts.api_version || 1)
    },
    auth: {
      value: opts.auth || {}
    },
    token: {
      get: function () {
        return opts.token;
      }
    },
    rejectUnauthorized: {
      value: opts.rejectUnauthorized
    },
    cacheStream: {
      value: true
    },

    url: {
      get: function () {
        return url.format({
          protocol: this.protocol,
          hostname: this.host,
          port: this.port,
          pathname: [this.api_version, this.path].join('')
        });
      }
    }
  };

  return {
    auth: endpoint('/tokens', Opts, Authenticatable),

    actions: endpoint('/actions', Opts, Readable, Enumerable),
    actionOverview: endpoint('/actions/views/overview', Opts, Readable, Enumerable),
    actionEntryPoint: endpoint('/actions/views/entry_point', Opts, Readable),
    executions: endpoint('/executions', Opts, Readable, Writable, Paginatable, Watchable),
    executionsFilters: endpoint('/executions/views/filters', Opts, Enumerable),
    rules: endpoint('/rules', Opts, Readable, Writable, Editable, Deletable, Enumerable),
    stream: endpoint('/stream', Opts, Streamable),
    triggerTypes: endpoint('/triggertypes', Opts, Readable, Enumerable),

    setToken: function (token) {
      opts.token = token;
      return this;
    },
    authenticate: function (user, password) {
      return this.auth.authenticate(user, password).then(function (token) {
        this.setToken(token);
        return token;
      }.bind(this));
    }
  };
};
