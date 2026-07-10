# Video Block — Embedded Video + Transcript Drawer

Embeds a video (YouTube, Vimeo, or a directly hosted MP4/WebM file) in a fluid 16:9 player with an optional poster image and an expandable **transcript drawer**, replicating the video pattern on vyepti.com (reference: [/why-iv-treatment](https://www.vyepti.com/why-iv-treatment)).

---

## Developer Notes

### Loading strategy — inline embed, deferred until needed

Third-party players (YouTube/Vimeo) are heavy, so the block never loads one at page-decoration time:

- **With a poster** (the recommended authoring pattern): only the optimized poster image renders initially, behind a teal play button overlay. Clicking play swaps the poster for the real player **inline** and autoplays. Because the click is a user gesture, unmuted autoplay is permitted by browsers — no mute workaround needed.
- **Without a poster**: an `IntersectionObserver` (200px root margin) injects the player as the block approaches the viewport, without autoplay.

An inline embed was chosen over a modal: the source site plays in place, it needs no focus-trap machinery, and it keeps the transcript visible directly under the playing video.

URL classification lives in `getVideoKind()` — YouTube (`youtube.com`, `youtu.be`, `youtube-nocookie.com`), Vimeo, and file URLs ending `.mp4`/`.webm`/`.m3u8`. YouTube embeds use the privacy-enhanced `youtube-nocookie.com` host with `rel=0`; Vimeo gets `dnt=1`. MP4s render in a native `<video controls playsinline>` element.

### Transcript drawer

- The toggle is a real `<button>` with `aria-expanded` and `aria-controls` pointing at the drawer region (`role="region"`, `aria-label="Video transcript"`). Ids are unique per block instance, so multiple videos per page work.
- Labels are the source site's ("Open transcript" / "Close transcript") — constants at the top of `video.js`.
- The animation uses the modern grid technique — `grid-template-rows: 0fr → 1fr` with `overflow: hidden; min-height: 0` on the inner wrapper — so the drawer animates smoothly to its natural content height with no hardcoded `max-height` and no layout shift. Disabled under `prefers-reduced-motion`.

### Accessibility

- Play overlay: `aria-label="Play video: <nearest section heading>"`, `:focus-visible` ring, and focus moves into the player after it loads.
- The `<iframe>` gets a `title`; native `<video>` gets an `aria-label`.

### Brand values (extracted from the vyepti.com clientlib)

| Element | Value | Source rule |
|---------|-------|-------------|
| Play button | `#046183` circle, white triangle, hover `#7ebcc6` | `.vjs-big-play-button { background-color: #046183 }` |
| Transcript card | `border: 1px solid #e0e0e0`, `border-radius: 12px`, white | `.video-transcript` |
| Toggle icon | 22px circled +/− | `expand-22-desktop.svg` / `collapse-22-desktop.svg` |
| Body text | `#484848`, 16px/24px | `.transcriptparagraph` |
| Desktop width | ~67% of the content grid (810px), centered | `.video-transcript { width: 67% }` |

---

## Authoring Guide (Word / Google Docs)

Create a one-column table named **Video**. Rows can be in any order — the block recognizes each by its content — but the conventional order is:

| Video |
|-------|
| *poster image* |
| `https://www.youtube.com/watch?v=XXXXXXX` |
| **Transcript:**<br>0:08 VYEPTI is different.<br>0:13 VYEPTI is the first and only FDA-approved… |

- **Poster image** *(optional, recommended)* — pasted directly into the cell. It becomes the video thumbnail with a play button; the video itself only loads when the visitor clicks, which keeps pages fast. Give the image meaningful alt text.
- **Video URL** *(required)* — a link or plain URL to:
  - a YouTube video (`youtube.com/watch?v=…`, `youtu.be/…`, or an embed/Shorts URL),
  - a Vimeo video (`vimeo.com/…`), or
  - an MP4/WebM file hosted on this site or a CDN.
- **Transcript** *(optional)* — everything else in the table becomes the drawer content. A leading line saying only "Transcript:" is removed automatically (the toggle button already says it). Use one paragraph per caption, optionally starting with a timestamp (`0:08 …`), matching the source site's format. Bold, links, and lists are preserved.

If the transcript row is omitted, only the player renders. If the video URL is missing or unrecognized, the block removes itself rather than showing broken markup.

### Placement

Place the Video table in its own section or alongside text — on desktop it centers itself at ~67% of the content width, matching the original site's layout.

---

## Visual QA Checklist

- [ ] `.video-frame` — `aspect-ratio: 16 / 9`, `border-radius: 12px`, black letterbox background, poster `object-fit: cover`
- [ ] `.video-play` — 56px (mobile) / 72px (desktop ≥900px) circle, background `#046183`, hover/focus `#7ebcc6` with 1.08 scale, white `:focus-visible` outline
- [ ] `.video-transcript` — `1px solid #e0e0e0` border, `12px` radius, white background, 20px top margin
- [ ] Toggle — teal `#046183` 16px/700 text with 22px circled `+`; flips to `−` and "Close transcript" when open
- [ ] Drawer animates via `grid-template-rows` `0fr → 1fr` (0.3s ease-in-out); instant under reduced motion
- [ ] `aria-expanded` flips on the toggle; `aria-controls` matches the drawer id
- [ ] Desktop ≥900px — block capped at 810px and centered; transcript width matches the player exactly
- [ ] Long transcript words wrap (`overflow-wrap: break-word`) — no horizontal overflow on 375px viewports
