var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('dist'));

console.log('My socket server is running');

//-----------------------------------------------------

var socket = require('socket.io');
var io = socket(server); //require('socket.io')(3000)?

const users = {}

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('new connection: ' + socket.id);

    // socket.emit('chat-message','Hello There');
    socket.on('mouse',mouseMsg); //if socket receives a message called mouse, then triggers mouseMsg function
    socket.on('send-chat-message',messageMsg);
    socket.on('new-user',userMsg);
    socket.on('disconnect',disconnectMsg);


    function mouseMsg(data){
        socket.broadcast.emit('mouse',data); // when a messeage comes in- called broadcast.emit function to send a message back out - send back the same mouse data
        console.log(data);
    }

    function messageMsg(message){
        // console.log(message);
        socket.broadcast.emit('chat-message',{message: message, name: users[socket.id]})
    }

    function userMsg(name){
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
    }

    function disconnectMsg(){
        socket.broadcast.emit('user-disconnected',users[socket.id])
        delete users[socket.id]
    }
}


