# node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js
    jslint lib/worker.js lib/server.js # Multiple files
    jslint --white --onevar --regexp app.js # All JSLint options supported
    jslint --bitwise false app.js # Defaults to true, but you can specify false
    jslint --goodparts --undef false app.js # The Good Parts, except undef
    jslint -gp app.js # Shorthand for --goodparts: -gp
    find . -name "*.js" -print0 | xargs -0 jslint # JSLint your entire project

## Install

    npm install jslint

## Self-Lint

    make lint

## Output options

`node-jslint` supports a variety of output options, used by passing
the `--output` flag to the command.

Example:

    jslint --output xml lib/worker.js

Options include:

* `default` is the normal output mode
* `simple` is a simple one-line output suitable for integration with Flymake
* `xml` is JUnit XML-style output suitable for integration with Hudson
  or other CI tools
* `java` is Java-style reporting for integration with Java tools that
  don't support JUnit.

## License

See LICENSE file.

[JSLint]: http://jslint.com/
