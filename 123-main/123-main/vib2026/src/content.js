export const SITE = {
  adminUrl: "/admin",
  routes: {
    home: "/",
    intro: "/intro",
    admissions: "/admissions",
    curriculum: "/curriculum",
    faculty: "/faculty",
    guide: "/guide",
    graduation: "/graduation",
    dualDegree: "/dual-degree",
    exchange: "/exchange",
    gallery: "/gallery",
    news: "/news",
    downloads: "/downloads",
    com: "/college-of-management",
  },
};

export const NAV = [
  {
    key: "intro",
    type: "dropdown",
    items: [
      { key: "intro.about", route: "/intro/about" },
      { key: "intro.highlights", route: "/intro/highlights" },
      { key: "intro.regulations", route: "/intro/regulations" },
      { key: "intro.environment", route: "/intro/environment" },
    ],
  },
  {
    key: "admissions",
    type: "dropdown",
    items: [
      { key: "admissions.mba", route: "/admissions/mba" },
      { key: "admissions.scholarships", route: "/admissions/scholarships" },
      { key: "admissions.international", route: "/admissions/international" },
    ],
  },
  {
    key: "curriculum",
    type: "dropdown",
    items: [
      { key: "curriculum.courses", route: "/curriculum/courses" },
      { key: "curriculum.rules", route: "/curriculum/rules" },
    ],
  },
  { key: "faculty", type: "link", route: "/faculty" },
  { key: "guide", type: "link", route: "/guide" },
  { key: "graduation", type: "link", route: "/graduation" },
  { key: "dualDegree", type: "link", route: "/dual-degree" },
  { key: "exchange", type: "link", route: "/exchange" },
  { key: "gallery", type: "link", route: "/gallery" },
];

