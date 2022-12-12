const io = require("socket.io")(3000,{
    cors:{
        origin:"http://192.168.42.232:19000",
    },
});

io.on("connection", (socket)=>{
    console.log("A user connected");
})