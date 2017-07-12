'use strict';

var Routable = {
  route: {
    value: function(id, query) {
      if (!id) {
        throw {
          name: 'ArgumentError',
          message: id + ' is not a valid id'
        };
      }

      query = query || {};

      if (!this.noQueryTokens && this.token && this.token.token) {
        query['x-auth-token'] = this.token.token;
      }

      query = Object.keys(query).map(function(key) {
        return encodeURIComponent(key) + '=' +
               encodeURIComponent(query[key]);
      }).join('&');

      return this.url + '/' + id + (query && ('?' + query) || '');
    }
  }
};

module.exports = Routable;
