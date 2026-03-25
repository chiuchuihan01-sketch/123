import { NAV, getNewsItems, saveNewsItems, resetNewsItemsToDefault, featuredNewsItems, newsTagLabel, SITE, t } from "./content.js";
import { getCurrentPath, normalizePath, onLinkClick } from "./router.js";

const LANG_KEY = "immba.lang";

const state = {
  lang: loadLang(),
  path: getCurrentPath(),
};

let lastRenderedPath = state.path;

function readLangFromUrl() {
  try {
    const u = new URL(window.location.href);
    const q = u.searchParams.get("lang");
    if (q === "zh" || q === "en") return q;
  } catch (_) {}
  return null;
}

function consumeLangParamFromUrl() {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has("lang")) return;
    u.searchParams.delete("lang");
    window.history.replaceState({}, "", `${u.pathname}${u.search}${u.hash}`);
  } catch (_) {}
}

/** 優先：網址 ?lang= → 已儲存語系 → 瀏覽器語言 → 預設英文 */
function loadLang() {
  const fromUrl = readLangFromUrl();
  if (fromUrl) return fromUrl;
  const raw = window.localStorage.getItem(LANG_KEY);
  if (raw === "zh" || raw === "en") return raw;
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of list) {
    const x = String(l || "").toLowerCase();
    if (x.startsWith("zh")) return "zh";
    if (x.startsWith("en")) return "en";
  }
  return "en";
}

let googleTranslateRequested = false;

function ensureGoogleTranslateWidget() {
  const mount = qs("#google_translate_element");
  if (!mount || googleTranslateRequested) return;
  googleTranslateRequested = true;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    const pageLanguage = state.lang === "zh" ? "zh-TW" : "en";
    new google.translate.TranslateElement(
      {
        pageLanguage,
        includedLanguages: "zh-TW,zh-CN,en,ja,ko,vi,th,id,es,fr,de",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  };

  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.head.appendChild(s);
}

function setLang(next) {
  if (next !== "zh" && next !== "en") return;
  state.lang = next;
  window.localStorage.setItem(LANG_KEY, next);
  document.documentElement.lang = next === "zh" ? "zh-Hant" : "en";
  render();
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function newsTitleLink(n, titleText) {
  const inner = escapeHtml(titleText);
  if (n.externalUrl) {
    return `<a href="${escapeHtml(n.externalUrl)}" target="_blank" rel="noreferrer">${inner}</a>`;
  }
  if (n.route) {
    return `<a href="${escapeHtml(n.route)}" data-link>${inner}</a>`;
  }
  return inner;
}

function applyI18n() {
  qsa("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(state.lang, key);
  });
}

function buildNav() {
  const ul = qs("#nav-list");
  if (!ul) return;

  ul.innerHTML = NAV.map((node) => {
    if (node.type === "link") {
      return `
        <li class="nav__item">
          <a class="nav__link" href="${node.route}" data-link data-nav="${node.key}">
            ${escapeHtml(t(state.lang, `nav.${node.key}`))}
          </a>
        </li>
      `;
    }

    const itemsHtml = node.items
      .map((it) => {
        const titleKey = `${it.key}.title`;
        const descKey = `${it.key}.desc`;
        const label = t(state.lang, titleKey);
        return `
          <a class="dropdown__link" href="${it.route}" data-link role="menuitem">
            <div>
              <div class="dropdown__title">${escapeHtml(label)}</div>
              <div class="dropdown__desc">${escapeHtml(t(state.lang, descKey))}</div>
            </div>
            <span class="dropdown__badge">→</span>
          </a>
        `;
      })
      .join("");

    return `
      <li class="nav__item">
        <button class="nav__btn" type="button" data-dropdown="${node.key}" aria-expanded="false" aria-haspopup="menu">
          ${escapeHtml(t(state.lang, `nav.${node.key}`))}
          <span class="chev" aria-hidden="true"></span>
        </button>
        <div class="dropdown" role="menu" aria-label="${escapeHtml(t(state.lang, `nav.${node.key}`))}">
          <div class="dropdown__grid">${itemsHtml}</div>
        </div>
      </li>
    `;
  }).join("");
}

function closeAllDropdowns({ exceptKey } = {}) {
  qsa(".nav__item").forEach((li) => {
    const btn = li.querySelector("[data-dropdown]");
    const dd = li.querySelector(".dropdown");
    if (!btn || !dd) return;
    const key = btn.getAttribute("data-dropdown");
    const keep = exceptKey && key === exceptKey;
    btn.setAttribute("aria-expanded", keep ? "true" : "false");
    dd.classList.toggle("is-open", !!keep);
  });
}

function navHoverDropdownsEnabled() {
  return window.matchMedia("(min-width: 981px)").matches && window.matchMedia("(hover: hover)").matches;
}

function wireNavInteractions() {
  const nav = qs("#nav");
  const toggle = qs("#nav-toggle");
  const closeTimers = new Map();
  const HOVER_CLOSE_DELAY_MS = 140;

  function clearCloseTimer(item) {
    const id = closeTimers.get(item);
    if (id) clearTimeout(id);
    closeTimers.delete(item);
  }

  function scheduleClose(item) {
    clearCloseTimer(item);
    const id = window.setTimeout(() => {
      const btn = item.querySelector("[data-dropdown]");
      if (!btn) return;
      btn.setAttribute("aria-expanded", "false");
      item.querySelector(".dropdown")?.classList.remove("is-open");
      closeTimers.delete(item);
    }, HOVER_CLOSE_DELAY_MS);
    closeTimers.set(item, id);
  }

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) closeAllDropdowns();
  }

  toggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.contains("is-open");
    setNavOpen(!isOpen);
  });

  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-dropdown]");
    if (btn) {
      const key = btn.getAttribute("data-dropdown");
      const expanded = btn.getAttribute("aria-expanded") === "true";
      closeAllDropdowns({ exceptKey: expanded ? null : key });
      return;
    }

    // Close dropdowns when clicking outside
    if (!e.target?.closest?.(".nav")) closeAllDropdowns();
  });

  // Keyboard: escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
      setNavOpen(false);
      closeSearch();
    }
  });

  // Close mobile nav after navigation
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a[data-link]");
    if (!a) return;
    if (window.matchMedia("(max-width: 980px)").matches) setNavOpen(false);
    closeAllDropdowns();
  });

  // Desktop: hover opens dropdown (pointer-capable devices only)
  document.addEventListener("pointerover", (e) => {
    if (!navHoverDropdownsEnabled()) return;
    const navRoot = qs("#nav");
    const item = e.target?.closest?.(".nav__item");
    if (!navRoot || !item || !navRoot.contains(item)) return;
    const btn = item.querySelector("[data-dropdown]");
    if (!btn) return;
    const key = btn.getAttribute("data-dropdown");
    closeAllDropdowns({ exceptKey: key });
    // If we were about to close this item's dropdown, cancel it while hovering.
    clearCloseTimer(item);
  });

  document.addEventListener("pointerout", (e) => {
    if (!navHoverDropdownsEnabled()) return;
    const navRoot = qs("#nav");
    const item = e.target?.closest?.(".nav__item");
    if (!navRoot || !item || !navRoot.contains(item)) return;
    const related = e.relatedTarget;
    // If pointer is still inside the same nav item (button -> dropdown),
    // don't close. Otherwise, delay closing to avoid flicker.
    if (related && item.contains(related)) {
      clearCloseTimer(item);
      return;
    }
    const btn = item.querySelector("[data-dropdown]");
    if (!btn) return;
    scheduleClose(item);
  });
}

