const checkbox = document.getElementById("randomize");
const status = document.getElementById("status");

chrome.storage.sync.get("randomize", ({ randomize }) => {
  checkbox.checked = randomize || false;
});

checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ randomize: checkbox.checked }, () => {
    status.textContent = "Settings saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 1500);
  });
});
