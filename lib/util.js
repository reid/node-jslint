/*jslint node: true */

'use strict';

exports.merge = function merge(source, add) {
    var result = source;

    if (!add) {
        return result;
    }

    Object.keys(add).forEach(function (prop) {
        if (!result.hasOwnProperty(prop)) {
            result[prop] = add[prop];
        }
    });

    return result;
};
