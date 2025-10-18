(function (global) {
  const cfg = global.SMD_CONFIG || {};
  const KEY = "smd_posts_v1";

  const api = { getPosts, createPost };
  global.SMD_API = api;

  // ---- Router by backend mode ----
  async function getPosts() {
    if (cfg.BACKEND === "rest")     return rest_getPosts();
    if (cfg.BACKEND === "firebase") return firebase_getPosts();
    return mock_getPosts();
  }

  async function createPost(post) {
    if (cfg.BACKEND === "rest")     return rest_createPost(post);
    if (cfg.BACKEND === "firebase") return firebase_createPost(post);
    return mock_createPost(post);
  }

  // ---- Mock (localStorage) ----
  function seed() {
    const now = Date.now();
    return [
      { id: crypto.randomUUID(), title: "Free Curry", desc: "Homemade curry near Shibuya", cat: "🍛 Cooked", lat: 35.6595, lng: 139.7005, createdAt: now, expiresAt: now + 8*3600*1000 },
      { id: crypto.randomUUID(), title: "Extra Bento", desc: "Chicken bento near Ueno",   cat: "🍱 Bento",  lat: 35.7123, lng: 139.7730, createdAt: now, expiresAt: now + 6*3600*1000 },
      { id: crypto.randomUUID(), title: "Bread Pack", desc: "Fresh bread, today only",    cat: "🍞 Bread",  lat: 35.6938, lng: 139.7034, createdAt: now, expiresAt: now + 4*3600*1000 },
    ];
  }
  function purgeExpired(arr) {
    const t = Date.now();
    return arr.filter(p => !p.expiresAt || p.expiresAt > t);
  }
  async function mock_getPosts() {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    if (!arr.length) { arr = seed(); localStorage.setItem(KEY, JSON.stringify(arr)); }
    const cleaned = purgeExpired(arr);
    if (cleaned.length !== arr.length) localStorage.setItem(KEY, JSON.stringify(cleaned));
    return cleaned;
  }
  async function mock_createPost(p) {
    const arr = await mock_getPosts();
    arr.push(p);
    localStorage.setItem(KEY, JSON.stringify(arr));
    return p;
  }


  // ---- REST (stubs; enable later) ----
  async function rest_getPosts() {
    const r = await fetch(`${cfg.API_BASE_URL}/posts`);
    if (!r.ok) throw new Error("REST getPosts failed");
    return await r.json();
  }
  async function rest_createPost(p) {
    const r = await fetch(`${cfg.API_BASE_URL}/posts`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p)
    });
    if (!r.ok) throw new Error("REST createPost failed");
    return await r.json();
  }

  // ---- Firebase (stubs; enable later) ----
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
  async function firebase_getPosts() {
    const db = await ensureFirebase();
    const snap = await db.collection("posts").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  async function firebase_createPost(p) {
    const db = await ensureFirebase();
    const doc = await db.collection("posts").add({ ...p, createdAt: Date.now() });
    return { id: doc.id, ...p, createdAt: Date.now() };
  }

})(window);
