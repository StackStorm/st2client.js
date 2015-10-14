'use strict';

var Watchable = {
  _watchMethod: {
    value: function (method, query, condition) {
      var RETRIES = 10
        , TIMEOUT = 1000;

      if (typeof method !== 'function') {
        throw {
          name: 'ArgumentError',
          message: method + ' is not a valid method fucntion'
        };
      } else {
        method = method.bind(this);
      }

      if (!query) {
        throw {
          name: 'ArgumentError',
          message: query + ' is not a valid query'
        };
      }

      if (typeof condition !== 'function') {
        throw {
          name: 'ArgumentError',
          message: condition + ' is not a valid condition function'
        };
      } else {
        condition = condition.bind(this);
      }

      var retry = function (retries) {
        return new Promise(function (resolve, reject) {

          setTimeout(function () {

            method(query).then(function (execution) {

              if (retries && !condition(execution)) {
                return retry(--retries);
              }

              return execution;
            }).then(resolve).catch(reject);

          }, TIMEOUT);

        });
      };

      return retry(RETRIES);
    }
  },

  watch: {
    value: function (id, condition) {
      if (!this.get) {
        throw {
          name: 'DependencyError',
          message: '#watch() requires endpoint to be Readable'
        };
      }

      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      return this._watchMethod(this.get, id, condition);
    }
  },

  watchCollection: {
    value: function (query, condition) {
      if (!this.list) {
        throw {
          name: 'DependencyError',
          message: '#watchCollection() requires endpoint to be Enumerable or Paginatable'
        };
      }

      return this._watchMethod(this.list, query, condition);
    }
  }
};

module.exports = Watchable;
