# Emmanuel Amdany — Portfolio

Personal developer portfolio. Plain HTML, CSS, and a small amount of vanilla
JavaScript — no framework, no build step, no bundler. Serves directly from the
repo root on GitHub Pages.

## Structure

```
├── index.html            # single page: intro, about, stack, work, contact
├── .nojekyll             # tells GitHub Pages to skip Jekyll processing
├── css/
│   └── main.css          # design tokens + all styles
├── js/
│   └── main.js           # mobile nav, scroll-spy, reveal-on-scroll
└── assets/
    ├── emmanuel-amdany-cv.pdf
    ├── udemy-android-development-certificate.pdf
    └── img/              # portrait, project screenshots, favicon
```

## Design tokens

All tokens live in one `:root` block at the top of
[css/main.css](css/main.css); the dark theme overrides the same custom
properties under `prefers-color-scheme: dark`.

| Group | Tokens | Notes |
| --- | --- | --- |
| Palette | `--bg`, `--surface`, `--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint`, `--line`, `--line-soft` | Warm grayscale base. `--ink-faint` is decorative-only to keep body text AA-compliant. |
| Accent | `--accent`, `--accent-tint`, `--accent-tint-hover`, `--accent-border`, `--accent-glow` | Muted gold (ochre in light mode, soft gold in dark), used sparingly: text links, section/project numbers, primary CTA fill, availability pulse dot, one backdrop glow. AA-checked in both schemes. |
| Glass | `--glass-bg`, `--glass-bg-hover`, `--glass-border`, `--glass-shine`, `--glass-shine-weak`, `--glass-blur`, `--glass-shadow` | iOS-26-style liquid-glass bubble recipe (blur 5px, inset highlights, top + left shine hairlines via pseudo-elements) applied to every surface component: nav pill, buttons, facts card, stack rows, project cards, tags, social pills, footer bar. Dark mode lowers the white fill alpha so text stays AA-readable. |
| Type | `--font-display` (Fraunces), `--font-body` (Inter), `--fs-sm` → `--fs-display` | Modular scale (~1.2), fluid at the top end via `clamp()`. Two Google Fonts families, loaded via `<link>`. |
| Spacing | `--sp-1` (4px) → `--sp-9` (fluid ~80–136px) | 4px base scale. |
| Shape | `--radius-sm` (4px), `--radius-bubble` (20px, all glass cards; pills use 999px) | |

## Behavior

- **Reveal-on-scroll** uses `IntersectionObserver` with staggered delays for
  items entering together; the hidden state is gated on `html.js` and
  `prefers-reduced-motion: no-preference`, so content is always visible
  without JavaScript or with reduced motion enabled. A watchdog un-hides
  everything if the observer never fires.
- **Scroll-spy** sets `aria-current` on the active nav link.
- **Backdrop glow field**: two fixed radial glows drift very slowly behind
  the page so the glass has something to refract; static under reduced motion.
- **Specular highlight**: a soft light spot follows the pointer across glass
  bubbles on hover (fine-pointer devices only, disabled under reduced motion).
- **Nairobi clock** in the footer via `Intl.DateTimeFormat` (`Africa/Nairobi`).
- A global `prefers-reduced-motion: reduce` rule zeroes out every animation
  and transition.
- Light/dark follows the system (`prefers-color-scheme`).

## Deploying to GitHub Pages

1. Push this repo to GitHub (default branch, e.g. `main`).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick the default branch and **/ (root)**, then save.
4. The site publishes at `https://<username>.github.io/<repo-name>/` within a
   minute or two. All asset paths are relative, so no configuration is needed.

## TODO

- Set absolute `og:url` / `og:image` meta tags in `index.html` once the final
  Pages URL (or custom domain) is known.
- No contact form by design (static site, no backend) — wire up a
  Formspree/Basin endpoint if one is ever wanted.
- `assets/img/safisha-rugs.png` is ~1.7 MB; recompress when convenient
  (it's below the fold and lazy-loaded, so not blocking).
