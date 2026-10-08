# Harish S — Portfolio

Single page, no frameworks, no build step, no CDN libraries (fonts aside).
Open `index.html` in a modern browser and it runs.

```
portfolio/
├── index.html                      — structure + content
├── README.md
└── assets/
    ├── css/
    │   └── styles.css              — design system, layout, motion
    ├── js/
    │   └── main.js                 — animation engine
    └── img/
        ├── harish.jpg              — the portrait (1106×1209, 151 KB)
        ├── vasoolx.png             — Play Store listing graphic (520×293, 82 KB)
        ├── aura-ai.png             — Unsloth fine-tuning run (1280×599, 272 KB)
        ├── faculty-alteration.png  — staff portal landing (1517×863, 214 KB)
        ├── medinav.jpg             — ambulance booking screen (898×481, 33 KB)
        ├── mkce-clubs.png          — Arroh club index (1896×867, 654 KB)
        ├── prosport.png            — PathMakers client site (1893×866, 1.1 MB)
        ├── steganography.webp      — message hidden in pixels (1920×1920, 153 KB)
        └── aura-ai.svg             — architecture diagram, NOT currently referenced
```

`index.html` stays at the root because it is the entry point — everything it loads lives
under `assets/`, one directory per kind. Paths in the markup are relative (`assets/css/…`),
so the folder can be opened from disk, served from any subdirectory, or dropped on a static
host unchanged.

Eight images on the page, and nothing else. The background, the remaining project panels,
every mark and rule is CSS — including the pencil cursor and the nav underline, which are
inline SVG data-URIs in the stylesheet rather than files. Every `<img>` carries
`width`/`height` attributes matching its real pixel dimensions — that is what reserves the
box before the file lands, and it is the only thing standing between this page and a layout
shift. **Swap an image, update those two numbers.**

`aura-ai.svg` is a drawn diagram of the Aura AI gatekeeper pattern. It is kept because it is
worth keeping, but the Aura panel currently shows the training-loss PNG instead, so nothing
loads it. Delete it or wire it up — don't leave it ambiguous for long.

`prosport.png` is 1.1 MB, by some margin the heaviest thing here and larger than the rest of
the page combined. It is below the fold and lazy-loaded, so it does not block first paint,
but it is the first thing to compress if the page ever needs to get lighter.

---

## Concept: aged drafting stock

The page is built as an engineering drawing on old paper. That isn't decoration; it's the one
idea everything else follows from, and it's true to the subject (ECE → software).

### Palette provenance

Four colours are **given and used verbatim**:

| Hex | Role | Note |
|---|---|---|
| `#F8F3D9` cream | `--sheet` | the stock |
| `#EBE5C2` sand | `--sheet-2` | cards, ticker, bands |
| `#B9B28A` khaki | `--sheet-4` | **structural only** — carries no text at any size |
| `#504B38` olive | `--ink`, `--plate-bg` | all body text, every hairline, the plate, the footer band |

Everything else moves lightness and chroma **inside their hue family (H 44–51)**, so
additions read as the same palette rather than as imported colour. There is exactly one
deliberate departure, and it is worth knowing about:

> **The four given colours share a single hue**, so the revision mark the whole layout is
> built around had nothing to be made of. `--accent` `#8A3F14` is pushed to H 22 — same warm
> earth, chroma up — because that is the minimum a mark needs to function as a mark. If you
> want the page strictly four-colour, see *Monochrome variant* below.

Two measured facts shaped the rest:

- **`#B9B28A` cannot carry text.** 1.9:1 on the cream, 1.7:1 on the sand, 2.1:1 with white.
  It is the ghost sheet-number and the scrollbar thumb, and nothing else.
- **The ink ramp is compressed by arithmetic, not taste.** `#504B38` on `#F8F3D9` is 7.8:1,
  so `--ink-2` and `--ink-3` have to fit between 7.8:1 and 4.5:1 — luminance 0.070 → 0.133.
  `--ink-3` binds against the *sand card*, not the stock, because the mono micro-labels
  appear on both.

| | |
|---|---|
| **Background** | Four layers, each doing one job — see below. Light only, no dark theme, no toggle. |
| **Panels** | Flat plates in desaturated green, blue-grey, olive and mauve — a family of shadows under this stock rather than bright chips fighting it. All clear `#fff` at 8:1 or better. No gradient appears anywhere except the background staining. |

