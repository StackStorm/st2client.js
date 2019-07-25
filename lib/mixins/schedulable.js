'use strict';

var Schedulable = {
  schedule: {
    value: function (payload, query, alt_auth) {
      var request_opts = {
        method: 'post',
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

      return this.request(request_opts, payload)
        .then(function (res) {
          if (res.statusCode !== 202) {
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

module.exports = Schedulable;
