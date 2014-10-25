## node-jslint

Easily use [JSLint][] from the command line.

    jslint lib/*.js test/*.js

## Command-line client

### Basic

    jslint lib/color.js

### Globbing

    jslint lib/*.js

### Options

    jslint --color --node false lib/color.js
    jslint --predef $ --predef Backbone lib/color.js

## Using node-jslint programmatically

### Streams interface

As of node-jslint 0.4.0, a streams interface is exposed.  You can use it in
client code like this:

Install as a dependency:

    $ npm install --save jslint

Pull it into your code with require:

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

The LintStream is in object mode (objectMode: true).  It expects an object with
two properties: `file` and `body`.  The `file` property can be used to pass
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

- CLI args.
- Local .jslintrc located in a linted file's directory
- All .jslintrc files upwards the directory tree
- .jslintrc file located in user's home folder (~, or an environment variable "HOME")

## License

See LICENSE file.

[JSLint]: http://jslint.com/
