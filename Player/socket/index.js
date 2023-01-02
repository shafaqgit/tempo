const express=require("express");
const app=express();
const server= require("http").createServer(app);
const io=require("socket.io")(server);
const port=8080;

io.on("connection", socket=> {
  console.log("A user connected");
});

server.listen(port,  ()=> console.log("server running on port "+ port));