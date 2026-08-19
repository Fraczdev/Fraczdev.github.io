const scene = document.getElementById("scene");
const treeSprite = document.getElementById("treeSprite");
const krisSpriteBottom = document.getElementById("krisSpriteBottom");
const krisSpriteTop = document.getElementById("krisSpriteTop");
const leafLayer = document.getElementById("leafLayer");
const hitboxEditor = document.getElementById("hitboxEditor");
const hitboxModeToggle = document.getElementById("hitboxModeToggle");
const hitboxClear = document.getElementById("hitboxClear");
const hitboxCopy = document.getElementById("hitboxCopy");
const hitboxOutput = document.getElementById("hitboxOutput");
const hitboxLayer = document.getElementById("hitboxLayer");
const dialogue = document.getElementById("dialogue");
const dialogueText = document.getElementById("dialogueText");
const choiceRow = document.getElementById("choiceRow");
//const choicePointer = document.getElementById("choicePointer");
const choiceYes = document.getElementById("choiceYes");
const choiceNo = document.getElementById("choiceNo");
const bgm = document.getElementById("bgm");
const treeScale = 2.2;
const SpriteScale = 4;
const TreeInteractScale = 1.2;
const DEBUG_HITBOXES = false;
const TreecollisionoffsetX = -40;
const TreecollisionoffsetY = 0;
const TreeInteractSizeRatio = 0.8;
const TreeCollisionWidthFactor = 0.4;
const TreeCollisionHeightFactor = 0.1;
const HeartOffsetX = 0;
const HeartOffsetY = 3;
const LeafSpawnOffsetX = 0.65;
const LeafSpawnOffsetY = 0.58;
const LeafScale = 3.5;
/*const mapWidth = 1600;
const mapHeight = 900; wrong */
const DEFAULT_MAP_HITBOXES = [

    { x: 443, y: 390, width: 222, height: 289 },
  { x: 667, y: 679, width: 86, height: 89 },
  { x: 754, y: 772, width: 91, height: 292 },
  { x: 1041, y: 772, width: 83, height: 285 },
  { x: 1131, y: 678, width: 99, height: 98 },
  { x: 1226, y: 388, width: 83, height: 293 },
  { x: 1155, y: 298, width: 158, height: 86 },
  { x: 757, y: 210, width: 474, height: 95 },
  { x: 656, y: 304, width: 98, height: 94 }

]

const REDIRECT_URL = "../redesign/index.html";
const ASSET_BASE = "../redesign/assets";
const MUSIC_CANDIDATES = [
    `${ASSET_BASE}/Tree/music/eggroom.mp3`
];

const SPRITE_FRAMES = {
    down: [1, 2, 3, 4].map((frame) => `${ASSET_BASE}/spr_kris/spr_kris_walkdown/kriswalkdown_${frame}.png`),
    left: [1, 2, 3, 4].map((frame) => `${ASSET_BASE}/spr_kris/spr_kris_walkleft/kriswalkleft_${frame}.png`),
    right: [1, 2, 3, 4].map((frame) => `${ASSET_BASE}/spr_kris/spr_kris_walkright/kriswalkright_${frame}.png`),
    up: [1, 2, 3, 4].map((frame) => `${ASSET_BASE}/spr_kris/spr_kris_walkup/kriswalkup_${frame}.png`)
};

const TREE_SPRITE_SRC = `${ASSET_BASE}/Tree/rTree.gif`;
const TREE_TRUNK_SRC = `${ASSET_BASE}/Tree/rTreeTrunk.png`;
const LEAF_SRC = `${ASSET_BASE}/Tree/particle emitter/leaf.png`;
const HEART_SRC = `${ASSET_BASE}/inspiration-tagline/red-heart.png`;
const TEXTBOX_SRC = `${ASSET_BASE}/Tree/textbox/dialoguebox.png`;
const TREE_ORIGIN_SHIFT = 45;
const TREE_ORIGIN_SHIFT_Y = 100;
const HITBOX_STORAGE_KEY = "question_mark_hitboxes";
const IDLE_RESET_DELAY = 3000;
const TREE_LEAVES_SRC = `${ASSET_BASE}/Tree/rTree_leavesonly.gif`;
const treeLeavesSprite = document.getElementById("treeLeavesSprite!");


const DIALOGUE_LINES = [
    { type: "text", text: "(Well, there is a man here)" },
    { type: "text", text: "(The man offers you something.)" },
    { type: "choice" },
    { type: "text", text: "(You received the \"Egg\".)" },
    { type: "text", text: "(Well, the man put his hand softly on your shoulder)" },
    { type: "text", text: "(You felt a strange melancholy)" }
];

