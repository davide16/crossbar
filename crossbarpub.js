// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file
var autobahn = require('autobahn');
console.log("Running AutobahnJS " + autobahn.version);
module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function CrossbarOutNode(input) {
        // Create a RED node
        RED.nodes.createNode(this,input);

        // Store local copies of the node configuration (as defined in the .html)
        this.url = input.url;
        this.realm = input.realm;
        this.topic = input.topic;
        this.message = input.message;

        var connection = new autobahn.Connection({
          url: 'ws://192.168.56.101:8080/ws',
          realm: 'realm1'});
        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        var topic1_subscribe_uri = "com.example.topic1";
        var topic1_subscription = null;
        var topic1_received = 0;
        var topic1_sent = 0;
        var message="qwerty";
        var topic1_publish_uri ="topic";
        const fft = require('jsfft');
        // Use the in-place mapper to populate the data.
        const data = new fft.ComplexArray(512).map((value, i, n) => {
          value.real = (i > n/3 && i < 2*n/3) ? 1 : 0;
        });
      //  console.log(data);
        const frequencies = data.FFT();
// Implement a low-pass filter using the in-place mapper.
        frequencies.map((frequency, i, n) => {
          if (i > n/5 && i < 4*n/5) {
            frequency.real = 0;
            frequency.imag = 0;
          }
        });
     // .. and fire this code when we got a session
       connection.onopen = function (session,details) {

         node.on('input', function (msg) {
            // node.warn("crossbar saw a payload: "+msg.payload + " topic: " + msg.topic);
             // in this example just send it straight on... should process it here really
             node.send(msg);
             //session.publish(msg.topic, [msg.payload]);
             session.publish(msg.topic, [frequencies]);
             //console.log("publishing to topic " + msg.topic + " " + msg.payload);
         });

         function topic1_publish (session_id) {
           //console.log("Connected with session ID " + session_id, details);
           if (session_id) {
           topic1_publish_uri = input.topic;
           message = input.message;
           //console.log("publishing to topic " + topic1_publish_uri + " " + message);
           //session.publish(topic1_publish_uri, [message]);
         }
       }

   // wamp.session.list
   // wamp.session.get
   // my_subscribe
   function list_sessions () {
      if (session) {
        var reason="vediamo";
        var message="se funziona";
         session.call("wamp.session.list").then(
            function (sessions) {
              // console.log("Current session IDs on realm", sessions);
               for (var i = 0; i < sessions.length; ++i) {
                  var len = sessions.length-1;

                    topic1_publish(sessions[len]);

                  session.call("wamp.session.get", [sessions[i]]).then(
                     function (session_details) {
                        console.log(session_details);
                     },
                     function (err) {
                        console.log(err);
                     }
                  );
               }
            },
            function (err) {
               console.log("Could not retrieve subscription for topic", err);
            }
         );
      } else {
         console.log("not connected");
      }
   }
   //main
           list_sessions();

     //onopen function end
       };

   connection.open();

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        var msg = {};
        msg.topic = this.topic;
        msg.payload = "Hello world !"

        // send out the message to the rest of the workspace.
        // ... this message will get sent at startup so you may not see it in a debug node.
        this.send(msg);

        // respond to inputs....



        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("crossbar out",CrossbarOutNode);

}
