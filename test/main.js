var assert = require('assert'),
    main;

function mockConsole() {
    return {
        warnings: [],
        warn: function(str) {
            this.warnings.push(str);
        },
        loggings: [],
        log: function(str) {
            this.loggings.push(str);
        }
    };
}

function mockProcess() {
    var p = {
        argv: ['jslint'],
        exit: function (c) {
            this.exitCode = c;
            this.events.exit.forEach(function (f) {
                f();
            });
        },
        doDrain: function() {
            this.events.drain.forEach(function (f) {
                f();
            });
        },
        events: { exit: [],
                  drain: [] },
        on: function (event,f) {
            this.events[event].push(f);
        },
        stdout: {
            isTTY: true,

            /* mock: call callback right away */
            on: function (event, fn) {
                fn();
                p.doDrain()
            },
            callbacks: {
                drain: []
            }
        }
    };
    return p;
}

function mockParsed() {
    return {
        argv: {
            remain: []
        }
    };
}

suite('jslint main', function () {
    var pro, con;

    setup(function () {
        main = require('../lib/main');

        con = mockConsole();
        pro = mockProcess();

        main.setConsole(con);
        main.setProcess(pro);
    });

    test('main - no args', function () {
        var parsed = mockParsed();

        main.main(parsed);

        assert.ok(main);
        assert.strictEqual(1, pro.exitCode);
        assert.strictEqual(2, con.warnings.length);
    });

    test('main - three files', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('lib/main.js');
        parsed.argv.remain.push('lib/main.js');
        parsed.argv.remain.push('lib/main.js');

        pro.on('exit', done);

        parsed.terse = true;

        main.main(parsed);

        assert.ok(main);
    });

    test('main - one file, not tty, json output', function (done) {
        var parsed = mockParsed();

        parsed.argv.remain.push('lib/main.js');

        parsed.json = true;

        pro.stdout.isTTY = false;

        pro.on('drain', function () {
            assert.strictEqual(0, pro.exitCode);
            done();
        });

        main.main(parsed);

        assert.ok(main);

        // expect process.exit(0) to be as yet uncalled
        assert.strictEqual(undefined, pro.exitCode);
    });

    test('todo in command-line options', function () {
        var o = main.commandOptions();

        assert.strictEqual(Boolean, o.todo);
    });
});
