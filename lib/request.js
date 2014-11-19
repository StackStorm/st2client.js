/*global -Promise*/
'use strict';

var Promise = require('rsvp').Promise
  , http = require('http')
  , url = require('url')
  ;

var request = function (params, body) {
  return new Promise(function (resolve, reject) {

    if (params.query) {
      params.path = url.format({
        pathname: params.path,
        query: params.query
      });
    }

    params.headers = params.headers || [];

    var req;

    try {
      req =  http.request(params, function (res) {
        res.body = '';

        res.on('data', function (chunk) {
          res.body += chunk.toString('utf8');
        });

        res.on('end', function () {
          if ((res.headers['content-type'] || []).indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              return reject(e);
            }
          }

          return resolve(res);
        });
      });
    } catch (err) {
      return reject({
        name: 'RequestError',
        message: 'Unable to make a request: [' + err.name + ': ' + err.message + ']'
      });
    }

    if (body) {
      if ((params.headers['content-type'] || []).indexOf('application/json') !== -1) {
        body = JSON.stringify(body);
      }

      if (typeof body !== 'string') {
        throw new TypeError('Body is not a string');
      }

      req.write(body);
    }

    req.on('error', function (err) {
      return reject({
        name: 'RequestError',
        message: 'Error during request: [' + err.name + ': ' + err.message + ']'
      });
    });

    req.end();

  });
};

module.exports = request;
