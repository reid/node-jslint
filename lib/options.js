'use strict';

var async = require('async'),
    merge = require('./util').merge,
    path = require('path'),
    fs = require('fs'),
    con = console,
    defaultConfigFileName = '.jslintrc';

// Mock `console` for testing.
exports.setConsole = function (c) {
    con = c;
};

// Merges the contents a json file into a destination object.
function mergeFile(destination, file, callback) {
    fs.readFile(file, {
        encoding: 'utf-8'
    }, function (readErr, data) {
        var json;
        try {
            if (readErr) {
                throw readErr;
            }
            json = JSON.parse(data);
        } catch (err) {
            con.warn('Error reading config file "' + file + '": ' + err);
            return callback();
        }
        merge(destination, json);
        callback();
    });
}

// Merges options from `maybeMerge` into `keep`, except for options already in
// `keep`.
function preprocessOptions(keep, maybeMerge) {
    var options = {};
    options = merge(options, keep);
    options = merge(options, maybeMerge);
    return options;
}

// Escapes a string so everything in it will be interpreted literally by the
// RegExp parser.
function escapeRegExp(string) {
    return string.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1');
}

// Gets options appropriate for any file in `dir`, given that the user's home
// directory is `homedir` and `options` have already been supplied and should be
// kept in favor of any options found in config files between `dir` and
// `homedir`. `callback` is invoked with the final set of options.
exports.getOptions = function (homeDir, dir, options, callback) {

    homeDir = path.resolve(homeDir || '');

    var config = {},
        configFileName = options.config || defaultConfigFileName,
        homeDirRegExp = new RegExp('^' + escapeRegExp(homeDir));

    async.whilst(function continueCondition() {
        // Determine if we are still in the home directory or a subdirectory.
        return homeDirRegExp.test(path.resolve(dir));
    }, function iterator(callback) {
        var configFilePath = path.join(dir, configFileName);
        fs.exists(configFilePath, function (exists) {
            if (!exists) {
                callback();
                return;
            }
            mergeFile(config, configFilePath, callback);
        });
        // On the next iteration, move one directory up.
        dir += './.';
    }, function complete() {
        options = preprocessOptions(options, config);
        callback(options);
    });

};
