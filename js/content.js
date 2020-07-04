/*
    The Content Script- a JavaScript file that runs in the context of Every Matched Webpage
      By default, Chrome injects content scripts after the DOM is complete.

    NOTE: A big part of this implementation was helped by:
      https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page

      and ESPECIALLY

      https://github.com/ericwbailey/millennials-to-snake-people/blob/master/Source/content_script.js
*/

function walk(rootNode) {
  var walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    ),
    node;

  while ((node = walker.nextNode())) {
    handleText(node);
  }
}

function handleText(textNode) {
  if (
    textNode.parentNode != null &&
    textNode.parentNode.getAttribute("data-text")
  )
    return;
  textNode.nodeValue = replaceText(textNode.nodeValue);
}

function replaceText(v) {
  //Ben Shapiro + Verb/on
  v = v.replace(/\bShapiro on\b/g, "Shortprio defecates all over himself while discussing");
  v = v.replace(/\bShapiro On\b/g, "Shortprio defecates all over himself while discussing");
  v = v.replace(/\bShapiro DESTROYS\b/g, "Shortprio SPEAKS VERY QUICKLY ABOUT");
  v = v.replace(/\bShapiro destroys\b/g, "Shortprio speaks very quickly about");
  v = v.replace(/\bShapiro Destroys\b/g, "Shortprio Speaks Very Quickly About");
  v = v.replace(/\bShapiro blasts\b/g, "Shortprio spews utter nonsense about");
  v = v.replace(/\bShapiro Blasts\b/g, "Shortprio Spews utter nonsense about");

  v = v.replace(/\bBenjamin Aaron Shapiro\b/g, "Small Daddy Shortpiro");
  v = v.replace(/\bbenshapiro\b/g, "benshortpiro");
  v = v.replace(/\bShapiro\b/g, "Shortpiro");
  v = v.replace(/\bshapiro\b/g, "shortpiro");

  //Google Search
  v = v.replace(/\bhapiro\b/g, "hortpiro");
  v = v.replace(/\bapiro\b/g, "ortpiro");

  //The Daily Wire
  v = v.replace(/\bDaily Wire\b/g, "Daily Liar");
  v = v.replace(/\bdaily Wire\b/g, "daily Liar");
  v = v.replace(/\bDaily wire\b/g, "Daily liar");
  v = v.replace(/\bdaily wire\b/g, "daily liar");

  v = v.replace(/\bDailyWire\b/g, "DailyLiar");
  v = v.replace(/\bdailyWire\b/g, "dailyLiar");
  v = v.replace(/\bDailywire\b/g, "Dailyliar");
  v = v.replace(/\bdailywire\b/g, "dailyliar");

  v = v.replace(/\brealDailyWire\b/g, "realDailyLiar");

  //The 'Right' Side of History
  v = v.replace(/\bThe Right Side of History\b/g, "The Wrong Side of History");


  return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
  return (
    node.isContentEditable || // DraftJS and many others
    (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
    (node.tagName &&
      (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
        node.tagName.toLowerCase() == "input"))
  );
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
  var i, node;

  mutations.forEach(function(mutation) {
    for (i = 0; i < mutation.addedNodes.length; i++) {
      node = mutation.addedNodes[i];
      if (isForbiddenNode(node)) {
        // Should never operate on user-editable content
        continue;
      } else if (node.nodeType === 3) {
        // Replace the text for text nodes
        handleText(node);
      } else {
        // Otherwise, find text nodes within the given node and replace text
        walk(node);
      }
    }
  });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
  var docTitle = doc.getElementsByTagName("title")[0],
    observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    },
    bodyObserver,
    titleObserver;

  // Do the initial text replacements in the document body and title
  walk(doc.body);
  doc.title = replaceText(doc.title);

  // Observe the body so that we replace text in any added/modified nodes
  bodyObserver = new MutationObserver(observerCallback);
  bodyObserver.observe(doc.body, observerConfig);

  // Observe the title so we can handle any modifications there
  if (docTitle) {
    titleObserver = new MutationObserver(observerCallback);
    titleObserver.observe(docTitle, observerConfig);
  }
}

//Listens to background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "update_page") {
    sendResponse({ message: "updating..." });
    walk(document.body);
  } else sendResponse({ message: "Did not update" });
});

walkAndObserve(document);
