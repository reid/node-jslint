// this file is lib/collectorstream.js
// provides a stream interface to JSLint
//
// Copyright 2014 Cubane Canada Inc.
//
// Released under modified MIT/BSD 3-clause license
// See LICENSE for details.

/*jslint unparam: true*/

(function () {
    'use strict';

    var util = require('util'),
        Transform = require('./stream').Transform,
        CollectorStream;

    CollectorStream = function CollectorStream_constructor(options) {
        if (!(this instanceof CollectorStream)) {
            return new CollectorStream(options);
        }

        Transform.call(this, {objectMode: true});

        this.lint = [];

        this.allOK = true;
    };
    util.inherits(CollectorStream, Transform);

    function CollectorStream_transform(chunk, encoding, callback) {
        // chunk: a package of lint data from JSLint
        this.lint.push([chunk.file, chunk.linted.errors]);

        this.allOK = this.allOK && chunk.linted.ok;

        callback();
    }

    /*jslint nomen: true */
    CollectorStream.prototype._transform = CollectorStream_transform;

    module.exports = CollectorStream;

}());
