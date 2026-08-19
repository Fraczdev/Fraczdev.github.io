const panelButtons = Array.from(document.querySelectorAll(".menu-btn"));
const contentPanels = new Map(Array.from(document.querySelectorAll(".content-panel"), (panel) => [panel.dataset.panel, panel]));
const panelTitleEl = document.getElementById("panelTitle");
const borderEnv = document.getElementById("borderEnvironment");
const borderToggle = document.getElementById("borderToggle");
const borderName = document.getElementById("borderName");
const inspirationOverlay = document.getElementById("inspirationOverlay");
const inspirationToggle = document.getElementById("inspirationToggle");
const inspirationClose = document.getElementById("inspirationClose");
const secretBorderToggle = document.getElementById("secretBorderToggle");
const secretBorderHint = document.getElementById("secretBorderHint");
const seasonHeart = document.getElementById("seasonHeart");
const orbitText = document.getElementById("enjoyOrbit");
const particleCanvas = document.getElementById("particleCanvas");
const summerSun = document.getElementById("summerSun");
const seasonalAudio = document.getElementById("seasonalAudio");
const audioToggle = document.getElementById("audioToggle");
const nowPlayingCard = document.getElementById("nowPlayingCard");
const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const nowPlayingArtist = document.getElementById("nowPlayingArtist");
const nowPlayingSeason = document.getElementById("nowPlayingSeason");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileOverlay = document.getElementById("mobileOverlay");
const overlayContinue = document.getElementById("overlayContinue");
const stageRoot = document.querySelector(".stage");
const stageFrame = document.querySelector(".stage-frame");
const contentWindow = document.getElementById("contentWindow");
const clockTime = document.getElementById("clockTime");
let contentHeightFrame = null;
let persistentPanelHeight = 0;
let currentStageScale = Number.NaN;
const AUDIO_GAIN_LEVEL = 0.25;
let audioGainContext = null;
let audioGainNode = null;
let audioSourceNode = null;

function ensureAudioGainRouting() {
    if (!seasonalAudio) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioGainContext) {
        audioGainContext = new AudioContextClass();
    }
    if (!audioGainNode) {
        audioGainNode = audioGainContext.createGain();
        audioGainNode.gain.value = AUDIO_GAIN_LEVEL;
    }
    if (!audioSourceNode) {
        try {
            audioSourceNode = audioGainContext.createMediaElementSource(seasonalAudio);
            audioSourceNode.connect(audioGainNode);
            audioGainNode.connect(audioGainContext.destination);
        } catch (error) {
            return null;
        }
    }
    audioGainNode.gain.setValueAtTime(AUDIO_GAIN_LEVEL, audioGainContext.currentTime);
    return audioGainContext;
}

const DESIGN_STAGE_WIDTH = 1270;
const DESIGN_STAGE_HEIGHT = 1040;
const MIN_STAGE_SCALE = 0.68;
const MAX_STAGE_SCALE = 1.18;
const VISIT_FLAG_KEY = 'visitedRedesign';

