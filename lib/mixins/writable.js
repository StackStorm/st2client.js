'use strict';

var Writable = {
  create: {
    value: function (payload, alt_auth) {
      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      var request_opts = {
        method: 'post'
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
          var err = {
            name: 'APIError',
            status: res.statusCode,
            message: res.body.faultstring || res.body
          };

          if ('requestId' in res) {
            err['requestId'] = res.requestId;
          }
          throw err;
        }

        return res.body;

      });
    }
  }
};

module.exports = Writable;
