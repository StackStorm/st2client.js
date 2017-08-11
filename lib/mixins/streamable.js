/*global Promise:true*/
'use strict';

var EventSource = global.EventSource || require('eventsource')
  , url = require('url')
  ;

var _source;

var Streamable = {
  url: {
    get: function () {
      var prefix = '';
      if (this.prefix) {
        prefix = this.stream.prefix || this.prefix;
        if (prefix[0] !== '/') {
          prefix = '/' + prefix;
        }
        if (prefix[prefix.length - 1] === '/') {
          prefix = prefix.slice(0, -1);
        }
      }
      if (this.api_version) {
        prefix += '/' + this.api_version;
      }

      return url.format({
        protocol: this.stream.protocol || this.protocol,
        hostname: this.stream.host || this.host,
        port: this.stream.port || this.port,
        pathname: prefix + this.path
      });
    }
  },

  listen: {
    value: function () {
      return new Promise(function (resolve, reject) {
        var source
          , streamUrl = this.url;

        var query = [];

        if (!this.noQueryTokens && this.token.token) {
          query.push({
            key: 'x-auth-token',
            value: this.token.token
          });
        }

        if (!this.noQueryTokens && this.key.key) {
          query.push({
            key: 'st2-api-key',
            value: this.key.key
          });
        }

        if (query.length) {
          streamUrl += '?' + query.map(function (param) {
            return param.key + '=' + param.value;
          }).join('&');
        }

        try {
          source = _source = this.cacheStream && _source || new EventSource(streamUrl, {
            rejectUnauthorized: this.rejectUnauthorized,
            withCredentials: true
          });
        } catch (e) {
          return reject(e);
        }
        return resolve(source);
      }.bind(this));
    }
  },

  wait: {
    value: function (eventType, condition) {
      return this.listen()
        .then(function (source) {
          var listener;

          return new Promise(function (resolve, reject) {
            listener = function (event) {
              var record = JSON.parse(event.data);

              var result = condition(record);

              if (result === true) {
                resolve(record);
              } else if (result === false) {
                reject(record);
              }
            };
            source.addEventListener(eventType, listener);
          }).then(function (record) {
            source.removeEventListener(eventType, listener);

            return record;
          })
          .catch(function (record) {
            source.removeEventListener(eventType, listener);

            throw record;
          });
        });
    }
  }
};

module.exports = Streamable;
