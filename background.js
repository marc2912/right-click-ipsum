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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.parentMenuItemId !== "ipsum-parent") return;

  const { randomize = false } = await chrome.storage.sync.get("randomize");
  const text = generateIpsum(info.menuItemId, randomize);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (ipsumText) => {
      const el = document.activeElement;
      if (!el) return;

      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        el.value =
          el.value.substring(0, start) + ipsumText + el.value.substring(end);
        el.selectionStart = el.selectionEnd = start + ipsumText.length;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (el.isContentEditable) {
        document.execCommand("insertText", false, ipsumText);
      }
    },
    args: [text],
  });
});
