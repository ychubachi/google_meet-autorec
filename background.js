console.log("background.js loaded");

/*
  watch CreatMeetingDevice and record our device ID(s)
  Step 1. In onBeforeRequest: get magic strings from the request body which includes device id and so on.
*/
var captured_cmd_request_body;

chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    // Capture CreateMeetingDevice request body
    body = info.requestBody.raw[0].bytes;

    console.log("Request Body in CreateMeetingDevice captured:");
    console.log(body);
    captured_cmd_request_body = arrayBufferToBase64(body);
    console.log(captured_cmd_request_body);
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

// if CreateMeetingDevice is called from Meet, we all so call it again to obtain space_id.
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
            command: 'createDevice',
            url: info.url,
            headers: remove_unsafe_headers(info.requestHeaders),
            body: captured_cmd_request_body
          },
          function (response) {
            console.trace();

            // get space_id
            var result = atob(response.body).match(/@spaces\/(.*?)\/devices\//);
            if (result) {
              space_id = result[1];
              console.log("space_id: " + space_id);
            } else {
              console.log('no space id on CreateMeeting, uh oh');
            }

            // TODO: Now we can start recording
            // console.log("Start recording");
            // send_command_to_content("start_recording");
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
var captured_smsc_request_headers;

chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    console.trace();
    console.log(info.url);
    console.log(info);

    // Capture request headers
    captured_smsc_request_headers = info.requestHeaders;

    console.log("Captuered Request headers in SyncMeetingSpaceCollections:");
    console.log(captured_smsc_request_headers);
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

      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          command: command,
          headers: remove_unsafe_headers(captured_smsc_request_headers),
          space_id: space_id
        },
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

// Remove unsafe headers
var unsafe_headers = [
  "Cookie", "User-Agent", "Origin", "Sec-Fetch-Site",
  "Sec-Fetch-Mode", "Sec-Fetch-Dest", "Referer",
  "Accept-Encoding", "sec-ch-ua", "sec-ch-ua-mobile"];

function remove_unsafe_headers(headers) {
  var new_headers = Array();
  headers.forEach(header => {
    if (!unsafe_headers.includes(header.name)) {
      new_headers.push(header);
    }
  });
  return new_headers;
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
