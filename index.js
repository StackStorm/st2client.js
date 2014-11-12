/*global -Promise*/
'use strict';

var _ = require('lodash')
  , Promise = require('rsvp').Promise
  , needle = require('needle')
  ;

var Entity = Object.create(null, {
  // Defaults
  scheme: {
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
        return needle.request('get', this.url, opts, function (err, res) {
          if (err) {
            return reject(err);
          }

          if (res.statusCode >= 400) {
            return reject(new Error({
              status: res.statusCode,
              message: res.body
            }));
          }

          this.total = res.headers['X-Total-Count'] || res.body.length;
          this.limit = res.headers['X-Limit'] || opts && opts.limit;

          return resolve(res.body);
        }.bind(this));
      }.bind(this));
    }
  },

  get: {
    value: function (id) {
      return new Promise(function (resolve, reject) {
        return needle.get([this.url, id].join('/'), function (err, res) {
          if (err) {
            return reject(err);
          }

          if (res.statusCode >= 400) {
            return reject(new Error({
              status: res.statusCode,
              message: res.body
            }));
          }

          return resolve(res.body);
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
        return needle.post(this.url, payload, { json: true }, function (err, res) {
          if (err) {
            return reject(err);
          }

          if (res.statusCode !== 201) {
            return reject(new Error({
              status: res.statusCode,
              message: res.body
            }));
          }

          return resolve(res.body);
        }.bind(this));
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
