# breezreader.com: design notes

The site is built on the brand brief "Air": **the reading comes to you.** Paper ground, ink text,
coral as the one accent (the anchor letter and the tick in the mark), dawn mist (rose, peach,
lilac, sky) as atmosphere only. Atkinson Hyperlegible Bold for headlines and the reading word,
Literata upright for editorial lines. No italics, no all caps, sentence case, no em dashes, no
speed or comprehension promises, never implying the reader has a condition.

Static HTML, one CSS file, one small script (no framework, no build step). Fonts are the
latin subsets from @fontsource, self-hosted and preloaded. Screens are the App Store raw
captures, served as AVIF with a WebP fallback.

## What we studied

- **Apple product pages** (AirPods Pro, iPhone): sticky, scroll-paced storytelling; one oversized
  statement per beat; product shown as the real thing, never an illustration.
- **Linear**: restraint; oversized type against a quiet ground; the real interface as the hero.
- **Readwise Reader**: an honest product page for readers: what it opens, what it costs, a plain FAQ.
- **Awwwards 2026 Sites of the Day** (By-Kin, Mat Voyce, Uncommon Studio, Iventions): "transitions
  that never call attention to themselves"; kinetic type tuned so it never blocks reading; WebGL
  used for atmosphere rather than spectacle; 60fps with a functional fallback scores highest.
- **Arc and Things**: a product demo in the first seconds; calm, confident, confined colour.
- **CSS scroll-driven animation guides (2026)**: animate only transform and opacity, do not add
  `will-change` everywhere, always ship a `prefers-reduced-motion` version.

Sources: apple.com/airpods-pro, linear.app, readwise.io/read, hontran.dev/blog/best-award-winning-websites-2026,
awwwards.com/inspiration/scroll-driven-storytelling-synapser-studio,
cssawwwards.com/blog/css-scroll-driven-animations-guide-2026.

## Techniques used

1. **The product is the hero.** A live one-word reader sits under the headline and starts reading
   on its own: the anchor letter in coral never moves, words crossfade with no blank frame, the
   next word waits blurred to the right, the last one fades to the left. Tap to pause and the
   passage opens around your word; choose any word to read on from there. Three paces.
2. **The mark draws itself.** The two bands are revealed left to right with a clip-path, the mist
   band a beat later, then the coral tick settles on top: the anchor arriving.
3. **Headline words arrive out of haze**, one at a time (blur and opacity), the brand's "words
   arrive and settle" motion.
4. **Scroll-scrubbed scene: the wall comes down.** A sticky, full-screen page of Alice. As you
   scroll, every word drifts up and away like mist, on its own seeded path, until one word is
   left. It glides to the centre, grows, its anchor turns coral and the ticks appear. Captions
   crossfade: "A page can feel like a wall." then "Breez takes it down."
5. **Sticky product walkthrough.** The phone stays pinned while three short steps scroll past it;
   the screen crossfades to match the step you are reading (Apple's pattern). On phones it
   becomes a simple stack.
6. **Statement lit word by word.** "You were never bad at reading. The page was bad at you." lights
   one word at a time as you scroll: reading, performed by the page itself.
7. **A sky that moves through the day.** A fixed layer of soft mist blobs drifts slowly
   (40 to 60 second loops); each section names its light (dawn, morning, noon, dusk) and the
   layers crossfade as you pass. Opacity and transform only, so it stays on the compositor.
8. **Hands-on specimens.** Try the letters (Atkinson Hyperlegible, OpenDyslexic, Lexend, Literata)
   and anchor colours on a live word; drag between Paper and Paper Night on a split word.
   OpenDyslexic only downloads if someone chooses it.
9. **Gentle reveals.** Sections rise 28px out of a light blur as they enter, staggered by a tenth
   of a second, never bouncing.
10. **Parallax peeks.** Phones in the feature tiles rise into their cards as the tile scrolls in.
11. **Film grain.** A 5% noise layer takes the digital flatness off the paper.
12. **Honest Pro.** "The reader stays free" leads; what is free is listed before what Pro adds; no
    prices on the site because the App Store shows them.

## Motion rules

- Everything is `transform` or `opacity` driven by one `requestAnimationFrame` pass that writes a
  single `--p` custom property per scene; CSS does the rest.
- The reader demo pauses when it scrolls out of view or the tab is hidden.
- `prefers-reduced-motion: reduce`: nothing drifts, scrubs or autoplays. The wall scene becomes a
  still composition with the kept word, the statement is fully lit, reveals are instant, and the
  reader waits for Play.

## Checks before shipping

Headless Playwright (Chromium and WebKit) at 375, 402, 440, 1280, 1440 and 1920, light and dark,
plus reduced motion; no horizontal scroll at any width; Lighthouse 95+ on performance,
accessibility, best practices and SEO for all three pages.

## Open decisions

- Swap the "Coming soon to the App Store" pill for Apple's official badge and the real link once
  the listing is live (Apple's badge may not be altered, which is why the pill is our own).
- The contact address is still wispreader@outlook.com until a Breez address exists.
