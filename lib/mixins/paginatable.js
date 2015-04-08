'use strict';

var assign = Object.assign || require('object.assign')
  , request = require('../request')
  ;

var Paginatable = {
  limit: {
    value: 10,
    writable: true
  },

  list: {
    value: function (query) {
      query = assign({}, query);

      var page = query.page;
      delete query.page;

      return this.listPage(page, query);
    }
  },

  listPage: {
    value: function (page, query) {
      query = query || {};

      return request({

        method: 'get',
        protocol: this.protocol && this.protocol + ':',
        host: this.host,
        port: this.port,
        path: this.path,
        version: this.api_version,
        query: assign({
          limit: this.limit
        }, query, {
          offset: (page > 1 ? page - 1 : 0) * (query.limit || this.limit)
        }),
        headers: this.token && {
          'x-auth-token': this.token.token
        },
        withCredentials: false

      }).then(function (res) {

        if (res.statusCode >= 400) {
          throw {
            name: 'APIError',
            status: res.statusCode,
            message: res.body.faultstring || res.body
          };
        }

        this.total = +res.headers['x-total-count'] || res.body.length;
        this.limit = +res.headers['x-limit'] || query && query.limit;

        return res.body;

      }.bind(this));
    }
  }
};

module.exports = Paginatable;
