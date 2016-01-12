var socket = io.connect();
socket.on('news', (data: any) => {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});