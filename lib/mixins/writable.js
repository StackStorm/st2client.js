'use strict';

var Writable = {
  create: {
    value: function (payload) {
      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      return this.request({
        method: 'post'
      }, payload).then(function (res) {

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
