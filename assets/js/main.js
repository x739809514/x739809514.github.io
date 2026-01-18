const STORAGE_KEYS = {
  profile: "personalBrand.profile",
  gallery: "personalBrand.gallery",
  notes: "personalBrand.notes",
  auth: "personalBrand.auth",
  adminCredentials: "personalBrand.adminCredentials"
};

const defaultProfile = {
  name: "Alex Mercer",
  title: "Product Designer + Builder",
  bio: "I craft warm, human-centered digital products and document the messy middle. This space is my studio log, gallery, and slow thinking lab.",
  location: "Austin / Remote",
  avatarData: "",
  socials: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    x: "https://x.com/"
  }
};

const defaultGallery = [
  {
    id: "gal-1",
    title: "Night Garden UI",
    detail: "Experimental interface for a botanical data story.",
    image: "Concept A"
  },
  {
    id: "gal-2",
    title: "Urban Sound Map",
    detail: "A layered atlas blending audio, texture, and typography.",
    image: "Concept B"
  },
  {
    id: "gal-3",
    title: "Studio Inventory",
    detail: "Internal tooling for a creative collective.",
    image: "Concept C"
  },
  {
    id: "gal-4",
    title: "Ritual Tracker",
    detail: "Minimal habit planner with tactile feedback.",
    image: "Concept D"
  }
];

const defaultNotes = [
  {
    id: "note-1",
    title: "Designing With Slow Data",
    date: "2025-01-12",
    category: "Product",
    content: "## The premise\n\nSlow data means choosing fewer signals with more intention.\n\n### Signals I trust\n- Ambient user stories\n- Repeated friction points\n- Emotional language in interviews\n\n```\nMeasure what you can hear, not only what you can count.\n```"
  },
  {
    id: "note-2",
    title: "Three Ways to Ship Less",
    date: "2025-01-06",
    category: "Strategy",
    content: "## Shipping less\n\nClarity is a feature. I focus on:\n\n1. Cutting the unclear steps.\n2. Removing the silent dependencies.\n3. Freeing the team from perf theater."
  },
  {
    id: "note-3",
    title: "Sketchbook: Color as Memory",
    date: "2024-12-20",
    category: "Notes",
    content: "A note on using color palettes that feel familiar, almost edible.\n\n### Palette study\n- Toasted almond\n- Smoked apricot\n- Sea glass"
  }
];

