const STORAGE_KEYS = {
  profile: "personalBrand.profile",
  gallery: "personalBrand.gallery",
  notes: "personalBrand.notes",
  auth: "personalBrand.auth"
};

const defaultProfile = {
  name: "Alex Mercer",
  title: "Product Designer + Builder",
  bio: "I craft warm, human-centered digital products and document the messy middle. This space is my studio log, gallery, and slow thinking lab.",
  location: "Austin / Remote",
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

const renderHome = () => {
  const profile = loadData(STORAGE_KEYS.profile, defaultProfile);
  const gallery = loadData(STORAGE_KEYS.gallery, defaultGallery).slice(0, 3);
  const notes = loadData(STORAGE_KEYS.notes, defaultNotes).slice(0, 3);

  const nameEl = document.querySelector("[data-profile-name]");
  const titleEl = document.querySelector("[data-profile-title]");
  const bioEl = document.querySelector("[data-profile-bio]");
  const locationEl = document.querySelector("[data-profile-location]");
  const socialsEl = document.querySelector("[data-profile-socials]");

  if (nameEl) nameEl.textContent = profile.name;
  if (titleEl) titleEl.textContent = profile.title;
  if (bioEl) bioEl.textContent = profile.bio;
  if (locationEl) locationEl.textContent = profile.location;

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
      const card = document.createElement("div");
      card.className = "card";
      card.style.animationDelay = `${index * 0.12}s`;
      card.innerHTML = `
        <div class="card-image">${item.image}</div>
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      galleryWrap.appendChild(card);
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
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${index * 0.12}s`;
    card.innerHTML = `
      <div class="card-image">${item.image}</div>
      <h3>${item.title}</h3>
      <p>${item.detail}</p>
    `;
    galleryWrap.appendChild(card);
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = form.querySelector("input[type=\"password\"]");
    if (password && password.value.trim().length >= 6) {
      setAuthenticated(true);
      window.location.href = "dashboard.html";
    } else {
      alert("Use a password with at least 6 characters.");
    }
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

    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = {
        name: profileForm.name.value,
        title: profileForm.title.value,
        bio: profileForm.bio.value,
        location: profileForm.location.value,
        socials: {
          github: profileForm.github.value,
          linkedin: profileForm.linkedin.value,
          x: profileForm.x.value
        }
      };
      saveData(STORAGE_KEYS.profile, updated);
      alert("Profile updated.");
    });
  }

  const galleryForm = document.querySelector("[data-gallery-form]");
  const galleryList = document.querySelector("[data-gallery-admin]");

  const renderGalleryAdmin = () => {
    if (!galleryList) return;
    galleryList.innerHTML = "";
    gallery.forEach((item) => {
      const row = document.createElement("div");
      row.className = "note-item";
      row.innerHTML = `
        <div>
          <strong>${item.title}</strong><br />
          <span>${item.detail}</span>
        </div>
        <button class="button" data-remove-id="${item.id}">Remove</button>
      `;
      galleryList.appendChild(row);
    });
  };

  if (galleryForm) {
    galleryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newItem = {
        id: `gal-${Date.now()}`,
        title: galleryForm.title.value,
        detail: galleryForm.detail.value,
        image: galleryForm.image.value || "New Work"
      };
      gallery.unshift(newItem);
      saveData(STORAGE_KEYS.gallery, gallery);
      galleryForm.reset();
      renderGalleryAdmin();
    });
  }

  if (galleryList) {
    galleryList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const removeId = target.getAttribute("data-remove-id");
      if (!removeId) return;
      const index = gallery.findIndex((item) => item.id === removeId);
      if (index >= 0) {
        gallery.splice(index, 1);
        saveData(STORAGE_KEYS.gallery, gallery);
        renderGalleryAdmin();
      }
    });
  }

  const notesForm = document.querySelector("[data-notes-form]");
  const notesList = document.querySelector("[data-notes-admin]");

  const renderNotesAdmin = () => {
    if (!notesList) return;
    notesList.innerHTML = "";
    notes.forEach((note) => {
      const row = document.createElement("div");
      row.className = "note-item";
      row.innerHTML = `
        <div>
          <strong>${note.title}</strong><br />
          <span>${note.category} · ${formatDate(note.date)}</span>
        </div>
        <button class="button" data-remove-note="${note.id}">Remove</button>
      `;
      notesList.appendChild(row);
    });
  };

  if (notesForm) {
    notesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newNote = {
        id: `note-${Date.now()}`,
        title: notesForm.title.value,
        date: notesForm.date.value,
        category: notesForm.category.value,
        content: notesForm.content.value
      };
      notes.unshift(newNote);
      saveData(STORAGE_KEYS.notes, notes);
      notesForm.reset();
      renderNotesAdmin();
    });
  }

  if (notesList) {
    notesList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const removeId = target.getAttribute("data-remove-note");
      if (!removeId) return;
      const index = notes.findIndex((note) => note.id === removeId);
      if (index >= 0) {
        notes.splice(index, 1);
        saveData(STORAGE_KEYS.notes, notes);
        renderNotesAdmin();
      }
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
