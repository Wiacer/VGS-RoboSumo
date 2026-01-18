const WebSocket = require('ws');

// WebSocket endpoint provided by Janus Gateway
const JANUS_ENDPOINT = 'ws://127.0.0.1:8188';

// Room ID to join
const ROOM_ID = 1234;

// Participant ID (randomly generated)
const PARTICIPANT_ID = Math.random().toString(36).substring(7);

// Connect to Janus Gateway
const ws = new WebSocket(JANUS_ENDPOINT);

ws.on('open', () => {
  console.log('Connected to Janus Gateway');
  
  // Send a message to join the video room
  const joinRoomMessage = {
    janus: 'message',
    body: {
      request: 'join',
      room: ROOM_ID,
      ptype: 'publisher',
      display: 'Node.js Participant' // Participant display name
    }
  };
  ws.send(JSON.stringify(joinRoomMessage));
});

// Handle messages from Janus Gateway
ws.on('message', (message) => {
  const data = JSON.parse(message);
  console.log('Received message from Janus Gateway:', data);
  
  // Check if it's a response to our join room request
  if (data.janus === 'success' && data.transaction === joinRoomMessage.transaction) {
    // Successfully joined the room, now attach a plugin to receive stream
    const attachMessage = {
      janus: 'attach',
      session_id: data.data.id,
      plugin: 'janus.plugin.videoroom' // Plugin to attach (for receiving video stream)
    };
    ws.send(JSON.stringify(attachMessage));
  } else if (data.janus === 'event' && data.plugindata && data.plugindata.data && data.plugindata.data.stream) {
    // Received stream event, handle the stream
    const stream = data.plugindata.data.stream;
    console.log('Received stream:', stream);
    // Now you can process the stream data as needed
  }
});

// Handle WebSocket errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
