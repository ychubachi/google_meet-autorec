console.log("popup.js");

chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
  const current_url = e[0].url;
  const meet_id = current_url.match("^https://meet.google.com/(.*)$");
  if (meet_id) {
    $("#meet_id").text(meet_id[1]);
  }
});

$("#checkbox_autorec").on("change", () => {
  if ($("#checkbox_autorec").prop("checked")) {
    $("#textarea_description").prop('disabled', false);
  } else {
    $("#textarea_description").prop('disabled', true);
  }
})

// event listeners
document.getElementById('start_recording').addEventListener('click', start_recording);
document.getElementById('stop_recording').addEventListener('click', stop_recording);

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
