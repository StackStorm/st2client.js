'use strict';

var assign = Object.assign || require('object.assign'),
  util = require('./util');
  ;

var Paginatable = {
  limit: {
    value: 10,
    writable: true
  },

  list: {
    value: function (query, altAuth) {
      query = assign({}, query);

      var page = query.page;
      delete query.page;

      return this.listPage(page, query, altAuth);
    }
  },

  listPage: {
    value: function (page, query, altAuth) {
      query = query || {};

      var requestOpts = util.addAltAuthHeaders({
        method: 'get',
        query: assign({
          limit: this.limit
        }, query, {
          offset: (page > 1 ? page - 1 : 0) * (query.limit || this.limit)
        })
      }, altAuth);

      return this.request(requestOpts).then(function (res) {

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
