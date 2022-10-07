import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import makeid from './utils.js'

//IMPORTANT REPLACE THIS WITH THE CORRECT ADDRESS WHEN HOSTING SOMEWHERE!
const socket = io('http://localhost:3000');
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');
// const mario2 = document.getElementById('mario');
const mario = new Image();
mario.src = '../public/Mario.png';
const marioL = new Image();
marioL.src = '../public/Mario2.png';
const bario = new Image();
bario.src = '../public/Bario.png';
const barioL = new Image();
barioL.src = '../public/Bario2.png';
const coin1 = new Image();
coin1.src = '../public/coin1.png';
const coin2 = new Image();
coin2.src = '../public/coin2.png';
const coin3 = new Image();
coin3.src = '../public/coin3.png';
const coin4 = new Image();
coin4.src = '../public/coin4.png';
const coin5 = new Image();
coin5.src = '../public/coin5.png';
const coinRay = [coin1, coin2, coin3, coin4, coin5]
const coinSound = new Audio('../public/smw_coin.wav');
const itsMeSound = new Audio('../public/its-me-mario.mp3');
const loseSound = new Audio('../public/mama-mia.mp3');
const winSound = new Audio('../public/yippee.mp3');
let winLoseDisplay = 'none'
let winLoseTimer = 0

let coinimation = 1
let coinDirection = 'up'
let Iam = '' //used later to identify ourself

socket.on('message', handleMessage);
socket.on('playerConnect', handlePlayerConnect);
socket.on('gameState', paintGameState);
socket.on('coinSound', handleCoinSound);
socket.on('gameOver', handleGameOver);

function handleMessage() {
    console.log('message emitted')
    itsMeSound.play();
}

function drawPlayer(mario, marioL, playerRay){
    ctx.clearRect(0, 0, 640, 480);
    for(let i = 0; i < playerRay.length; i++) {
        if(playerRay[i].id !== 'coin'){ //exclude coin here.
            if(playerRay[i].id == Iam){ // paint own player
                if(playerRay[i].dx >= 0){ // if going right
                    //first draw a small shadow, then mario (identify us)
                    ctx.drawImage(bario, playerRay[i].x-3, playerRay[i].y-3, 38, 60);
                    ctx.drawImage(mario, playerRay[i].x, playerRay[i].y, 32, 54);
                } else { //if going left
                    //again adding a shadow version first to identify player to him/herself
                    ctx.drawImage(barioL, playerRay[i].x-3, playerRay[i].y-3, 38, 60);
                    ctx.drawImage(marioL, playerRay[i].x, playerRay[i].y, 32, 54);
                }
            } else { //paint other player
                if(playerRay[i].dx >= 0){ // if going right
                    ctx.drawImage(mario, playerRay[i].x, playerRay[i].y, 32, 54);
                } else { //if going left
                    ctx.drawImage(marioL, playerRay[i].x, playerRay[i].y, 32, 54);
                }
            }
        //if current entry is the coin
        } else if(playerRay[i].id === 'coin'){
            //if animation reaches the end flip direction to down
            if(coinimation > 48 && coinDirection === 'up'){
                coinDirection = 'down';
                coinimation -= 10; // skip from double displaying end frame
            //if animation looped back around flip direction up again
            } else if(coinimation < 2 && coinDirection === 'down') {
                coinDirection = 'up'
                coinimation += 5; // skip half from double displaying start frame (slight emphasis)
            }
            coinDirection === 'up' ? coinimation ++ : coinimation --;
            // console.log(Math.floor(coinimation/10), coinDirection)
            let currentCoinAnimation = Math.floor(coinimation / 10)
            ctx.drawImage(coinRay[currentCoinAnimation], playerRay[i].x, playerRay[i].y, 21, 32)
        }
    }
}

function drawScores(state){
    if(!state || !Iam){
        return;
    }
    let scoreRay = []
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = 'white'
    //first get an array of the players online in playerState
    let players = Object.keys(state);
    //loop over the indexes
    for(let index in players){
        //--paint user's overhead scores--//
        if(state[players[index]].id !== 'coin'){//exclude the coin
            ctx.fillText(state[players[index]].score, state[players[index]].x + 10, state[players[index]].y -5)
            //push Scores to array
            scoreRay.push([`${state[players[index]].id}`, `${state[players[index]].score}`])
        }
    }// now calculate and draw the client's rank
    let myRank = 1 //assume we are first to begin with
    let myScore
    //one loop to determine our own score
    for(let i = 0; i < scoreRay.length; i++){
        if(scoreRay[i][0] === Iam){
            myScore = scoreRay[i][1]
        }
    }
    //second loop to detemine our rank vs others
    for(let i = 0; i < scoreRay.length; i++){
        //for everyone with a higher score than me, drop my rank by one
        if(scoreRay[i][0] !== Iam && scoreRay[i][1] > myScore){
            myRank ++;
        }
    } // get the correct grammar display text for our rank
    let rankDisplayText = ''
    switch(myRank){
        case 1:
            rankDisplayText = '1st'
            break;
        case 2:
            rankDisplayText = '2nd'
            break;
        case 3:
            rankDisplayText = '3rd'
            break;
        default:
            rankDisplayText = `${myRank}th`
    } // draw our rank to screen
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = 'white'
    ctx.fillText(rankDisplayText, 590, 27)
}

function drawWinLose(){
    if(winLoseDisplay !== 'none'){
        winLoseTimer ++; //start timer for display
        if(winLoseDisplay === 'winner'){
            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = 'white'
            ctx.fillText('You win!', 270, 150)
        } else if(winLoseDisplay === 'loser'){
            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = 'white'
            ctx.fillText('You lose!', 270, 150)
        }
    }
    if(winLoseTimer > 100){
        winLoseTimer = 0;
        winLoseDisplay = 'none';
    }
}

function paintGameState(state){
    state = JSON.parse(state)
    let players = Object.keys(state);
    let playerRay = [];
    for(let i in players){
        playerRay.push(state[players[i]]);
    }
    drawPlayer(mario, marioL, playerRay);
    drawScores(state);
    drawWinLose();
}

function handlePlayerConnect(){
    let uniqueID = makeid(5);
    let newPlayer = new Player({
        x: 20,
        y: 20,
        score: 0,
        id: uniqueID
    })
    console.log(newPlayer);
    socket.emit('addPlayer', JSON.stringify(newPlayer));
    Iam = uniqueID
}

function keyDown(e) {
    //send pressed key back to the server
    socket.emit('keydown', e.keyCode);
}

function keyUp(e) {
    socket.emit('keyup', e.keyCode);
}

function handleCoinSound(){
    coinSound.play();
}

function handleGameOver(winner){
    if(Iam == winner){
        console.log('You win!')
        winSound.play();
        winLoseDisplay = 'winner';
    } else {
        console.log('You lose!')
        loseSound.play();
        winLoseDisplay = 'loser';
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
