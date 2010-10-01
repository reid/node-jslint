var lint = require("../lib/linter").jslint();
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var sys = require('sys');

var server = function (port) {
    var that = http.createServer(function (req, resp) {
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

        var handle_index = function(req, resp) {    
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

        var handle_lint = function(req, resp) {
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

        var handle_req = function(req, resp) {
            switch(req.url){
            case "/":
                handle_index(req, resp);
                break;
            case "/lint":
                handle_lint(req, resp);
                break;
            default:
                send_errors(resp, "404: No location");
                resp.end();
                break;
            }
        }

        handle_req(req, resp);
    });

    that.port = port;

    that.start = function() {
            console.log("Listening on port " + that.port);
            that.listen(that.port);
    }

    process.on('SIGHUP', function() {
        console.log("Reloading server");
        that.close();
        that.start();
    });

    return that;
}


if (process.argv.length < 3) {
    console.log("You must specify a port number");
    process.exit(-1);
}

var port = process.argv[2];
var lintserver = server(port);

lintserver.start();