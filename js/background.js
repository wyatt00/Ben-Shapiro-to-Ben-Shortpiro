// For all Twitter tabs, execute the content script on extension installation
chrome.runtime.onInstalled.addListener(function() {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      if (
        tabs[i].url.search("http://www.twitter.com") == 0 ||
        tabs[i].url.search("https://www.twitter.com") == 0 ||
        tabs[i].url.search("https://twitter.com") == 0 ||
        tabs[i].url.search("http://twitter.com") == 0
      )
        chrome.tabs.executeScript(tabs[i].id, { file: "js/content.js" });
    }
  });
});

// When Twitter is selected, we need to constantly update the page (Every 2s).
var timer = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  change(tab);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    change(tab);
  });
});

function change(tab) {
  if (
    tab.url.search("http://www.twitter.com") == 0 ||
    tab.url.search("https://www.twitter.com") == 0 ||
    tab.url.search("https://twitter.com") == 0 ||
    tab.url.search("http://twitter.com") == 0
  ) {
    clearInterval(timer);
    timer = setInterval(sendMsg, 2000);
  } else clearInterval(timer);
}

function sendMsg() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length)
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "update_page" },
        response => {}
      );
  });
}
