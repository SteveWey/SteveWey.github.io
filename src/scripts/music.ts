const audio = document.querySelector<HTMLAudioElement>("#music-audio");
const musicToggles = [...document.querySelectorAll<HTMLButtonElement>("[data-music-toggle]")];
const musicFill = document.querySelector<HTMLElement>("#music-fill");
const musicCurrent = document.querySelector<HTMLElement>("#music-current");
const musicDuration = document.querySelector<HTMLElement>("#music-duration");
const musicTitle = document.querySelector<HTMLElement>("#music-title");
const musicArtist = document.querySelector<HTMLElement>("#music-artist");
const miniPlayer = document.querySelector<HTMLButtonElement>("#mini-player");
const musicArt = document.querySelector<HTMLElement>(".music-art");
const miniCover = document.querySelector<HTMLElement>(".mini-player-cover");
const trackRows = [...document.querySelectorAll<HTMLButtonElement>("[data-track]")];
const lyricsBlock = document.querySelector<HTMLElement>("[data-lyrics]");
const lyricsTrack = document.querySelector<HTMLElement>("[data-lyrics-track]");

type LyricLine = { time: number; text: string };
let lyricLines: LyricLine[] = [];
let lyricRequest = 0;

function parseLrc(source: string): LyricLine[] {
  const lines: LyricLine[] = [];
  let offset = 0;
  const offsetMatch = source.match(/^\[offset:([+-]?\d+)\]/m);
  if (offsetMatch) offset = Number(offsetMatch[1]) / 1000;

  source.split(/\r?\n/).forEach((raw) => {
    const tags = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (tags.length === 0) return;
    const text = raw.replace(/\[[^\]]*\]/g, "").trim();
    if (!text) return;
    if (/^(作词|作曲|编曲|制作人|出品|发行|混音|母带|吉他|贝斯|鼓|键盘|和声|录音|监制|词|曲)\s*[:：]/.test(text)) return;
    tags.forEach((tag) => {
      const minutes = Number(tag[1]);
      const seconds = Number(tag[2]);
      const fraction = Number((tag[3] || "0").padEnd(3, "0").slice(0, 3));
      const time = minutes * 60 + seconds + fraction / 1000 + offset;
      lines.push({ time, text });
    });
  });

  return lines.sort((a, b) => a.time - b.time);
}

function buildLyricsTrack(): void {
  if (!lyricsTrack) return;
  lyricsTrack.replaceChildren(
    ...lyricLines.map((line) => {
      const element = document.createElement("p");
      element.className = "lyric-line";
      element.textContent = line.text;
      return element;
    })
  );
}

function positionLyrics(index: number, animate: boolean): void {
  if (!lyricsBlock || !lyricsTrack || lyricLines.length === 0) return;

  const safeIndex = Math.max(0, Math.min(index, lyricLines.length - 1));
  const lines = [...lyricsTrack.querySelectorAll<HTMLElement>(".lyric-line")];
  lines.forEach((line, lineIndex) => {
    line.classList.toggle("is-current", lineIndex === safeIndex);
    line.classList.toggle("is-prev", lineIndex === safeIndex - 1);
    line.classList.toggle("is-next", lineIndex === safeIndex + 1);
  });

  if (!animate) lyricsTrack.style.transition = "none";
  lyricsTrack.style.transform = `translateY(calc(${1 - safeIndex} * var(--lyric-line-height)))`;
  if (!animate) {
    void lyricsTrack.offsetHeight;
    lyricsTrack.style.transition = "";
  }
}

function renderLyrics(current: number): void {
  if (!lyricsBlock || lyricLines.length === 0) return;

  let index = 0;
  for (let i = 0; i < lyricLines.length; i += 1) {
    if (lyricLines[i].time <= current + 0.25) index = i;
    else break;
  }

  positionLyrics(index, true);
}

async function loadLyrics(src: string): Promise<void> {
  const request = ++lyricRequest;
  const hadLyrics = Boolean(lyricsBlock && !lyricsBlock.hidden && lyricLines.length > 0);
  lyricLines = [];

  if (!src) {
    if (lyricsBlock) lyricsBlock.hidden = true;
    lyricsTrack?.replaceChildren();
    return;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) {
      if (request === lyricRequest && lyricsBlock) {
        lyricsBlock.hidden = true;
        lyricsTrack?.replaceChildren();
      }
      return;
    }
    const data = parseLrc(await response.text());
    if (request !== lyricRequest || data.length === 0) {
      if (request === lyricRequest && lyricsBlock) {
        lyricsBlock.hidden = true;
        lyricsTrack?.replaceChildren();
      }
      return;
    }
    lyricLines = data;
    buildLyricsTrack();
    if (lyricsBlock) lyricsBlock.hidden = false;
    if (audio) renderLyrics(audio.currentTime || 0);
    if (!hadLyrics) positionLyrics(0, false);
  } catch {
    if (request === lyricRequest && lyricsBlock) {
      lyricsBlock.hidden = true;
      lyricsTrack?.replaceChildren();
    }
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function setMusicButtonState(playing: boolean): void {
  musicToggles.forEach((button) => {
    const icon = button.querySelector(".music-icon");
    if (icon) icon.textContent = playing ? "❚❚" : "▶";
    button.setAttribute("aria-label", playing ? "暂停" : "播放");
  });
}

function showMiniPlayer(): void {
  if (!miniPlayer) return;
  miniPlayer.hidden = false;
  requestAnimationFrame(() => miniPlayer.classList.add("is-visible"));
}

function updateProgress(): void {
  if (!audio) return;
  const duration = audio.duration || 0;
  const current = audio.currentTime || 0;
  const percent = duration ? Math.min(100, (current / duration) * 100) : 0;

  if (musicFill) musicFill.style.width = `${percent}%`;
  if (miniPlayer) {
    miniPlayer.style.setProperty("--music-progress", String(percent));
  }
  if (musicCurrent) musicCurrent.textContent = formatTime(current);
  if (musicDuration && duration) musicDuration.textContent = formatTime(duration);
  renderLyrics(current);
}

if (audio) {
  musicToggles.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          await audio.play();
          showMiniPlayer();
        } else {
          audio.pause();
        }
      } catch {
        setMusicButtonState(false);
      }
    });
  });

  audio.addEventListener("play", () => {
    setMusicButtonState(true);
    showMiniPlayer();
  });
  audio.addEventListener("pause", () => setMusicButtonState(false));
  audio.addEventListener("ended", () => {
    setMusicButtonState(false);
    if (musicFill) musicFill.style.width = "0%";
    if (musicCurrent) musicCurrent.textContent = "0:00";
  });
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);

  trackRows.forEach((row) => {
    row.addEventListener("click", async () => {
      const src = row.dataset.src;
      if (!src) return;
      audio.src = src;
      if (musicTitle) musicTitle.textContent = row.dataset.title || "未知曲目";
      if (musicArtist) musicArtist.textContent = row.dataset.artist || "";
      if (musicDuration) musicDuration.textContent = row.dataset.duration || "0:00";
      const cover = row.dataset.cover;
      if (cover && musicArt && miniCover) {
        musicArt.style.backgroundImage = `url("${cover}")`;
        miniCover.style.backgroundImage = `url("${cover}")`;
      }
      trackRows.forEach((item) => item.classList.toggle("is-active", item === row));
      await loadLyrics(row.dataset.lyrics || "");
      try {
        await audio.play();
        showMiniPlayer();
      } catch {
        setMusicButtonState(false);
      }
    });
  });

  updateProgress();
  void loadLyrics(lyricsBlock?.dataset.lyricsSrc || "");
}
