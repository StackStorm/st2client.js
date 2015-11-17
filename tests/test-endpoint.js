/*global describe, it*/
'use strict';

var expect = require('chai').expect
  ;

var endpoint = require('../lib/endpoint');

describe('Endpoint factory', function () {

  it('should return an endpoint object', function () {
    var mixin1 = {
      a: {
        value: 'a'
      },
      b: {
        value: 'b'
      }
    };

    var mixin2 = {
      a: {
        value: 'b'
      },
      c: {
        value: 'd'
      }
    };

    var obj = endpoint('url', mixin1, mixin2);

    expect(obj).to.be.an('object');
    expect(obj.value).to.have.property('a', 'b');
    expect(obj.value).to.have.property('b', 'b');
    expect(obj.value).to.have.property('c', 'd');
    expect(obj.value).to.have.property('path', 'url');
  });

});
