var assert = require('assert'),
    nodelint = require('../lib/nodelint');

suite('jslint loader', function () {
    test('load implicit jslint', function () {
        var JSLINT = nodelint.load();
        assert.ok(JSLINT);
    });

    test('load explicit jslint', function () {
        var JSLINT = nodelint.load('latest');
        assert.ok(JSLINT);
    });

    test('load nonexistent jslint', function () {

        // mock console object
        var con = { warnings: [],
                    warn: function(str) {
                        this.warnings.push(str);
                    }
                  };
        nodelint.setConsole(con);

        var JSLINT = nodelint.load('nonexistent');
        assert.ok(JSLINT);

        // expect console warning
        assert.strictEqual(1, con.warnings.length);
    });
});
