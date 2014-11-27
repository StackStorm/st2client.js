/*global -Promise*/
'use strict';

var request = require('../request')
  ;

var Readable = {
  get: {
    value: function (id) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      return request({

        method: 'get',
        protocol: this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, id].join('/'),
        version: this.api_version,
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
