/*global -Promise*/
'use strict';

var assign = Object.assign || require('object.assign')
  , url = require('url')
  , axios = require('axios')
  ;

var request = function (params, body) {
  var config = {
    method: params.method,
    url: url.format({
      protocol: params.protocol || 'http',
      hostname: params.host,
      port: params.port,
      pathname: params.path,
      query: params.query
    }),
    headers: params.headers
  };

  if (body) {
    config.data = body;
  }

  return axios(config).catch(function (err) {
    throw {
      name: 'RequestError',
      message: 'Error during request: [' + err.name + ': ' + err.message + ']'
    };
  }).then(function (response) {
    response.statusCode = response.status;
    response.body = response.data;

    var contentType = response.headers && response.headers['content-type'] || [];

    if (contentType.indexOf('application/json') !== -1 && (typeof response.body === 'string' || response.body instanceof String)
    ) {
      response.body = JSON.parse(response.body);
    }

    return response;
  });
};

module.exports = request;
