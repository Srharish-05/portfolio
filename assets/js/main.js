/* ══════════════════════════════════════════════════════════
   HARISH S — PORTFOLIO ENGINE
   Vanilla JS. One deliberate device per section.

   01 split text      06 ticker (velocity-driven)
   02 loader          07 read-along
   03 clock           08 counters
   04 cursor          09 scroll-scrub timeline  ← Experience
   05 scroll bus      10 stacked cards          ← Work
                      11 skill field · email wave
                      12 reveals / nav / misc
                      13 email links

   Scroll policy: ONE rAF loop owns position, velocity and
   direction; modules subscribe. Native scrolling is never
   hijacked, so position:sticky pins by itself and the whole
   page degrades cleanly under prefers-reduced-motion.
   ══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp  = (a, b, n) => a + (b - a) * n;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── LIVE BREAKPOINTS ──
     Three of this file's devices are only correct at sizes the
     stylesheet still lays out for them, so the queries have to
     be live objects rather than booleans read once at load:
     a phone rotating, a tablet in split view and a dragged
     desktop window all cross these without a reload.

     Each one is paired with the rung in styles.css that owns
     the same number — if one moves, the other has to.

       MQ_STACK  mirrors the 900 rung + the short-landscape
                 rung: where .pj is still position:sticky
       MQ_TOPO   mirrors the 620 rung: where the foxing layer
                 is still allowed to move
       MQ_NAV    mirrors the 1180 rung: where the nav is the
                 burger overlay rather than a row in the bar */
  const MQ_STACK = matchMedia('(min-width: 901px) and (min-height: 561px)');
  const MQ_TOPO  = matchMedia('(min-width: 621px)');
  const MQ_NAV   = matchMedia('(max-width: 1180px)');

  /* ── latch ──
     Wraps a query as a gate the frame loop asks every tick, and
     runs `off` exactly ONCE on each falling edge. Both halves
     matter: a device that stops running has to undo what it
     last wrote inline — or the page keeps the final frame of an
     animation that no longer applies — but clearing on every
     frame would fight the stylesheet for the same properties.

     POLLED, not a MediaQueryList 'change' listener. The loop is
     already running, `.matches` is a cheap property read, and
     polling cannot miss an edge: a resize coalesced into a
     single layout, a transition that happened while the tab was
     backgrounded, or any environment where the change event is
     simply not delivered all resolve on the next frame, because
     the gate compares against the state it last saw rather than
     trusting that it was told. The event-driven version of this
     silently left the page scroll-locked with no menu on screen
     when the viewport grew past the burger breakpoint. */
  const latch = (mq, off) => {
    let was = null;
    return () => {
      const now = mq.matches;
      if (now !== was) { was = now; if (!now) off(); }
      return now;
    };
  };

  /* A split space must not collapse, or the gap between words
     disappears the moment each glyph becomes its own box. */
  const SP = '\u00a0';

  /* ─── 01 · SPLIT TEXT ─────────────────────────────────── */

  /* exposure — one layer per glyph (hero name).
     CSS owns the develop itself: the blur clearing, the rise,
     and the variable-weight axis thickening 400 → 700. All
     this does is build the spans and decide when each fires. */
  function expose(el, baseDelay = 0) {
    if (el.dataset.done) return;
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const ch = document.createElement('span');
      ch.className = 'ch-c';
      const inner = document.createElement('i');
      inner.textContent = c === ' ' ? SP : c;
      /* Index-based fallback. syncBeam() overwrites it once
         metrics are real — but it is never left unset, so the
         reveal still runs if font loading never resolves. */
      inner.style.animationDelay = (baseDelay + i * 0.07).toFixed(3) + 's';
      ch.appendChild(inner);
      el.appendChild(ch);
    });
    el.dataset.done = '1';
  }

  $$('.hero [data-plot]').forEach((el, i) => expose(el, 0.22 + i * 0.45));

  /* ─── 01b · BEAM SYNC ──────────────────────────────────
     Each glyph develops as the light actually reaches it. The
     delay comes from the glyph's own x position across the
     hero rather than from its index, so both lines of the
     name read as one sweep instead of two separate waves —
     the "S" on line two is near the left margin and has to
     fire early, which an index-based delay gets backwards.

     Measured after fonts settle: condensed display metrics
     shift hard between the fallback and Big Shoulders, and a
     delay computed against Arial Narrow widths lands wrong. */
  function syncBeam() {
    const wrap = $('.hero-type-wrap');
    if (!wrap || REDUCED) return;
    const box = wrap.getBoundingClientRect();
    if (box.width < 1) return;
    const LEAD = 0.16, SPAN = 1.24;   // mirrors .plot-head's sweep
    for (const g of $$('.ch-c > i', wrap)) {
      const r = g.getBoundingClientRect();
      const t = clamp((r.left + r.width / 2 - box.left) / box.width, 0, 1);
      g.style.animationDelay = (LEAD + t * SPAN).toFixed(3) + 's';
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncBeam);
  else addEventListener('load', syncBeam);

  /* ─── 02 · LOADER ─────────────────────────────────────── */
  const loader = $('#loader');
  let launched = false;

  function launch() {
    if (launched) return;
    launched = true;
    syncBeam();                      // last chance to land on real metrics
    document.body.classList.add('go');
    $('.hero-type').classList.add('split-go');
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1200);
  }

  function runLoader() {
    if (REDUCED) { launch(); return; }
    const num = $('#loaderNum'), rule = $('#loaderRule'), cap = $('#loaderCap');
    const STAGES = [[0,'PLOTTING GRID'], [34,'SETTING INK'], [62,'DIMENSIONING'], [88,'CHECKING SHEET']];
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(100, n + (n < 72 ? Math.random() * 13 + 5 : Math.random() * 5 + 1.5));
      num.textContent = String(Math.floor(n)).padStart(3, '0');
      rule.style.width = n + '%';
      for (const [at, label] of STAGES) if (n >= at) cap.textContent = label;
      if (n >= 100) { cap.textContent = 'READY'; clearInterval(t); setTimeout(launch, 360); }
    }, 105);
  }
  addEventListener('load', runLoader);
  setTimeout(() => { if (!launched) runLoader(); }, 3000);

  /* ─── 03 · CLOCK (IST) ────────────────────────────────── */
  (function tickClock() {
    const now = new Date();
    const a = $('#clock'), b = $('#clock2');
    if (a) a.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
    if (b) b.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
    setTimeout(tickClock, 1000);
  })();

  /* ─── 04 · CURSOR (link disc) ──────────────────────────
     One state, and it is earned: the labelled disc appears
     over a LINK and nowhere else. Off a link the element is
     hidden and the native cursor is handed straight back, so
     the page is normal by default and annotated only where
     there is something to annotate.

     What counts is `a[href]` or `button` — the things that
     actually go somewhere — not the [data-c] tags, which also
     sit on facts, skill chips and timeline cards that are not
     clickable. [data-c] still chooses the WORD, read from the
     nearest tagged ancestor so a CTA inside a tagged card
     inherits the card's verb; failing that the href decides,
     and an in-page anchor is a VIEW while anything else is an
     OPEN. The disc never comes up blank. */
  if (FINE && !REDUCED) {
    const cur = $('#cursor'), lab = $('#cursorLabel');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;

    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function spring() {
      cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22);
      cur.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(spring);
    })();

    const LABELS = { open: 'OPEN', view: 'VIEW', link: 'VIEW' };

    function clear() {
      cur.classList.remove('on');
      document.body.classList.remove('cur-link');
    }

    document.addEventListener('mouseover', e => {
      const link = e.target.closest('a[href], button');
      if (!link) return clear();

      const tagged = link.closest('[data-c]');
      const href   = link.getAttribute('href') || '';
      lab.textContent =
        (tagged && LABELS[tagged.dataset.c]) ||
        (href.startsWith('#') ? 'VIEW' : 'OPEN');

      cur.classList.add('on');
      document.body.classList.add('cur-link');
    });

    // pointer leaves the window entirely: mouseover won't fire
    addEventListener('mouseout', e => { if (!e.relatedTarget) clear(); });
    addEventListener('blur', clear);
  }

  /* ─── 05 · SCROLL BUS ─────────────────────────────────── */
  const bus = { y: scrollY, prev: scrollY, vel: 0, dir: 1 };
  const onFrame = [];

  (function busLoop() {
    bus.y = scrollY;
    const raw = bus.y - bus.prev;
    bus.vel = lerp(bus.vel, raw, 0.22);
    if (Math.abs(raw) > 0.4) bus.dir = raw > 0 ? 1 : -1;
    bus.prev = bus.y;
    for (const fn of onFrame) fn(bus);
    requestAnimationFrame(busLoop);
  })();

  /* ─── 05b · HERO DRIFT + WORKLIGHT PARALLAX ────────────
     Two inputs, one transform per element. Scroll pulls the
     two halves of the name apart — a sheet being drawn off
     the board — capped at one viewport so it stops once the
     hero is gone. The pointer adds a shallow counter-drift,
     so the light and the type sit on slightly different
     planes and the name has somewhere to sit *in*.

     Both must be written by the same handler: two handlers
     writing transform on one element means the later one
     silently wins, which is how parallax normally breaks. */
  if (!REDUCED) {
    const drifters = $$('[data-drift]');
    const topo = $('#topo');
    const hero = $('#hero');
    const topoLive = latch(MQ_TOPO, () => { if (topo) topo.style.transform = ''; });
    let px = 0, py = 0, tx = 0, ty = 0;   // pointer target, then eased

    if (FINE && hero) {
      addEventListener('mousemove', e => {
        px = (e.clientX / innerWidth  - 0.5) * 2;    // −1 … 1
        py = (e.clientY / innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    onFrame.push(b => {
      tx = lerp(tx, px, 0.055);
      ty = lerp(ty, py, 0.055);
      const y = Math.min(b.y, innerHeight);
      // past one viewport the hero is off screen; let the
      // pointer term decay out rather than tracking forever
      const live = 1 - y / innerHeight;

      /* The drift is a fraction of how far you have scrolled,
         which on a desktop sheet is a few dozen px into a wide
         margin. On a phone the name very nearly fills the
         measure, so the same fraction walks the first line off
         the left edge and clips the H — the sheet is being
         pulled off a board that is no longer there. Scale the
         amplitude to the slack the layout actually has. */
      const amp = innerWidth < 760 ? 0.022 : 0.07;

      for (const el of drifters) {
        const dir = parseFloat(el.dataset.drift) || 1;
        const sx = y * amp * dir;                    // scroll drift
        const mxp = tx * 13 * dir * live;            // pointer counter-drift
        const myp = ty * 5 * live;
        el.style.transform =
          `translate3d(${(sx + mxp).toFixed(1)}px,${myp.toFixed(1)}px,0)`;
      }

      /* The foxing layer is a full-viewport fixed box of five
         radial gradients. Transforming it is one composited
         layer on a laptop and a per-frame re-raster of the
         whole screen on a phone, which is the most expensive
         thing on this page for the least visible return — so
         below the 620 rung it holds still, and the stylesheet
         drops its keyframe animation to match. */
      if (topo && topoLive()) {
        // the light trails the type: slower on scroll, and
        // against the pointer rather than with it
        topo.style.transform =
          `translate3d(${(tx * -22 * live).toFixed(1)}px,${(b.y * -0.035 + ty * -14 * live).toFixed(1)}px,0)`;
      }
    });
  }

  /* ─── 06 · TICKER ─────────────────────────────────────── */
  (function ticker() {
    const track = $('#tickerTrack');
    if (!track) return;
    const html = track.innerHTML;
    let half = 0, x = 0;

    /* The track is duplicated until it is wide enough that the
       seam is always off screen, and `half` — the distance the
       loop wraps at — is measured from the result. Both depend
       on innerWidth, so both are wrong after a rotation: a
       phone turned to landscape more than doubles its width,
       the copies no longer cover it, and the gap between the
       last word and the first walks across the band. */
    function build() {
      track.innerHTML = html;
      let guard = 0;
      while (track.scrollWidth < innerWidth * 2.4 && guard++ < 10) track.innerHTML += html;
      half = track.scrollWidth / 2;
      x = 0;
    }
    build();

    /* Width only. On a phone `resize` also fires every time the
       URL bar collapses or re-appears, and rebuilding there
       would snap the ticker back to zero mid-scroll for a
       change that cannot affect it. */
    let lastW = innerWidth, rt;
    addEventListener('resize', () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(rt);
      rt = setTimeout(build, 220);
    });

    onFrame.push(b => {
      x -= (0.9 + Math.abs(b.vel) * 0.42) * b.dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  })();

  /* ─── 07 · READ-ALONG ─────────────────────────────────── */
  (function readalong() {
    const el = $('[data-readalong]');
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(w => {
      const s = document.createElement('span');
      s.className = 'wd';
      s.textContent = w + ' ';
      el.appendChild(s);
    });
    const spans = $$('.wd', el);
    if (REDUCED) { spans.forEach(s => s.classList.add('lit')); return; }

    onFrame.push(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const start = innerHeight * 0.80, end = innerHeight * 0.40;
      const p = clamp((start - r.top) / (r.height + (start - end)), 0, 1);
      const upto = Math.round(p * spans.length);
      for (let i = 0; i < spans.length; i++) spans[i].classList.toggle('lit', i < upto);
    });
  })();

  /* ─── 08 · COUNTERS ───────────────────────────────────── */
  const countIO = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec    = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    const fmt = v => (dec ? v.toFixed(dec) : Math.floor(v).toLocaleString('en-IN'));
    if (REDUCED) { el.textContent = fmt(target) + suffix; return; }
    const dur = 1500, t0 = performance.now();
    (function step(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 4))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    })(t0);
  }

  /* ─── 09 · SCROLL-SCRUB TIMELINE (Experience) ──────────
     The rail fills continuously with scroll position. Each
     card gets --p (0→1) from its distance to the reading
     line; CSS turns that into a hinge-in rotation, the node
     scale, and the leader-line opacity. Fully reversible —
     scroll back up and it un-draws.                        */
  (function timeline() {
    const tl   = $('#tl');
    const rail = $('#railFill');
    if (!tl || !rail) return;
    const items = $$('.tl-item', tl);

    if (REDUCED) {
      rail.style.height = '100%';
      items.forEach(i => { i.style.setProperty('--p', 1); i.classList.add('on'); });
      return;
    }

    onFrame.push(() => {
      const r = tl.getBoundingClientRect();
      if (r.bottom < -150 || r.top > innerHeight + 150) return;

      // rail draws down as the block passes the reading line
      const fill = clamp((innerHeight * 0.62 - r.top) / Math.max(r.height, 1), 0, 1);
      rail.style.height = (fill * 100) + '%';

      // each card hinges in as it rises past 92% → 55% of the viewport
      const from = innerHeight * 0.92, travel = innerHeight * 0.37;
      for (const it of items) {
        const p = clamp((from - it.getBoundingClientRect().top) / travel, 0, 1);
        it.style.setProperty('--p', p.toFixed(3));
        it.classList.toggle('on', p > 0.6);
      }
    });
  })();

  /* ─── 10 · STACKED CARDS (Work) ───────────────────────── */
  (function stack() {
    const cards = $$('.pj');
    if (!cards.length || REDUCED) return;

    /* This device reads the gap between one card's top and the
       next one's and turns it into a scale — which is only
       meaningful while the cards are PINNED. Below the 900
       rung (and on a phone in landscape) the stylesheet puts
       them back into normal flow, where the next card's top is
       simply wherever the document put it: the computed
       progress runs straight to 1 and every card renders
       permanently shrunk and faded at 75% opacity.

       So the module stops writing. It also clears what it last
       wrote on the way out, because the inline styles would
       otherwise survive the breakpoint as a frozen final
       frame. The stylesheet backs this with !important, so a
       stale write can never win even for one frame. */
    const stackLive = latch(MQ_STACK, () => {
      for (const c of cards) { c.style.transform = ''; c.style.opacity = ''; }
    });

    onFrame.push(() => {
      if (!stackLive()) return;
      for (let i = 0; i < cards.length - 1; i++) {
        const cur = cards[i].getBoundingClientRect();
        if (cur.bottom < -200 || cur.top > innerHeight + 200) continue;
        const next = cards[i + 1].getBoundingClientRect();
        // offsetHeight, not rect height — rect height is already
        // scaled by this card's own transform, which would feed back
        const h = cards[i].offsetHeight || 1;
        const p = clamp(1 - (next.top - cur.top) / h, 0, 1);
        cards[i].style.transform = `scale(${1 - p * 0.07}) translateY(${-p * 22}px)`;
        cards[i].style.opacity = 1 - p * 0.25;
      }
    });
  })();

  /* ─── 11 · SKILL FIELD ────────────────────────────────── */
  (function field() {
    const root = $('#field');
    if (!root || !FINE || REDUCED) return;
    const items = $$('.fi', root);
    let rects = [];
    const measure = () => { rects = items.map(i => i.getBoundingClientRect()); };
    measure();
    addEventListener('resize', measure);
    addEventListener('scroll', measure, { passive: true });

    const R = 185;
    root.addEventListener('mousemove', e => {
      for (let i = 0; i < items.length; i++) {
        const r = rects[i];
        if (!r) continue;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d  = Math.hypot(dx, dy);
        if (d > R) { items[i].style.transform = ''; items[i].classList.remove('near','hot'); continue; }
        const f = 1 - d / R;
        items[i].style.transform = `translate(${dx * f * 0.2}px, ${dy * f * 0.2}px) scale(${1 + f * 0.12})`;
        items[i].classList.toggle('near', f > 0.25);
        items[i].classList.toggle('hot',  f > 0.72);
      }
    });
    root.addEventListener('mouseleave', () => {
      items.forEach(i => { i.style.transform = ''; i.classList.remove('near','hot'); });
    });
  })();

  /* ─── 11b · CONTACT DIMENSIONS ─────────────────────────
     The Contact section's device: it dimensions itself, the
     way a part on a drawing is dimensioned. CSS draws the
     rules and arrowheads; this module's only job is the
     numbers — and the numbers are MEASURED, not authored.

     That is the whole point. A dimension label with a made-up
     figure on it is a decoration pretending to be an
     instrument. These read the live element, convert CSS px
     to millimetres at the CSS reference 96dpi, and re-measure
     on resize, so the drawing is never lying about itself.

     Replaces the old cursor char-wave on the email, which was
     the same proximity-lean device the Skills field already
     owns — two sections spending themselves on one idea. */
  (function contactDims() {
    const main = $('#ctMain');
    if (!main) return;

    const MM = 25.4 / 96;              // 1 CSS px in mm
    const targets = [
      [$('#cdimV'), () => $('.ct-head', main).getBoundingClientRect().height],
      [$('#cdimH'), () => $('.ct-head', main).getBoundingClientRect().width],
      [$('#cdimM'), () => $('.ct-mail-t', main).getBoundingClientRect().width]
    ].filter(([el]) => el);

    const label = mm => mm.toFixed(1) + ' MM';

    /* Count from zero to the measured figure, the way a
       digital caliper settles. Only on first reveal — a
       resize re-measure snaps, because an animated number
       during a window drag is noise, not information. */
    function run(animate) {
      for (const [el, measure] of targets) {
        const mm = measure() * MM;
        if (!animate || REDUCED) { el.textContent = label(mm); continue; }
        const dur = 900, t0 = performance.now();
        (function step(now) {
          const p = clamp((now - t0) / dur, 0, 1);
          el.textContent = label(mm * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = label(mm);
        })(t0);
      }
    }

    let shown = false;
    const io = new IntersectionObserver(es => {
      for (const e of es) {
        if (!e.isIntersecting || shown) continue;
        shown = true;
        main.classList.add('in');
        // after the rules have drawn themselves out
        setTimeout(() => run(true), 780);
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(main);

    let rt;
    addEventListener('resize', () => {
      if (!shown) return;
      clearTimeout(rt);
      rt = setTimeout(() => run(false), 160);
    });
  })();

  /* ─── 12 · REVEALS, NAV, MISC ─────────────────────────── */
  const rvSel = '.sheet-head, .fact, .aside-note, .field-row, .ct-copy, .ct-mail, .ct-sched, .ab-pair, .ct-plate';
  const groups = new Map();
  $$(rvSel).forEach(el => {
    el.setAttribute('data-rv', '');
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    el.style.setProperty('--d', (n * 0.06).toFixed(2) + 's');
    groups.set(p, n + 1);
  });

  const rvIO = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      rvIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-rv]').forEach(el => rvIO.observe(el));

  // nav
  const bar = $('#topbar'), menu = $('#tbNav');
  const navA = $$('.tb-nav a'), secs = $$('section[id]');
  const burger = $('#burger');

  function closeMenu() {
    menu.classList.remove('open');
    burger.classList.remove('on');
    burger.setAttribute('aria-expanded', 'false');
    bar.classList.remove('menu-open');
    document.body.classList.remove('lock');
  }

  /* Above the 1180 rung the overlay's rules stop applying and
     the nav goes back to being a row in the bar — but `open`,
     `menu-open` and body.lock are classes, not media queries,
     so they survive the crossing. The visible overlay vanishes
     and the page stays locked: scrolling is dead with nothing
     on screen to explain why. Rotating a tablet with the menu
     open is enough to land in it.

     Declared ahead of the frame callback that calls it, not
     merely ahead of the first rAF tick. */
  const navLive = latch(MQ_NAV, closeMenu);

  onFrame.push(b => {
    // flush with the sheet at rest, floating callout once scrolled
    bar.classList.toggle('float', b.y > 8);
    let cur = '';
    for (const s of secs) if (b.y >= s.offsetTop - innerHeight * 0.4) cur = s.id;
    for (const a of navA) a.classList.toggle('on', a.getAttribute('href') === '#' + cur);
    navLive();          // closes the overlay if the bar has reclaimed the nav
  });

  // an overlay that covers the whole screen needs the key that
  // every other full-screen overlay answers to
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('on', open);
    // below 1180px this button IS the navigation, so its state
    // has to be readable by something other than the eye
    burger.setAttribute('aria-expanded', String(open));
    bar.classList.toggle('menu-open', open);   // frees the fixed overlay
    document.body.classList.toggle('lock', open);
  });
  navA.forEach(a => a.addEventListener('click', closeMenu));

  // The steganography panel's bit-flipper lived here. It drove
  // #artBits, which went when that panel took a real image —
  // and it was a setInterval running forever, on a panel most
  // visitors never scroll past.

  /* ─── 13 · EMAIL LINKS ────────────────────────────────────
     Every email link stays a real `mailto:` in the markup —
     that is the correct href, it survives right-click → copy
     address, and it is what a visitor with a configured mail
     client wants.

     The problem is the machine with NO handler registered for
     the mailto: protocol, which is the default state of a
     fresh Windows install and of most Chrome profiles: the
     click fires, the browser finds nothing to hand it to, and
     absolutely nothing happens. The link looks broken because
     from the visitor's side it is.

     So the click is intercepted and sent to Gmail's web
     compose instead, carrying the same address and subject
     parsed straight off the href — one tab, always opens,
     nothing to configure. If the popup is blocked we fall
     back to the mailto we started with, and if JS never runs
     the plain href is still there. Modified clicks (new tab,
     download, middle click) are left alone. */
  (function mailLinks() {
    const GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1';

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="mailto:"]');
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // "mailto:who@where?subject=x" → address + query, separately
      const raw   = a.getAttribute('href').slice(7);
      const cut   = raw.indexOf('?');
      const to    = decodeURIComponent(cut === -1 ? raw : raw.slice(0, cut));
      const qs    = new URLSearchParams(cut === -1 ? '' : raw.slice(cut + 1));

      let url = GMAIL + '&to=' + encodeURIComponent(to);
      if (qs.get('subject')) url += '&su='   + encodeURIComponent(qs.get('subject'));
      if (qs.get('body'))    url += '&body=' + encodeURIComponent(qs.get('body'));

      const w = window.open(url, '_blank', 'noopener');
      if (w) e.preventDefault();   // blocked → let the mailto through
    });
  })();

  $('#year').textContent = new Date().getFullYear();
  $('#toTop').addEventListener('click', () =>
    scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));

})();
