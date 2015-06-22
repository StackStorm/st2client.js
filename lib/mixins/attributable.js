/*global -Promise*/
'use strict';

var request = require('../request')
  ;

var Attributable = {
  attribute: {
    value: function (id, attribute) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      if (!attribute) {
        throw {
          name: 'ArgumentError',
          message: attribute + ' is not a valid attribute name'
        };
      }

      return request({

        method: 'get',
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, id, 'attribute', attribute].join('/'),
        version: this.api_version,
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

module.exports = Attributable;
