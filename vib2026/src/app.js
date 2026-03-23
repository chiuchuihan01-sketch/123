import { NAV, NEWS, t } from "./content.js";
import { getCurrentPath, normalizePath, onLinkClick } from "./router.js";

const LANG_KEY = "immba.lang";

const state = {
  lang: loadLang(),
  path: getCurrentPath(),
};

function loadLang() {
  const raw = window.localStorage.getItem(LANG_KEY);
  if (raw === "zh" || raw === "en") return raw;
  const navLang = (navigator.language || "").toLowerCase();
  return navLang.startsWith("zh") ? "zh" : "en";
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

function wireNavInteractions() {
  const nav = qs("#nav");
  const toggle = qs("#nav-toggle");

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

function pageLayout({ title, crumb, bodyHtml }) {
  const lang = state.lang;
  return `
    <section class="page">
      <div class="page__head">
        <h1 class="page__title">${escapeHtml(title)}</h1>
        <div class="breadcrumb">${escapeHtml(crumb)}</div>
        <div class="page__langbar" role="group" aria-label="Language switch">
          <button class="pill ${lang === "zh" ? "is-active" : ""}" data-lang="zh" type="button">中文</button>
          <button class="pill ${lang === "en" ? "is-active" : ""}" data-lang="en" type="button">EN</button>
        </div>
      </div>
      <div class="panel">${bodyHtml}</div>
    </section>
  `;
}

function homeView() {
  const lang = state.lang;
  const news = NEWS.slice(0, 3)
    .map((n) => {
      const title = lang === "zh" ? n.title_zh : n.title_en;
      return `
        <div class="result">
          <div class="result__title"><a href="${n.route}" data-link>${escapeHtml(title)}</a></div>
          <div class="result__meta">${escapeHtml(n.date)} · ${escapeHtml(n.tag)}</div>
        </div>
      `;
    })
    .join("");

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
        <div class="hero__kicker">${escapeHtml(t(lang, "home.kicker"))}</div>
        <h1 class="hero__title">${escapeHtml(t(lang, "home.title"))}</h1>
        <p class="hero__subtitle">${escapeHtml(t(lang, "home.subtitle"))}</p>

        <div class="hero__langbar" role="group" aria-label="Language switch">
          <button class="pill ${lang === "zh" ? "is-active" : ""}" data-lang="zh" type="button">中文</button>
          <button class="pill ${lang === "en" ? "is-active" : ""}" data-lang="en" type="button">EN</button>
        </div>

        <div class="hero__card">
          <div class="grid" style="margin:0; grid-template-columns:1fr; gap:10px">
            <div class="stat">
              <div class="stat__value">${escapeHtml(t(lang, "home.stat1.value"))}</div>
              <div class="stat__label">${escapeHtml(t(lang, "home.stat1.label"))}</div>
            </div>
            <div class="stat">
              <div class="stat__value">${escapeHtml(t(lang, "home.stat2.value"))}</div>
              <div class="stat__label">${escapeHtml(t(lang, "home.stat2.label"))}</div>
            </div>
            <div class="stat">
              <div class="stat__value">${escapeHtml(t(lang, "home.stat3.value"))}</div>
              <div class="stat__label">${escapeHtml(t(lang, "home.stat3.label"))}</div>
            </div>
          </div>
          <div style="height:12px"></div>
          <div class="muted" style="font-weight:800; font-size:12px; letter-spacing:.02em">
            ${escapeHtml(lang === "zh" ? "最新公告" : "Latest news")}
          </div>
          <div class="search-results">${news}</div>
        </div>
      </div>
    </section>

    <section class="grid" aria-label="Highlights">
      <article class="card">
        <h3>${escapeHtml(t(lang, "home.cards.a.title"))}</h3>
        <p>${escapeHtml(t(lang, "home.cards.a.desc"))}</p>
      </article>
      <article class="card">
        <h3>${escapeHtml(t(lang, "home.cards.b.title"))}</h3>
        <p>${escapeHtml(t(lang, "home.cards.b.desc"))}</p>
      </article>
      <article class="card">
        <h3>${escapeHtml(t(lang, "home.cards.c.title"))}</h3>
        <p>${escapeHtml(t(lang, "home.cards.c.desc"))}</p>
      </article>
      <article class="card">
        <h3>${escapeHtml(t(lang, "home.cards.d.title"))}</h3>
        <p>${escapeHtml(t(lang, "home.cards.d.desc"))}</p>
      </article>
    </section>
  `;
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
  const items = NEWS.map((n) => {
    const title = lang === "zh" ? n.title_zh : n.title_en;
    return `
      <div class="result">
        <div class="result__title"><a href="${n.route}" data-link>${escapeHtml(title)}</a></div>
        <div class="result__meta">${escapeHtml(n.date)} · ${escapeHtml(n.tag)}</div>
      </div>
    `;
  }).join("");

  const body = `
    <h2>${escapeHtml(t(lang, "pages.news.title"))}</h2>
    <p class="muted">${escapeHtml(t(lang, "pages.news.desc"))}</p>
    <div class="search-results">${items}</div>
  `;
  return pageLayout({ title: t(lang, "pages.news.title"), crumb: t(lang, "nav.news"), bodyHtml: body });
}

function newsDetailPage(route) {
  const lang = state.lang;
  const item = NEWS.find((n) => n.route === route);
  if (!item) return notFoundPage();
  const title = lang === "zh" ? item.title_zh : item.title_en;
  const body = `
    <h2>${escapeHtml(title)}</h2>
    <p class="muted">${escapeHtml(item.date)} · ${escapeHtml(item.tag)}</p>
    <p class="muted">
      ${escapeHtml(
        lang === "zh"
          ? "此頁為示範內容：你可以把官方公告文字、圖片、附件連結等填入這裡。"
          : "Demo content: replace this with the official announcement text, images, and attachments."
      )}
    </p>
    <div style="margin-top:12px">
      <a class="btn" href="/news" data-link>← ${escapeHtml(lang === "zh" ? "回公告列表" : "Back to news")}</a>
    </div>
  `;
  return pageLayout({ title, crumb: t(lang, "nav.news"), bodyHtml: body });
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
    return simpleKeyedPage({
      navKey: "gallery",
      titleKey: "pages.gallery.title",
      descKey: "pages.gallery.desc",
      bullets: [
        state.lang === "zh" ? "活動照片牆（可串接 CMS 或相簿）" : "Photo wall (CMS or album integration)",
        state.lang === "zh" ? "依年份/主題篩選" : "Filter by year/topic",
      ],
    });
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
  buildNav();
  const app = qs("#app");
  if (!app) return;
  app.innerHTML = routeToView(state.path);
  applyI18n();
  syncLangUi();

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

  const candidates = [
    ...NEWS.map((n) => ({
      title: lang === "zh" ? n.title_zh : n.title_en,
      meta: `${n.date} · ${n.tag}`,
      route: n.route,
    })),
    ...NAV.flatMap((n) => {
      if (n.type === "link") {
        return [
          {
            title: t(lang, `nav.${n.key}`),
            meta: lang === "zh" ? "頁面" : "Page",
            route: n.route,
          },
        ];
      }
      return n.items.map((it) => ({
        title: t(lang, `${it.key}.title`),
        meta: t(lang, `${it.key}.desc`),
        route: it.route,
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
    .map(
      (h) => `
        <div class="result">
          <div class="result__title"><a href="${h.route}" data-link>${escapeHtml(h.title)}</a></div>
          <div class="result__meta">${escapeHtml(h.meta)}</div>
        </div>
      `
    )
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
  qs("#year").textContent = String(new Date().getFullYear());

  wireRouting();
  wireNavInteractions();
  wireLangSwitch();
  wireSearch();

  render();
}

init();