### The background: a sheet with one drawing on it

**No pattern.** Nothing with a motif tiles, and no gradient here is of the repeating variety.
A ruled background says *graph paper*; a drawn one says *a drawing*, which is what this page
is pretending to be.

Four fixed layers, bottom to top. Everything is CSS gradients plus one ~300-byte data URI —
no images, no canvas.

| Layer | Job |
|---|---|
| `.topo` | **Foxing.** Four faint stain pools on a 42s drift — the only layer that moves, and it moves by `background-position`, never by repaint. Weighted to the *edges* rather than centred, because paper ages from the margins in. |
| `.regs` | **The construction.** One drafting detail — three concentric rings with centre lines struck through them — plus two long arcs swept from centres off the sheet. Seven lines total, each drawn once at a deliberate position. Faint edge burn on `::after`. |
| `.grain` | **Paper tooth.** Procedural fractal noise from a single inline `feTurbulence`. Static. |
| `.ticks` | Corner registration marks. |

**Why a single construction.** Seven lines instead of hundreds changes the economics of the
ink: a tiled pattern repeats its motif across the whole sheet and so each line has to stay
near-invisible, but seven lines can each actually be *seen* — which is why `--grid` /
`--grid-2` jumped from `.075`/`.034` to `.17`/`.10` when the ruling came out. The geometry is
positioned, not generated: the three detail rings are concentric about 19%/25%, the two
centre lines are px hairlines placed on that same centre and sized long enough to cross it,
and the two sweeps are struck from centres outside the viewport so only their arcs land on
the page. Radii are `vmax`-capped so the whole figure scales with the viewport instead of
cropping.

Rings are **feathered across ~1.2px** rather than cut on a hard stop. A hard 1px stop on a
920px-radius circle aliases into a visibly stepped curve; the feather costs nothing and reads
as a drawn line rather than a jagged one.

**Why procedural grain.** It's the one part of a background that gradients genuinely cannot
fake: gradients are smooth by definition and paper is not. The `feColorMatrix` throws away RGB
and drives alpha from the noise instead, so the output is black at varying opacity rather than
coloured speckle — which is what separates paper tooth from television static. `stitchTiles`
makes the 180px tile seamless. One dial, `--tooth`: `.03` is barely there, `.08` is openly
textured, past `.12` it reads as dirt.

Two deliberate omissions:

- **No `mix-blend-mode: multiply` on the grain.** For a pure black source, multiply and normal
  alpha compositing produce identical pixels — and multiply would force the compositor to
  re-blend the whole fixed layer every frame `.topo`'s scroll transform changes beneath it.
- **No grain jitter.** A grain that resamples 8×/second is *film*. This is paper, so it holds
  still — which is also free.

The grain sits at `z-index: 1`, below `main` at 2, so it textures the sheet without ever
touching the text on it. The cards carry their own `--sheet-2` ground above it, which reads as
a second stock laid on the first.

### Token groups that exist for a reason

Don't "simplify" these back — each one is load-bearing:

- **`--accent` vs `--hot`** — a saturated mark that works as a fill usually fails with white
  text on it. `--accent` carries text (6.7:1 on cream); `--hot` is fills and rules only. The
  selection highlight, the cursor's `OPEN`/`VIEW` disc and the bio link hover all put white
  on a swatch, so they take `--fill-hot` (8.7:1), not `--hot` (3.2:1).
- **`--fill-hot` / `--fill-dk`** — the project panels all carry `#fff` art, so they stay
  *deep* fills regardless of how bright the stock's own accents are.
- **`--plate-bg` / `--plate-mu` / `--plate-mark` / `--plate-ln`** — **a plate ground takes a
  pair**: muted label plus display mark. One pair can't serve two grounds, which is why
  `.ct-plate` overrides both locally when it repaints itself teal. `--hot` drops to 2.2:1 on
  the olive footer status band, so anything marking that band reuses `--plate-mark` —
  already "the warm mark on a dark ground".

### Monochrome variant

To use strictly the four given colours and nothing else, swap three tokens:

```css
--accent:   #504B38;   /* the olive itself — 7.8:1 on cream */
--hot:      #6E6549;
--fill-hot: #504B38;   /* 8.7:1 with white */
```

