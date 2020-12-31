// Update the declarative rules on install or upgrade.
//chrome.runtime.onInstalled.addListener(function () {
//  console.log("onInstalled called");
//});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'meet.google.com' },
        css: [".NlWrkb", ".snByac"]
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});