export const I18N = {
  zh: {
    "nav.menu": "選單",
    "brand.title": "輔仁大學國際經營管理碩士班(imMBA)",
    "brand.subtitle": "Fu Jen Catholic University",
    "top.links.news": "公告",
    "top.links.fju": "管理學院連結",
    "footer.desc": "輔仁大學管理學院｜國際經營管理碩士班（全英授課）。",
    "footer.contact": "聯絡資訊",
    "footer.email": "Email",
    "footer.phone": "電話",
    "footer.links": "相關連結",
    "footer.link.com": "輔大管理學院",
    "footer.link.official": "imMBA 官方網站",
    "footer.copyright": "輔仁大學管理學院",
    "footer.machineTranslate": "其他語言（Google 自動翻譯，僅供參考）",
    "a11y.skipToContent": "跳到主要內容",
    "a11y.brandAdmin": "前往後台管理系統",
    "search.title": "站內搜尋",
    "search.label": "關鍵字",

    "nav.intro": "簡介",
    "nav.admissions": "招生資訊",
    "nav.curriculum": "課程資訊",
    "nav.faculty": "師資介紹",
    "nav.guide": "imMBA全攻略",
    "nav.graduation": "畢業與離校",
    "nav.dualDegree": "跨國雙碩士",
    "nav.exchange": "海外交換",
    "nav.gallery": "活動集錦",
    "nav.news": "公告",
    "nav.downloads": "表格下載",
    "nav.com": "輔大管理學院",

    "intro.about.title": "簡介｜本班介紹",
    "intro.about.desc": "全英授課、跨文化班級、與產業接軌的國際管理教育。",
    "intro.highlights.title": "簡介｜特色與排名",
    "intro.highlights.desc": "國際合作、跨國雙學位、校友網絡與多元職涯路徑。",
    "intro.regulations.title": "簡介｜本單位規定及辦法",
    "intro.regulations.desc": "修業規範、畢業門檻、論文/專題與學術誠信等事項。",
    "intro.environment.title": "簡介｜學習環境",
    "intro.environment.desc": "國際化校園、資源完善的管理學院與城市便利生活圈。",

    "admissions.mba.title": "招生資訊｜MBA招生資訊",
    "admissions.mba.desc": "申請時程、甄試流程、口試資訊與常見問題。",
    "admissions.scholarships.title": "招生資訊｜獎助學金資訊",
    "admissions.scholarships.desc": "校內外獎助、助學資源、申請資格與注意事項。",
    "admissions.international.title": "招生資訊｜外國學生申請入學",
    "admissions.international.desc": "國際生申請流程、文件清單與英文支援說明。",

    "curriculum.courses.title": "課程資訊｜課程",
    "curriculum.courses.desc": "核心/選修課、學習地圖、與實務專題整合。",
    "curriculum.rules.title": "課程資訊｜課程與修業規則",
    "curriculum.rules.desc": "學分結構、必選修規定、抵免/停修等規則。",

    "pages.faculty.title": "師資介紹",
    "pages.faculty.desc": "跨領域師資陣容：策略、行銷、財務、組織、人資與數據。",
    "pages.guide.title": "imMBA全攻略",
    "pages.guide.desc": "申請、入學、修課、生活到職涯，一站式新生指南。",
    "pages.graduation.title": "畢業與離校",
    "pages.graduation.desc": "畢業門檻、離校程序、文件申請與校友服務。",
    "pages.dualDegree.title": "跨國雙碩士",
    "pages.dualDegree.desc": "與海外名校合作的雙學位路徑與申請要點。",
    "pages.exchange.title": "海外交換",
    "pages.exchange.desc": "交換計畫、合作學校概覽、學分認列與申請流程。",
    "pages.gallery.title": "活動集錦",
    "pages.gallery.desc": "講座、參訪、校園活動與海外學習紀錄。",
    "pages.news.title": "公告",
    "pages.news.desc": "最新消息、招生公告、活動通知與重要提醒。",
    "pages.downloads.title": "表格下載",
    "pages.downloads.desc": "常用表單、申請文件與規章下載。",
    "pages.com.title": "輔大管理學院",
    "pages.com.desc": "管理學院資源、單位連結與學院介紹。",

    "home.cta.apply": "立即申請",
    "home.cta.programHighlights": "了解課程特色",
    "home.news.latest": "最新公告",
    "home.news.more": "更多公告",
    "home.highlights.title": "活動集錦",
    "article.readMore": "閱讀更多",
    "article.readLess": "收合",

    "news.tag.admissions": "招生",
    "news.tag.spotlight": "專題",
    "news.tag.campus": "校園",
    "news.tag.partnership": "合作",
    "news.tag.program": "課程",
    "news.tag.career": "職涯",
    "news.tag.alumni": "校友",
  },
  en: {
    "nav.menu": "Menu",
    "brand.title": "Fu Jen Catholic University imMBA (International MBA)",
    "brand.subtitle": "College of Management, FJCU",
    "top.links.news": "News",
    "top.links.fju": "College of Management",
    "footer.desc":
      "International Master of Business Administration, College of Management, Fu Jen Catholic University.",
    "footer.contact": "Contact",
    "footer.email": "Email",
    "footer.phone": "Phone",
    "footer.links": "Links",
    "footer.link.com": "College of Management",
    "footer.link.official": "Official imMBA site",
    "footer.copyright": "College of Management, Fu Jen Catholic University",
    "footer.machineTranslate": "Other languages (Google automatic translation — for reference only)",
    "a11y.skipToContent": "Skip to content",
    "a11y.brandAdmin": "Go to admin",
    "search.title": "Site search",
    "search.label": "Keyword",

    "nav.intro": "About",
    "nav.admissions": "Admissions",
    "nav.curriculum": "Curriculum",
    "nav.faculty": "Faculty",
    "nav.guide": "imMBA Guide",
    "nav.graduation": "Graduation",
    "nav.dualDegree": "Dual Degree",
    "nav.exchange": "Exchange",
    "nav.gallery": "Gallery",
    "nav.news": "News",
    "nav.downloads": "Downloads",
    "nav.com": "College of Management",

    "intro.about.title": "About · Program Overview",
    "intro.about.desc": "English-taught, multicultural cohort, and industry-oriented global management education.",
    "intro.highlights.title": "About · Highlights & Recognition",
    "intro.highlights.desc": "International partnerships, dual degrees, alumni network, and diverse career pathways.",
    "intro.regulations.title": "About · Policies & Regulations",
    "intro.regulations.desc": "Study requirements, graduation criteria, thesis/capstone, and academic integrity.",
    "intro.environment.title": "About · Learning Environment",
    "intro.environment.desc": "International campus, strong resources, and convenient city life around Taipei.",

    "admissions.mba.title": "Admissions · MBA Application",
    "admissions.mba.desc": "Timeline, process, interview information, and FAQs.",
    "admissions.scholarships.title": "Admissions · Scholarships",
    "admissions.scholarships.desc": "Funding options, eligibility, and how to apply.",
    "admissions.international.title": "Admissions · International Applicants",
    "admissions.international.desc": "Steps, required documents, and English support.",

    "curriculum.courses.title": "Curriculum · Courses",
    "curriculum.courses.desc": "Core & electives, learning map, and integrated practical projects.",
    "curriculum.rules.title": "Curriculum · Study Rules",
    "curriculum.rules.desc": "Credit structure, requirements, waivers, and policies.",

    "pages.faculty.title": "Faculty",
    "pages.faculty.desc": "Interdisciplinary faculty across strategy, marketing, finance, HR, and analytics.",
    "pages.guide.title": "imMBA Guide",
    "pages.guide.desc": "From application to life and career—your one-stop guide.",
    "pages.graduation.title": "Graduation",
    "pages.graduation.desc": "Graduation requirements, leaving procedures, documents, and alumni services.",
    "pages.dualDegree.title": "Dual Degree",
    "pages.dualDegree.desc": "Partner universities, pathways, and how to apply.",
    "pages.exchange.title": "Exchange",
    "pages.exchange.desc": "Programs, partner schools, credit transfer, and application process.",
    "pages.gallery.title": "Gallery",
    "pages.gallery.desc": "Talks, visits, campus events, and overseas learning moments.",
    "pages.news.title": "News",
    "pages.news.desc": "Announcements, admissions updates, events, and important notices.",
    "pages.downloads.title": "Downloads",
    "pages.downloads.desc": "Frequently used forms and policy documents.",
    "pages.com.title": "College of Management",
    "pages.com.desc": "Resources, links, and an overview of the College of Management.",

    "home.cta.apply": "Apply Now",
    "home.cta.programHighlights": "Explore program highlights",
    "home.news.latest": "Latest news",
    "home.news.more": "More news",
    "home.highlights.title": "Activities",
    "article.readMore": "Read more",
    "article.readLess": "Show less",

    "news.tag.admissions": "Admissions",
    "news.tag.spotlight": "Spotlight",
    "news.tag.campus": "Campus",
    "news.tag.partnership": "Partnership",
    "news.tag.program": "Program",
    "news.tag.career": "Career",
    "news.tag.alumni": "Alumni",
  },
};

