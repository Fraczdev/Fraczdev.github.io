"use strict";

var ENGINES = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q="
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q="
  },
  {
    id: "startpage",
    name: "Startpage",
    url: "https://www.startpage.com/sp/search?query="
  }
];

var STORE_ENGINE = "pulse:engine";
var STORE_SHORTCUTS = "pulse:shortcuts";
var STORE_BORDER = "pulse:border";
var STORE_TODOS = "pulse:todos";
var STORE_JOURNAL = "pulse:journal";

var engineTabs = document.getElementById("engineTabs");
var searchForm = document.getElementById("searchForm");
var searchInput = document.getElementById("searchInput");

var activeEngineId =
  localStorage.getItem(STORE_ENGINE) || ENGINES[0].id;

function renderEngineTabs() {
  engineTabs.innerHTML = "";

  ENGINES.forEach(function(engine) {
    var btn = document.createElement("button");

    btn.type = "button";
    btn.className =
      "engine-tab" +
      (engine.id === activeEngineId ? " is-active" : "");

    btn.textContent = engine.name;

    btn.setAttribute(
      "aria-pressed",
      String(engine.id === activeEngineId)
    );

    btn.addEventListener("click", function() {
      activeEngineId = engine.id;

      localStorage.setItem(
        STORE_ENGINE,
        activeEngineId
      );

      renderEngineTabs();
      searchInput.focus();
    });

    engineTabs.appendChild(btn);
  });
}

renderEngineTabs();

searchForm.addEventListener("submit", function(e) {
  e.preventDefault();

  var q = searchInput.value.trim();

  if (!q) return;

  var engine =
    ENGINES.find(function(en) {
      return en.id === activeEngineId;
    }) || ENGINES[0];

  window.location.href =
    engine.url + encodeURIComponent(q);
});

var clockTime = document.getElementById("clockTime");
var clockDate = document.getElementById("clockDate");

function updateClock() {
  var now = new Date();

  var hh = String(now.getHours()).padStart(2, "0");
  var mm = String(now.getMinutes()).padStart(2, "0");
  var ss = String(now.getSeconds()).padStart(2, "0");

  clockTime.textContent =
    hh + ":" + mm + ":" + ss;

  clockDate.textContent =
    now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
}

updateClock();
setInterval(updateClock, 1000);

var heartWrap = document.getElementById("heartWrap");
var heartImg = document.getElementById("heart");

heartImg.addEventListener(
  "error",
  function() {
    heartImg.removeAttribute("src");
    heartImg.classList.add("is-fallback");

    heartImg.outerHTML =
      '<span class="heart is-fallback" id="heart">&#9829;</span>';
  },
  { once: true }
);

heartWrap.addEventListener("click", function() {
  window.location.href =
    "https://solxmn.me/question_mark";
});

var shortcutsEl =
  document.getElementById("shortcuts");

var modal =
  document.getElementById("shortcutModal");

var scName =
  document.getElementById("scName");

var scUrl =
  document.getElementById("scUrl");

function loadShortcuts() {
  try {
    var raw =
      localStorage.getItem(STORE_SHORTCUTS);

    if (!raw) return null;

    var parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : null;

  } catch(e) {
    return null;
  }
}

function saveShortcuts(list) {
  localStorage.setItem(
    STORE_SHORTCUTS,
    JSON.stringify(list)
  );
}

var shortcuts = loadShortcuts();

if (shortcuts === null) {
  shortcuts = [
    {
      name: "GitHub",
      url: "https://github.com"
    },
    {
      name: "YouTube",
      url: "https://youtube.com"
    },
    {
      name: "Slack",
      url: "https://app.slack.com"
    },
    {
      name: "Discord",
      url: "https://discord.com/app"
    },
    {
      name: "Reddit",
      url: "https://reddit.com"
    },
    {
      name: "Spotify",
      url: "https://open.spotify.com"
    },
    {
      name: "Twitch",
      url: "https://twitch.tv"
    },
    {
      name: "Gmail",
      url: "https://mail.google.com"
    }
  ];

  saveShortcuts(shortcuts);
}

function faviconFor(url) {
  try {
    var host =
      new URL(url).hostname;

    return (
      "https://www.google.com/s2/favicons?sz=64&domain=" +
      host
    );

  } catch(e) {
    return "";
  }
}

