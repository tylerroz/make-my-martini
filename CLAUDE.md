# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Make My Martini is a static, no-build single-page app — plain HTML, CSS, and vanilla JS. No framework, no bundler, no package manager. Open `index.html` directly in a browser to run it.

## Architecture

All logic lives in three files:

- **`index.html`** — Structure. Chip selectors use `data-group` (maps to a `state` key) and `data-mode` (`solo` for mutually exclusive, `multi` for toggleable). The result card SVG has named element IDs that `render()` manipulates directly.
- **`app.js`** — All behavior. A single `state` object drives everything. `render()` is called after any state change and does a full DOM sync — no partial updates. The "Surprise Me" button randomizes `state` then also manually syncs chip `.active` classes before calling `render()`.
- **`style.css`** — Two-column grid layout (`.layout`) collapses to single-column below 820px. The result card (`.result-col`) is `position: sticky` on desktop; `position: static` on mobile.

## Adding New Options

To add a new chip group (e.g., "Glass Size"):
1. Add the `<div class="chip-row" data-group="KEY" data-mode="solo|multi">` block in `index.html`
2. Add the default value to `state` in `app.js`
3. Update the relevant computed functions (`getName`, `getIngredients`, `getFlavorProfile`, etc.)
4. Update the "Surprise Me" randomizer in the `random-btn` click handler

The `dirty`/`extra-dirty` mutual exclusion pattern in the `multi` mode click handler is the template for options that conflict with each other.
