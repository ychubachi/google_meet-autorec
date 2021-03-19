// console.log("background.js loaded");

// Request body of CreateMeetingDevice
var captured_request_body;
// Request header of SyncMeetingSpaceCollections
var captured_request_headers;
// Meeting space id
var space_id;
// Status
var status = "can_not_record";

/*
  Onece Google Meet is started, it sends CreateMeetingDevice request
  to the server.
  We watch the request in order to get our device ID(s).

  Step 1/2. "onBeforeRequest": get magic strings from the request body
            which includes device id and so on.
*/
chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    // console.trace();
    // console.log(info.url);
    // console.log(info);

    // Capture CreateMeetingDevice request body
    body = info.requestBody.raw[0].bytes;

    // console.log("Request Body in CreateMeetingDevice captured:");
    // console.log(body);
    captured_request_body = arrayBufferToBase64(body);
    // console.log(captured_request_body);
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
  When CreateMeetingDevice is called from Meet, we also call it again
  to obtain space_id from its response.

  Step 2/2. "onSendHeaders": get device id and space id by simulating
  CreateMeetingDevice request.
*/
chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    // console.trace();
    // console.log(info.url);
    // console.log(info);

    // console.log("Sending message to content.js");

    // send a message to content.js
    chrome.tabs.query(
      {
        active: true, currentWindow: true
      },
      function (tabs) {
        // console.trace();

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            command: 'createDevice',
            url: info.url,
            headers: remove_unsafe_headers(info.requestHeaders),
            body: captured_request_body
          },
          function (response) {
            // console.trace();

            // get space_id
            var result = atob(response.body).match(/@spaces\/(.*?)\/devices\//);
            if (result) {
              space_id = result[1];
              // console.log("space_id: " + space_id);
            } else {
              // console.log('no space id on CreateMeeting, uh oh');
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

/**
 * watch SyncMeetingSpaceCollections and capture request headers
 */
chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    // console.trace();

    captured_request_headers = info.requestHeaders;
  },
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/SyncMeetingSpaceCollections"
    ]
  },
  ["requestHeaders", "extraHeaders"]
);

/**
 * Check client status
 */
chrome.webRequest.onSendHeaders.addListener(
  function (info) {
    // console.trace();

    chrome.tabs.query(
      {
        active: true, currentWindow: true
      },
      function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            command: "status",
          },
          function (response) {
            // console.log(response);
            const new_status = response;
            if (status == "can_not_record"
              && new_status == "can_record") {
              console.log("Now we can start recording");
              autorec_meeting(tabs[0].url);
            }
            status = new_status;
          },
        );
      }
    );
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
    // console.trace();
    // console.trace(request);

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

/**
 * Send commonds with captured headers and space_id to content.js.
 * @param {*} command 
 */
function send_command_to_content(command) {
  // console.trace();

  chrome.tabs.query(
    {
      active: true, currentWindow: true
    },
    function (tabs) {
      // console.log(command);

      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          command: command,
          headers: remove_unsafe_headers(captured_request_headers),
          space_id: space_id
        },
        function (response) {
          if (chrome.runtime.lastError) {
            // console.log('no response from content, let\'s just assume the best...');
          }
          // console.log(response);
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

/**
 * Start recording if this google meet url is enabled for recording.
 * 
 * @param {*} url 
 * @returns 
 */
function autorec_meeting(url) {
  // console.trace();

  chrome.storage.sync.get("autorec", function (result) {
    // console.log(result);
    if (result["autorec"]) {
      const data = result.autorec[url];
      if (data && data.enabled) {
        console.log("Start recording");
        send_command_to_content("start_recording");
        return;
      }
    }
    console.log("Do not start recording");
  });
}