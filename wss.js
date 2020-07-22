const WebSocket = require('ws');
const http = require('http');

const jwt = require('jsonwebtoken')

const express = require('express');
const app = express();

app.use(express.static('example'));
const bserver = http.createServer(app);
const webPort = 6556;

var secret ="shhhhh"

bserver.listen(webPort, function () {
    console.log('Web server start. http://localhost:' + webPort);
});
const wss = new WebSocket.Server({ server: bserver });
function toEvent(message) {
    try {
        var event = JSON.parse(message);
        this.emit(event.type, event.payload);
    } catch (err) {
        console.log('not an event', err);
    }
}

wss.on('connection', function (ws) {
    ws.room = [];
    console.log('connected');
    ws.on('message', toEvent)
        .on('authenticate', function (data) {
            jwt.verify(data.token,secret, function (err, decoded) {
                if(err){
                    console.log(err)
                }else{
                if(checkUserPermision(decoded,data.room)){
                    //try{
                    var messag = data;
                    //}catch(e){console.log(e)}
                    if (messag.join) { ws.room.push(messag.join) }
                    if (messag.room) { broadcast(data); }
                    if (messag.msg) { console.log('message: ', messag.msg) }
                }
            }

            })
        })
    ws.on('error', e => console.log(e))
    ws.on('close', (e) => console.log('websocket closed' + e))
})

function checkUserPermision(decoded,room){
    if(decoded.foo=="bar"){
        return true
    }
}

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.room.indexOf(message.room) > -1) {
            client.send(message.msg)
        }
    })
}