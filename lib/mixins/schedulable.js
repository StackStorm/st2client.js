'use strict';

var util = require('./util');

var Schedulable = {
  schedule: {
    value: function (payload, query, altAuth) {
      var requestOpts = util.addAltAuthHeaders({
        method: 'post',
        query: query
      }, altAuth);

      return this.request(requestOpts, payload)
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
