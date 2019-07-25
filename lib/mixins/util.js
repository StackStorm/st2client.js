'use strict';

var _ = require('lodash');

module.exports.addAltAuthHeaders = function (originalOpts, altAuth) {
  var opts = _.clone(originalOpts);

  if (altAuth && altAuth.token) {
    if (!opts.headers) {
      opts.headers = {
        'x-auth-token': altAuth.token
      };
    } else {
      opts.headers['x-auth-token'] = altAuth.token;
    }
  } else if (altAuth && altAuth.key) {
    if (!opts.headers) {
      opts.headers = {
        'st2-api-key': altAuth.key
      };
    } else {
      opts.headers['st2-api-key'] = altAuth.key;
    }
  }

  return opts;
};
