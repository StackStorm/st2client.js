'use strict';

var request = require('../request')
  ;

var Writable = {
  edit: {
    value: function (payload) {
      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      if (!payload.id) {
        throw {
          name: 'ArgumentError',
          message: payload.id + ' is not a valid id'
        };
      }

      return request({

        method: 'put',
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, payload.id].join('/'),
        version: this.api_version,
        withCredentials: false,
        headers: this.token ? {
          'content-type': 'application/json',
          'x-auth-token': this.token.token
        } : {
          'content-type': 'application/json'
        },

      }, payload).then(function (res) {

        if (res.statusCode !== 200) {
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
