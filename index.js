'use strict';

var _ = require('lodash')
  , url = require('url')
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
  , Attributable = require('./lib/mixins/attributable')
  , Repeatable = require('./lib/mixins/repeatable')
  , Routable = require('./lib/mixins/routable')
  ;

module.exports = function (opts) {
  opts = _.defaults({}, opts, {
    token: {}
  });

  var Opts = {
    protocol: {
      value: opts.protocol
    },
    host: {
      value: opts.host
    },
    port: {
      value: opts.port
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
          pathname: ['/', this.api_version, this.path].join('')
        });
      }
    }
  };

  return {
    auth: endpoint('/tokens', Opts, Authenticatable),

    actions: endpoint('/actions', Opts, Readable, Enumerable, Writable, Editable, Deletable),
    actionOverview: endpoint('/actions/views/overview', Opts, Readable, Enumerable),
    actionEntryPoint: endpoint('/actions/views/entry_point', Opts, Readable),
    executions: endpoint('/executions', Opts, Readable, Writable, Paginatable, Watchable,
      Attributable, Repeatable),
    executionsFilters: endpoint('/executions/views/filters', Opts, Enumerable),
    packs: endpoint('/packs', Opts, Readable, Enumerable),
    packFiles: endpoint('/packs/views/files', Opts, Readable),
    packFile: endpoint('/packs/views/file', Opts, Readable, Routable),
    rules: endpoint('/rules', Opts, Readable, Writable, Editable, Deletable, Enumerable),
    stream: endpoint('/stream', Opts, Streamable),
    triggerTypes: endpoint('/triggertypes', Opts, Readable, Enumerable),

    token: opts.token,
    setToken: function (token) {
      _.assign(opts.token, token);
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
