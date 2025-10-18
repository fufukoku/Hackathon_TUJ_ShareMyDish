(function () {
  const params = new URLSearchParams(location.search);
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));

  const imgInput = document.getElementById("imageInput");
  const imgPreview = document.getElementById("imgPreview");
  const typeInput = document.getElementById("typeInput");
  const descInput = document.getElementById("descInput");
  const producedInput = document.getElementById("producedInput"); // <input type="date">
  const expiresInput = document.getElementById("expiresInput");   // <input type="date">
  const naCheckbox = document.getElementById("naCheckbox");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }

  // preview image
  imgInput.addEventListener("change", () => {
    const f = imgInput.files?.[0];
    if (!f) { imgPreview.style.display = "none"; imgPreview.src = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { imgPreview.src = reader.result; imgPreview.style.display = "block"; };
    reader.readAsDataURL(f);
  });

  naCheckbox.addEventListener("change", () => { expiresInput.disabled = naCheckbox.checked; });

  const toStart = s => new Date(s + "T00:00:00").getTime();
  const toEnd   = s => new Date(s + "T23:59:59").getTime();

  submitBtn.onclick = async () => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return alert("Missing map coordinates.");
    if (!typeInput.value.trim()) return toast("Food type is required.");
    if (!descInput.value.trim()) return toast("Description is required.");
    if (!producedInput.value) return toast("Created date is required.");
    if (!expiresInput.value && !naCheckbox.checked) return toast("Please provide an expiry date or check Not applicable.");

    const post = {
      title: typeInput.value.trim(),
      type:  typeInput.value.trim(), // free text string
      description: descInput.value.trim(),
      lat, lng,
      producedAt: toStart(producedInput.value),              // date-only
      expiresAt: naCheckbox.checked ? 0 : toEnd(expiresInput.value), // 0 = N/A for backend
      imageFile: imgInput.files?.[0] || null
    };

    try {
      const r = await window.SMD_API.createPost(post);
      const code = r?.claimCode ? `\n\nClaim code: ${r.claimCode}` : "";
      alert("Upload successful!" + code);
      location.href = "./index.html";
    } catch (e) {
      console.error(e);
      toast("Upload failed.");
    }
  };

  cancelBtn.onclick = () => history.back();
})();
