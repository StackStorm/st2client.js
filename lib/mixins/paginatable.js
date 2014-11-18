/*global -Promise*/
'use strict';

var assign = Object.assign || require('object.assign')
  , Promise = require('rsvp').Promise
  , request = require('../request')
  ;

var Paginatable = {
  limit: {
    value: 10,
    writable: true
  },

  list: {
    value: function (query) {
      var page = query.page;

      query = assign({}, query);
      delete query.page;

      return this.listPage(page, query);
    }
  },

  listPage: {
    value: function (page, query) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          query: assign({}, query, {
            limit: this.limit,
            offset: (page > 1 ? page - 1 : 0) * this.limit
          }),
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

module.exports = Paginatable;