function readVisitFlag() {
    try {
        if (localStorage.getItem(VISIT_FLAG_KEY) === 'true') return true;
    } catch (error) {
        // noop
    }
    try {
        if (sessionStorage.getItem(VISIT_FLAG_KEY) === 'true') return true;
    } catch (error) {
        // noop
    }
    const cookieMatch = document.cookie.match(new RegExp('(?:^|; )' + VISIT_FLAG_KEY + '=([^;]*)'));
    return cookieMatch?.[1] === 'true';
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function syncViewportScale() {
    if (!stageRoot) return;
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const bodyStyles = getComputedStyle(document.body);
    const bodyHorizontalPadding = (parseFloat(bodyStyles.paddingLeft) || 0) + (parseFloat(bodyStyles.paddingRight) || 0);
    const bodyVerticalPadding = (parseFloat(bodyStyles.paddingTop) || 0) + (parseFloat(bodyStyles.paddingBottom) || 0);
    const availableWidth = Math.max(0, viewportWidth - bodyHorizontalPadding);
    const availableHeight = Math.max(0, viewportHeight - bodyVerticalPadding);
    const nextScale = clamp(
        Math.min(availableWidth / DESIGN_STAGE_WIDTH, availableHeight / DESIGN_STAGE_HEIGHT),
        MIN_STAGE_SCALE,
        MAX_STAGE_SCALE
    );

    if (!Number.isFinite(nextScale)) return;
    if (!Number.isNaN(currentStageScale) && Math.abs(nextScale - currentStageScale) < 0.0005) return;

    currentStageScale = nextScale;
    document.documentElement.style.setProperty("--stage-scale", nextScale.toFixed(4));
    persistentPanelHeight = 0;

    if (particleField) {
        particleField.handleResize();
    }

    scheduleContentWindowHeight();
}

const panelLabels = {
    about: "ABOUT",
    projects: "PROJECTS",
    contact: "CONTACT"
};

const clockHours = document.getElementById('clockHours');
const clockMinutes = document.getElementById('clockMinutes');
const clockSeconds = document.getElementById('clockSeconds');

function updateClock() {
    const now = new Date();
    const italyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const hours = String(italyTime.getHours()).padStart(2, '0');
    const minutes = String(italyTime.getMinutes()).padStart(2, '0');
    const seconds = String(italyTime.getSeconds()).padStart(2, '0');
    
    if (clockHours) clockHours.textContent = hours;
    if (clockMinutes) clockMinutes.textContent = minutes;
    if (clockSeconds) clockSeconds.textContent = `:${seconds}`;
}


updateClock();
setInterval(updateClock, 1000);


seasonHeart?.addEventListener("click", () => {
    window.location.href = "../";
});

const borderSkins = [
    { label: "Simple", variant: "simple", background: "#000" },
    { label: "Ruins", image: "./assets/borders-backgrounds/ruins.png" },
    { label: "Snowdin", image: "./assets/borders-backgrounds/snowdin.png" },
    { label: "Waterfall", image: "./assets/borders-backgrounds/waterfall.png" },
    { label: "Hotland", image: "./assets/borders-backgrounds/hotland.png" },
    { label: "CORE Castle", image: "./assets/borders-backgrounds/castle.png" },
    { label: "Dog Shrine", image: "./assets/borders-backgrounds/dog.png" },
    { label: "Secret", variant: "secret" }
];

const secretSkinIndex = borderSkins.findIndex((skin) => skin.variant === "secret");
let isSecretBorderActive = false;
let previousBorderIndex = 0;
const secretTrack = {
    title: "...",
    artist: "Hint:",
    quote: "Go where the old meets the new. And if you try a hundred times, you might just find a different place.",
    file: "./assets/songs/mysterious_place.mp3"
};
let currentSeasonTrackInfo = null;
let currentSeasonTrackSeason = null;
let currentSeasonAudioSrc = "";
let wasSeasonTrackPlayingBeforeSecret = false;

let currentPanel = "about";
let borderIndex = 0;
let particleField = null;
let activeSeason = null;

class ParticleField {
    constructor(canvas, textures) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.textures = textures;
        this.maxParticles = 75;
        this.particles = [];
        this.frame = null;
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    }

    setTextures(textures) {
        this.textures = textures;
        this.initParticles();
    }

    initParticles() {
        if (!this.textures.length) return;
        this.particles = Array.from({ length: this.maxParticles }, (_, idx) => this.createParticle(idx));
    }

    laneX(laneIndex) {
        const { width } = this.canvas;
        if (!width) return 0;
        const laneWidth = width / this.maxParticles;
        const jitter = (Math.random() - 0.5) * laneWidth;
        const raw = laneWidth * laneIndex + jitter;
        return (raw % width + width) % width;
    }

    createParticle(idx) {
        const { height } = this.canvas;
        const texture = this.textures[Math.floor(Math.random() * this.textures.length)];
        const size = 18 + Math.random() * 18;
        const laneIndex = idx % this.maxParticles;
        return {
            x: this.laneX(laneIndex),
            y: -Math.random() * (height * 0.25),
            size,
            texture,
            speedY: 0.14 + Math.random() * 0.3,
            speedX: -0.45 + Math.random() * 0.9,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: -0.006 + Math.random() * 0.012
        };
    }

    recycleParticle(particle) {
        Object.assign(particle, this.createParticle(Math.floor(Math.random() * this.maxParticles)));
    }

    update() {
        if (this.prefersReducedMotion.matches) {
            this.stop();
            return;
        }
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of this.particles) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;
            if (particle.y - particle.size > canvas.height) {
                this.recycleParticle(particle);
            }
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            const half = particle.size / 2;
            ctx.drawImage(particle.texture, -half, -half, particle.size, particle.size);
            ctx.restore();
        }
        this.frame = requestAnimationFrame(() => this.update());
    }

    start() {
        if (!this.particles.length) this.initParticles();
        if (!this.frame) this.update();
    }

    stop() {
        if (this.frame) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleResize() {
        if (!stageFrame) return;
        const rect = stageFrame.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.initParticles();
    }

    destroy() {
        this.stop();
        window.removeEventListener("resize", this.handleResize);
    }
}

