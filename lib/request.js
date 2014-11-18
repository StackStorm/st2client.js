/*global -Promise*/
'use strict';

var http = require('http')
  , url = require('url')
  ;

var request = function (params, body, callback) {
  if (!callback) {
    callback = body;
    body = void 0;
  }

  if (params.query) {
    params.path = url.format({
      pathname: params.path,
      query: params.query
    });
  }

  var req =  http.request(params, function (res) {
    res.body = '';

    res.on('data', function (chunk) {
      res.body += chunk.toString('utf8');
    });

    res.on('end', function () {
      callback(res);
    });
  });

  if (body) {
    if (params.headers['content-type'].indexOf('application/json') !== -1) {
      body = JSON.stringify(body);
    }

    req.write(body);
  }

  req.end();
  return req;
};

module.exports = request;
