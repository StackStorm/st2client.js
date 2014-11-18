'use strict';

var assign = Object.assign || require('object.assign');

var endpoint = function (url) {
  var mixins = Array.prototype.slice.call(arguments, 1);

  return Object.create(null, assign.apply(this, [{
    path: { value: url }
  }].concat(mixins)));
};

module.exports = endpoint;
