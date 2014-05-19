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

    test('load by filename', function () {
        var JSLINT = nodelint.load('lib/jslint-2013-09-22.js');

        assert.ok(JSLINT);
        assert.equal('2013-09-22', JSLINT.edition);
    });

    test('looks like a filename', function () {
        var names = {
            'foo': false,
            'foo.js': true,
            'foo/bar': true,
            'foo\\bar': true
        };

        Object.keys(names).forEach(function (n) {
            assert.equal(names[n], nodelint.looksLikeFileName(n));
        });
    });

});
