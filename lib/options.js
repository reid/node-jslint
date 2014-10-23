/*jslint node: true */

(function () {
    'use strict';

    var merge = require('./util').merge,
        path = require('path'),
        fs = require('fs'),
        con = console;

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
    exports.mergeConfigs = mergeConfigs;

    function loadConfig(h, configFile) {
        var home = h || '',
            homeConfigs = [],
            projectConfigs = [];

        if (configFile) {
            // explicitly specified config file overrides default config file name, path
            homeConfigs = [ configFile ];
        } else {
            homeConfigs.push(path.join(home, '.jslint.conf'));
            homeConfigs.push(path.join(home, '.jslintrc'));
        }

        projectConfigs =
            ['jslint.conf', '.jslint.conf', 'jslintrc', '.jslintrc'].map(function (file) {
                return path.join(process.cwd(), file);
            });

        return mergeConfigs(homeConfigs, projectConfigs);
    }

    function options_getOptions(homedir, options, callback) {

        var config = loadConfig(homedir, options.config);

        callback(preprocessOptions(options, config));
    }

    exports.preprocessOptions = preprocessOptions;
    exports.getOptions = options_getOptions;
    exports.splitPredefs = splitPredefs;

}());
