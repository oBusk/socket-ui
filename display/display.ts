'use strict';

var socket = io.connect();

socket.on("welcome display", (message: string) => {
    log(message);
});

let log = function (str : string) {
    let log =  `${document.getElementById("socket-log").innerHTML}\n${str}`;
    document.getElementById("socket-log").innerHTML = log;
}

socket.emit("display connected");