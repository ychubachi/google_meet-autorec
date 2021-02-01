console.log("popup.js");

/*
function mute_all() {
  chrome.runtime.sendMessage({ command: "muteAll" }, function (response) {
    console.log(response);
  });
}

function kick_all() {
  chrome.runtime.sendMessage({ command: "kickAll" }, function (response) {
    console.log(response);
  });
}
*/

function start_recording() {
  console.log("start_recerding() called");
  // fire chrome.runtime.onMessage whose listener is in background.js
  chrome.runtime.sendMessage(
    {
      command: "start_recording"
    },
    function (response) {
      console.log(response);
    }
  );
}

/*
document.getElementById('muteall').addEventListener('click', mute_all);
document.getElementById('kickall').addEventListener('click', kick_all);
*/

document.getElementById('start_recording').addEventListener('click', start_recording);

/*
chrome.tabs.getSelected(tab => {
  var url = tab.url;
  console.log(`URL: ${url}`);
  $("#url").text(url);
});
*/


/*
$('#okButton').on('click', function () {
  console.log("okButton clicked");

  // store the url if the checkbox is checked
  console.log($("#checkbox").is(':checked'));
  // store url...

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: 'startRecording' }, function (result) {
      if (!result) {
        alert('maybe some error in the event receiver before sending its response.');
        return;
      }
      $('#result').val($('#result').val() + result);
    });
  });
});
*/
