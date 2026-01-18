const express = require('express');
const http = require('http');
const WebSocket = require('ws');
var url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const esp32Socket = new WebSocket.Server({ noServer: true });
const adminSocket = new WebSocket.Server({ noServer: true });

data = [0,0,0]
robots = []

class Robot {
  pos = [0,0]
  constructor(id, pos) {
    this.pos = pos;
    this.id = id;
  }
  distToOther(oth){
    const distx = oth.pos[0] - this.pos[0]
    const disty = oth.pos[1] - this.pos[1]
    return Math.hypot(distx,disty)
  }
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        data = JSON.parse(message);
        console.log("received" + data)
    });
});

esp32Socket.on('connection', function connection(ws) {

  console.log('espConnected');
  // Send initial data to ESP32
  ws.send(data);

  // Periodically send data to ESP32
  const intervalId = setInterval(() => {
      ws.send(data);
      console.log("data sent", data);
  }, 50);
  // Close the interval when the connection is closed
  ws.on('close', () => {
      console.log("close");
      clearInterval(intervalId);
  });
});

adminSocket.on('connection', function connection(ws) {
  ws.on('message',(data)=>{
    let parsData = JSON.parse(data)
    console.log(parsData)
    let exists = false
    let location = 0
    for(i=0;i<robots.length;i++){
      if (parsData[3] == robots[i]){
        exists = true
        location = 0
      }
    }
    if(exists){
      robots[location].pos = parsData
    }else{
      robots.push(new Robot(parsData[3],[parsData[0],parsData[1],parsData[2]]))
    }
    ws.send(JSON.stringify(robots))
  })

  console.log('admin connected');

  // Close the interval when the connection is closed
  ws.on('close', () => {
      console.log("admin close");
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

server.listen(5242, function () {
    console.log('Server is running on port 5242');
});
