/*global -Promise*/
'use strict';

var request = require('../request')
  ;

var Readable = {
  get: {
    value: function (id, query) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      return request({

        method: 'get',
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, id].join('/'),
        version: this.api_version,
        query: query,
        headers: this.token && {
          'x-auth-token': this.token.token
        },
        withCredentials: false

      }).then(function (res) {

        if (res.statusCode >= 400) {
          throw {
            name: 'APIError',
            status: res.statusCode,
            message: res.body.faultstring || res.body
          };
        }

        return res.body;

      });
    }
  }
};

module.exports = Readable;
