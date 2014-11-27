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
        version: this.api_version,
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

        return res.body;

      });
    }
  }
};

module.exports = Enumerable;
