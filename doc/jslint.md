jslint(1) -- a code quality tool
================================

## SYNOPSIS

jslint.js [--ass] [--bitwise] [--browser] [--closure] [--color] [--config] [--continue] [--couch] [--debug] [--devel] [--edition] [--eqeq] [--evil] [--forin] [--indent] [--json] [--maxerr] [--maxlen] [--newcap] [--node] [--nomen] [--passfail] [--plusplus] [--predef] [--properties] [--regexp] [--rhino] [--sloppy] [--stupid] [--sub] [--terse] [--todo] [--unparam] [--vars] [--version] [--white] [--] <scriptfile>...

## DESCRIPTION

JSLint is a static analysis tool to locate and correct style problems in Javascript (ECMAScript etc.) source code.

## META OPTIONS

  `--color`     write output in color

  `--edition`   specify the edition of JSLint to use

  `--terse`     report one error per line with parseable source file/line

  `--json`      output in JSON format

  `--version`   print version and exit

## LINTING OPTIONS

  `--ass`       Tolerate assignment expressions

  `--bitwise`   Tolerate bitwise operators

  `--browser`   Assume a browser

  `--closure`   Tolerate Google Closure idioms

  `--continue`  Tolerate continue

  `--couch`     Tolerate Couch DB

  `--debug`     Tolerate debugger statements

  `--devel`     Assume console,alert, ...

  `--eqeq`      Tolerate == and !=

  `--evil`      Tolerate eval

  `--forin`     Tolerate unfiltered for in

  `--indent`    Strict white space indentation

  `--maxerr`    Maximum number of errors

  `--maxlen`    Maximum line length

  `--newcap`    Tolerate uncapitalized constructors

  `--node`      Assume Node.js

  `--nomen`     Tolerate dangling underscore in identifiers

  `--passfail`  Stop on first error

  `--plusplus`  Tolerate ++ and --

  `--predef`    Declare additional predefined globals

  `--properties` Require all property names to be declared with /*properties*/

  `--regexp`    Tolerate . and [^...]. in /RegExp/

  `--rhino`     Assume Rhino

  `--sloppy`    Tolerate missing 'use strict' pragma

  `--stupid`    Tolerate stupidity (typically, use of sync functions)

  `--sub`       Tolerate inefficient subscripting

  `--todo`      Tolerate TODO comments

  `--unparam`   Tolerate unused parameters

  `--vars`      Tolerate many var statements per function

  `--white`     Tolerate messy white space

## EXAMPLES

*Multiple files:*

    jslint lib/color.js lib/reporter.js

*All JSLint options supported*

    jslint --white --vars --regexp lib/color.js

*Defaults to true, but you can specify false*

    jslint --bitwise false lib/color.js

*Pass arrays*

    jslint --predef $ --predef Backbone lib/color.js

*JSLint your entire project*

    jslint **/*.js

*Using JSLint with a config file*

    See FILES section.

## INSTALLATION

To install jslint globally, use

    npm install jslint -g

To install jslint locally, use

    npm install jslint

When installed locally, jslint can be run as

    ./node_modules/.bin/jslint

## FILES

node-jslint can be configured using JSON in a .jslintrc file.

The format of a jslint options file is a JSON file containing a single object
where the keys are jslint option names and the values are the option argument;
use `true` to enable and `false` to disable boolean options. Example:

    `~/project/.jslintrc`

    {
      "indent": 4,
      "predef": [
        "$"
      ],
      "node": true
    }

## PRECEDENCE

The config is obtained by merging multiple configurations by this order of
precedence, where options closer to #1 on this list override others.

1. `/*jslint ... */` directives
1. CLI args
1. Local .jslintrc located in a linted file's directory
1. All .jslintrc files upwards the directory tree

## RETURN VALUES

jslint returns 1 if it found any problems, 0 otherwise.

## AUTHOR

JSLint is written and maintained by Douglas Crockford. See
[douglascrockford/JSLint](https://github.com/douglascrockford/JSLint).

This package is node-jslint, which provides a command-line interface for running
jslint using the Node.js platform.  node-jslint was written by Reid Burke and is
maintained by Reid Burke, Ryuichi Okumura, and Sam Mikes.

## BUGS

There are no known bugs.  Submit bugs
[here](https://github.com/reid/node-jslint/issues).

Note that if you are reporting a problem with the way jslint works rather than
the way the command-line tools work, we will probably refer you to the
[JSLint community](https://plus.google.com/communities/104441363299760713736) or
the issue tracker at
[douglascrockford/JSLint](https://github.com/douglascrockford/JSLint/issues).

## LICENSE

See LICENSE file.

[JSLint]: http://jslint.com/