/** Mirrors announcements from the official imMBA site; titles open the source article in a new tab. */
const OFFICIAL_NEWS_BASE = "https://www.management.fju.edu.tw/subweb/immba/news-detail.php";

export const NEWS = [
  {
    date: "2026/02/09",
    tag: "Admissions",
    title_zh:
      "TOP（外國學生申請入學）2026秋季班：第二輪申請（5/1–5/31）現正開放",
    title_en:
      "TOP (international applicants) Fall 2026, apply now (May 1 – May 31) — second round",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3261`,
  },
  {
    date: "2026/03/18",
    tag: "Spotlight",
    featured: true,
    title_zh: "【用同樣的學費，走一段法國的學習歷程】",
    title_en: "Study in France at the same tuition — an overseas learning journey",
    image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/Bordeaux%20Campus%20(002)(2).jpg",
    body_zh:
      "以同樣學費走進法國校園，是國際經管為學生打造的重要海外學習路徑之一。透過合作學校的安排，學生能在異地體驗跨文化課堂、企業參訪與生活練習，把課本所學放回真實情境中檢驗。本篇文章整理申請流程、出發前準備與抵達後的學習節奏，並收錄學長姐的經驗分享，讓你事前掌握重點、出國後更安心地投入學習。",
    body_en:
      "Studying in France at the same tuition is one of the key overseas pathways we offer. Through partner schools, you join cross-cultural classes, company visits, and everyday practice abroad—testing what you learn in real settings. This piece walks through application steps, pre-departure prep, and the rhythm of study on site, with notes from alumni so you can plan ahead and settle in with confidence.",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3278`,
  },
  {
    date: "2026/03/11",
    tag: "Campus",
    featured: true,
    title_zh: "【上週末的輔大開箱日，你也來逛校園了嗎？】",
    title_en: "FJCU open campus day last weekend — did you visit?",
    image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/FJCU%20open%20house%202026(1).jpg",
    body_zh:
      "開箱日讓準新生與家長實際走進教室、圖書館與學習空間，聽見學長姐的第一手分享，也與師長面對面談論課程與生活。活動當天安排導覽、系所說明與問答，協助你評估是否適合國際經管的學習節奏。若你錯過現場，仍可從本篇整理重點：報名方式、動線與常見問題，作為下一次參與或線上諮詢的參考。",
    body_en:
      "Open campus day brings future students and families into classrooms, the library, and learning spaces—with peer stories and face-to-face chats about courses and daily life. Guided tours, program briefings, and Q&A help you judge whether the pace fits you. If you missed it, this summary covers how to register, the flow, and frequent questions for your next visit or online inquiry.",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3267`,
  },
  {
    date: "2026/03/09",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 115碩士招生口試通知",
    title_en: "(English-taught MBA) 2026 intake — interview notice",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3262`,
  },
  {
    date: "2026/03/04",
    tag: "Partnership",
    featured: true,
    title_zh: "【為什麼我們能與海外名校展開合作對話？】",
    title_en: "Why we can engage in dialogue with leading global universities",
    image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/44182--(1).jpg",
    body_zh:
      "國際合作不只是簽約儀式，而是長期互信、課程對接與師生互訪的累積。我們從教學品質、研究能量與學生需求出發，尋找價值契合的夥伴，並以清楚的治理與溝通節奏維繫關係。本文說明我們評估合作學校的面向、雙方如何共備課程，以及學生能從中獲得的交換、雙聯與專題資源，幫助你理解國際經管的全球網絡如何成形。",
    body_en:
      "Partnerships are more than ceremonies—they rest on trust, aligned curricula, and steady faculty and student exchanges. We look for values and quality that match our teaching and research, then sustain ties with clear governance and communication. Here is how we assess schools, co-develop courses, and unlock exchange, dual-degree, and project opportunities for students—so you can see how the network takes shape.",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3256`,
  },
  {
    date: "2026/02/25",
    tag: "Partnership",
    featured: true,
    title_zh: "【國際合作版圖再拓展｜即將迎來第一所來自英國的大學】",
    title_en: "Global partnerships expand — our first university partner from the UK",
    image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/43799(1).jpg",
    body_zh:
      "隨著第一所英國大學夥伴即將加入，學生將多一條前往英語系國家深化學習的路徑。未來預期在課程銜接、短期研習與學分認列上逐步開放，細節仍依雙方行政時程公告。我們會持續更新申請資格、名額與注意事項；歡迎關注後續說明會與教學組公告，及早規劃你的海外學習時程與財務準備。",
    body_en:
      "As our first UK partner comes on board, students gain another pathway to deepen study in an English-speaking context. We expect staged openings for course alignment, short visits, and credit transfer—details will follow official timelines. Watch for eligibility, quotas, and notes in info sessions and program office posts, and plan your timeline and budget early.",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3249`,
  },
  {
    date: "2026/02/11",
    tag: "Spotlight",
    title_zh: "【走出去之後，開始用不一樣的角度看世界】",
    title_en: "After going abroad, seeing the world with new eyes",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3241`,
  },
  {
    date: "2026/02/04",
    tag: "Spotlight",
    title_zh: "【在國際經管上課，是什麼感覺？】",
    title_en: "What is it like to take classes in the international MBA program?",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3237`,
  },
  {
    date: "2026/01/28",
    tag: "Spotlight",
    title_zh: "【一個下午在超市：學生的海外學習初體驗】",
    title_en: "An afternoon at the supermarket — students’ first overseas learning experience",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3236`,
  },
  {
    date: "2025/11/18",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 115碩士招生報名：2026/1/6-1/15",
    title_en: "(English-taught MBA) 2026 admission application: Jan 6–15, 2026",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2636`,
  },
  {
    date: "2025/10/29",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 115甄試招生口試通知",
    title_en: "(English-taught MBA) 2026 screening — interview notice",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2735`,
  },
  {
    date: "2025/09/09",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 115甄試招生報名：2025/10/03-10/20",
    title_en: "(English-taught MBA) 2026 screening application: Oct 3–20, 2025",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2689`,
  },
  {
    date: "2025/09/08",
    tag: "Alumni",
    title_zh: "你的未來從國際經管imMBA開始-在美國任教的白居諺學長分享",
    title_en: "Your future starts at imMBA — alumnus Pai Chu-yen shares from the U.S.",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=3186`,
  },
  {
    date: "2025/08/01",
    tag: "Program",
    title_zh: "1+1跨國雙碩士分享：世界很大 給自己生命添加一點養分",
    title_en: "1+1 dual master’s sharing: the world is vast — add something to your life",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2985`,
  },
  {
    date: "2025/06/30",
    tag: "Program",
    title_zh: "國際經管imMBA跨國雙碩士 在地學習國際化多元體驗",
    title_en: "imMBA dual master’s — local study with a global, diverse experience",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2397`,
  },
  {
    date: "2025/04/15",
    tag: "Program",
    title_zh: "五年一貫、1+1雙聯碩士，你也可以!!",
    title_en: "Five-year pathway & 1+1 dual master’s — you can do it too",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2192`,
  },
  {
    date: "2025/01/30",
    tag: "Career",
    title_zh: "管理學院職涯平台-工作職缺",
    title_en: "College of Management career platform — job openings",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2905`,
  },
  {
    date: "2024/12/30",
    tag: "Program",
    title_zh: "《踏出舒適圈，探索更多的可能》imMBA跨國雙碩士體驗分享",
    title_en: "Step out of your comfort zone — imMBA dual master’s experience",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2147`,
  },
  {
    date: "2024/10/29",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 114甄試招生口試通知",
    title_en: "(English-taught MBA) 2025 screening — interview notice",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2678`,
  },
  {
    date: "2024/03/01",
    tag: "Admissions",
    title_zh: "(國際經管-全英MBA) 113碩士招生口試通知",
    title_en: "(English-taught MBA) 2024 intake — interview notice",
    externalUrl: `${OFFICIAL_NEWS_BASE}?NID=2947`,
  },
];

/** 首頁「精采集錦」：同時具備圖片與雙語內文的公告。 */
export function featuredNewsItems(items = NEWS) {
  const hasFeaturedFlag = items.some((n) => Object.prototype.hasOwnProperty.call(n, "featured"));

  // If admin/author started using `featured`, follow it strictly, while ensuring the
  // highlighted block still has the required image + bilingual text.
  if (hasFeaturedFlag)
    return items.filter(
      (n) =>
        n.featured === true &&
        n.image &&
        typeof n.body_zh === "string" &&
        n.body_zh.trim()
    );

  // Backward compatibility: require image + bilingual bodies.
  return items.filter(
    (n) =>
      n.image &&
      typeof n.body_zh === "string" &&
      n.body_zh.trim() &&
      typeof n.body_en === "string" &&
      n.body_en.trim()
  );
}

// ===== Mutable news storage (admin CRUD) =====
const NEWS_STORAGE_KEY = "immba.news.items.v1";

function extractNID(externalUrl) {
  if (!externalUrl) return null;
  try {
    const u = new URL(externalUrl);
    return u.searchParams.get("NID");
  } catch (_) {
    return null;
  }
}

function ensureNewsId(n) {
  if (n.id) return n.id;
  const nid = extractNID(n.externalUrl);
  if (nid) return `nid:${nid}`;
  if (n.route) return `route:${n.route}`;
  // Stable-enough id for admin-created items without NID.
  return `item:${n.date || ""}:${n.tag || ""}:${(n.title_zh || n.title_en || "").slice(0, 24)}`;
}

function normalizeNewsItems(items) {
  return (items || []).map((n) => ({
    ...n,
    id: ensureNewsId(n),
    featured: Boolean(n.featured),
  }));
}

export function getNewsItems() {
  if (typeof window === "undefined") return NEWS;
  const raw = window.localStorage.getItem(NEWS_STORAGE_KEY);
  if (!raw) return NEWS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return NEWS;
    const normalized = normalizeNewsItems(parsed);
    return normalized;
  } catch (_) {
    return NEWS;
  }
}

export function saveNewsItems(items) {
  if (typeof window === "undefined") return;
  const normalized = normalizeNewsItems(items);
  window.localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(normalized));
}

export function resetNewsItemsToDefault() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NEWS_STORAGE_KEY);
}

export function t(lang, key) {
  const pack = I18N[lang] ?? I18N.en;
  return pack[key] ?? I18N.en[key] ?? key;
}

const NEWS_TAG_I18N_KEY = {
  Admissions: "news.tag.admissions",
  Spotlight: "news.tag.spotlight",
  Campus: "news.tag.campus",
  Partnership: "news.tag.partnership",
  Program: "news.tag.program",
  Career: "news.tag.career",
  Alumni: "news.tag.alumni",
};

/** Localized category label for NEWS[].tag (English keys in data). */
export function newsTagLabel(lang, tag) {
  const key = NEWS_TAG_I18N_KEY[tag];
  return key ? t(lang, key) : tag;
}
