# AGENTS.md - AI Coding Assistant Guidelines

## Project Overview

This is a personal Hugo blog with a cyberpunk aesthetic. It uses the "etch" theme with heavy customizations for a terminal/hacker visual style.

**Stack:** Hugo 0.152.2 | Netlify | etch theme

## Architecture

```
blog/
├── assets/css/          # Custom CSS (bundled by Hugo)
│   ├── cyber.css        # Main cyberpunk theme (fonts, colors, glows)
│   └── dither.css       # WebGL canvas opacity
├── content/
│   ├── posts/           # Long-form articles (tech, personal, reviews)
│   ├── log/             # Microblog entries (tweet-style)
│   └── about/           # Static about page
├── layouts/
│   ├── partials/        # Override theme partials (head.html, footer.html)
│   ├── log/             # Custom log section templates
│   └── _default/        # Default templates (single.html)
├── static/
│   ├── js/              # Client-side JavaScript
│   │   ├── pulsar-dither.js # WebGL animated background shader
│   │   ├── youtube-embed.js # YouTube Music link previews
│   │   └── lightbox.js      # Image lightbox for log photos
│   └── img/
│       └── log/         # Images from Telegram bot
├── scripts/             # Utility scripts
│   └── quick-log.sh     # Rofi-callable quick posting
└── themes/etch/         # Base theme (DO NOT EDIT)
```

## Design System

### Colors
- **Primary accent:** `#0ff` (cyan)
- **Glow effects:** `rgba(0, 255, 255, 0.3-0.6)` with `text-shadow`
- **Backgrounds:** Dark with subtle cyan tints (`rgba(0, 255, 255, 0.03-0.06)`)
- **Borders:** `rgba(0, 255, 255, 0.1-0.15)`
- **Muted text:** `#888`

### Typography
- **Font:** JetBrains Mono (monospace)
- **Body:** 18px, weight 500
- **Headings:** weight 700
- **Letter spacing:** 0.02em

### Visual Effects
- Scanline overlay via `body::before` pseudo-element
- Cyan glow on hover for interactive elements
- WebGL animated dither/glass background (persists across page navigations)
- Selection highlight in cyan
- Image cards with hover glow and lightbox expansion

## Content Types

### Posts (`content/posts/`)
Standard Hugo posts organized by category (tech, personal, reviews).

### Log (`content/log/`)
Microblog entries displayed tweet-style:
- Format: `@char says:` + content + right-aligned timestamp
- Filename: `YYYY-MM-DD_HHMM.md`
- Paginated at 10 entries per page on `/log/`
- Supports images (via Telegram bot)
- Has separate RSS feed

### Images
- Single images: `![](/img/log/YYYY-MM-DD_HHMM.jpg)` rendered as centered 280px cards
- Lightbox: Click any log image to view full-size in overlay
- Press Escape or click outside to close lightbox

## Key Conventions

### CSS
- Use `!important` when overriding theme font-family (etch theme is stubborn)
- Use `main#content` prefix for selectors that need to override theme specificity
- All custom styles go in `assets/css/cyber.css`
- Follow existing pattern: selector, then transition effects, then hover state

### JavaScript
- Scripts in `static/js/` with `defer` attribute
- Use **absolute paths** (`/js/file.js`) in templates, not relative
- YouTube embed script uses noembed.com API for metadata (no CORS issues)

### Hugo Templates
- Override theme by placing files in `layouts/` (mirrors theme structure)
- Partials go in `layouts/partials/`
- Section-specific layouts in `layouts/{section}/`

### Configuration
- Site config in `config.toml`
- Menu items defined in `[menu]` section
- Permalinks: posts use `/:title/`, logs use `/log/:contentbasename/`
- Pagination: 10 items per page (configured in `[pagination]`)

## Known Issues

1. **WebGL dither may not work in:**
   - Brave browser (shields/fingerprint protection)
   - Mobile devices (reduced motion, privacy settings)
   - This is expected; site degrades gracefully

2. **Theme CSS specificity:** The etch theme has high specificity. Use `main#content` prefix or `!important` for overrides.

## Do NOT

- Edit files in `themes/etch/` directly (override in `layouts/` instead)
- Use relative paths for JS/CSS in templates (breaks on subpages)
- Commit `.env`, credentials, or deploy keys
- Add emojis unless explicitly requested
- Create unnecessary markdown/documentation files

## Quick Reference

| Task | Location |
|------|----------|
| Add CSS styles | `assets/css/cyber.css` |
| Add JavaScript | `static/js/` + reference in `layouts/partials/head.html` |
| New log entry (manual) | `scripts/quick-log.sh` or `hugo new log/YYYY-MM-DD_HHMM.md` |
| New log entry (Telegram) | Send `/log <message>` or photo with `/log <caption>` to @bloggy_bot |
| Override theme template | Copy from `themes/etch/layouts/` to `layouts/` |
| Site configuration | `config.toml` |
| Deploy settings | `netlify.toml` |

## Build & Deploy

```bash
# Local development
hugo server -D

# Build for production
hugo --gc --minify

# Deployment: Push to main branch, Netlify auto-deploys
```
