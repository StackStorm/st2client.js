'use strict';

var axios = require('axios')
  , url = require('url')
  ;

var e = require('./error');

var request = function (params, body) {
  var prefix = '';
  if (params.prefix) {
    prefix = params.prefix;
    if (params.prefix[0] !== '/') {
      prefix = '/' + prefix;
    }
    if (params.prefix[params.prefix.length - 1] === '/') {
      prefix = prefix.slice(0, -1);
    }
  }
  if (params.version) {
    prefix += '/' + params.version;
  }

  var config = {
    method: params.method,
    url: url.format({
      protocol: params.protocol || 'http',
      hostname: params.host || 'localhost',
      port: params.port,
      pathname: prefix + params.path,
      query: params.query
    }),
    headers: {},
    transformResponse: []
  };

  if (params.headers) {
    Object.keys(params.headers).forEach(function (name) {
      config.headers[name.toLowerCase()] = params.headers[name];
    });
  }

  if (body) {
    config.data = body;
  }

  if (params.rejectUnauthorized === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  } else {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }

  return axios(config)
    .catch(function (err) {
      if (err instanceof Error) {
        if (err.response) {
          return err.response;
        }

        throw new e.RequestError(err);
      }
      return err;
    })
    .then(function (response) {
      var contentType = (response.headers || {})['content-type'] || [];
      var requestId = (response.headers || {})['X-Request-ID'] || null;

      response.headers = response.headers || {};
      response.statusCode = response.status;
      response.body = response.data;

      if (requestId) {
        response.requestId = requestId;
      }

      if (contentType.indexOf('application/json') !== -1) {
        if (typeof response.body === 'string' || response.body instanceof String) {
          response.body = JSON.parse(response.body);
        }
      }

      return response;
    });
};

module.exports = request;
