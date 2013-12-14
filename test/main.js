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
    return {
        argv: ['jslint'],
        exit: function (c) {
            this.exitCode = c;
            this.onExit.forEach(function (f) {
                f();
            });
        },
        onExit: [],
        on: function (event,f) {
            if(event === 'exit') {
                this.onExit.push(f);
            }
        },
        stdout: {
            isTTY: true,
            on: function (event, fn) { this.callbacks[event].push(fn); },
            callbacks: {
                drain: []
            }
        },
        doDrain: function () {
            this.stdout.callbacks.drain.forEach(function (f) {
                f();
            });
        }
    };
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

    test('empty test', function () {
        pro.stdout.on('drain', function() { console.log('foo'); });
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

    test('main - one file, not tty, json output', function () {
        var parsed = mockParsed();

        parsed.argv.remain.push('lib/main.js');

        parsed.json = true;

        pro.stdout.isTTY = false;

        main.main(parsed);

        assert.ok(main);

        // TODO: testing of async exit needed
        // expect process.exit(0) to be as yet uncalled
        assert.strictEqual(undefined, pro.exitCode);

        pro.doDrain();

//            assert.strictEqual(0, pro.exitCode);
    });

});
