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