function setActivePanel(panelId) {
    currentPanel = panelId;
    if (contentWindow) {
        contentWindow.setAttribute("data-panel", panelId);
    }
    panelButtons.forEach((btn) => {
        const isActive = btn.dataset.panel === panelId;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });
    contentPanels.forEach((panel, id) => {
        panel.classList.toggle("is-active", id === panelId);
        panel.setAttribute("tabindex", id === panelId ? "0" : "-1");
    });
    panelTitleEl.textContent = panelLabels[panelId] ?? panelId.toUpperCase();
    scheduleContentWindowHeight();
}

panelButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (btn.dataset.panel === "projects") return;
        setActivePanel(btn.dataset.panel);
    });
    btn.addEventListener("keydown", (event) => {
        const { key } = event;
        if (key === "ArrowDown" || key === "ArrowUp") {
            event.preventDefault();
            const direction = key === "ArrowDown" ? 1 : -1;
            const nextIndex = (index + direction + panelButtons.length) % panelButtons.length;
            panelButtons[nextIndex].focus();
            return;
        }
        if (key === "Home") {
            event.preventDefault();
            panelButtons[0].focus();
            return;
        }
        if (key === "End") {
            event.preventDefault();
            panelButtons[panelButtons.length - 1].focus();
            return;
        }
        if (key === "Enter" || key === " ") {
            event.preventDefault();
            setActivePanel(btn.dataset.panel);
        }
    });
});

setActivePanel(currentPanel);
syncViewportScale();
refreshContentWindowHeight();

function lengthToPixels(lengthValue) {
    if (!lengthValue) return 0;
    const trimmed = String(lengthValue).trim();
    if (!trimmed) return 0;
    const numeric = parseFloat(trimmed);
    if (Number.isNaN(numeric)) return 0;
    if (trimmed.endsWith("rem")) {
        const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return numeric * rootSize;
    }
    if (trimmed.endsWith("em") && contentWindow) {
        const contextSize = parseFloat(getComputedStyle(contentWindow).fontSize) || 16;
        return numeric * contextSize;
    }
    return numeric;
}

function refreshContentWindowHeight() {
    if (!contentWindow) return;
    const activePanel = contentPanels.get(currentPanel);
    if (!activePanel) return;
    const computed = getComputedStyle(contentWindow);
    const minValue = computed.getPropertyValue("--panel-min") || "0";
    const maxValue = computed.getPropertyValue("--panel-max") || "";
    const minPx = lengthToPixels(minValue);
    const maxPx = lengthToPixels(maxValue);
    const rect = activePanel.getBoundingClientRect();
    const panelHeight = rect.height || activePanel.scrollHeight;
    let targetHeight = Math.max(panelHeight, minPx);
    if (maxPx > 0) {
        targetHeight = Math.min(targetHeight, maxPx);
    }
    if (Number.isFinite(targetHeight) && targetHeight > 0) {
        persistentPanelHeight = Math.max(persistentPanelHeight, targetHeight);
        contentWindow.style.setProperty("--panel-height", `${persistentPanelHeight}px`);
    }
}

