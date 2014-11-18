/*global -Promise*/
'use strict';

var Promise = require('rsvp').Promise
  , request = require('../request')
  ;

var Writable = {
  create: {
    value: function (payload) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'post',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          withCredentials: false,
          headers: {
            'content-type': 'application/json'
          }
        }, payload, function (res) {
          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              reject(e);
            }
          }

          if (res.statusCode !== 201) {
            return reject({
              name: 'APIError',
              status: res.statusCode,
              message: res.body.faultstring || res.body
            });
          }

          return resolve(res.body);
        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  }
};

module.exports = Writable;
