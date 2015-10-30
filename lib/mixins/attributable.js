'use strict';

var Attributable = {
  attribute: {
    value: function (id, attribute) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      if (!attribute) {
        throw {
          name: 'ArgumentError',
          message: attribute + ' is not a valid attribute name'
        };
      }

      return this.request({
        method: 'get',
        path: [this.path, id, 'attribute', attribute].join('/')
      }).then(function (res) {

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

module.exports = Attributable;
