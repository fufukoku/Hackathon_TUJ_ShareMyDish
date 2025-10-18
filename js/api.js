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

  
})(window);
