'use strict';

var request = require('../request')
  ;

var Enumerable = {
  list: {
    value: function (query) {
      return this.listAll(query);
    }
  },
  listAll: {
    value: function (query) {
      return request({

        method: 'get',
        protocol: this.protocol + ':',
        host: this.host,
        port: this.port,
        path: this.path,
        query: query,
        withCredentials: false

      }).then(function (res) {

        if (res.statusCode >= 400) {
          throw {
            name: 'APIError',
            status: res.statusCode,
            message: res.body.faultstring || res.body
          };
        }

        // TODO: Enumerable likely should not bother itself with limits or length
        this.total = +res.headers['x-total-count'] || res.body.length;
        this.limit = +res.headers['x-limit'] || query && query.limit;

        return res.body;

      }.bind(this));
    }
  }
};

module.exports = Enumerable;
