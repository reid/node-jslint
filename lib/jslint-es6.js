// jslint.js
// 2015-02-27
// Copyright (c) 2015 Douglas Crockford  (www.JSLint.com)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The Software shall be used for Good, not Evil.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// jslint is a function that takes 3 arguments: 

//      source          A file to analyze, an array of strings 
//                      or a single string.
//      option_object   An object whose keys correspond to option names
//      global_array    An array of strings containing global variables that
//                      the file is allowed to access.

// jslint returns an object containing its results. The object contains a lot
// of valuable information. It can be used to generate reports. The object 
// contains:

//      edition: the version of JSLint that did the analysis.
//      errors: an array of error objects. An error object can contain:
//          name: 'JSLintError'
//          column: A column number in the file.
//          line: A line number in the file.
//          code: An error code string.
//          message: The error message string.
//          a: Exhibit A.
//          b: Exhibit B.
//          c: Exhibit C.
//          d: Exhibit D.
//      functions: an array of objects that represent all of the functions
//              declared in the file.
//      global: an object representing the global object. Its names property
//              is an array containing an object for each global variable.
//      id: "(JSLint)"
//      imports: an array of strings representing wach of the imports.
//      json: true if the file is a JSON text.
//      lines: an array of strings, the source.
//      module: true if an import or export statement was used.
//      ok: true if no errors were detected. This is what you want.
//      option: the option argument.
//      property: a property object.
//      stop: true if JSLint was unable to finish. You don't want this.
//      tokens: an array of objects representing the tokens in the file.
//      tree: the token objects arranged in a tree.

//

// WARNING: JSLint will hurt your feelings.

/*property
    a, and, arity, b, bad_assignment_a, bad_character_number_a,
    bad_module_name_a, bad_option_a, bad_property_a, bitwise, block, body,
    browser, c, calls, catch, charAt, charCodeAt, closer, closure, code,
    column, concat, context, couch, create, d, dead, devel, directive, disrupt,
    dot, duplicate_a, edition, ellipsis, else, empty_block, errors, es6, eval,
    expected_a_at_b_c, expected_a_b, expected_a_b_from_c_d,
    expected_a_before_b, expected_identifier_a, expected_line_break_a_b,
    expected_regexp_factor_a, expected_space_a_b, expected_string_a,
    expected_type_string_a, expression, flag, for, forEach, free, from, fud,
    fudge, function, function_in_loop, functions, g, global, i, id, identifier,
    import, imports, inc, indexOf, infix_in, init, initial, isArray, isNaN,
    join, json, keys, label, label_a, lbp, led, length, level, line, lines,
    live, loop, m, margin, match, maxerr, maxlen, message, misplaced_a,
    misplaced_directive_a, module, name, names, nested_comment, new,
    no_functions, node, not_label_a, nud, ok, open, option, out_of_scope_a,
    parameters, pop, property, push, qmark, quote, redefinition_a_b, replace,
    reserved_a, role, search, slash_equal, slice, sort, split, statement, stop,
    stopping, strict, subscript_a, switch, test, this, thru, toString,
    todo_comment, tokens, too_long, too_many, tree, type, u, unclosed_comment,
    unclosed_mega, undeclared_a, unexpected_a, unexpected_at_top_level_a,
    unexpected_char_a, unexpected_comment, unexpected_expression_a,
    unexpected_label_a, unexpected_parens, unexpected_space_a_b,
    unexpected_statement_a, unexpected_typeof_a, uninitialized_a,
    unreachable_a, unregistered_property_a, unsafe, unused_a, use_spaces, used,
    value, var_loop, var_switch, variable, warning, weird_loop, white,
    wrap_immediate, wrap_regexp, wrapped, writable, y
*/

