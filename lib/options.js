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

    function loadAndParseConfig(filePath) {
        try {
            /*jslint stupid: true*/
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (err) {
            if (filePath && err.code !== "ENOENT") {
                con.warn('Error reading config file "' + filePath + '": ' + err);
            }
        }
    }
    exports.loadAndParseConfig = loadAndParseConfig;

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

    function mergeConfigs(home, project) {
        var homeConfig,
            cwdConfig,
            config;

        home.some(function (file) {
            homeConfig = loadAndParseConfig(file);
            return homeConfig;
        });

        project.some(function (file) {
            cwdConfig = loadAndParseConfig(file);
            return cwdConfig;
        });

        config = merge(cwdConfig, homeConfig);

        return config;
    }

    function loadConfig(h, configFile) {
        var home = h || '',
            homeConfigs = [],
            projectConfigs = [];

        if (configFile) {
            // explicitly specified config file overrides default config file name, path
            homeConfigs = [ configFile ];
        } else {
            homeConfigs.push(path.join(home, '.jslintrc'));
        }

        projectConfigs =
            ['jslint.conf', '.jslint.conf', 'jslintrc', '.jslintrc'].map(function (file) {
                return path.join(process.cwd(), file);
            });

        return mergeConfigs(homeConfigs, projectConfigs);
    }

    exports.getOptions = function (homedir, options, callback) {

        homedir = homedir || '';

        //var config = loadConfig(homedir, options.config);

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
                        return;
                    }
                    merge(config, json);
                    callback();
                });
            });
        }, function () {
            callback(preprocessOptions(options, config));
        });

    };

    exports.preprocessOptions = preprocessOptions;
    exports.splitPredefs = splitPredefs;

}());
