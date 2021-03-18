console.log("popup.js");

var current_url;

chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
  current_url = e[0].url;
  const meet_id = current_url.match("^https://meet.google.com/(.*)$");
  if (meet_id) {
    $("#meet_id").text(`Google Meet: ${meet_id[1]}`);
  } else {
    $("#meet_id").text("Not Google Meet page");
    /*
    $("#textarea_description").prop("disabled", true);
    $("#checkbox_autorec").prop("disabled", true);
    $("#start_recording").prop("disabled", true);
    $("#stop_recording").prop("disabled", true);
    */
  }

  load_status();

  /*
  get_description_from_list(current_url, function (description) {
    console.log("description=" + description);
    if (description) {
      $("#checkbox_autorec").prop("checked", true);
      $("#textarea_description").val(description);
    } else {
      $("#checkbox_autorec").prop("checked", false);
      $("#textarea_description").val("");
    }
  });
  */
});

$("#checkbox_autorec").on("change", save_status);
$("#textarea_description").on("change", save_status);

// event listeners
$("#start_recording").on('click', start_recording);
$("#stop_recording").on('click', stop_recording);

/*
// Code snipets

// To show all storage data
chrome.storage.sync.get(null, function (result) { console.log(result); });

// To clear all strage data
chrome.storage.sync.clear();
*/

function start_recording() {
  console.trace();

  /*
    chrome.runtime.sendMessage(
      {
        command: "start_recording"
      },
      function (response) {
        console.log(response);
      }
    );
    */
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

function save_status() {
  console.trace();
  const description = $("#textarea_description").val();
  const enabled = $("#checkbox_autorec").prop("checked");
  console.log("description=" + description);
  console.log("enabled=" + enabled);

  chrome.storage.sync.get("autorec", function (result) {
    if (!result["autorec"]) {
      console.log("create autorec property");
      result = { autorec: {} };
    }
    if (enabled || description) {
      result.autorec[current_url] = { description: description, enabled: enabled };
      console.log(result.autorec);
    } else {
      delete result.autorec[current_url];
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
    const data = result.autorec[current_url];
    if (data) {
      console.log(data.enabled);
      console.log(data.description);
      $("#checkbox_autorec").prop("checked", data.enabled);
      $("#textarea_description").val(data.description);
    }
  });
}

function add_url_to_list(url, description) {
  chrome.storage.sync.get("autorec", function (result) {
    console.log("key=autorec");
    console.log(result);
    if (!result["autorec"]) {
      console.log("create autorec property");
      result = { autorec: {} };
    }
    result.autorec[url] = description;
    console.log(result.autorec);

    chrome.storage.sync.set({ autorec: result.autorec }, function () {
      chrome.storage.sync.get(null, function (result) {
        console.log("new data:");
        console.log(result);
      });
    });
  });
}

function get_description_from_list(url, callback) {
  chrome.storage.sync.get("autorec", function (result) {
    if (!result["autorec"]) {
      callback(null);
    }
    const description = result.autorec[url];
    callback(description);
  });
}


function delete_url_from_list(url) {
  chrome.storage.sync.get("autorec", function (result) {
    console.log("key=autorec");
    console.log(result);
    if (!result["autorec"]) {
      return;
    }
    delete result.autorec[url];
    console.log(result.autorec);

    chrome.storage.sync.set({ autorec: result.autorec }, function () {
      chrome.storage.sync.get(null, function (result) {
        console.log("new data:");
        console.log(result);
      });
    });
  });
}
