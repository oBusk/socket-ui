import express = require('express');
import http = require('http');
import socketIO = require('socket.io');
import path = require('path');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

server.listen(80);

app.get('/', function appGet(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', function ioOnConnection(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data: string) {
        console.log(data);
    });
});