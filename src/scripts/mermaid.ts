const MERMAID_SELECTOR = "pre code";

function findMermaidBlocks(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(MERMAID_SELECTOR)].filter((code) => {
    const pre = code.closest("pre");
    return (
      code.classList.contains("language-mermaid") ||
      pre?.getAttribute("data-language") === "mermaid" ||
      pre?.classList.contains("language-mermaid")
    );
  });
}

async function renderMermaidBlocks(): Promise<void> {
  const blocks = findMermaidBlocks();
  if (blocks.length === 0) return;

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: {
      fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
      primaryColor: "#f3ede4",
      primaryTextColor: "#22201c",
      primaryBorderColor: "#cfc4b6",
      lineColor: "#8a7f72",
      secondaryColor: "#e8dfd2",
      tertiaryColor: "#faf7f1",
      noteBkgColor: "#f7f1e8",
      noteTextColor: "#4d463d",
      noteBorderColor: "#d8cfc3",
    },
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      padding: 16,
      nodeSpacing: 28,
      rankSpacing: 36,
    },
  });

  for (const [index, code] of blocks.entries()) {
    const pre = code.closest("pre");
    if (!pre) continue;

    const source = code.textContent?.trim() ?? "";
    if (!source) continue;

    const figure = document.createElement("figure");
    figure.className = "mermaid-diagram";
    const target = document.createElement("div");
    target.className = "mermaid";
    target.textContent = source;
    figure.append(target);
    pre.replaceWith(figure);

    try {
      const { svg } = await mermaid.render(`mermaid-note-${index}`, source);
      target.innerHTML = svg;
    } catch (error) {
      figure.classList.add("mermaid-diagram--error");
      const message = error instanceof Error ? error.message : String(error);
      target.className = "mermaid-error";
      target.textContent = `Mermaid 渲染失败：\n${message}\n\n${source}`;
    }
  }
}

void renderMermaidBlocks();
