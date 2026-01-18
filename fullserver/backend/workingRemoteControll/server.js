const express = require('express');
const http = require('http');
const WebSocket = require('ws');
var url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const esp32Socket = new WebSocket.Server({ noServer: true });
const adminSocket = new WebSocket.Server({ noServer: true });

//data = {"cmd":[0,0,0],"id":undefined}

class Robot {
  pos = new Point(0,0)
  dir = new Point(0,1)
  lastCmd = [0,0,0]
  controller = undefined
  fids = []
  constructor(id, pos) {
    this.pos = pos;
    this.id = id;
  }
  command(cmd,ctrlId){
    if(ctrlId===this.controller){
      this.lastCmd = cmd
      //console.log("cmd parsed")
    }
  }
  distToOther(oth){
    const distx = oth.pos.x - this.pos.x
    const disty = oth.pos.y - this.pos.y
    return Math.hypot(distx,disty)
  }
}

class Ring {
  pos = new Point(0,0)
  constructor(radius, pos) {
    this.pos = pos;
    this.radius = radius;
  }
  distToOther(oth){
    const distx = oth.pos.x - this.pos.x
    const disty = oth.pos.y - this.pos.y
    return Math.hypot(distx,disty)
  }
}

class Fiducial {
  constructor(id,pos) {
      this.id = id
      this.pos = pos
  }

}

class Point {
  x = 0
  y = 0
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
}

class message {
  constructor(cmd,args){
      this.cmd = cmd
      this.args = args
  }
}

function Game(){
  this.state = 0  
  this.sumoRing = new Ring(0,new Point(0,0))
  this.robots = []
  this.players = 0
  this.adminConnected = false

  this.instill = function(){

    this.state = 1

    for(let i = 0; i < this.robots.length; i++){

      if(this.robots[i] != undefined){

        this.robots[i].lastController = this.robots[i].controller
        this.robots[i].controller = "server"

        let targetPoint = new Point(this.sumoRing.pos.x+this.sumoRing.radius*(-1)**i,this.sumoRing.pos.y)
        
        let r = Math.acos(dotProduct(this.robots[i].pos,targetPoint)/(length(this.robots[i].pos)*length(targetPoint)))

        while(distBetween(targetPoint,this.robots[i].pos< this.sumoRing.radius*0.1)){
          r = Math.acos(dotProduct(this.robots[i].pos,targetPoint)/(length(this.robots[i].pos)*length(targetPoint)))
          this.robots[i].lastCmd = [10,r,0]
        }

      }
    }
  }

  this.startGame = function(){

    let WinnerId = "ingen"
    let remaining = 0

    myGame.state = 2

    //console.log(this.robots)

    //console.log(this)
    
    for(let i = 0; i < myGame.robots.length; i++){

      if(myGame.robots[i] != undefined){
        console.log(myGame.sumoRing.distToOther(myGame.robots[i]))
        console.log(myGame.sumoRing.pos)
        console.log(myGame.robots[i].pos)
        if(myGame.sumoRing.distToOther(myGame.robots[i]) > myGame.sumoRing.radius){
          myGame.robots[i].prevController = myGame.robots[i].controller
          myGame.robots[i].controller = "loser"
          myGame.robots[i].lastCmd = [0,0,0]
        }
        if(myGame.robots[i].controller != "loser"){
          remaining += 1
          WinnerId = i
        }
      }
    }

    if(remaining == 1){
      console.log("robot id ",WinnerId," has won")
      myGame.winner = WinnerId
      myGame.gameOver()
    }
  }

  this.gameOver = function(){
    clearInterval(this.intervalId);
    console.log("game over")
  }
}

function dotProduct(point1,point2){

  return point1.x*point2.x + point1.y*point2.y

}

function distBetween(point1,point2){

  const distx = point2.x - point1.x
  const disty = point2.y - point1.y
  return Math.hypot(distx,disty)

}

function length(point){
  Math.hypot(point.x,point.y)
}

let myGame = new Game();

