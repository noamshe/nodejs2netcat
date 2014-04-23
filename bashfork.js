
var my_http = require("http");
var exec = require('child_process').exec;

my_http.createServer(function(request,response){
    console.log("got kicked");
    var command = "sleep 10";
    exec(command, function(error, stdout, stderr) {
        console.log("bashing back");
    });
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.end();
}).listen(8080);

