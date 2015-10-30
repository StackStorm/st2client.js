'use strict';

var Writable = {
  edit: {
    value: function (payload) {
      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      if (!payload.id) {
        throw {
          name: 'ArgumentError',
          message: payload.id + ' is not a valid id'
        };
      }

      return this.request({
        method: 'put',
        path: [this.path, payload.id].join('/'),
      }, payload).then(function (res) {

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

module.exports = Writable;
