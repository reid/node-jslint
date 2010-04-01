/*global require, process */

var sys = require("sys"),
    puts = sys.puts,
    dir = null;

function cleanAndExit(ex) {
    var code = 0;

    if (ex) {
        code = 1;
        if ("number" === typeof(ex)) {
            puts("The last command returned " + ex);
            puts("git is required to download the jslint source.");
        } else {
            puts(ex.name + ": " + ex.message);
        }
    }
    if (dir) {
        puts("Removing working directory");
        return sys.exec("rm -rf " + dir, function () {
            process.exit( code );
        });
    } else {
        process.exit(code);
    }
}

function execCommands() {
    var q = [].slice.call(arguments);

    function run( error, out, err ) {
        if (error) {
            puts("Error: " + err);
            cleanAndExit();
        }

        var command = q.shift();

        switch (typeof command) {
            case "string":
                puts("Running " + command);
                sys.exec(command, run);
                break;
            case "function":
                try {
                    out = command(out);
                } catch (e) {
                    error = true;
                    err = out = e.message;
                }

                run( error, out, err );
                break;
        }
    }

    run();
}

process.addListener("uncaughtException", cleanAndExit);

execCommands(
    "mktemp -d /tmp/jslint.XXXX",
    function ( out ) {
        dir = out.replace(/\n/,'');
        return dir;
    },
    function ( dir ) {
        process.chdir( dir );
        puts("Changed to new working directory " + dir);
        return dir;
    },
    "git init",
    "git remote add origin git://github.com/reid/node-jslint.git",
    "git pull origin master",
    "git submodule update --init",
    "cp -Rf bin lib /usr/local",
    function () {
        puts("Installed jslint into /usr/local");
        cleanAndExit();
    });