Emphasis then comes from weight and fill rather than hue. It is calmer and more unified; it
also loses the revision-mark device the drawing language is built on, and `.spec-live`, the
timeline nodes and the sheet numbers stop reading as marks at all.
| **Type** | **Big Shoulders Display** — a condensed industrial signage face — against **IBM Plex Sans / Mono**, chosen because the Plex family has genuine engineering heritage rather than just looking technical. |
| **Drawing language** | Dimension line under the name, `SHEET 0n / 05` on every section head, revision letter, a schedule for the contact channels, and an asymmetric **title block** as the footer (Drawn by / Sheet / Rev / Date / Scale / Notes). |

Fonts load in **two separate requests** — the Google CSS2 API returns 400 for the whole
request if any one family name is wrong, so splitting them means a rename upstream degrades
one face instead of all three.

---

## One device per section

| Section | Device |
|---|---|
| **Load** | Plot counter to 100 with staged captions (`PLOTTING GRID` → `SETTING INK` → `DIMENSIONING` → `READY`), then the sheet lifts away |
| **Hero** | **Exposure** — a wedge of shade crosses the name once, and each glyph *develops* as the pass reaches it: out of focus and underweight, then resolving as the ink takes. Big Shoulders Display is a variable face, so the weight is a real axis animation (`font-variation-settings` 400 → 700) rather than a swap between two static cuts — the letters visibly thicken as they land. On scroll the two lines drift in opposite directions, like a sheet pulled off the board, while the pointer adds a shallow counter-drift |
| **Nav** | Flush with the sheet at rest; **detaches into a floating callout** the instant you scroll — narrower, inset, ruled border, offset drop shadow |
| **Ticker** | Speed scales with scroll speed and **reverses** when you scroll up |
| **01 About** | Paragraph inks in **word by word** as it crosses the viewport; counters ease to value |
| **02 Experience** | **Scroll-scrub timeline** — the centre rail draws down with scroll while cards hinge in from their own side on a 3D rotation; nodes fill orange and leader lines fade in as each lands. Fully reversible: scroll back and it un-draws |
| **03 Work** | Seven project cards **stack** — each pins, then shrinks and fades as the next slides over it. Three carry a real screenshot, mounted on the panel's own fill; the other four keep generated art |
| **04 Skills** | Items **lean toward the cursor**, colour driven by proximity |
| **05 Contact** | **The section dimensions itself** — extension arrows strike out, dimension rules draw between them, and the figures count up like a caliper settling. One motif at two scales: the headline block and the email string. Every number is *measured from the live element* and re-measured on resize, so the drawing never lies about itself |
| **Global** | A labelled disc (`VIEW` / `OPEN`) that appears **only over a link** — everywhere else the native cursor is left alone; live IST clock |

### How the hero reveal stays in sync

The glyph delays are **not** index-based. `syncBeam()` measures each glyph's own x position
across the hero and derives its delay from that, so both lines read as one sweep of light:
the `S` sits on line two but near the left margin, and has to fire *early* — which an
index-based delay gets exactly backwards. The measurement waits on `document.fonts.ready`,
because condensed display metrics shift hard between Arial Narrow and Big Shoulders and a
delay computed against the fallback lands wrong. An index-based delay is written up front
as a fallback, so the reveal still runs if font loading never resolves.

Scroll drift and pointer parallax are written by the **same** frame handler. Two handlers
writing `transform` on one element means the later one silently wins, which is the usual way
parallax breaks.

### How the contact dimensions work

CSS owns the apparatus — the rules scale from zero, the arrowheads fade after them, the
labels follow. JS owns only the numbers, and **the numbers are measured, not authored**:
`getBoundingClientRect()` on the live headline and email, converted to millimetres at the CSS
reference 96dpi (`25.4 / 96`). That is the point of the whole device — a dimension label
carrying a made-up figure is a decoration pretending to be an instrument.

Two details that matter:

- **Arrowheads sit on `.cdim`, never on `.cdim-rule`.** The rule is the element that scales,
  and a child of a scaled box is squashed along with it. This is the bug that device invites.
- **Counting is first-reveal only.** A resize re-measures and snaps, because an animated
  number during a window drag is noise rather than information.