function scheduleContentWindowHeight() {
    if (contentHeightFrame) cancelAnimationFrame(contentHeightFrame);
    contentHeightFrame = requestAnimationFrame(() => {
        contentHeightFrame = null;
        refreshContentWindowHeight();
    });
}

function applyBorderSkin(index) {
    const safeIndex = ((index % borderSkins.length) + borderSkins.length) % borderSkins.length;
    borderIndex = safeIndex;
    const skin = borderSkins[safeIndex];
    const variant = skin?.variant || null;
    stageRoot?.classList.remove("stage--simple-border", "stage--secret-border");
    if (variant === "simple") {
        stageRoot?.classList.add("stage--simple-border");
    } else if (variant === "secret") {
        stageRoot?.classList.add("stage--secret-border");
    }
    if (borderEnv) {
        if (skin?.image) {
            borderEnv.style.backgroundImage = `url(${skin.image})`;
            borderEnv.style.backgroundSize = "cover";
            borderEnv.style.backgroundPosition = "center";
            borderEnv.style.backgroundRepeat = "no-repeat";
            borderEnv.style.backgroundColor = "";
            borderEnv.style.filter = "none";
        } else if (variant === "secret") {
            borderEnv.style.backgroundImage = "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 55%), linear-gradient(120deg, #090017, #001726, #12001f)";
            borderEnv.style.backgroundSize = "cover";
            borderEnv.style.backgroundPosition = "center";
            borderEnv.style.backgroundRepeat = "no-repeat";
            borderEnv.style.backgroundColor = "";
            borderEnv.style.filter = "saturate(1.4)";
        } else {
            borderEnv.style.backgroundImage = "none";
            borderEnv.style.backgroundSize = "";
            borderEnv.style.backgroundPosition = "";
            borderEnv.style.backgroundRepeat = "";
            borderEnv.style.backgroundColor = skin?.background || "#000";
            borderEnv.style.filter = "none";
        }
    }
    if (borderName && skin?.label) {
        borderName.textContent = skin.label;
    }
}

function triggerSecretFlash() {
    if (!stageRoot) return;
    stageRoot.classList.add("stage--secret-flash");
    window.setTimeout(() => stageRoot.classList.remove("stage--secret-flash"), 800);
}

function updateSeasonHeartVisibility(seasonName) {
    if (!seasonHeart) return;
    const shouldShow = seasonName !== "summer";
    seasonHeart.classList.toggle("is-visible", shouldShow);
}

function updateSecretToggleState() {
    if (secretBorderToggle) {
        secretBorderToggle.classList.toggle("overlay-heartline--active", isSecretBorderActive);
        secretBorderToggle.setAttribute("aria-pressed", String(isSecretBorderActive));
    }
    if (secretBorderHint) {
        secretBorderHint.textContent = isSecretBorderActive
            ? "Secret border active. Tap again to return."
            : "Tap the hearts to unlock a secret border.";
    }
}

function activateSecretBorder() {
    if (secretSkinIndex === -1 || isSecretBorderActive) return;
    isSecretBorderActive = true;
    previousBorderIndex = borderIndex;
    wasSeasonTrackPlayingBeforeSecret = Boolean(seasonalAudio && !seasonalAudio.paused);
    applyBorderSkin(secretSkinIndex);
    triggerSecretFlash();
    const secretSrc = secretTrack?.file;
    if (seasonalAudio && secretSrc) {
        seasonalAudio.pause();
        seasonalAudio.src = secretSrc;
        seasonalAudio.load();
        if (wasSeasonTrackPlayingBeforeSecret) {
            seasonalAudio
                .play()
                .then(() => updateAudioToggle())
                .catch(() => updateAudioToggle());
        } else {
            updateAudioToggle();
        }
    } else {
        updateAudioToggle();
    }
    updateNowPlayingDisplay(secretTrack, "secret");
    updateSecretToggleState();
}

