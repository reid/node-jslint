node-jslint
===========

Easily use [jslint][] from the command line. Pass it the JS file you'd like to lint. For example:

    jslint foo.js

Installation
------------

You'll need [nodejs][], which is easy to install on OS X with [homebrew][]:

    curl -L http://github.com/mxcl/homebrew/tarball/master | tar xz --strip 1 -C /usr/local
    brew install node

Then install node-jslint to /usr/local with the handy installer:

	node http://github.com/reid/node-jslint/raw/master/install.js
	
**WARNING**: You're running script straight from the internet. Only tested on OS X.

Known issue
-----------

node-jslint doesn't self-lint because it uses a shebang, which [jslint][] takes issue with.

License
-------

You can modify, copy and redistribute this software under the WTFPL, Version 2.
See <http://sam.zoy.org/wtfpl/COPYING> for details.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[jslint]: http://jslint.com/
[nodejs]: http://nodejs.org/
[homebrew]: http://github.com/mxcl/homebrew
