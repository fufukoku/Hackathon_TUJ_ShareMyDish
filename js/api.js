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

})(window);