function deactivateSecretBorder() {
    if (!isSecretBorderActive) return;
    isSecretBorderActive = false;
    applyBorderSkin(previousBorderIndex);
    const seasonSrc = seasonalAudio?.dataset?.seasonSrc || currentSeasonAudioSrc;
    const shouldResume = wasSeasonTrackPlayingBeforeSecret;
    wasSeasonTrackPlayingBeforeSecret = false;
    if (seasonalAudio && seasonSrc) {
        seasonalAudio.pause();
        seasonalAudio.src = seasonSrc;
        seasonalAudio.load();
        if (shouldResume) {
            seasonalAudio
                .play()
                .then(() => updateAudioToggle())
                .catch(() => updateAudioToggle());
        } else {
            updateAudioToggle();
        }
    } else {
        updateAudioToggle();
    }
    if (currentSeasonTrackInfo) {
        updateNowPlayingDisplay(currentSeasonTrackInfo, currentSeasonTrackSeason || activeSeason);
    } else {
        updateNowPlayingDisplay(null, activeSeason);
    }
    updateSecretToggleState();
}

applyBorderSkin(borderIndex);
updateSecretToggleState();

borderToggle?.addEventListener("click", () => {
    if (isSecretBorderActive) {
        deactivateSecretBorder();
        return;
    }
    let nextIndex = (borderIndex + 1) % borderSkins.length;
    while (borderSkins[nextIndex]?.variant === "secret" && nextIndex !== borderIndex) {
        nextIndex = (nextIndex + 1) % borderSkins.length;
    }
    borderIndex = nextIndex;
    applyBorderSkin(borderIndex);
});

secretBorderToggle?.addEventListener("click", () => {
    if (isSecretBorderActive) {
        deactivateSecretBorder();
    } else {
        activateSecretBorder();
    }
});

function detectSeason(date = new Date()) {
    const month = date.getMonth();
    if (month === 11 || month <= 1) return "winter";
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    return "fall";
}

const season = detectSeason();
activeSeason = season;
updateNowPlayingDisplay(null, season);

async function loadSeasonTextures(seasonName) {
    const manifest = {
        winter: [
            "./assets/season-particles/winter/snowflake1.png",
            "./assets/season-particles/winter/snowflake2.png"
        ],
        spring: ["./assets/season-particles/spring/spring_leaf.png"],
        fall: [
            "./assets/season-particles/fall/leafred.png",
            "./assets/season-particles/fall/leaforange.png",
            "./assets/season-particles/fall/leafyellow.png"
        ]
    };
    const fallbackColors = {
        winter: "#cde7ff",
        spring: "#9df9d0",
        fall: "#ffa974"
    };
    const sources = manifest[seasonName] ?? [];
    const textures = await Promise.all(
        sources.map((src) =>
            loadImage(src).catch(() => createFallbackTexture(fallbackColors[seasonName] || "#ffffff"))
        )
    );
    if (textures.length) return textures;
    return [await createFallbackTexture(fallbackColors[seasonName] || "#ffffff")];
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function createFallbackTexture(color) {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.quadraticCurveTo(32, 10, 16, 32);
        ctx.quadraticCurveTo(0, 10, 16, 0);
        ctx.closePath();
        ctx.fill();
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = canvas.toDataURL("image/png");
    });
}

