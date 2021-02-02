console.log("popup.js");

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

document.getElementById('start_recording').addEventListener('click', start_recording);