const state = {
    keys: new Set(),
    direction: "down",
    lastDirection: null,
    hasMoved: false,
    moving: false,
    idleTimer: 0,
    frameIndex: 0,
    frameTimer: 0,
    dialogueActive: false,
    lineIndex: 0,
    typedChars: 0,
    typingComplete: false,
    choiceIndex: 0,
    interactPulseUntil: 0,
    redirecting: false,
    now: performance.now(),
    player: {
        x: 0,
        y: 0,
        width: 72,
        height: 92,
        speed: 220,
        sprintMultiplier: 1.85
    },
    world: {
        width: window.innerWidth,
        height: window.innerHeight
    }
};

let spriteFrames = null;
let dialogueBoxImage = null;
let leafImage = null;
let heartImage = null;
let treeTrunkMask = null;
let animationFrame = 0;
let audioUnlocked = false;
let hitboxes = [];
let hitboxDraft = null;
let hitboxEditorEnabled = false;
let treeTrunkBoundsRatio = null;
let debugLayer = null;

function computeMaskBoundsRatio(mask) {
    let minX = mask.width, minY = mask.height, maxX = 0, maxY = 0;
    for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
            const alpha = mask.data[(y * mask.width + x) * 4 + 3];
            if (alpha > 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    return {
        left: minX / mask.width,
        top: minY / mask.height,
        right: (maxX + 1) / mask.width,
        bottom: (maxY + 1) / mask.height
    };
}


function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function rectsIntersect(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function createFallbackSprite(label) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#8f8f8f";
    ctx.fillRect(10, 14, 44, 68);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, 32, 54);
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    return img;
}

function loadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ src, image, ok: true });
        image.onerror = () => resolve({ src, image: null, ok: false });
        image.src = src;
    });
}

