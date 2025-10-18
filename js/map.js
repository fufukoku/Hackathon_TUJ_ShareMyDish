(function (global) {
  let map, markers = [];

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
        </div>`
      });
      marker.addListener("click", () => info.open(map, marker));
      markers.push(marker);
    });
  }

  async function loadAndRender() {
    const posts = await global.SMD_API.getPosts();
    render(posts);
  }

  // Google Maps callback (referenced by script tag)
  global.initMap = async function () {
    const center = { lat: 35.68, lng: 139.76 }; // Tokyo
    map = new google.maps.Map(document.getElementById("map"), {
      center, zoom: 12, mapTypeControl: false, streetViewControl: false
    });
    await loadAndRender();
  };
})(window);
