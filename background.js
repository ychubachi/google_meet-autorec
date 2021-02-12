console.log("background.js loaded");

/*
  watch CreatMeetingDevice and record our device ID(s)
  Step 1. In onBeforeRequest: get magic strings from the request body which includes device id and so on.
*/
var captured_request_body;

chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    // Capture CreateMeetingDevice request body
    body = info.requestBody.raw[0].bytes;

    console.log("Request Body in CreateMeetingDevice captured:");
    console.log(body);
    captured_request_body = arrayBufferToBase64(body);
    console.log(captured_request_body);
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
var space_id;

// if CreateMeetingDevice is called from Meet, we all so call it again.
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
            command: 'createDevice', url: info.url, headers: info.requestHeaders, reqbody: create_meeting_device_request_body
          },
          function (response) {
            console.trace();

            // get space_id
            var decoded = atob(response.body);
            var result = decoded.match(/@spaces\/(.*?)\/devices\//);
            if (result) {
              space_id = result[1];
              console.log("space_id: " + space_id);
            } else {
              console.log('no space id on CreateMeeting, uh oh');
            }

            // Now we can start recording
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

    send_command_to_content(request.command);

    sendResponse('done');
    return true;
  }
);

chrome.commands.onCommand.addListener(
  function (command) {
    send_command_to_content(command);
  }
);

function send_command_to_content(command) {
  console.trace();

  chrome.tabs.query(
    {
      active: true, currentWindow: true
    },
    function (tabs) {
      console.log(command);
      var message = {
        command: command,
        headers: send_headers,
        space_id: space_id
      };
      chrome.tabs.sendMessage(
        tabs[0].id,
        message,
        function (response) {
          if (chrome.runtime.lastError) {
            console.log('no response from content, let\'s just assume the best...');
          }
          console.log(response);
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
