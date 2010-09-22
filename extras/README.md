
TextMate Bundle for node-jslint
===============================

TextMate (commands only) bundle for [node-jslint][]. You can use it alongside your regular javascript bundles as it does not add any syntax.

For the Time being, it includes 4 commands, all linked to the cmd+shift+L key.

Usage
-----

* **node-jslint (ALL) Basic** : runs Crockford's jslint with zero options. Works on client side and server side code
* **node-jslint (CLIENT) Good Parts** : runs Crockford's jslint with 'good parts' options (including use strict) on any clientside javascript code
* **node-jslint (CLIENT) Good Parts noStrict** : same but without "use strict"
* **node-jslint (SERVER) Good Parts** : for node.js serverside scripts
	1) accept node.js specific global variables ("require", "process", "\_\_filename", "\_\_dirname", "module")
	2) as some of them contain underscores, also allows dangling "_" in identifiers
	3) "use strict" not being (yet) supported by WebKit/JavaScriptCore (JSC) based engines (V8 is one) ->  we disable it



Installation
------------

Requires [node-jslint][]

Just open the included node-jslint.tmbundle in textmate

If you installed [node-jslint][] with [homebrew][]'s version of [nodejs][] and [npm][] on MacOS:

    cp /usr/local/lib/node/.npm/jslint/active/package/extras/node-jslint.tmbundle ~/Library/Application\ Support/TextMate/Bundles/
	mate


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
[npm]: http://github.com/isaacs/npm
[homebrew]: http://github.com/mxcl/homebrew
[node-jslint]: http://github.com/fczuardi/node-jslint