async function loadMaskedImage(src) {
    const loaded = await loadImage(src);
    if (!loaded.ok || !loaded.image) return loaded;
    const canvas = document.createElement("canvas");
    canvas.width = loaded.image.naturalWidth;
    canvas.height = loaded.image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(loaded.image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return { ...loaded, mask: { width: canvas.width, height: canvas.height, data: pixels.data } };
}

async function loadSpriteFrames() {
    const result = {};
    for (const [direction, frames] of Object.entries(SPRITE_FRAMES)) {
        const loaded = await Promise.all(frames.map((src) => loadImage(src)));
        result[direction] = loaded.map((entry, index) => entry.image || createFallbackSprite(`${direction[0]}${index + 1}`));
    }
    return result;
}

function chooseFrame(direction, frameIndex) {
    const frames = spriteFrames?.[direction];
    if (!frames || !frames.length) return null;
    return frames[frameIndex % frames.length];
}

function updateKrisSprite() {
    const direction = state.moving ? state.direction : (state.hasMoved ? (state.lastDirection || "down") : "down");
    const frame = state.moving ? chooseFrame(direction, state.frameIndex) : chooseFrame(direction, 0);
    if (frame && krisSpriteBottom.src !== frame.src) {
        krisSpriteBottom.src = frame.src;
        krisSpriteTop.src = frame.src;
    }
}

function setPlayerPositionFromWorld() {
    const x = clamp(state.player.x, state.player.width / 2, state.world.width - state.player.width / 2);
    const y = clamp(state.player.y, state.player.height, state.world.height - 18);
    state.player.x = x;
    state.player.y = y;
    krisSpriteBottom.style.left = `${x}px`;
    krisSpriteBottom.style.top = `${y}px`;
    krisSpriteTop.style.left = `${x}px`;
    krisSpriteTop.style.top = `${y}px`;
}

function setTreePosition() {
    const width = (treeSprite.naturalWidth || treeSprite.getBoundingClientRect().width / treeScale) * treeScale;
    const height = (treeSprite.naturalHeight || treeSprite.getBoundingClientRect().height / treeScale) * treeScale;
    const left = state.world.width * 0.5 - width / 2 + TREE_ORIGIN_SHIFT;
    const top = state.world.height * 0.09 + TREE_ORIGIN_SHIFT_Y;
    treeSprite.style.left = `${left}px`;
    treeSprite.style.top = `${top}px`;
    if (width && height) {
        treeSprite.style.width = `${width}px`;
        treeSprite.style.height = `${height}px`;
        treeSprite.dataset.width = String(width);
        treeSprite.dataset.height = String(height);
    }
    treeLeavesSprite.style.left = `${left}px`;
    treeLeavesSprite.style.top = `${top}px`;
    if (width && height) {
        treeLeavesSprite.style.width = `${width}px`;
        treeLeavesSprite.style.height = `${height}px`;
    }
}

function anchorBottomRect(rect, widthFactor, heightFactor) {
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const cx = rect.left + width / 2 + TreecollisionoffsetX;
    const newWidth = width * widthFactor;
    const newHeight = height * heightFactor;
    return{
        left: cx - newWidth / 2,
        right: cx + newWidth /2,
        bottom: rect.bottom + TreecollisionoffsetY,
        top: rect.bottom + TreecollisionoffsetY - newHeight
    };
}


function updateSceneLayout() {
        if (state.player.x === 0 && state.player.y === 0) {
        state.player.x = state.world.width * 0.5;
        state.player.y = state.world.height * 0.82;
    }
    const defaultFrame = spriteFrames?.down?.[0];
    state.player.width = (defaultFrame?.naturalWidth || krisSpriteBottom.naturalWidth) * SpriteScale;
    state.player.height = (defaultFrame?.naturalHeight || krisSpriteBottom.naturalHeight) * SpriteScale;
    if (state.player.width && state.player.height) {
        krisSpriteBottom.style.width = `${state.player.width}px`;
        krisSpriteBottom.style.height = `${state.player.height}px`;
        krisSpriteTop.style.width = `${state.player.width}px`;
        krisSpriteTop.style.height = `${state.player.height}px`;
}
    setTreePosition();
    setPlayerPositionFromWorld();
    renderHitboxEditor();
}

function playerHitbox() {
    return {
        left: state.player.x - state.player.width / 2,
        top: state.player.y - state.player.height,
        right: state.player.x + state.player.width / 2,
        bottom: state.player.y
    };
}

function playerCollisionHitbox() {
    const full = playerHitbox();
    const halfHeight = (full.bottom - full.top) / 2;
    return {
        left: full.left,
        top: full.top + halfHeight,
        right: full.right,
        bottom: full.bottom
    };
}


function playerUpperHitbox() {
    const full = playerHitbox();
    const halfHeight = (full.bottom - full.top) / 2;
    return {
        left: full.left,
        top: full.top,
        right: full.right,
        bottom: full.top + halfHeight
    };
}

function treeHitbox() {
    const width = parseFloat(treeSprite.dataset.width || "0") || treeSprite.getBoundingClientRect().width;
    const height = parseFloat(treeSprite.dataset.height || "0") || treeSprite.getBoundingClientRect().height;
    const left = parseFloat(treeSprite.style.left || "0");
    const top = parseFloat(treeSprite.style.top || "0");
    return {
        left,
        top,
        right: left + width,
        bottom: top + height
    };
}

function treeTrunkHitboxIntersects(rect) {
    if (!treeTrunkMask) return rectsIntersect(rect, treeHitbox());
    const treeBounds = treeHitbox();
    const overlap = {
        left: Math.max(rect.left, treeBounds.left),
        top: Math.max(rect.top, treeBounds.top),
        right: Math.min(rect.right, treeBounds.right),
        bottom: Math.min(rect.bottom, treeBounds.bottom)
    };
    if (overlap.left >= overlap.right || overlap.top >= overlap.bottom) return false;

    const scaleX = treeTrunkMask.width / (treeBounds.right - treeBounds.left || 1);
    const scaleY = treeTrunkMask.height / (treeBounds.bottom - treeBounds.top || 1);
    for (let y = Math.floor(overlap.top); y < overlap.bottom; y += 1) {
        for (let x = Math.floor(overlap.left); x < overlap.right; x += 1) {
            const maskX = Math.floor((x - treeBounds.left) * scaleX);
            const maskY = Math.floor((y - treeBounds.top) * scaleY);
            if (maskX < 0 || maskY < 0 || maskX >= treeTrunkMask.width || maskY >= treeTrunkMask.height) {
                continue;
            }
            const alphaIndex = (maskY * treeTrunkMask.width + maskX) * 4 + 3;
            if (treeTrunkMask.data[alphaIndex] > 0) {
                return true;
            }
        }
    }
    return false;
}


function expandRect(rect, factor) {
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const cx = rect.left + width / 2;
    const cy = rect.top + height / 2;
    const newWidth = width * factor;
    const newHeight = height * factor;
    return {
        left: cx - newWidth / 2,
        top: cy - newHeight / 2,
        right: cx + newWidth / 2,
        bottom: cy + newHeight / 2
    };
}

function treeCollisionHitbox(){
    const tree = treeHitbox();
    if (!treeTrunkBoundsRatio){
         return anchorBottomRect(tree, TreeCollisionWidthFactor, TreeCollisionHeightFactor);
    }
    const width = tree.right - tree.left;
    const height = tree.bottom - tree.top;
    const trunkrect = {
        left: tree.left + treeTrunkBoundsRatio.left * width,
        top: tree.top + treeTrunkBoundsRatio.top * height,
        right: tree.left + treeTrunkBoundsRatio.right * width,
        bottom: tree.top + treeTrunkBoundsRatio.bottom * height
    };
    return anchorBottomRect(trunkrect, TreeCollisionWidthFactor, TreeCollisionHeightFactor);
}

function treeInteractHitbox() {
    const tree = treeHitbox();
    const width = tree.right - tree.left;
    const height = tree.bottom - tree.top;
    const cx = tree.left + width / 2;
    const cy = tree.top + height / 2;
    const newWidth = width * TreeInteractSizeRatio;
    const newHeight = height * TreeInteractSizeRatio;
    return {
        left: cx - newWidth / 2,
        top: cy - newHeight / 2,
        right: cx + newWidth / 2,
        bottom: cy + newHeight / 2
    }
}

function rectFromHitboxEntry(box){
    return {
        left: box.x,
        top: box.y,
        right: box.x + box.width,
        bottom: box.y + box.height
    }


}

function collidesWithAnyHitbox(rect) {
    for (const box of hitboxes) {
        if (rectsIntersect(rect, rectFromHitboxEntry(box))) {
            return true;
        }
    }
    return false;
}

function beginDialogue() {
    state.dialogueActive = true;
    state.lineIndex = 0;
    state.typedChars = 0;
    state.typingComplete = false;
    state.choiceIndex = 0;
    dialogue.classList.remove("is-hidden");
    choiceRow.classList.add("is-hidden");
    setDialogueLine();
}

function setDialogueLine() {
    const entry = DIALOGUE_LINES[state.lineIndex];
    if (!entry) {
        finishDialogueAndRedirect();
        return;
    }
    state.typedChars = 0;
    state.typingComplete = false;
    if (entry.type === "choice") {
        dialogueText.textContent = "";
        choiceRow.classList.remove("is-hidden");
        state.typingComplete = true;
        renderChoice();
        return;
    }
    choiceRow.classList.add("is-hidden");
    dialogueText.textContent = "";
}

function renderChoice() {
    const selectedYes = state.choiceIndex === 0;
    choiceYes.classList.toggle("is-selected", selectedYes);
    choiceNo.classList.toggle("is-selected", !selectedYes);
}

function finishDialogueAndRedirect() {
    if (state.redirecting) return;
    state.redirecting = true;
    dialogue.classList.add("is-hidden");
    try {
        localStorage.setItem("visitedRedesign", "true");
    } catch (error) {
        // noop
    }
    try {
        sessionStorage.setItem("visitedRedesign", "true");
    } catch (error) {
        // noop
    }
    document.cookie = "visitedRedesign=true; path=/; max-age=31536000; samesite=lax";
    window.setTimeout(() => {
        window.location.href = REDIRECT_URL;
    }, 40);
}

function advanceDialogue() {
    const entry = DIALOGUE_LINES[state.lineIndex];
    if (!entry) {
        finishDialogueAndRedirect();
        return;
    }
    if (entry.type === "choice") {
        return;
    }
    state.lineIndex += 1;
    setDialogueLine();
}

function currentDialogueText() {
    const entry = DIALOGUE_LINES[state.lineIndex];
    return entry?.type === "text" ? entry.text : "";
}

function updateDialogueTyping(delta) {
    if (!state.dialogueActive) return;
    const entry = DIALOGUE_LINES[state.lineIndex];
    if (!entry || entry.type !== "text" || state.typingComplete) return;
    const text = currentDialogueText();
    const charsPerSecond = 34;
    state.typedChars += delta * (charsPerSecond / 1000);
    if (state.typedChars >= text.length) {
        state.typedChars = text.length;
        state.typingComplete = true;
    }
    dialogueText.textContent = text.slice(0, Math.floor(state.typedChars));
}

function skipTyping() {
    const entry = DIALOGUE_LINES[state.lineIndex];
    if (!entry || entry.type !== "text") return;
    state.typedChars = entry.text.length;
    state.typingComplete = true;
    dialogueText.textContent = entry.text;
}

function handleChoiceConfirm() {
    if (!state.dialogueActive) return;
    if (DIALOGUE_LINES[state.lineIndex]?.type !== "choice") return;
    if (state.choiceIndex === 0) {
        state.lineIndex += 1;
        setDialogueLine();
    } else {
        finishDialogueAndRedirect();
    }
}

function updateChoicePointerPosition() {
    const heartYes = document.getElementById("heartYes");
    const heartNo = document.getElementById("heartNo");
    const showYes = state.choiceIndex === 0;
    heartYes.src = heartImage?.src || HEART_SRC;
    heartNo.src = heartImage?.src || HEART_SRC;
    heartYes.classList.toggle("is-visible", showYes);
    heartNo.classList.toggle("is-visible", !showYes);
}

function onActionKey(event) {
    if (event.code === "KeyX") {
        if (state.dialogueActive) skipTyping();
        return;
    }
    if (event.code === "KeyZ") {
        if (!state.dialogueActive) {
            if (rectsIntersect(playerHitbox(), treeInteractHitbox())) {
                beginDialogue();
            }
            return;
        }
        const entry = DIALOGUE_LINES[state.lineIndex];
        if (entry?.type === "text" && state.typingComplete) {
            advanceDialogue();
            return;
        }
        if (entry?.type === "choice") {
            handleChoiceConfirm();
        }
    }
}

function onKeyDown(event) {
    if (event.repeat && (event.code === "KeyZ" || event.code === "KeyX")) {
        return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
        if (!state.dialogueActive) state.keys.add(event.code);
    }
    if ((event.code === "ArrowLeft" || event.code === "KeyA") && state.dialogueActive && DIALOGUE_LINES[state.lineIndex]?.type === "choice") {
        state.choiceIndex = 0;
        renderChoice();
        updateChoicePointerPosition();
    }
    if ((event.code === "ArrowRight" || event.code === "KeyD") && state.dialogueActive && DIALOGUE_LINES[state.lineIndex]?.type === "choice") {
        state.choiceIndex = 1;
        renderChoice();
        updateChoicePointerPosition();
    }
    if (event.code === "Enter" && state.dialogueActive && DIALOGUE_LINES[state.lineIndex]?.type === "choice") {
        handleChoiceConfirm();
        return;
    }
    onActionKey(event);
    unlockAudio();
}

function onKeyUp(event) {
    state.keys.delete(event.code);
}

function currentMovementVector() {
    let dx = 0;
    let dy = 0;
    if (state.keys.has("ArrowLeft") || state.keys.has("KeyA")) dx -= 1;
    if (state.keys.has("ArrowRight") || state.keys.has("KeyD")) dx += 1;
    if (state.keys.has("ArrowUp") || state.keys.has("KeyW")) dy -= 1;
    if (state.keys.has("ArrowDown") || state.keys.has("KeyS")) dy += 1;
    if (dx !== 0 && dy !== 0) {
        const factor = Math.SQRT1_2;
        dx *= factor;
        dy *= factor;
    }
    return { dx, dy };
}

function isSprinting() {
    return state.keys.has("ShiftLeft") || state.keys.has("ShiftRight");
}

function updateMovement(delta) {
    if (state.dialogueActive) {
        state.moving = false;
        return;
    }

    const { dx, dy } = currentMovementVector();
        const wantsToMove = dx !== 0 || dy !== 0;
    if (!wantsToMove) {
        state.moving = false;
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        state.direction = dx < 0 ? "left" : "right";
    } else if (dy !== 0) {
        state.direction = dy < 0 ? "up" : "down";
    }
    state.lastDirection = state.direction;
    state.hasMoved = true;

    const step = state.player.speed * (isSprinting() ? state.player.sprintMultiplier : 1) * (delta / 1000);
    const startX = state.player.x;
    const startY = state.player.y;


    const prevX = state.player.x;
    state.player.x += dx * step;
    state.player.x = clamp(state.player.x, state.player.width / 2, state.world.width - state.player.width / 2);
    if (rectsIntersect(playerCollisionHitbox(), treeCollisionHitbox()) || collidesWithAnyHitbox(playerCollisionHitbox())) {
        state.player.x = prevX;
    }

    const prevY = state.player.y;
    state.player.y += dy * step;
    state.player.y = clamp(state.player.y, state.player.height, state.world.height - 24);
    if (rectsIntersect(playerCollisionHitbox(), treeCollisionHitbox()) || collidesWithAnyHitbox(playerCollisionHitbox())) {
        state.player.y = prevY;
    }

    state.moving = state.player.x !== startX || state.player.y !== startY;
    
    if (state.moving) {
        state.frameTimer += delta;
        const frameDuration = 1000 / 7;
        if (state.frameTimer >= frameDuration) {
            state.frameTimer %= frameDuration;
            state.frameIndex = (state.frameIndex + 1) % 4;
        }
    }
}

function updateIdleFrame() {
    if (state.moving) return;
    state.frameIndex = 0;
    state.frameTimer = 0;
}

function updateAudio() {
    if (audioUnlocked) return;
    const candidateList = MUSIC_CANDIDATES.slice();
    const tryNext = () => {
        const src = candidateList.shift();
        if (!src) return;
        bgm.src = src;
        bgm.play().then(() => {
            audioUnlocked = true;
        }).catch(() => {
            if (candidateList.length) {
                tryNext();
            }
        });
    };
    tryNext();
}

function unlockAudio() {
    updateAudio();
}

class LeafEmitter {
    constructor(layer) {
        this.layer = layer;
        this.activeLeaf = null;
        this.nextSpawnAt = performance.now() + 400;
    }

    spawn(now) {
        if (this.activeLeaf) return;
        const tree = treeHitbox();
    const spawnX = tree.left + (tree.right - tree.left) * LeafSpawnOffsetX;
    const spawnY = tree.top + (tree.bottom - tree.top) * LeafSpawnOffsetY;
        const image = new Image();
        image.className = "leaf";
        image.src = leafImage?.src || LEAF_SRC;
        if (leafImage?.naturalWidth && leafImage?.naturalHeight) {
        image.width = leafImage.naturalWidth * LeafScale;   
        image.height = leafImage.naturalHeight * LeafScale; 
        }
        this.layer.appendChild(image);

        const angle = (Math.PI / 180) * (18 + Math.random() * 26);
        const speed = 34 + Math.random() * 270;
        this.activeLeaf = {
            element: image,
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.72,
            start: now,
            life: 2200 + Math.random() * 700,
            nextColorShift: now + (160 + Math.random() * 260),
            saturation: 1 - Math.random() * 0.12,
            brightness: 1,
            hue: -4 + Math.random() * 10
        };
        this.applyStyle(now);
    }

    applyStyle(now) {
        const leaf = this.activeLeaf;
        if (!leaf) return;
        const progress = clamp((now - leaf.start) / leaf.life, 0, 1);
        const opacity = 1 - progress;
        const scale = 1 - progress * 0.08;
        leaf.element.style.opacity = String(opacity);
        leaf.element.style.transform = `translate(${leaf.x}px, ${leaf.y}px) scale(${scale})`;
        leaf.element.style.filter = `saturate(${leaf.saturation}) brightness(${leaf.brightness}) hue-rotate(${leaf.hue}deg)`;
    }

    update(now, delta) {
        if (!this.activeLeaf) {
            if (now >= this.nextSpawnAt) {
                this.spawn(now);
            }
            return;
        }

        const leaf = this.activeLeaf;
        leaf.x += leaf.vx * (delta / 1000);
        leaf.y += leaf.vy * (delta / 1000);
        leaf.vx *= 0.997;
        leaf.vy *= 0.998;

        if (now >= leaf.nextColorShift) {
            leaf.nextColorShift = now + (160 + Math.random() * 280);
            const remaining = clamp((leaf.life - (now - leaf.start)) / leaf.life, 0, 1);
            leaf.saturation = clamp(0.35 + remaining * 0.85 + (Math.random() - 0.5) * 0.08, 0.18, 1.2);
            leaf.brightness = clamp(0.22 + remaining * 0.8 + (Math.random() - 0.5) * 0.06, 0.18, 1);
            leaf.hue = clamp(-8 + remaining * 6 + (Math.random() - 0.5) * 2.5, -10, 8);
        }

        this.applyStyle(now);

        if (now - leaf.start >= leaf.life) {
            leaf.element.remove();
            this.activeLeaf = null;
            this.nextSpawnAt = now + 450 + Math.random() * 450;
        }
    }
}

const emitter = new LeafEmitter(leafLayer);

async function init() {
    spriteFrames = await loadSpriteFrames();
    dialogueBoxImage = await loadImage(TEXTBOX_SRC);
    heartImage = (await loadImage(HEART_SRC)).image || createFallbackSprite("♥");
    leafImage = (await loadImage(LEAF_SRC)).image || createFallbackSprite("L");

    const trunk = await loadMaskedImage(TREE_TRUNK_SRC);
if (trunk?.mask) {
    treeTrunkMask = trunk.mask;
    treeTrunkBoundsRatio = computeMaskBoundsRatio(trunk.mask);
}

    const tree = await loadImage(TREE_SPRITE_SRC);
    if (tree.ok) {
        treeSprite.src = TREE_SPRITE_SRC;
        treeSprite.dataset.width = String(tree.image.naturalWidth || 0);
        treeSprite.dataset.height = String(tree.image.naturalHeight || 0);
        treeSprite.style.width = `${tree.image.naturalWidth}px`;
        treeSprite.style.height = `${tree.image.naturalHeight}px`;
    }

    const treeleaves = await loadImage(TREE_LEAVES_SRC);
    if (treeleaves.ok) {
        treeLeavesSprite.src = TREE_LEAVES_SRC;
    }

    if (spriteFrames.down[0]) {
        krisSpriteBottom.style.width = `${state.player.width}px`;
        krisSpriteBottom.style.height = `${state.player.height}px`;
        krisSpriteTop.style.width = `${state.player.width}px`;
        krisSpriteTop.style.height = `${state.player.height}px`;
    }
    //choicePointer.src = heartImage.src || HEART_SRC;

    if (dialogueBoxImage?.image?.naturalWidth && dialogueBoxImage?.image?.naturalHeight) {
        dialogue.style.width = `${dialogueBoxImage.image.naturalWidth}px`;
        dialogue.style.height = `${dialogueBoxImage.image.naturalHeight}px`;
    }

    const sceneBackground = document.querySelector(".scene__background");
    console.log("found background element: ", sceneBackground);

    const bgImage = await loadImage(`${ASSET_BASE}/Tree/sitebackground/sitebackground.png`);
    console.log("bg load result:", bgImage.ok, bgImage.image?.naturalWidth, bgImage.image?.naturalHeight);

    if (bgImage.ok && bgImage.image) { 
            const bgNaturalWidth = bgImage.image.naturalWidth;
            const bgNaturalHeight = bgImage.image.naturalHeight;
    
            const coverScale = Math.max(
        state.world.width / bgNaturalWidth,
        state.world.height / bgNaturalHeight
        );
    

    const scaledWidth = bgNaturalWidth * coverScale;
    const scaledHeight = bgNaturalHeight * coverScale;      
    
    const centeredLeft = (state.world.width - scaledWidth) / 2;
    const centeredTop = (state.world.height - scaledHeight) / 2;

    sceneBackground.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
    sceneBackground.style.backgroundPosition = `${centeredLeft}px ${centeredTop}px`;
    console.log("computed cover:", scaledWidth, scaledHeight, centeredLeft, centeredTop);
    }


    debugLayer = document.createElement("div");
    debugLayer.id = "debugHitboxLayer";
    debugLayer.style.position = "absolute";
    debugLayer.style.inset = "0";
    debugLayer.style.pointerEvents = "none";
    debugLayer.style.zIndex = "50";
    scene.appendChild(debugLayer);
    updateSceneLayout();
    updateChoicePointerPosition();
    loadHitboxes();
    wireHitboxEditor();

    window.addEventListener("resize", updateSceneLayout);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("focus", unlockAudio);

    unlockAudio();
    animationFrame = requestAnimationFrame(loop);
}

function loop(now) {
    try {
    const delta = now - state.now;
    state.now = now;

    updateMovement(delta);

    if (state.moving) {
        state.idleTimer = 0;
    } else {
        state.idleTimer += delta;
        if (state.idleTimer >= IDLE_RESET_DELAY) {
            updateIdleFrame();
        }
    }

    updateKrisSprite();
    setPlayerPositionFromWorld();
    updateDialogueTyping(delta);
    if (!choiceRow.classList.contains("is-hidden")) {
        updateChoicePointerPosition();
    }
    emitter.update(now, delta);
    updateHitboxDraft();
    renderDebugHitboxes();
    } catch (error) {
        console.error("loop error", error);
    }
    animationFrame = requestAnimationFrame(loop);
}

choiceYes.addEventListener("click", () => {
    if (!state.dialogueActive || DIALOGUE_LINES[state.lineIndex]?.type !== "choice") return;
    state.choiceIndex = 0;
    renderChoice();
    updateChoicePointerPosition();
    handleChoiceConfirm();
});

choiceNo.addEventListener("click", () => {
    if (!state.dialogueActive || DIALOGUE_LINES[state.lineIndex]?.type !== "choice") return;
    state.choiceIndex = 1;
    renderChoice();
    updateChoicePointerPosition();
    handleChoiceConfirm();
});

window.addEventListener("blur", () => {
    state.keys.clear();
});

function loadHitboxes() {
    try {
        const raw = localStorage.getItem(HITBOX_STORAGE_KEY);
        hitboxes = raw ? normalizeHitboxes(JSON.parse(raw)) : normalizeHitboxes(DEFAULT_MAP_HITBOXES);
    } catch (error) {
        hitboxes = normalizeHitboxes(DEFAULT_MAP_HITBOXES);
    }
    renderHitboxEditor();
}

function saveHitboxes() {
    try {
        localStorage.setItem(HITBOX_STORAGE_KEY, JSON.stringify(hitboxes));
    } catch (error) {
        // noop
    }
    renderHitboxEditor();
}

function normalizeHitboxes(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => {
            const x = Number(entry?.x);
            const y = Number(entry?.y);
            const width = Number(entry?.width ?? entry?.size ?? entry?.w);
            const height = Number(entry?.height ?? entry?.size ?? entry?.h);
            if (![x, y, width, height].every(Number.isFinite)) return null;
            return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
        })
        .filter(Boolean);
}