function wireLangSwitch() {
  // Delegated event binding so it works even when the switch is inside SPA-rendered views.
  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.(".pill[data-lang]");
    if (!btn) return;
    const lang = btn.getAttribute("data-lang");
    setLang(lang);
  });
}

function syncLangUi() {
  qsa(".pill[data-lang]").forEach((btn) => {
    const lang = btn.getAttribute("data-lang");
    btn.classList.toggle("is-active", lang === state.lang);
  });
}

function syncTopbarBrand() {
  const logo = qs("#topbar-logo-link");
  if (!logo) return;
  logo.setAttribute("href", SITE.adminUrl || "/admin");
  logo.setAttribute("aria-label", t(state.lang, "a11y.brandAdmin"));
}

function pageLayout({ title, crumb, bodyHtml }) {
  return `
    <section class="page">
      <div class="page__head">
        <h1 class="page__title">${escapeHtml(title)}</h1>
        <div class="breadcrumb">${escapeHtml(crumb)}</div>
      </div>
      <div class="panel">${bodyHtml}</div>
    </section>
  `;
}

function homeHighlightArticleHtml(n, lang, index) {
  const title = lang === "zh" ? n.title_zh || n.title_en : n.title_en || n.title_zh;
  const articleText = lang === "zh" ? n.body_zh || n.body_en : n.body_en || n.body_zh;
  const overLimit = articleText.length > 150;
  const snippet = overLimit ? `${articleText.slice(0, 150)}...` : articleText;
  const reverse = index % 2 === 1;
  const readMore = t(lang, "article.readMore");
  const readLess = t(lang, "article.readLess");
  return `
    <article class="article-reading home-highlight${reverse ? " home-highlight--reverse" : ""}">
      <div class="article-reading__media">
        <img class="article-reading__img" src="${escapeHtml(n.image)}" alt="${escapeHtml(title)}" loading="lazy" />
      </div>
      <div class="article-reading__content">
        <h3 class="home-highlight__heading">${newsTitleLink(n, title)}</h3>
        <p class="muted">${escapeHtml(n.date)} · ${escapeHtml(newsTagLabel(lang, n.tag))}</p>
        <p class="muted article-reading__text" data-expanded="false">
          <span class="article-reading__short">${escapeHtml(snippet)}</span>
          ${
            overLimit
              ? `<span class="article-reading__full" hidden>${escapeHtml(articleText)}</span>`
              : ""
          }
        </p>
        ${
          overLimit
            ? `<button
              class="link-btn article-reading__more"
              type="button"
              data-read-more
              data-label-more="${escapeHtml(readMore)}"
              data-label-less="${escapeHtml(readLess)}"
            >${escapeHtml(readMore)}</button>`
            : ""
        }
      </div>
    </article>
  `;
}

function homeView() {
  const lang = state.lang;
  const newsItems = getNewsItems();
  const news = newsItems.slice(0, 10)
    .map((n) => {
      const title = lang === "zh" ? n.title_zh || n.title_en : n.title_en || n.title_zh;
      return `
        <div class="result">
          <div class="result__title">${newsTitleLink(n, title)}</div>
          <div class="result__meta">${escapeHtml(n.date)} · ${escapeHtml(newsTagLabel(lang, n.tag))}</div>
        </div>
      `;
    })
    .join("");

  // Randomize featured order each render, while keeping left/right alternation.
  const featured = featuredNewsItems(newsItems);
  const shuffled = [...featured];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const highlightsHtml = shuffled.map((n, i) => homeHighlightArticleHtml(n, lang, i)).join("");

  const highlightsSection =
    highlightsHtml.length === 0
      ? ""
      : `
    <section class="home-highlights" aria-labelledby="home-highlights-heading">
      <h2 id="home-highlights-heading" class="home-highlights__title">${escapeHtml(t(lang, "home.highlights.title"))}</h2>
      <div class="home-highlights__list">${highlightsHtml}</div>
    </section>
  `;

  return `
    <section class="hero">
      <!-- 第三橫幅：圖片全寬，右側按鈕疊在圖片上 -->
      <div class="hero__media">
        <img class="hero__media-img" src="./assets/hero-banner.png" alt="imMBA banner" />

        <div class="hero__cta-overlay" aria-label="Hero actions">
          <a class="btn btn--primary" href="/admissions/mba" data-link>${escapeHtml(t(lang, "home.cta.apply"))}</a>
          <a class="btn" href="/curriculum/rules" data-link>${escapeHtml(t(lang, "home.cta.programHighlights"))}</a>
        </div>
      </div>

      <div class="hero__side">
        <div class="hero__card">
          <h1 class="hero__section-title">${escapeHtml(t(lang, "home.news.latest"))}</h1>
          <div class="search-results">${news}</div>
          <div style="margin-top:14px">
            <a class="btn btn--primary" href="/news" data-link>${escapeHtml(t(lang, "home.news.more"))}</a>
          </div>
        </div>
      </div>
    </section>
    ${highlightsSection}
  `;
}

