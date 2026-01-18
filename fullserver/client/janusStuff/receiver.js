var myJanus
var videoRoom;
var localStream;
var remoteStream;
var userMedia
var opaqueId = "random-" + Janus.randomString(12);
let remoteFeed;

/* let canvasFrame = document.getElementById("remoteCanvas"); // canvasFrame is the id of <canvas>
let context = canvasFrame.getContext("2d"); */


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
                    myid = msg["id"];
					mypvtid = msg["private_id"];

                } else if (event === "event") {
                    if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                        var list = msg["publishers"];
                        for(var f in list) {
                          var id = list[f]["id"];
                          var display = list[f]["display"];
                          let streams = list[f]["streams"];
                          for(let i in streams) {
                            let stream = streams[i];
                            stream["id"] = id;
                            stream["display"] = display;
                        }
                          newRemoteFeed(id, display, streams);
                        }
                      }
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
            console.log("Janus plugin cleanup");
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
    };
    videoRoom.send({ message: register});
}

function publishOwnFeed() {
    videoRoom.createOffer({
        media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: true,
            videoSend: true
        },
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

// Helper to escape XML tags
function escapeXmlTags(value) {
	if(value) {
		let escapedValue = value.replace(new RegExp('<', 'g'), '&lt');
		escapedValue = escapedValue.replace(new RegExp('>', 'g'), '&gt');
		return escapedValue;
	}
}

function newRemoteFeed(id,display,streams){

    myJanus.attach(
        {
            plugin: "janus.plugin.videoroom",
            opaqueId: opaqueId,
            success: function(pluginHandle) {
                // Plugin attached! 'pluginHandle' is our handle
                console.log("Janus plugin attached:", pluginHandle);
                console.log(pluginHandle)
                remoteFeed = pluginHandle;
                remoteFeed.remoteTracks = {};
				remoteFeed.remoteVideos = 0;
				remoteFeed.simulcastStarted = false;
				remoteFeed.svcStarted = false;
				Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				Janus.log("  -- This is a subscriber");
				// Prepare the streams to subscribe to, as an array: we have the list of
				// streams the feed is publishing, so we can choose what to pick or skip
				let subscription = [];
				for(let i in streams) {
					let stream = streams[i];
					// If the publisher is VP8/VP9 and this is an older Safari, let's avoid video
					subscription.push({
						"feed": stream.id,	// This is mandatory
						"mid": stream.mid		// This is optional (all streams, if missing)
					});
					// FIXME Right now, this is always the same feed: in the future, it won't
					remoteFeed.rfid = stream.id;
					remoteFeed.rfdisplay = escapeXmlTags(stream.display);
				}

                // We wait for the plugin to send us an offer
				let subscribe = {
					"request": "join",
					"room": 1000,
					"ptype": "subscriber",
					"streams": subscription,
					"private_id": mypvtid
				};  
				remoteFeed.send({ message: subscribe });

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

                let event = msg["videoroom"];
                console.log("Message received:", msg);
                if(event === "attached") {
                }
                    Janus.log("Successfully attached to feed in room " + msg["room"]);
                if(jsep) {
					Janus.debug("Handling SDP as well...", jsep);
					let stereo = (jsep.sdp.indexOf("stereo=1") !== -1);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// We only specify data channels here, as this way in
							// case they were offered we'll enable them. Since we
							// don't mention audio or video tracks, we autoaccept them
							// as recvonly (since we won't capture anything ourselves)
							tracks: [
								{ type: 'data' }
							],
							customizeSdp: function(jsep) {
								if(stereo && jsep.sdp.indexOf("stereo=1") == -1) {
									// Make sure that our offer contains stereo too
									jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1");
								}
							},
							success: function(jsep) {
								Janus.debug("Got SDP!", jsep);
								let body = { request: "start", room: 1000 };
								remoteFeed.send({ message: body, jsep: jsep });
							},
							error: function(error) {
								Janus.error("WebRTC error:", error);
								bootbox.alert("WebRTC error... " + error.message);
							}
						});
				}
            },
            onlocaltrack: function(track, added) {
                // A local track to display has just been added (getUserMedia worked!) or removed
                console.log("Local track added:", track);
            },
            onremotetrack: function(track, mid, added, metadata) {
                // A remote track (working PeerConnection!) with a specific mid has just been added or removed
                // You can query metadata to get some more information on why track was added or removed
                // metadata fields:
                //   - reason: 'created' | 'ended' | 'mute' | 'unmute'

                if (added) {
                    // Track added
                    console.log("Remote track added:", track);
                    if (track.kind === 'video') {

                        const videoElement = document.getElementById('remoteVideo');
                        videoElement.autoplay = true;
                        videoElement.playsinline = true;
                        videoElement.muted = true; // Mute local video
                        videoElement.srcObject = new MediaStream([track]); // Attach track to stream
                        console.log("Should be displaying");
                        
                    }
                } else {
                    // Track removed
                    // Implement logic to remove track and associated UI elements
                }
                console.log("Remote track added or removed:", track);
            },
            oncleanup: function() {
                // PeerConnection with the plugin closed, clean the UI
                // The plugin handle is still valid so we can create a new one
                console.log("Janus plugin cleanup");
            },
            detached: function() {
                // Connection with the plugin closed, get rid of its features
                // The plugin handle is not valid anymore
                console.log("Janus plugin detached");
            }
        });


}

/* const FPS = 30;
function processVideo() {
 let begin = Date.now();
 context.drawImage(videoElement, 0, 0, 320, 240);
 // schedule next one.
 let delay = 1000/FPS - (Date.now() - begin);
 setTimeout(processVideo, delay);
}
 
// schedule first one.
setTimeout(processVideo, 0); */