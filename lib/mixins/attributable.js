'use strict';

var Attributable = {
  attribute: {
    value: function (id, attribute, alt_auth) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      if (!attribute) {
        throw {
          name: 'ArgumentError',
          message: attribute + ' is not a valid attribute name'
        };
      }

      var request_opts = {
        method: 'get',
        path: [this.path, id, 'attribute', attribute].join('/')
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

module.exports = Attributable;
