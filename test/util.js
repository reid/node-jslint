'use strict';

var assert = require('assert'),
    nodelint = require('../lib/nodelint'),
    merge = require('../lib/util').merge;

suite('merge', function () {
    test('can merge when no conflict', function () {
        assert.deepEqual({a: 1, b: 2}, merge({a: 1}, {b: 2}));
    });

    test('left side wins on merge', function () {
        assert.deepEqual({a: 1}, merge({a: 1}, {a: 2}));
    });

    test('merge where one or more args is undefined', function () {
        assert.deepEqual({a: 1}, merge({a: 1}, undefined));

        assert.deepEqual({a: 1}, merge(undefined, {a: 1}));
    });

    test('merge where one object has inherited properties', function () {
        var util = require('util'),
            c = { parent: 'orig', own: 'orig' };

        function A() {
            this.parent = 'overridden';
        }

        function B() {
            this.own = 'overridden';
        }

        util.inherits(B, A);

        assert.deepEqual({ parent: 'orig', own: 'overridden' },
                         merge(new B(), c));
    });
});
