node-jslint
===========

Easily use [jslint][] from the command line. Pass it the JS file you'd like to lint. For example:

    jslint foo.js

Installation
------------

You'll need [nodejs][], which is easy to install on OS X with [homebrew][]:

    curl -L http://github.com/mxcl/homebrew/tarball/master | tar xz --strip 1 -C /usr/local
    brew install node

You can then install node-jslint in a similar fashion:

    curl -L http://github.com/reid/node-jslint/tarball/master | tar xz --strip 1 -C /usr/local

Or just put bin/jslint anywhere in your PATH.

Known issue
-----------

node-jslint doesn't self-lint because it uses a shebang, which [jslint][] takes issue with.

[jslint]: http://jslint.com/
[nodejs]: http://nodejs.org/
[homebrew]: http://github.com/mxcl/homebrew
