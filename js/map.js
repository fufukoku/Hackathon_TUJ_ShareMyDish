(function (global) {
  const cfg = global.SMD_CONFIG || {};
  let map, markers = [];
  let appMode = null;      // 'upload' | 'pickup'
  let addMode = false;     // only meaningful in 'upload'

  // Staging state for the "Upload here" flow
  let stagingMarker = null;
  let stagingInfo = null;

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function clearStaging() {
    if (stagingInfo) { stagingInfo.close(); stagingInfo = null; }
    if (stagingMarker) { stagingMarker.setMap(null); stagingMarker = null; }
  }

  function render(posts) {
    // Clear previous markers
    markers.forEach(m => m.setMap(null)); markers = [];

    // Draw active posts only
    posts.forEach(p => {
      if (p.status && p.status !== "active") return;

      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map, title: p.title
      });

      // Info window for pickup users
      const infoId = `info-${p.id}`;
      const contactId = `contact-${p.id}`;
      const codeInputId = `code-${p.id}`;
      const markId = `mark-${p.id}`;

      const expiresLine = p.expiresAt
        ? `<div style="font-size:12px; opacity:.7">Expires: ${new Date(p.expiresAt).toLocaleString()}</div>`
        : `<div style="font-size:12px; opacity:.7">Expires: N/A</div>`;

      const producedLine = p.producedAt
        ? `<div style="font-size:12px; opacity:.7">Created: ${new Date(p.producedAt).toLocaleString()}</div>`
        : "";

      const info = new google.maps.InfoWindow({
        content: `<div id="${infoId}" style="min-width:240px">
          <div style="font-size:16px"><strong>${escapeHtml(p.title)}</strong> <span>${escapeHtml(p.type||p.cat||"")}</span></div>
          <div style="margin:4px 0 6px; font-size:13px">${escapeHtml(p.description||p.desc||"")}</div>
          ${producedLine}
          ${expiresLine}
          <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
            <button id="${contactId}" style="padding:6px 10px; border:1px solid #ddd; border-radius:8px; cursor:pointer;">Contact</button>
            <input id="${codeInputId}" placeholder="Pickup code" style="flex:1; min-width:120px; padding:6px 8px; border:1px solid #ddd; border-radius:8px;" />
            <button id="${markId}" style="padding:6px 10px; border:1px solid #0b57d0; background:#0b57d0; color:#fff; border-radius:8px; cursor:pointer;">Mark as collected</button>
          </div>
        </div>`
      });

      marker.addListener("click", () => {
        info.open(map, marker);
        google.maps.event.addListenerOnce(info, "domready", () => {
          const btnContact = document.getElementById(contactId);
          if (btnContact) {
            btnContact.onclick = () => {
              window.open(`./chat.html?postId=${encodeURIComponent(p.id)}`, "_blank");
            };
          }
          const btnMark = document.getElementById(markId);
          const codeInput = document.getElementById(codeInputId);
          if (btnMark && codeInput) {
            btnMark.onclick = async () => {
              const code = codeInput.value.trim();
              if (!code) return toast("Please enter the pickup code.");
              try {
                const ok = await global.SMD_API.markCollected(p.id, code);
                if (ok && ok.ok) {
                  info.close();
                  await loadAndRender();
                  toast("Marked as collected. Thank you!");
                } else {
                  toast(ok?.error || "Invalid code.");
                }
              } catch (e) {
                console.error(e);
                toast("Failed to mark as collected.");
              }
            };
          }
        });
      });

      markers.push(marker);
    });
  }

  async function loadAndRender() {
    try {
      const posts = await global.SMD_API.getPosts();
      render(posts);
    } catch (e) {
      console.error(e);
      toast("Failed to load posts");
    }
  }

  function wireModeOverlay() {
    const overlay = document.getElementById("modeOverlay");
    const modeUpload = document.getElementById("modeUpload");
    const modePickup = document.getElementById("modePickup");
    const panel = document.getElementById("topPanel");

    if (!overlay || !modeUpload || !modePickup) return;

    const choose = (mode) => {
      appMode = mode; // 'upload' | 'pickup'
      overlay.style.display = "none";
      // In upload mode, show top panel and allow Add Mode
      panel.style.display = mode === "upload" ? "grid" : "none";
      toast(mode === "upload" ? "Upload mode. Click Add Mode to place a staging pin." : "Pick up mode.");
    };

    modeUpload.onclick = () => choose("upload");
    modePickup.onclick = () => choose("pickup");
  }

  function wireButtons() {
    const addBtn = document.getElementById("addModeBtn");
    if (addBtn) {
      addBtn.onclick = () => {
        if (appMode !== "upload") return toast("Add Mode is only for Upload mode.");
        addMode = !addMode;
        addBtn.textContent = `Add Mode: ${addMode ? "ON" : "OFF"}`;
        addBtn.classList.toggle("primary", addMode);
        if (!addMode) clearStaging();
        toast(addMode ? "Click on the map to place a staging pin." : "Add mode off.");
      };
    }
    const locateBtn = document.getElementById("locateBtn");
    if (locateBtn) {
      locateBtn.onclick = () => {
        if (!navigator.geolocation) return toast("Geolocation not supported.");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.panTo(me); map.setZoom(14);
            new google.maps.Marker({
              position: me, map, title: "You are here",
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor:"#0b57d0", fillOpacity:1, strokeColor:"#fff", strokeWeight:2 }
            });
          },
          () => toast("Unable to get your location.")
        );
      };
    }
  }

  // Google Maps callback (invoked after script loads)
  global.initMap = async function () {
    const center = { lat: 35.68, lng: 139.76 }; // Tokyo
    map = new google.maps.Map(document.getElementById("map"), {
      center, zoom: 12, mapTypeControl: false, streetViewControl: false
    });

    wireModeOverlay();
    wireButtons();
    await loadAndRender();

    // Upload flow: click to place a staging pin, then "Upload here" -> upload.html
    map.addListener("click", (e) => {
      if (appMode !== "upload" || !addMode) return;

      clearStaging();

      const title = (document.getElementById("titleInput")?.value || "").trim() || "Shared Dish";
      const desc  = (document.getElementById("descInput")?.value  || "").trim();
      const cat   = (document.getElementById("catInput")?.value    || "🥗 Other");

      stagingMarker = new google.maps.Marker({
        position: e.latLng,
        map,
        title: "[Staging] " + title,
        opacity: 0.9
      });

      const gotoId = "goto-upload";
      const cancelId = "cancel-staging";
      stagingInfo = new google.maps.InfoWindow({
        content: `<div style="min-width:240px">
          <div style="font-size:15px"><strong>${escapeHtml(title)}</strong> <span>${escapeHtml(cat)}</span></div>
          <div style="margin:4px 0 6px; font-size:13px">${escapeHtml(desc || "Select this location to upload your item.")}</div>
          <div style="display:flex; gap:8px;">
            <button id="${gotoId}" style="padding:6px 10px; border:1px solid #0b57d0; background:#0b57d0; color:#fff; border-radius:8px; cursor:pointer;">Upload here</button>
            <button id="${cancelId}" style="padding:6px 10px; border:1px solid #ddd; background:#fff; border-radius:8px; cursor:pointer;">Cancel</button>
          </div>
        </div>`
      });
      stagingInfo.open(map, stagingMarker);

      google.maps.event.addListenerOnce(stagingInfo, "domready", () => {
        const gotoBtn = document.getElementById(gotoId);
        const cancelBtn = document.getElementById(cancelId);
        if (gotoBtn) {
          gotoBtn.onclick = () => {
            const lat = stagingMarker.getPosition().lat();
            const lng = stagingMarker.getPosition().lng();
            // Pass coordinates via query string
            window.location.href = `./upload.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
          };
        }
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            clearStaging();
            toast("Cancelled.");
          };
        }
      });
    });
  };
})(window);
