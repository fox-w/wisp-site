/* Breez site. Small, dependency-free. Motion is driven by requestAnimationFrame
   and only ever writes transform/opacity (directly or through a --p custom
   property). Under prefers-reduced-motion nothing drifts, scrubs or autoplays. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- ORP: the anchor letter ---------- */
  function orp(word) {
    const lead = (word.match(/^[^\p{L}\p{N}]*/u) || [''])[0].length;
    const core = word.slice(lead).replace(/[^\p{L}\p{N}]+$/u, '').length;
    const i = core <= 1 ? 0 : core <= 5 ? 1 : core <= 9 ? 2 : core <= 13 ? 3 : 4;
    return Math.min(word.length - 1, lead + i);
  }
  function rsvpHTML(word, prev, next) {
    const i = orp(word);
    const pre = (prev ? `<span class="ghost">${esc(prev)}</span> ` : '') + esc(word.slice(0, i));
    const post = esc(word.slice(i + 1)) + (next ? ` <span class="ghost next">${esc(next)}</span>` : '');
    return `<span class="pre">${pre}</span><span class="a">${esc(word[i])}</span><span class="post">${post}</span>`;
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  let navOn = false;

  /* ---------- Reveal on view ---------- */
  const rvObs = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el) => rvObs.observe(el));

  /* ---------- Sky: the mist changes with the section you are in ---------- */
  const layers = {};
  $$('[data-sky-layer]').forEach((l) => (layers[l.dataset.skyLayer] = l));
  let skyNow = 'dawn';
  const skyObs = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const k = e.target.dataset.sky;
      if (k === skyNow || !layers[k]) continue;
      layers[skyNow].classList.remove('on');
      layers[k].classList.add('on');
      skyNow = k;
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('[data-sky]').forEach((s) => skyObs.observe(s));

  /* ---------- The wall: split into words that can drift away ---------- */
  const wallPage = $('#wall-page');
  let keepA = null;
  if (wallPage) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const p of $$('p', wallPage)) {
      const parts = p.textContent.split(/\s+/).filter(Boolean);
      p.innerHTML = parts.map((w) => {
        if (w.startsWith('{')) {
          const word = w.replace(/[{}]/g, '');
          const i = orp(word);
          return `<span data-keep>${esc(word.slice(0, i))}<span data-a>${esc(word[i])}</span>${esc(word.slice(i + 1))}</span>`;
        }
        const dl = (0.25 + rnd() * 0.65).toFixed(3);
        const dx = ((rnd() - 0.5) * 120).toFixed(1);
        const dy = (-40 - rnd() * 140).toFixed(1);
        const r = ((rnd() - 0.5) * 16).toFixed(1);
        return `<span class="ww" style="--dl:${dl};--dx:${dx};--dy:${dy};--r:${r}">${esc(w)}</span>`;
      }).join(' ');
    }
    keepA = $('[data-a]', wallPage);
  }
  const keep = $('.kw');
  function measureKeep() {
    if (!keepA || !keep) return;
    const pin = keep.parentElement.getBoundingClientRect();
    const a = keepA.getBoundingClientRect();
    const kr = $('.rsvp', keep);
    const ks = parseFloat(getComputedStyle(wallPage).fontSize) / parseFloat(getComputedStyle(kr).fontSize);
    keep.style.setProperty('--kx', (a.left + a.width / 2 - (pin.left + pin.width / 2)).toFixed(1));
    keep.style.setProperty('--ky', (a.top + a.height / 2 - (pin.top + pin.height / 2)).toFixed(1));
    keep.style.setProperty('--ks', ks.toFixed(4));
  }

  /* ---------- Statement: one word lights at a time ---------- */
  for (const el of $$('[data-lit]')) {
    const words = el.textContent.trim().split(/\s+/);
    el.style.setProperty('--n', words.length);
    el.innerHTML = words.map((w, i) => `<span class="lw" style="--i:${i}">${esc(w)}</span>`).join(' ');
  }

  /* ---------- Scroll scenes ---------- */
  const scenes = $$('[data-scene]');
  let vh = innerHeight;
  let ticking = false;
  function frame() {
    ticking = false;
    const y = scrollY;
    if ((y > 24) !== navOn) { navOn = y > 24; nav.classList.toggle('scrolled', navOn); }
    if (reduce.matches) return;
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      const sticky = s.firstElementChild && s.firstElementChild.classList.contains('pin');
      const p = sticky ? clamp(-r.top / Math.max(1, r.height - vh), 0, 1) : clamp((vh - r.top) / (vh * 0.85), 0, 1);
      s.style.setProperty('--p', p.toFixed(4));
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { vh = innerHeight; measureKeep(); onScroll(); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { measureKeep(); onScroll(); });
  measureKeep();
  frame();

  /* ---------- How it works: the phone follows the step you are reading ---------- */
  const shots = $$('.how-phone .shot');
  const steps = $$('.step');
  const stepObs = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const n = +e.target.dataset.step;
      steps.forEach((s, i) => s.classList.toggle('on', i === n));
      shots.forEach((s, i) => s.classList.toggle('on', i === n));
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => stepObs.observe(s));
  // Load the phone's later screens once the section is near, so the swap is instant.
  const how = $('#how');
  if (how) new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { $$('.how-phone img').forEach((i) => (i.loading = 'eager')); o.disconnect(); }
  }, { rootMargin: '600px' }).observe(how);

  /* ---------- The live reader ---------- */
  const stage = $('#demo');
  if (stage) {
    const TEXT = 'This is Breez. One word at a time, always in the same place. Your eyes can rest. The reading comes to you. Long words linger a little longer. Every sentence ends with a small breath. Tap the word to pause, and the page opens around it. There is no wrong speed. Find the pace that is yours, and let the page go quiet.';
    const words = TEXT.split(/\s+/);
    const screen = $('#demo-screen');
    const lay = $$('.rsvp', screen);
    const bar = $('.progress', screen);
    const page = $('#demo-page');
    const playBtn = $('#demo-play');
    const hint = $('#demo-hint');
    const status = $('#demo-status');
    let wpm = 240, idx = 0, cur = 0, playing = false, visible = true, since = 0, raf = 0;

    page.innerHTML = words.map((w, i) => `<button type="button" data-i="${i}" tabindex="-1">${esc(w)}</button>`).join(' ');
    const pageWords = $$('button', page);

    function dur(w) {
      const base = 60000 / wpm;
      const core = w.replace(/[^\p{L}\p{N}]/gu, '').length;
      let m = core > 7 ? 1 + Math.min(0.6, (core - 7) * 0.1) : 1;
      if (/[.!?]["”’)]?$/.test(w)) m += 1.3;
      else if (/[,;:]["”’)]?$/.test(w)) m += 0.5;
      return base * m;
    }
    function show(i) {
      const next = lay[1 - cur];
      next.innerHTML = rsvpHTML(words[i], words[i - 1] || '', words[i + 1] || '');
      next.classList.remove('hide', 'out');
      lay[cur].classList.add('out');
      cur = 1 - cur;
      bar.style.transform = `scaleX(${((i + 1) / words.length).toFixed(4)})`;
    }
    function loop(t) {
      raf = 0;
      if (!playing || !visible) return;
      if (!since) since = t;
      const last = idx === words.length - 1;
      if (t - since >= dur(words[idx]) + (last ? 1800 : 0)) {
        idx = last ? 0 : idx + 1;
        since = t;
        show(idx);
      }
      raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf && playing && visible) raf = requestAnimationFrame(loop); };

    function openPage() {
      pageWords.forEach((b, i) => { b.classList.toggle('cur', i === idx); b.tabIndex = 0; });
      const c = pageWords[idx];
      page.scrollTop = Math.max(0, c.offsetTop - page.clientHeight / 2);
    }
    function setPlaying(on, userAction, withPage = true) {
      playing = on;
      stage.classList.toggle('stopped', !on);
      stage.classList.toggle('paused', !on && withPage);
      playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      hint.textContent = on ? 'Tap the word to pause. The page opens around it.' : withPage ? 'Tap any word to read on from there.' : 'Press play to read a short passage.';
      if (!on && withPage) openPage();
      if (on) { pageWords.forEach((b) => (b.tabIndex = -1)); since = 0; show(idx); kick(); }
      if (userAction) status.textContent = on ? 'Reading.' : 'Paused.';
    }
    const toggle = () => setPlaying(!playing, true);
    screen.addEventListener('click', toggle);
    screen.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idx = Math.max(0, idx - 5); show(idx); }
    });
    playBtn.addEventListener('click', toggle);
    page.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      idx = +b.dataset.i;
      setPlaying(true, true);
      screen.focus({ preventScroll: true });
    });
    $$('input[name="pace"]').forEach((r) => r.addEventListener('change', () => { wpm = +r.value; }));

    new IntersectionObserver((es) => { visible = es[0].isIntersecting && !document.hidden; kick(); }).observe(stage);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; kick(); });

    // Autoplay only when motion is welcome, and only after the hero has settled.
    if (reduce.matches) setPlaying(false, false, false);
    else { stage.classList.add('stopped'); setTimeout(() => setPlaying(true, false), 1900); }
  }

  /* ---------- Fit your eyes ---------- */
  const spec = $('#spec');
  if (spec) {
    $$('input[name="font"]', spec).forEach((r) => r.addEventListener('change', () => (spec.dataset.font = r.value)));
    $$('input[name="anchor"]', spec).forEach((r) => r.addEventListener('change', () => (spec.dataset.anchor = r.value)));
  }

  /* ---------- Paper and Paper Night ---------- */
  const nd = $('#nd');
  if (nd) {
    const range = $('input', nd);
    const set = (v) => { v = clamp(v, 4, 96); nd.style.setProperty('--split', v + '%'); range.value = Math.round(v); };
    range.addEventListener('input', () => set(+range.value));
    let drag = false;
    const at = (e) => { const r = nd.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    nd.addEventListener('pointerdown', (e) => { drag = true; nd.setPointerCapture(e.pointerId); at(e); });
    nd.addEventListener('pointermove', (e) => { if (drag) at(e); });
    nd.addEventListener('pointerup', () => (drag = false));
    nd.addEventListener('pointercancel', () => (drag = false));
    // A slow first breath so people see it can move.
    if (!reduce.matches) {
      const io = new IntersectionObserver((es, o) => {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        const t0 = performance.now();
        const step = (t) => {
          if (drag) return;
          const k = Math.min(1, (t - t0) / 2600);
          set(50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k));
          if (k < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 500);
      }, { threshold: 0.6 });
      io.observe(nd);
    }
  }
})();
