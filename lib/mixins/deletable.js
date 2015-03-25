'use strict';

var request = require('../request')
  ;

var Deletable = {
  delete: {
    value: function (id) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      return request({

        method: 'delete',
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, id].join('/'),
        version: this.api_version,
        withCredentials: false,
        headers: this.token ? {
          'content-type': 'application/json',
          'x-auth-token': this.token.token
        } : {
          'content-type': 'application/json'
        },

      }).then(function (res) {

        if (res.statusCode !== 204) {
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

module.exports = Deletable;
