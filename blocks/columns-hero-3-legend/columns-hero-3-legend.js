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
  const row = block.firstElementChild;
  const cols = [...row.children];
  block.classList.add(`columns-hero-3-legend-${cols.length}-cols`);

  cols.forEach((col) => {
    const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
    const list = col.querySelector('ul, ol');
    // the legend is the list whose items carry icons (pictures/images)
    const listHasImages = !!(list && list.querySelector('picture, img'));

    // legend column: an icon list, no headings
    if (listHasImages && !heading) {
      col.classList.add('columns-hero-3-legend-legend-col');
      return;
    }

    // image/graphic column: pictures only, no headings, no list
    const pics = [...col.querySelectorAll('picture')];
    if (pics.length && !list && !heading) {
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
  });

  // The disclaimer (h6) is authored inside the text column, so when columns
  // stack on mobile it renders before the graphic/legend. Lift it to the row
  // so it can be placed at the very bottom (mobile) / on its own full-width
  // line below the columns (desktop).
  const disclaimer = row.querySelector('h6');
  if (disclaimer) {
    disclaimer.classList.add('columns-hero-3-legend-disclaimer');
    row.append(disclaimer);
  }
}
