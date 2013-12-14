## node-jslint

Easily use [JSLint][] from the command line.

    jslint bin/jslint.js

## What's New

Version 0.2.6 of node-jslint provides multiple editions of jslint to 
address backwards and forwards compatibility.

### Use the default jslint

    jslint lib/color.js

### Always use the latest jslint

    jslint --edition=latest lib/color.js

### Use a specific edition 

For example, edition 2013-02-03 which shipped with node-jslint 0.1.9:

    jslint --edition=2013-02-03 lib/color.js

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

Using JSLint with a config file

Start with the included jslintrc.example file and customize your options 
per project or copy it to $HOME/.jslintrc to apply your setting globally

## License

See LICENSE file.

[JSLint]: http://jslint.com/