function activitiesView() {
  const lang = state.lang;
  const newsItems = getNewsItems();

  const featured = featuredNewsItems(newsItems);
  const shuffled = [...featured];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const highlightsHtml = shuffled.map((n, i) => homeHighlightArticleHtml(n, lang, i)).join("");

  return pageLayout({
    title: t(lang, "pages.gallery.title"),
    crumb: t(lang, "nav.gallery"),
    bodyHtml: `
      <p class="muted" style="margin: 0 0 14px">${escapeHtml(t(lang, "pages.gallery.desc"))}</p>
      <div class="home-highlights__list">${highlightsHtml}</div>
    `,
  });
}

function simpleKeyedPage({ navKey, titleKey, descKey, bullets = [] }) {
  const title = t(state.lang, titleKey);
  const crumb = t(state.lang, `nav.${navKey}`);
  const desc = t(state.lang, descKey);
  const list = bullets.length
    ? `<ul class="list">${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : "";
  const body = `
    <h2>${escapeHtml(title)}</h2>
    <p class="muted">${escapeHtml(desc)}</p>
    ${list}
  `;
  return pageLayout({ title, crumb, bodyHtml: body });
}

function newsIndexPage() {
  const lang = state.lang;
  const newsItems = getNewsItems();
  const items = newsItems.map((n) => {
    const title = lang === "zh" ? n.title_zh || n.title_en : n.title_en || n.title_zh;
    return `
      <div class="result">
        <div class="result__title">${newsTitleLink(n, title)}</div>
        <div class="result__meta">${escapeHtml(n.date)} · ${escapeHtml(newsTagLabel(lang, n.tag))}</div>
      </div>
    `;
  }).join("");

  const officialNewsList =
    lang === "zh"
      ? "完整公告列表（imMBA 官網）"
      : "Full announcement list (official imMBA site)";

  const body = `
    <h2>${escapeHtml(t(lang, "pages.news.title"))}</h2>
    <p class="muted">${escapeHtml(t(lang, "pages.news.desc"))}</p>
    <div class="search-results">${items}</div>
    <p class="muted" style="margin-top:16px">
      <a href="https://www.management.fju.edu.tw/subweb/immba/news.php" target="_blank" rel="noreferrer">${escapeHtml(officialNewsList)}</a>
    </p>
  `;
  return pageLayout({ title: t(lang, "pages.news.title"), crumb: t(lang, "nav.news"), bodyHtml: body });
}

function newsDetailPage(route) {
  const lang = state.lang;
  const newsItems = getNewsItems();
  const item = newsItems.find((n) => n.route === route);
  if (!item) return notFoundPage();
  const title = lang === "zh" ? item.title_zh || item.title_en : item.title_en || item.title_zh;
  const articleText =
    ((lang === "zh" ? item.body_zh : item.body_en) || (lang === "zh" ? item.body_en : item.body_zh)) ||
    (lang === "zh"
      ? "本篇文章為閱讀頁示範內容。可放入官方公告內文、活動重點、申請提醒與附件說明。若內文較長，系統會先顯示前 150 字，並提供閱讀更多按鈕展開完整內容。"
      : "This article is demo reading content. You can place official announcement text, event highlights, application reminders, and attachment notes here. If the text is long, the page first shows 150 characters and provides a Read more button.");
  const overLimit = articleText.length > 150;
  const snippet = overLimit ? `${articleText.slice(0, 150)}...` : articleText;
  const imageSrc = item.image || "./assets/hero-banner.png";
  const body = `
    <article class="article-reading">
      <div class="article-reading__media">
        <img class="article-reading__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(title)}" loading="lazy" />
      </div>
      <div class="article-reading__content">
        <h2>${escapeHtml(title)}</h2>
        <p class="muted">${escapeHtml(item.date)} · ${escapeHtml(newsTagLabel(lang, item.tag))}</p>
        <p class="muted article-reading__text" data-expanded="false">
          <span class="article-reading__short">${escapeHtml(snippet)}</span>
          ${
            overLimit
              ? `<span class="article-reading__full" hidden>${escapeHtml(articleText)}</span>`
              : ""
          }
        </p>
        ${
          overLimit
            ? `<button
              class="link-btn article-reading__more"
              type="button"
              data-read-more
              data-label-more="${escapeHtml(t(lang, "article.readMore"))}"
              data-label-less="${escapeHtml(t(lang, "article.readLess"))}"
            >${escapeHtml(t(lang, "article.readMore"))}</button>`
            : ""
        }
      </div>
    </article>
    <div style="margin-top:12px">
      <a class="btn" href="/news" data-link>← ${escapeHtml(lang === "zh" ? "回公告列表" : "Back to news")}</a>
    </div>
  `;
  return pageLayout({ title, crumb: t(lang, "nav.news"), bodyHtml: body });
}

function adminPage(mode = "activities") {
  const lang = state.lang;
  const items = getNewsItems();
  const wantFeatured = mode === "activities";
  const listItems = items.filter((n) => Boolean(n.featured) === wantFeatured);
  const tags = [...new Set(items.map((n) => n.tag).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}/${mm}/${dd}`;

  const title = lang === "zh" ? "後台管理系統" : "Admin";
  const listTitle = lang === "zh" ? (wantFeatured ? "活動集錦資料" : "最新公告資料") : wantFeatured ? "Activities data" : "News data";
  const newBtnLabel = lang === "zh" ? (wantFeatured ? "新增活動集錦" : "新增最新公告") : wantFeatured ? "Add activity" : "Add news";
  const formTitle = lang === "zh" ? (wantFeatured ? "新增 / 編輯活動集錦" : "新增 / 編輯最新公告") : wantFeatured ? "Edit / Create activity" : "Edit / Create news";

  const rows = listItems
    .slice()
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .map((n) => {
      const titleZh = (n.title_zh || "").trim();
      const titleEn = (n.title_en || "").trim();
      const heading = lang === "zh" ? titleZh || titleEn : titleEn || titleZh;
      return `
        <div class="admin-item" data-admin-item data-id="${escapeHtml(n.id)}">
          <div class="admin-item__top">
            <div class="admin-item__title">${escapeHtml(heading || "(no title)")}</div>
            <div class="admin-item__meta">${escapeHtml(n.date || "")} · ${escapeHtml(newsTagLabel(lang, n.tag || ""))}</div>
          </div>
          <div class="admin-item__actions">
            <span class="admin-pill ${wantFeatured ? "admin-pill--on" : ""}">
              ${lang === "zh" ? (wantFeatured ? "活動集錦" : "公告") : wantFeatured ? "Featured" : "News"}
            </span>
            <button class="btn btn--soft" type="button" data-admin-edit data-id="${escapeHtml(n.id)}">
              ${escapeHtml(lang === "zh" ? "編輯" : "Edit")}
            </button>
            <button class="btn btn--danger btn--soft" type="button" data-admin-delete data-id="${escapeHtml(n.id)}">
              ${escapeHtml(lang === "zh" ? "刪除" : "Delete")}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  return pageLayout({
    title,
    crumb: "—",
    bodyHtml: `
      <div class="admin-page__tabs" aria-label="Admin tabs">
        <a class="btn btn--soft" href="/admin/news" data-link>${escapeHtml(lang === "zh" ? "最新公告" : "News")}</a>
        <a class="btn btn--soft" href="/admin/activities" data-link>${escapeHtml(lang === "zh" ? "活動集錦" : "Activities")}</a>
      </div>

      <div class="admin-layout">
        <div class="admin-col">
          <div class="admin-col__head">
            <h2 class="admin-section-title">${escapeHtml(listTitle)}</h2>
            <div class="admin-col__tools">
              <button class="btn btn--soft" type="button" data-admin-new>
                ${escapeHtml(newBtnLabel)}
              </button>
              <button class="btn btn--danger btn--soft" type="button" data-admin-reset>
                ${escapeHtml(lang === "zh" ? "重置預設" : "Reset default")}
              </button>
            </div>
          </div>

          <div class="admin-items">${rows}</div>
        </div>

        <div class="admin-col admin-col--form">
          <h2 class="admin-section-title">${escapeHtml(formTitle)}</h2>
          <form id="admin-form" data-admin-form>
            <input type="hidden" id="admin-id" />
            <input type="hidden" id="admin-mode" value="${escapeHtml(mode)}" />

            <div class="field">
              <div class="field__label">${escapeHtml(lang === "zh" ? "日期" : "Date")}</div>
              <input class="field__input" id="admin-date" placeholder="YYYY/MM/DD" value="${escapeHtml(defaultDate)}" />
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "分類標籤" : "Tag")}</div>
              <select class="field__input" id="admin-tag">
                ${tags
                  .map((tag) => {
                    const label = newsTagLabel(lang, tag);
                    return `<option value="${escapeHtml(tag)}">${escapeHtml(label)}</option>`;
                  })
                  .join("")}
              </select>
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "封面圖片 URL" : "Image URL")}</div>
              <input class="field__input" id="admin-image" placeholder="https://..." />
              <div style="margin-top:8px">
                <div class="field__label" style="margin:0 0 6px">
                  ${escapeHtml(lang === "zh" ? "或從檔案選擇圖片" : "Or choose from a file")}
                </div>
                <input class="field__input" id="admin-image-file" type="file" accept="image/*" />
                <img
                  id="admin-image-preview"
                  src=""
                  alt=""
                  hidden
                  style="margin-top:10px; width: 100%; max-width: 360px; border-radius: 14px; border: 1px solid rgba(0,0,0,.1); background: rgba(0,0,0,.03)"
                />
              </div>
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "外部連結（公告頁）" : "External URL")}</div>
              <input class="field__input" id="admin-externalUrl" placeholder="https://...NID=..." />
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "中文標題" : "Title (ZH)")}</div>
              <input class="field__input" id="admin-title-zh" />
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "英文標題（可選）" : "Title (EN, optional)")}</div>
              <input class="field__input" id="admin-title-en" />
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "中文內文（不限字數）" : "Body (ZH, any length)")}</div>
              <textarea class="field__input" id="admin-body-zh" rows="6"></textarea>
            </div>

            <div class="field" style="margin-top:10px">
              <div class="field__label">${escapeHtml(lang === "zh" ? "英文內文（可選，不限字數）" : "Body (EN, optional)")}</div>
              <textarea class="field__input" id="admin-body-en" rows="6"></textarea>
            </div>

            <div class="admin-form__actions">
              <button class="btn btn--primary" type="submit" data-admin-save>
                ${escapeHtml(lang === "zh" ? "儲存" : "Save")}
              </button>
              <button class="btn btn--soft" type="button" data-admin-clear>
                ${escapeHtml(lang === "zh" ? "清空" : "Clear")}
              </button>
            </div>
          </form>
        </div>
      </div>
    `,
  });
}

function adminActivitiesPage() {
  return adminPage("activities");
}

function adminNewsPage() {
  return adminPage("news");
}

function wireAdminUi() {
  function qsAdmin(id) {
    return qs(id);
  }

  const defaultDate = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  })();

  function clearForm() {
    const fields = [
      "admin-id",
      "admin-date",
      "admin-image",
      "admin-image-file",
      "admin-externalUrl",
      "admin-title-zh",
      "admin-title-en",
      "admin-body-zh",
      "admin-body-en",
    ];
    fields.forEach((id) => {
      const el = qsAdmin(`#${id}`);
      if (!el) return;
      if (el.tagName === "TEXTAREA") el.value = "";
      else el.value = "";
      if (el.tagName === "TEXTAREA") delete el.dataset.mirror;
    });
    // featured is derived from admin-mode
    // - activities => featured=true
    // - news => featured=false

    const preview = qsAdmin("#admin-image-preview");
    if (preview) {
      preview.src = "";
      preview.hidden = true;
    }

    // Default: date = today
    const dateInput = qsAdmin("#admin-date");
    if (dateInput) dateInput.value = defaultDate;
  }

  function fillForm(item) {
    const mapping = [
      ["admin-id", item.id],
      ["admin-date", item.date || defaultDate],
      ["admin-image", item.image || ""],
      ["admin-externalUrl", item.externalUrl || ""],
      ["admin-title-zh", item.title_zh || ""],
      ["admin-title-en", item.title_en || ""],
      ["admin-body-zh", item.body_zh || ""],
      ["admin-body-en", item.body_en || ""],
    ];
    mapping.forEach(([id, val]) => {
      const el = qsAdmin(`#${id}`);
      if (!el) return;
      el.value = String(val || "");
      if (el.tagName === "TEXTAREA") delete el.dataset.mirror;
    });
    const tag = qsAdmin("#admin-tag");
    if (tag) tag.value = item.tag || "";

    const preview = qsAdmin("#admin-image-preview");
    if (preview) {
      const src = item.image || "";
      preview.src = src;
      preview.hidden = !src;
    }
  }

  // Date input UX: clicking/focusing the date field should select-all.
  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!el || el.id !== "admin-date") return;
    // Let the focus settle before selecting.
    setTimeout(() => {
      try {
        el.select();
      } catch (_) {}
    }, 0);
  });

  document.addEventListener("click", (e) => {
    const el = e.target?.closest?.("#admin-date");
    if (!el) return;
    setTimeout(() => {
      try {
        el.select();
      } catch (_) {}
    }, 0);
  });

  // Delegated click handlers
  document.addEventListener("click", (e) => {
    const editBtn = e.target?.closest?.("[data-admin-edit]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-id");
      const items = getNewsItems();
      const item = items.find((n) => n.id === id);
      if (!item) return;
      fillForm(item);
      return;
    }

    const delBtn = e.target?.closest?.("[data-admin-delete]");
    if (delBtn) {
      const mode = qsAdmin("#admin-mode")?.value || "activities";
      const id = delBtn.getAttribute("data-id");
      const items = getNewsItems();
      if (
        !confirm(
          state.lang === "zh"
            ? mode === "news"
              ? "確定要刪除這筆最新公告？"
              : "確定要刪除這筆活動集錦？"
            : mode === "news"
              ? "Delete this news item?"
              : "Delete this activity item?"
        )
      )
        return;
      const next = items.filter((n) => n.id !== id);
      saveNewsItems(next);
      render();
      return;
    }

    const newBtn = e.target?.closest?.("[data-admin-new]");
    if (newBtn) {
      clearForm();
      return;
    }

    const resetBtn = e.target?.closest?.("[data-admin-reset]");
    if (resetBtn) {
      if (!confirm(state.lang === "zh" ? "重置後會清除你在本機的所有修改，確定？" : "Reset local changes?")) return;
      resetNewsItemsToDefault();
      render();
      return;
    }

    const clearBtn = e.target?.closest?.("[data-admin-clear]");
    if (clearBtn) {
      clearForm();
      return;
    }
  });

  // Image file -> data URL (store into #admin-image)
  document.addEventListener("change", (e) => {
    const target = e.target;
    if (!target) return;
    const fileInput = target.closest?.("#admin-image-file");
    if (!fileInput) return;

    const file = fileInput.files?.[0];
    if (!file) return;

    // Avoid huge data URLs (localStorage size limit)
    const MAX_BYTES = 900 * 1024; // ~900KB
    if (file.size > MAX_BYTES) {
      alert(state.lang === "zh" ? "圖片檔案太大，請選小於約 900KB 的檔案。" : "Image file too large. Please pick under ~900KB.");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const imgInput = qsAdmin("#admin-image");
      if (imgInput) imgInput.value = dataUrl;

      const preview = qsAdmin("#admin-image-preview");
      if (preview) {
        preview.src = dataUrl;
        preview.hidden = false;
      }
    };
    reader.readAsDataURL(file);
  });

  // Translate ZH/EN body text into the other textarea.
  // Requirement: when UI language is `en`, typing in `#admin-body-en` auto-fills/translates `#admin-body-zh`,
  // and vice versa. If translation fails (e.g., no network/CORS), we fall back to mirroring source text.
  const MIRROR_MARKER = "auto-mirrored";
  let isAutoFilling = false;
  let translateTimer = null;
  let translateReqId = 0;

  async function translateViaGoogleFree(text, sl, tl) {
    // Note: this is an unofficial Google endpoint used only client-side.
    // If your browser blocks it (CORS), the caller will catch and fall back.
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();
    return extractGoogleTranslateText(data);
  }

  function extractGoogleTranslateText(data) {
    // Response is typically nested arrays; we try a couple common shapes.
    const a = data?.[0];
    if (!Array.isArray(a)) return "";
    // Shape: [ [ [translated, original, ...], ... ], null, ... ]
    if (a.length && typeof a[0]?.[0] === "string") {
      return a.map((p) => p?.[0]).filter(Boolean).join("");
    }
    // Shape: [ [ translatedItems ], ... ]
    const b = a?.[0];
    if (Array.isArray(b) && b.length && typeof b[0]?.[0] === "string") {
      return b.map((p) => p?.[0]).filter(Boolean).join("");
    }
    return "";
  }

  async function translateViaGoogleJsonp(text, sl, tl) {
    const cbName = `__immbaTranslateCb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    return new Promise((resolve, reject) => {
      let scriptEl = null;
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("translate jsonp timeout"));
      }, 6000);

      function cleanup() {
        window[cbName] = undefined;
        if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl);
        window.clearTimeout(timeout);
      }

      window[cbName] = (data) => {
        try {
          const translated = extractGoogleTranslateText(data);
          cleanup();
          resolve(translated);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      const url =
        "https://translate.googleapis.com/translate_a/single" +
        `?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}` +
        `&callback=${encodeURIComponent(cbName)}`;

      scriptEl = document.createElement("script");
      scriptEl.src = url;
      scriptEl.async = true;
      scriptEl.onerror = () => {
        cleanup();
        reject(new Error("translate jsonp script error"));
      };
      document.head.appendChild(scriptEl);
    });
  }

  function chunkText(text, maxChars = 1600) {
    const s = String(text || "");
    if (s.length <= maxChars) return [s];
    const chunks = [];
    for (let i = 0; i < s.length; i += maxChars) {
      chunks.push(s.slice(i, i + maxChars));
    }
    return chunks;
  }

  async function translateText(text, sl, tl) {
    const t = String(text || "");
    if (!t.trim()) return "";
    const chunks = chunkText(t, 1600);
    const translateOne = async (c) => {
      // Try fetch first; if CORS/network blocks it, try JSONP.
      try {
        return await translateViaGoogleFree(c, sl, tl);
      } catch (_) {
        return await translateViaGoogleJsonp(c, sl, tl);
      }
    };

    if (chunks.length === 1) return translateOne(t);

    const translatedParts = [];
    for (const c of chunks) translatedParts.push(await translateOne(c));
    return translatedParts.join("");
  }

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el) return;
    const id = el.id;
    if (id !== "admin-body-zh" && id !== "admin-body-en") return;

    if (isAutoFilling) return;

    const uiLang = state.lang; // current UI language
    const expectedSourceId = uiLang === "zh" ? "admin-body-zh" : "admin-body-en";
    if (id !== expectedSourceId) {
      // User manually edits the non-active language textarea: stop auto-fill there.
      delete el.dataset.mirror;
      return;
    }

    const sourceLang = uiLang === "zh" ? "zh-TW" : "en";
    const targetLang = uiLang === "zh" ? "en" : "zh-TW";
    const targetId = uiLang === "zh" ? "admin-body-en" : "admin-body-zh";
    const target = qsAdmin(`#${targetId}`);
    if (!target) return;

    const srcValue = el.value;
    const targetIsEmpty = !target.value || !target.value.trim();
    const targetIsAuto = target.dataset.mirror === MIRROR_MARKER;
    // If the other textarea was manually edited, don't overwrite.
    if (!targetIsEmpty && !targetIsAuto) return;

    clearTimeout(translateTimer);

    const myReqId = ++translateReqId;
    translateTimer = setTimeout(async () => {
      try {
        isAutoFilling = true;
        const translated = await translateText(srcValue, sourceLang, targetLang);
        if (myReqId !== translateReqId) return; // outdated request

        const nextVal = translated && translated.trim() ? translated : srcValue;
        // If translation returns empty, keep source text.
        target.value = nextVal;
        target.dataset.mirror = MIRROR_MARKER;
      } catch (_) {
        // Fallback: keep content usable even if translation fails.
        if (myReqId !== translateReqId) return;
        target.value = srcValue;
        target.dataset.mirror = MIRROR_MARKER;
      } finally {
        isAutoFilling = false;
      }
    }, 550);
  });

  // Delegated submit handler
  document.addEventListener("submit", (e) => {
    const form = e.target?.closest?.("[data-admin-form]");
    if (!form) return;
    e.preventDefault();

    const mode = qsAdmin("#admin-mode")?.value || "activities";
    const id = qsAdmin("#admin-id")?.value || "";
    const items = getNewsItems();
    const item = id ? items.find((n) => n.id === id) : null;

    const nextItem = {
      id: id || `new:${Date.now().toString(36)}:${Math.random().toString(16).slice(2)}`,
      date: qsAdmin("#admin-date")?.value?.trim() || "",
      tag: qsAdmin("#admin-tag")?.value || "",
      featured: mode === "activities",
      image: qsAdmin("#admin-image")?.value?.trim() || "",
      externalUrl: qsAdmin("#admin-externalUrl")?.value?.trim() || "",
      title_zh: qsAdmin("#admin-title-zh")?.value?.trim() || "",
      title_en: qsAdmin("#admin-title-en")?.value?.trim() || "",
      body_zh: qsAdmin("#admin-body-zh")?.value || "",
      body_en: qsAdmin("#admin-body-en")?.value || "",
    };

    // Basic validation: at least titles exist
    if (!nextItem.title_zh && !nextItem.title_en) {
      alert(state.lang === "zh" ? "請至少填入中文或英文標題。" : "Please fill at least one title (ZH/EN).");
      return;
    }

    // Activities: keep content consistent (image + bilingual titles + >150 chars bodies)
    if (nextItem.featured) {
      if (!nextItem.image) {
        alert(state.lang === "zh" ? "活動集錦需要提供封面圖片 URL。" : "Activities require an image URL.");
        return;
      }
      if (!nextItem.title_zh) {
        alert(state.lang === "zh" ? "活動集錦需要填入中文標題。" : "Activities require a ZH title.");
        return;
      }
      // No minimum word-count restriction for activities.
      // Frontend will show "Read more" only if it exceeds 150 chars.
      if (!nextItem.body_zh || !nextItem.body_zh.trim()) {
        alert(state.lang === "zh" ? "活動集錦需要填入中文內文。" : "Activities require a ZH body.");
        return;
      }
    }

    // News (non-featured): require ZH title + body. Image optional.
    if (!nextItem.featured) {
      if (!nextItem.title_zh) {
        alert(state.lang === "zh" ? "最新公告需要填入中文標題。" : "News require a ZH title.");
        return;
      }
      if (!nextItem.body_zh || !nextItem.body_zh.trim()) {
        alert(state.lang === "zh" ? "最新公告需要填入中文內文。" : "News require a ZH body.");
        return;
      }
    }

    const next = item ? items.map((n) => (n.id === id ? nextItem : n)) : [...items, nextItem];
    saveNewsItems(next);
    render();
  });
}