function renderShortcuts() {
  shortcutsEl.innerHTML = "";

  shortcuts.forEach(function(sc, idx) {
    var a = document.createElement("a");

    a.className = "shortcut-tile";
    a.href = sc.url;
    a.title = sc.url;

    var img =
      document.createElement("img");

    img.className =
      "shortcut-favicon";

    img.src =
      faviconFor(sc.url);

    img.alt = "";

    img.onerror = function() {
      img.style.display = "none";
    };

    var label =
      document.createElement("span");

    label.className =
      "shortcut-name";

    label.textContent =
      sc.name;

    var remove =
      document.createElement("button");

    remove.type = "button";
    remove.className =
      "shortcut-remove";

    remove.textContent = "\u2715";
    remove.title = "remove";

    remove.addEventListener(
      "click",
      function(e) {
        e.preventDefault();
        e.stopPropagation();

        shortcuts.splice(idx, 1);

        saveShortcuts(shortcuts);
        renderShortcuts();
      }
    );

    a.appendChild(img);
    a.appendChild(label);
    a.appendChild(remove);

    shortcutsEl.appendChild(a);
  });

  var addTile =
    document.createElement("button");

  addTile.type = "button";
  addTile.className =
    "shortcut-tile add-tile";

  addTile.textContent = "+";
  addTile.title = "add shortcut";

  addTile.addEventListener(
    "click",
    openModal
  );

  shortcutsEl.appendChild(addTile);
}

renderShortcuts();

function openModal() {
  scName.value = "";
  scUrl.value = "";

  modal.classList.add("is-visible");

  scName.focus();
}

function closeModal() {
  modal.classList.remove(
    "is-visible"
  );
}

document
  .getElementById("scCancel")
  .addEventListener(
    "click",
    closeModal
  );

document
  .getElementById("scSave")
  .addEventListener(
    "click",
    function() {
      var name =
        scName.value.trim();

      var url =
        scUrl.value.trim();

      if (!name || !url) return;

      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      shortcuts.push({
        name: name,
        url: url
      });

      saveShortcuts(shortcuts);
      renderShortcuts();
      closeModal();
    }
  );

modal.addEventListener(
  "click",
  function(e) {
    if (e.target === modal) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  function(e) {
    if (
      e.key === "Escape" &&
      modal.classList.contains("is-visible")
    ) {
      closeModal();
    }
  }
);

var todoInput =
  document.getElementById("todoInput");

var todoAdd =
  document.getElementById("todoAdd");

var todoList =
  document.getElementById("todoList");

var todoCount =
  document.getElementById("todoCount");

function loadTodos() {
  try {
    var raw =
      localStorage.getItem(STORE_TODOS);

    if (!raw) return [];

    var parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch(e) {
    return [];
  }
}

var todos = loadTodos();

function saveTodos() {
  localStorage.setItem(
    STORE_TODOS,
    JSON.stringify(todos)
  );
}

function renderTodos() {
  todoList.innerHTML = "";

  var remaining = 0;

  todos.forEach(function(todo, index) {
    if (!todo.done) {
      remaining++;
    }

    var item =
      document.createElement("div");

    item.className =
      "todo-item" +
      (todo.done ? " completed" : "");

    var checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = todo.done;

    checkbox.addEventListener(
      "change",
      function() {
        todo.done = checkbox.checked;

        saveTodos();
        renderTodos();
      }
    );

    var text =
      document.createElement("span");

    text.className =
      "todo-text";

    text.textContent =
      todo.text;

    var remove =
      document.createElement("button");

    remove.type = "button";
    remove.className =
      "todo-remove";

    remove.textContent = "\u2715";

    remove.addEventListener(
      "click",
      function() {
        todos.splice(index, 1);

        saveTodos();
        renderTodos();
      }
    );

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(remove);

    todoList.appendChild(item);
  });

  todoCount.textContent =
    String(remaining);
}

function addTodo() {
  var text =
    todoInput.value.trim();

  if (!text) return;

  todos.push({
    text: text,
    done: false
  });

  saveTodos();
  renderTodos();

  todoInput.value = "";
  todoInput.focus();
}

todoAdd.addEventListener(
  "click",
  addTodo
);

todoInput.addEventListener(
  "keydown",
  function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  }
);

renderTodos();

var calendarGrid =
  document.getElementById("calendarGrid");

var calendarTitle =
  document.getElementById("calendarTitle");

var calendarPrev =
  document.getElementById("calendarPrev");

var calendarNext =
  document.getElementById("calendarNext");

var calendarDate = new Date();

function renderCalendar() {
  var year =
    calendarDate.getFullYear();

  var month =
    calendarDate.getMonth();

  var monthName =
    calendarDate.toLocaleDateString(
      undefined,
      {
        month: "long"
      }
    );

  calendarTitle.textContent =
    monthName.toUpperCase() +
    " " +
    year;

  calendarGrid.innerHTML = "";

  var firstDay =
    new Date(year, month, 1)
      .getDay();

  var daysInMonth =
    new Date(year, month + 1, 0)
      .getDate();

  var offset =
    (firstDay + 6) % 7;

  for (var i = 0; i < offset; i++) {
    var empty =
      document.createElement("div");

    empty.className =
      "calendar-day empty";

    calendarGrid.appendChild(empty);
  }

  var today = new Date();

  for (
    var day = 1;
    day <= daysInMonth;
    day++
  ) {
    var cell =
      document.createElement("button");

    cell.type = "button";
    cell.className =
      "calendar-day";

    cell.textContent =
      String(day);

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add("today");
    }

    calendarGrid.appendChild(cell);
  }
}

