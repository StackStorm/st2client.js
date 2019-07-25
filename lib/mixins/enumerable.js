'use strict';

var Enumerable = {
  list: {
    value: function (query, alt_auth) {
      return this.listAll(query, alt_auth);
    }
  },
  listAll: {
    value: function (query, alt_auth) {
      var request_opts = {
        method: 'get',
        query: query
      };

      if (alt_auth && alt_auth.token) {
        request_opts.headers = {
          'x-auth-token': alt_auth.token
        };
      } else if (alt_auth && alt_auth.api_key) {
        request_opts.headers = {
          'st2-api-key': alt_auth.api_key
        };
      }

      return this.request(request_opts).then(function (res) {

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