function notFoundPage() {
  const lang = state.lang;
  const body = `
    <h2>${escapeHtml(lang === "zh" ? "找不到此頁面" : "Page not found")}</h2>
    <p class="muted">${escapeHtml(lang === "zh" ? "請從導覽選單重新選擇。" : "Please use the navigation to continue.")}</p>
    <a class="btn btn--primary" href="/" data-link>${escapeHtml(lang === "zh" ? "回首頁" : "Go home")}</a>
  `;
  return pageLayout({ title: lang === "zh" ? "404" : "404", crumb: "—", bodyHtml: body });
}

function routeToView(path) {
  const p = normalizePath(path);
  if (p === "/") return homeView();
  if (p === "/admin") return adminNewsPage();
  if (p === "/admin/news") return adminNewsPage();
  if (p === "/admin/activities") return adminActivitiesPage();
  if (p === "/faculty")
    return simpleKeyedPage({
      navKey: "faculty",
      titleKey: "pages.faculty.title",
      descKey: "pages.faculty.desc",
      bullets: [
        state.lang === "zh" ? "教授與業師資訊（可替換為真實師資名單）" : "Faculty profiles (replace with real list)",
        state.lang === "zh" ? "研究領域、授課主題與聯絡方式" : "Research interests, teaching areas, contact",
      ],
    });
  if (p === "/guide")
    return simpleKeyedPage({
      navKey: "guide",
      titleKey: "pages.guide.title",
      descKey: "pages.guide.desc",
      bullets: [
        state.lang === "zh" ? "申請準備與文件清單" : "Application checklist",
        state.lang === "zh" ? "新生必讀：學務與生活" : "Student life essentials",
        state.lang === "zh" ? "職涯資源與校友網絡" : "Career resources & alumni network",
      ],
    });
  if (p === "/graduation")
    return simpleKeyedPage({
      navKey: "graduation",
      titleKey: "pages.graduation.title",
      descKey: "pages.graduation.desc",
      bullets: [
        state.lang === "zh" ? "畢業門檻與學分檢核" : "Graduation requirements",
        state.lang === "zh" ? "離校流程與文件申請" : "Leaving procedures & documents",
      ],
    });
  if (p === "/dual-degree")
    return simpleKeyedPage({
      navKey: "dualDegree",
      titleKey: "pages.dualDegree.title",
      descKey: "pages.dualDegree.desc",
      bullets: [
        state.lang === "zh" ? "合作學校概覽（可放校徽與連結）" : "Partner universities overview",
        state.lang === "zh" ? "申請資格與時程" : "Eligibility & timeline",
      ],
    });
  if (p === "/exchange")
    return simpleKeyedPage({
      navKey: "exchange",
      titleKey: "pages.exchange.title",
      descKey: "pages.exchange.desc",
      bullets: [
        state.lang === "zh" ? "海外交換：合作校清單與名額" : "Partner schools & quotas",
        state.lang === "zh" ? "學分認列與注意事項" : "Credit transfer notes",
      ],
    });
  if (p === "/gallery")
    return activitiesView();
  if (p === "/downloads")
    return simpleKeyedPage({
      navKey: "downloads",
      titleKey: "pages.downloads.title",
      descKey: "pages.downloads.desc",
      bullets: [
        state.lang === "zh" ? "入學/修課/離校常用表單" : "Common forms for enrollment/study/graduation",
        state.lang === "zh" ? "規章辦法與相關連結" : "Policies and links",
      ],
    });
  if (p === "/college-of-management")
    return simpleKeyedPage({
      navKey: "com",
      titleKey: "pages.com.title",
      descKey: "pages.com.desc",
      bullets: [
        state.lang === "zh" ? "管理學院官網連結與資源入口" : "Official links and resources",
        state.lang === "zh" ? "學院特色與國際合作" : "Highlights and global partnerships",
      ],
    });

  // Dropdown leaf routes
  const leaf = [
    { route: "/intro/about", navKey: "intro", key: "intro.about" },
    { route: "/intro/highlights", navKey: "intro", key: "intro.highlights" },
    { route: "/intro/regulations", navKey: "intro", key: "intro.regulations" },
    { route: "/intro/environment", navKey: "intro", key: "intro.environment" },
    { route: "/admissions/mba", navKey: "admissions", key: "admissions.mba" },
    { route: "/admissions/scholarships", navKey: "admissions", key: "admissions.scholarships" },
    { route: "/admissions/international", navKey: "admissions", key: "admissions.international" },
    { route: "/curriculum/courses", navKey: "curriculum", key: "curriculum.courses" },
    { route: "/curriculum/rules", navKey: "curriculum", key: "curriculum.rules" },
  ].find((x) => x.route === p);

  if (p === "/news") return newsIndexPage();
  if (p.startsWith("/news/")) return newsDetailPage(p);
  if (leaf)
    return simpleKeyedPage({
      navKey: leaf.navKey,
      titleKey: `${leaf.key}.title`,
      descKey: `${leaf.key}.desc`,
      bullets:
        state.lang === "zh"
          ? ["此頁為架構示範：你可以把官方網站的段落、圖片與附件內容填入。", "需要我幫你把原站內容逐頁移植也可以。"]
          : ["Structure demo: replace with official text, images and attachments.", "I can help migrate the official content page-by-page."],
    });

  return notFoundPage();
}

