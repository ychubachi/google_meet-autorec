var device_id_re = RegExp('@spaces\/.*\/devices\/([a-f,0-9,-]*)', 'g');
var updater_id_re = /@spaces\/.*\/devices\/([a-f,0-9,-]*).*\^https/g;
var all_devices;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Int8Array(buf));
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function strToArrayBuffer(mystr) {
  var len = mystr.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = mystr.charCodeAt(i);
  }
  return bytes.buffer;
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

var skip_headers = [
  "Cookie", "User-Agent", "Origin", "Sec-Fetch-Site",
  "Sec-Fetch-Mode", "Sec-Fetch-Dest", "Referer",
  "Accept-Encoding", "sec-ch-ua", "sec-ch-ua-mobile"];

// There are two process_chrome_message() functions. Why ??
chrome.runtime.onMessage.addListener(process_chrome_message);

function process_chrome_message(request, sender, sendResponse) {
  console.log("content.js: process_chrome_message called");
  console.log('request received:');
  console.log(request);
  if (request.command == 'createDevice') {
    create_device(request, sendResponse);
  } else if (request.command == 'muteAll') {
    update_all('mute', request, sendResponse);
  } else if (request.command == 'kickAll') {
    update_all('kick', request, sendResponse);
  } else if (request.command == 'start_recording') {
    console.log("start_recording event is fired");
    start_recording(request, sendResponse);
  }
  return true;
}

function create_device(request, sendResponse) {
  console.log("content.js: create_device() called");
  var xrequest = new XMLHttpRequest();
  xrequest.withCredentials = true;
  xrequest.open("POST", request.url + '?', true); // append ? to avoid our webRequests
  for (i = 0; i < request.headers.length; i++) {
    if (!skip_headers.includes(request.headers[i].name)) {
      xrequest.setRequestHeader(request.headers[i].name, request.headers[i].value);
    }
  }
  xrequest.onerror = function () {
    console.log("** An error occurred during the transaction");
    console.log(this);
  };
  xrequest.onload = function (e) {
    console.log('sending response: ' + this.responseText);
    sendResponse({ body: this.responseText });
  };
  var request_body = base64ToArrayBuffer(request.reqbody);
  xrequest.send(request_body);
}

function update_all(action, request, sendResponse) {
  console.log("content.js: update_all() called");
  var mrequest = new XMLHttpRequest();
  mrequest.withCredentials = true;
  mrequest.open("POST", 'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/SyncMeetingSpaceCollections?', true); // append ? to avoid our webRequests
  for (i = 0; i < request.send_headers.length; i++) {
    if (!skip_headers.includes(request.send_headers[i].name)) {
      mrequest.setRequestHeader(request.send_headers[i].name, request.send_headers[i].value);
    }
  }
  mrequest.onerror = function () {
    console.log("** An error occurred during the transaction");
    console.log(this);
  };
  mrequest.onload = function (e) {
    console.log('sending response: ' + this.responseText);
    all_devices_response = atob(this.responseText);
    all_devices = Array.from(all_devices_response.matchAll(device_id_re), m => m[1]);
    console.log('all devices:');
    console.log(all_devices);
    console.log(request);
    update_devices = [];
    for (i = 0; i < all_devices.length; i++) {
      if (!request.ignore_device_ids.includes(all_devices[i])) {
        update_devices.push(all_devices[i]);
      }
    }
    updater_id = [...all_devices_response.matchAll(updater_id_re)].pop()[1]
    console.log('updater_id: "' + updater_id + '"');
    console.log('update_devices');
    console.log(update_devices);
    console.log('update action: ' + action)
    for (i = 0; i < update_devices.length; i++) {
      var srequest = new XMLHttpRequest();
      srequest.withCredentials = true;
      srequest.open('POST', 'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/UpdateMeetingDevice?', true);
      for (n = 0; n < request.send_headers.length; n++) {
        if (!skip_headers.includes(request.send_headers[n].name)) {
          srequest.setRequestHeader(request.send_headers[n].name, request.send_headers[n].value);
        }
      }
      if (action === 'mute') {
        var sbody = '\n\u0086\u0001\n@spaces/' + request.space_id + '/devices/' + update_devices[i] + 'bB\n@spaces/' + request.space_id + '/devices/' + updater_id;
      } else if (action === 'kick') {
        var sbody = '\nD\n@spaces/' + request.space_id + '/devices/' + update_devices[i] + ' \u0007'
      }
      var body = strToArrayBuffer(sbody);
      srequest.send(body);
    }
  };
  var mbody_str = '\n\u0013spaces/' + request.space_id + '\u0012\u0002\n\u0000\u001a\u0002\n\u0000';
  var mbody = strToArrayBuffer(mbody_str);
  mrequest.send(mbody);
}

// Send CreateMeetingRecording
function start_recording(request, sendResponse) {
  console.log("content.js: start_recording() called");
  create_meeting_recording(request);
}

