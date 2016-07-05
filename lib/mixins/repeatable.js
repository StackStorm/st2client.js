'use strict';

var Repeatable = {
  repeat: {
    value: function (id, payload, query) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      if (!payload) {
        throw {
          name: 'ArgumentError',
          message: payload + ' is not a valid payload'
        };
      }

      return this.request({
        method: 'post',
        path: [this.path, id, 're_run'].join('/'),
        query: query
      }, payload).then(function (res) {

        if (res.statusCode !== 201) {
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

module.exports = Repeatable;
