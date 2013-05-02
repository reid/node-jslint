## node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js

## Install

    npm install jslint -g

## Self-Lint

    make lint

## Usage examples

Multiple files

    jslint lib/color.js lib/reporter.js

All JSLint options supported

    jslint --white --vars --regexp lib/color.js

Defaults to true, but you can specify false

    jslint --bitwise false lib/color.js

Pass arrays

    jslint --predef $ --predef Backbone lib/color.js

JSLint your entire project

    find . -name "*.js" -print0 | xargs -0 jslint


## License

See LICENSE file.

[JSLint]: http://jslint.com/
