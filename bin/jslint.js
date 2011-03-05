#!/usr/bin/env node
// jslint wrapper for nodejs
// Adapted from rhino.js. Copyright 2002 Douglas Crockford
// Shebang removal regex uses insecure "."
// JSLINT is provided by fulljslint.js modified to export the global
/*global JSLINT */

( function ( file, type, out ) {

    var e, i, input, len, success, pad,
        path = __filename.split("/").slice(0, -2).join("/"),
        sys = require("sys"),
        fs = require("fs"), text_out = '';
    
	function write ( text ) {
		if ( out ) {
			
			fs.writeFileSync(out, text,'utf8');
			
		} else {
			
			sys.puts( text );
			
		}
		
	}

    if (!file) {
    	
        sys.puts("Usage: jslint file.js [data] [output.json]");
        process.exit(1);
        
    }

    input = fs.readFileSync(file);
    if (!input) {
        sys.puts("jslint: Couldn't open file '" + file + "'.");
        process.exit(1);
    } else {
        input = input.toString("utf8");
    }

    JSLINT = require("../lib/fulljslint_export").JSLINT;

    // remove shebang (lifted from node.js)
    input = input.replace(/^\#\!.*/, "");

    success = JSLINT(input, {
        predef:   [ // CommonJS
                    "exports", 
                    // YUI
                    "YUI",
                    "YAHOO",
                    "YAHOO_config",
                    "YUI_config",
                    "Y",
                    // NodeJS
                    "GLOBAL",
                    "process",
                    "require",
                    "__filename",
                    "module"       ]
    });
    if ( type === 'data' ){
    	
	    text_out += JSON.stringify( JSLINT.data() );
	    write( text_out );
	    process.exit(0);
	    
    }
    if (!success) {
        i = 0;
        len = JSLINT.errors.length;
    	for (i=0; i<len; i++) {
    		pad = '' + (i + 1);
    		while (pad.length < 3) {
    			pad = ' ' + pad;
    		}
    		e = JSLINT.errors[i];
    		if (e) {
    			text_out += pad + ' ' + e.line + ',' + e.character + ': ' + e.reason + '\n';
    			text_out += '    ' + (e.evidence || '').replace(/^\s+|\s+$/, "") + '\n';
    		}
        }
        write(text_out || 'SOMETHING WENT WRONG');
        process.exit(2);
    }
    write(text_out || 'OK');
    process.exit(0);

})(process.ARGV[2], process.ARGV[3], process.ARGV[4]);
