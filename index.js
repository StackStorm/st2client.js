'use strict';

var assign = Object.assign || require('object.assign')
  , EventEmitter = require('events')
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
  , Schedulable = require('./lib/mixins/schedulable')
  ;

var protoPorts = {
  http: 80,
  https: 443
};

module.exports = function (opts) {
  opts = assign({}, opts);

  if (!opts.token) {
    opts.token = {};
  }

  if (!opts.key) {
    opts.key = {};
  }

  if (opts.api && typeof opts.api === 'string') {
    var pAPI = url.parse(opts.api);

    pAPI.protocol = pAPI.protocol && pAPI.protocol.slice(0, -1);

    opts.protocol = pAPI.protocol;
    opts.host = pAPI.hostname;
    opts.port = pAPI.port || protoPorts[pAPI.protocol || 'http'];
    opts.prefix = pAPI.path;
  }

  if (opts.auth && typeof opts.auth === 'string') {
    var pAuth = url.parse(opts.auth);

    pAuth.protocol = pAuth.protocol && pAuth.protocol.slice(0, -1);

    opts.auth = {
      protocol: pAuth.protocol,
      host: pAuth.hostname,
      port: pAuth.port || protoPorts[pAuth.protocol || 'http'],
      prefix: pAuth.path
    };
  }

  if (opts.stream && typeof opts.stream === 'string') {
    var pStream = url.parse(opts.stream);

    pStream.protocol = pStream.protocol && pStream.protocol.slice(0, -1);

    opts.stream = {
      protocol: pStream.protocol,
      host: pStream.hostname,
      port: pStream.port || protoPorts[pStream.protocol || 'http'],
      prefix: pStream.path
    };
  }

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
    prefix: {
      value: opts.prefix
    },
    api_version: {
      value: 'v' + (opts.api_version || 1)
    },
    auth: {
      value: opts.auth || {}
    },
    stream: {
      value: opts.stream || {}
    },
    token: {
      get: function () {
        return opts.token;
      }
    },
    key: {
      get: function () {
        return opts.key;
      }
    },
    rejectUnauthorized: {
      value: opts.rejectUnauthorized
    },
    cacheStream: {
      value: true
    },
    noQueryTokens: {
      value: opts.noQueryTokens || false
    },

    url: {
      get: function () {
        var prefix = '';
        if (this.prefix) {
          prefix = this.prefix;
          if (this.prefix[0] !== '/') {
            prefix = '/' + prefix;
          }
          if (this.prefix[this.prefix.length - 1] === '/') {
            prefix = prefix.slice(0, -1);
          }
        }
        if (this.api_version) {
          prefix += '/' + this.api_version;
        }
        return url.format({
          protocol: this.protocol,
          hostname: this.host || 'localhost',
          port: this.port,
          pathname: prefix + this.path
        });
      }
    }
  };

  return Object.create(EventEmitter.prototype, {
    index: endpoint('/', Opts),

    auth: endpoint('/tokens', Opts, Authenticatable),

    actions: endpoint('/actions', Opts, Readable, Enumerable, Writable, Editable, Deletable),
    actionAlias: endpoint('/actionalias', Opts, Readable, Paginatable, Writable, Editable, Deletable),
    actionOverview: endpoint('/actions/views/overview', Opts, Readable, Enumerable),
    actionEntryPoint: endpoint('/actions/views/entry_point', Opts, Readable),
    aliasExecution: endpoint('/aliasexecution', Opts, Writable),
    apikeys: endpoint('/apikeys', Opts, Readable, Enumerable, Writable, Editable, Deletable),
    configs: endpoint('/configs', Opts, Readable, Enumerable, Editable),
    configSchemas: endpoint('/config_schemas', Opts, Readable, Enumerable),
    executions: endpoint('/executions', Opts, Readable, Writable, Paginatable, Watchable,
      Attributable, Repeatable, Deletable),
    executionsFilters: endpoint('/executions/views/filters', Opts, Enumerable),
    packs: endpoint('/packs', Opts, Readable, Enumerable),
    packInstall: endpoint('/packs/install', Opts, Schedulable),
    packUninstall: endpoint('/packs/uninstall', Opts, Schedulable),
    packFiles: endpoint('/packs/views/files', Opts, Readable),
    packFile: endpoint('/packs/views/file', Opts, Readable, Routable),
    rules: endpoint('/rules', Opts, Readable, Writable, Editable, Deletable, Enumerable),
    ruleOverview: endpoint('/rules/views', Opts, Readable, Enumerable),
    stream: endpoint('/stream', Opts, Streamable),
    triggerTypes: endpoint('/triggertypes', Opts, Readable, Enumerable),

    token: {
      value: opts.token
    },
    setToken: {
      value: function (token) {
        assign(opts.token, token);
        return this;
      }
    },
    setKey: {
      value: function (key) {
        assign(opts.key, key);
        return this;
      }
    },
    authenticate: {
      value: function (user, password) {
        return this.auth.authenticate(user, password).then(function (token) {
          this.setToken(token);
          if (this._expiryTimeout) {
            clearTimeout(this._expiryTimeout);
          }
          this._expiryTimeout = setTimeout(function () {
            this.emit('expiry', token);
          }.bind(this), new Date(token.expiry) - new Date() - 10 * 1000);
          return token;
        }.bind(this));
      }
    },
    close: {
      value: function () {
        clearTimeout(this._expiryTimeout);
      }
    }
  });
};
