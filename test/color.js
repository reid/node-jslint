var assert = require('assert'),
    color = require('../lib/color');

suite('text colors', function () {
    test('bold text', function () {
        assert.equal('\x1b[1mbold\x1b[0m', color.bold('bold'));
    });
});