function serializeHitboxes() {
    return JSON.stringify(hitboxes, null, 2);
}

function renderHitboxEditor() {
    if (!hitboxLayer || !hitboxOutput) return;
    hitboxLayer.innerHTML = "";
    for (const box of hitboxes) {
        const rect = document.createElement("div");
        rect.className = "hitbox-rect";
        rect.style.left = `${box.x}px`;
        rect.style.top = `${box.y}px`;
        rect.style.width = `${box.width}px`;
        rect.style.height = `${box.height}px`;
        hitboxLayer.appendChild(rect);
    }
    if (hitboxDraft) {
        const rect = document.createElement("div");
        rect.className = "hitbox-rect is-drafting";
        rect.style.left = `${hitboxDraft.x}px`;
        rect.style.top = `${hitboxDraft.y}px`;
        rect.style.width = `${hitboxDraft.width}px`;
        rect.style.height = `${hitboxDraft.height}px`;
        hitboxLayer.appendChild(rect);
    }
    hitboxOutput.value = serializeHitboxes();
}

function setEditorVisible(isVisible) {
    hitboxEditorEnabled = isVisible;
    hitboxEditor?.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
        renderHitboxEditor();
    }
}

function toggleEditor() {
    setEditorVisible(!hitboxEditorEnabled);
}

