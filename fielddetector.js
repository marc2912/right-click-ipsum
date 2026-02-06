// Field type detection via autocomplete, type, name, id, label, placeholder
// Uses window.__rci namespace (content scripts can't use ES modules)
(function () {
  // autocomplete attribute → field type mapping
  const autocompleteMap = {
    "given-name": "firstName",
    "additional-name": "firstName",
    "family-name": "lastName",
    "name": "fullName",
    "email": "email",
    "tel": "phone",
    "tel-national": "phone",
    "url": "url",
    "street-address": "address1",
    "address-line1": "address1",
    "address-line2": "address2",
    "address-level2": "city",
    "address-level1": "state",
    "postal-code": "zip",
    "country-name": "country",
    "country": "country",
    "cc-number": "creditCard",
    "cc-csc": "cvv",
    "cc-exp": "expiration",
  };

  // input type → field type mapping
  const typeMap = {
    "email": "email",
    "tel": "phone",
    "url": "url",
  };

  // Regex patterns for name/id/placeholder attribute matching
  const patterns = [
    { re: /first[_-]?name|fname|given[_-]?name/i, type: "firstName" },
    { re: /last[_-]?name|lname|surname|family[_-]?name/i, type: "lastName" },
    { re: /full[_-]?name|your[_-]?name|^name$/i, type: "fullName" },
    { re: /e[_-]?mail|email[_-]?addr/i, type: "email" },
    { re: /phone|tel(?:ephone)?|mobile|cell/i, type: "phone" },
    { re: /\burl\b|website|homepage/i, type: "url" },
    { re: /address[_-]?(?:1|line1)|street/i, type: "address1" },
    { re: /address[_-]?(?:2|line2)|apt|suite|unit/i, type: "address2" },
    { re: /\bcity\b|locality/i, type: "city" },
    { re: /\bstate\b|province|region/i, type: "state" },
    { re: /\bzip\b|postal[_-]?code|postcode/i, type: "zip" },
    { re: /\bcountry\b/i, type: "country" },
    { re: /card[_-]?num|cc[_-]?num|credit[_-]?card/i, type: "creditCard" },
    { re: /\bcvv\b|\bcvc\b|\bcsc\b|security[_-]?code/i, type: "cvv" },
    { re: /\bexp(?:ir(?:y|ation))?\b|mm\s*\/?\s*yy/i, type: "expiration" },
  ];

  function findLabelText(el) {
    // Check for associated <label> via for attribute
    if (el.id) {
      const label = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (label) return label.textContent.trim();
    }
    // Check for wrapping <label>
    const parent = el.closest("label");
    if (parent) return parent.textContent.trim();
    return "";
  }

  function matchPatterns(text) {
    if (!text) return null;
    for (const p of patterns) {
      if (p.re.test(text)) return p.type;
    }
    return null;
  }

  function detect(el) {
    if (!el) return [];

    // Skip non-editable elements
    const tag = el.tagName;
    if (el.readOnly || el.disabled) return [];

    // textarea and contentEditable get no smart suggestions (only ipsum)
    if (tag === "TEXTAREA" || el.isContentEditable) return [];

    const results = new Map();

    function add(type, confidence) {
      if (!type) return;
      const existing = results.get(type);
      if (!existing || existing < confidence) {
        results.set(type, confidence);
      }
    }

    // 1. autocomplete attribute (highest confidence)
    const ac = (el.getAttribute("autocomplete") || "").trim().toLowerCase();
    if (ac && autocompleteMap[ac]) {
      add(autocompleteMap[ac], 1.0);
    }

    // 2. input type
    if (tag === "INPUT" && typeMap[el.type]) {
      add(typeMap[el.type], 0.9);
    }

    // 3. name attribute
    add(matchPatterns(el.getAttribute("name")), 0.8);

    // 4. id attribute
    add(matchPatterns(el.id), 0.7);

    // 5. placeholder, aria-label, label text
    add(matchPatterns(el.placeholder), 0.6);
    add(matchPatterns(el.getAttribute("aria-label")), 0.6);
    add(matchPatterns(findLabelText(el)), 0.6);

    // Sort by confidence descending
    return Array.from(results.entries())
      .map(([type, confidence]) => ({ type, confidence }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  window.__rci = window.__rci || {};
  window.__rci.fielddetector = { detect };
})();
