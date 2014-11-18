/*global -Promise*/
'use strict';

var Promise = require('rsvp').Promise
  , request = require('../request')
  ;

var Enumerable = {
  list: {
    value: function (query) {
      return this.listAll(query);
    }
  },
  listAll: {
    value: function (query) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          query: query,
          withCredentials: false
        }, function (res) {

          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              reject(e);
            }
          }

          if (res.statusCode >= 400) {
            return reject(new Error({
              status: res.statusCode,
              message: res.body
            }));
          }

          // TODO: Enumerable likely should not bother itself with limits or length
          this.total = +res.headers['x-total-count'] || res.body.length;
          this.limit = +res.headers['x-limit'] || query && query.limit;

          resolve(res.body);

        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  }
};

module.exports = Enumerable;
