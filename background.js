console.log("background.js loaded");

/*
  watch CreatMeetingDevice and record our device ID(s)
  Step 1. In onBeforeRequest: get magic strings from the request body which includes device id and so on.
*/
// var create_device_body;
var reqbody;

chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    // Capture request body
    create_device_body = info.requestBody.raw[0].bytes;

    console.log("Request Body in CreateMeetingDevice captured:");
    console.log(create_device_body);
    reqbody = arrayBufferToBase64(create_device_body);
    console.log(reqbody);
    return true;
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice"
    ]
  },
  ["requestBody", "extraHeaders"]
);

/*
  watch CreatMeetingDevice and record our device ID(s)
  Step 2. In onSendHeaders: get device and space ids by re-requesting CreateMeetingDevice request.
*/
var device_id_re = /@spaces\/.*\/devices\/([a-f,0-9,-]*)/;
var space_id_re = /@spaces\/(.*?)\/devices\//;

var ignore_device_ids = [];
var space_id;

chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    console.log("Sending message to content.js");

    // send a message to content.js
    chrome.tabs.query(
      {
        active: true, currentWindow: true
      },
      function (tabs) {
        console.trace();

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            command: 'createDevice', url: info.url, reqbody: reqbody, headers: info.requestHeaders
          },
          function (mresponse) {
            console.trace();

            // decode response body
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
    ]
  },
  ["requestHeaders", "extraHeaders"]
);

// watch SyncMeetingSpaceCollections and capture request headers
var send_headers;

chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    // Capture request headers
    send_headers = info.requestHeaders;

    console.log("Captuered Request headers in SyncMeetingSpaceCollections:");
    console.log(send_headers);
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/SyncMeetingSpaceCollections"
    ]
  },
  ["requestHeaders", "extraHeaders"]
);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.trace();
    console.trace(request);

    send_update_to_inject(request.command);

    sendResponse('done');
    return true;
  }
);

chrome.commands.onCommand.addListener(
  function (command) {
    send_update_to_inject(command);
  }
);

function send_update_to_inject(command) {
  console.trace();

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

// Watch MeetingRecordingService requests
chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    console.log("background.js: chrome.webRequest.onBeforeRequest listener is called");
    console.log(info);

    var method = info.url.match("([^/]+?)?$")[1];
    console.log("background.js: MeetingRecordingService/" + method + " is requested");

    var body = info.requestBody.raw[0].bytes;
    console.log(body);
    console.log(ab2str(body));
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/*"
    ]
  },
  ["requestBody", "extraHeaders"]
);

// ------------------------------------------------------------

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