const loadData = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureDefaults = () => {
  if (!localStorage.getItem(STORAGE_KEYS.profile)) {
    saveData(STORAGE_KEYS.profile, defaultProfile);
  }
  if (!localStorage.getItem(STORAGE_KEYS.gallery)) {
    saveData(STORAGE_KEYS.gallery, defaultGallery);
  }
  if (!localStorage.getItem(STORAGE_KEYS.notes)) {
    saveData(STORAGE_KEYS.notes, defaultNotes);
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getGalleryImage = (item) => {
  const rawImage = item.imageData || item.image || "";
  const isUrl = typeof rawImage === "string" && /^(data:image|https?:\/\/)/.test(rawImage);
  const label = item.title || "Gallery Image";
  return {
    url: isUrl ? rawImage : "",
    label
  };
};

const createGalleryCard = (item, index) => {
  const card = document.createElement("div");
  card.className = "card";
  card.style.animationDelay = `${index * 0.12}s`;

  const imageEl = document.createElement("div");
  imageEl.className = "card-image";
  const imageMeta = getGalleryImage(item);
  if (imageMeta.url) {
    imageEl.classList.add("has-image");
    imageEl.style.backgroundImage = `url(${imageMeta.url})`;
    imageEl.textContent = imageMeta.label;
  } else {
    imageEl.textContent = imageMeta.label;
  }

  const titleEl = document.createElement("h3");
  titleEl.textContent = item.title;

  const detailEl = document.createElement("p");
  detailEl.textContent = item.detail;

  card.appendChild(imageEl);
  card.appendChild(titleEl);
  card.appendChild(detailEl);

  if (item.link) {
    const linkBtn = document.createElement("a");
    linkBtn.className = "button link-button";
    linkBtn.href = item.link;
    linkBtn.target = "_blank";
    linkBtn.rel = "noreferrer";
    linkBtn.textContent = "View Project";
    card.appendChild(linkBtn);
  }
  return card;
};

const compressImageFile = (file, options = {}) => {
  if (!file) return Promise.resolve("");
  const { maxWidth = 720, quality = 0.5 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image load failed."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas is not supported."));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

const renderHome = () => {
  const profile = loadData(STORAGE_KEYS.profile, defaultProfile);
  const gallery = loadData(STORAGE_KEYS.gallery, defaultGallery).slice(0, 3);
  const notes = loadData(STORAGE_KEYS.notes, defaultNotes).slice(0, 3);

  const nameEl = document.querySelector("[data-profile-name]");
  const titleEl = document.querySelector("[data-profile-title]");
  const bioEl = document.querySelector("[data-profile-bio]");
  const locationEl = document.querySelector("[data-profile-location]");
  const socialsEl = document.querySelector("[data-profile-socials]");
  const avatarEl = document.querySelector("[data-profile-avatar]");

  if (nameEl) nameEl.textContent = profile.name;
  if (titleEl) titleEl.textContent = profile.title;
  if (bioEl) bioEl.textContent = profile.bio;
  if (locationEl) locationEl.textContent = profile.location;
  if (avatarEl) {
    if (profile.avatarData) {
      avatarEl.textContent = "";
      avatarEl.style.backgroundImage = `url(${profile.avatarData})`;
      avatarEl.style.backgroundSize = "cover";
      avatarEl.style.backgroundPosition = "center";
    } else {
      avatarEl.style.backgroundImage = "";
      avatarEl.textContent = profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
  }

  if (socialsEl) {
    socialsEl.innerHTML = "";
    const socials = [
      { label: "GitHub", url: profile.socials.github },
      { label: "LinkedIn", url: profile.socials.linkedin },
      { label: "X", url: profile.socials.x }
    ];
    socials.forEach((social) => {
      const link = document.createElement("a");
      link.href = social.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = social.label;
      socialsEl.appendChild(link);
    });
  }

  const galleryWrap = document.querySelector("[data-gallery-preview]");
  if (galleryWrap) {
    galleryWrap.innerHTML = "";
    gallery.forEach((item, index) => {
      galleryWrap.appendChild(createGalleryCard(item, index));
    });
  }

  const notesWrap = document.querySelector("[data-notes-preview]");
  if (notesWrap) {
    notesWrap.innerHTML = "";
    notes.forEach((note) => {
      const item = document.createElement("a");
      item.className = "note-item";
      item.href = `note.html?id=${note.id}`;
      item.innerHTML = `
        <div>
          <strong>${note.title}</strong><br />
          <span>${formatDate(note.date)}</span>
        </div>
        <span class="badge">${note.category}</span>
      `;
      notesWrap.appendChild(item);
    });
  }
};

const renderGallery = () => {
  const gallery = loadData(STORAGE_KEYS.gallery, defaultGallery);
  const galleryWrap = document.querySelector("[data-gallery-grid]");
  if (!galleryWrap) return;

  galleryWrap.innerHTML = "";
  gallery.forEach((item, index) => {
    galleryWrap.appendChild(createGalleryCard(item, index));
  });
};

const renderNotesList = () => {
  const notes = loadData(STORAGE_KEYS.notes, defaultNotes);
  const notesWrap = document.querySelector("[data-notes-list]");
  if (!notesWrap) return;

  notesWrap.innerHTML = "";
  notes.forEach((note) => {
    const item = document.createElement("a");
    item.className = "note-item";
    item.href = `note.html?id=${note.id}`;
    item.innerHTML = `
      <div>
        <strong>${note.title}</strong><br />
        <span>${formatDate(note.date)}</span>
      </div>
      <span class="badge">${note.category}</span>
    `;
    notesWrap.appendChild(item);
  });
};

const renderNoteDetail = () => {
  const articleEl = document.querySelector("[data-note-article]");
  if (!articleEl) return;

  const params = new URLSearchParams(window.location.search);
  const noteId = params.get("id");
  const notes = loadData(STORAGE_KEYS.notes, defaultNotes);
  const note = notes.find((item) => item.id === noteId) || notes[0];

  articleEl.innerHTML = `
    <h2>${note.title}</h2>
    <p><span class="badge">${note.category}</span> ${formatDate(note.date)}</p>
    <div>${markdownToHtml(note.content)}</div>
  `;
};

const markdownToHtml = (markdown) => {
  if (!markdown) return "";
  let html = markdown
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n- (.*)/g, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");

  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, "");
  return html;
};

const isAuthenticated = () => {
  return localStorage.getItem(STORAGE_KEYS.auth) === "true";
};

const setAuthenticated = (value) => {
  localStorage.setItem(STORAGE_KEYS.auth, value ? "true" : "false");
};

const loadAdminCredentials = () => {
  return loadData(STORAGE_KEYS.adminCredentials, null);
};

const saveAdminCredentials = (email, password) => {
  saveData(STORAGE_KEYS.adminCredentials, {
    email,
    password
  });
};

const guardAdmin = () => {
  const adminRoot = document.querySelector("[data-admin-root]");
  if (!adminRoot) return;

  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }
};

const initLogin = () => {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  const hint = document.querySelector("[data-login-hint]");
  const submitLabel = document.querySelector("[data-login-submit]");
  const credentials = loadAdminCredentials();
  if (hint) {
    hint.textContent = credentials
      ? "Enter the saved admin email and password to continue."
      : "No admin account found yet. Create one now.";
  }
  if (submitLabel) {
    submitLabel.textContent = credentials ? "Enter Admin" : "Create Admin";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailField = form.querySelector("input[type=\"email\"]");
    const password = form.querySelector("input[type=\"password\"]");
    const email = emailField ? emailField.value.trim() : "";
    const passValue = password ? password.value.trim() : "";

    if (!email || !passValue) {
      alert("Please enter an email and password.");
      return;
    }

    if (passValue.length < 6) {
      alert("Use a password with at least 6 characters.");
      return;
    }

    if (!credentials) {
      saveAdminCredentials(email, passValue);
      setAuthenticated(true);
      window.location.href = "dashboard.html";
      return;
    }

    if (email === credentials.email && passValue === credentials.password) {
      setAuthenticated(true);
      window.location.href = "dashboard.html";
      return;
    }

    alert("Email or password is incorrect.");
  });
};

