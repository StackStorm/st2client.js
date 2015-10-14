'use strict';

var request = require('../request')
  ;

var token = {};

function toBase64(str) {
  if (global.window && window.btoa) {
    return btoa(str);
  } else {
    return new Buffer(str.toString(), 'binary').toString('base64');
  }
}

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

      return request({

        method: 'post',
        protocol: this.auth.protocol && this.auth.protocol + ':',
        host: this.auth.host || this.host,
        port: this.auth.port || 9100,
        path: this.path,
        withCredentials: false,
        rejectUnauthorized: this.rejectUnauthorized,
        headers: {
          'Authorization': 'Basic ' + toBase64([user, password].join(':'))
        }

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
