console.log("background.js");

chrome.runtime.onInstalled.addListener(function () {
  console.log('onInstalled called');
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'meet.google.com' } //,
        // css: [".wUkDMb", ".snByac"]
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

/*
// watch SyncMeetingSpaceCollections and capture request headers
chrome.webRequest.onSendHeaders.addListener(
  // callback
  function (info) {
    console.log("onSendHeaders");
    if (info.initiator != 'https://meet.google.com') {
      console.log('Ignoring CreatingMeetingDevice call from ' + info.initiator);
      //return {cancel: false};
    }
    send_headers = info.requestHeaders;
  },
  // filters
  {
    urls: [
      "https://meet.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/SyncMeetingSpaceCollections"
    ],
    types: ["xmlhttprequest"]
  },
  // opt_extraInfoSpec
  ["requestHeaders", "extraHeaders"]
);
*/

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log("onBeforeRequest");
    return { cancel: details.url.indexOf("://www.evil.com/") != -1 };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);