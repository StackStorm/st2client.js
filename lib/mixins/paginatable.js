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
      var page = query.page;

      query = assign({}, query);
      delete query.page;

      return this.listPage(page, query);
    }
  },

  listPage: {
    value: function (page, query) {
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
