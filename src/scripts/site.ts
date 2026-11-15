const root = document.documentElement;
const body = document.body;
const base = body.dataset.base || "/";
const THEME_KEY = "personal-site-theme";
const themes = ["clay", "pine", "indigo", "ochre", "rosewood"];

/* ---------- Theme ---------- */
function currentTheme(): string {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved && themes.includes(saved) ? saved : "clay";
  } catch {
    return "clay";
  }
}

function applyTheme(theme: string, persist = true): void {
  root.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const color = getComputedStyle(root).getPropertyValue("--color-bg").trim();
    if (color) meta.setAttribute("content", color);
  }
  document.querySelectorAll<HTMLElement>(".theme-dot").forEach((dot) => {
    dot.setAttribute("aria-pressed", String(dot.dataset.themeChoice === theme));
  });
}

applyTheme(currentTheme(), false);
document.querySelectorAll<HTMLButtonElement>(".theme-dot").forEach((dot) => {
  dot.addEventListener("click", () => applyTheme(dot.dataset.themeChoice || "clay"));
});

/* ---------- Sidebar drawer ---------- */
const sidebar = document.querySelector<HTMLElement>(".library-sidebar");
const sidebarToggle = document.querySelector<HTMLButtonElement>("[data-sidebar-toggle]");
const sidebarClose = document.querySelector<HTMLButtonElement>("[data-sidebar-close]");
const sidebarBackdrop = document.querySelector<HTMLElement>("[data-sidebar-backdrop]");

function closeSidebar(): void {
  if (!sidebar || !sidebar.classList.contains("is-open")) return;
  sidebar.classList.remove("is-open");
  body.classList.remove("sidebar-open");
  sidebarBackdrop?.classList.remove("is-open");
  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "打开导航");
    const icon = sidebarToggle.querySelector("span");
    if (icon) icon.textContent = "☰";
  }
}

function openSidebar(): void {
  if (!sidebar) return;
  sidebar.classList.add("is-open");
  body.classList.add("sidebar-open");
  sidebarBackdrop?.classList.add("is-open");
  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "关闭导航");
    const icon = sidebarToggle.querySelector("span");
    if (icon) icon.textContent = "×";
  }
}

sidebarToggle?.addEventListener("click", () => {
  if (sidebar?.classList.contains("is-open")) closeSidebar();
  else openSidebar();
});
sidebarClose?.addEventListener("click", closeSidebar);
sidebarBackdrop?.addEventListener("click", closeSidebar);
sidebar?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeSidebar);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSidebar();
});

/* ---------- Search / tags / kinds ---------- */
const searchInput = document.querySelector<HTMLInputElement>("#library-search");
const searchStatus = document.querySelector<HTMLElement>("#search-status");
const searchables = [...document.querySelectorAll<HTMLElement>("[data-search]")];
const searchSections = [...document.querySelectorAll<HTMLElement>("[data-search-section]")];
const tagButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-tag-filter]")];
const kindButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-kind-filter]")];
let activeTag = "all";
let activeKind = "all";

function setActiveTag(tag: string): void {
  activeTag = tag;
  tagButtons.forEach((button) => {
    const active = (button.dataset.tagFilter || "all") === tag;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateGroupVisibility(): void {
  document.querySelectorAll<HTMLElement>("[data-note-group]").forEach((group) => {
    const kind = group.dataset.noteGroup;
    const head = document.querySelector<HTMLElement>(`[data-group-head="${kind}"]`);
    const showKind = activeKind === "all" || kind === activeKind;
    const visible = [...group.querySelectorAll<HTMLElement>("[data-search]")].some(
      (item) => !item.hidden
    );
    group.hidden = !showKind || !visible;
    if (head) head.hidden = !showKind || !visible;
  });
}

function applyFilters(): void {
  const query = (searchInput?.value || "").trim().toLowerCase();
  let count = 0;

  searchables.forEach((item) => {
    const haystack = (
      (item.dataset.search || "") + " " + item.textContent
    ).toLowerCase();
    const tags = (item.dataset.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const kind = item.dataset.kind || "";
    const isNote = kind === "tech" || kind === "study";

    const matchesQuery = !query || haystack.includes(query);
    const matchesTag = activeTag === "all" || tags.includes(activeTag);
    const matchesKind = !isNote || activeKind === "all" || kind === activeKind;
    item.hidden = !(matchesQuery && matchesTag && matchesKind);
    if (!item.hidden) count += 1;
  });

  updateGroupVisibility();

  searchSections.forEach((section) => {
    const items = [...section.querySelectorAll<HTMLElement>("[data-search]")];
    const visible = items.some((item) => !item.hidden);
    section.hidden = (Boolean(query) || activeTag !== "all" || activeKind !== "all") && !visible;
  });

  if (searchStatus) {
    if (query) {
      searchStatus.hidden = false;
      searchStatus.textContent = count > 0 ? `${count} 条结果 · “${query}”` : `没有找到“${query}”`;
    } else {
      searchStatus.hidden = true;
      searchStatus.textContent = "";
    }
  }

  const params = new URLSearchParams(window.location.search);
  if (query) params.set("q", query);
  else params.delete("q");
  if (activeTag !== "all") params.set("tag", activeTag);
  else params.delete("tag");
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
  searchInput.addEventListener("search", applyFilters);
}

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTag(button.dataset.tagFilter || "all");
    applyFilters();
  });
});

kindButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeKind = button.dataset.kindFilter || "all";
    kindButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    applyFilters();
  });
});

