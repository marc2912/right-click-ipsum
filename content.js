// Content script: popup rendering, keyboard nav, text insertion
// Wrapped in IIFE to avoid polluting page scope
(function () {
  // Prevent double-init when injected both declaratively and programmatically
  if (window.__rciContentLoaded) return;
  window.__rciContentLoaded = true;

  // ── Duplicated ipsum generation (content scripts can't import ES modules) ──

  const SOURCE_PARAGRAPHS = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra auctor nunc.",
    "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.",
    "Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc. Sed lacus. Donec lectus. Donec elit diam, faucibus id, tincidunt et, porttitor vel, justo. Sed molestie vestibulum urna. Nunc dignissim risus id metus. Cras ornare tristique elit. Vivamus vestibulum ntulla nec ante. Praesent placerat risus quis eros.",
    "Fusce pellentesque suscipit nibh. Integer vitae libero ac risus egestas placerat. Vestibulum commodo felis quis tortor. Ut aliquam sollicitudin leo. Cras iaculis ultricies nulla. Donec quis dui at dolor tempor interdum. Vivamus molestie gravida turpis. Aenean sit amet magna vel magna fringilla fermentum. Donec sit amet nulla sed arcu pulvinar ultricies commodo id ligula.",
    "Maecenas malesuada elit lectus felis, malesuada ultricies. Curabitur et ligula. Ut molestie a, ultricies porta urna. Vestibulum commodo volutpat a, convallis ac, laoreet enim. Phasellus fermentum in, dolor. Pellentesque facilisis. Nulla imperdiet sit amet magna. Vestibulum dapibus, mauris nec malesuada fames ac turpis velit, rhoncus eu, luctus et interdum adipiscing wisi. Aliquam erat ac ipsum.",
    "Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero. Nullam sit amet turpis. Donec a orci et ipsum pharetra faucibus. Ut euismod sapien eu dui.",
    "Nam mollis tristique neque. Nunc in risus sed urna placerat posuere. Fusce faucibus aliquet turpis. Phasellus id libero eget magna fermentum sollicitudin. Sed tincidunt mattis varius. Nunc sodales dignissim purus. Cras mollis semper risus. Nunc sem augue, gravida vel, pellentesque a, placerat a, est. Aenean hendrerit sem quis nibh. Nunc vel lacus.",
  ];

  function parseSentences(paragraph) {
    return paragraph
      .split(/\.\s+/)
      .map((s) => (s.endsWith(".") ? s : s + "."))
      .filter((s) => s.length > 1);
  }

  const ALL_SENTENCES = SOURCE_PARAGRAPHS.flatMap(parseSentences);

  const SENTENCE_TO_PARAGRAPH = [];
  let sentenceIndex = 0;
  for (let pIdx = 0; pIdx < SOURCE_PARAGRAPHS.length; pIdx++) {
    const count = parseSentences(SOURCE_PARAGRAPHS[pIdx]).length;
    for (let i = 0; i < count; i++) {
      SENTENCE_TO_PARAGRAPH[sentenceIndex++] = pIdx;
    }
  }

  function generateIpsum(type, randomize) {
    const startIdx = randomize
      ? Math.floor(Math.random() * ALL_SENTENCES.length)
      : 0;

    if (type === "1-sentence" || type === "2-sentences") {
      const count = type === "1-sentence" ? 1 : 2;
      const sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(ALL_SENTENCES[(startIdx + i) % ALL_SENTENCES.length]);
      }
      return sentences.join(" ");
    }

    if (type === "1-paragraph" || type === "2-paragraphs") {
      const count = type === "1-paragraph" ? 1 : 2;
      const startParagraph = SENTENCE_TO_PARAGRAPH[startIdx];
      const paragraphs = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(
          SOURCE_PARAGRAPHS[(startParagraph + i) % SOURCE_PARAGRAPHS.length]
        );
      }
      return paragraphs.join("\n\n");
    }

    return "";
  }

  // ── Popup state ──

  let popupHost = null;
  let shadowRoot = null;
  let activeField = null;
  let focusedIndex = -1;
  let menuItems = [];

  // ── Popup styles ──

  const STYLES = `
    :host {
      all: initial;
      position: absolute;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #202124;
    }

    .rci-popup {
      background: #fff;
      border: 1px solid #dadce0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
      min-width: 240px;
      max-width: 320px;
      overflow: hidden;
      padding: 4px 0;
    }

    .rci-section-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #80868b;
      padding: 8px 12px 4px;
      user-select: none;
    }

    .rci-divider {
      height: 1px;
      background: #e8eaed;
      margin: 4px 0;
    }

    .rci-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      cursor: pointer;
      user-select: none;
      transition: background 0.1s;
    }

    .rci-item:hover,
    .rci-item.rci-focused {
      background: #f1f3f4;
    }

    .rci-item-label {
      font-size: 13px;
      color: #202124;
    }

    .rci-item-preview {
      font-size: 12px;
      color: #80868b;
      margin-left: 16px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  // ── Popup rendering ──

  function closePopup() {
    if (popupHost) {
      popupHost.remove();
      popupHost = null;
      shadowRoot = null;
      activeField = null;
      focusedIndex = -1;
      menuItems = [];
    }
  }

  function insertText(el, text) {
    // Restore focus to the field
    el.focus();

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      const selectable = !/^(email|number|date|time|month|week|range|color)$/i.test(el.type);
      if (selectable) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        el.value =
          el.value.substring(0, start) + text + el.value.substring(end);
        el.selectionStart = el.selectionEnd = start + text.length;
      } else {
        el.value += text;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (el.isContentEditable) {
      document.execCommand("insertText", false, text);
    }
  }

  function positionPopup(host, field) {
    const rect = field.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = rect.bottom + scrollY + 4;
    let left = rect.left + scrollX;

    // Adjust if popup overflows viewport bottom
    requestAnimationFrame(() => {
      const popupRect = host.getBoundingClientRect();
      if (popupRect.bottom > window.innerHeight) {
        host.style.top = (rect.top + scrollY - popupRect.height - 4) + "px";
      }
      if (popupRect.right > window.innerWidth) {
        host.style.left = (window.innerWidth - popupRect.width - 8 + scrollX) + "px";
      }
    });

    host.style.top = top + "px";
    host.style.left = left + "px";
  }

  function buildPopup(field, randomize) {
    const fakedata = window.__rci && window.__rci.fakedata;
    const detector = window.__rci && window.__rci.fielddetector;

    const container = document.createElement("div");
    container.className = "rci-popup";
    container.setAttribute("role", "menu");

    const detections = detector ? detector.detect(field) : [];
    const items = []; // { el, action }

    // Smart suggestions section
    if (detections.length > 0 && fakedata) {
      const sectionLabel = document.createElement("div");
      sectionLabel.className = "rci-section-label";
      sectionLabel.textContent = "Suggested for this field";
      container.appendChild(sectionLabel);

      for (const det of detections) {
        const gen = fakedata.generators[det.type];
        const label = fakedata.labels[det.type];
        if (!gen || !label) continue;

        const value = gen();
        const item = document.createElement("div");
        item.className = "rci-item";
        item.setAttribute("role", "menuitem");
        item.innerHTML =
          '<span class="rci-item-label"></span>' +
          '<span class="rci-item-preview"></span>';
        item.querySelector(".rci-item-label").textContent = label;
        item.querySelector(".rci-item-preview").textContent = value;

        items.push({ el: item, text: value });
        container.appendChild(item);
      }

      const divider = document.createElement("div");
      divider.className = "rci-divider";
      container.appendChild(divider);
    }

    // Lorem ipsum section
    const ipsumLabel = document.createElement("div");
    ipsumLabel.className = "rci-section-label";
    ipsumLabel.textContent = "Lorem Ipsum";
    container.appendChild(ipsumLabel);

    const ipsumOptions = [
      { id: "1-sentence", label: "1 Sentence" },
      { id: "2-sentences", label: "2 Sentences" },
      { id: "1-paragraph", label: "1 Paragraph" },
      { id: "2-paragraphs", label: "2 Paragraphs" },
    ];

    for (const opt of ipsumOptions) {
      const item = document.createElement("div");
      item.className = "rci-item";
      item.setAttribute("role", "menuitem");
      item.innerHTML = '<span class="rci-item-label"></span>';
      item.querySelector(".rci-item-label").textContent = opt.label;

      items.push({ el: item, ipsumType: opt.id, randomize });
      container.appendChild(item);
    }

    return { container, items };
  }

  function showPopup(field, randomize) {
    // Close existing popup or toggle off
    if (popupHost) {
      closePopup();
      return;
    }

    activeField = field;

    // Create host element and closed shadow root
    popupHost = document.createElement("div");
    popupHost.id = "rci-popup-host";
    shadowRoot = popupHost.attachShadow({ mode: "closed" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = STYLES;
    shadowRoot.appendChild(style);

    // Build menu
    const { container, items } = buildPopup(field, randomize);
    menuItems = items;
    shadowRoot.appendChild(container);

    // Click handlers on items
    for (const item of items) {
      item.el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let text;
        if (item.text != null) {
          text = item.text;
        } else {
          text = generateIpsum(item.ipsumType, item.randomize);
        }
        closePopup();
        insertText(field, text);
      });
    }

    // Position and append
    document.body.appendChild(popupHost);
    positionPopup(popupHost, field);
  }

  // ── Keyboard navigation ──

  function updateFocus() {
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].el.classList.toggle("rci-focused", i === focusedIndex);
    }
  }

  function handleKeydown(e) {
    if (!popupHost) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closePopup();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = (focusedIndex + 1) % menuItems.length;
      updateFocus();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
      updateFocus();
      return;
    }

    if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      e.stopPropagation();
      const item = menuItems[focusedIndex];
      let text;
      if (item.text != null) {
        text = item.text;
      } else {
        text = generateIpsum(item.ipsumType, item.randomize);
      }
      const field = activeField;
      closePopup();
      insertText(field, text);
    }
  }

  // ── Click outside to close ──

  function handleClickOutside(e) {
    if (!popupHost) return;
    // If click is inside the shadow host, let it through
    if (popupHost.contains(e.target)) return;
    closePopup();
  }

  // ── Event listeners ──

  document.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("mousedown", handleClickOutside, true);

  // ── Message listener from background ──

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action !== "trigger-popup") return;

    const el = document.activeElement;
    if (!el) return;

    // Must be editable
    const isEditable =
      (el.tagName === "INPUT" && !el.readOnly && !el.disabled &&
        /^(text|email|tel|url|search|password|number|)$/i.test(el.type)) ||
      (el.tagName === "TEXTAREA" && !el.readOnly && !el.disabled) ||
      el.isContentEditable;

    if (!isEditable) return;

    // Fetch settings then show popup
    chrome.runtime.sendMessage({ action: "get-settings" }, (response) => {
      const randomize = response && response.randomize || false;
      showPopup(el, randomize);
    });

    sendResponse({ ok: true });
  });
})();
