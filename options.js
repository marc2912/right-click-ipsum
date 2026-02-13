const checkbox = document.getElementById("randomize");
const domainInput = document.getElementById("email-domain");
const tokenInput = document.getElementById("screenshot-token");
const status = document.getElementById("status");

function showSaved() {
  status.textContent = "Settings saved.";
  setTimeout(() => {
    status.textContent = "";
  }, 1500);
}

chrome.storage.sync.get(["randomize", "emailDomain", "screenshotToken"], (result) => {
  checkbox.checked = result.randomize || false;
  domainInput.value = result.emailDomain || "";
  tokenInput.value = result.screenshotToken || "";
});

checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ randomize: checkbox.checked }, showSaved);
});

domainInput.addEventListener("input", () => {
  chrome.storage.sync.set({ emailDomain: domainInput.value.trim() }, showSaved);
});

tokenInput.addEventListener("input", () => {
  chrome.storage.sync.set({ screenshotToken: tokenInput.value }, showSaved);
});
