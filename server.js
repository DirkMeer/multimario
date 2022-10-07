require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const playerState = {}

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//this is old! DO NOT USE THIS FILE FOR REFERENCE
app.use(
  helmet.noCache(),
  helmet.noSniff(),
  helmet.referrerPolicy({
    policy: ["origin", "unsafe-url"],
  }),
  helmet.xssFilter()
)
function customHead(req, res, next){
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
}
app.use(customHead)

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({
  origin: '*'
})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server, {
  cors: {
    origins: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
      });
      res.end();
    }
  }
});

io.sockets.on('connection', client => {
  //first of all emit playerConnect event.
  let currentPlayerID

  client.emit('playerConnect')

  client.on('keydown', handleKeyDown);
  client.on('keyup', handleKeyUp);
  client.on('addPlayer', handleAddPlayer);

  function handleKeyDown(keyCode){
    if(!currentPlayerID) return;
    //left
    if(keyCode === 37){ playerState[currentPlayerID].dx = -1 }
    //up
    else if(keyCode === 38){ playerState[currentPlayerID].dy = -1 }
    //right
    else if(keyCode === 39){ playerState[currentPlayerID].dx = 1 }
    //down
    else if(keyCode === 40){ playerState[currentPlayerID].dy = 1 }
  }

  function handleKeyUp(keyCode){
    if(!currentPlayerID) return;
    //left
    if(keyCode === 37){ playerState[currentPlayerID].dx = 0 }
    //up
    else if(keyCode === 38){ playerState[currentPlayerID].dy = 0 }
    //right
    else if(keyCode === 39){ playerState[currentPlayerID].dx = 0 }
    //down
    else if(keyCode === 40){ playerState[currentPlayerID].dy = 0 }
  }


  function handleAddPlayer(player){
    player = JSON.parse(player);
    currentPlayerID = player.id
    playerState[currentPlayerID] = player
    console.log(playerState)
  }

  
  client.on('disconnect', () => {
    delete playerState[currentPlayerID];
  })
})

function startGameInterval(){
  const intervalId = setInterval(() => {
    movePlayers();
    keepScore();
    io.sockets.emit('gameState', JSON.stringify(playerState));
  }, 1000/60);
}

function movePlayers(){
  //first get an array of the players online in playerState
  let players = Object.keys(playerState);
  //loop over the indexes
  for(index in players){
    if(playerState[players[index]].id !== 'coin'){//exclude the coin
      //add the directional x to the x for each player
      playerState[players[index]].x += (playerState[players[index]].dx * 4);
      //make sure x cannot go lower than 0
      if(playerState[players[index]].x < 0) { playerState[players[index]].x = 0 }
      //make sure x cannot go further than canvas
      if(playerState[players[index]].x > 640 - 32) { playerState[players[index]].x = 640 - 32 }
  
      //add the directional y to the y for each player
      playerState[players[index]].y += (playerState[players[index]].dy * 4);
      //make sure y cannot go lower than 0
      if(playerState[players[index]].y < 0) { playerState[players[index]].y = 0 }
      //make sure x cannot go further than canvas
      if(playerState[players[index]].y > 480 - 54) { playerState[players[index]].y = 480 - 54 }
    }
  }
}

function checkCoinCollision(){
  //just make sure coin exists before running pointless checks
  if(playerState['coin']){
    //first get an array of players online in playerState
    let players = Object.keys(playerState);
    //get the x range for coin collision
    const coinX = [playerState['coin'].x, playerState['coin'].x + 21]
    //get the y range for coin collision
    const coinY = [playerState['coin'].y, playerState['coin'].y + 32]
    for(index in players) {
      if(playerState[players[index]].id !== 'coin'){
        //check if both the y and x indexes are within coin collision range
        if( //check for collision on both left and right outer mario hitbox within coin range
          (playerState[players[index]].x + 32 >= coinX[0] && playerState[players[index]].x <= coinX[1])
        ){
          if(//if x matched also check for a y collision in all possible extremities of hitboxes
            (playerState[players[index]].y +54 >= coinY[0] && playerState[players[index]].y <= coinY[1])
          ){
            //if any collision was found, return player id (continue cleanly in some other function)
            return playerState[players[index]].id;
          }
        }
      }
    }
  }
}

function checkForWinner(){
  let players = Object.keys(playerState);
  let gameOver = false;
  for(index in players){
    //if any player has a score of 10
    if(playerState[players[index]].score > 9){
      //get the winning player id
      let winner = playerState[players[index]].id
      io.sockets.emit('gameOver', winner);
      gameOver = true;
    }
  }
  if(gameOver){
    for(index in players){
      playerState[players[index]].score = 0;
    }
    gameOver = false;
  }
}

function keepScore(){
  let collision = checkCoinCollision();
  if(collision){
    //award player 1 point
    playerState[collision].score += 1;
    //send coin collection event to connected sockets
    io.sockets.emit('coinSound')
    //delete coin from state object
    delete playerState.coin;
    //generate a new coin
    generateNewCoin();
  }
  checkForWinner()
}

function generateNewCoin() {
  if(!playerState.coin){
    // console.log('Generating new coin');
    playerState.coin = {
      x: Math.floor(Math.random() * 619), 
      y: Math.floor(Math.random() * 448), 
      id: 'coin'
    }//if newly generated coin would cause collision
    if(checkCoinCollision()){
      //tested and working
      console.log('coin spawn on top of player prevented')
      delete playerState.coin;
      generateNewCoin();
    }
  }
}

startGameInterval()
generateNewCoin()

module.exports = app; // For testing
