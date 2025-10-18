(function (global) {
  const cfg = global.SMD_CONFIG || {};
  const KEY = "smd_posts_v2"; // bump version to avoid old schema collisions

  const api = {
    getPosts,
    getPostById,
    createPost,
    deletePost,      // kept for admin/testing
    markCollected,   // soft hide with code
    getMessages,
    postMessage
  };
  global.SMD_API = api;

  // ---- Router by backend mode ----
  async function getPosts() {
    if (cfg.BACKEND === "rest")     return rest_getPosts();
    if (cfg.BACKEND === "firebase") return firebase_getPosts();
    return mock_getPosts();
  }
  async function getPostById(id) {
    if (cfg.BACKEND === "rest")     return rest_getPostById(id);
    if (cfg.BACKEND === "firebase") return firebase_getPostById(id);
    return mock_getPostById(id);
  }
  async function createPost(post) {
    if (cfg.BACKEND === "rest")     return rest_createPost(post);
    if (cfg.BACKEND === "firebase") return firebase_createPost(post);
    return mock_createPost(post);
  }
  async function deletePost(id) {
    if (cfg.BACKEND === "rest")     return rest_deletePost(id);
    if (cfg.BACKEND === "firebase") return firebase_deletePost(id);
    return mock_deletePost(id);
  }
  async function markCollected(id, code) {
    if (cfg.BACKEND === "rest")     return rest_markCollected(id, code);
    if (cfg.BACKEND === "firebase") return firebase_markCollected(id, code);
    return mock_markCollected(id, code);
  }
  async function getMessages(postId) {
    if (cfg.BACKEND === "rest")     return rest_getMessages(postId);
    if (cfg.BACKEND === "firebase") return firebase_getMessages(postId);
    return mock_getMessages(postId);
  }
  async function postMessage(postId, from, text) {
    if (cfg.BACKEND === "rest")     return rest_postMessage(postId, from, text);
    if (cfg.BACKEND === "firebase") return firebase_postMessage(postId, from, text);
    return mock_postMessage(postId, from, text);
  }

  // ---- Mock (localStorage) ----
  function seed() {
    const now = Date.now();
    return [
      {
        id: crypto.randomUUID(),
        title: "🍛 Cooked - Curry",
        type:  "🍛 Cooked - Curry",
        description: "Homemade curry near Shibuya",
        lat: 35.6595, lng: 139.7005,
        producedAt: now - 2*3600*1000,
        expiresAt: null,
        postedAt: now,
        status: "active",
        accessCode: "CURRY8",
        imageData: null
      },
      {
        id: crypto.randomUUID(),
        title: "🍱 Bento",
        type:  "🍱 Bento",
        description: "Chicken bento near Ueno",
        lat: 35.7123, lng: 139.7730,
        producedAt: now - 1*3600*1000,
        expiresAt: now + 6*3600*1000,
        postedAt: now,
        status: "active",
        accessCode: "BENTO7",
        imageData: null
      }
    ];
  }

  function loadAll() {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    if (!arr.length) { arr = seed(); localStorage.setItem(KEY, JSON.stringify(arr)); }
    return arr;
  }
  function saveAll(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function activeOnly(arr) {
    const t = Date.now();
    return arr.filter(p =>
      (p.status || "active") === "active" &&
      (p.expiresAt == null || p.expiresAt > t)
    );
  }

  async function mock_getPosts() {
    return activeOnly(loadAll());
  }
  async function mock_getPostById(id) {
    return loadAll().find(x => x.id === id) || null;
  }
  async function mock_createPost(p) {
    const all = loadAll();
    all.push(p);
    saveAll(all);
    return p;
  }
  async function mock_deletePost(id) {
    const next = loadAll().filter(x => x.id !== id);
    saveAll(next);
    return { ok: true, id };
  }
  async function mock_markCollected(id, code) {
    const all = loadAll();
    const idx = all.findIndex(x => x.id === id);
    if (idx < 0) return { ok: false, error: "Not found" };
    if (!all[idx].accessCode || all[idx].accessCode !== code) {
      return { ok: false, error: "Invalid code" };
    }
    all[idx].status = "collected";
    all[idx].collectedAt = Date.now();
    saveAll(all);
    return { ok: true, id };
  }

  // Chat (mock)
  function chatKey(postId) { return `smd_chat_${postId}`; }
  async function mock_getMessages(postId) {
    try { return JSON.parse(localStorage.getItem(chatKey(postId)) || "[]"); }
    catch { return []; }
  }
  async function mock_postMessage(postId, from, text) {
    const arr = await mock_getMessages(postId);
    arr.push({ from, text, ts: Date.now() });
    localStorage.setItem(chatKey(postId), JSON.stringify(arr));
    return { ok: true };
  }

  // ---- REST stubs (for future backend) ----
  async function rest_getPosts() {
    const r = await fetch(`${cfg.API_BASE_URL}/posts`);
    if (!r.ok) throw new Error("REST getPosts failed");
    return await r.json();
  }
  async function rest_getPostById(id) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts/${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error("REST getPostById failed");
    return await r.json();
  }
  async function rest_createPost(p) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p)
    });
    if (!r.ok) throw new Error("REST createPost failed");
    return await r.json();
  }
  async function rest_deletePost(id) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!r.ok) throw new Error("REST deletePost failed");
    return await r.json();
  }
  async function rest_markCollected(id, code) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts/${encodeURIComponent(id)}/collect`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    if (!r.ok) throw new Error("REST markCollected failed");
    return await r.json();
  }
  async function rest_getMessages(postId) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts/${encodeURIComponent(postId)}/messages`);
    if (!r.ok) throw new Error("REST getMessages failed");
    return await r.json();
  }
  async function rest_postMessage(postId, from, text) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts/${encodeURIComponent(postId)}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, text })
    });
    if (!r.ok) throw new Error("REST postMessage failed");
    return await r.json();
  }

  // ---- Firebase stubs (for future) ----
  async function ensureFirebase() {
    if (!cfg.FIREBASE?.apiKey) throw new Error("Missing FIREBASE config");
    if (!global.firebase) {
      await loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js");
    }
    const app = global.firebase.apps?.[0] || global.firebase.initializeApp(cfg.FIREBASE);
    return global.firebase.firestore(app);
  }
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  // Implement Firebase analogs if needed later
  async function firebase_getPosts()  { throw new Error("Not implemented"); }
  async function firebase_getPostById(){ throw new Error("Not implemented"); }
  async function firebase_createPost(){ throw new Error("Not implemented"); }
  async function firebase_deletePost(){ throw new Error("Not implemented"); }
  async function firebase_markCollected(){ throw new Error("Not implemented"); }
  async function firebase_getMessages(){ throw new Error("Not implemented"); }
  async function firebase_postMessage(){ throw new Error("Not implemented"); }
})(window);
