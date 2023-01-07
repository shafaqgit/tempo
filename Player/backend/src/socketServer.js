const express=require("express");
const app=express();
const server= require("http").createServer(app);
const io=require("socket.io")(server);
const port=8080;

const onlineUsers = new Set();

io.on("connection", socket=> {
  // console.log("A user connected.."); 
    // send the message to client

  socket.on('login', userId => {
    
    onlineUsers.add(userId);
    console.log("Online users list: ",onlineUsers);
    // io.emit('online', userId);

    // io.emit('userConnected', userId);
    io.emit('userConnected',JSON.stringify([...onlineUsers]));
  });

  socket.on('logout', userId => {
    onlineUsers.delete(userId);
    console.log(userId," left the game."," New Online users list: ",onlineUsers);
    // io.emit('userDisconnected', userId);
    io.emit('userDisconnected', JSON.stringify([...onlineUsers]));
  });
});


server.listen(port,  ()=> console.log("server running on port "+ port));