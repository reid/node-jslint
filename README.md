# node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js
    jslint lib/worker.js lib/server.js # multiple files
    find . -name "*.js" -print0 | xargs -0 jslint # run on everything in lib/
    jslint --white --onevar --regexp app.js # All JSLint options supported
    jslint --bitwise false app.js # Defaults to true, but you can specify false
    jslint --goodparts --undef false app.js # The Good Parts, except undef.
    jslint -gp app.js # Shorthand for --goodparts: -gp

## Install

    npm install .

## Self-Lint

    make lint

## License

BSD, see LICENSE.

[jslint]: http://jslint.com/
