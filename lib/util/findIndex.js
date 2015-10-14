'use strict';

var findIndex = module.exports = function(entity, predicate) {
  if (entity === null) {
    throw new TypeError('findIndex called on null or undefined');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  var list = Object(entity);
  var length = list.length >>> 0;
  var thisArg = arguments[1];
  var value;

  for (var i = 0; i < length; i++) {
    value = list[i];
    if (predicate.call(thisArg, value, i, list)) {
      return i;
    }
  }
  return -1;
};

findIndex.polyfill = function () {
  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function () {
      return findIndex.bind(null, this);
    };
  }
};
