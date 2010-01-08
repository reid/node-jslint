/*global require, process */

var sys = require("sys"),
    puts = sys.puts,
    dir = null;

function cleanAndExit(ex) {
    var code = 0,
        exit = function () {
            process.exit(code);
        };
    if (ex) {
        code = 1;
        if ("number" === typeof(ex)) {
            puts("The last command returned " + ex);
            puts("git is required to download the jslint source.");
        } else {
            puts(ex.name + ": " + ex.message);
        }
    }
    puts("Removing working directory");
    if (dir) return sys.exec("rm -rf " + dir).addCallback(exit);
    exit();
}

function ex(cmd) {
    puts("Running: " + cmd);
    sys.exec(cmd).wait();
}

process.addListener("uncaughtException", cleanAndExit);

dir = sys.exec("mktemp -d /tmp/jslint.XXXX").wait().shift().replace(/\n/, "");
process.chdir(dir);
puts("Changed to new working directory " + dir);

ex("git init");
ex("git remote add origin git://github.com/reid/node-jslint.git");
ex("git pull origin master");
ex("git submodule update --init");
ex("cp -Rf bin lib /usr/local");

puts("Installed jslint into /usr/local");

cleanAndExit();
