/**
 * Video Block
 *
 * Embeds a video (YouTube, Vimeo, or directly hosted MP4) with an optional
 * poster image and an expandable transcript drawer, replicating the video +
 * "Open transcript" pattern from vyepti.com (e.g. /why-iv-treatment).
 *
 * Authoring contract — one column, one cell per row (order flexible):
 * ┌─────────────────────────────────────────────┐
 * │ video                                       │
 * ├─────────────────────────────────────────────┤
 * │ [poster image]                   (optional) │
 * ├─────────────────────────────────────────────┤
 * │ https://youtu.be/…  (link or plain URL)     │
 * ├─────────────────────────────────────────────┤
 * │ Transcript:                      (optional) │
 * │ 0:08 VYEPTI is different. …                 │
 * └─────────────────────────────────────────────┘
 *
 * Loading strategy (performance):
 *   - With a poster: only the image loads at decoration time; the third-party
 *     player is injected inline on the play click and autoplays (the click is
 *     the user gesture, so autoplay is permitted).
 *   - Without a poster: the player is injected when the block scrolls near
 *     the viewport (IntersectionObserver), without autoplay.
 */

const TOGGLE_LABEL_OPEN = 'Open transcript';
const TOGGLE_LABEL_CLOSE = 'Close transcript';

/** Unique id source for aria-controls wiring (multiple blocks per page). */
let blockCount = 0;

/* ─── Video URL handling ─────────────────────────────────────────────────── */

/**
 * Classify a video URL.
 * @param {URL} url
 * @returns {'youtube'|'vimeo'|'file'|null}
 */
function getVideoKind(url) {
  if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname) || url.hostname === 'youtu.be') return 'youtube';
  if (/(^|\.)vimeo\.com$/.test(url.hostname)) return 'vimeo';
  if (/\.(mp4|webm|m3u8)$/i.test(url.pathname)) return 'file';
  return null;
}

/** Extract the YouTube video id from watch/short/embed URL forms. */
function getYouTubeId(url) {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
  if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
    return url.pathname.split('/')[2];
  }
  return url.searchParams.get('v');
}

function createIframe(src, title) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
  iframe.setAttribute('allowfullscreen', '');
  return iframe;
}

/**
 * Build the player element for a video URL.
 * @param {URL} url the video URL
 * @param {string} title accessible title for the player
 * @param {boolean} autoplay start playback immediately (only used after a
 *   user gesture, so unmuted autoplay is permitted)
 * @returns {Element|null}
 */
function buildPlayer(url, title, autoplay) {
  const kind = getVideoKind(url);
  if (kind === 'youtube') {
    const id = getYouTubeId(url);
    if (!id) return null;
    const params = `rel=0${autoplay ? '&autoplay=1&playsinline=1' : ''}`;
    return createIframe(`https://www.youtube-nocookie.com/embed/${id}?${params}`, title);
  }
  if (kind === 'vimeo') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (!id) return null;
    return createIframe(`https://player.vimeo.com/video/${id}?dnt=1${autoplay ? '&autoplay=1' : ''}`, title);
  }
  if (kind === 'file') {
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (autoplay) video.autoplay = true;
    video.setAttribute('aria-label', title);
    const source = document.createElement('source');
    source.src = url.href;
    video.append(source);
    return video;
  }
  return null;
}

/**
 * Replace the poster/placeholder with the real player.
 * @param {Element} frame the .video-frame container
 * @param {URL} url
 * @param {string} title
 * @param {boolean} autoplay
 */
function loadPlayer(frame, url, title, autoplay) {
  if (frame.dataset.embedLoaded === 'true') return;
  const player = buildPlayer(url, title, autoplay);
  if (!player) return;
  frame.dataset.embedLoaded = 'true';
  frame.replaceChildren(player);
  if (autoplay && player.tagName === 'VIDEO') player.play();
  if (autoplay) player.focus();
}

/* ─── Transcript drawer ──────────────────────────────────────────────────── */