Under `prefers-reduced-motion` the rules render already struck and `contactDims()` writes the
measured value straight in, so nothing has to fake a figure.

This replaced two devices. The headline's per-glyph mask reveal went because the hero already
works glyph by glyph, so the lines now rise whole. The email's cursor char-wave went for a
better reason: it was proximity-driven character lean, which is **the same device the Skills
field already owns** — the page was spending two sections on one idea.

### The portrait

The About plate already carried name, degree, college and coordinates — it was an identity
plate without the identity. The portrait takes the place the `HS` mark held, and the mark
survives as a corner stamp over the print.

**One state, always.** The photograph is shown as it is — no tint, no hover reveal, no
transition on the image. A portrait that changes under the pointer asks to be played with;
this one is the identity on the plate, so it holds still.

The caption stays visible rather than appearing on hover. It's a figure caption, not a reveal.

### The cursor

The disc appears over a link and nowhere else. Off a link the element is hidden and the native
cursor is handed straight back — the page is normal by default and annotated only where there
is something to annotate.

It used to be a crosshair that rode the pointer across the whole sheet and swelled into a disc
on anything tagged. That was backwards twice over: the decoration was constant while the
information was occasional, and the crosshair never *replaced* the native arrow, so every
pointer on the page had a second cursor bolted to it. `body.cur-link` now suppresses the arrow
for exactly as long as the disc is up, and the two are never on screen together.

What triggers it is `a[href]` or `button` — things that actually go somewhere — not the
`[data-c]` tags, which also sit on facts, skill chips and timeline cards that aren't clickable.
`[data-c]` still chooses the *word*, read from the nearest tagged ancestor so a CTA inside a
tagged card inherits the card's verb; failing that the href decides, and an in-page anchor is a
`VIEW` while anything else is an `OPEN`. The disc never comes up blank.

### Project screenshots

Three of the seven work panels — VasoolX, Faculty Alteration System, MKCE Club Pages — carry a
real screenshot. The other four keep their generated art, because there is nothing to show yet.

Each shot is **mounted, not bled.** The panel's fill survives as a mount board around it, the
print takes a hairline rule and a drop shadow so it sits *on* the panel rather than being
punched through it, and it is captioned (`Fig. A`, `Fig. B`, `Fig. C`) in the same mono every
other figure on the sheet uses.

`object-fit: contain`, never `cover`. These are wide captures — 1.8:1 and 2.2:1 — dropped into
a panel that is roughly square on desktop, and a cover crop would throw away exactly the half
of each frame that makes it readable: the sign-in card on the faculty portal, the club tiles on
the Arroh page. On narrow screens `.pj-r:has(.pj-shot)` lifts the panel floor from 140px to
200px, below which a contained wide capture is just a thumbnail of itself.

### Email links

Every email link is a real `mailto:srharish05@gmail.com` in the markup — correct href, survives
right-click → copy address, and it is what a visitor with a configured mail client wants.

It is intercepted anyway. On a machine with **no handler registered for the `mailto:` protocol**
— the default state of a fresh Windows install and of most Chrome profiles — the click fires,
the browser finds nothing to hand it to, and nothing happens at all. The link isn't broken; it
just looks exactly like it is.

So §13 parses the address and subject off the href and opens **Gmail web compose** in a new tab
instead: one destination, always opens, nothing to configure. If the popup is blocked the
`mailto:` is allowed through untouched, and with JS off the plain href is all that's there.
Modified clicks (ctrl/cmd, middle, shift) are left to the browser.

To go back to native `mailto:` everywhere, delete the `mailLinks()` block in `main.js` — the
markup needs no change.

### Contact and footer layout

Both were rebuilt around the same complaint: an even grid of equal cells has no hierarchy, so
nothing in it can be the point.

**Contact** — the headline now runs the **full width of the sheet**, and the call, the
schedule and the plate sit beneath it. Previously the headline was squeezed into `1.45fr`
beside the availability plate, which meant the one element that should dominate was competing
for room. `.ct-body` then runs two columns with the schedule spanning both rows, so the call
stacks above the plate on the left.

