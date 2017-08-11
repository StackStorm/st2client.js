'use strict';

var Schedulable = {
  schedule: {
    value: function (payload, query) {
      return this.request({
        method: 'post',
        query: query
      }, payload)
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
