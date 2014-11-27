'use strict';

var request = require('../request')
  ;

var Writable = {
  create: {
    value: function (payload) {
      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      return request({

        method: 'post',
        protocol: this.protocol + ':',
        host: this.host,
        port: this.port,
        path: this.path,
        version: this.api_version,
        withCredentials: false,
        headers: {
          'content-type': 'application/json'
        }

      }, payload).then(function (res) {

        if (res.statusCode !== 201) {
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

module.exports = Writable;
