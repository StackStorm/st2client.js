/*global -Promise*/
'use strict';

var Promise = require('rsvp').Promise
  , request = require('../request')
  ;

var Readable = {
  get: {
    value: function (id) {
      return request({

        method: 'get',
        protocol: this.protocol + ':',
        host: this.host,
        port: this.port,
        path: [this.path, id].join('/'),
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
  },

  watch: {
    value: function (id, condition) {
      var RETRIES = 10
        , TIMEOUT = 1000;

      var retry = function (retries) {
        return new Promise(function (resolve, reject) {

          setTimeout(function () {

            this.get(id).then(function (execution) {

              if (retries && !condition(execution)) {
                return retry(--retries);
              }

              return execution;
            }).then(resolve).catch(reject);

          }.bind(this), TIMEOUT);

        }.bind(this));
      }.bind(this);

      return retry(RETRIES);
    }
  }
};

module.exports = Readable;
