console.log("Google Meet Autorec: content.js loaded");

/**
 * We use this magic string to check if we can start recording.
 * This string may changes in case of UI updates by Google.
 */
const record_button_selector = "button[jsname='CQylAd']";

/**
 * Listen events from both popup.js and background.js
 */
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // console.trace();
    // console.log(request);

    if (request.command == 'createDevice') {
      create_device(request, sendResponse);
    } else if (request.command == 'start_recording') {
      start_recording(request, sendResponse);
    } else if (request.command == 'stop_recording') {
      stop_recording(request, sendResponse);
    } else if (request.command == 'status') {
      sendResponse(get_status());
    }
    return true;
  }
);

/**
 * Check if we can start recoring.
 * We use magic string to determin it.
 * The string maybe changed in future Google Meet versions.
 * 
 * @returns status
 */
function get_status() {
  console.trace();
  console.log(record_button_selector);
  var elems = document.querySelectorAll(record_button_selector);
  console.log(elems);

  if (elems.length > 0) {
    return "can_record";
  } else {
    return "can_not_record";
  }
}

/**
 * Simulate CreateMeetingDevice request again to get the responce form the server.
 * The responce is send back to background.js to obtain information.
 * 
 * @param {*} request 
 * @param {*} sendResponse 
 */
function create_device(request, sendResponse) {
  // console.trace()

  var xrequest = new XMLHttpRequest();
  xrequest.withCredentials = true;

  xrequest.open("POST", request.url + '?', true); // append ? to avoid our webRequests TODO: check

  request.headers.forEach(header => {
    xrequest.setRequestHeader(header.name, header.value);
  })
  var request_body = base64ToArrayBuffer(request.body); // TODO: check
  xrequest.send(request_body);

  xrequest.onload = function (e) {
    // console.log('sending response: ' + this.responseText);
    sendResponse({ body: this.responseText });
  };
}

// Start recording sequence
function start_recording(request, sendResponse) {
  // console.trace();
  // console.log("Google Meet AutoRec: Start recording");
  create_meeting_recording(request);
  sendResponse("ok");
}

// Stop recording
function stop_recording(request, sendResponse) {
  // console.trace();
  // console.log("Google Meet AutoRec: Stop recording");
  update_meeting_recording(request, "stop")
  sendResponse("ok");
}

var recording_id;

/**
 * Send CreateMeetingRecording to get recording id.
 * 
 * @param {*} request 
 */
function create_meeting_recording(request) {
  // console.trace();
  // console.log("Step 1/3: Send CreateMeetingRecording");

  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/CreateMeetingRecording?', // append ? to avoid our webRequests
    true
  );

  request.headers.forEach(header => {
    mrequest.setRequestHeader(header.name, header.value);
  })
  var payload = create_meeting_recording_payload("spaces/" + request.space_id);
  // console.log("sending: " + payload);
  mrequest.send(payload);

  mrequest.onload = function (e) {
    // console.trace();

    // console.log('start recording response in base64: ' + this.responseText); // this = XMLHttpRequest
    // - response text contains "The conference is gone" on error
    var response_str = window.atob(this.responseText)
    // console.log(response_str);

    recording_id = response_str.match("Cspaces/.*/recordings/[a-f,0-9,-]*")[0];
    // console.log("recording_id=" + recording_id);

    list_meeting_recording_acks(request);
  };
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

/**
 * Step 2/3: Send listMeetingRecordingAcks
 * @param {*} request 
 */
function list_meeting_recording_acks(request) {
  // console.log("Step 2/3: Send listMeetingRecordingAcks");
  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/ListMeetingRecordingAcks',
    true
  );

  request.headers.forEach(header => {
    mrequest.setRequestHeader(header.name, header.value);
  })
  var payload = list_meeting_recording_acks_payload();
  // console.log("sending: " + payload);
  mrequest.send(payload);

  mrequest.onload = function (e) {
    // console.log('list_meeting_recording_acks response in base64: ');
    // console.log(this.responseText); // TODO this?
    var response_str = window.atob(this.responseText)
    // console.log(response_str);

    update_meeting_recording(request, "start");
  };
}

/*
0: 10
1-68: Cspaces/CAgJXUk_4r8B/recordings/f6550ece-df38-4898-b866-6eb9bb1b36fd
*/
function list_meeting_recording_acks_payload() {
  var bytes = new Uint8Array(69);
  bytes[0] = 10;
  for (var i = 1; i <= 68; i++) {
    bytes[i] = recording_id.charCodeAt(i - 1);
  }
  return bytes;
}

/**
 * Step 3/3: Send updateMeetingRecording
 * 
 * @param {*} request 
 * @param {*} command 
 */
function update_meeting_recording(request, command) {
  // console.log("Step 3/3: Send updateMeetingRecording");
  var mrequest = new XMLHttpRequest();

  mrequest.withCredentials = true;
  mrequest.open(
    "POST",
    'https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingRecordingService/UpdateMeetingRecording',
    true
  );

  request.headers.forEach(header => {
    mrequest.setRequestHeader(header.name, header.value);
  })
  var payload = update_meeting_recording_payload(command);
  // console.log("sending: " + payload);
  mrequest.send(payload);

  mrequest.onload = function (e) {
    // console.log('update_meeting_recording response in base64: ');
    // console.log(this.responseText);
    var response_str = window.atob(this.responseText)
    // console.log(response_str);
  };
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
function update_meeting_recording_payload(command) {
  var bytes = new Uint8Array(75);
  bytes[0] = 10;
  bytes[1] = 73;
  bytes[2] = 10;
  for (var i = 3; i <= 70; i++) {
    bytes[i] = recording_id.charCodeAt(i - 3);
  }
  bytes[71] = 40;
  if (command == "start") {
    bytes[72] = 3;
  } else { // if command is "stop", use 4
    bytes[72] = 4;
  }
  bytes[73] = 104;
  bytes[74] = 1;
  return bytes;
}

function base64ToArrayBuffer(base64) { // TODO use?
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function strToArrayBuffer(mystr) { // TODO use?
  var len = mystr.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = mystr.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) { // TODO use?
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