function render() {
  const pathBefore = lastRenderedPath;
  buildNav();
  const app = qs("#app");
  if (!app) return;
  app.innerHTML = routeToView(state.path);
  applyI18n();
  syncLangUi();
  syncTopbarBrand();
  // Safety: ensure the left "menu" toggle is not visible even if stale HTML/CSS exists.
  const toggle = qs("#nav-toggle");
  if (toggle) {
    toggle.style.display = "none";
    toggle.setAttribute("hidden", "true");
  }

  if (pathBefore !== state.path) {
    lastRenderedPath = state.path;
    window.scrollTo(0, 0);
  }

  document.title =
    state.path === "/"
      ? state.lang === "zh"
        ? "輔仁大學 imMBA｜國際經營管理碩士班"
        : "FJCU imMBA｜International MBA"
      : `${state.lang === "zh" ? "輔仁大學 imMBA" : "FJCU imMBA"} · ${app.querySelector("h1")?.textContent || ""}`;
}

// Search (simple client-side)
function openSearch() {
  const modal = qs("#search-modal");
  if (!modal) return;
  modal.hidden = false;
  const input = qs("#search-input", modal);
  input?.focus?.();
  runSearch("");
}

function closeSearch() {
  const modal = qs("#search-modal");
  if (!modal) return;
  modal.hidden = true;
}

