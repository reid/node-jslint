/*jslint */
var linter = require('../lib/linter'),
    assert = require('assert');

/* test linter | merge */
var r = linter.merge({a: 1}, {b: 2});
assert.deepEqual(r, {a: 1, b: 2});

/* left side value wins in a merge */
r = linter.merge({a: 1}, {a: 2});
assert.deepEqual(r, {a: 1});

/* test: addDefaults set node, es5 if unset */
r = linter.addDefaults({white: false}, {color: true});
assert.deepEqual(r, {white: false, color: true, node: true, es5: true});

/* test: explicitly setting node, es5 prevents addDefaults from overriding */
r = linter.addDefaults({es5: false}, {node: false});
assert.deepEqual(r, {node: false, es5: false});

/* test: splitPredefs */
r = linter.splitPredefs({predef: "foo,bar,baz"});
assert.deepEqual(r, {predef: ['foo', 'bar', 'baz']});

r = linter.splitPredefs({predef: "foo,bar,baz"});
r = linter.splitPredefs({predef: "foo,bar,baz"});
assert.deepEqual(r, {predef: ['foo', 'bar', 'baz']});
