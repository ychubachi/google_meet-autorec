console.log("popup.js");

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
