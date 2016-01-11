'use strict';

var Deletable = {
  delete: {
    value: function (id) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      return this.request({
        method: 'delete',
        path: [this.path, id].join('/'),
      }).then(function (res) {

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
