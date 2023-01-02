const express=require("express");
const app=express();
const server= require("http").createServer(app);
const io=require("socket.io")(server);
const port=8080;

io.on("connection", socket=> {
  console.log("A user connected");
    // send the message to client
  socket.emit("hello", "world");

   // recieve a message from the client
   socket.on("howdy", (arg)=>{
    console.log(arg);
   });
});


server.listen(port,  ()=> console.log("server running on port "+ port));