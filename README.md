## node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js

## Install

    npm install jslint

## Self-Lint

    make lint

## Usage examples

Multiple files

    jslint lib/worker.js lib/server.js

All JSLint options supported

    jslint --white --vars --regexp app.js

Defaults to true, but you can specify false

    jslint --bitwise false app.js

Pass arrays

	jslint --predef $ --predef Backbone app.js

Control output with --terse (one line output) and --quiet (show errors only)

	jslint --terse --quiet app.js

JSLint your entire project

	find . -name "*.js" -print0 | xargs -0 jslint

## License

See LICENSE file.

[JSLint]: http://jslint.com/
