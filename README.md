<h1 align="center">gitskin</h1>
<h3 align="center">rips github's face off and puts a prettier one on.</h3>

<p align="center">
  <a href="https://gitsk.in">website</a> · <a href="https://gitsk.in/themes">themes</a> · <a href="https://gitsk.in/docs/authoring">make your own</a> · <a href="https://github.com/deskinned/skinbank">skinbank</a>
</p>

---

gitskin is a Chrome/Firefox extension that themes GitHub's UI. pick a skin from the [marketplace](https://gitsk.in/themes), build your own in the live visual editor, or write a `.skin` file by hand. github's default UI is a war crime against your retinas — this fixes that.

zero telemetry. zero paywall. zero fucks given about github's original design choices.

### what it does

- **overrides every color on github** — backgrounds, text, borders, syntax highlighting, diffs, contribution graph, badges. all of it. github's entire color palette is now yours to fuck with.
- **changes fonts** — body, code, headings. bring your own typography. make github look like it was designed by someone with taste.
- **per-component styling** — make the diff view look different from the sidebar. add hover effects. pseudo-elements. go as deep as you want.
- **custom CSS escape hatch** — scanline overlays, pixel grids, custom scrollbars, keyframe animations. if CSS can do it, you can do it. we won't stop you. we're not your mom.
- **survives github updates** — themes target a stable abstraction layer, not raw selectors. when github inevitably breaks their DOM (again), the adapter system handles it. your themes keep working while everyone else's userstyles shit the bed.
- **built-in theme builder** — edit tokens with color pickers, inspect components, write CSS blocks, preview everything live on real github pages. export a `.skin` file when you're done. no YAML knowledge required (but it helps if you're not a coward).

### how it works (30 seconds)

1. install the extension
2. pick a theme from the popup or the [marketplace](https://gitsk.in/themes)
3. github looks good now. that's it. there is no step 4. stop overthinking it.

### how it actually works (for the unhinged)

the extension intercepts github pages and injects CSS at three levels:

| level | what | resilience |
|-------|------|-----------|
| **tokens** | overrides github's Primer CSS variables (their public design system API) | nearly unbreakable |
| **components** | targets abstract UI components (PRHeader, DiffView, CodeView, etc.) resolved at runtime via multi-strategy adapter cascade | resilient — falls back through ARIA → data-attr → structural → class selectors |
| **custom CSS** | raw CSS you write, your responsibility | you break it, you fix it |

adapters (the mapping from abstract components to actual DOM) are hot-loaded from [skinbank.gitsk.in](https://skinbank.gitsk.in) — no extension update needed when github decides to rearrange their furniture at 3am. the [biopsy](https://github.com/deskinned/biopsy) system crawls github's DOM every night while it sleeps and patches the adapters before you wake up.

### install

**Chrome:** [chrome web store link coming soon]

**Firefox:** [firefox AMO link coming soon]

**Dev build:**
```bash
git clone git@github.com:deskinned/gitskin.git
cd gitskin
pnpm install
pnpm run dev

# chrome: chrome://extensions → developer mode → load unpacked → dist/chrome/
# firefox: about:debugging → load temporary add-on → dist/firefox/manifest.json
```

### make a theme

**visual editor (easy mode):** click "Create Theme" in the extension popup. edit live on any github page. see your changes instantly on your actual repos. export when done.

**by hand (gigachad mode):** write a `.skin` file (YAML with a cool extension). your editor gets full autocomplete via our [JSON Schema](https://skinbank.gitsk.in/v1/theme-schema.json).

```bash
# one-time editor setup (vscode, neovim, jetbrains, sublime, helix, zed):
curl -fsSL https://gitsk.in/setup | sh
```

**submit it:** upload at [gitsk.in/submit](https://gitsk.in/submit) or fork [skinbank](https://github.com/deskinned/skinbank) and PR it. our CI validates your shit, AI reviews it for security, screenshots it on real github pages, and a maintainer merges it. your name on the commit forever.

**[full authoring guide →](https://gitsk.in/docs/authoring)**

### example `.skin` file

```yaml
meta:
  id: midnight
  name: "Midnight"
  author: yourgithubusername
  version: "1.0.0"
  description: "dark blue everything"
  base: dark
  tags: [dark, minimal, cool]

tokens:
  canvas.primary: "#0d1117"
  canvas.secondary: "#161b22"
  fg.primary: "#c9d1d9"
  fg.muted: "#8b949e"
  accent.primary: "#58a6ff"
  border.default: "#30363d"
  diff.added.bg: "#12261e"
  diff.removed.bg: "#2d1315"
  syntax.keyword: "#ff7b72"
  syntax.string: "#a5d6ff"
  syntax.comment: "#8b949e"
```

that's a complete theme. 12 lines of tokens and every color on github changes. your move, github design team.

want more? add component styles, pseudo-elements, hover effects, custom CSS, scanline overlays, CRT glow effects, whatever the fuck you want. see the [theming levels](https://gitsk.in/docs/authoring#levels) doc.

### local dev

```bash
pnpm install
pnpm run dev          # watch mode, rebuilds on change
pnpm run test         # vitest unit tests
pnpm run test:e2e     # playwright e2e tests
pnpm run lint         # eslint + prettier
pnpm run build:chrome # production build (chrome)
pnpm run build:firefox # production build (firefox)
```

needs: node 22+, pnpm 9+, chrome or firefox. if you don't have these in 2026 what are you even doing.

for full local dev across all deskinned repos (skinbank, site, worker), see [CLAUDE.md](https://github.com/deskinned/.github/blob/main/CLAUDE.md) in the org root.

### architecture

gitskin is part of the [deskinned](https://github.com/deskinned) ecosystem:

| repo | what |
|------|------|
| **gitskin** | the extension |
| [skinbank](https://github.com/deskinned/skinbank) | adapters + themes + public API |
| [deskinned.github.io](https://github.com/deskinned/deskinned.github.io) | website + marketplace at gitsk.in |
| [biopsy](https://github.com/deskinned/biopsy) | automated DOM crawler + adapter maintenance |
| [orderly](https://github.com/deskinned/orderly) | submission API at api.gitsk.in |
| [mugshot](https://github.com/deskinned/mugshot) | screenshot Action for theme previews |

---

<p align="center">
  <sub>made by <a href="https://github.com/deskinned">deskinned.</a> — stripping UIs to the bone since 5069 A.D.</sub>
</p>