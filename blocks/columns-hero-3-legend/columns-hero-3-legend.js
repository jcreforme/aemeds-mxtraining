// pick the best available source URL from an authored <picture>
function bestSrcset(picture) {
  const source = picture.querySelector('source[type="image/webp"][media]')
    || picture.querySelector('source[type="image/webp"]')
    || picture.querySelector('source');
  if (source && source.getAttribute('srcset')) return source.getAttribute('srcset');
  const img = picture.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

// combine an authored desktop + mobile picture into one responsive <picture>
// that swaps at the 900px breakpoint (desktop >= 900px, mobile below).
function buildResponsivePicture(desktopPic, mobilePic) {
  const out = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(min-width: 900px)';
  source.srcset = bestSrcset(desktopPic);
  out.append(source);

  const mobileImg = mobilePic.querySelector('img');
  const img = document.createElement('img');
  img.src = bestSrcset(mobilePic);
  img.alt = mobileImg ? mobileImg.getAttribute('alt') || '' : '';
  img.loading = 'lazy';
  out.append(img);

  return out;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-hero-3-legend-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pics = [...col.querySelectorAll('picture')];
      const list = col.querySelector('ul, ol');
      const hasHeadingOrCopy = col.querySelector('h1, h2, h3, h4, h5, h6, p:not(:empty)');

      // image/graphic column: only pictures, no headings/copy/list
      if (pics.length && !list && !col.querySelector('h1, h2, h3, h4, h5, h6')) {
        col.classList.add('columns-hero-3-legend-img-col');

        // two authored images -> responsive desktop/mobile swap
        if (pics.length >= 2) {
          const responsive = buildResponsivePicture(pics[0], pics[1]);
          const firstWrapper = pics[0].closest('p') || pics[0];
          firstWrapper.replaceWith(responsive);
          pics.slice(1).forEach((p) => {
            const wrapper = p.closest('p');
            (wrapper || p).remove();
          });
        }
      }

      // legend column: only a list, no headings/copy
      if (list && !hasHeadingOrCopy && col.children.length === 1) {
        col.classList.add('columns-hero-3-legend-legend-col');
      }
    });
  });
}
