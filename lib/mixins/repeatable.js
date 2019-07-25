'use strict';

var Repeatable = {
  repeat: {
    value: function (id, payload, query, alt_auth) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      var request_opts = {
        method: 'post',
        path: [this.path, id, 're_run'].join('/'),
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

      return this.request(request_opts, payload).then(function (res) {

        if (res.statusCode !== 201) {
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

module.exports = Repeatable;
