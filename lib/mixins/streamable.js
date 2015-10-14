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

        if (this.token && this.token.token) {
          url = url + '?x-auth-token=' + this.token.token;
        }

        try {
          source = _source = this.cacheStream && _source || new EventSource(url);
        } catch (e) {
          return reject(e);
        }
        return resolve(source);
      }.bind(this));
    }
  }
};

module.exports = Streamable;
