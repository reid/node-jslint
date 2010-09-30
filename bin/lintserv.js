var lint = require("../lib/linter").jslint();
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var sys = require('sys');

var server = http.createServer(function (req, resp) {
    var print_form = function (resp, data) {
        to_write = data || '';
        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.write(
            '<form action="/" method="post">'+
                '<textarea name="data" cols="80" rows="20">' + to_write + 
                '</textarea>'+
                '<input type="submit" value="Submit">'+
                '</form>'
        );
    };

    var send_errors = function (resp, msg) {
        resp.writeHead(500, {'Content-Type': 'text/plain'});
        resp.write(msg);
    }

    var index = function(req, resp) {    
        switch (req.method) {
        case "POST":
            req.addListener('data', function(chunk) {
                query = querystring.parse(chunk.toString('utf8'));
                result = lint.process_data(query.data);
                print_form(resp, query.data);
                lines = result.output.split('\n');

                for (x in lines) {
                    resp.write('<ul>');
                    if (lines[x]) {
                        resp.write('<li>' + lines[x] + '</li>');
                    }
                    resp.write('</ul>');
                }
                resp.end()
            });
            break;
        case "GET":
            print_form(resp);
            resp.end()
            break;
        }
    }

    var json = function(req, resp) {
        if (req.method === 'POST') {
            req.addListener('data', function(chunk) {
                query = querystring.parse(chunk.toString('utf8'));
                result = lint.process_data(query.data);
                resp.writeHead(200, {'Content-Length': result.output.length,
                                     'Content-Type': 'text/plain'});
                resp.write(result.output);
                resp.end()
            });
        }
        else {
            var msg = "You cannot GET from this URL";
            send_errors(resp, msg);
            resp.end()
        }
    }

    switch(req.url){
    case "/":
        index(req, resp);
        break;
    case "/json":
        json(req, resp);
        break;
    }

}).listen('8000');