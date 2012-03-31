## node-jslint

Easily use [JSLint][] from the command line.

    jslint app.js
    
    jslint lib/worker.js lib/server.js # Multiple files
    
    jslint --white --vars --regexp app.js # All JSLint options supported
    
    jslint --bitwise false app.js # Defaults to true, but you can specify false
    
    find . -name "*.js" -print0 | xargs -0 jslint # JSLint your entire project

## Install

### For Mac or Linux

    npm install jslint

### For Windows

    npm install jslint -g

## Adding JSLint as a Sublime Text Build System

### For Mac or Linux

* Select Tools | Build System | New Build System...
* enter the following:

<pre>
{
  "cmd": ["jslint", "--terse", "$file"],
  "file_regex": "^([^(]*)[(]([0-9]*)[)]()(.*)$",
  "selector": "source.js"	
}
</pre>

* Save as JSLint.sublime-build

###    For Windows

* Select Tools | Build System | New Build System...
* enter the following:

<pre>
{
  "cmd": ["jslint.cmd", "--terse", "$file"],
  "file_regex": "^([^(]*)[(]([0-9]*)[)]()(.*)$",
  "selector": "source.js"
}
</pre>

* Save as JSLint.sublime-build

## Self-Lint

    make lint

## License

See LICENSE file.

[JSLint]: http://jslint.com/
