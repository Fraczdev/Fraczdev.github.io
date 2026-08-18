# solxmn.me

My personal website and portfolio, available at https://solxmn.me.

The project started as a simple personal website and gradually evolved into a more experimental and interactive portfolio. Alongside the main portfolio content, I use the site to experiment with visual design, animations, audio, seasonal effects, and small hidden interactions.

## Tech Stack

The site is built primarily with vanilla web technologies:

* HTML5
* CSS3
* JavaScript
* Canvas API
* HTML5 Audio / Web Audio API
* Local Storage, Session Storage, and cookies for small pieces of client-side state

The redesign does not use a frontend framework such as React or Vue. Its interactive functionality is implemented directly in JavaScript.

I also used Photoshop to design the overall layout of the redesign before implementing it.

## Features

The current redesign includes:

* About, Projects, and Contact sections
* Custom responsive scaling for the main interface
* Keyboard-accessible section navigation
* Seasonal visual effects and particle animations
* Seasonal music
* A custom music player
* An Italy-based live clock
* Multiple selectable visual border themes
* Various Easter eggs and small interactive details
* Reduced-motion handling through `prefers-reduced-motion`

The site also contains an additional unfinished Easter egg scene that is not currently part of the deployed version.

## Running Locally

This is a static website and does not require a backend or package installation.

Clone the repository:

```bash
git clone https://github.com/Fraczdev/Fraczdev.github.io.git
cd Fraczdev.github.io
```

Then serve the repository using a local HTTP server. For example:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

Using a local HTTP server is recommended over opening the HTML files directly, since the site loads local assets and JavaScript modules.

## Website Sections

The main redesign currently contains three primary sections:

### About

Contains information about me, my skills, languages, hobbies, and inspirations.

The About section also contains the site's more personal material, including a section describing how Toby Fox and Temmie Chang's works influenced the project.

### Projects

Contains the projects section of the portfolio. This section is still being developed.

### Contact

Contains links to my social profiles and other ways of getting in touch.

## Deployment

The project is deployed as a static website and uses the custom `solxmn.me` domain.

The repository contains the configuration and assets used by the deployed site.

The current repository does not contain the complete original development history. It was created as part of the transition to the current domain, so the visible Git history does not fully represent how the website was developed.

## History

The first version of the website was created on October 8, 2025, using an `.is-a.dev` subdomain.

Initially, I experimented with AI-generated templates and modified the ones I liked. As I continued working on the project, I started learning HTML, CSS, and JavaScript properly and gradually moved away from relying on pre-made templates.

I also took inspiration from websites such as Linktree and other personal websites while developing my own layout and visual style.

For the major redesign, I first designed the entire site in Photoshop. This gave me a way to work out the layout and overall concept before implementing it in code.

Once I had the design planned out, I spent around four to five hours a day working on the redesign. I kept iterating on the layout, styling, animations, interactions, and smaller details until I was proud of the result.

After the main redesign was complete, I started adding more Easter eggs and hidden interactions. Some of these are still experimental or unfinished and are not yet part of the deployed site.

On July 15, 2026, I claimed the `solxmn.me` domain through the GitHub Student Developer Pack.

AI was used very minimally in the deployed versions of the website. I only used it once or twice, mainly for debugging and for writing GitHub commit descriptions. The majority of the final implementation was written by me.

## Repository Structure

The repository contains the original website files as well as the newer redesign and its assets.

The redesign is contained in its own directory and has its own HTML, CSS, JavaScript, fonts, images, audio, and other static assets.

The project structure is subject to change while development continues.

## Development Status

This is an ongoing personal project rather than a finished template or framework.

The current deployed site represents the version I am most proud of, but I still have ideas for additional interactions, Easter eggs, and improvements that I may implement in the future.