calendarPrev.addEventListener(
  "click",
  function() {
    calendarDate.setMonth(
      calendarDate.getMonth() - 1
    );

    renderCalendar();
  }
);

calendarNext.addEventListener(
  "click",
  function() {
    calendarDate.setMonth(
      calendarDate.getMonth() + 1
    );

    renderCalendar();
  }
);

renderCalendar();

var journalInput =
  document.getElementById("journalInput");

var journalStatus =
  document.getElementById("journalStatus");

var journalCharacters =
  document.getElementById("journalCharacters");

var journalDate =
  document.getElementById("journalDate");

journalInput.value =
  localStorage.getItem(STORE_JOURNAL) || "";

function updateJournal() {
  var value =
    journalInput.value;

  localStorage.setItem(
    STORE_JOURNAL,
    value
  );

  journalCharacters.textContent =
    value.length + " / 5000";

  journalStatus.textContent =
    "SAVED";

  journalDate.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric"
      }
    );
}

journalInput.addEventListener(
  "input",
  updateJournal
);

updateJournal();

var BORDERS = [
  {
    name: "Simple",
    file: "redesign/assets/borders-backgrounds/simple.png"
  },
  {
    name: "Ruins",
    file: "redesign/assets/borders-backgrounds/ruins.png"
  },
  {
    name: "Snowdin",
    file: "redesign/assets/borders-backgrounds/snowdin.png"
  },
  {
    name: "Waterfall",
    file: "redesign/assets/borders-backgrounds/waterfall.png"
  },
  {
    name: "Hotland",
    file: "redesign/assets/borders-backgrounds/hotland.png"
  },
  {
    name: "CORE Castle",
    file: "redesign/assets/borders-backgrounds/castle.png"
  },
  {
    name: "Dog Shrine",
    file: "redesign/assets/borders-backgrounds/dog.png"
  }
];

var backdrop =
  document.getElementById("backdrop");

var borderBtn =
  document.getElementById("borderToggle");

var borderNameEl =
  document.getElementById("borderName");

var borderIndex =
  parseInt(
    localStorage.getItem(STORE_BORDER) || "0",
    10
  );

if (
  isNaN(borderIndex) ||
  borderIndex < 0 ||
  borderIndex >= BORDERS.length
) {
  borderIndex = 0;
}

function applyBorder() {
  var border =
    BORDERS[borderIndex];

  backdrop.style.backgroundImage =
    "url(" + border.file + ")";

  borderNameEl.textContent =
    border.name;
}

applyBorder();

borderBtn.addEventListener(
  "click",
  function() {
    borderIndex =
      (borderIndex + 1) %
      BORDERS.length;

    localStorage.setItem(
      STORE_BORDER,
      String(borderIndex)
    );

    applyBorder();
  }
);

var canvas =
  document.getElementById("particles");

var ctx =
  canvas.getContext("2d");

var summerSun =
  document.getElementById("summerSun");

var reduceMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