/**
 * Build the collapsible transcript drawer with an accessible toggle.
 * Expand/collapse animates via CSS grid-template-rows (0fr → 1fr).
 * @param {Element[]} content transcript child elements
 * @param {string} drawerId unique id for aria-controls
 * @returns {Element}
 */
function buildTranscript(content, drawerId) {
  const container = document.createElement('div');
  container.className = 'video-transcript';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'video-transcript-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', drawerId);
  const label = document.createElement('span');
  label.className = 'video-transcript-label';
  label.textContent = TOGGLE_LABEL_OPEN;
  toggle.append(label);

  const drawer = document.createElement('div');
  drawer.className = 'video-transcript-drawer';
  drawer.id = drawerId;
  drawer.setAttribute('role', 'region');
  drawer.setAttribute('aria-label', 'Video transcript');

  const inner = document.createElement('div');
  inner.className = 'video-transcript-content';
  inner.append(...content);
  drawer.append(inner);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    label.textContent = expanded ? TOGGLE_LABEL_OPEN : TOGGLE_LABEL_CLOSE;
  });

  container.append(toggle, drawer);
  return container;
}

/* ─── Content parsing ────────────────────────────────────────────────────── */

/**
 * Pull poster, video URL, and transcript out of the authored rows.
 * Rows can be authored in any order; each is identified by content:
 * a <picture> is the poster, a video link/URL is the source, and any other
 * non-empty cell is the transcript.
 * @param {Element} block
 * @returns {{ poster: Element|null, url: URL|null, transcript: Element[] }}
 */
function parseContent(block) {
  let poster = null;
  let url = null;
  const transcript = [];

  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!poster && cell.querySelector('picture')) {
      poster = cell.querySelector('picture');
      return;
    }
    if (!url) {
      const link = cell.querySelector('a[href]');
      const candidate = link ? link.href : cell.textContent.trim();
      try {
        const parsed = new URL(candidate, window.location.href);
        if (getVideoKind(parsed)) {
          url = parsed;
          return;
        }
      } catch {
        /* not a URL — fall through to transcript */
      }
    }
    if (cell.textContent.trim()) transcript.push(...cell.children);
  });

  // drop a standalone "Transcript:" label — the toggle already says it
  if (transcript.length && /^transcript:?$/i.test(transcript[0].textContent.trim())) {
    transcript.shift();
  }

  return { poster, url, transcript };
}

/**
 * Find an accessible title for the player: the closest heading above the
 * block within its section (so each video in a multi-video section gets its
 * own heading), falling back to a generic label.
 * @param {Element} block
 * @returns {string}
 */
function getVideoTitle(block) {
  const wrapper = block.closest('.section > div') || block;
  for (let el = wrapper.previousElementSibling; el; el = el.previousElementSibling) {
    if (/^H[1-4]$/.test(el.tagName)) return el.textContent.trim();
    const headings = el.querySelectorAll('h1, h2, h3, h4');
    if (headings.length) return headings[headings.length - 1].textContent.trim();
  }
  return 'Video player';
}

/* ─── Block entry point ──────────────────────────────────────────────────── */

/**
 * Loads and decorates the video block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { poster, url, transcript } = parseContent(block);
  if (!url) {
    // nothing playable — remove the block rather than leave broken markup
    block.remove();
    return;
  }

  blockCount += 1;
  const title = getVideoTitle(block);

  const frame = document.createElement('div');
  frame.className = 'video-frame';

  if (poster) {
    // poster + play overlay; the third-party player loads only on click
    frame.append(poster);
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'video-play';
    play.setAttribute('aria-label', `Play video: ${title}`);
    play.addEventListener('click', () => loadPlayer(frame, url, title, true));
    frame.append(play);
  } else if ('IntersectionObserver' in window) {
    // no poster — embed (without autoplay) as the block nears the viewport
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadPlayer(frame, url, title, false);
      }
    }, { rootMargin: '200px' });
    observer.observe(block);
  } else {
    loadPlayer(frame, url, title, false);
  }

  block.replaceChildren(frame);

  if (transcript.length) {
    block.append(buildTranscript(transcript, `video-transcript-${blockCount}`));
  }
}
