'use strict';

var assign = Object.assign || require('object.assign')
  , request = require('./request')
  ;

var endpoint = function (url, opts) {
  var mixins = Array.prototype.slice.call(arguments, 2);

  opts.request = {
    value: function (input, body) {
      var headers = {};

      if (this.token.token) {
        headers['x-auth-token'] = this.token.token;
      }

      if (this.key.key) {
        headers['st2-api-key'] = this.key.key;
      }

      var output = assign({
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: this.path,
        prefix: this.prefix,
        version: this.api_version,
        headers: headers,
        rejectUnauthorized: !!this.rejectUnauthorized,
        withCredentials: false
      }, input);

      return request(output, body);
    }
  };

  var spec = assign.apply(this, [{
    path: { value: url }
  }, opts].concat(mixins));

  var context = Object.create(null, spec);

  return {
    configurable: true,
    value: context
  };
};

module.exports = endpoint;
