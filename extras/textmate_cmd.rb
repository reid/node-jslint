#!/usr/bin/env ruby
# Textmate "Command" template for node-jslint (http://github.com/fczuardi/node-jslint)
# Add this to the JavaScript bundle
#
# textmate settings : 
#    Save : Nothing
#    Input : Entire Document
#    Output : Show HTML
#    Activation : whatever key you like
#    Scope Selector : source.js, source.prototype.js
#
# NB : in line "lint = `...`", replace with the path to the jslint.js executable
# on macos, with node installed via homebrew, and jslint installed via npm, 
# it's in "/usr/local/share/npm/bin"
#
# modified from original (http://wonko.com/post/pretty-jslint-output-for-textmate)
# by Peter Host http://github.com/peterhost

require 'cgi'

lint = `/usr/local/bin/jslint $TM_FILEPATH`



lint.gsub!(/^\s+(\d)\s+(\d+),(\d+):\s+([^\n]*)\n([^\n]*)/m) do
  "<p><strong>#{CGI.escapeHTML($1)} <a href=\"txmt://open?url=file://TM_FILEPATH&line=#{CGI.escapeHTML($2)}\"></strong>line #{CGI.escapeHTML($2)}</a> :#{CGI.escapeHTML($3)} <span>#{CGI.escapeHTML($4)}</span>" <<
    ($5 ? "<pre>#{CGI.escapeHTML($5)}</pre>" : '')
end

lint.gsub!(/^(jslint:)(.+?)$/, '<p><strong>\1</strong>\2</p>')
lint.gsub!(/TM_FILEPATH/, ENV['TM_FILEPATH']) 

print <<HTML
<!doctype>
<html>
<head>
  <style type="text/css">
    p { margin-bottom: 0; }
    span { color: salmon;}
    pre {
      background: #f5f5f5;
      border: 1px solid #cfcfcf;
      font-size: 12px;
      margin-top: 2px;
      padding: 2px 4px;
    }
  </style>
</head>
<body>
  #{lint}
</body>
</html>
HTML