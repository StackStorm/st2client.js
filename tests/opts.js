'use strict';

var url = require('url');

module.exports = {
  host: {
    value: undefined
  },
  auth: {
    value: {}
  },
  stream: {
    value: {}
  },
  port: {
    value: undefined
  },
  api_version: {
    value: 'v1'
  },
  cacheStream: {
    value: true
  },
  token: {
    value: {}
  },
  key: {
    value: {}
  },
  noQueryTokens: {
    value: false
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
