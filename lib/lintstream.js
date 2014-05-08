// this file is lib/lintstream.js
// provides a stream interface to JSLint
//
// Copyright 2014 Cubane Canada Inc.
//
// Released under modified MIT/BSD 3-clause license
// See LICENSE for details.

(function () {
    'use strict';

    var util = require('util'),
        Transform = require('stream').Transform,
        linter = require('linter'),
        LintStream;

    util.inherits(LintStream, Transform);

    LintStream = function LintStream_constructor(options) {
        if (!(this instanceof LintStream)) {
            return new LintStream(options);
        }

        Transform.call(this, options);

        // initialize members
        this.options = options;
        this.linter = linter;
    };

    function LintStream_transform(chunk, encoding, callback) {
        var linted = this.linter.lint(chunk, this.options);

        this.emit('data', linted);

        callback();
    }

    /*jslint nomen: true */
    LintStream.prototype._transform = LintStream_transform;

    module.exports = LintStream;

}());
