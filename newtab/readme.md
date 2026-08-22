# UNDERTAB

A minimal, UNDERTALE-inspired new tab dashboard built with vanilla HTML, CSS, and JavaScript.

UNDERTAB combines a search bar, customizable shortcuts, a to-do list, calendar, journal, seasonal backgrounds, seasonal particles, and a small music player into one page.

## Features

* Search with Google, DuckDuckGo, or Startpage
* Customizable website shortcuts
* Persistent to-do list
* Monthly calendar
* Persistent journal
* Seasonal visual effects
* Seasonal background borders
* Seasonal music player
* Live clock and date
* Animated pixel-art heart
* LocalStorage-based settings and data
* Responsive layout for desktop and mobile
* No framework or build system required

## Project structure

```text
newtab/
├── index.html
├── styles.css
├── app.js
└── assets/
    ├── borders-backgrounds/
    │   ├── simple.png
    │   ├── ruins.png
    │   ├── snowdin.png
    │   ├── waterfall.png
    │   ├── hotland.png
    │   ├── castle.png
    │   └── dog.png
    │
    ├── heart/
    │   └── red-heart.png
    │
    ├── season-particles/
    │   ├── sun.png
    │   ├── winter/
    │   │   ├── snowflake1.png
    │   │   └── snowflake2.png
    │   ├── spring/
    │   │   └── spring_leaf.png
    │   └── fall/
    │       ├── leafred.png
    │       ├── leaforange.png
    │       └── leafyelllow.png
    │
    └── songs/
        ├── Uwa!! So Holiday.mp3
        ├── Uwa!! So Temperate.mp3
        └── Uwa!! So HEATS!!.mp3
```

Make sure the filenames and folder names match the paths referenced in `app.js` exactly.

## Running locally

`UNDERTAB` is a static website, so there is no Node.js installation, package manager, or build step required.

The simplest option is to open `index.html` directly in your browser.

For more reliable local development, use a small HTTP server instead.

### VS Code

Install the Live Server extension, open the project folder, then open `index.html` with Live Server.

### Python

From the project directory:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Node.js

You can also use any static server you prefer. For example:

```bash
npx serve .
```

## Deployment

Because the project is completely static, it can be deployed to services such as Netlify, Vercel, GitHub Pages, or Cloudflare Pages.

No build command is required.

For a typical static deployment:

```text
Build command: none
Publish directory: .
```

## Configuration

Most of the configurable parts are near the top of `app.js`.

Search engines are defined in:

```javascript
var ENGINES = [
  ...
];
```

Borders are defined in:

```javascript
var BORDERS = [
  ...
];
```

Seasonal particle assets are defined in:

```javascript
var SEASON_SOURCES = {
  ...
};
```

Seasonal music is defined in:

```javascript
var SEASON_AUDIO = {
  ...
};
```

To add another border, add an entry to `BORDERS` and place the corresponding image inside `assets/borders-backgrounds/`.

To change a seasonal song, replace the corresponding file or update its path in `SEASON_AUDIO`.

## Data storage

UNDERTAB does not require a database or backend.

User data is stored locally in the browser using `localStorage`.

The following data is persisted:

```text
pulse:engine
pulse:shortcuts
pulse:border
pulse:todos
pulse:journal
```

Clearing the site's browser storage will reset the shortcuts, selected border, tasks, journal, and search engine settings.

## Seasonal system

The page automatically determines the current season from the user's system date.

```text
December – February → Winter
March – May        → Spring
June – August      → Summer
September – November → Fall
```

Winter, spring, and fall use particle effects. Summer uses the animated sun instead.

The same season selection controls the music player.

## Music player

The music player is intentionally user-controlled. Browsers generally prevent websites from automatically starting audio without user interaction.

Clicking `Play music` initializes the audio system and starts the currently selected seasonal track.

The player displays:

* Track title
* Artist
* Current season
* Playback state
* Animated audio bars

## Shortcuts

Shortcuts can be added using the `+` tile.

Each shortcut stores:

```javascript
{
  name: "Example",
  url: "https://example.com"
}
```

URLs without a protocol are automatically prefixed with `https://`.

## Browser compatibility

UNDERTAB uses standard browser APIs including:

* `localStorage`
* `URL`
* `Canvas`
* `Audio`
* `requestAnimationFrame`
* `matchMedia`

A modern Chromium-, Firefox-, or Safari-based browser should work normally.

## License

This repository contains original HTML, CSS, and JavaScript code.

Any third-party artwork, music, fonts, or other assets remain subject to their respective licenses and copyright holders.

The project currently uses JetBrains Mono from Google Fonts.

## Credits

Built with vanilla HTML, CSS, and JavaScript.

Inspired by UNDERTALE UI and classic RPG aesthetics.