function detectSeason(date) {
  date = date || new Date();

  var m =
    date.getMonth();

  if (m === 11 || m <= 1) {
    return "winter";
  }

  if (m >= 2 && m <= 4) {
    return "spring";
  }

  if (m >= 5 && m <= 7) {
    return "summer";
  }

  return "fall";
}

var SEASON_SOURCES = {
  winter: [
    "redesign/assets/season-particles/winter/snowflake1.png",
    "redesign/assets/season-particles/winter/snowflake2.png"
  ],

  spring: [
    "redesign/assets/season-particles/spring/spring_leaf.png"
  ],

  fall: [
    "redesign/assets/season-particles/fall/leafred.png",
    "redesign/assets/season-particles/fall/leaforange.png",
    "redesign/assets/season-particles/fall/leafyellow.png"
  ]
};

var SEASON_AUDIO = {
  winter: {
    file: "./redesign/assets/songs/Uwa!!So Holiday.mp3",
    title: "Winter OST",
    artist: "Seasonal soundtrack",
    label: "WINTER"
  },

  spring: {
    file: "./redesign/assets/songs/Uwa!!So Temperate.mp3",
    title: "Spring OST",
    artist: "Seasonal soundtrack",
    label: "SPRING"
  },

  summer: {
    file: "./redesign/assets/songs/Uwa!!So HEATS!!.mp3",
    title: "Summer OST",
    artist: "Seasonal soundtrack",
    label: "SUMMER"
  },

  fall: {
    file: "./redesign/assets/songs/Uwa!!So Temperate.mp3",
    title: "Fall OST",
    artist: "Seasonal soundtrack",
    label: "FALL"
  }
};

var season =
  detectSeason();

var particles = [];
var textures = [];

var MAX_PARTICLES = 40;

function resizeCanvas() {
  canvas.width =
    window.innerWidth;

  canvas.height =
    window.innerHeight;
}

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

function loadImage(src) {
  return new Promise(
    function(resolve, reject) {
      var img =
        new Image();

      img.onload =
        function() {
          resolve(img);
        };

      img.onerror =
        reject;

      img.src = src;
    }
  );
}

function loadSeasonTextures(
  seasonName
) {
  var sources =
    SEASON_SOURCES[seasonName] || [];

  return Promise.all(
    sources.map(
      function(src) {
        return loadImage(src)
          .catch(function() {
            return null;
          });
      }
    )
  ).then(
    function(loaded) {
      return loaded.filter(Boolean);
    }
  );
}

function makeParticle() {
  var texture =
    textures[
      Math.floor(
        Math.random() *
        textures.length
      )
    ];

  return {
    x: Math.random() * canvas.width,

    y:
      -20 -
      Math.random() *
      canvas.height *
      .3,

    size:
      18 +
      Math.random() * 18,

    texture: texture,

    speedY:
      .22 +
      Math.random() * .45,

    speedX:
      -.4 +
      Math.random() * .8,

    rotation:
      Math.random() *
      Math.PI *
      2,

    rotSpeed:
      -.008 +
      Math.random() * .016,

    opacity:
      .35 +
      Math.random() * .45
  };
}

function initParticles() {
  particles = [];

  if (!textures.length) return;

  for (
    var i = 0;
    i < MAX_PARTICLES;
    i++
  ) {
    particles.push(
      makeParticle()
    );
  }
}

var seasonalAudio =
  document.getElementById("seasonalAudio");

var audioToggle =
  document.getElementById("audioToggle");

var nowPlayingCard =
  document.getElementById("nowPlayingCard");

var nowPlayingTitle =
  document.getElementById("nowPlayingTitle");

var nowPlayingArtist =
  document.getElementById("nowPlayingArtist");

var nowPlayingSeason =
  document.getElementById("nowPlayingSeason");

var audioGainNode = null;
var audioContext = null;

function ensureAudioGainRouting() {
  try {
    if (audioContext && audioGainNode) {
      return audioContext;
    }

    var AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    audioContext =
      new AudioContext();

    var source =
      audioContext.createMediaElementSource(
        seasonalAudio
      );

    audioGainNode =
      audioContext.createGain();

    audioGainNode.gain.value = 1;

    source.connect(audioGainNode);
    audioGainNode.connect(
      audioContext.destination
    );

    return audioContext;

  } catch(e) {
    return audioContext;
  }
}

