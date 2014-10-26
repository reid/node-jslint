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

// Gets options appropriate for any file in `dir`, given that the user's home
// directory is `homedir` and `options` have already been supplied and should be
// kept in favor of any options found in config files between `dir` and
// `homedir`. `callback` is invoked with the final set of options.
exports.getOptions = function (rootDir, dir, options, callback) {

    rootDir = path.resolve(rootDir);
    dir = path.resolve(dir);

    var config = {},
        configFileName = options.config || defaultConfigFileName;

    // doWhilst: Async do-while construct. Execute logic first in case you are
    // already at root, because being at root is the stopping condition.
    async.doWhilst(function iterator(callback) {
        var configFilePath = path.join(dir, configFileName);
        fs.exists(configFilePath, function (exists) {
            if (!exists) {
                callback();
                return;
            }
            mergeFile(config, configFilePath, callback);
        });
    }, function continueCondition() {

        // If you started in root, or if you moved up to root since the start,
        // then stop. Otherwise continue.
        var shouldContinue = dir !== rootDir;

        // On the next iteration, if you do continue, move one directory up.
        dir = path.resolve(dir, '../');

        return shouldContinue;

    }, function complete() {
        options = preprocessOptions(options, config);
        callback(options);
    });

};
