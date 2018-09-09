'use strict';

var Editable = {
  edit: {
    value: function (id, payload, query) {
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

      return this.request({
        method: 'put',
        path: [this.path, id].join('/'),
        query: query
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

module.exports = Editable;
