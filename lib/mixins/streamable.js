/*global Promise:true*/
'use strict';

var EventSource = global.EventSource || require('eventsource')
  , Promise = require('rsvp').Promise
  ;

var _source;

var Streamable = {
  listen: {
    value: function () {
      return new Promise(function (resolve, reject) {
        var source;
        try {
          source = _source = _source || new EventSource(this.url);
        } catch (e) {
          return reject(e);
        }
        return resolve(source);
      }.bind(this));
    }
  }
};

module.exports = Streamable;