wss.on('connection', function connection(ws) {
  ws.socketId = myGame.players
  myGame.players += 1

  console.log("Player", ws.socketId,"connected")

  ws.on('message', function incoming(message) {
    let msg = JSON.parse(message);

    if(msg.id===undefined){

      console.log("melding id-en er ikke definert")

    }else if(myGame.robots[msg.id]===undefined){

      console.log("roboten er ikkje lenger tilgjengelig")

    }else{

      if(myGame.robots[msg.id].controller === undefined){
        myGame.robots[msg.id].controller = ws.socketId
      }

      myGame.robots[msg.id].command(msg.cmd,ws.socketId)
      if(myGame.robots[msg.id].controller === "loser"){
        console.log("im stinky")
        ws.send(JSON.stringify(myGame.robots[msg.id]))//
      }

      if(myGame.winner != undefined){
        console.log("Stinky")
        let myMessage = JSON.parse(JSON.stringify(myGame.robots[msg.id]))
        myMessage.gameOver = true
        ws.send(JSON.stringify(myMessage))
      }
    }
  });

  ws.on('close', () => {
    for(i=0; i<myGame.robots.length; i++){
      if(myGame.robots[i]===null || myGame.robots[i]===undefined){

      }else if(myGame.robots[i].controller == ws.socketId){
        myGame.robots[i].controller = undefined
      }
    }
    console.log("Player nr:",ws.socketId,"disconnected");
  });
});

/* 
myData = {cmd:[15,26,12],id: 2 }
myData.cmd = [15,26,12]
*/

esp32Socket.on('connection', function connection(ws) {
  watchDogCounter = 0
  // Send initial data to ESP32
  // Periodically send data to ESP32
  ws.on('message', (msg) => {
    watchDogCounter = 0
    if(ws.socketId === undefined){
      ws.socketId = Number(JSON.parse(msg.toString()).pong)
      let myRobot = new Robot(ws.socketId,new Point(0,0))
      if(ws.socketId   == 0){
        myRobot.fids = []
        myRobot.fids[0] =  new Fiducial(0,new Point(0,0))
        myRobot.fids[1] =  new Fiducial(1,new Point(0,0))
      }else if(ws.socketId == 1){
        myRobot.fids = []
        myRobot.fids[2 - 2] =  new Fiducial(2,new Point(0,0))
        myRobot.fids[3 - 2] =  new Fiducial(3,new Point(0,0))
      }
      myGame.robots[ws.socketId] = myRobot
      console.log("Robot nr",ws.socketId,"connected");

      ws.intervalId = setInterval(() => {
        ws.send(myGame.robots[ws.socketId].lastCmd);
        watchDogCounter += 1
        if(watchDogCounter > 100){
           ws.terminate();
        }
        //console.log("data sent", myGame.robots[ws.socketId].lastCmd);
      }, 50);
    }
  })

  // Close the interval when the connection is closed
  ws.on('close', () => {
    myGame.robots.splice(ws.socketId,1)
    console.log("Robot nr:",ws.socketId,"disconnected");
    clearInterval(ws.intervalId);
  });
});

adminSocket.on('connection', function connection(ws) {
  ws.on('message',(msg)=>{
    let data = JSON.parse(msg)

    if(data.cmd === "list"){

      let myMsg = new message("list",{data: myGame.robots})
      ws.send(JSON.stringify(myMsg))

    }else if(data.cmd === "updatePos"){

      if(myGame.robots[data.args.id] != undefined){
        myGame.robots[data.args.id].pos = data.args.pos
      }

    }else if(data.cmd === "ring"){

      console.log(data.args.radius)
      console.log(data.args.pos)

      myGame.sumoRing.radius = data.args.radius
      myGame.sumoRing.pos.x = data.args.pos[0]
      myGame.sumoRing.pos.y = data.args.pos[1]

    }else if(data.cmd === "instill"){

    }else if(data.cmd === "startGame"){
    console.log("game starting")
    myGame.intervalId = setInterval(myGame.startGame,100)
    }else{
      console.log("STUPIDHEAD")
    }
    
    //myGame.robots[data.id].pos = data.pos
  })

  console.log('admin connected');
  myGame.adminConnected = true

  // Close the interval when the connection is closed
  ws.on('close', () => {
      console.log("admin close");
      myGame.adminConnected = false
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = url.parse(request.url);
  
    if (pathname === '/websock/player') {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    } else if (pathname === '/websock/esp') {
        esp32Socket.handleUpgrade(request, socket, head, function done(ws) {
          esp32Socket.emit('connection', ws, request);
      });
    } else if (pathname === '/websock/admin') {
        adminSocket.handleUpgrade(request, socket, head, function done(ws) {
          adminSocket.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
});

app.get("/websock/robots",function(request, response){
  //console.log("got a get request")
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(myGame.robots));
  response.send()
});

app.get("/websock/ring",function(request, response){
  //console.log("got a get request")
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(myGame.sumoRing));
  response.send()
});

server.listen(5242, function () {
    console.log('Server is running on port 5242');
});