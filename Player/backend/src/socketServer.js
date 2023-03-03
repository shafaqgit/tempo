const express=require("express");
const app=express();
const server= require("http").createServer(app);
const io=require("socket.io")(server);
const port=8080;
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Memcached = require('memcached');
const cors = require('cors');

app.use(cors());
// app.use(cors({ origin: 'http://localhost:19007' }));

// Connect to the Memcached server
const memcached = new Memcached('localhost:11211');



const onlineUsers = new Set();
const users = {};
const questions={};

io.on("connection", socket=> {
  // console.log("A user connected.."); 
    // send the message to client
    console.log("New Connection..",socket.id);

  socket.on('login', userId => {
    
    onlineUsers.add(userId);
    users[userId] = socket.id;
    console.log("Online users list: ",onlineUsers);
    console.log("Socket ID's: ",users);

    // io.emit('userConnected', userId);
    io.emit('userConnected',JSON.stringify([...onlineUsers]));
  });

  socket.on('logout', userId => {
    onlineUsers.delete(userId);
    console.log(userId," left the game."," New Online users list: ",onlineUsers);
    // io.emit('userDisconnected', userId);
    io.emit('userDisconnected', JSON.stringify([...onlineUsers]));
  });

  socket.on('sendChallengeRequest', (data) => {
    const challengeeSocketId = users[data.challengee];
    
    console.log(users);
    // console.log(socket.broadcast);

    socket.to(challengeeSocketId).emit('challengeRequest', {
      challenger: data.challenger,
      challengee: data.challengee,
    });

  });


  socket.on('acceptChallenge', (data) => {
    const gameWithSocketId = users[data.gameWith];
    const gameFromSocketId = users[data.gameFrom];
    // Generate a new UUID
    const gameSessionId = uuidv4();
    
    console.log("Challenge Accepted",users);
    
    const url = 'http://localhost:3000/api/questions';

    axios.get(url)
      .then(response => {
        questions[gameSessionId]=response.data

        // console.log(questions[gameSessionId]);

        const sessionId = gameSessionId;
        const sessionData = {
          player1: data.gameWith,
          player2: data.gameFrom,
          settings: {
            difficulty: 'easy',
            timeLimit: 60
          },
          questions: questions[gameSessionId],
          currQues:0
        };

        memcached.set(sessionId, sessionData, 360, (err) => {
          if (err) {
            console.error("Error in memcached:",err);
          } else {
            console.log('Game session data stored in Memcached');
            
          

            socket.to(gameFromSocketId).emit('startGame', {
              gameFrom: data.gameFrom,
              // gameWith: data.gameWith,
              gameData: sessionData,
             
            });


            socket.emit('startGame', {
              // gameFrom: data.gameFrom,
              gameWith: data.gameWith,
              
              gameData: sessionData,
            });
          }
        });

      })
      .catch(error => {
        console.log("Error in fetching Questions",error);
        questions[gameSessionId]=-1
      });


  });

});


server.listen(port,  ()=> console.log("server running on port "+ port));