'use strict';

var url = require('url');

module.exports = {
  host: {
    value: 'test'
  },
  auth: {
    value: {}
  },
  port: {
    value: 9101
  },
  api_version: {
    value: 'v1'
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
