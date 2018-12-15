var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config.json');
var _ = require('lodash');

router.post('/register', function (req, res, next) {
    let newServer = {
        name: req.body.name,
        address: req.body.address
    };

    newServer.heartBeat = setInterval(function () {
        // console.log(`${newServer.name}! ARE YOU ALIVE ?`);
        request.get(`${newServer.address}/available`,
            function (err, httpResponse, body) {
                if (err) {
                    let index = req.servers.findIndex(item => item.name === newServer.name);
                    console.log(`${newServer.name} AT INDEX ${index} ! STOPPING YOUR HEAT !`);
                    index > -1 && req.servers.splice(index, 1);
                    console.log("****************************************");
                    console.log("AVAILABLE SERVERS", _.map(req.servers, 'name'));
                    return clearInterval(newServer.heartBeat);
                }
                let heartbeatResponse = JSON.parse(body);
                // console.log(`${newServer.name}! ${heartbeatResponse.message}!`);
            }
        );
    }, config.heartbeatRate);

    req.servers.push(newServer);
    console.log("****************************************");
    console.log("NEW SERVER REGISTERED : ", newServer.name);
    console.log("****************************************");
    console.log("AVAILABLE SERVERS", _.map(req.servers, 'name'));

    res.send({ 'register': 'success' });

});

module.exports = router;