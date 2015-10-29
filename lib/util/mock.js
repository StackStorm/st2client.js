'use strict';

var findIndex = require('./findIndex');

var interceptors = [];

function Mock(host) {
  this.host = host;
}

Mock.prototype.intercept = function (method, path, payload) {
  this.request = {
    url: this.host + path,
    method: method,
    payload: payload,
    headers: {}
  };

  return this;
};

Mock.prototype.get = function (path) {
  return this.intercept('get', path);
};

Mock.prototype.post = function (path, payload) {
  return this.intercept('post', path, payload);
};

Mock.prototype.put = function (path, payload) {
  return this.intercept('put', path, payload);
};

Mock.prototype.delete = function (path, payload) {
  return this.intercept('delete', path, payload);
};

Mock.prototype.matchHeader = function (name, value) {
  this.request.headers[name] = value;

  return this;
};

Mock.prototype.reply = function (status, data, headers) {
  var response = {
    status: status,
    data: data || '',
    headers: headers
  };

  interceptors.push({
    request: this.request,
    response: response
  });
};

if (global.window && window.XMLHttpRequest) {
  var axios = require('axios')
    ;

  axios.interceptors.request.use(function (request) {
    throw {
      request: request
    };
  });

  // Add a response interceptor
  axios.interceptors.response.use(null, function (packet) {
    // Do something with response error
    var request = packet.request;

    if (!request.method) {
      request.method = 'get';
    }

    var index = findIndex(interceptors, function (interceptor) {
      if (interceptor.request.method !== request.method) {
        return false;
      }
      if (interceptor.request.url !== request.url) {
        return false;
      }
      if (Object.keys(interceptor.request.headers).some(function (name) {
        return request.headers[name] !== interceptor.request.headers[name];
      })) {
        return false;
      }

      return true;
    });

    if (index > -1) {
      var interceptor = interceptors.splice(index, 1)[0];
      return Promise.resolve(interceptor.response);
    } else {
      throw new Error('Mock: No match for request ' + request.method + ' ' + request.url);
    }
  });

  module.exports = function (host) {
    return new Mock(host);
  };

  module.exports.disableNetConnect = function () {};
} else {
  module.exports = require('nock');
}
