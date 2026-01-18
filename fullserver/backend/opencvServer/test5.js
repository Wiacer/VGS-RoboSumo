const Janus = require('janus-gateway-js')

var janus = new Janus.Client('ws://localhost:8188', {
  token: 'token',
  apisecret: 'apisecret',
  keepalive: 'true'
});

janus.createConnection('dfoi982').then(function(connection) {
  connection.createSession().then(function(session) {
    session.attachPlugin('janus.plugin.videoroom').then(function(plugin) {
      //plugin.send({}).then(function(response){});
      //plugin.on('message', function(message) {});
      //plugin.detach();


      
    });
  });
});