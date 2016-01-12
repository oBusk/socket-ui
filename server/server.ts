import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";

const displayApp = express();

const displayServePath = path.join(__dirname, '..', '..', 'display', 'serve');

displayApp.use(express.static(displayServePath));

const displayServer = displayApp.listen(1337);
const io = socketio.listen(displayServer);

io.on('connection', function (socket) {
    console.log("CONNECTION");
    socket.on('display connected', function() {
        console.log("Display connected");
        socket.emit('welcome display', "Welcome to the server, display");
    });    
});

console.log(`Server started!`);