console.log("background.js loaded");

var device_id_re = /@spaces\/.*\/devices\/([a-f,0-9,-]*)/;
var space_id_re = /@spaces\/(.*?)\/devices\//;

var space_id;
var ignore_device_ids = [];
var create_device_body;
var send_headers;

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// watch SyncMeetingSpaceCollections and capture request headers
chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    if (info.initiator != 'https://meet.google.com') {
      console.log('Ignoring SyncMeetingSpaceCollections call from ' + info.initiator);
      //return {cancel: false};
    }
    send_headers = info.requestHeaders;
  },
  // filters
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/SyncMeetingSpaceCollections"
    ],
    types: ["xmlhttprequest"]
  },
  ["requestHeaders", "extraHeaders"]);

/*
  watch CreatMeetingDevice and record our device ID(s)
  1. In onBeforeRequest: get magic strings from the request body which includes device id and so on.
  2. In onSendHeaders: get device and space ids.
*/

chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    if (info.initiator != 'https://meet.google.com') {
      console.log('Ignoring CreatingMeetingDevice call from ' + info.initiator);
      return { cancel: false };
    }
    create_device_body = info.requestBody.raw[0].bytes;
    return true;
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice"
    ],
    types: ["xmlhttprequest"]
  },
  ["requestBody", "extraHeaders"]);

chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    if (info.initiator != 'https://meet.google.com') {
      console.log('Ignoring CreatingMeetingDevice call from ' + info.initiator);
      return { cancel: false };
    }
    chrome.tabs.query(
      /*
      chrome.tabs.query(queryInfo: object, callback: function)
        Gets all tabs that have the specified properties, or all tabs if no properties are specified.
        https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
      */
      {
        active: true, currentWindow: true
      },
      function (tabs) {
        reqbody = arrayBufferToBase64(create_device_body);

        // send a message to content.js
        chrome.tabs.sendMessage(
          /*
          chrome.tabs.sendMessage(tabId: number, message: any, options: object, responseCallback: function)
            Sends a single message to the content script(s) in the specified tab,
            with an optional callback to run when a response is sent back.
            The runtime.onMessage event is fired in each content script running in the specified tab
            for the current extension.
            https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage
          */
          tabs[0].id,
          {
            command: 'createDevice', url: info.url, reqbody: reqbody, headers: info.requestHeaders
          },
          function (mresponse) {
            var create_device_response = mresponse.body;
            var create_decoded = atob(create_device_response);
            console.log('decoded response: ' + create_decoded);

            // get device_id
            var result = create_decoded.match(device_id_re);
            if (result) {
              var device_id = result[1];
              ignore_device_ids.push(device_id);
              console.log('device_id: ' + device_id);
            } else {
              console.log('no device id on CreatMeetingDevice, doing nothing');
            }

            // get space_id
            var sresult = create_decoded.match(space_id_re);
            if (sresult) {
              space_id = sresult[1];
              console.log("space_id: " + space_id);
            } else {
              console.log('no space id on CreateMeeting, uh oh');
            }
          }
        );
      }
    );
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice"
    ],
    types: ["xmlhttprequest"]
  },
  ["requestHeaders", "extraHeaders"]
);

function process_chrome_message(request, sender, sendResponse) {
  console.log("background.js: process_chrome_message() called.")
  console.log('background got message with request: ' + request.command)
  send_update_to_inject(request.command);
  sendResponse('done');
  return true;
}

/**
chrome.runtime.onMessage.addListener(listener: function)
  Fired when a message is sent from either an extension process (by sendMessage) or
  a content script (by tabs.sendMessage).
  https://developer.chrome.com/docs/extensions/reference/runtime/#event-onMessage
*/
chrome.runtime.onMessage.addListener(process_chrome_message);

function send_update_to_inject(command) {
  console.log("background.js: send_update_to_inject() called.")
  chrome.tabs.query(
    {
      active: true, currentWindow: true
    },
    function (tabs) {
      console.log(command);
      console.log('ignore devices:');
      console.log(ignore_device_ids);
      var message = {
        command: command,
        ignore_device_ids: ignore_device_ids,
        send_headers: send_headers,
        space_id: space_id
      };
      chrome.tabs.sendMessage(
        tabs[0].id,
        message,
        function (mresponse) {
          if (chrome.runtime.lastError) {
            console.log('no response from inject, let\'s just assume the best...');
          }
          console.log(mresponse);
        }
      );
    }
  );
}

/**
 * chrome.commands.onCommand.addListener(listener: function)
 *   Fired when a registered command is activated using a keyboard shortcut.
 */
chrome.commands.onCommand.addListener(send_update_to_inject);


chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    console.log("background.js: MeetingRecordingService is requested");
    body = info.requestBody.raw[0].bytes;
    console.log(body);
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/CreateMeetingRecording"
    ]
  },
  ["requestBody", "extraHeaders"]
);
