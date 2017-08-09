'use strict';

var Schedulable = {
  schedule: {
    value: function (payload, query) {
      return this.request({
        method: 'post',
        query: query
      }, payload)
        .then(res => {
          const { body, status } = res;

          if (status !== 202) {
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
