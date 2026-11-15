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
      try {
        await audio.play();
        showMiniPlayer();
      } catch {
        setMusicButtonState(false);
      }
    });
  });

  updateProgress();
}