function create_meeting_recording(request) {
  console.log("create_meeting_recording called");
  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/CreateMeetingRecording?', // append ? to avoid our webRequests
    true
  );

  mrequest.onload = function (e) {
    console.log('start recording response in base64: ' + this.responseText);
    var response_str = window.atob(this.responseText)
    console.log(response_str);
    var recording_id = response_str.match("Cspaces/.*/recordings/[a-f,0-9,-]*")[0];
    console.log(recording_id);
    list_meeting_recording_acks(request, recording_id);


    /*
    for (i = 0; i < update_devices.length; i++) {
      var srequest = new XMLHttpRequest();
      srequest.withCredentials = true;
      srequest.open('POST', 'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingDeviceService/UpdateMeetingDevice?', true);
      for (n = 0; n < request.send_headers.length; n++) {
        if (!skip_headers.includes(request.send_headers[n].name)) {
          srequest.setRequestHeader(request.send_headers[n].name, request.send_headers[n].value);
        }
      }
      if (action === 'mute') {
        var sbody = '\n\u0086\u0001\n@spaces/' + request.space_id + '/devices/' + update_devices[i] + 'bB\n@spaces/' + request.space_id + '/devices/' + updater_id;
      } else if (action === 'kick') {
        var sbody = '\nD\n@spaces/' + request.space_id + '/devices/' + update_devices[i] + ' \u0007'
      }
      var body = strToArrayBuffer(sbody);
      srequest.send(body);
    }
    */
  };

  mrequest.onerror = function () {
    console.log("** An error occurred during the transaction");
    console.log(this);
  };

  // Make headers except unnecessary ones
  for (i = 0; i < request.send_headers.length; i++) {
    if (!skip_headers.includes(request.send_headers[i].name)) {
      mrequest.setRequestHeader(request.send_headers[i].name, request.send_headers[i].value);
    }
  }

  var payload = create_meeting_recording_payload("spaces/" + request.space_id);
  console.log("sending: " + payload);
  mrequest.send(payload);
}

// Make create_meeting_recording payloads
/*
payload string is like "spaces/C9gZmAU5xVwBh"
bynary:
  0: 10 1: 19
  2 to  8:  spaces/
  9 to 20: 2UJQ1T4tt_sB
  21: 18 22: 2 23: 104 24: 1
*/
function create_meeting_recording_payload(str) {
  var bytes = new Uint8Array(25);
  bytes[0] = 10;
  bytes[1] = 19;
  for (var i = 2; i <= 20; i++) {
    bytes[i] = str.charCodeAt(i - 2);
  }
  bytes[21] = 18;
  bytes[22] = 2;
  bytes[23] = 104;
  bytes[24] = 1;
  return bytes;
}

function list_meeting_recording_acks(request, recording_id) {
  console.log("list_meeting_recording_acks called");
  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/ListMeetingRecordingAcks',
    true
  );

  mrequest.onload = function (e) {
    console.log('list_meeting_recording_acks response in base64: ');
    console.log(this.responseText);
    var response_str = window.atob(this.responseText)
    console.log(response_str);

    update_meeting_recording(request, recording_id);
  };

  mrequest.onerror = function () {
    console.log("** An error occurred during the transaction");
    console.log(this);
  };

  // Make headers except unnecessary ones
  for (i = 0; i < request.send_headers.length; i++) {
    if (!skip_headers.includes(request.send_headers[i].name)) {
      mrequest.setRequestHeader(request.send_headers[i].name, request.send_headers[i].value);
    }
  }

  var payload = list_meeting_recording_acks_payload(recording_id)
  console.log("sending: " + payload);
  mrequest.send(payload);
}

/*
0: 10
1-68: Cspaces/CAgJXUk_4r8B/recordings/f6550ece-df38-4898-b866-6eb9bb1b36fd
*/
function list_meeting_recording_acks_payload(str) {
  var bytes = new Uint8Array(69);
  bytes[0] = 10;
  for (var i = 1; i <= 68; i++) {
    bytes[i] = str.charCodeAt(i - 1);
  }
  return bytes;
}

function update_meeting_recording(request, recording_id) {
  console.log("update_meeting_recording called");
  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/UpdateMeetingRecording',
    true
  );

  mrequest.onload = function (e) {
    console.log('update_meeting_recording response in base64: ');
    console.log(this.responseText);
    var response_str = window.atob(this.responseText)
    console.log(response_str);
  };

  mrequest.onerror = function () {
    console.log("** An error occurred during the transaction");
    console.log(this);
  };

  // Make headers except unnecessary ones
  for (i = 0; i < request.send_headers.length; i++) {
    if (!skip_headers.includes(request.send_headers[i].name)) {
      mrequest.setRequestHeader(request.send_headers[i].name, request.send_headers[i].value);
    }
  }

  var payload = update_meeting_recording_payload(recording_id);
  console.log("sending: " + payload);
  mrequest.send(payload);
}

/*
0: 10
1: 73
2: 10
3-70: Cspaces/PfIBBWFYOJoB/recordings/026fc4a9-8d71-4791-8946-bbf404a7d9e1
71: 40
72: 3
73: 104
74: 1
*/
function update_meeting_recording_payload(str) {
  var bytes = new Uint8Array(75);
  bytes[0] = 10;
  bytes[1] = 73;
  bytes[2] = 10;
  for (var i = 3; i <= 70; i++) {
    bytes[i] = str.charCodeAt(i - 3);
  }
  bytes[71] = 40;
  bytes[72] = 3; // if stop, use 4
  bytes[73] = 104;
  bytes[74] = 1;
  return bytes;
}