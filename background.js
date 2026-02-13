import { generateIpsum } from "./ipsum.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ipsum-parent",
    title: "Ipsum",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "1-sentence",
    parentId: "ipsum-parent",
    title: "1 Sentence",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "2-sentences",
    parentId: "ipsum-parent",
    title: "2 Sentences",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "1-paragraph",
    parentId: "ipsum-parent",
    title: "1 Paragraph",
    contexts: ["editable"],
  });

  chrome.contextMenus.create({
    id: "2-paragraphs",
    parentId: "ipsum-parent",
    title: "2 Paragraphs",
    contexts: ["editable"],
  });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "trigger-ipsum-popup") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ["fakedata.js", "fielddetector.js", "content.js"],
      });
    } catch {
      // Some frames may not be injectable
    }
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "trigger-popup" });
    } catch {
      // Content script not available (chrome:// pages, pre-install tabs)
    }
  } else if (command === "trigger-form-fill") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ["fakedata.js", "fielddetector.js", "content.js"],
      });
    } catch {
      // Some frames may not be injectable
    }
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "trigger-form-fill" });
    } catch {
      // Content script not available
    }
  } else if (command === "trigger-screenshot") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["screenshot.js"],
      });
      await chrome.tabs.sendMessage(tab.id, {
        action: "start-selection",
        dataUrl,
      });
    } catch {
      // Cannot capture or inject on this page
    }
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "get-settings") {
    chrome.storage.sync.get(["randomize", "emailDomain"], ({ randomize, emailDomain }) => {
      sendResponse({ randomize: randomize || false, emailDomain: emailDomain || "" });
    });
    return true;
  }

  if (msg.action === "upload-screenshot") {
    (async () => {
      try {
        const { screenshotToken } = await chrome.storage.sync.get("screenshotToken");
        if (!screenshotToken) {
          sendResponse({ success: false, error: "No API token configured. Set it in extension settings." });
          return;
        }

        const base64 = msg.dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/png" });

        const formData = new FormData();
        formData.append("file", blob, "screenshot.png");
        formData.append("folder", "screenshots");

        const resp = await fetch("https://image.wondersauce.app/api/ext-upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${screenshotToken}` },
          body: formData,
        });

        if (!resp.ok) {
          const text = await resp.text();
          sendResponse({ success: false, error: `Upload failed (${resp.status}): ${text}` });
          return;
        }

        const data = await resp.json();
        sendResponse({ success: true, url: data.url });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.parentMenuItemId !== "ipsum-parent") return;
  if (!tab?.id) return;

  const { randomize = false } = await chrome.storage.sync.get("randomize");
  const text = generateIpsum(info.menuItemId, randomize);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (ipsumText) => {
        const el = document.activeElement;
        if (!el) return;

        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          const selectable = !/^(email|number|date|time|month|week|range|color)$/i.test(el.type);
          if (selectable) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.value =
              el.value.substring(0, start) + ipsumText + el.value.substring(end);
            el.selectionStart = el.selectionEnd = start + ipsumText.length;
          } else {
            el.value += ipsumText;
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (el.isContentEditable) {
          document.execCommand("insertText", false, ipsumText);
        }
      },
      args: [text],
    });
  } catch {
    // Cannot inject into this page (chrome://, web store, etc.)
  }
});
