const wrtc = require('wrtc');
const cv =  require('opencv4nodejs-prebuilt-install');
const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')
const { JSDOM } = require('jsdom');
// Using jsdom and node-canvas we define some global variables to emulate HTML DOM.
// Although a complete emulation can be archived, here we only define those globals used
// by cv.imread() and cv.imshow().
function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  
  // The rest enables DOM image and canvas and is provided by node-canvas
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
 }

 installDOM();

const WebSocket = require('ws');

const remoteConnection = new wrtc.RTCPeerConnection();

const strm = require('stream');

async function getImageFromMediaStream(mediaStream) {
  const canvas = createCanvas(mediaStream.width, mediaStream.height);
  const ctx = canvas.getContext('2d');

  // Draw the video frame onto the canvas
  ctx.drawImage(mediaStream, 0, 0, canvas.width, canvas.height);

  // Convert the canvas to a base64 encoded PNG image
  const base64Image = canvas.toDataURL('image/png');

  return base64Image;
}

async function captureImageFromWebRTC(mediaStream) {
  console.log("Capturing image")
  // Create a canvas element with dimensions based on the MediaStream
  const canvas = createCanvas(640, 480); // Adjust dimensions as needed
  const ctx = canvas.getContext('2d');

  // Create a video element
  const video = document.createElement('video');
  video.srcObject = mediaStream;

  // Wait for the video to load and play
  console.log("Waiting for the video to load and play")
  //video.play()
  /* await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
        video.play()
            .then(() => {
                console.log('Video is playing');
                resolve();
            })
            .catch(error => {
                console.error('Error playing video:', error);
                reject(error);
            });
    };
}); */

console.log(video)

  console.log("Video loaded and playing?")
  // Draw the video frame onto the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Capture the frame as an image
  const imageData = canvas.toDataURL('image/png');

  console.log('Captured image:', imageData);

  // Here you can save the image data to a file or send it wherever you need
}
const mediaStream = new wrtc.MediaStream();

remoteConnection.addEventListener('track', async (event) => {
  if (event.track.kind === 'video') {
      mediaStream.addTrack(event.track);
      // Once the track is added, you can start capturing frames from the media stream
      await captureImageFromWebRTC(mediaStream);
  }
});

remoteConnection.ontrack = function(event){
  console.log("New track received ",event);

  const track = event.streams[0];

  console.log(event.track.kind)

  if (event.track.kind === 'video') {
    mediaStream.addTrack(event.track);
    console.log(mediaStream)

    // Once the track is added, you can start capturing frames from the media stream
    captureImageFromWebRTC(mediaStream);
}

};

let sessionId
let pubHandleId
let pubAttached = false
let subHandleId

// WebSocket endpoint provided by Janus Gateway
const JANUS_ENDPOINT = 'ws://127.0.0.1:8188';

// Room ID to join
const ROOM_ID = 1234;

// Participant ID (randomly generated)
const PARTICIPANT_ID = Math.random().toString(36).substring(7);

// Connect to Janus Gateway
const ws = new WebSocket(JANUS_ENDPOINT, 'janus-protocol');

// Send a message to join the video room
const joinRoomMessage = {
  "janus" : "message",        // NEW!
  "transaction" : Math.random().toString(36).slice(2),
  "body" : {
    "request" : "join",
    "ptype" : "publisher",
    "room" : 1000,
  }
}

let pluginMessage = {
  "janus" : "message",
  "transaction" : Math.random().toString(36).slice(2),
  "body" : {
  }
}

const attachMessage = {
  janus: 'attach',
  plugin: 'janus.plugin.videoroom', // Plugin to attach (for receiving video stream)
  transaction: Math.random().toString(36).slice(2)
};

const attachMessageSub = {
  janus: 'attach',
  plugin: 'janus.plugin.videoroom', // Plugin to attach (for receiving video stream)
  transaction: Math.random().toString(36).slice(2)
};

const startSession = {
  "janus" : "create",
  "transaction" : Math.random().toString(36).slice(2)
}

let streams

ws.on('open', () => {
  console.log('Connected to Janus Gateway');  
  
  ws.send(JSON.stringify(startSession));
});

// Handle messages from Janus Gateway
ws.on('message', (message) => {
  const data = JSON.parse(message);
  console.log('Received message from Janus Gateway:', data);
  
  // Check if it's a response to our join room request
  if (data.janus === 'success' && data.transaction === startSession.transaction && !data.session_id) {

    sessionId = data.data.id
    
    attachMessage.session_id = sessionId
    console.log("Got a session")
    // Successfully joined the room, now attach a plugin to receive stream
    ws.send(JSON.stringify(attachMessage));

  } else if (data.janus === 'success' && data.transaction === attachMessage.transaction && data.session_id) {

    pubHandleId = data.data.id

    console.log("attached")
    joinRoomMessage.session_id = sessionId
    joinRoomMessage.handle_id = pubHandleId
    ws.send(JSON.stringify(joinRoomMessage));

  } else if (data.janus === 'success' && data.transaction === attachMessageSub.transaction && data.session_id) {

    subHandleId = data.data.id

    console.log("attached")
    pluginMessage.session_id = sessionId
    pluginMessage.handle_id = subHandleId
    ws.send(JSON.stringify(pluginMessage));

  } else if (data.janus === 'event' && data.plugindata && data.plugindata.data && data.plugindata.data.stream) {
    // Received stream event, handle the stream
    const stream = data.plugindata.data.stream;
    console.log('Received stream:', stream);
    // Now you can process the stream data as needed
  } else if (data.janus === 'event' && data.plugindata.data.publishers !== undefined && data.plugindata.data.publishers.length) {

    var list = data.plugindata.data.publishers
      for(var f in list) {
        var id = list[f]["id"];
        var display = list[f]["display"];
        let streams = list[f]["streams"];
        for(let i in streams) {
          let stream = streams[i];
          stream["id"] = id;
          stream["display"] = display;
      }
      subscribe(streams);
    }
    

  }else if (data.janus === 'timeout') {
    // Received stream event, handle the stream
    ws.send(JSON.stringify(startSession));
    // Now you can process the stream data as needed
  }else if (data.janus === 'event' && data.jsep !== undefined){
    remoteConnection.setRemoteDescription(data.jsep).then(a=> console.log("offer set"))
    let body = { request: "start", room: 1000 };
    let pluginMessage = {
      "janus" : "message",
      "transaction" : Math.random().toString(36).slice(2),
      "body" : body
    }
    pluginMessage.session_id = sessionId
    pluginMessage.handle_id = subHandleId
    remoteConnection.createAnswer().then(answer=> remoteConnection.setLocalDescription(answer)).then(answer=> console.log("answer created")).then(answer=> {
      pluginMessage.jsep = answer;
      ws.send(JSON.stringify(pluginMessage));
    })

    //ws.send(JSON.stringify(startSession));
  }
});

// Handle WebSocket errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

function subscribe(streams){
  console.log("subscribing")

  attachMessageSub.session_id = sessionId

  // Successfully joined the room, now attach a plugin to receive stream
  ws.send(JSON.stringify(attachMessageSub));

  let subscription = [];
  for(let i in streams) {
    let stream = streams[i];
    // If the publisher is VP8/VP9 and this is an older Safari, let's avoid video
    subscription.push({
      "feed": stream.id,	// This is mandatory
      "mid": stream.mid		// This is optional (all streams, if missing)
    });
  }

          // We wait for the plugin to send us an offer
  let subscribe = {
    "request": "join",
    "room": 1000,
    "ptype": "subscriber",
    "streams": subscription
  };

  pluginMessage.body = subscribe

  
}