async function startParticlesForSeason(seasonName) {
    updateSeasonHeartVisibility(seasonName);
    if (!particleCanvas || !summerSun || !stageFrame) return;
    activeSeason = seasonName;
    if (prefersReducedMotion.matches) {
        particleCanvas.style.display = "none";
        summerSun.classList.toggle("is-active", seasonName === "summer");
        if (particleField) {
            particleField.destroy();
            particleField = null;
        }
        return;
    }

    if (seasonName === "summer") {
        particleCanvas.style.display = "none";
        summerSun.classList.add("is-active");
        if (particleField) particleField.destroy();
        particleField = null;
        return;
    }

    summerSun.classList.remove("is-active");
    particleCanvas.style.display = "block";
    const textures = await loadSeasonTextures(seasonName);
    if (!particleField) {
        particleField = new ParticleField(particleCanvas, textures);
    } else {
        particleField.setTextures(textures);
    }
    particleField.start();
}

startParticlesForSeason(season).catch(() => {});
const handleMotionPreference = () => {
    startParticlesForSeason(activeSeason ?? season).catch(() => {});
};
if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", handleMotionPreference);
} else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(handleMotionPreference);
}

const seasonalTracks = {
    winter: {
        title: "Uwa!! So Holiday♫",
        artist: "Toby Fox",
        quote: "cold outside but stay warm inside of you",
        files: ["./assets/songs/Uwa!!So Holiday.mp3"]
    },
    spring: {
        title: "Uwa!! So Temperate♫",
        artist: "Toby Fox",
        quote: "spring time\nback to school",
        files: ["./assets/songs/Uwa!!So Temperate.mp3"]
    },
    summer: {
        title: "Uwa!! So HEATS!!♫",
        artist: "Toby Fox",
        quote: "try to withstand the sun's life-giving rays",
        files: ["./assets/songs/Uwa!!So HEATS!!.mp3"]
    },
    fall: {
        title: "Uwa!! So Temperate♫",
        artist: "Toby Fox",
        quote: "spring time\nback to school",
        files: ["./assets/songs/Uwa!!So Temperate.mp3"]
    }
};

function formatSeasonLabel(seasonName) {
    if (!seasonName) return "SEASONAL OST";
    return `${seasonName.toUpperCase()} THEME`;
}

function updateNowPlayingDisplay(track, seasonName) {
    if (!nowPlayingTitle || !nowPlayingArtist || !nowPlayingSeason) return;
    if (!track) {
        nowPlayingTitle.textContent = "Seasonal OST warming up…";
        nowPlayingArtist.textContent = "Interact to unlock the track.";
        nowPlayingSeason.textContent = formatSeasonLabel(seasonName);
        return;
    }
    nowPlayingTitle.textContent = track.title || formatSeasonLabel(seasonName);
    nowPlayingArtist.textContent = track.artist || "Toby Fox";
    nowPlayingSeason.textContent = track.quote || formatSeasonLabel(seasonName);
}

function setNowPlayingActiveState(isPlaying) {
    if (!nowPlayingCard) return;
    nowPlayingCard.classList.toggle("is-idle", !isPlaying);
}

async function configureSeasonalAudio(seasonName) {
    const track = seasonalTracks[seasonName];
    const shouldShowSeasonTrack = !isSecretBorderActive;
    if (!track) {
        currentSeasonTrackInfo = null;
        currentSeasonTrackSeason = seasonName;
        if (shouldShowSeasonTrack) {
            updateNowPlayingDisplay(null, seasonName);
        }
        return;
    }
    currentSeasonTrackInfo = track;
    currentSeasonTrackSeason = seasonName;
    if (shouldShowSeasonTrack) {
        updateNowPlayingDisplay(track, seasonName);
    }
    if (!seasonalAudio) return;
    let resolvedSrc = "";
    for (const file of track.files) {
        if (!file) continue;
        const ok = await canLoadAsset(file);
        if (ok) {
            resolvedSrc = file;
            break;
        }
    }
    if (!resolvedSrc) {
        updateAudioToggle();
        return;
    }
    currentSeasonAudioSrc = resolvedSrc;
    seasonalAudio.dataset.seasonSrc = resolvedSrc;
    if (!isSecretBorderActive) {
        seasonalAudio.src = resolvedSrc;
    }
    audioToggle?.removeAttribute("disabled");
    updateAudioToggle();

    const hasVisited = readVisitFlag();
    if (!hasVisited) {
        return;
    }

    const resumePlayback = () => {
        const audioContext = ensureAudioGainRouting();
        audioContext?.resume?.().catch(() => {});
        seasonalAudio
            .play()
            .then(() => updateAudioToggle())
            .catch(() => {});
    };
    window.addEventListener("pointerdown", resumePlayback, { once: true });
}

