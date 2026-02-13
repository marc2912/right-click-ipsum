(() => {
  if (window.__rciScreenshotLoaded) return;
  window.__rciScreenshotLoaded = true;

  let overlay = null;

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "start-selection") {
      startSelection(msg.dataUrl);
    }
  });

  function startSelection(dataUrl) {
    if (overlay) overlay.remove();

    const dpr = window.devicePixelRatio || 1;

    // Main overlay container
    overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      cursor: "crosshair",
      margin: "0",
      padding: "0",
    });

    // Background image layer (the captured screenshot)
    const imgLayer = document.createElement("div");
    Object.assign(imgLayer.style, {
      position: "absolute",
      inset: "0",
      backgroundImage: `url(${dataUrl})`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
    });

    // Dark dim layer on top of the image
    const dimLayer = document.createElement("div");
    Object.assign(dimLayer.style, {
      position: "absolute",
      inset: "0",
      background: "rgba(0,0,0,0.4)",
    });

    // Clear selection area (sits between image and dim, punches through dim)
    const selectionBox = document.createElement("div");
    Object.assign(selectionBox.style, {
      position: "absolute",
      border: "2px solid #1a73e8",
      display: "none",
      pointerEvents: "none",
      zIndex: "2",
    });

    overlay.appendChild(imgLayer);
    overlay.appendChild(dimLayer);
    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);

    let startX, startY, isSelecting = false;

    function updateSelection(x1, y1, x2, y2) {
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);

      Object.assign(selectionBox.style, {
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px",
        display: "block",
      });

      // Use clip-path on the dim layer to cut out the selected region
      dimLayer.style.clipPath = `polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
        ${left}px ${top}px,
        ${left}px ${top + height}px,
        ${left + width}px ${top + height}px,
        ${left + width}px ${top}px,
        ${left}px ${top}px
      )`;
    }

    function cleanup() {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        document.removeEventListener("keydown", onKeyDown, true);
      }
    }

    document.addEventListener("keydown", onKeyDown, true);

    overlay.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      isSelecting = true;
    });

    overlay.addEventListener("mousemove", (e) => {
      if (!isSelecting) return;
      e.preventDefault();
      updateSelection(startX, startY, e.clientX, e.clientY);
    });

    overlay.addEventListener("mouseup", (e) => {
      if (!isSelecting) return;
      isSelecting = false;
      document.removeEventListener("keydown", onKeyDown, true);

      const endX = e.clientX;
      const endY = e.clientY;
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      // Ignore zero-area or very small selections (accidental clicks)
      if (width < 5 || height < 5) {
        cleanup();
        return;
      }

      cleanup();
      cropAndUpload(dataUrl, left, top, width, height, dpr);
    });
  }

  function cropAndUpload(dataUrl, left, top, width, height, dpr) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sw = Math.round(width * dpr);
      const sh = Math.round(height * dpr);
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        Math.round(left * dpr),
        Math.round(top * dpr),
        sw,
        sh,
        0,
        0,
        sw,
        sh
      );
      const croppedDataUrl = canvas.toDataURL("image/png");
      uploadScreenshot(croppedDataUrl);
    };
    img.src = dataUrl;
  }

  function uploadScreenshot(croppedDataUrl) {
    const toast = showToast("Uploading...");

    chrome.runtime.sendMessage(
      { action: "upload-screenshot", dataUrl: croppedDataUrl },
      (response) => {
        if (chrome.runtime.lastError) {
          updateToast(toast, "Upload failed: " + chrome.runtime.lastError.message, true);
          autoDismissToast(toast, 3000);
          return;
        }

        if (response?.success) {
          copyToClipboard(response.url).then(() => {
            updateToast(toast, "URL copied to clipboard!");
            autoDismissToast(toast, 2000);
          }).catch(() => {
            updateToast(toast, "Uploaded but clipboard write failed.", true);
            autoDismissToast(toast, 3000);
          });
        } else {
          updateToast(toast, response?.error || "Upload failed.", true);
          autoDismissToast(toast, 3000);
        }
      }
    );
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for contexts where navigator.clipboard is unavailable
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        ta.remove();
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement("div");
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "2147483647",
      padding: "10px 16px",
      borderRadius: "8px",
      background: "#323232",
      color: "#fff",
      fontSize: "14px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "opacity 0.3s",
      opacity: "1",
      maxWidth: "350px",
      wordBreak: "break-word",
    });
    toast.textContent = message;
    document.body.appendChild(toast);
    return toast;
  }

  function updateToast(toast, message, isError) {
    toast.textContent = message;
    if (isError) {
      toast.style.background = "#d93025";
    } else {
      toast.style.background = "#1a73e8";
    }
  }

  function autoDismissToast(toast, delay) {
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, delay);
  }
})();