function clearHitboxes() {
    hitboxes = [];
    hitboxDraft = null;
    saveHitboxes();
}

function copyHitboxes() {
    const payload = serializeHitboxes();
    hitboxOutput.value = payload;
    hitboxOutput.focus();
    hitboxOutput.select();
    navigator.clipboard?.writeText(payload).catch(() => {});
}

function scenePointFromEvent(event) {
    const rect = hitboxLayer.getBoundingClientRect();
    return {
        x: clamp(event.clientX - rect.left, 0, rect.width),
        y: clamp(event.clientY - rect.top, 0, rect.height)
    };
}

function beginDraft(event) {
    if (!hitboxEditorEnabled || !hitboxLayer) return;
    const point = scenePointFromEvent(event);
    hitboxDraft = { x: point.x, y: point.y, width: 1, height: 1 };
    renderHitboxEditor();
}

function updateHitboxDraft(event) {
    if (!hitboxDraft || !event) return;
    const point = scenePointFromEvent(event);
    const width = Math.max(Math.abs(point.x - hitboxDraft.x), 1);
    const height = Math.max(Math.abs(point.y - hitboxDraft.y), 1);
    const finalX = point.x < hitboxDraft.x ? hitboxDraft.x - width : hitboxDraft.x;
    const finalY = point.y < hitboxDraft.y ? hitboxDraft.y - height : hitboxDraft.y;
    hitboxDraft = { x: finalX, y: finalY, width, height };
    renderHitboxEditor();
}

