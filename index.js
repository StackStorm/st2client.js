/*global -Promise*/
'use strict';

var Promise = require('rsvp').Promise
  , http = require('http')
  ;

var request = function (params, body, callback) {
  if (!callback) {
    callback = body;
    body = void 0;
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

var Entity = Object.create(null, {
  // Defaults
  protocol: {
    value: 'http'
  },
  host: {
    value: '172.168.50.50'
  },
  port: {
    value: 9101
  },
  path: {
    value: '/'
  },

  // Helpers
  url: {
    get: function () {
      return this.scheme + '://' + this.host + ':' + this.port + this.path;
    }
  },

  // Methods
  list: {
    value: function (opts) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          withCredentials: false
        }, function (res) {

          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              reject(e);
            }
          }

          if (res.statusCode >= 400) {
            return reject(new Error({
              status: res.statusCode,
              message: res.body
            }));
          }

          this.total = res.headers['x-total-count'] || res.body.length;
          this.limit = res.headers['x-limit'] || opts && opts.limit;

          resolve(res.body);

        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  },

  get: {
    value: function (id) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: [this.path, id].join('/'),
          withCredentials: false
        }, function (res) {

          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              reject(e);
            }
          }

          if (res.statusCode >= 400) {
            return reject({
              name: 'APIError',
              status: res.statusCode,
              message: res.body.faultstring || res.body
            });
          }

          resolve(res.body);

        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  }
});

var Actions = Object.create(Entity, {
  path: {
    value: '/actions'
  }
});

var ActionOverview = Object.create(Entity, {
  path: {
    value: '/actions/views/overview'
  }
});

var ActionExecutions = Object.create(Entity, {
  path: {
    value: '/actionexecutions'
  },

  create: {
    value: function (payload) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'post',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          withCredentials: false,
          headers: {
            'content-type': 'application/json'
          }
        }, payload, function (res) {
          if (res.headers['content-type'].indexOf('application/json') !== -1) {
            try {
              res.body = JSON.parse(res.body);
            } catch (e) {
              reject(e);
            }
          }

          if (res.statusCode !== 201) {
            return reject({
              name: 'APIError',
              status: res.statusCode,
              message: res.body.faultstring || res.body
            });
          }

          return resolve(res.body);
        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  },

  watch: {
    value: function (id, condition) {
      var RETRIES = 10
        , TIMEOUT = 1000;

      var retry = function (retries) {
        return new Promise(function (resolve, reject) {

          setTimeout(function () {

            this.get(id).then(function (execution) {

              if (retries && !condition(execution)) {
                return retry(--retries);
              }

              return execution;
            }).then(resolve).catch(reject);

          }.bind(this), TIMEOUT);

        }.bind(this));
      }.bind(this);

      return retry(RETRIES);
    }
  }
});

module.exports = {
  actions: Actions,
  actionOverview: ActionOverview,
  actionExecutions: ActionExecutions
};
