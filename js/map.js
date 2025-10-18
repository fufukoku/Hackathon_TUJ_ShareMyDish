(function (global) {
  let map, markers = [];
  let appMode = null;      // 'upload' | 'pickup'
  let meMarker = null;     // user's current location marker

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

  function updateModeHint() {
    const el = document.getElementById("modeHint");
    const overlay = document.getElementById("modeOverlay");
    if (!el) return;
    if (!appMode) { el.style.display = "none"; return; }
    el.style.display = "flex";
    if (appMode === "upload") {
      el.innerHTML = `Upload mode — click the map to choose a location. <span id="changeMode" class="link">Change mode</span>`;
    } else {
      el.innerHTML = `Pick up mode — tap a pin to view details. <span id="changeMode" class="link">Change mode</span>`;
    }
    const change = document.getElementById("changeMode");
    if (change) {
      change.onclick = () => {
        clearStaging();
        overlay.style.display = "flex";
      };
    }
  }

  function render(posts) {
    markers.forEach(m => m.setMap(null)); markers = [];

    posts.forEach(p => {
      if (p.status && p.status !== "active") return;

      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map, title: p.title
      });

      const infoId = `info-${p.id}`;
      const contactId = `contact-${p.id}`;
      const codeInputId = `code-${p.id}`;
      const markId = `mark-${p.id}`;

      const producedLine = p.producedAt
        ? `<div style="font-size:12px; opacity:.7">Created: ${new Date(p.producedAt).toLocaleDateString()}</div>`
        : "";

      const expiresLine = p.expiresAt
        ? `<div style="font-size:12px; opacity:.7">Expires: ${new Date(p.expiresAt).toLocaleDateString()}</div>`
        : `<div style="font-size:12px; opacity:.7">Expires: N/A</div>`;

      const info = new google.maps.InfoWindow({
        content: `<div id="${infoId}" style="min-width:240px">
          ${p.imageData ? `<img src="${p.imageData}" alt="" style="max-width:100%; border-radius:10px; margin-bottom:8px; border:1px solid #eee;" />` : ""}
          <div style="font-size:16px"><strong>${escapeHtml(p.title)}</strong> <span>${escapeHtml(p.type||"")}</span></div>
          <div style="margin:4px 0 6px; font-size:13px">${escapeHtml(p.description||"")}</div>
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
      const c = map.getCenter();
      const posts = await global.SMD_API.getPosts({ lat: c.lat(), lng: c.lng() });
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
    if (!overlay || !modeUpload || !modePickup) return;

    const choose = (mode) => {
      appMode = mode;
      overlay.style.display = "none";
      updateModeHint();
      toast(mode === "upload" ? "Upload mode. Click the map to choose a location." : "Pick up mode.");
    };
    modeUpload.onclick = () => choose("upload");
    modePickup.onclick = () => choose("pickup");
  }

  function wireLocateButton() {
    const locateBtn = document.getElementById("locateBtn");
    if (!locateBtn) return;
    locateBtn.onclick = () => {
      if (!navigator.geolocation) return toast("Geolocation not supported.");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.panTo(me); map.setZoom(14);
          if (meMarker) meMarker.setMap(null);
          meMarker = new google.maps.Marker({
            position: me, map, title: "You are here",
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor:"#0b57d0", fillOpacity:1, strokeColor:"#fff", strokeWeight:2 }
          });
        },
        () => toast("Unable to get your location.")
      );
    };
  }

  global.initMap = async function () {
    const center = { lat: 35.68, lng: 139.76 }; // Tokyo
    map = new google.maps.Map(document.getElementById("map"), {
      center, zoom: 12, mapTypeControl: false, streetViewControl: false
    });

    wireModeOverlay();
    wireLocateButton();
    await loadAndRender();

    // In upload mode, clicking the map opens a staging pin -> Upload page
    map.addListener("click", (e) => {
      if (appMode !== "upload") return;

      if (stagingInfo) { stagingInfo.close(); stagingInfo = null; }
      if (stagingMarker) { stagingMarker.setMap(null); stagingMarker = null; }

      stagingMarker = new google.maps.Marker({
        position: e.latLng,
        map,
        title: "[Staging]",
        opacity: 0.9
      });

      const gotoId = "goto-upload";
      const cancelId = "cancel-staging";
      stagingInfo = new google.maps.InfoWindow({
        content: `<div style="min-width:240px">
          <div style="font-size:15px"><strong>Use this location?</strong></div>
          <div style="margin:6px 0; font-size:13px">Click “Upload here” to fill in the details.</div>
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

    // reload when map movement stops
    map.addListener("idle", loadAndRender);
  };
})(window);
