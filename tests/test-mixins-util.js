/*global describe, it*/
'use strict';

var chai = require('chai');
var util = require('../lib/mixins/util');

var expect = chai.expect;

describe('mixins/util', function () {
  it('should update auth token header when it previously exists', function () {
    var originalParams = {
      headers: {
        'x-auth-token': 'original-auth-token'
      }
    };
    var newAuthToken = 'new-token';

    var result = util.addAltAuthHeaders(originalParams, {token: newAuthToken});

    expect(result).has.property('headers');
    expect(result.headers).has.property('x-auth-token');
    expect(result.headers['x-auth-token']).to.equal(newAuthToken);
  });

  it('should update API key header when it previously exists', function () {
    var originalParams = {
      headers: {
        'st2-api-key': 'original-api-key'
      }
    };
    var newApiKey = 'new-api-key';

    var result = util.addAltAuthHeaders(originalParams, {key: newApiKey});

    expect(result).has.property('headers');
    expect(result.headers).has.property('st2-api-key');
    expect(result.headers['st2-api-key']).to.equal(newApiKey);
  });

  it('should add auth token header when it doesn\'t exist', function () {
    var originalParams = {};
    var newAuthToken = 'added-token';

    var result = util.addAltAuthHeaders(originalParams, {token: newAuthToken});

    expect(result).has.property('headers');
    expect(result.headers).has.property('x-auth-token');
    expect(result.headers['x-auth-token']).to.equal(newAuthToken);
  });

  it('should add API key header when it doesn\'t exist', function () {
    var originalParams = {};
    var newApiKey = 'added-api-key';

    var result = util.addAltAuthHeaders(originalParams, {key: newApiKey});

    expect(result).has.property('headers');
    expect(result.headers).has.property('st2-api-key');
    expect(result.headers['st2-api-key']).to.equal(newApiKey);
  });
});
