import Janode from 'janode';
const { Logger } = Janode;
import EchoTestPlugin from 'janode/plugins/echotest';

const connection = await Janode.connect({
  is_admin: false,
  address: {
    url: 'ws://127.0.0.1:8188/',
    apisecret: 'secret'
  }
});
const session = await connection.create();

// Attach to a plugin using the plugin descriptor
const echoHandle = await session.attach(EchoTestPlugin)

// Janode exports "EVENT" property with core events
echoHandle.on(Janode.EVENT.HANDLE_WEBRTCUP, _ => Logger.info('webrtcup event'));
echoHandle.on(Janode.EVENT.HANDLE_MEDIA, evtdata => Logger.info('media event', evtdata));
echoHandle.on(Janode.EVENT.HANDLE_SLOWLINK, evtdata => Logger.info('slowlink event', evtdata));
echoHandle.on(Janode.EVENT.HANDLE_HANGUP, evtdata => Logger.info('hangup event', evtdata));
echoHandle.on(Janode.EVENT.HANDLE_DETACHED, evtdata => Logger.info('detached event', evtdata));

// Refer to plugin documentation

// plugins export "EVENT" property with specific plugin events
echoHandle.on(EchoTestPlugin.EVENT.ECHOTEST_RESULT, evtdata => Logger.info('echotest result event', evtdata));

// Specific method exported by the plugin
// "offer" got from the client
const { jsep: answer } = await echoHandle.start({ video: true, jsep: offer });

// detach the handle
await echoHandle.detach();