function finalizeDraft() {
    if (!hitboxDraft) return;
    hitboxes.push({
        x: Math.round(hitboxDraft.x),
        y: Math.round(hitboxDraft.y),
        width: Math.round(hitboxDraft.width),
        height: Math.round(hitboxDraft.height)
    });
    hitboxDraft = null;
    saveHitboxes();
}



function wireHitboxEditor() {
    hitboxModeToggle?.addEventListener("click", toggleEditor);
    hitboxClear?.addEventListener("click", clearHitboxes);
    hitboxCopy?.addEventListener("click", copyHitboxes);
    hitboxLayer?.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        beginDraft(event);
    });
    window.addEventListener("pointermove", (event) => {
        updateHitboxDraft(event);
    });
    window.addEventListener("pointerup", () => {
        if (hitboxDraft) finalizeDraft();
    });
    window.addEventListener("keydown", (event) => {
        if (event.code === "KeyH") {
            toggleEditor();
        }
    });
}



function renderDebugHitboxes() {
    if (!DEBUG_HITBOXES) return;
    debugLayer.innerHTML = "";

    const boxes = [
        { rect: treeInteractHitbox(), color: "rgba(0,255,0,0.25)", border: "#0f0", label: "interact" },
        { rect: treeCollisionHitbox(), color: "rgba(255,230,0,0.35)", border: "#ff0", label: "block" },
        { rect: playerCollisionHitbox(), color: "rgba(0,150,255,0.25)", border: "#09f", label: "player-bottom" },
        { rect: playerUpperHitbox(), color: "rgba(160,0,255,0.25)", border: "#09f", label: "player-top" }
    ];

    for (const box of hitboxes) {
        boxes.push({ rect: rectFromHitboxEntry(box), color: "rgba(88, 0, 204, 0.25)", border: "#f00", label: "map" });
    }

    for (const { rect, color, border } of boxes) {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = `${rect.left}px`;
        div.style.top = `${rect.top}px`;
        div.style.width = `${rect.right - rect.left}px`;
        div.style.height = `${rect.bottom - rect.top}px`;
        div.style.background = color;
        div.style.border = `1px solid ${border}`;
        div.style.boxSizing = "border-box";
        debugLayer.appendChild(div);
    }
}

init().catch((error) => {
    console.error("question_mark init failed", error);
});