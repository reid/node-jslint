## node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js

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

Using JSLint with a config file
  Start with the included example jslintrc file and customize your options per project
  or copy it to $HOME/.jslintrc to apply your setting globally


## License

See LICENSE file.

[JSLint]: http://jslint.com/
