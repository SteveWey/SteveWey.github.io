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
const lyricPrev = document.querySelector<HTMLElement>("[data-lyric-prev]");
const lyricCurrent = document.querySelector<HTMLElement>("[data-lyric-current]");
const lyricNext = document.querySelector<HTMLElement>("[data-lyric-next]");

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

function renderLyrics(current: number): void {
  if (!lyricsBlock || lyricLines.length === 0) return;

  let index = -1;
  for (let i = 0; i < lyricLines.length; i += 1) {
    if (lyricLines[i].time <= current + 0.25) index = i;
    else break;
  }

  if (lyricPrev) lyricPrev.textContent = index > 0 ? lyricLines[index - 1].text : "";
  if (lyricCurrent) lyricCurrent.textContent = index >= 0 ? lyricLines[index].text : "·";
  if (lyricNext) {
    lyricNext.textContent =
      index < 0
        ? lyricLines[0].text
        : index < lyricLines.length - 1
          ? lyricLines[index + 1].text
          : "";
  }
}

async function loadLyrics(src: string): Promise<void> {
  const request = ++lyricRequest;
  lyricLines = [];
  if (lyricsBlock) lyricsBlock.hidden = true;

  if (!src) return;

  try {
    const response = await fetch(src);
    if (!response.ok) return;
    const data = parseLrc(await response.text());
    if (request !== lyricRequest || data.length === 0) return;
    lyricLines = data;
    if (lyricsBlock) lyricsBlock.hidden = false;
    if (audio) renderLyrics(audio.currentTime || 0);
  } catch {
    // 没有歌词或歌词文件不可读时保持隐藏。
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
