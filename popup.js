console.log("popup.js");

// get the current url
chrome.tabs.getSelected(tab => {
  var url = tab.url;
  console.log(`URL: ${url}`);
  $("#url").text(url);
});



$('#okButton').on('click', function () {
  console.log("okButton clicked");

  // store the url if the checkbox is checked
  console.log($("#checkbox").is(':checked'));
  // store url...

  /*
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: 'startRecording' }, function (result) {
      if (!result) {
        alert('maybe some error in the event receiver before sending its response.');
        return;
      }
      $('#result').val($('#result').val() + result);
    });
  });
  */
});