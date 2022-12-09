console.log("Google Meet Autorec: popup.js loaded");

var current_url;
var current_meet_id;

$("#checkbox_autorec").on("change", save_status);
$("#textarea_description").on("change", save_status);
$("#start_recording").on('click', start_recording);
$("#stop_recording").on('click', stop_recording);

chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
  current_url = e[0].url;
  const meet_id = current_url.match("^https://meet.google.com/([a-z-]+).*$");
  if (meet_id && meet_id[1]) {
    current_meet_id = meet_id[1];
    $("#meet_id").text(`Google Meet ID: ${current_meet_id}`);
  } else {
    $("#title").addClass("w3-gray");
    $("#title").addClass("w3-orange w3-text-white");
    $("#main").addClass("w3-text-gray");
    $("#meet_id").text("This is not Google Meet meeting");
    $("#textarea_description").prop("disabled", true);
    $("#checkbox_autorec").prop("disabled", true);
    $("#start_recording").prop("disabled", true);
    $("#stop_recording").prop("disabled", true);
  }
  load_status();
});

function start_recording() {
  console.trace();
  chrome.runtime.sendMessage(
    {
      command: "start_recording"
    },
    function (response) {
      console.log(response);
    }
  );
}

function stop_recording() {
  console.trace();
  chrome.runtime.sendMessage(
    {
      command: "stop_recording"
    },
    function (response) {
      console.log(response);
    }
  );
}

/*
// Code snipets //

// To show all storage data
chrome.storage.sync.get(null, function (result) { console.log(result); });

// To clear all strage data
chrome.storage.sync.clear();
*/

function save_status() {
  console.trace();
  const description = $("#textarea_description").val();
  const enabled = $("#checkbox_autorec").prop("checked");
  // console.log("description=" + description);
  // console.log("enabled=" + enabled);

  chrome.storage.sync.get("autorec", function (result) {
    if (!result["autorec"]) {
      // console.log("create autorec property");
      result = { autorec: {} };
    }
    if (enabled || description) {
      result.autorec[current_meet_id] = { description: description, enabled: enabled };
      // console.log(result.autorec);
    } else {
      delete result.autorec[current_meet_id];
    }

    chrome.storage.sync.set({ autorec: result.autorec }, function () {
      chrome.storage.sync.get(null, function (result) {
        console.log("new data:");
        console.log(result);
      });
    });
  });
}

function load_status() {
  console.trace();

  chrome.storage.sync.get("autorec", function (result) {
    if (!result["autorec"]) {
      console.log("create autorec property");
      result = { autorec: {} };
    }
    const data = result.autorec[current_meet_id];
    if (data) {
      console.log(data.enabled);
      console.log(data.description);
      $("#checkbox_autorec").prop("checked", data.enabled);
      $("#textarea_description").val(data.description);
    }
  });
}
