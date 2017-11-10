// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

    if(Common.getBot() == 'yes') {
      console.log('Bot control =>' + Common.getBot())
      // Built http request
      var http = new XMLHttpRequest();
      http.open('POST', messageEndpoint, true);
      http.setRequestHeader('Content-type', 'application/json');
      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200 && http.responseText) {
          var tempResp = JSON.parse(http.responseText)
          if(tempResp.output.nodes_visited[0] == 'node_7_1475612009751') {
            Common.setCounter(Common.getCounter()+1)
              if(Common.getCounter() >= 3) {
                Api.setResponsePayload(JSON.stringify({'intents':[],'entities':[],'input':{'text':''},'output':{'text':['This is system generated message. This chat is redirected to our consultant to provide better chat experience.'],'nodes_visited':['zendesk'],'log_messages':[]},'context':{'conversation_id':'','system':{'dialog_stack':[{'dialog_node':'root'}],'dialog_turn_counter':0,'dialog_request_counter':0,'branch_exited':true,'branch_exited_reason':'completed'}}}));
                Common.setBot('no')
              } else {
                Api.setResponsePayload(http.responseText);
              }
          } else {
            Common.setCounter(0);
            Api.setResponsePayload(http.responseText);
          }
          //Api.setResponsePayload(http.responseText);
        }
      };

      var params = JSON.stringify(payloadToWatson);
      // Stored in variable (publicly visible through Api.getRequestPayload)
      // to be used throughout the application
      if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
        Api.setRequestPayload(params);
      }

      // Send request
      http.send(params);
    } else {
      zChat.sendChatMsg(text, (err) => {
        var params = JSON.stringify(payloadToWatson);
        // Stored in variable (publicly visible through Api.getRequestPayload)
        // to be used throughout the application
        if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
          Api.setRequestPayload(params);
        }
        if (err) {
          console.log('Error occured >>>', err);
          return;
        }
      });
    }

  }
}());
