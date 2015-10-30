'use strict';

var Enumerable = {
  list: {
    value: function (query) {
      return this.listAll(query);
    }
  },
  listAll: {
    value: function (query) {
      return this.request({
        method: 'get',
        query: query
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
