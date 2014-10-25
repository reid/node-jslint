'use strict';

var assert = require('assert'),
    nodelint = require('../lib/nodelint');

suite('jslint loader', function () {
    test('load jslint', function () {
        var JSLINT = nodelint.load();
        assert.ok(JSLINT);
    });
});
