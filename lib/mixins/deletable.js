'use strict';

var util = require('./util');

var Deletable = {
  delete: {
    value: function (id, altAuth) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      var requestOpts = util.addAltAuthHeaders({
        method: 'delete',
        path: [this.path, id].join('/'),
      }, altAuth);

      return this.request(requestOpts).then(function (res) {

        if (res.statusCode !== 200 && res.statusCode !== 204) {
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

module.exports = Deletable;
