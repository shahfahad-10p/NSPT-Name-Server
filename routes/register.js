var express = require('express');
var router = express.Router();
var request = require('request');

router.post('/register', function (req, res, next) {
    let newServer = {
        name: req.body.name,
        address: req.body.address
    };

    newServer.heartBeat = setInterval(function () {
        console.log(`${newServer.name}! ARE YOU ALIVE ?`);
        request.get(`${newServer.address}/available`,
            function (err, httpResponse, body) {
                if (err) {
                    console.log(`${newServer.name}! STOPPING YOUR HEAT !`);
                    return clearInterval(newServer.heartBeat);
                }
                let heartbeatResponse = JSON.parse(body);
                console.log(`${newServer.name}! ${heartbeatResponse.message}!`);
            }
        );
    }, 5000);

    req.servers.push(newServer);
    console.log("****************************************");
    console.log("NEW SERVER REGISTERED : ", newServer.name);
    console.log("****************************************");

    res.send({ 'register': 'success' });

});

module.exports = router;