The channels are now a **schedule** — every drawing carries one. A header row, a reference
column, and column rules, which is how a drawing states a parts list. As four full-bleed rows
they read as four more navigation bars; as a ruled schedule they read as data. The grid is
shared between header and rows through one `--cs-cols` custom property, so the header cannot
drift out of alignment with the body. Row hover is a 2px ref bar growing from the left edge
rather than the old full-slab wipe — a schedule row is data being read, not a button being
aimed at.

**Footer** — a real title block is asymmetric: one dominant principal cell carrying
authorship, with smaller metadata cells nested around it. The old one was `repeat(auto-fit,
minmax(150px,1fr))` — a toolbar wearing a title block's labels. It's now placed with explicit
grid areas and a 2-row span on the principal cell, which is the only place the footer raises
its voice.

The scrolling `AVAILABLE FOR WORK` marquee is gone. It stated one fact and then repeated it
six times to fill the band; the status strip states it once and spends the rest of the width
on the two facts that follow from it. That also removes the last piece of infinite motion from
the page.

### How the timeline works

JS writes a single custom property `--p` (0→1) per item, derived from how far that card has
risen past the reading line. CSS turns that one number into the hinge rotation, the x-offset,
the card opacity, the node scale and the leader-line opacity. No per-property animation
bookkeeping, and it reverses for free.

---

## How overlaps are prevented

Layout collisions were the main defect in an earlier pass. Four rules now hold the page
together, stated at the top of `styles.css` so they don't drift:

1. **`--hdr` is the single source of truth for header height.** Every sticky offset
   (`--stick`), the hero's top padding and `scroll-padding-top` derive from it. Previously
   these were four unrelated magic numbers, which is exactly how sticky layers end up
   silently covering each other at particular viewport widths.
2. **No `position: absolute` for layout.** The hero is a plain three-row grid. Absolute is
   used only for marks inside a box that has already reserved their space — the timeline
   nodes sit in the centre gutter the grid reserves for them.
3. **`align-items: start`** on grids hosting sticky children; stretching otherwise eats the
   travel room sticky needs.
4. **Masked characters carry padding plus matching negative margin**, so tight display
   line-heights can't shave ascenders.

Section headers are now a horizontal **sheet-head strip** rather than a sticky left rail,
which removes an entire class of sticky-versus-sticky collision.

### Architecture note

All scroll-driven work shares **one rAF loop** (`main.js` §05, the "scroll bus") that owns
position, velocity and direction; modules subscribe to it. There is no second scroll listener
and no library — and no scroll hijacking, so `position: sticky` does the pinning natively.

---

## Accessibility

- Full `prefers-reduced-motion` path — the hero name renders already developed (no blur, no
  weight animation, beam removed), the timeline renders fully drawn, stacked cards go static,
  read-along text renders lit, all transitions off.
- **28 contrast pairs are verified against the stylesheet as written**, each corresponding to
  a real rule rather than a generic swatch grid — body `--ink` 7.8:1, secondary 6.7:1, mono
  micro-labels 6.0:1 (5.2:1 on the sand card, which is the binding case), the mark 6.7:1, and
  `#fff` on the weakest project panel 8.3:1. Zero failures. If you retune a token, the pairs
  that break first are `--ink-3` against `--sheet-2` (5.2:1) and `--plate-mu` against
  `--plate-bg` (4.8:1) — both sit closest to the 4.5:1 floor.
- Unlit read-along words use `--ink-3`, not the near-invisible stock tint, so the paragraph
  is still readable if the scroll handler never runs.
- `:focus-visible` outlines throughout; semantic landmarks; real heading order.
- The cursor disc and the skill field are disabled on coarse pointers.
- The contact schedule is five anchors styled as a ruled table, not a `<table>` — the content
  is five links and a screen reader should hear five links. On narrow screens it drops its
  reference column rather than scrolling sideways.

---

## Before you publish

1. **Project links.** Several still point at `https://github.com/srharish-05` or `#`. Replace
   with the real repo URLs, the actual VasoolX Play Store listing, and the live club-pages URL.
2. **Project panels** are typographic compositions, not screenshots. Swap in real images if you have them.
3. **Resume PDF.** Not linked anywhere yet — drop one in and link it from the hero.

## Deploying

```bash
git init && git add . && git commit -m "portfolio"
# push, then enable GitHub Pages on the repo root
```

Or drag the folder onto Netlify or Vercel.
