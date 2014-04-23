

var sys = require("sys"),
my_http = require("http");
var async = require("async");
var net = require('net');
var flumeClient = new net.Socket();
// this is flume tcp socket
flumeClient.connect(81, '127.0.0.1', function() {
    console.log('Connected');
});
flumeClient.on('data', function(data) {
    console.log('Received: ' + data);
    //flumeClient.destroy(); // kill client after server's response
});
flumeClient.on('close', function() {
    console.log('Connection closed');
});

my_http.createServer(function(request,response){
    sys.puts("I got kicked");

    async.parallel([
        function(callback){
            sleep(1000, function() {
                console.log("wrote to Flume!");
            });
        },
        function(callback){
            handleRequest(request, response);
        }
    ]/*,
   optional callback
        function(err, results){
            // the results array will equal ['one','two'] even though
            // the second function had a shorter timeout.
        }*/);
}).listen(8080);

sys.puts("Server Running on 8080");


function handleRequest(request, response) {
    var qs = require('querystring');
    if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            console.dir(body);

            var POST = qs.parse(body);
            // use POST
            console.dir(" - " + POST.xml);
            xmlParser(POST.xml, response);
        });
    }
}



function xmlParser(xml, response) {
//    var xml = "<root>Hello xml2js!</root>"
    var parseString = require('xml2js').parseString;
    parseString(xml, function (err, result) {
        rootElement = JSON.stringify(result['id']);
        console.dir("result: " + rootElement);
        flumeClient.write(rootElement + "\n", function() {
            console.log('before sent');
            // write no-bid back
            response.writeHeader(204, {"Content-Type": "text/plain"});
            response.write("no-bid");
            response.end();
            console.log('after sent');
        });
    });
}

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}