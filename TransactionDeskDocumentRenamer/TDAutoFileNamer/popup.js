document.addEventListener("DOMContentLoaded", () => {
  const fetchAddressButton = document.getElementById("fetch-address");

  if (fetchAddressButton) {
    fetchAddressButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              files: ["content.js"]
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error("Script injection error:", chrome.runtime.lastError.message);
                document.getElementById("address-display").textContent = "Unable to inject script.";
                return;
              }

              chrome.tabs.sendMessage(tabs[0].id, { action: "getAddress" });
            }
          );
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "displayAddress") {
    document.getElementById("address-display").textContent = `Address: ${request.address}`;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "renameForms", address: request.address });
    });

    sendResponse({ status: "Display confirmed" });
  }
});