async function canLoadAsset(url) {
    try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) return true;
    } catch (err) {
        // noop
    }
    try {
        const fallback = await fetch(url, { method: "GET" });
        return fallback.ok;
    } catch (err) {
        return false;
    }
}

function updateAudioToggle() {
    if (!audioToggle || !seasonalAudio) return;
    const hasSource = Boolean(seasonalAudio.src);
    if (!hasSource) {
        audioToggle.disabled = true;
        audioToggle.textContent = "Play music";
        audioToggle.setAttribute("aria-pressed", "false");
        audioToggle.classList.remove("is-active");
        setNowPlayingActiveState(false);
        return;
    }
    const playing = !seasonalAudio.paused;
    audioToggle.disabled = false;
    audioToggle.textContent = playing ? "Pause music" : "Play music";
    audioToggle.setAttribute("aria-pressed", playing ? "true" : "false");
    audioToggle.classList.toggle("is-active", playing);
    setNowPlayingActiveState(playing);
}

configureSeasonalAudio(season);
updateAudioToggle();

audioToggle?.addEventListener("click", () => {
    if (!seasonalAudio?.src) return;
    const audioContext = ensureAudioGainRouting();
    if (seasonalAudio.paused) {
        audioContext?.resume?.().catch(() => {});
        seasonalAudio
            .play()
            .then(() => {
                updateAudioToggle();
            })
            .catch(() => {});
    } else {
        seasonalAudio.pause();
        updateAudioToggle();
    }
});

seasonalAudio?.addEventListener("play", () => updateAudioToggle());
seasonalAudio?.addEventListener("pause", () => updateAudioToggle());
ensureAudioGainRouting();

function showInspirationOverlay() {
    if (!inspirationOverlay) return;
    inspirationOverlay.classList.add("is-visible");
    inspirationOverlay.setAttribute("aria-hidden", "false");
    orbitText?.classList.add("is-muted");
}

function hideInspirationOverlay() {
    if (!inspirationOverlay) return;
    inspirationOverlay.classList.remove("is-visible");
    inspirationOverlay.setAttribute("aria-hidden", "true");
    orbitText?.classList.remove("is-muted");
}

if (inspirationOverlay) {
    inspirationOverlay.setAttribute("aria-hidden", "true");
}

inspirationToggle?.addEventListener("click", showInspirationOverlay);
inspirationClose?.addEventListener("click", hideInspirationOverlay);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inspirationOverlay?.classList.contains("is-visible")) {
        hideInspirationOverlay();
    }
});

let overlayDismissed = false;
function syncOverlayVisibility() {
    if (!mobileOverlay) return;
    const shouldShow = window.innerWidth <= 960 && !overlayDismissed;
    if (shouldShow) {
        mobileOverlay.classList.remove("is-hidden");
        mobileOverlay.removeAttribute("aria-hidden");
    } else {
        mobileOverlay.classList.add("is-hidden");
        mobileOverlay.setAttribute("aria-hidden", "true");
    }
}

overlayContinue?.addEventListener("click", () => {
    overlayDismissed = true;
    syncOverlayVisibility();
});

window.addEventListener("resize", syncViewportScale);
window.addEventListener("orientationchange", syncViewportScale);
window.addEventListener("resize", syncOverlayVisibility);
syncOverlayVisibility();
window.addEventListener("resize", scheduleContentWindowHeight);
window.addEventListener("load", refreshContentWindowHeight);
window.addEventListener("load", syncViewportScale);
