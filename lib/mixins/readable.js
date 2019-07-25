'use strict';

var util = require('./util');

var Readable = {
  get: {
    value: function (id, query, altAuth) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      var requestOpts = util.addAltAuthHeaders({
        method: 'get',
        path: [this.path, id].join('/'),
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

module.exports = Readable;
