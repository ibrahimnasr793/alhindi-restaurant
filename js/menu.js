/* ===== MENU PAGE LOGIC ===== */

let currentCat = "all";
let searchQuery = "";

/* Build category tabs */
function buildCategoryTabs() {
  const scroll = document.getElementById("cats-scroll");
  if (!scroll) return;

  const allBtn = scroll.querySelector('[data-cat="all"]');
  if (allBtn) allBtn.addEventListener("click", () => setCategory("all"));

  Object.entries(menuData).forEach(([catName, catData]) => {
    const btn = document.createElement("button");
    btn.className = "cat-tab" + (catData.comingSoon ? " coming-tab" : "");
    btn.dataset.cat = catName;
    btn.innerHTML = `${catData.icon} ${catName}${catData.comingSoon ? ' <small style="font-size:.7em;opacity:.65">قريباً</small>' : ""}`;
    btn.addEventListener("click", () => {
      setCategory(catName);
      const section = document.getElementById("section-" + catName);
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
    scroll.appendChild(btn);
  });
}

/* Set active category */
function setCategory(cat) {
  currentCat = cat;
  document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
  const activeBtn = document.querySelector(`[data-cat="${cat}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  renderMenuSections();
}

/* === Build a single card HTML === */
function buildItemCard(item, catIcon, query, idx) {
  const delay = Math.min(idx * 0.05, 0.6);
  const badgeHtml = item.badge
    ? `<span class="item-badge">${item.badge}</span>`
    : "";

  if (item.img) {
    /* IMAGE CARD */
    return `
      <div class="menu-item-card img-card" style="--delay:${delay}s"
           onclick="addToCart('${item.id}','${escapeAttr(item.name)}',${item.price})">
        ${badgeHtml}
        <div class="item-img-wrap">
          <img src="${item.img}" alt="${escapeAttr(item.name)}" loading="lazy" />
        </div>
        <div class="item-body">
          <div class="item-name">${highlight(item.name, query)}</div>
          <div class="item-desc">${highlight(item.desc, query)}</div>
          <div class="item-footer">
            <div class="item-price">${item.price} <span>جنيه</span></div>
            <button class="add-btn"
              onclick="event.stopPropagation();addToCart('${item.id}','${escapeAttr(item.name)}',${item.price})"
              aria-label="أضف للسلة">+</button>
          </div>
        </div>
      </div>`;
  }

  /* TEXT CARD */
  return `
    <div class="menu-item-card" style="--delay:${delay}s"
         onclick="addToCart('${item.id}','${escapeAttr(item.name)}',${item.price})">
      ${badgeHtml}
      <div class="item-no-img">${catIcon}</div>
      <div class="item-info">
        <div class="item-name">${highlight(item.name, query)}</div>
        <div class="item-desc">${highlight(item.desc, query)}</div>
      </div>
      <div class="item-right">
        <div class="item-price">${item.price} <span>جنيه</span></div>
        <button class="add-btn"
          onclick="event.stopPropagation();addToCart('${item.id}','${escapeAttr(item.name)}',${item.price})"
          aria-label="أضف للسلة">+</button>
      </div>
    </div>`;
}

/* Render all sections */
function renderMenuSections() {
  const container = document.getElementById("menu-items-section");
  if (!container) return;
  container.innerHTML = "";

  const query = searchQuery.toLowerCase().trim();
  let hasResults = false;

  Object.entries(menuData).forEach(([catName, catData]) => {
    if (currentCat !== "all" && currentCat !== catName) return;

    /* coming-soon section */
    if (catData.comingSoon) {
      if (query) return;
      hasResults = true;
      const section = document.createElement("section");
      section.className = "category-section";
      section.id = "section-" + catName;
      section.innerHTML = `
        <div class="category-title reveal">
          <div class="category-title-icon">${catData.icon}</div>
          <div class="category-title-text">
            <h2>${catName}</h2><p>قريباً — ترقبوا الجديد</p>
          </div>
        </div>
        <div class="coming-soon-section reveal">
          <div class="coming-soon-icon">${catData.icon}</div>
          <div class="coming-soon-badge">✨ قريباً</div>
          <h3 class="coming-soon-title">${catName} الهندي</h3>
          <p class="coming-soon-text">نعمل بكل شغف على إضافة قسم ${catName} المميز.<br/>ترقبوا الإعلان قريباً 🔥</p>
        </div>`;
      container.appendChild(section);
      return;
    }

    const filteredItems = query
      ? catData.items.filter((item) =>
          item.name.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query))
      : catData.items;

    if (!filteredItems.length) return;
    hasResults = true;

    const hasImages = filteredItems.some((i) => i.img);
    const gridClass = hasImages
      ? "items-grid img-grid"
      : "items-grid";

    const itemsHtml = filteredItems
      .map((item, idx) => buildItemCard(item, catData.icon, query, idx))
      .join("");

    const section = document.createElement("section");
    section.className = "category-section";
    section.id = "section-" + catName;
    section.innerHTML = `
      <div class="category-title reveal">
        <div class="category-title-icon">${catData.icon}</div>
        <div class="category-title-text">
          <h2>${catName}</h2>
          <p>${filteredItems.length} ${filteredItems.length === 1 ? "صنف" : "أصناف"}</p>
        </div>
      </div>
      <div class="${gridClass}">${itemsHtml}</div>`;

    container.appendChild(section);
  });

  if (!hasResults) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>مفيش نتائج لـ "${searchQuery}"</h3>
        <p>جرب كلمة تانية أو اختار من الكاتيجوري</p>
      </div>`;
  }

  initScrollReveal();
  initMenuCardAnim();
}

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${escapeRe(query)})`, "gi");
  return text.replace(re, '<mark style="background:rgba(230,57,70,.3);color:inherit;border-radius:3px;padding:0 2px">$1</mark>');
}

function escapeAttr(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Scroll spy */
function initScrollSpy() {
  const sections = document.querySelectorAll(".category-section");
  if (!sections.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("section-", "");
          document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
          const btn = document.querySelector(`[data-cat="${id}"]`);
          if (btn) {
            btn.classList.add("active");
            btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }
        }
      });
    },
    { threshold: 0.25, rootMargin: "-90px 0px -55% 0px" }
  );
  sections.forEach((s) => obs.observe(s));
}

/* Search */
function initSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;
  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = input.value;
      currentCat = "all";
      document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
      const allBtn = document.querySelector('[data-cat="all"]');
      if (allBtn) allBtn.classList.add("active");
      renderMenuSections();
    }, 260);
  });
}

/* Hash navigation */
function handleHashNav() {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  if (hash && menuData[hash]) {
    setTimeout(() => {
      setCategory(hash);
      const section = document.getElementById("section-" + hash);
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 450);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildCategoryTabs();
  renderMenuSections();
  initSearch();
  handleHashNav();
  setTimeout(initScrollSpy, 600);
});
