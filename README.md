## node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js

## What's New

Version 0.2.1 of node-jslint provides multiple editions of jslint to 
address backwards and forwards compatibility.

### Use the default jslint

    jslint lib/color.js

### Always use the latest jslint

    jslint --edition=latest lib/color.js

### Use a specific edition (e.g., 2013-02-03 which shipped with node-jslint 0.1.9)

    jslint --edition=2013-02-03 lib/color.js

## Install

    npm install jslint -g

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

JSLint your entire project

	find . -name "*.js" -print0 | xargs -0 jslint


## License

See LICENSE file.

[JSLint]: http://jslint.com/