function runSearch(q) {
  const modal = qs("#search-modal");
  const out = qs("#search-results", modal);
  if (!out) return;

  const query = (q || "").trim().toLowerCase();
  const lang = state.lang;
  const newsItems = getNewsItems();

  const candidates = [
    ...newsItems.map((n) => ({
      title: lang === "zh" ? n.title_zh || n.title_en : n.title_en || n.title_zh,
      meta: `${n.date} · ${newsTagLabel(lang, n.tag)}`,
      href: n.externalUrl || n.route,
      external: Boolean(n.externalUrl),
    })),
    ...NAV.flatMap((n) => {
      if (n.type === "link") {
        return [
          {
            title: t(lang, `nav.${n.key}`),
            meta: lang === "zh" ? "頁面" : "Page",
            href: n.route,
            external: false,
          },
        ];
      }
      return n.items.map((it) => ({
        title: t(lang, `${it.key}.title`),
        meta: t(lang, `${it.key}.desc`),
        href: it.route,
        external: false,
      }));
    }),
  ];

  const hits = !query
    ? candidates.slice(0, 8)
    : candidates.filter((c) => `${c.title} ${c.meta}`.toLowerCase().includes(query)).slice(0, 12);

  if (!hits.length) {
    out.innerHTML = `<div class="muted">${escapeHtml(lang === "zh" ? "沒有找到結果。" : "No results found.")}</div>`;
    return;
  }

  out.innerHTML = hits
    .map((h) => {
      const link = h.external
        ? `<a href="${escapeHtml(h.href)}" target="_blank" rel="noreferrer">${escapeHtml(h.title)}</a>`
        : `<a href="${escapeHtml(h.href)}" data-link>${escapeHtml(h.title)}</a>`;
      return `
        <div class="result">
          <div class="result__title">${link}</div>
          <div class="result__meta">${escapeHtml(h.meta)}</div>
        </div>
      `;
    })
    .join("");
}

