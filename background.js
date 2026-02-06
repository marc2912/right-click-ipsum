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
  if (command !== "trigger-ipsum-popup") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    // Inject into all frames (no-op if already loaded via manifest)
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
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== "get-settings") return;
  chrome.storage.sync.get("randomize", ({ randomize }) => {
    sendResponse({ randomize: randomize || false });
  });
  return true;
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
