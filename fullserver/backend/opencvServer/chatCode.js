require = require('esm')(module /*, options*/);

const Janus = require('janus-gateway');
const cv = require('opencv4nodejs-prebuilt-install');

// Janus VideoRoom configuration
const janusServerUrl = 'ws://your-janus-server-url';
const janusRoomId = 'your-room-id';
const janusFeedId = 'feed-id-to-subscribe';

// Janus connection options
const janusOptions = {
  server: janusServerUrl,
  success: () => {
    console.log('Connected to Janus server');
    subscribeToVideoRoom();
  },
  error: (error) => {
    console.error('Janus connection error:', error);
  },
  destroyed: () => {
    console.log('Janus connection closed');
  }
};

// OpenCV processing options
const opencvOptions = {
  scale: 0.5, // Scale factor for resizing frame (adjust as needed)
};

// Function to subscribe to the Janus VideoRoom
function subscribeToVideoRoom() {
  janusClient.attach({
    plugin: 'janus.plugin.videoroom',
    opaqueId: 'videoroom-subscriber',
    success: (pluginHandle) => {
      console.log('Successfully attached to VideoRoom plugin');

      // Send request to join VideoRoom
      const subscribeRequest = {
        request: 'join',
        room: janusRoomId,
        ptype: 'subscriber',
        feed: janusFeedId,
      };

      // Handle incoming events from Janus plugin
      pluginHandle.on('event', (data) => {
        if (data.jsep && data.jsep.type === 'offer') {
          // Answer SDP offer to start the session
          pluginHandle.createAnswer({
            jsep: data.jsep,
            media: { audioSend: false, videoSend: false },
            success: (jsep) => {
              pluginHandle.send({ message: subscribeRequest, jsep });
            },
            error: (error) => {
              console.error('Janus createAnswer error:', error);
            },
          });
        }
      });

      // Start streaming
      pluginHandle.send({ message: subscribeRequest });
    },
    error: (error) => {
      console.error('Janus attach error:', error);
    },
    consentDialog: (on) => {
      console.log('Janus consent dialog:', on);
    },
    iceState: (state) => {
      console.log('Janus ICE state:', state);
    },
    mediaState: (medium, on) => {
      console.log('Janus media state:', medium, on);
    },
    webrtcState: (on) => {
      console.log('Janus WebRTC state:', on);
    },
    slowLink: (uplink, lost) => {
      console.log('Janus slow link:', uplink, lost);
    },
    onmessage: (msg, jsep) => {
      console.log('Janus message:', msg);
      // You can handle incoming messages from Janus here
    },
    onlocalstream: (stream) => {
      console.log('Local stream received:', stream);
    },
    onremotestream: (stream) => {
      console.log('Remote stream received:', stream);

      // Process frames with OpenCV
      setInterval(() => {
        const frame = cv.imdecode(Buffer.from(stream), cv.CV_LOAD_IMAGE_UNCHANGED);
        if (!frame.empty) {
          // Perform image processing with OpenCV
          const processedFrame = processFrame(frame);

          // Display or save processed frames as needed
          // For example:
          // cv.imshow('Processed Frame', processedFrame);
          // cv.waitKey(1);
        }
      }, 1000); // Adjust the interval as needed
    },
    oncleanup: () => {
      console.log('Janus plugin cleanup');
    },
  });
}

// Function to process frames with OpenCV
function processFrame(frame) {
  // Example OpenCV image processing
  // Here, you can apply any OpenCV operations to the frame
  // For demonstration, we'll just resize the frame
  return frame.resize(0, 0, opencvOptions.scale, opencvOptions.scale);
}

// Connect to Janus server
janusClient.connect();
