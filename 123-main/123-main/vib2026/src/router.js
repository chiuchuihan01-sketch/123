export function normalizePath(pathname) {
  if (!pathname) return "/";
  const cleaned = pathname.split("?")[0].split("#")[0];
  return cleaned.length > 1 ? cleaned.replace(/\/+$/, "") : cleaned;
}

export function isFileRouting() {
  return window.location.protocol === "file:";
}

export function getCurrentPath() {
  if (isFileRouting()) {
    const raw = window.location.hash || "#/";
    const hashPath = raw.startsWith("#") ? raw.slice(1) : raw;
    return normalizePath(hashPath || "/");
  }
  return normalizePath(window.location.pathname);
}

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  const next = normalizePath(url.pathname);
  if (next === getCurrentPath()) return;
  if (isFileRouting()) {
    window.location.hash = `#${next}`;
    return;
  }
  window.history.pushState({}, "", next);
  window.dispatchEvent(new CustomEvent("app:navigate", { detail: { path: next } }));
}

export function onLinkClick(e) {
  const a = e.target?.closest?.("a[data-link]");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http://") || href.startsWith("https://")) return;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
  e.preventDefault();
  navigate(href);
}

