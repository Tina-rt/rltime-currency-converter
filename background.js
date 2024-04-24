chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("serviceWorker.js got a message");
  console.log(request);
  console.log(sender);
  relayToContent(request.data);
  sendResponse("serviceWorker.js got your message and responded");
});

function relayToContent(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    chrome.tabs.sendMessage(tab[0].id, { data: data });
  });
}
