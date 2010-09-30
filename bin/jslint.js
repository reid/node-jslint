#!/usr/bin/env node
// jslint wrapper for nodejs



var lintie = function() { 
    var that = require("../lib/linter").jslint(),
    fs = require("fs");
    
    that.run = function () {
        var input = '',
        result = {},
        stdin = process.openStdin();

        that.print_result = function (result) {
            process.stdout.write(result.output);
            if (result.success !== true) {
                process.exit(-1);
            }
        }

        if (process.argv[2] === undefined) {
            stdin.on('data', function(chunk) {
                input += chunk;
            });
            stdin.on('end', function () {
                result = that.process_data(input);
                that.print_result(result);
            });
        }
        else {
            input = fs.readFileSync(process.argv[2]);
            result = that.process_data(input);
            that.print_result(result);
        }

    };
    
    return that;
};

lintie().run();
