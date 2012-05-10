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
