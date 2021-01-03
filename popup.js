console.log("popup.js");

$('#okButton').on('click', function () {
  console.log("okButton clicked");
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