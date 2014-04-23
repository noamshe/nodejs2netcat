
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
my_http = require("http");

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < 6; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    // Workers can share any TCP connection
    // In this case its a HTTP server
    my_http.createServer(function(request,response){
        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.end();
    }).listen(8080);
}

