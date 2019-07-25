'use strict';

var util = require('./util');

var Enumerable = {
  list: {
    value: function (query, altAuth) {
      return this.listAll(query, altAuth);
    }
  },
  listAll: {
    value: function (query, altAuth) {
      var requestOpts = util.addAltAuthHeaders({
        method: 'get',
        query: query
      }, altAuth);

      return this.request(requestOpts).then(function (res) {

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