function wireSearch() {
  const btn = qs("#btn-search");
  btn?.addEventListener("click", () => openSearch());

  const modal = qs("#search-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target?.matches?.("[data-close]") || e.target?.closest?.("[data-close]")) closeSearch();
  });

  const input = qs("#search-input");
  input?.addEventListener("input", (e) => runSearch(e.target.value));
}

function wireArticleReadMore() {
  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-read-more]");
    if (!btn) return;
    const root = btn.closest(".article-reading__content");
    if (!root) return;

    const text = root.querySelector(".article-reading__text");
    const shortEl = root.querySelector(".article-reading__short");
    const fullEl = root.querySelector(".article-reading__full");
    if (!text || !shortEl || !fullEl) return;

    const expanded = text.getAttribute("data-expanded") === "true";
    text.setAttribute("data-expanded", expanded ? "false" : "true");
    shortEl.hidden = !expanded;
    fullEl.hidden = expanded;
    btn.textContent = expanded ? btn.dataset.labelMore || "Read more" : btn.dataset.labelLess || "Show less";
  });
}

/**
 * Auto-scroll only near viewport edges.
 * Conservative defaults reduce accidental triggers while clicking links/cards.
 */
function wireEdgeScroll() {
  let rafId = 0;
  /** @type {null | "up" | "down"} */
  let direction = null;
  let enterTs = 0;
  let intensity = 0; // 0..1 based on how deep into the trigger band

  const ACTIVATE_MS = 250;
  const PX_PER_FRAME = 3.2;
  const WHEEL_COOLDOWN_MS = 450;
  let wheelTs = 0;

  function edgeSize() {
    // Trigger up/down within the top/bottom quarter of the viewport.
    return window.innerHeight * 0.3333333333;
  }

  function stop() {
    direction = null;
    enterTs = 0;
    intensity = 0;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function isInteractive(el) {
    if (!el || el === document.documentElement) return false;
    if (el.closest("#search-modal:not([hidden])")) return true;
    return Boolean(
      el.closest("button, input, textarea, select, label, [role='button'], [role='tab'], [data-dropdown]")
    );
  }

  function tick() {
    rafId = 0;
    if (!direction) return;

    const modal = qs("#search-modal");
    if (modal && !modal.hidden) return;

    if (performance.now() - enterTs < ACTIVATE_MS) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = window.scrollY;
    if ((direction === "up" && y <= 0) || (direction === "down" && y >= maxY - 0.5)) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // stronger when deeper into band; tuned to feel closer to mouse-middledrag scrolling
    const px = PX_PER_FRAME * (0.85 + intensity * 1.9);
    window.scrollBy(0, direction === "up" ? -px : px);
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      if (performance.now() - wheelTs < WHEEL_COOLDOWN_MS) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (isInteractive(el)) {
        stop();
        return;
      }

      const edge = edgeSize();
      let next = null;
      if (e.clientY < edge) next = "up";
      else if (e.clientY > window.innerHeight - edge) next = "down";

      if (!next) {
        stop();
        return;
      }

      if (next !== direction) {
        direction = next;
        enterTs = performance.now();
      }
      // Update intensity continuously while hovering inside the band.
      if (next === "up") {
        intensity = Math.max(0, Math.min(1, (edge - e.clientY) / edge));
      } else {
        const bandStart = window.innerHeight - edge;
        intensity = Math.max(0, Math.min(1, (e.clientY - bandStart) / edge));
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    },
    { passive: true }
  );

  // If the user scrolls manually, pause auto edge-scroll briefly.
  window.addEventListener(
    "wheel",
    () => {
      wheelTs = performance.now();
      stop();
    },
    { passive: true }
  );

  document.documentElement.addEventListener("pointerleave", stop);
  window.addEventListener("blur", stop);
}

function wireRouting() {
  document.addEventListener("click", onLinkClick);
  window.addEventListener("popstate", () => {
    state.path = getCurrentPath();
    render();
  });
  window.addEventListener("hashchange", () => {
    state.path = getCurrentPath();
    render();
  });
  window.addEventListener("app:navigate", (e) => {
    state.path = normalizePath(e.detail?.path || getCurrentPath());
    render();
  });
}

function init() {
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  if (readLangFromUrl()) {
    window.localStorage.setItem(LANG_KEY, state.lang);
    consumeLangParamFromUrl();
  }
  qs("#year").textContent = String(new Date().getFullYear());

  wireRouting();
  wireNavInteractions();
  wireLangSwitch();
  wireSearch();
  wireArticleReadMore();
  wireAdminUi();
  wireEdgeScroll();
  ensureGoogleTranslateWidget();

  render();
}

init();

