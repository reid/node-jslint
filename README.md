## node-jslint

Easily use [JSLint][] from the command line.

    npm install -g jslint
    jslint --color bin/*.js lib/*.js test/*.js

## Command-line client

### Basic

    jslint lib/color.js

### Globbing

    jslint lib/*.js

### Options

    jslint --color --node false lib/color.js
    jslint --predef $ --predef Backbone lib/color.js

All standard JSLint options are supported, and are documented
[here](http://www.jslint.com/lint.html#options). Boolean options are `true` by
default. node-jslint provides a few additional options:

`--color` Write output in color.

`--terse` Report 1 error per line with parseable source file/line.

`--json` Output in JSON format.

## Using node-jslint programmatically

### Streams interface

As of node-jslint 0.4.0, a streams interface is exposed.  You can use it in
client code like this:

Install as a dependency:

    $ npm install --save jslint

Pull it into your code with `require`:

    var LintStream = require('jslint').LintStream;

Create and configure the stream linter:

    var options = {
        length: 100
    },
        l = new LintStream(options);

Send files to the linter:

    var fileName, fileContents;
    l.write({file: fileName, body: fileContents});

Receive lint from the linter:

    l.on('data', function (chunk, encoding, callback) {
        // chunk is an object

        // chunk.file is whatever you supplied to write (see above)
        assert.deepEqual(chunk.file, fileName);

        // chunk.linted is an object holding the result from running JSLint
        // chunk.linted.ok is the boolean return code from JSLINT()
        // chunk.linted.errors is the array of errors, etc.
        // see JSLINT for the complete contents of the object

        callback();
    });

You can only pass options to the LintStream when creating it.

The LintStream is in object mode (`objectMode: true`).  It expects an object
with two properties: `file` and `body`.  The `file` property can be used to pass
metadata along with the file.  The `body` property contains the file to be
linted; it can be either a string or a Buffer.

The LintStream emits `'data'` events containing an object with two properties.
The `file` property is copied from the `file` property that is passed in.  The
`linted` property contains the results of running JSLINT.

## Using JSLint with a config file

node-jslint can be configured using JSON in a .jslintrc file.

### Example

`~/.jslintrc`

    {
      "devel": true,
      "indent": 2
    }

All projects tolerate development globals and my favorite indentation style.

`~/project/.jslintrc`

    {
      "indent": 4,
      "predef": [
        "$"
      ],
      "node": true
    }

A particular project uses a different indentation style, plus other
things.  Development globals are still tolerated.

`~/project/client/.jslinrc`

    {
      "browser": true,
      "node": false
    }

All files in the `client/` directory are assumed to be run in a browser
environment, but *not* the node environment that the rest of the project runs
in.

### Placement & Order

The config is obtained by merging multiple configurations by this order of
importance:

- `/*jslint ... */` directives
- CLI args
- Local .jslintrc located in a linted file's directory
- All .jslintrc files upwards the directory tree
- .jslintrc file located in user's home folder (`~`, or an environment variable `HOME`)

## Return values

jslint returns `1` if it found any problems, `0` otherwise.

## Author

JSLint is written and maintained by Douglas Crockford. See
[douglascrockford/JSLint](https://github.com/douglascrockford/JSLint).

This package is node-jslint, which provides a command-line interface for running
jslint using the nodejs platform.  node-jslint was written by Reid Burke and is
maintained by Reid Burke, Ryuichi Okumura, and Sam Mikes.

## Bugs

There are no known bugs.  Submit bugs
[here](https://github.com/reid/node-jslint/issues).

Note that if you are reporting a problem with the way jslint works rather than
the way the command-line tools work, we will probably refer you to the
[JSLint community](https://plus.google.com/communities/104441363299760713736) or
the issue tracker at
[douglascrockford/JSLint](https://github.com/douglascrockford/JSLint/issues).

## License

See LICENSE file.

[JSLint]: http://jslint.com/
