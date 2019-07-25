'use strict';

var Editable = {
  edit: {
    value: function (id, payload, query, alt_auth) {
      if (!payload) {
        payload = id;
        id = null;
      }

      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      if (!id && payload.id) {
        id = payload.id;
      }

      if (!id && payload.ref) {
        id = payload.ref;
      }

      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      var request_opts = {
        method: 'put',
        path: [this.path, id].join('/'),
        query
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

        if (res.statusCode !== 200) {
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

module.exports = Editable;
