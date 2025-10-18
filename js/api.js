(function (global) {
  const cfg = global.SMD_CONFIG || {};
  const base = () => (cfg.API_BASE_URL || "").replace(/\/$/, "");
  const imgBase = () => (cfg.IMAGE_BASE_URL || "").replace(/\/$/, "");
  const q = p => base() + p;

  // ---- Public API used by the app ----
  async function getPosts(opts = {}) { return rest_getPosts(opts); }
  async function getPostById(id, opts = {}) {
    const posts = await rest_getPosts(opts.center || {});
    return posts.find(p => String(p.id) === String(id)) || null;
  }
  async function createPost(p) { return rest_createPost(p); }
  async function markCollected(id, code) { return rest_markCollected(id, code); }

  global.SMD_API = { getPosts, getPostById, createPost, markCollected };

  // ---- REST implementations ----
  async function rest_getPosts(opts = {}) {
    const lat = opts.lat ?? 35.68;    // default Tokyo center
    const lng = opts.lng ?? 139.76;
    const res = await fetch(q(`/api/v1/food/view?x=${encodeURIComponent(lat)}&y=${encodeURIComponent(lng)}`), {
      method: "POST"
    });
    if (!res.ok) throw new Error("view failed");
    const j = await res.json();
    const list = j?.data || j || [];
    return list.map(r => ({
      id: r.id,
      title: r.foodName || r.foodType || "Food",
      type: r.foodType || "",
      description: r.description || "",
      lat: r.x,
      lng: r.y,
      producedAt: r.createTime || null,
      // backend uses 0 to mean N/A
      expiresAt: r.expireTime === 0 ? null : (r.expireTime || null),
      status: r.status === 1 ? "collected" : "active",
      imageData: r.foodImage ? `${imgBase()}/${r.foodImage}` : null
    }));
  }

  async function rest_createPost(p) {
    // 1) upload image -> token (optional)
    let token = p.token || null;
    if (p.imageFile) {
      const fd = new FormData();
      fd.append("file", p.imageFile);
      const up = await fetch(q("/api/v1/image/upload"), { method: "POST", body: fd });
      if (!up.ok) throw new Error("image upload failed");
      const uj = await up.json();
      token = uj?.data?.token || null; // valid for a short time
    }

    // 2) create food record
    const payload = {
      foodName: p.title,
      description: p.description,
      x: p.lat,
      y: p.lng,
      foodType: p.type,
      createTime: p.producedAt,
      // 0 means N/A on backend
      expireTime: p.expiresAt ?? 0,
      token
    };
    const res = await fetch(q("/api/v1/food/record"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("record failed");
    const j = await res.json();
    return { ok: true, claimCode: j?.data?.claimCode || null };
  }

  async function rest_markCollected(fid, code) {
    const params = new URLSearchParams({ code: String(code || ""), fid: String(fid) });
    const res = await fetch(q(`/api/v1/food/claim?${params.toString()}`), { method: "POST" });
    const j = await res.json().catch(() => ({}));
    const ok = j?.code === 200 || /success/i.test(String(j?.message || j?.data || ""));
    return ok ? { ok: true } : { ok: false, error: j?.message || "Failed to claim" };
  }
})(window);