var jslint = (function () {
    'use strict';

    function count(func, progress) {
        progress = progress || 0;
        return func()
        ? count(func, progress + 1)
        : progress;
    }

    function empty() {
        return Object.create(null);
    }

    function do_it(the_token, the_set) {

// Given a task set that was built by an amble function, run all of the relevant
// tasks on the token.

        var a_set = the_set[the_token.arity], 
            i_set;

// If there are tasks associated with the token's arity...

        if (a_set !== undefined) {

// If there are tasks associated with the token's id...

            i_set = a_set[the_token.id];
            if (i_set !== undefined) {
                i_set.forEach(function (task) {
                    return task(the_token);
                });
            }

// If there are tasks for all ids.

            i_set = a_set['(all)'];
            if (i_set !== undefined) {
                i_set.forEach(function (task) {
                    return task(the_token);
                });
            }
        }
    }

    function populate(object, array, value) {
        array.forEach(function (name) {
            object[name] = value;
        });
    }

    var allowed_option = {
        bitwise: true,
        browser: [
            'clearInterval', 'clearTimeout', 'document', 'event', 'FormData',
            'frames', 'history', 'Image', 'localStorage', 'location', 'name',
            'navigator', 'Option', 'parent', 'screen', 'sessionStorage',
            'setInterval', 'setTimeout', 'Storage', 'window', 'XMLHttpRequest'
        ],
        couch: [
            'emit', 'getRow', 'isArray', 'log', 'provides', 'registerType',
            'require', 'send', 'start', 'sum', 'toJSON'
        ],
        devel: [
            'alert', 'confirm', 'console', 'Debug', 'opera', 'prompt', 'WSH'
        ],
        es6: [
            'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
            'Int8Array', 'Int16Array', 'Int32Array', 'Intl', 'Map', 'Promise',
            'Proxy', 'Reflect', 'Set', 'Symbol', 'System', 'Uint8Array',
            'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
            'WeakSet'
        ],
        eval: true,
        for: true,
        fudge: true,
        maxerr: 1000,
        maxlen: 256,
        node: [
            'Buffer', 'clearImmediate', 'clearInterval', 'clearTimeout',
            'console', 'exports', 'global', 'module', 'process',
            'require', 'setImmediate', 'setInterval', 'setTimeout',
            '__dirname', '__filename'
        ],
        this: true,
        white: true
    };

    var binop = {
        '!=': true,
        '!==': true,
        '%': true,
        '%=': true,
        '^': true,
        '^=': true,
        '&': true,
        '&=': true,
        '&&': true,
        '*': true,
        '*=': true,
        '-=': true,
        '+=': true,
        '=': true,
        '=>': true,
        '==': true,
        '===': true,
        '|': true,
        '|=': true,
        '||': true,
        '<': true,
        '<=': true,
        '<<': true,
        '<<=': true,
        '>': true,
        '>=': true,
        '>>': true,
        '>>=': true,
        '>>>': true,
        '>>>=': true
    };
    
    var bitwiseop = {
        '~': true,
        '^': true,
        '^=': true,
        '&': true,
        '&=': true,
        '|': true,
        '|=': true,
        '<<': true,
        '<<=': true,
        '>>': true,
        '>>=': true,
        '>>>': true,
        '>>>=': true
    };

    var opener = {
        '(': ')',
        '[': ']',
        '{': '}',
        '${': '}'
    };

    var relationop = {
        '!=': true,
        '!==': true,
        '==': true,
        '===': true,
        '<': true,
        '<=': true,
        '>': true,
        '>=': true
    };
    
    var standard = [
        'Array', 'Boolean', 'Date', 'decodeURI', 'decodeURIComponent',
        'encodeURI', 'encodeURIComponent', 'Error', 'EvalError',
        'Function', 'isFinite', 'isNaN', 'JSON', 'Math', 'Number', 'Object',
        'parseInt', 'parseFloat', 'RangeError', 'ReferenceError',
        'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError'
    ];

// bundle contains the text messages.

    var bundle = {
        and: "The '&&' subexpression should be wrapped in parens.",
        bad_assignment_a: "Bad assignment to '{a}'.",
        bad_character_number_a: "Bad character code: '{a}'",
        bad_module_name_a: "Bad module name '{a}'.",
        bad_option_a: "Bad option '{a}'.",
        bad_property_a: "Bad property name '{a}'.",
        duplicate_a: "Duplicate '{a}'.",
        empty_block: "Empty block.",
        es6: "Unexpected ES6 feature.",
        expected_a_b: "Expected '{a}' and instead saw '{b}'.",
        expected_a_before_b: "Expected '{a}' before '{b}'.",
        expected_a_b_from_c_d: "Expected '{a}' to match '{b}' from line " +
                "{c} and instead saw '{d}'.",
        expected_a_at_b_c: "Expected '{a}' at column {b}, not column {c}.",
        expected_identifier_a: "Expected an identifier and instead saw '{a}'.",
        expected_line_break_a_b: "Expected a line break between '{a}' and '{b}'.",
        expected_regexp_factor_a: "Expected a regexp factor and instead saw '{a}'.",
        expected_space_a_b: "Expected one space between '{a}' and '{b}'.",
        expected_string_a: "Expected a string and instead saw '{a}'.",
        expected_type_string_a: "Expected a type string and instead saw '{a}'.",
        function_in_loop: "Don't make functions within a loop.",
        infix_in: "Unexpected 'in'. Compare with undefined, or use the " +
                "hasOwnProperty method instead.",
        isNaN: "Use the isNaN function to compare with NaN.",
        label_a: "'{a}' is a statement label.",
        misplaced_a: "Place '{a}' at the outermost level.",
        misplaced_directive_a: "Place the '/*{a}*/' directive before the first statement.",
        nested_comment: "Nested comment.",
        no_functions: "There are no functions.",
        not_label_a: "'{a}' is not a label.",
        out_of_scope_a: "'{a}' is out of scope.",
        redefinition_a_b: "Redefinition of '{a}' from line {b}.",
        reserved_a: "Reserved name '{a}'.",
        slash_equal: "A regular expression literal can be confused with '/='.",
        stopping: "Stopping.",
        subscript_a: "['{a}'] is better written in dot notation.",
        todo_comment: "Unexpected TODO comment.",
        too_long: "Line too long.",
        too_many: "Too many errors.",
        unclosed_comment: "Unclosed comment.",
        unclosed_mega: "Unclosed mega literal.",
        undeclared_a: "Undeclared '{a}'.",
        unexpected_a: "Unexpected '{a}'.",
        unexpected_at_top_level_a: "Unexpected '{a}' at top level.",
        unexpected_char_a: "Unexpected character '{a}'.",
        unexpected_comment: "Unexpected comment.",
        unexpected_expression_a: "Unexpected expression '{a}' in statement position.",
        unexpected_statement_a: "Unexpected statement '{a}' in expression position.",
        unexpected_label_a: "Unexpected label '{a}'.",
        unexpected_parens: "Don't wrap function literals in parens.",
        unexpected_space_a_b: "Unexpected space between '{a}' and '{b}'.",
        unexpected_typeof_a: "Unexpected 'typeof'. " +
                "Use '===' to compare directly with {a}.",
        uninitialized_a: "Uninitialized '{a}'.",
        unreachable_a: "Unreachable '{a}'.",
        unregistered_property_a: "Unregistered property name '{a}'.",
        unsafe: "Unsafe character '{a}'.",
        unused_a: "Unused '{a}'.",
        use_spaces: "Use spaces, not tabs.",
        var_loop: "Don't declare variables in a loop.",
        var_switch: "Don't declare variables in a switch.",
        wrap_regexp: "Wrap this regexp in parens to avoid confusion.",
        weird_loop: "Weird loop.",
        wrap_immediate: "Wrap an immediate function invocation in " +
                "parentheses to assist the reader in understanding that the " +
                "expression is the result of a function, and not the " +
                "function itself."
    };

// supplant
    var rx_supplant = /\{([^{}]*)\}/g,
// carriage return, carriage return linefeed, or linefeed
        rx_crlf = /\n|\r\n?/,
// unsafe characters that are silently deleted by one or more browsers
        rx_unsafe = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
// identifier
        rx_identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/,
        rx_bad_property = /^_|\$|Sync$|_$/,
// star slash
        rx_star_slash = /\*\//,
// slash star
        rx_slash_star = /\/\*/,
// slash star or ending slash
        rx_slash_star_or_slash = /\/\*|\/$/,
// uncompleted work comment
        rx_todo = /\b(?:todo|TO\s?DO|HACK)\b/,
// tab
        rx_tab = /\t/g,
// directive
        rx_directive = /^(jslint|property|global)\s*(.*)$/,
        rx_directive_part = /^([a-zA-Z$_][a-zA-Z0-9$_]*)\s*(?::\s*(true|false|[0-9]+)\s*)?(?:,\s*)?(.*)$/,
// token (sorry it is so long)
        rx_token = /^((\s+)|([a-zA-Z_$][a-zA-Z0-9_$]*)|[(){}\[\]\?,:;'"~`]|=(?:==?|>)?|\.+|\/[*\/=]?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|[\^%]=?|&[&=]?|\|[|=]?|>{1,3}=?|<<?=?|!={0,2}|(0(?:x[0-9a-fA-F]+|\.[0-9]+(?:e[+\-]?[0-9]+)?)?|[1-9][0-9]*(?:\.[0-9]+)?(?:e[+\-]?[0-9]+)?))(.*)$/,
        rx_token_es6 = /^((\s+)|([a-zA-Z_$][a-zA-Z0-9_$]*)|[(){}\[\]\?,:;'"~`]|=(?:==?|>)?|\.+|\/[*\/=]?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|[\^%]=?|&[&=]?|\|[|=]?|>{1,3}=?|<<?=?|!={0,2}|(0(?:b[01]+|o[0-7]+|x[0-9a-fA-F]+|\.[0-9]+(?:e[+\-]?[0-9]+)?)?|[1-9][0-9]*(?:\.[0-9]+)?(?:e[+\-]?[0-9]+)?))(.*)$/,
// double quote string
        rx_double_quote_string = /^((?:[^\\"]+|\\(?:[\\"\/bfnrt]|u[0-9A-Fa-f]{4}))*)"(.*)$/,
        rx_double_quote_string_es6 = /^((?:[^\\"]+|\\(?:[\\"\/bfnrt]|u(?:\{[0-9A-Fa-f]{1,5}\}|[0-9A-Fa-f]{4})))*)"(.*)$/,
// single quote string
        rx_single_quote_string = /^((?:[^\\']+|\\(?:[\\'\/bfnrt]|u[0-9A-Fa-f]{4}))*)'(.*)$/,
        rx_single_quote_string_es6 = /^((?:[^\\']+|\\(?:[\\'\/bfnrt]|u(?:\{[0-9A-Fa-f]{1,5}\}|[0-9A-Fa-f]{4})))*)'(.*)$/,
// mega
        rx_mega = /`|\$\{/,
        rx_tick = /`/;

    function is_letter(string) {
        return (string >= 'a' && string <= 'z\uffff') ||
                (string >= 'A' && string <= 'Z\uffff');
    }

    function supplant(string, object) {
        return string.replace(rx_supplant, function (found, filling) {
            var replacement = object[filling];
            return replacement !== undefined
            ? replacement
            : found;
        });
    }

    function amble(when) {

// Produce a function that will register task functions that will be called as
// the tree is traversed.

        return function (arity, id, task) {
            var a_set = when[arity], 
                i_set;

// The id parameter is optional. If excluded, the task will be applied to all
// ids.

            if (typeof id !== 'string') {
                task = id;
                id = '(all)';
            }

// If this arity has no registrations yet, then create a set object to hold
// them.

            if (a_set === undefined) {
                a_set = empty();
                when[arity] = a_set;
            }

// If this id has no registrations yet, then create a set array to hold them.

            i_set = a_set[id];
            if (i_set === undefined) {
                i_set = [];
                a_set[id] = i_set;
            }

// Register the task with the arity and the id.

            i_set.push(task);
        };
    }

    var anon = "anonymous", // The guessed name for anonymous functions.
        blockage,           // The current block
        block_stack,
        declared_globals,
        directive_mode,
        early_stop,
        errors,
        fudge,
        functionage,    // The current function
        functions,
        global,
        imports,
        json_mode,
        lines,
        module_mode,
        next_token,
        option,
        postamble,
        posts,
        preamble,
        pres,
        property,
        mega_mode,
        stack,
        syntax,
        token,
        token_nr,
        tokens,
        tenure,
        tree,
        var_mode;

// Error reportage

    function artifact(the_token) {
        if (the_token === undefined) {
            the_token = next_token;
        }
        if (the_token.id === '(string)' || the_token.id === '(number)') {
            return String(the_token.value);
        }
        return the_token.id;
    }

    function artifact_line(the_token) {
        if (the_token === undefined) {
            the_token = next_token;
        }
        return the_token.line + fudge;
    }

    function artifact_from(the_token) {
        if (the_token === undefined) {
            the_token = next_token;
        }
        return the_token.from + fudge;
    }

    function warn_at(code, line, column, a, b, c, d) {
        var warning = {         // ~~
            name: 'JSLintError',
            column: column,
            line: line,
            code: code
        };
        if (a !== undefined) {
            warning.a = a;
        }
        if (b !== undefined) {
            warning.b = b;
        }
        if (c !== undefined) {
            warning.c = c;
        }
        if (d !== undefined) {
            warning.d = d;
        }
        warning.message = supplant(bundle[code] || code, warning);
        errors.push(warning);
        return errors.length === option.maxerr
        ? stop_at('too_many', line, column)
        : warning;
    }

    function stop_at(code, line, column, a, b, c, d) {
        warn_at(code, line, column, a, b, c, d);
        throw warn_at('stopping', line, column);
    }

    function warn(code, the_token, a, b, c, d) {
        if (the_token === undefined) {
            the_token = next_token;
        }
        if (the_token.warning === undefined) {
            the_token.warning = warn_at(
                code,
                the_token.line,
                the_token.from,
                a || artifact(the_token),
                b,
                c,
                d
            );
            return the_token.warning;
        }
    }

    function stop(code, the_token, a, b, c, d) {
        if (the_token === undefined) {
            the_token = next_token;
        }
        the_token.warning = undefined;
        warn(code, the_token, a, b, c, d);
        the_token.warning = undefined;
        throw warn('stopping', the_token, a, b, c, d);
    }

// Tokenize

    function make_tokens(source) {
        lines = Array.isArray(source)
        ? source
        : source.split(rx_crlf);
        tokens = [];

        var column = 0,
            from,
            line = -1,
            previous = global,
            prior = global,
            mega_from,
            mega_line,
            rx = option.es6
            ? rx_token_es6
            : rx_token,
            snippet,
            source_line;

        function next_line() {

// Put the next line of source in source_line. If the line contains tabs,
// replace them with spaces and give a warning. Also warn if the line contains
// unsafe characters or is too long.

            var at;
            column = 0;
            line += 1;
            source_line = lines[line];
            if (source_line !== undefined) {
                at = source_line.search(rx_tab);
                if (at >= 0) {
                    if (!option.white) {
                        warn_at('use_spaces', line, at + 1);
                    }
                    source_line = source_line.replace(rx_tab, ' ');
                }
                at = source_line.search(rx_unsafe);
                if (at >= 0) {
                    warn_at(
                        'unsafe', 
                        line, 
                        column + at, 
                        'U+' + source_line.charCodeAt(at).toString(16)
                    );
                }
                if (option.maxlen && option.maxlen < source_line.length) {
                    warn_at('too_long', line, source_line.length);
                }
            }
            return source_line;
        }

        function make(id, value, identifier) {

// Make the token object and append it to the tokens list.

            var the_token = {
                id: id,
                identifier: !!identifier,
                from: from,
                thru: column,
                line: line
            };
            tokens.push(the_token);
            if (id !== '(comment)') {
                directive_mode = false;
            }

// If the token is to have a value, give it one.

            if (value !== undefined) {
                the_token.value = value;
            }

// If this token is an identifier that touches a preceding number, or
// a '/', comment, or regular expression literal that touches a preceding
// comment or regular expression literal, then give a missing space warning.
// This warning is not suppressed by option.white.

            if (
                previous.line === line &&
                previous.thru === from &&
                (
                    (
                        previous.id === '(number)' &&
                        (identifier || id === '(number)' || id === '.')
                    ) ||
                    (
                        (
                            id === '(comment)' ||
                            id === '(regexp)' ||
                            id === '/'
                        ) &&
                        (
                            previous.id === '(comment)' ||
                            previous.id === '(regexp)'
                        )
                    )
                )
            ) {
                warn(
                    'expected_space_a_b',
                    the_token,
                    artifact(previous),
                    artifact(the_token)
                );
            }
            if (prior.id === '.' && the_token.identifier) {
                the_token.dot = true;
            }

// The token will be the next previous token that is used to detect adjacency
// issues.

            previous = the_token;

// The prior token is a previous token that was not a comment. The prior token
// is used to disambiguate '/'.

            if (previous.id !== '(comment)') {
                prior = previous;
            }
            return the_token;
        }

        function directive(the_comment, body) {
            var result = body.match(rx_directive_part);
            if (result) {
                var allowed,
                    name = result[1],
                    value = result[2];
                switch (the_comment.directive) {
                case 'jslint':
                    allowed = allowed_option[name];
                    switch (typeof allowed) {
                    case 'boolean':
                        switch (value) {
                        case 'true':
                        case '':
                        case undefined:
                            option[name] = true;
                            break;
                        case 'false':
                            option[name] = false;
                            break;
                        default:
                            warn('bad_option_a', the_comment, name + ':' + value);
                        }
                        break;
                    case 'number':
                        if (isFinite(+value)) {
                            option[name] = +value;
                        } else {
                            warn('bad_option_a', the_comment, name + ':' + value);
                        }
                        break;
                    case 'object':
                        option[name] = true;
                        populate(declared_globals, allowed, false);
                        break;
                    default:
                        warn('bad_option_a', the_comment, name);
                    }
                    break;
                case 'property':
                    if (tenure === undefined) {
                        tenure = empty();
                    }
                    tenure[name] = true;
                    break;
                case 'global':
                    if (value) {
                        warn('bad_option_a', the_comment, name + ':' + value);
                    }
                    declared_globals[name] = false;
                    module_mode = false;
                    break;
                }
                return directive(the_comment, result[3]);
            }
            if (body) {
                return stop('bad_directive_a', the_comment, body);
            }
        }

        function comment(snippet) {
            var the_comment = make('(comment)', snippet), 
                result;
            if (json_mode) {
                warn('unexpected_comment', the_comment);
            } else if (!option.devel && rx_todo.test(snippet)) {
                warn('todo_comment', the_comment);
            }
            if (Array.isArray(snippet)) {
                snippet = snippet.join(' ');
            }
            result = snippet.match(rx_directive);
            if (result) {
                if (!directive_mode) {
                    warn_at('misplaced_directive_a', line, from, result[1]);
                } else {
                    the_comment.directive = result[1];
                    directive(the_comment, result[2]);
                }
            }
            return the_comment;
        }

        function regexp() {
            var capture = '', 
                char, 
                flag, 
                result, 
                u_mode = false, 
                value;

            function back_char() {
                if (char !== '') {
                    source_line = char + source_line;
                    column -= 1;
                }
            }

            function next_char(match) {

// Get the next character from the source line.

                if (match !== undefined && char !== match) {
                    return stop_at('expected_a_b', line, column, match, char);
                }
                char = source_line.charAt(0);
                if (char !== '') {
                    column += 1;
                    source_line = source_line.slice(1);
                    capture += char;
                }
                return char;
            }

            function digit() {
                if (char >= '0' && char <= '9') {
                    next_char();
                    return true;
                }
                return false;
            }

            function hexdigit() {
                if (
                    (char >= '0' && char <= '9') ||
                    (char >= 'a' && char <= 'f') ||
                    (char >= 'A' && char <= 'F')
                ) {
                    next_char();
                    return true;
                }
                return false;
            }

            function escape() {
                if (is_letter(char)) {
                    var hexes;
                    switch (char) {
                    case 'B':
                    case 'b':
                    case 'D':
                    case 'd':
                    case 'f':
                    case 'n':
                    case 'r':
                    case 'S':
                    case 's':
                    case 't':
                    case 'W':
                    case 'w':
                        break;
                    case 'u':
                        next_char();
                        if (char === '{') {
                            if (!option.es6) {
                                warn_at('es6', line, column);
                            }
                            next_char('{');
                            u_mode = true;
                            hexes = count(hexdigit);
                            if (hexes < 1 || hexes > 5) {
                                warn_at(
                                    'bad_character_number_a',
                                    line,
                                    column,
                                    capture
                                );
                            }
                            next_char('}');
                        } else {
                            if (count(hexdigit) !== 4) {
                                warn_at(
                                    'bad_character_number_a',
                                    line,
                                    column,
                                    capture
                                );
                            }
                        }
                        return;
                    default:
                        warn_at('unexpected_a', line, column, char);
                    }
                }
                if (mega_mode && char === '`') {
                    warn_at('unexpected_a', line, column, char);
                } else if (char === ' ') {
                    warn_at('expected_a_b', line, column, '\\s', '\\ ');
                }
                next_char();
            }

            function quantifier() {
                switch (char) {
                case '?':
                case '*':
                case '+':
                    next_char();
                    break;
                case '{':
                    next_char('{');
                    if (count(digit) === 0) {
                        next_char('0');
                    }
                    if (char === ',') {
                        next_char(',');
                        count(digit);
                    }
                    next_char('}');
                    break;
                default:
                    return;
                }
                if (char === '?') {
                    next_char('?');
                }
            }

            function subklass() {
                switch (char) {
                case '\\':
                    next_char('\\');
                    escape();
                    return true;
                case '[':
                case ']':
                case '/':
                case '^':
                case '-':
                case '':
                    return false;
                case '`':
                    if (mega_mode) {
                        warn_at('unexpected_a', line, column, '`');
                    }
                    next_char();
                    return true;
                case ' ':
                    warn_at('expected_a_b', line, column, '\\s', ' ');
                    next_char();
                    return true;
                default:
                    next_char();
                    return true;
                }
            }

            function range() {
                if (subklass()) {
                    if (char === '-') {
                        next_char('-');
                        if (!subklass()) {
                            return stop_at('bad_range', line, column, capture);
                        }
                    }
                    return range();
                }
            }

            function klass() {
                if (char === '^') {
                    next_char('^');
                }
                range();
                next_char(']');
            }

            function choice() {

                function group() {
                    if (char === '?') {
                        next_char('?');
                        switch (char) {
                        case ':':
                        case '=':
                        case '!':
                            next_char();
                            break;
                        default:
                            next_char(':');
                        }
                    } else if (char === ':') {
                        warn_at('expected_a_b', line, column, '?:', ':');
                    }
                    choice();
                    next_char(')');
                }

                function factor() {
                    switch (char) {
                    case '[':
                        next_char('[');
                        klass();
                        return true;
                    case '\\':
                        next_char('\\');
                        escape();
                        return true;
                    case '(':
                        next_char('(');
                        group();
                        return true;
                    case '/':
                    case '|':
                    case ']':
                    case ')':
                    case '}':
                    case '{':
                    case '?':
                    case '+':
                    case '*':
                    case '':
                        return false;
                    case '`':
                        if (mega_mode) {
                            warn_at('unexpected_a', line, column, '`');
                        }
                        next_char();
                        return true;
                    case ' ':
                        warn_at('expected_a_b', line, column, '\\s', ' ');
                        next_char();
                        return true;
                    default:
                        next_char();
                        return true;
                    }
                }

                function sequence(follow) {
                    if (factor()) {
                        quantifier();
                        return sequence(true);
                    }
                    if (!follow) {
                        warn_at('expected_regexp_factor_a', line, column, char);
                    }
                }

                sequence();
                if (char === '|') {
                    next_char();
                    return choice();
                }
            }

// Scan the regexp literal.

            next_char();
            choice();

// Make sure there is a closing slash.

            value = capture.slice(0, -1);
            next_char('/');

// Process dangling flag letters.

            flag = {
                g: false,
                i: false,
                m: false
            };
            if (option.es6) {
                flag.u = false;
                flag.y = false;
            }
            (function make_flag() {
                if (is_letter(char)) {
                    if (flag[char] !== false) {
                        return stop_at('unexpected_a', line, column, char);
                    }
                    flag[char] = true;
                    next_char();
                    return make_flag();
                }
            }());
            if (u_mode && !flag.u) {
                warn_at('expected_a_b', line, column, 'u', char);
            }
            back_char();
            if (char === '/' || char === '*') {
                return stop_at('unexpected_a', line, from, char);
            }
            result = make('(regexp)', char);
            result.value = value;
            result.flag = flag;
            return result;
        }

        function string(quote, rx) {
            var the_token, 
                result = source_line.match(rx);

// result[1] string contents
// result[2] rest

            if (!result) {
                return stop_at(
                    'bad_string',
                    line,
                    column,
                    source_line.charAt(0)
                );
            }
            snippet = result[1];
            column += snippet.length + 1;
            source_line = result[2];
            the_token = make('(string)', snippet);
            the_token.quote = quote;
            if (mega_mode && rx_tick.test(snippet)) {
                warn('unexpected_a', the_token, '`');
            }
            return the_token;
        }

        function lex() {
            var array, 
                i, 
                j, 
                last, 
                result, 
                the_token;
            if (!source_line) {
                source_line = next_line();
                from = 0;
                return source_line === undefined
                ? mega_mode
                    ? stop_at('unclosed_mega', mega_line, mega_from)
                    : make('(end)')
                : lex();
            }
            from = column;
            result = source_line.match(rx);

// result[1] token
// result[2] whitespace
// result[3] identifier
// result[4] number
// result[5] rest

            if (!result) {
                return stop_at('unexpected_char_a', line, column, source_line.charAt(0));
            }

            snippet = result[1];
            column += snippet.length;
            source_line = result[5];
            if (result[2]) {
                return lex();
            }
            if (result[3]) {
                return make(snippet, undefined, true);
            }
            if (result[4]) {
                the_token = make('(number)', snippet);
                return the_token;
            }
            switch (snippet) {
            case '\'':
                if (json_mode) {
                    warn_at('unexpected_a', line, column, '\'');
                }
                return string('\'', option.es6
                ? rx_single_quote_string_es6
                : rx_single_quote_string);
            case '"':
                return string('"', option.es6
                ? rx_double_quote_string_es6
                : rx_double_quote_string);
            case '`':
                if (mega_mode) {
                    return stop_at('expected_a_b', line, column, '}', '`');
                }
                snippet = '';
                mega_from = from;
                mega_line = line;
                mega_mode = true;

// Parsing a mega literal is tricky. First make a ` token.

                make('`');
                from += 1;

// Then loop, building up a string, possibly from many lines, until seeing
// the end of file, a closing `, or a ${ indicting an expression within the
// string.

                (function part() {
                    var at = source_line.search(rx_mega);

// If neither ` nor ${ is seen, then the whole line joins the snippet.

                    if (at < 0) {
                        snippet += source_line + '\n';
                        return next_line() === undefined
                        ? stop_at('unclosed_mega', mega_line, mega_from)
                        : part();
                    }

// if either ` or ${ was found, then the preceding joins the snippet to become
// a string token.

                    snippet += source_line.slice(0, at);
                    column += at;
                    source_line = source_line.slice(at);
                    make('(string)', snippet).quote = '`';
                    snippet = '';

// If ${, then make tokens that will become part of an expression until
// a } token is made.

                    if (source_line.charAt(0) === '$') {
                        column += 2;
                        make('${');
                        source_line = source_line.slice(2);
                        (function expr() {
                            var id = lex().id;
                            if (id === '{') {
                                return stop_at(
                                    'expected_a_b',
                                    line,
                                    column,
                                    '}',
                                    '{'
                                );
                            }
                            if (id !== '}') {
                                return expr();
                            }
                        }());
                        return part();
                    }
                }());
                source_line = source_line.slice(1);
                column += 1;
                mega_mode = false;
                return make('`');
            case '//':
                snippet = source_line;
                source_line = '';
                the_token = comment(snippet);
                if (mega_mode) {
                    warn('unexpected_comment', the_token, '`');
                }
                return the_token;
            case '/*':
                array = [];
                if (source_line.charAt(0) === '/') {
                    warn_at('unexpected_a', line, column + i, '/');
                }
                (function next() {
                    if (source_line > '') {
                        i = source_line.search(rx_star_slash);
                        if (i >= 0) {
                            return;
                        }
                        j = source_line.search(rx_slash_star);
                        if (j >= 0) {
                            warn_at('nested_comment', line, column + j);
                        }
                    }
                    array.push(source_line);
                    source_line = next_line();
                    if (source_line === undefined) {
                        return stop_at('unclosed_comment', line, column);
                    }
                    return next();
                }());
                snippet = source_line.slice(0, i);
                j = snippet.search(rx_slash_star_or_slash);
                if (j >= 0) {
                    warn_at('nested_comment', line, column + j);
                }
                array.push(snippet);
                column += i + 2;
                source_line = source_line.slice(i + 2);
                return comment(array);
            case '/=':

// The /= operator can look like a rarely used divide and assign operator,
// or like part of a regular expression literal. It is dangerously ambiguous.

                return stop_at('slash_equal', line, from);
            case '/':

// The / can be a division operator or the beginning of a regular expression
// literal. It is not possible to know which without doing a complete parse.
// We want to complete the tokenization before we begin to parse, so we will
// estimate. This estimator can fail in some cases. For example, it cannot
// know if '}' is ending a block or ending an object literal, so it can
// behave incorrectly in that case; it is not meaningful to divide an
// object, so it is likely that we can get away with it. We avoided the worst
// cases by eliminating automatic semicolon insertion.

                if (prior.identifier) {
                    if (!prior.dot) {
                        switch (prior.id) {
                        case 'return':
                            return regexp();
                        case '(begin)':
                        case 'case':
                        case 'delete':
                        case 'in':
                        case 'instanceof':
                        case 'new':
                        case 'typeof':
                        case 'void':
                        case 'yield':
                            the_token = regexp();
                            return stop('unexpected_a', the_token);
                        }
                    }
                } else {
                    last = prior.id.charAt(prior.id.length - 1);
                    if ('(,=:?['.indexOf(last) >= 0) {
                        return regexp();
                    }
                    if ('!&|{};~+-*%/^<>'.indexOf(last) >= 0) {
                        the_token = regexp();
                        warn('wrap_regexp', the_token);
                        return the_token;
                    }
                }
                break;
            }
            return make(snippet);
        }

        while (true) {
            if (lex().id === '(end)') {
                break;
            }
        }
    }

// Parsing

// The process of tree making links the tokens together. A token may be given
// any of these properties:

//      arity       string
//      label       identifier
//      name        identifier
//      expression  expressions
//      block       statements
//      else        statements (else, default, catch)
//      finally     statements

// Specialized tokens may have additional properties.

    syntax = empty();

    function survey(name) {
        var id = name.id;

// Tally the property name. If it is a string, only tally strings that conform
// to the identifier rules.

        if (id === '(string)') {
            id = name.value;
            if (!rx_identifier.test(id)) {
                return id;
            }
        } else if (!name.identifier) {
            return stop('expected_identifier_a', name);
        }

// If we have seen this name before, increment its count.

        if (typeof property[id] === 'number') {
            property[id] += 1;

// If this is the first time seeing this property name, then if there is a
// tenure list, then it must be on the list. Otherwise, it must conform to
// the rules for good property names.

        } else {
            if (tenure !== undefined) {
                if (tenure[id] !== true) {
                    warn('unregistered_property_a', name);
                }
            } else {
                if (rx_bad_property.test(id)) {
                    warn('bad_property_a', name);
                }
            }
            property[id] = 1;
        }
        return id;
    }

    function dispense(skip_comments) {
        var cadet = tokens[token_nr];
        token_nr += 1;
        return skip_comments && cadet.id === '(comment)'
        ? dispense(skip_comments)
        : cadet;
    }

    function lookahead() {
        var old_token_nr = token_nr,
            cadet = dispense(true);
        token_nr = old_token_nr;
        return cadet;
    }

    function advance(id, match) {

// Produce the next token.

// Attempt to give helpful names to anonymous functions.

        if (token.identifier && token.id !== 'function') {
            anon = token.id;
        } else if (token.id === '(string)' && rx_identifier.test(token.value)) {
            anon = token.value;
        }

// Attempt to match next_token with an expected id.

        if (id !== undefined && next_token.id !== id) {
            if (match !== undefined) {
                return stop(
                    'expected_a_b_from_c_d',
                    next_token,
                    id,
                    artifact(match),
                    artifact_line(match),
                    artifact(next_token)
                );
            }
            return stop('expected_a_b', next_token, id, artifact());
        }

// Promote the tokens, skipping comments.

        token = next_token;
        next_token = dispense(!json_mode);
        if (next_token.id === '(end)') {
            token_nr -= 1;
        }
    }

    function enroll(name, role, readonly) {
        var id = name.id, 
            earlier;
        if (syntax[id] !== undefined && id !== 'ignore') {
            warn('reserved_a', name);
        } else {
            earlier = functionage.context[id];
            if (earlier !== undefined) {
                if (earlier.role === 'variable' && id === 'ignore') {
                    warn('unexpected_a', name);
                }
                if (role !== 'exception' || id !== 'ignore') {
                    warn(
                        'redefinition_a_b',
                        name,
                        name.id,
                        earlier.line + fudge
                    );
                }
            }
        }
        functionage.context[id] = name;
        name.dead = true;
        name.function = functionage;
        name.init = false;
        name.role = role;
        name.used = 0;
        name.writable = !readonly;
    }

    function expression(rbp, initial) {

// This is the heart of the Pratt parser. I retained Pratt's nomenclature.
// They are elements of the parsing method called Top Down Operator Precedence.

// nud     Null denotation
// led     Left denotation
// lbp     Left binding power
// rbp     Right binding power

        var left, 
            the_symbol;
        if (!initial) {
            advance();
        }
        the_symbol = syntax[token.id];
        if (the_symbol !== undefined && the_symbol.nud !== undefined) {
            left = the_symbol.nud();
        } else if (token.identifier) {
            left = token;
            left.arity = 'variable';
        } else {
            return stop('unexpected_a', token);
        }
        (function right() {
            the_symbol = syntax[next_token.id];
            if (
                the_symbol !== undefined &&
                the_symbol.led !== undefined &&
                rbp < the_symbol.lbp
            ) {
                advance();
                left = the_symbol.led(left);
                return right();
            }
        }());
        return left;
    }

    function condition() {
        var the_paren = next_token, 
            the_value;
        the_paren.free = true;
        advance('(');
        the_value = expression(0);
        advance(')');
        if (the_value.wrapped === true) {
            warn('unexpected_a', the_paren);
        }
        switch (the_value.id) {
        case '~':
        case '&':
        case '|':
        case '^':
        case '<<':
        case '>>':
        case '>>>':
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case 'typeof':
        case '(number)':
        case '(string)':
            warn('unexpected_a', the_value);
            break;
        }
        return the_value;
    }

    function semicolon() {
        if (next_token.id === ';') {
            advance(';');
        } else {
            warn_at(
                'expected_a_b',
                token.line,
                token.thru,
                ';',
                artifact(next_token)
            );
        }
    }

    function statement() {
        var the_label, 
            the_statement, 
            the_symbol;
        advance();
        if (token.identifier && next_token.id === ':') {
            the_label = token;
            if (the_label.id === 'ignore') {
                warn('unexpected_a', the_label);
            }
            advance(':');
            switch (next_token.id) {
            case 'while':
            case 'switch':
            case 'do':
            case 'for':
                next_token.label = the_label;
                enroll(the_label, 'label', true);
                the_label.init = true;
                the_statement = statement();
                return the_statement;
            default:
                warn('unexpected_label_a', the_label);
            }
        }

// Parse the statement.

        token.statement = true;
        the_symbol = syntax[token.id];
        if (the_symbol !== undefined && the_symbol.fud !== undefined) {
            the_symbol.statement = true;
            the_symbol.disrupt = false;
            return the_symbol.fud();
        }

// It is an expression statement.

        the_statement = expression(0, true);
        semicolon();
        return the_statement;
    }

    function statements() {
        var array = [], 
            a_statement;
        (function next(disrupt) {
            switch (next_token.id) {
            case '(end)':
            case '}':
            case 'case':
            case 'default':
            case 'else':
                break;
            default:
                a_statement = statement();
                array.push(a_statement);
                if (disrupt) {
                    warn('unreachable_a', a_statement);
                }
                return next(a_statement.disrupt);
            }
        }(false));
        return array;
    }

    function not_top_level(thing) {
        if (functionage.global) {
            warn('unexpected_at_top_level_a', thing);
        }
    }

    function top_level_only(the_thing) {
        if (blockage.global !== true) {
            warn('misplaced_a', the_thing);
        }
    }

    function block(special) {
        var stmts, 
            the_block;

// A block is a sequence of statements wrapped in braces.

        advance('{');
        the_block = token;
        the_block.arity = 'statement';
        the_block.body = special === 'body';

// All top level function bodies should include the 'use strict' pragma unless
// the whole file is strict.

        if (the_block.body && stack.length <= 1 && !global.strict) {
            if (
                next_token.id === '(string)' || 
                next_token.value === 'use strict'
            ) {
                next_token.statement = true;
                functionage.strict = true;
                advance();
                advance(';');
            } else {
                warn(
                    'expected_a_b',
                    next_token,
                    next_token.id === '`'
                    ? '\''
                    : 'use strict',
                    artifact(next_token)
                );
            }
        }
        stmts = statements();
        the_block.block = stmts;
        if (stmts.length === 0) {
            if (!option.devel && special !== 'ignore') {
                warn('empty_block', the_block);
            }
            the_block.disrupt = false;
        } else {
            the_block.disrupt = stmts[stmts.length - 1].disrupt;
        }
        advance('}');
        return the_block;
    }

    function symbol(id, bp) {
        var the_symbol = syntax[id];
        if (the_symbol === undefined) {
            the_symbol = empty();
            the_symbol.id = id;
            the_symbol.lbp = bp || 0;
            syntax[id] = the_symbol;
        }
        return the_symbol;
    }

    function constant(id, type, value) {
        var the_symbol = symbol(id);
        the_symbol.nud = typeof value === 'function' 
        ? value 
        : function () {
            if (value !== undefined) {
                token.value = value;
            }
            return token;
        };
        the_symbol.type = type;
        the_symbol.value = value;
        return the_symbol;
    }

    function mutation_check(the_thing) {

// The only expressions that may be assigned to are
//      a.b
//      a[b]
//      v

        if (
            the_thing.id !== '.' &&
            (the_thing.id !== '[' || the_thing.arity !== 'binary') &&
            the_thing.arity !== 'variable'
        ) {
            warn('bad_assignment_a', the_thing);
            return false;
        }
        return true;
    }

    function left_check(left, right) {

// Warn if the left is not one of these:
//      a.b
//      a[b]
//      a()
//      identifier

        var id = left.id;
        if (
            !left.identifier &&
            (
                left.arity !== 'binary' ||
                (id !== '.' && id !== '(' && id !== '[')
            )
        ) {
            warn('unexpected_a', right);
            return false;
        }
        return true;
    }

    function prefix(id, f) {
        var the_symbol = symbol(id);
        the_symbol.nud = function () {
            var the_token = token;
            the_token.arity = 'unary';
            if (typeof f === 'function') {
                return f();
            }
            the_token.expression = expression(150);
            return the_token;
        };
        return the_symbol;
    }

    function pre(id) {
        var the_symbol = symbol(id);
        the_symbol.nud = function () {
            var the_token = token;
            the_token.arity = 'pre';
            the_token.expression = expression(150);
            mutation_check(the_token.expression);
            return the_token;
        };
        return the_symbol;
    }

    function post(id) {
        var the_symbol = symbol(id, 150);
        the_symbol.led = function (left) {
            token.expression = left;
            token.arity = 'post';
            mutation_check(token.expression);
            return token;
        };
        return the_symbol;
    }

    function infix(id, bp, f) {
        var the_symbol = symbol(id, bp);
        the_symbol.led = function (left) {
            var the_token = token;
            the_token.arity = 'binary';
            if (f !== undefined) {
                return f(left);
            }
            the_token.expression = [left, expression(bp)];
            return the_token;
        };
        return the_symbol;
    }

    function assignment(id) {
        var the_symbol = symbol(id, 20);
        the_symbol.led = function (left) {
            var the_token = token, 
                right;
            the_token.arity = 'assignment';
            right = expression(20 - 1);
            if (id === '=' && left.arity === 'variable') {
                the_token.names = left;
                the_token.expression = right;
            } else {
                the_token.expression = [left, right];
            }
            switch (right.arity) {
            case 'assignment':
            case 'pre':
            case 'post':
                warn('unexpected_a', right);
                break;
            }
            mutation_check(left);
            return the_token;
        };
        return the_symbol;
    }

    function ternary(id1, id2) {
        var the_symbol = symbol(id1, 30);
        the_symbol.led = function (left) {
            var the_token = token,
                second = expression(20);
            advance(id2);
            token.arity = 'ternary';
            the_token.arity = 'ternary';
            the_token.expression = [left, second, expression(10)];
            return the_token;
        };
        return the_symbol;
    }

    function stmt(id, f) {
        var the_symbol = symbol(id);
        the_symbol.fud = function () {
            token.arity = 'statement';
            return f();
        };
        return the_symbol;
    }

    posts = empty();
    pres = empty();
    preamble = amble(pres);
    postamble = amble(posts);

    function walk_expression(thing) {
        if (thing) {
            if (Array.isArray(thing)) {
                thing.forEach(walk_expression);
            } else {
                do_it(thing, pres);
                walk_expression(thing.expression);
                if (thing.id === 'function') {
                    walk_statement(thing.block);
                }
                switch (thing.arity) {
                case 'post':
                case 'pre':
                    warn('unexpected_expression_a', thing);
                    break;
                case 'statement':
                case 'assignment':
                    warn('unexpected_statement_a', thing);
                    break;
                }
                do_it(thing, posts);
            }
        }
    }

    function walk_statement(thing) {
        if (thing) {
            if (Array.isArray(thing)) {
                thing.forEach(walk_statement);
            } else {
                do_it(thing, pres);
                walk_expression(thing.expression);
                switch (thing.arity) {
                case 'statement':
                case 'assignment':
                    break;
                case 'binary':
                    if (thing.id !== '(') {
                        warn('unexpected_expression_a', thing);
                    }
                    break;
                default:
                    warn('unexpected_expression_a', thing);
                }
                walk_statement(thing.block);
                walk_statement(thing.else);
                do_it(thing, posts);
            }
        }
    }

    function lookup(thing) {
        if (thing.arity === 'variable') {

// Look up the variable in the current context.

            var the_variable = functionage.context[thing.id];

// If it isn't local, search all the other contexts. If it is found, add it

            if (the_variable === undefined) {
                stack.forEach(function (outer) {
                    var a_variable = outer.context[thing.id];
                    if (
                        a_variable !== undefined &&
                        a_variable.role !== 'label'
                    ) {
                        the_variable = a_variable;
                    }
                });
                if (the_variable === undefined) {
                    if (declared_globals[thing.id] === undefined) {
                        warn('undeclared_a', thing);
                        return;
                    }

// If is isn't in any of those either, perhaps it is a predefined global.
// If so, add it to the global context.

                    the_variable = {
                        dead: false,
                        function: global,
                        id: thing.id,
                        init: true,
                        role: 'variable',
                        used: 0,
                        writable: false
                    };
                    global[thing.id] = the_variable;
                }
                the_variable.closure = true;
                functionage.context[thing.id] = the_variable;
            } else if (the_variable.role === 'label') {
                warn('label_a', thing);
            }
            if (the_variable.dead && the_variable.function === functionage) {
                warn('out_of_scope_a', thing);
            }
            return the_variable;
        }
    }

    symbol('}');
    symbol(')');
    symbol(']');
    symbol(',');
    symbol(';');
    symbol(':');
    symbol('*/');
    symbol('await');
    symbol('case');
    symbol('catch');
    symbol('class');
    symbol('default');
    symbol('else');
    symbol('enum');
    symbol('export');
    symbol('finally');
    symbol('implements');
    symbol('interface');
    symbol('package');
    symbol('private');
    symbol('protected');
    symbol('public');
    symbol('static');
    symbol('super');
    symbol('void');
    symbol('with');
    symbol('yield');

    constant('(number)', 'number');
    constant('(regexp)', 'regexp');
    constant('(string)', 'string');
    constant('arguments', 'object', function () {
        warn('unexpected_a', token);
        return token;
    });
    constant('eval', 'function', function () {
        if (!option.eval) {
            warn('unexpected_a', token);
        }
        return token;
    });
    constant('false', 'boolean', false);
    constant('Infinity', 'number', Infinity);
    constant('NaN', 'number', NaN);
    constant('null', 'null', null);
    constant('true', 'boolean', true);
    constant('undefined', 'undefined', undefined);
    constant('this', 'object', function () {
        if (!option.this) {
            warn('unexpected_a', token);
        }
        return token;
    });
    constant('ignore', 'undefined', function () {
        warn('unexpected_a', token);
        return token;
    });

    assignment('=');
    assignment('+=');
    assignment('-=');
    assignment('*=');
    assignment('/=');
    assignment('%=');
    assignment('&=');
    assignment('|=');
    assignment('^=');
    assignment('<<=');
    assignment('>>=');
    assignment('>>>=');
    
    function init_variable(name) {
        var the_variable = lookup(name);
        if (the_variable !== undefined) {
            if (the_variable.writable) {
                the_variable.init = true;
                return;
            }
        }
        warn('bad_assignment_a', name);
    }

    postamble('assignment', '=', function (thing) {
        
// Assignment using = sets the init property of a variable. No other assignment
// operator can do this. A = token keeps that variable (or array of variables 
// in case of destructuring) in its name property.        
        
        if (thing.names !== undefined) {
            if (Array.isArray(thing.names)) {
                thing.names.forEach(init_variable);
            } else {
                init_variable(thing.names);
            }
        }
    });

    ternary('?', ':');
    
    infix('||', 40);
    
    preamble('binary', '||', function (thing) {
        thing.expression.forEach(function (thang) {
            if (thang.id === '&&' && !thang.wrapped) {
                warn('and', thang);
            }
        });
    });
    
    infix('&&', 50);
    infix('|', 70);
    infix('^', 80);
    infix('&', 90);
    infix('==', 100);
    infix('===', 100);
    infix('!=', 100);
    infix('!==', 100);
    infix('<', 110);
    infix('>', 110);
    infix('<=', 110);
    infix('>=', 110);
    infix('in', 110);
    infix('instanceof', 110);
    infix('<<', 120);
    infix('>>', 120);
    infix('>>>', 120);
    infix('+', 130);
    infix('-', 130);
    infix('*', 140);
    infix('/', 140);
    infix('%', 140);

    post('--');
    pre('--');

    post('++');
    pre('++');

    prefix('+');
    prefix('-');
    prefix('~');
    prefix('!');
    prefix('!!');
    prefix('new', function () {
        var the_new = token;
        next_token.new = the_new;
        the_new.expression = expression(150);
        if (the_new.expression.id !== '(') {
            warn('expected_a_b', next_token, '()', artifact(next_token));
        }
        return the_new;
    });
    prefix('typeof');
    prefix('void', function () {
        var the_void = token;
        warn('unexpected_a', the_void);
        the_void.expression = expression(0);
        return the_void;
    });
    
    function bitwise_check(thing) {
        if (!option.bitwise && bitwiseop[thing.id] === true) {
            warn('unexpected_a', thing);
        }
    }

    preamble('binary', function relation_check(thing) {
        if (relationop[thing.id] === true) {
            if (
                thing.expression[0].id === 'NaN' || 
                thing.expression[1].id === 'NaN'
            ) {
                warn('isNaN', thing);
            } else if (thing.expression[0].id === 'typeof') {
                if (thing.expression[1].id !== '(string)') {
                    warn('expected_string_a', expression[1]);
                } else {
                    var value = thing.expression[1].value;
                    if (value === 'symbol') {
                        if (!option.es6) {
                            warn('es6', thing.expression[1], value);
                        }
                    } else if (value === 'null' || value === 'undefined') {
                        warn('unexpected_typeof_a', thing.expression[1], value);
                    } else if (
                        value !== 'boolean' && 
                        value !== 'function' && 
                        value !== 'number' && 
                        value !== 'object' && 
                        value !== 'string'
                    ) {
                        warn('expected_type_string_a', expression[1], value);
                    }
                }
            }
        }
    });
    
    preamble('binary', bitwise_check);
    preamble('unary', bitwise_check);
    preamble('assignment', bitwise_check);

    infix('(', 160, function (left) {
        var the_paren = token, 
            the_argument;
        if (left.id !== 'function') {
            left_check(left, the_paren);
        }
        the_paren.free = false;
        the_paren.expression = [left];
        if (left.identifier) {
            if (left.new) {
                if (
                    left.id.charAt(0) > 'Z' || 
                    left.id === 'Boolean' || 
                    left.id === 'Number' || 
                    left.id === 'String'
                ) {
                    warn('unexpected_a', left.new);
                } else if (left.id === 'Function') {
                    if (!option.eval) {
                        warn('unexpected_a', left, 'new Function');
                    }
                } else if (left.id === 'Array') {
                    warn('expected_a_b', left, '[]', 'new Array');
                } else if (left.id === 'Object') {
                    warn(
                        'expected_a_b', 
                        left, 
                        'Object.create(null)', 
                        'new Object'
                    );
                }
            } else {
                if (
                    left.id.charAt(0) <= 'Z' && 
                    left.id !== 'Boolean' && 
                    left.id !== 'Number' && 
                    left.id !== 'String'
                ) {
                    warn(
                        'expected_a_before_b', 
                        left, 
                        'new', 
                        artifact(left)
                    );
                }
                if (functionage.arity === 'statement') {
                    functionage.name.calls[left.id] = left;
                }
            }
        }
        if (next_token.id !== ')') {
            (function next() {
                the_argument = expression(10);
                the_paren.expression.push(the_argument);
                if (next_token.id === ',') {
                    advance(',');
                    return next();
                }
            }());
        }
        advance(')', the_paren);
        if (the_paren.expression.length === 2) {
            if (the_argument.wrapped === true) {
                warn('unexpected_a', the_paren);
            } 
            if (the_argument.id === '(') {
                the_argument.wrapped = true;
            }
        }
        return the_paren;
    });

    infix('.', 170, function (left) {
        var the_token = token, 
            name = next_token;
        if (
            (left.id !== '(string)' || name.id !== 'indexOf') && 
            (left.id !== '[' || name.id !== 'concat') &&
            (left.id !== '+' || name.id !== 'slice') &&
            (left.id !== '(regexp)' || (
                name.id !== 'exec' && name.id !== 'test'
            ))
        ) {
            left_check(left, the_token);
        }
        if (!name.identifier) {
            stop('expected_identifier_a');
        }
        advance();
        survey(name);

// The property name is not an expression.

        the_token.name = name;
        the_token.expression = left;
        return the_token;
    });

    infix('[', 170, function (left) {
        var the_token = token,
            the_subscript = expression(0);
        if (
            the_subscript.id === '(string)' &&
            rx_identifier.test(the_subscript.value)
        ) {
            warn('subscript_a', the_subscript);
            survey(the_subscript);
        }
        left_check(left, the_token);
        the_token.expression = [left, the_subscript];
        advance(']');
        return the_token;
    });

    prefix('[', function () {
        var the_token = token;
        the_token.expression = [];
        if (next_token.id !== ']') {
            (function next() {
                the_token.expression.push(expression(10));
                if (next_token.id === ',') {
                    advance(',');
                    return next();
                }
            }());
        }
        advance(']');
        return the_token;
    });

    infix('=>', 170, function (left) {
        return stop('expected_a_b', left, '(', artifact(left));
    });

    prefix('=>', function () {
        return stop('expected_a_b', token, '()', '=>');
    });

    stmt(';', function () {
        warn('unexpected_a', token);
        return token;
    });

    stmt('delete', function () {
        var the_token = token, 
            the_value = expression(0);
        if (
            (the_value.id !== '.' && the_value.id !== '[') || 
            the_value.arity !== 'binary'
        ) {
            stop('expected_a_b', the_value, '.', artifact(the_value));
        }
        the_token.expression = the_value;
        semicolon();
        return the_token;
    });


    function do_var() {
        var the_statement = token, 
            is_const = the_statement.id === 'const';
        the_statement.names = [];

// A program may use var or let, but not both, and let and const require
// option.es6.

        if (var_mode === undefined) {
            var_mode = the_statement.id === 'var';
            if (!option.es6 && !var_mode) {
                warn('es6', the_statement);
            }
        } else {
            if (var_mode) {
                if (the_statement.id !== 'var') {
                    warn(
                        'expected_a_b',
                        the_statement,
                        'var',
                        the_statement.id
                    );
                }
            } else {
                if (the_statement.id === 'var') {
                    warn('expected_a_b', the_statement, 'let', 'var');
                }
            }
        }

// We don't expect to see variables created in switch statements.

        if (functionage.switch > 0) {
            warn('var_switch', the_statement);
        }
        if (functionage.loop > 0 && the_statement.id === 'var') {
            warn('var_loop', the_statement);
        }
        (function next() {
            if (next_token.id === '{' && the_statement.id !== 'var') {
                var the_brace = next_token;
                the_brace.names = [];
                advance('{');
                (function pair() {
                    if (!next_token.identifier) {
                        return stop('expected_identifier_a', next_token);
                    }
                    var name = next_token;
                    survey(name);
                    advance();
                    if (next_token.id === ':') {
                        advance(':');
                        if (!next_token.identifier) {
                            return stop('expected_identifier_a', next_token);
                        }
                        next_token.label = name;
                        the_brace.names.push(next_token);
                        enroll(next_token, 'variable', is_const);
                        advance();
                    } else {
                        the_brace.names.push(name);
                        enroll(name, 'variable', is_const);
                    }
                    if (next_token.id === ',') {
                        advance(',');
                        return pair();
                    }
                }());
                advance('}');
                advance('=');
                the_brace.expression = expression();
                the_statement.names.push(the_brace);
            } else if (next_token.id === '[' && the_statement.id !== 'var') {
                var the_bracket = next_token;
                the_bracket.names = [];
                advance('[');
                (function element() {
                    if (!next_token.identifier) {
                        return stop('expected_identifier_a', next_token);
                    }
                    var name = next_token;
                    advance();
                    the_bracket.names.push(name);
                    enroll(name, 'variable', the_statement.id === 'const');
                    if (next_token.id === ',') {
                        advance(',');
                        return element();
                    }
                }());
                advance(']');
                advance('=');
                the_bracket.expression = expression();
                the_statement.names.push(the_bracket);
            } else if (next_token.identifier) {
                var name = next_token;
                advance();
                if (name.id === 'ignore') {
                    warn('unexpected_a', name);
                }
                enroll(name, 'variable', is_const);
                if (next_token.id === '=' || is_const) {
                    advance('=');
                    name.expression = expression(0);
                    name.init = true;
                }
                the_statement.names.push(name);
            } else {
                return stop('expected_identifier_a', next_token);
            }
            if (next_token.id === ',') {
                advance(',');
                return next();
            }
        }());
        the_statement.open = 
                the_statement.names.length > 1 && 
                the_statement.line !== the_statement.names[1].line;
        semicolon();
        return the_statement;
    }

    stmt('var', do_var);
    stmt('let', do_var);
    stmt('const', do_var);
    
    function subactivate(name) {
        name.init = true;
        name.dead = false;
        blockage.live.push(name);
    }

    function activate(name) {
        if (name.expression !== undefined) {
            walk_expression(name.expression);
            if (name.id === '{' || name.id === '[') {
                name.names.forEach(subactivate);
            } else {
                name.init = true;
            }
        }
        name.dead = false;
        blockage.live.push(name);
    }

    function amble_var(thing) {
        thing.names.forEach(activate);
    }

    postamble('statement', 'var', amble_var);
    postamble('statement', 'let', amble_var);
    postamble('statement', 'const', amble_var);

    preamble('variable', function (thing) {
        var the_variable = lookup(thing);
        if (the_variable !== undefined) {
            thing.variable = the_variable;
            the_variable.used += 1;
        }
    });

    function parameter(list) {
        var ellipsis, 
            param;
        if (next_token.id === '{') {
            param = next_token;
            param.names = [];
            advance('{');
            (function subparameter() {
                var subparam = next_token;
                if (!subparam.identifier) {
                    return stop('expected_identifier_a');
                }
                survey(subparam);
                advance();
                if (next_token.id === ':') {
                    advance(':');
                    advance();
                    token.label = subparam;
                    subparam = token;
                }
                param.names.push(subparam);
                if (next_token.id === ',') {
                    advance(',');
                    return subparameter();
                }
            }());
            list.push(param);
            advance('}');
            if (next_token.id === ',') {
                advance(',');
                return parameter(list);
            }
        } else if (next_token.id === '[') {
            param = next_token;
            param.names = [];
            advance('[');
            (function subparameter() {
                var subparam = next_token;
                if (!subparam.identifier) {
                    return stop('expected_identifier_a');
                }
                advance();
                param.names.push(subparam);
                if (next_token.id === ',') {
                    advance(',');
                    return subparameter();
                }
            }());
            list.push(param);
            advance(']');
            if (next_token.id === ',') {
                advance(',');
                return parameter(list);
            }
        } else {
            if (next_token.id === '...') {
                ellipsis = next_token;
                advance('...');
            }
            if (!next_token.identifier) {
                return stop('expected_identifier_a');
            }
            param = next_token;
            param.ellipsis = ellipsis;
            list.push(param);
            advance();
            if (!ellipsis) {
                if (next_token.id === '=') {
                    advance('=');
                    param.expression = expression(0);
                }
                if (next_token.id === ',') {
                    advance(',');
                    return parameter(list);
                }
            }
        }
    }

    function parameter_list() {
        var list = [];
        if (next_token.id !== ')' && next_token.id !== '(end)') {
            parameter(list);
        }
        advance(')');
        return list;
    }

    function do_function(the_function) {
        var name;
        if (the_function === undefined) {
            the_function = token;

// A function statement must have a name that will be in the parent's scope.

            if (the_function.arity === 'statement') {
                if (!next_token.identifier) {
                    return stop('expected_identifier_a', next_token);
                }
                name = next_token;
                enroll(name, 'variable', true);
                the_function.name = name;
                name.init = true;
                name.calls = empty();
                advance();
            } else if (name === undefined) {

// A function expression may have an optional name.

                if (next_token.identifier) {
                    name = next_token;
                    the_function.name = name;
                    advance();
                } else {
                    the_function.name = anon;
                }
            }
        } else {
            name = the_function.name;
        }
        the_function.level = functionage.level + 1;
        if (mega_mode) {
            warn('unexpected_a', the_function);
        }

// Don't make functions in loops. It is inefficient, and it can lead to scoping
// errors.

        if (functionage.loop > 0) {
            warn('function_in_loop', the_function);
        }

// Give the function properties for storing its names and for observing the
// depth of loops and switches.

        the_function.context = empty();
        the_function.loop = 0;
        the_function.switch = 0;

// Push the current function context and establish a new one.

        stack.push(functionage);
        functions.push(the_function);
        functionage = the_function;
        if (the_function.arity !== 'statement' && name) {
            enroll(name, 'variable', true);
            name.dead = false;
            name.init = true;
            name.used = 1;
        }

// Parse the parameter list.

        advance('(');
        token.free = false;
        functionage.parameters = parameter_list();
        functionage.parameters.forEach(function enroll_parameter(name) {
            if (name.identifier) {
                enroll(name, 'parameter', false);
            } else {
                name.names.forEach(enroll_parameter);
            }
        });

// The function's body is a block.

        the_function.block = block('body');
        if (the_function.arity === 'statement' && next_token.line === token.line) {
            return stop('unexpected_a', next_token);
        }

// Restore the previous context.

        functionage = stack.pop();
        return the_function;
    }

    stmt('function', do_function);
    prefix('function', do_function);

    function fart(parameters) {
        advance('=>');
        var the_arrow = token;
        the_arrow.arity = 'binary';
        the_arrow.name = "=>";
        the_arrow.level = functionage.level + 1;
        functions.push(the_arrow);
        if (functionage.loop > 0) {
            warn('function_in_loop', the_arrow);
        }

// Give the function properties storing its names and for observing the depth
// of loops and switches.

        the_arrow.context = empty();
        the_arrow.loop = 0;
        the_arrow.switch = 0;

// Push the current function context and establish a new one.

        stack.push(functionage);
        functionage = the_arrow;
        the_arrow.parameters = parameters;
        parameters.forEach(function (name) {
            enroll(name, 'parameter', true);
        });
        if (next_token.id === '{') {
            return stop('expected_a_b', the_arrow, "function", "=>");
        }
        if (!option.es6) {
            warn('es6', the_arrow);
        }
        the_arrow.expression = expression(0);
        functionage = stack.pop();
        return the_arrow;
    }

    function preamble_function(thing) {
        if (thing.arity === 'statement' && blockage.body !== true) {
            warn('unexpected_a', thing);
        }
        stack.push(functionage);
        block_stack.push(blockage);
        functionage = thing;
        blockage = thing;
        thing.live = [];
        if (typeof thing.name === 'object') {
            thing.name.dead = false;
            thing.name.init = true;
        }
        thing.parameters.forEach(function (name) {
            walk_expression(name.expression);
            if (name.id === '{' || name.id === '[') {
                name.names.forEach(subactivate);
            } else {
                name.dead = false;
                name.init = true;
            }
        });
    }

    function pop_block() {
        blockage.live.forEach(function (name) {
            name.dead = true;
        });
        delete blockage.live;
        blockage = block_stack.pop();
    }

    function postamble_function(thing) {
        delete functionage.loop;
        delete functionage.switch;
        functionage = stack.pop();
        if (thing.wrapped) {
            warn('unexpected_parens', thing);
        }
        return pop_block();
    }

    preamble('statement', 'function', preamble_function);
    postamble('statement', 'function', postamble_function);

    preamble('unary', 'function', preamble_function);
    postamble('unary', 'function', postamble_function);

    preamble('binary', '=>', preamble_function);
    postamble('binary', '=>', postamble_function);

    preamble('binary', '(', function (thing) {
        var left = thing.expression[0];
        if (
            left.identifier &&
            functionage.context[left.id] === undefined &&
            typeof functionage.name === 'object'
        ) {
            var parent = functionage.name.function;
            if (parent) {
                var left_variable = parent.context[left.id];
                if (
                    left_variable !== undefined &&
                    left_variable.dead &&
                    left_variable.function === parent &&
                    left_variable.calls !== undefined &&
                    left_variable.calls[functionage.name.id] !== undefined
                ) {
                    left_variable.dead = false;
                }
            }
        }
    });
    
    postamble('binary', '(', function (thing) {
        if (!thing.wrapped && thing.expression[0].id === 'function') {
            warn('wrap_immediate', thing);
        }
    });

    prefix('(', function () {
        var the_paren = token, 
            the_value, 
            cadet = lookahead().id;

// We can distinguish between a parameter list for => and a wrapped expression
// with one token of lookahead.

        if (
            next_token.id === ')' ||
            next_token.id === '...' ||
            (next_token.identifier && (cadet === ',' || cadet === '='))
        ) {
            the_paren.free = false;
            return fart(parameter_list());
        }
        the_paren.free = true;
        the_value = expression(0);
        if (the_value.wrapped === true) {
            warn('unexpected_a', the_paren);
        }
        the_value.wrapped = true;
        advance(')', the_paren);
        if (next_token.id === "=>") {
            if (the_value.arity !== 'variable') {
                return stop('expected_identifier_a', the_value);
            }
            the_paren.expression = [the_value];
            return fart(the_paren.expression);
        }
        return the_value;
    });

    function do_tick() {
        var the_tick = token;
        if (!option.es6) {
            warn('es6', the_tick);
        }
        the_tick.value = [];
        the_tick.expression = [];
        if (next_token.id !== '`') {
            (function part() {
                advance('(string)');
                the_tick.value.push(token);
                if (next_token.id === '${') {
                    advance('${');
                    the_tick.expression.push(expression(0));
                    advance('}');
                    return part();
                }
            }());
        }
        advance('`');
        return the_tick;
    }

    infix('`', 160, function (left) {
        var the_tick = do_tick();
        left_check(left, the_tick);
        the_tick.expression = [left].concat(the_tick.expression);
        return the_tick;
    });

    prefix('`', do_tick);

    prefix('{', function () {
        var the_brace = token, 
            seen = empty();
        the_brace.expression = [];
        if (next_token.id !== '}') {
            (function member() {
                var name = next_token,
                    id = survey(name),
                    value;
                if (seen[id] === true) {
                    warn('duplicate_a', name);
                } else {
                    seen[id] = true;
                }
                advance();
                if (name.identifier) {
                    switch (next_token.id) {
                    case '}':
                    case ',':
                        if (!option.es6) {
                            warn('es6');
                        }
                        name.arity = 'variable';
                        value = name;
                        break;
                    case '(':
                        if (!option.es6) {
                            warn('es6');
                        }
                        value = do_function({
                            id: 'function',
                            arity: 'binary',
                            name: name
                        }, name);
                        break;
                    default:
                        advance(':');
                        value = expression(0);
                    }
                    value.label = name;
                    the_brace.expression.push(value);
                } else {
                    advance(':');
                    value = expression(0);
                    value.label = name;
                    the_brace.expression.push(value);
                }
                if (next_token.id === ',') {
                    advance(',');
                    return member();
                }
            }());
        }
        advance('}');
        return the_brace;
    });

    stmt('{', function () {
        var the_equal, names = [];
        if (!option.es6) {
            warn('es6', token);
        }
        (function pair() {
            if (!next_token.identifier) {
                return stop('expected_identifier_a', next_token);
            }
            var name = next_token;
            survey(name);
            advance();
            if (next_token.id === ':') {
                advance(':');
                if (!next_token.identifier) {
                    return stop('expected_identifier_a', next_token);
                }
                next_token.arity = 'variable';
                next_token.label = name;
                names.push(next_token);
                advance();
            } else {
                name.arity = 'variable';
                name.label = name;
                names.push(name);
            }
            if (next_token.id === ',') {
                advance(',');
                return pair();
            }
        }());
        advance('}');
        advance('=');
        the_equal = token;
        the_equal.arity = 'assignment';
        the_equal.expression = expression();
        the_equal.names = names;
        semicolon();
        return the_equal;
    });
    
    stmt('[', function () {
        var the_equal, names = [];
        if (!option.es6) {
            warn('es6', token);
        }
        (function element() {
            if (!next_token.identifier) {
                return stop('expected_identifier_a', next_token);
            }
            next_token.arity = 'variable';
            names.push(next_token);
            advance();
            if (next_token.id === ',') {
                advance(',');
                return element();
            }
        }());
        advance(']');
        advance('=');
        the_equal = token;
        the_equal.arity = 'assignment';
        the_equal.expression = expression();
        the_equal.names = names;
        semicolon();
        return the_equal;
    });

    preamble('statement', '{', function (thing) {
        block_stack.push(blockage);
        blockage = thing;
        thing.live = [];
    });

    postamble('statement', '{', pop_block);

    stmt('if', function () {
        var the_else,
            the_if = token;
        the_if.expression = condition();
        the_if.block = block();
        if (next_token.id === 'else') {
            advance('else');
            the_else = token;
            the_if.else = next_token.id === 'if'
            ? statement()
            : block();
            if (the_if.block.disrupt === true) {
                if (the_if.else.disrupt === true) {
                    the_if.disrupt = true;
                } else {
                    warn('unexpected_a', the_else);
                }
            }
        }
        return the_if;
    });

    stmt('try', function () {
        var the_try = token, 
            the_catch;
        the_try.block = block();
        if (next_token.id === 'catch') {
            var ignored = 'ignore';
            the_catch = next_token;
            the_try.catch = the_catch;
            advance('catch');
            advance('(');
            if (!next_token.identifier) {
                return stop('expected_identifier_a', next_token);
            }
            if (next_token.id !== 'ignore') {
                ignored = undefined;
                the_catch.name = next_token;
                enroll(next_token, 'exception', true);
            }
            advance();
            advance(')');
            the_catch.block = block(ignored);
        }
        if (next_token.id === 'finally') {
            advance('finally');
            the_try.else = block();
        }
        return the_try;
    });

    postamble('statement', 'try', function (thing) {
        if (thing.catch !== undefined) {
            var the_name = thing.catch.name;
            if (the_name !== undefined) {
                var the_variable = functionage.context[the_name.id];
                the_variable.dead = false;
                the_variable.init = true;
            }
            walk_statement(thing.catch.block);
        }
    });

    stmt('while', function () {
        var the_while = token;
        not_top_level(the_while);
        functionage.loop += 1;
        the_while.expression = condition();
        the_while.block = block();
        if (the_while.block.disrupt === true) {
            warn('weird_loop', the_while);
        }
        functionage.loop -= 1;
        return the_while;
    });

    stmt('for', function () {
        var first, 
            the_for = token;
        if (!option.for) {
            warn('unexpected_a', the_for);
        }
        not_top_level(the_for);
        functionage.loop += 1;
        advance('(');
        token.free = true;
        if (next_token.id === ';') {
            return stop('expected_a_b', the_for, 'while (', 'for (;');
        }
        first = expression(0);
        if (first.id === 'in') {
            if (first.expression[0].arity !== 'variable') {
                warn('bad_assignment_a', first.expression[0]);
            }
            the_for.name = first.expression[0];
            the_for.expression = first.expression[1];
            warn('expected_a_b', the_for, 'Object.keys', 'for in');
        } else {
            the_for.initial = first;
            advance(';');
            the_for.expression = expression(0);
            advance(';');
            the_for.inc = expression(0);
            if (the_for.inc.id === '++') {
                warn('expected_a_b', the_for.inc, '+= 1', '++');
            }
        }
        advance(')');
        the_for.block = block();
        if (the_for.block.disrupt === true) {
            warn('weird_loop', the_for);
        }
        functionage.loop -= 1;
        return the_for;
    });

    preamble('statement', 'for', function (thing) {
        if (thing.name !== undefined) {
            var the_variable = lookup(thing.name);
            if (the_variable !== undefined) {
                the_variable.init = true;
                if (!the_variable.writable) {
                    warn('bad_assignment_a', thing.name);
                }
            }
        }
        walk_statement(thing.initial);
    });

    postamble('statement', 'for', function (thing) {
        walk_statement(thing.inc);
    });

    stmt('do', function () {
        var the_do = token;
        not_top_level(the_do);
        functionage.loop += 1;
        the_do.block = block();
        advance('while');
        the_do.expression = condition();
        semicolon();
        if (the_do.block.disrupt === true) {
            warn('weird_loop', the_do);
        }
        functionage.loop -= 1;
        return the_do;
    });



    stmt('break', function () {
        var the_break = token, 
            the_label;
        if (functionage.loop < 1 && functionage.switch < 1) {
            warn('unexpected_a', the_break);
        }
        the_break.disrupt = true;
        if (next_token.identifier && token.line === next_token.line) {
            the_label = functionage.context[next_token.id];
            if (the_label === undefined || the_label.role !== 'label') {
                warn('not_label_a');
            } else {
                the_label.used += 1;
            }
            the_break.label = next_token;
            advance();
        }
        advance(';');
        return the_break;
    });

    stmt('continue', function () {
        var the_continue = token;
        if (functionage.loop < 1) {
            warn('unexpected_a', the_continue);
        }
        not_top_level(the_continue);
        the_continue.disrupt = true;
        warn('unexpected_a', the_continue);
        advance(';');
        return the_continue;
    });

    stmt('return', function () {
        var the_return = token;
        not_top_level(the_return);
        the_return.disrupt = true;
        not_top_level();
        if (next_token.id !== ';' && the_return.line === next_token.line) {
            the_return.expression = expression(10);
        }
        advance(';');
        return the_return;
    });

    stmt('throw', function () {
        var the_throw = token;
        the_throw.disrupt = true;
        the_throw.expression = expression(10);
        semicolon();
        return the_throw;
    });

    stmt('debugger', function () {
        var the_debug = token;
        if (!option.devel) {
            warn('unexpected_a', the_debug);
        }
        semicolon();
        return the_debug;
    });

    stmt('switch', function () {
        var stmts,
            the_cases = [],
            the_switch = token;
        not_top_level(the_switch);
        functionage.switch += 1;
        advance('(');
        token.free = true;
        the_switch.expression = expression(0);
        the_switch.block = the_cases;
        advance(')');
        advance('{');
        (function major() {
            var the_case = next_token;
            the_case.arity = 'statement';
            the_case.expression = [];
            (function minor() {
                advance('case');
                token.switch = true;
                the_case.expression.push(expression(0));
                advance(':');
                if (next_token.id === 'case') {
                    return minor();
                }
            }());
            stmts = statements();
            the_case.block = stmts;
            the_cases.push(the_case);
            if (!stmts[stmts.length - 1].disrupt) {
                warn('expected_a_before_b', next_token, 'break;', artifact(next_token));
            }
            if (next_token.id === 'case') {
                return major();
            }
        }());
        if (next_token.id === 'default') {
            advance('default');
            token.switch = true;
            advance(':');
            the_switch.else = statements();
        }
        advance('}', the_switch);
        functionage.switch -= 1;
        return the_switch;
    });

    stmt('export', function () {
        var the_export = token;
        if (!option.es6) {
            warn('es6', the_export);
        }
        module_mode = true;
        advance('default');
        the_export.expression = expression(0);
        semicolon();
        return the_export;
    });

    stmt('import', function () {
        var the_import = token;
        if (!option.es6) {
            warn('es6', the_import);
        }
        module_mode = true;
        if (!next_token.identifier) {
            return stop('expected_identifier_a');
        }
        var name = next_token;
        advance();
        if (name.id === 'ignore') {
            warn('unexpected_a', name);
        }
        enroll(name, 'variable', true);
        advance('from');
        advance('(string)');
        the_import.import = token;
        the_import.name = name;
        if (!rx_identifier.test(token.value)) {
            warn('bad_module_name_a', token);
        }
        imports.push(token.value);
        semicolon();
        return the_import;
    });

    postamble('statement', 'export', top_level_only);

    postamble('statement', 'import', function (the_thing) {
        var name = the_thing.name;
        name.init = true;
        name.dead = false;
        blockage.live.push(name);
        return top_level_only(the_thing);
    });



// Parse JSON

    function json_value() {

        function json_object() {
            var brace = next_token, 
                object = empty();
            advance('{');
            if (next_token.id !== '}') {
                (function next() {
                    advance('(string)');
                    if (object[token.value] !== undefined) {
                        warn('duplicate_a', token);
                    } else if (token.value === '__proto__') {
                        warn('bad_property_name_a', token);
                    } else {
                        object[token.value] = token;
                    }
                    advance(':');
                    json_value();
                    if (next_token.id === ',') {
                        advance(',');
                        return next();
                    }
                }());
            }
            advance('}', brace);
        }

        function json_array() {
            var bracket = next_token;
            advance('[');
            if (next_token.id !== ']') {
                (function next() {
                    json_value();
                    if (next_token.id === ',') {
                        advance(',');
                        return next();
                    }
                }());
            }
            advance(']', bracket);
        }

        switch (next_token.id) {
        case '{':
            json_object();
            break;
        case '[':
            json_array();
            break;
        case 'true':
        case 'false':
        case 'null':
        case '(number)':
        case '(string)':
            advance();
            break;
        case '-':
            advance('-');
            advance('(number)');
            break;
        default:
            stop('unexpected_a');
        }
    }

    function delve(the_function) {
        Object.keys(the_function.context).forEach(function (id) {
            if (id !== 'ignore') {
                var name = the_function.context[id];
                if (name.used === 0) {
                    warn('unused_a', name);
                } else if (!name.init) {
                    warn('uninitialized_a', name);
                }
            }
        });
    }

    function uninitialized_and_unused() {
        if (module_mode) {
            delve(global);
        }
        functions.forEach(delve);
    }

// Whitage

    function whitage() {
        var closer = '(end)',
            free = false,
            left = global,
            margin = 0,
            nr_comments_skipped = 0,
            open = true,
            qmark = '',
            right;

        function at_margin(fit) {
            if (right.from !== margin + (fit || 0)) {
                warn(
                    'expected_a_at_b_c',
                    right,
                    artifact(right),
                    margin + (fit || 0),
                    artifact_from(right)
                );
            }
        }
        
        function expected_at(at) {
            warn(
                'expected_a_at_b_c',
                right,
                artifact(right),
                at,
                artifact_from(right)
            );
        }

        function no_space_only() {
            if (left.line !== right.line || left.thru !== right.from) {
                warn(
                    'unexpected_space_a_b',
                    right,
                    artifact(left),
                    artifact(right)
                );
            }
        }

        function no_space() {
            if (left.line === right.line) {
                if (left.thru !== right.from && nr_comments_skipped === 0) {
                    warn(
                        'unexpected_space_a_b',
                        right,
                        artifact(left),
                        artifact(right)
                    );
                }
            } else {
                if (open) {
                    var at = free
                    ? margin
                    : margin + 8;
                    if (right.from < at) {
                        expected_at(at);
                    }
                } else {
                    if (right.from !== margin + 8) {
                        expected_at(margin + 8);
                    }
                }
            }
        }

        function one_space_only() {
            if (left.line !== right.line || left.thru + 1 !== right.from) {
                warn(
                    'expected_space_a_b', 
                    right, 
                    artifact(left), 
                    artifact(right)
                );
            }
        }

        function one_space() {
            if (left.line === right.line) {
                if (left.thru + 1 !== right.from && nr_comments_skipped === 0) {
                    warn(
                        'expected_space_a_b', 
                        right, 
                        artifact(left), 
                        artifact(right)
                    );
                }
            } else {
                if (open) {
                    var at = free
                    ? margin
                    : margin + 8;
                    if (right.from < at) {
                        expected_at(at);
                    }
                } else {
                    if (right.from !== margin + 8) {
                        expected_at(margin + 8);
                    }
                }
            }
        }

        stack = [];
        tokens.forEach(function (the_token) {
            right = the_token;
            if (right.id === '(comment)' || right.id === '(end)') {
                nr_comments_skipped += 1;
            } else {

// If left is an opener and right is not the closer, then push the previous
// state. If the token following the opener is on the next line, then this is
// an open form. If the tokens are on different lines, then it is a closed for.
// Open form is more readable, with each item (statement, argument, parameter,
// etc) starting on its own line. Closed form is more compact. Statement blocks
// are always in open form.

                var new_closer = opener[left.id];
                if (typeof new_closer === 'string') {
                    if (new_closer !== right.id) {
                        stack.push({
                            closer: closer,
                            free: free,
                            margin: margin,
                            open: open,
                            qmark: qmark
                        });
                        closer = new_closer;
                        if (left.line !== right.line) {
                            free = (closer === ')' && left.free) || closer === ']';
                            open = true;
                            margin += 4;
                            qmark = '';
                            if (right.role === 'label') {
                                if (right.from !== 0) {
                                    expected_at(0);
                                }
                            } else {
                                at_margin(right.switch 
                                ? -4 
                                : 0);
                            }
                        } else {
                            if (right.statement || right.role === 'label') {
                                warn(
                                    'expected_line_break_a_b',
                                    right,
                                    artifact(left),
                                    artifact(right)
                                );
                            }
                            free = false;
                            open = false;
                            no_space_only();
                        }
                    } else {

// If left and right are opener and closer, then the placement of right depends
// on the openness. Illegal pairs (like {]) have already been detected.

                        if (left.line === right.line) {
                            no_space();
                        } else {
                            at_margin();
                        }
                    }
                } else {

// If right is a closer, then pop the previous state,

                    if (right.id === closer) {
                        var previous = stack.pop();
                        margin = previous.margin;
                        if (open && right.id !== ';') {
                            at_margin();
                        } else {
                            no_space_only();
                        }
                        closer = previous.closer;
                        free = previous.free;
                        open = previous.open;
                        qmark = previous.qmark;
                    } else {

// Left is not an opener, and right is not a closer. The nature of left and
// right will determine the space between them.

// If left is , or ; or right is a statement then if open, right must go at the
// margin, or if closed, a space before.


                        if (right.switch) {
                            at_margin(-4);
                        } else if (right.role === 'label') {
                            if (right.from !== 0) {
                                expected_at(0);
                            }
                        } else if (left.id === ',') {
                            if (!open || (free && left.line === right.line)) {
                                one_space();
                            } else {
                                at_margin();
                            }
                        } else if (right.arity === 'ternary') {
                            if (right.id === '?') {
                                if (qmark === '') {
                                    qmark = '?';
                                } else if (qmark.slice(-1) === '?') {
                                    margin += 4;
                                    qmark += '?';
                                } else {
                                    qmark.slice(0, -1);
                                }
                                at_margin(0);
                            } else {
                                if (qmark === '?') {
                                    qmark = '';
                                } else if (qmark === '??:') {
                                    margin -= 4;
                                    qmark = '';
                                } else if (qmark.slice(-1) === '?') {
                                    qmark += ':';
                                } else {
                                    margin -= 4;
                                    qmark = qmark.slice(0, -2) + ':';
                                }
                                at_margin(0);
                            }
                        } else if (
                            left.id === '...' ||
                            right.id === ',' ||
                            right.id === ';' ||
                            right.id === ':' ||
                            (right.arity === 'binary' && (
                                right.id === '(' ||
                                right.id === '['
                            ))
                        ) {
                            no_space_only();
                        } else if (left.id === '.') {
                            no_space();
                        } else if (right.id === '.') {
                            if (left.line === right.line) {
                                no_space();
                            } else {
                                at_margin(4);
                            }
                        } else if (left.id === ';') {
                            if (open) {
                                at_margin();
                            } else {
                                one_space();
                            }
                        } else if (
                            left.arity === 'ternary' ||
                            left.id === 'case' ||
                            left.id === 'catch' ||
                            left.id === 'else' ||
                            left.id === 'finally' ||
                            left.id === 'while' ||
                            right.id === 'catch' ||
                            right.id === 'else' ||
                            right.id === 'finally' ||
                            (right.id === 'while' && !right.statement) ||
                            (left.id === ')' && right.id === '{')
                        ) {
                            one_space_only();
                        } else if (right.statement === true) {
                            if (open) {
                                at_margin();
                            } else {
                                one_space();
                            }
                        } else if (
                            left.id === 'var' ||
                            left.id === 'const' ||
                            left.id === 'let'
                        ) {
                            stack.push({
                                closer: closer,
                                free: free,
                                margin: margin,
                                open: open,
                                qmark: qmark
                            });
                            closer = ';';
                            free = false;
                            open = left.open;
                            qmark = '';
                            if (open) {
                                margin = margin + 4;
                                at_margin();
                            } else {
                                one_space_only();
                            }
                        } else if (

// There is a space between left and right.

                            binop[left.id] === true ||
                            binop[right.id] === true ||
                            (
                                left.arity === 'binary' &&
                                (left.id === '+' || left.id === '-')
                            ) ||
                            (
                                right.arity === 'binary' &&
                                (right.id === '+' || right.id === '-')
                            ) ||
                            left.id === 'function' ||
                            left.id === ':' ||
                            (
                                (
                                    left.identifier || 
                                    left.id === '(string)' || 
                                    left.id === '(number)'
                                ) &&
                                (
                                    right.identifier || 
                                    right.id === '(string)' || 
                                    right.id === '(number)'
                                )
                            ) ||
                            (left.arity === 'statement' && right.id !== ';')
                        ) {
                            one_space();
                        } else if (left.arity === 'unary') {
                            no_space_only();
                        }
                    }
                }
                nr_comments_skipped = 0;
                delete left.free;
                delete left.init;
                delete left.open;
                delete left.used;
                left = right;
            }
        });
    }

// Begin JSLint.

    return function jslint(source, option_object, global_array) {
        try {
            option = option_object || empty();
            block_stack = [];
            declared_globals = empty();
            directive_mode = true;
            early_stop = true;
            errors = [];
            fudge = option.fudge 
            ? 1 
            : 0;
            functions = [];
            global = {
                id: '(global)',
                body: true,
                context: empty(),
                from: 0,
                global: true,
                level: 0,
                line: 0,
                live: [],
                loop: 0,
                switch: 0,
                thru: 0
            };
            blockage = global;
            functionage = global;
            next_token = global;
            imports = [];
            json_mode = false;
            mega_mode = false;
            property = empty();
            stack = [];
            tenure = undefined;
            token = global;
            token_nr = 0;
            var_mode = undefined;
            populate(declared_globals, standard, false);
            if (global_array !== undefined) {
                populate(declared_globals, global_array, false);
            }
            Object.keys(option).forEach(function (name) {
                if (option[name] === true) {
                    var allowed = allowed_option[name];
                    if (Array.isArray(allowed)) {
                        populate(declared_globals, allowed, false);
                    }
                }
            });

            make_tokens(source);
            advance();
            if (tokens[0].id === '{' || tokens[0].id === '[') {
                json_mode = true;
                tree = json_value();
            } else {
                if (option.browser) {
                    if (next_token.id === ';') {
                        advance(';');
                    }
                } else {
                    if (
                        next_token.id === '(string)' && 
                        next_token.value === 'use strict'
                    ) {
                        advance('(string)');
                        advance(';');
                        global.strict = true;
                    }
                }
                tree = statements();
                advance('(end)');
                functionage = global;
                walk_statement(tree);
                uninitialized_and_unused();
                if (!option.white) {
                    whitage();
                }
            }
            if (!json_mode && functions.length < 1) {
                warn('no_functions', global);
            }
            early_stop = false;
        } catch (e) {
            if (e.name !== 'JSLintError') {
                errors.push(e);
            }
        }
        return {
            id: "(JSLint)",
            errors: errors.sort(function (a, b) {
                return a.line - b.line || a.column - b.column;
            }),
            functions: functions,
            global: global,
            imports: imports,
            json: json_mode,
            lines: lines,
            module: module_mode === true,
            ok: errors.length === 0 && !early_stop,
            option: option,
            property: property,
            stop: early_stop,
            tokens: tokens,
            tree: tree,
            edition: "2015-02-27"
        };
    };
}());
