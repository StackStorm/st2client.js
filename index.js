/*global -Promise*/
'use strict';

var assign = Object.assign || require('object.assign')
  , Promise = require('rsvp').Promise
  , http = require('http')
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

var Enumerable = {
  list: {
    value: function (query) {
      return this.listAll(query);
    }
  },
  listAll: {
    value: function (query) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          query: query,
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

          // TODO: Enumerable likely should not bother itself with limits or length
          this.total = +res.headers['x-total-count'] || res.body.length;
          this.limit = +res.headers['x-limit'] || query && query.limit;

          resolve(res.body);

        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  }
};

var Paginatable = {
  limit: {
    value: 10,
    writable: true
  },

  list: {
    value: function (query) {
      var page = query.page;

      query = assign({}, query);
      delete query.page;

      return this.listPage(page, query);
    }
  },

  listPage: {
    value: function (page, query) {
      return new Promise(function (resolve, reject) {

        return request({
          method: 'get',
          protocol: this.protocol + ':',
          host: this.host,
          port: this.port,
          path: this.path,
          query: assign({}, query, {
            limit: this.limit,
            offset: (page > 1 ? page - 1 : 0) * this.limit
          }),
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

          this.total = +res.headers['x-total-count'] || res.body.length;
          this.limit = +res.headers['x-limit'] || query && query.limit;

          resolve(res.body);

        }.bind(this)).on('error', function (err) {
          return reject(err);
        });

      }.bind(this));
    }
  }
};

var Readable = {
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
};

var Writable = {
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
  }
};

module.exports = function (opts) {
  opts = opts || {};

  var Opts = {
    protocol: {
      value: opts.protocol || 'http'
    },
    host: {
      value: opts.host || '172.168.50.50'
    },
    port: {
      value: opts.port || 9101
    }
  };

  return {
    actions: Object.create(null, assign({
      path: { value: '/actions' }
    }, Opts, Readable, Enumerable)),

    actionOverview: Object.create(null, assign({
      path: { value: '/actions/views/overview' }
    }, Opts, Readable, Enumerable)),

    actionEntryPoint: Object.create(null, assign({
      path: { value: '/actions/views/entry_point' }
    }, Opts, Readable)),

    actionExecutions: Object.create(null, assign({
      path: { value: '/actionexecutions' }
    }, Opts, Readable, Writable, Enumerable)),

    history: Object.create(null, assign({
      path: { value: '/history/executions' }
    }, Opts, Readable, Paginatable)),

    historyFilters: Object.create(null, assign({
      path: { value: '/history/executions/views/filters' }
    }, Opts, Enumerable)),

    rules: Object.create(null, assign({
      path: { value: '/rules' }
    }, Opts, Readable, Writable, Enumerable)),

    triggerTypes: Object.create(null, assign({
      path: { value: '/triggertypes' }
    }, Opts, Readable, Enumerable))
  };
};
