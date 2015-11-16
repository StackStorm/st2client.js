/*global Promise:true*/
'use strict';

var EventSource = global.EventSource || require('eventsource')
  ;

var _source;

var Streamable = {
  listen: {
    value: function () {
      return new Promise(function (resolve, reject) {
        var source
          , url = this.url;

        var query = [];

        if (this.token.token) {
          query.push({
            key: 'x-auth-token',
            value: this.token.token
          });
        }

        if (this.key.key) {
          query.push({
            key: 'st2-api-key',
            value: this.key.key
          });
        }

        if (query.length) {
          url += '?' + query.map(function (param) {
            return param.key + '=' + param.value;
          }).join('&');
        }

        try {
          source = _source = this.cacheStream && _source || new EventSource(url, {
            rejectUnauthorized: this.rejectUnauthorized
          });
        } catch (e) {
          return reject(e);
        }
        return resolve(source);
      }.bind(this));
    }
  }
};

module.exports = Streamable;