function setNowPlayingActiveState(active) {
  nowPlayingCard.classList.toggle(
    "is-active",
    active
  );

  nowPlayingCard.classList.toggle(
    "is-idle",
    !active
  );
}

function configureSeasonalAudio(
  seasonName
) {
  var config =
    SEASON_AUDIO[seasonName];

  if (!config) {
    seasonalAudio.removeAttribute("src");

    nowPlayingTitle.textContent =
      "Seasonal OST unavailable";

    nowPlayingArtist.textContent =
      "No soundtrack is configured.";

    nowPlayingSeason.textContent =
      String(seasonName).toUpperCase();

    updateAudioToggle();

    return;
  }

  seasonalAudio.pause();

  seasonalAudio.src =
    config.file;

  seasonalAudio.load();

  nowPlayingTitle.textContent =
    config.title;

  nowPlayingArtist.textContent =
    config.artist;

  nowPlayingSeason.textContent =
    config.label;

  setNowPlayingActiveState(false);

  updateAudioToggle();
}

function updateAudioToggle() {
  if (
    !audioToggle ||
    !seasonalAudio
  ) {
    return;
  }

  var hasSource =
    Boolean(seasonalAudio.src);

  if (!hasSource) {
    audioToggle.disabled = true;
    audioToggle.textContent = "Play music";
    audioToggle.setAttribute(
      "aria-pressed",
      "false"
    );

    audioToggle.classList.remove(
      "is-active"
    );

    setNowPlayingActiveState(false);

    return;
  }

  var playing =
    !seasonalAudio.paused;

  audioToggle.disabled = false;

  audioToggle.textContent =
    playing
      ? "Pause music"
      : "Play music";

  audioToggle.setAttribute(
    "aria-pressed",
    playing ? "true" : "false"
  );

  audioToggle.classList.toggle(
    "is-active",
    playing
  );

  setNowPlayingActiveState(
    playing
  );
}

seasonalAudio.addEventListener(
  "error",
  function() {
    audioToggle.disabled = true;
    audioToggle.textContent = "Play music";

    audioToggle.setAttribute(
      "aria-pressed",
      "false"
    );

    audioToggle.classList.remove(
      "is-active"
    );

    setNowPlayingActiveState(false);

    nowPlayingTitle.textContent =
      "Seasonal OST unavailable";

    nowPlayingArtist.textContent =
      "The audio file could not be loaded.";
  }
);

audioToggle.addEventListener(
  "click",
  function() {
    if (!seasonalAudio.src) return;

    var audioContext =
      ensureAudioGainRouting();

    if (seasonalAudio.paused) {
      if (audioContext) {
        audioContext
          .resume()
          .catch(function() {});
      }

      seasonalAudio
        .play()
        .then(function() {
          updateAudioToggle();
        })
        .catch(function() {
          updateAudioToggle();
        });

    } else {
      seasonalAudio.pause();
      updateAudioToggle();
    }
  }
);

seasonalAudio.addEventListener(
  "play",
  function() {
    updateAudioToggle();
  }
);

seasonalAudio.addEventListener(
  "pause",
  function() {
    updateAudioToggle();
  }
);

seasonalAudio.addEventListener(
  "ended",
  function() {
    updateAudioToggle();
  }
);

function setupSeason(
  seasonName
) {
  season =
    seasonName;

  if (
    seasonName === "summer"
  ) {
    summerSun.classList.add(
      "is-active"
    );

    particles = [];
    textures = [];

  } else {
    summerSun.classList.remove(
      "is-active"
    );

    loadSeasonTextures(
      seasonName
    ).then(
      function(loaded) {
        textures = loaded;
        initParticles();
      }
    );
  }

  configureSeasonalAudio(
    seasonName
  );

  updateAudioToggle();
}

setupSeason(season);

function tick() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (
    !reduceMotion.matches &&
    season !== "summer"
  ) {
    particles.forEach(
      function(p) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (
          p.y - p.size >
          canvas.height
        ) {
          Object.assign(
            p,
            makeParticle(),
            { y: -20 }
          );
        }

        ctx.save();

        ctx.globalAlpha =
          p.opacity;

        ctx.translate(
          p.x,
          p.y
        );

        ctx.rotate(
          p.rotation
        );

        var half =
          p.size / 2;

        ctx.drawImage(
          p.texture,
          -half,
          -half,
          p.size,
          p.size
        );

        ctx.restore();
      }
    );
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);