const initAdminDashboard = () => {
  const adminRoot = document.querySelector("[data-admin-root]");
  if (!adminRoot) return;

  const profile = loadData(STORAGE_KEYS.profile, defaultProfile);
  const gallery = loadData(STORAGE_KEYS.gallery, defaultGallery);
  const notes = loadData(STORAGE_KEYS.notes, defaultNotes);

  const profileForm = document.querySelector("[data-profile-form]");
  if (profileForm) {
    profileForm.name.value = profile.name;
    profileForm.title.value = profile.title;
    profileForm.bio.value = profile.bio;
    profileForm.location.value = profile.location;
    profileForm.github.value = profile.socials.github;
    profileForm.linkedin.value = profile.socials.linkedin;
    profileForm.x.value = profile.socials.x;

    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const avatarFile = profileForm.avatarFile.files[0];
      let avatarData = profile.avatarData || "";
      try {
        if (avatarFile) {
          avatarData = await compressImageFile(avatarFile, { maxWidth: 240, quality: 0.7 });
        }
      } catch (error) {
        alert("Avatar upload failed. Please try again.");
        return;
      }
      const updated = {
        name: profileForm.name.value,
        title: profileForm.title.value,
        bio: profileForm.bio.value,
        location: profileForm.location.value,
        avatarData,
        socials: {
          github: profileForm.github.value,
          linkedin: profileForm.linkedin.value,
          x: profileForm.x.value
        }
      };
      saveData(STORAGE_KEYS.profile, updated);
      renderHome();
      alert("Profile updated.");
    });
  }

  const galleryForm = document.querySelector("[data-gallery-form]");
  const galleryList = document.querySelector("[data-gallery-admin]");
  const gallerySubmit = document.querySelector("[data-gallery-submit]");
  const galleryCancel = document.querySelector("[data-gallery-cancel]");

  const startGalleryEdit = (item) => {
    if (!galleryForm) return;
    galleryForm.dataset.editId = item.id;
    galleryForm.title.value = item.title;
    galleryForm.detail.value = item.detail;
    const imageMeta = getGalleryImage(item);
    galleryForm.link.value = item.link || "";
    galleryForm.imageFile.required = false;
    if (gallerySubmit) gallerySubmit.textContent = "Save Changes";
    if (galleryCancel) galleryCancel.style.display = "inline-flex";
  };

  const resetGalleryForm = () => {
    if (!galleryForm) return;
    galleryForm.reset();
    delete galleryForm.dataset.editId;
    galleryForm.imageFile.required = false;
    if (gallerySubmit) gallerySubmit.textContent = "Add to Gallery";
    if (galleryCancel) galleryCancel.style.display = "none";
  };

  const renderGalleryAdmin = () => {
    if (!galleryList) return;
    galleryList.innerHTML = "";
    gallery.forEach((item) => {
      const imageMeta = getGalleryImage(item);
      const row = document.createElement("div");
      row.className = "note-item gallery-admin-row";

      const info = document.createElement("div");
      info.className = "gallery-admin-info";

      let thumb;
      if (imageMeta.url) {
        thumb = document.createElement("img");
        thumb.className = "admin-thumbnail";
        thumb.src = imageMeta.url;
        thumb.alt = imageMeta.label;
      } else {
        thumb = document.createElement("div");
        thumb.className = "admin-thumbnail placeholder";
        thumb.textContent = imageMeta.label;
      }

      const textWrap = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const detail = document.createElement("span");
      detail.textContent = item.detail;
      textWrap.appendChild(title);
      textWrap.appendChild(document.createElement("br"));
      textWrap.appendChild(detail);
      if (item.link) {
        textWrap.appendChild(document.createElement("br"));
        const link = document.createElement("span");
        link.textContent = item.link;
        textWrap.appendChild(link);
      }

      info.appendChild(thumb);
      info.appendChild(textWrap);

      const actions = document.createElement("div");
      actions.className = "admin-actions";
      const editBtn = document.createElement("button");
      editBtn.className = "button";
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("data-edit-id", item.id);
      const removeBtn = document.createElement("button");
      removeBtn.className = "button";
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("data-remove-id", item.id);
      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);

      row.appendChild(info);
      row.appendChild(actions);
      galleryList.appendChild(row);
    });
  };

  if (galleryForm) {
    galleryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const editId = galleryForm.dataset.editId;
      const existing = editId ? gallery.find((item) => item.id === editId) : null;
      const imageFile = galleryForm.imageFile.files[0];
      let imageData = existing ? existing.imageData : "";
      try {
        if (imageFile) {
          imageData = await compressImageFile(imageFile, { maxWidth: 720, quality: 0.5 });
        }
      } catch (error) {
        alert("Image upload failed. Please try again.");
        return;
      }

      if (!imageData && !existing) {
        alert("Please upload an image for the gallery item.");
        return;
      }

      const newItem = {
        id: editId || `gal-${Date.now()}`,
        title: galleryForm.title.value,
        detail: galleryForm.detail.value,
        imageData,
        link: galleryForm.link.value.trim()
      };
      if (existing) {
        const index = gallery.findIndex((item) => item.id === editId);
        gallery.splice(index, 1, newItem);
      } else {
        gallery.unshift(newItem);
      }
      saveData(STORAGE_KEYS.gallery, gallery);
      resetGalleryForm();
      renderGalleryAdmin();
    });
  }

  if (galleryList) {
    galleryList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const editId = target.getAttribute("data-edit-id");
      if (editId) {
        const item = gallery.find((entry) => entry.id === editId);
        if (item) startGalleryEdit(item);
        return;
      }
      const removeId = target.getAttribute("data-remove-id");
      if (!removeId) return;
      const index = gallery.findIndex((item) => item.id === removeId);
      if (index >= 0) {
        gallery.splice(index, 1);
        saveData(STORAGE_KEYS.gallery, gallery);
        renderGalleryAdmin();
        if (galleryForm && galleryForm.dataset.editId === removeId) {
          resetGalleryForm();
        }
      }
    });
  }

  if (galleryCancel) {
    galleryCancel.addEventListener("click", () => {
      resetGalleryForm();
    });
  }

  const notesForm = document.querySelector("[data-notes-form]");
  const notesList = document.querySelector("[data-notes-admin]");
  const notesSubmit = document.querySelector("[data-notes-submit]");
  const notesCancel = document.querySelector("[data-notes-cancel]");

  const startNoteEdit = (note) => {
    if (!notesForm) return;
    notesForm.dataset.editId = note.id;
    notesForm.title.value = note.title;
    notesForm.date.value = note.date;
    notesForm.category.value = note.category;
    notesForm.content.value = note.content;
    if (notesSubmit) notesSubmit.textContent = "Update Note";
    if (notesCancel) notesCancel.style.display = "inline-flex";
  };

  const resetNotesForm = () => {
    if (!notesForm) return;
    notesForm.reset();
    delete notesForm.dataset.editId;
    if (notesSubmit) notesSubmit.textContent = "Publish Note";
    if (notesCancel) notesCancel.style.display = "none";
  };

  const renderNotesAdmin = () => {
    if (!notesList) return;
    notesList.innerHTML = "";
    notes.forEach((note) => {
      const row = document.createElement("div");
      row.className = "note-item admin-row";

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = note.title;
      const meta = document.createElement("span");
      meta.textContent = `${note.category} · ${formatDate(note.date)}`;
      info.appendChild(title);
      info.appendChild(document.createElement("br"));
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";
      const editBtn = document.createElement("button");
      editBtn.className = "button";
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("data-edit-note", note.id);
      const removeBtn = document.createElement("button");
      removeBtn.className = "button";
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("data-remove-note", note.id);
      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);

      row.appendChild(info);
      row.appendChild(actions);
      notesList.appendChild(row);
    });
  };

  if (notesForm) {
    notesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const editId = notesForm.dataset.editId;
      const newNote = {
        id: editId || `note-${Date.now()}`,
        title: notesForm.title.value,
        date: notesForm.date.value,
        category: notesForm.category.value,
        content: notesForm.content.value
      };
      if (editId) {
        const index = notes.findIndex((note) => note.id === editId);
        notes.splice(index, 1, newNote);
      } else {
        notes.unshift(newNote);
      }
      saveData(STORAGE_KEYS.notes, notes);
      resetNotesForm();
      renderNotesAdmin();
    });
  }

  if (notesList) {
    notesList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const editId = target.getAttribute("data-edit-note");
      if (editId) {
        const note = notes.find((entry) => entry.id === editId);
        if (note) startNoteEdit(note);
        return;
      }
      const removeId = target.getAttribute("data-remove-note");
      if (!removeId) return;
      const index = notes.findIndex((note) => note.id === removeId);
      if (index >= 0) {
        notes.splice(index, 1);
        saveData(STORAGE_KEYS.notes, notes);
        renderNotesAdmin();
        if (notesForm && notesForm.dataset.editId === removeId) {
          resetNotesForm();
        }
      }
    });
  }

  if (notesCancel) {
    notesCancel.addEventListener("click", () => {
      resetNotesForm();
    });
  }

  renderGalleryAdmin();
  renderNotesAdmin();
};

const initLogout = () => {
  const button = document.querySelector("[data-logout]");
  if (!button) return;
  button.addEventListener("click", () => {
    setAuthenticated(false);
    window.location.href = "login.html";
  });
};

ensureDefaults();
renderHome();
renderGallery();
renderNotesList();
renderNoteDetail();
initLogin();
guardAdmin();
initAdminDashboard();
initLogout();