/* ---------- Music archive facets ---------- */
const facetButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-facet]")];
const archiveRows = [...document.querySelectorAll<HTMLElement>("[data-archive-row]")];
const archiveEmpty = document.querySelector<HTMLElement>("[data-archive-empty]");
const activeFacets: Record<string, string> = {
  artist: "all",
  album: "all",
  genre: "all",
};

function applyFacets(): void {
  let visible = 0;
  archiveRows.forEach((row) => {
    const matches = Object.entries(activeFacets).every(([facet, value]) => {
      if (value === "all") return true;
      return (row.dataset[facet] || "") === value;
    });
    row.hidden = !matches;
    if (matches) visible += 1;
  });
  if (archiveEmpty) archiveEmpty.hidden = visible > 0;
}

facetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const facet = button.dataset.facet;
    if (!facet) return;
    activeFacets[facet] = button.dataset.facetValue || "all";
    facetButtons
      .filter((item) => item.dataset.facet === facet)
      .forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    applyFacets();
  });
});

if (archiveRows.length) applyFacets();

const initial = new URLSearchParams(window.location.search);
const initialQuery = initial.get("q");
const initialTag = initial.get("tag");
if (initialQuery && searchInput) searchInput.value = initialQuery;
if (initialTag) setActiveTag(initialTag);
if (searchables.length) applyFilters();

if (searchInput && searchables.length === 0) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const query = searchInput.value.trim();
    if (!query) return;
    window.location.href = `${base}?q=${encodeURIComponent(query)}`;
  });
}

/* Search shortcut */
document.querySelectorAll<HTMLButtonElement>("[data-open-search]").forEach((button) => {
  button.addEventListener("click", () => {
    openSidebar();
    window.setTimeout(() => searchInput?.focus(), 180);
  });
});

document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  const typing =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSidebar();
    window.setTimeout(() => searchInput?.focus(), 180);
  } else if (event.key === "/" && !typing) {
    event.preventDefault();
    openSidebar();
    window.setTimeout(() => searchInput?.focus(), 180);
  }
});

/* ---------- Thread tree geometry ---------- */
function updateThreadTree(): void {
  const map = document.querySelector<HTMLElement>(".thread-map");
  const rootDot = document.querySelector<HTMLElement>(".root-dot");
  const branches = [...document.querySelectorAll<HTMLElement>(".thread-branch")];
  const branchWrap = document.querySelector<HTMLElement>(".thread-branches");
  if (!map || !rootDot || !branches.length || !branchWrap) return;

  const mapRect = map.getBoundingClientRect();
  const branchRects = branches.map((branch) => branch.getBoundingClientRect());
  const centers = branchRects.map(
    (rect, index) => rect.top - mapRect.top + (index === 0 ? 18 : 36)
  );
  const middleIndex = Math.floor((centers.length - 1) / 2);
  const middle =
    centers.length % 2 === 1
      ? centers[middleIndex]
      : (centers[middleIndex] + centers[middleIndex + 1]) / 2;

  map.style.setProperty("--tree-root-y", `${middle}px`);
  const rootRect = rootDot.getBoundingClientRect();
  const rootCenter = rootRect.top + rootRect.height / 2 - mapRect.top;
  const firstCenter = centers[0];
  const lastCenter = centers[centers.length - 1];

  map.style.setProperty("--tree-trunk-top", `${rootCenter}px`);
  map.style.setProperty("--tree-trunk-height", `${Math.max(0, lastCenter - rootCenter)}px`);

  const wrapRect = branchWrap.getBoundingClientRect();
  branchWrap.style.setProperty(
    "--branch-trunk-top",
    `${Math.max(0, firstCenter - (wrapRect.top - mapRect.top))}px`
  );
  branchWrap.style.setProperty(
    "--branch-trunk-height",
    `${Math.max(0, lastCenter - firstCenter)}px`
  );
}

updateThreadTree();
window.addEventListener("load", updateThreadTree);
window.addEventListener("resize", updateThreadTree);

/* ---------- Note page: TOC, progress, code copy ---------- */
const noteArticle = document.querySelector<HTMLElement>("[data-note-article]");
const progress = document.querySelector<HTMLElement>(".reading-progress");
if (noteArticle && progress) {
  const updateProgress = () => {
    const rect = noteArticle.getBoundingClientRect();
    const total = Math.max(1, noteArticle.offsetHeight - window.innerHeight);
    const current = Math.min(total, Math.max(0, -rect.top));
    progress.style.opacity = current > 8 ? "1" : "0";
    progress.style.transform = `scaleX(${current / total})`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>(".note-toc-list a[href^='#']")];
if (tocLinks.length) {
  const headings = tocLinks
    .map((link) => document.getElementById(decodeURIComponent(link.getAttribute("href")!.slice(1))))
    .filter((heading): heading is HTMLElement => Boolean(heading));

  const setActive = (id: string) => {
    tocLinks.forEach((link) => {
      const active = decodeURIComponent(link.getAttribute("href")!.slice(1)) === id;
      link.classList.toggle("is-active", active);
    });
  };

  const updateToc = () => {
    let current = headings[0]?.id;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= 128) current = heading.id;
    }
    if (current) setActive(current);
  };
  updateToc();
  window.addEventListener("scroll", updateToc, { passive: true });
  window.addEventListener("resize", updateToc);
}

document.querySelectorAll<HTMLElement>("pre").forEach((pre) => {
  const code = pre.querySelector("code");
  if (!code) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-code";
  button.textContent = "复制";
  button.setAttribute("aria-label", "复制代码");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.innerText);
      button.textContent = "已复制";
    } catch {
      button.textContent = "复制失败";
    }
    window.setTimeout(() => {
      button.textContent = "复制";
    }, 1500);
  });
  pre.appendChild(button);
});
