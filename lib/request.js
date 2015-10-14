/*global -Promise*/
'use strict';

var assign = Object.assign || require('object.assign')
  , axios = require('axios')
  , url = require('url')
  ;

var e = require('./error');

var request = function (params, body) {
  if (params.version) {
    params.path = ['/', params.version, params.path].join('');
  }

  var config = {
    method: params.method,
    url: url.format({
      protocol: params.protocol || 'http',
      hostname: params.host || 'localhost',
      port: params.port,
      pathname: params.path,
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

  return axios(config)
    .catch(function (err) {
      if (err instanceof Error) {
        throw new e.RequestError(err);
      }
      return err;
    })
    .then(function (response) {
      response.statusCode = response.status;
      response.body = response.data;
      response.headers = response.headers || {};

      var contentType = response.headers['content-type'] || [];

      if (contentType.indexOf('application/json') !== -1) {
        if (typeof response.body === 'string' || response.body instanceof String) {
          response.body = JSON.parse(response.body);
        }
      }

      return response;
    });
};

module.exports = request;
