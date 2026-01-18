var myJanus
var videoRoom;
var localStream;
var remoteStream;
var userMedia
var opaqueId = "random-" + Janus.randomString(12);

// Initialize Janus
Janus.init({
    debug: true,
    dependencies: Janus.useDefaultDependencies(),
    callback: function() {
        myInit();
    }
});

// Initialize Janus and attach to plugin
function myInit() {
    myJanus = new Janus({
        server: 'https://bingusserver.duckdns.org/janusbase',
        iceServers : [
            {
                url:"stun:stun.l.google.com:19302"
            },
            {url: 'turn:standard.relay.metered.ca:443?transport=tcp',
			credential: '966154911cd6d415bfe5fa12',
			username: '6i3xA/5y4gaYioX7'
		}],
        success: function() {
            console.log("Janus connection established");
            myAttach();
        },
        error: function(cause) {
            console.error("Error initializing Janus:", cause);
        },
        destroyed: function() {
            console.log("Janus session destroyed");
        }
    });
}

// Attach to Janus video room plugin
function myAttach() {

    // Attach to echo test plugin, using the previously created janus instance
myJanus.attach(
    {
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function(pluginHandle) {
            // Plugin attached! 'pluginHandle' is our handle
            console.log("Janus plugin attached:", pluginHandle);
            videoRoom = pluginHandle;
            joinRoom();
        },
        error: function(cause) {
            // Couldn't attach to the plugin
            console.error("Error attaching to Janus plugin:", cause);
        },
        consentDialog: function(on) {
            // e.g., Darken the screen if on=true (getUserMedia incoming), restore it otherwise
        },
        onmessage: function(msg, jsep) {
            // We got a message/event (msg) from the plugin
            // If jsep is not null, this involves a WebRTC negotiation
            console.log("Message received:", msg);
            var event = msg["videoroom"];
            if (event) {
                if (event === "joined") {
                    console.log("Successfully joined room");
                    publishOwnFeed();
                } else if (event === "event") {
                    if (msg["joining"]){
                        console.log("Someone Joined")
                        unpublishOwnFeed(jsep);
                    }
                    // Handle event messages
                } else if (event === "destroyed") {
                    console.log("Room has been destroyed!");
                }
            }
            if (jsep) {
                console.log("Handling SDP:", jsep);
                videoRoom.handleRemoteJsep({ jsep: jsep });
            }
        },
        onlocaltrack: function(track, added) {
            // A local track to display has just been added (getUserMedia worked!) or removed

            if (added) {
                // Track added
                if (track.kind === 'video') {
                    // Create a new video element for the track
                    const videoElement = document.getElementById('localVideo');
                    videoElement.autoplay = true;
                    videoElement.playsinline = true;
                    videoElement.muted = true; // Mute local video
                    videoElement.srcObject = new MediaStream([track]); // Attach track to stream
                }
            } else {
                // Track removed
                // Implement logic to remove track and associated UI elements
            }
            console.log("Local track added:", track);
        },
        onremotetrack: function(track, mid, added, metadata) {
            // A remote track (working PeerConnection!) with a specific mid has just been added or removed
            // You can query metadata to get some more information on why track was added or removed
            // metadata fields:
            //   - reason: 'created' | 'ended' | 'mute' | 'unmute'
            console.log("Remote track added:", track);
        },
        oncleanup: function() {
            // PeerConnection with the plugin closed, clean the UI
            // The plugin handle is still valid so we can create a new one
            console.log("Janus plugin cleanup\nWe are unpublished, republishing");
            
            publishOwnFeed();
        },
        detached: function() {
            // Connection with the plugin closed, get rid of its features
            // The plugin handle is not valid anymore
            console.log("Janus plugin detached");
        }
    });
}

function joinRoom(){
    var register = {
        "request" : "join",
        "ptype" : "publisher",
        "room" : 1000,
        "display" : "MAINCAM"
    };
    videoRoom.send({ message: register});
}

function publishOwnFeed() {
    console.log("publisjon own feed")
    
    videoRoom.createOffer({
        tracks:[
            { type: "audio", capture: true, recv: false, add: true },
            { type: "video", capture: {
                width: {exact: 1920},
                height: {exact: 1080},
                facingMode: {exact: 'environment'}
              }, recv: false, add: true}],
        success: function(jsep) {
            console.log("Got publisher SDP:", jsep);
            var publish = {
                request: "configure",
                audio: true,
                video: true
            };
            videoRoom.send({ message: publish, jsep: jsep });
        },
        error: function(error) {
            console.error("Error creating publisher offer:", error);
        }
    });
}

function unpublishOwnFeed(jsep) {
    console.log("unpublisj own feed")
    var unpublish = {
        request: "unpublish"
    };
    videoRoom.send({ message: unpublish});
}