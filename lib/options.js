/*jslint node: true */

(function () {
    'use strict';

    var async = require('async'),
        merge = require('./util').merge,
        path = require('path'),
        fs = require('fs'),
        con = console,
        configFileName = '.jslintrc';

    exports.setConsole = function (c) {
        con = c;
    };

    function notFalsy(n) {
        return n;
    }

    function splitPredefs(options) {
        if (!options.predef) {
            return options;
        }
        if (Array.isArray(options.predef)) {
            return options;
        }

        options.predef = options.predef.split(',').filter(notFalsy);

        return options;
    }

    function preprocessOptions(options, config) {
        options = merge({}, options);

        options = merge(options, config);

        options = splitPredefs(options);

        return options;
    }

    exports.getOptions = function (homedir, options, callback) {

        homedir = homedir || '';

        var config = {},
            cwd = '.',
            file = options.config || configFileName;

        async.whilst(function () {
            return path.resolve(cwd).length >= path.resolve(homedir).length;
        }, function (callback) {
            var filePath = path.resolve(cwd, file);
            fs.exists(filePath, function (exists) {
                cwd += './.';
                if (!exists) {
                    return callback();
                }
                fs.readFile(filePath, {
                    encoding: 'utf-8'
                }, function (readErr, contents) {
                    var json;
                    if (readErr) {
                        throw readErr;
                    }
                    try {
                        json = JSON.parse(contents);
                    } catch (parseErr) {
                        con.warn('Error reading config file "' + filePath + '": ' + parseErr);
                        return callback();
                    }
                    merge(config, json);
                    callback();
                });
            });
        }, function () {
            callback(preprocessOptions(options, config));
        });

    };

}());
