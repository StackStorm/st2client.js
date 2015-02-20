'use strict';

var request = require('../request')
  ;

var token = {};

var Authenticatable = {
  token: {
    get: function () {
      return token;
    }
  },

  authenticate: {
    value: function (user, password) {
      if (!user) {
        throw {
          name: 'ArgumentError',
          message: user + ' is not a valid username'
        };
      }

      if (!password) {
        throw {
          name: 'ArgumentError',
          message: password + ' is not a valid password'
        };
      }

      console.log(this.auth)
      console.log(this.host)
      console.log(this.auth.port)
      console.log(this.path)

      return request({

        method: 'post',
        protocol: this.auth.protocol || 'https:',
        host: this.auth.host || this.host,
        port: this.auth.port || 9100,
        path: this.path,
        withCredentials: false,
        headers: {
          'content-type': 'application/json'
        },
        rejectUnauthorized: this.rejectUnauthorized,
        auth: [user, password].join(':')

      }).then(function (res) {

        if (res.statusCode !== 201) {
          throw {
            name: 'APIError',
            status: res.statusCode,
            message: res.body.faultstring || res.body
          };
        }

        token = res.body;

        return res.body;

      });
    }
  }
};

module.exports = Authenticatable;
