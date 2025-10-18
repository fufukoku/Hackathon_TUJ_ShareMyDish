(function () {
  const params = new URLSearchParams(location.search);
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));

  const imgInput = document.getElementById("imageInput");
  const imgPreview = document.getElementById("imgPreview");
  const typeInput = document.getElementById("typeInput");
  const descInput = document.getElementById("descInput");
  const producedInput = document.getElementById("producedInput");
  const expiresInput = document.getElementById("expiresInput");
  const naCheckbox = document.getElementById("naCheckbox");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }

  // Preview uploaded image
  imgInput.addEventListener("change", () => {
    const file = imgInput.files?.[0];
    if (!file) { imgPreview.style.display = "none"; imgPreview.src=""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      imgPreview.src = reader.result;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // Toggle expiry field by N/A checkbox
  naCheckbox.addEventListener("change", () => {
    expiresInput.disabled = naCheckbox.checked;
  });

  // Helpers: convert a YYYY-MM-DD to start/end of day timestamp (local)
  function startOfDay(dateStr) {
    return new Date(dateStr + "T00:00:00").getTime();
  }
  function endOfDay(dateStr) {
    return new Date(dateStr + "T23:59:59").getTime();
  }

  // Submit
  submitBtn.onclick = async () => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return alert("Missing map coordinates.");
    if (!typeInput.value) return toast("Food type is required.");
    if (!descInput.value.trim()) return toast("Description is required.");
    if (!producedInput.value) return toast("Created date is required.");
    if (!expiresInput.value && !naCheckbox.checked) return toast("Please provide an expiry date or check Not applicable.");

    const post = {
    id: crypto.randomUUID(),
    title: typeInput.value.trim(),
    type:  typeInput.value.trim(),   // <-- string
    description: descInput.value.trim(),
    lat, lng,
    producedAt: startOfDay(producedInput.value),
    expiresAt: naCheckbox.checked ? null : endOfDay(expiresInput.value),
    postedAt: Date.now(),
    status: "active",
    accessCode: generateCode(),
    imageData: imgPreview.src || null,
    };


    try {
      await window.SMD_API.createPost(post);
      alert("Upload successful!\n\nYour pickup code (share with the taker): " + post.accessCode);
      location.href = "./index.html";
    } catch (e) {
      console.error(e);
      toast("Upload failed.");
    }
  };

  cancelBtn.onclick = () => history.back();

  function generateCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
  }
})();
