(function (global) {
  const cfg = global.SMD_CONFIG || {};
  let map, markers = [];
  let addMode = false;

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function render(posts) {
    markers.forEach(m => m.setMap(null)); markers = [];
    posts.forEach(p => {
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map, title: p.title
      });
      const info = new google.maps.InfoWindow({
        content: `<div style="min-width:200px">
          <div style="font-size:16px"><strong>${escapeHtml(p.title)}</strong> <span>${escapeHtml(p.cat||"")}</span></div>
          <div style="margin:4px 0 6px; font-size:13px">${escapeHtml(p.desc||"")}</div>
          <div style="font-size:12px; opacity:.7">
            ${p.expiresAt ? "Expires: " + new Date(p.expiresAt).toLocaleString() : ""}
          </div>
        </div>`
      });
      marker.addListener("click", () => info.open(map, marker));
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

  function wireButtons() {
    document.getElementById("addModeBtn").onclick = () => {
      addMode = !addMode;
      const b = document.getElementById("addModeBtn");
      b.textContent = `Add Mode: ${addMode ? "ON" : "OFF"}`;
      b.classList.toggle("primary", addMode);
      toast(addMode ? "Click map to place a dish pin." : "Add mode off.");
    };
    
    document.getElementById("locateBtn").onclick = () => {
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

  global.initMap = async function () {
    const center = { lat: 35.68, lng: 139.76 }; // Tokyo
    map = new google.maps.Map(document.getElementById("map"), {
      center, zoom: 12, mapTypeControl: false, streetViewControl: false
    });

    wireButtons();
    await loadAndRender();

    // Click to add a new post when Add Mode is ON
    map.addListener("click", async (e) => {
      if (!addMode) return;
      const title = document.getElementById("titleInput")?.value.trim() || "Shared Dish";
      const desc  = document.getElementById("descInput")?.value.trim()  || "Thanks for reducing waste!";
      const cat   = document.getElementById("catInput")?.value || "🥗 Other";
      const expH  = Math.max(1, Math.min(48, parseInt(document.getElementById("expireInput")?.value || "6", 10)));
      const post = {
        id: crypto.randomUUID(),
        title, desc, cat,
        lat: e.latLng.lat(), lng: e.latLng.lng(),
        createdAt: Date.now(), expiresAt: Date.now() + expH * 3600 * 1000
      };
      try {
        await global.SMD_API.createPost(post);
        await loadAndRender();
        toast("Dish added!");
      } catch (err) {
        console.error(err);
        toast("Failed to add dish");
      }
    });
  };
})(window);
