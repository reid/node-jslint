# node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js
    jslint lib/worker.js lib/server.js # Multiple files
    jslint --white --vars --regexp app.js # All JSLint options supported
    jslint --bitwise false app.js # Defaults to true, but you can specify false
    find . -name "*.js" -print0 | xargs -0 jslint # JSLint your entire project

## Install

    npm install jslint

## Self-Lint

    make lint

## License

See LICENSE file.

[JSLint]: http://jslint.com/
