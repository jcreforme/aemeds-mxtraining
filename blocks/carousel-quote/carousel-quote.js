function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-quote');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-quote-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-quote-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-quote-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-quote-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-quote-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-quote-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

// Picks the best available source URL from an authored <picture> or <img>.
function bestSrc(graphic) {
  if (graphic.tagName === 'PICTURE') {
    const source = graphic.querySelector('source[type="image/webp"][media]')
      || graphic.querySelector('source[type="image/webp"]')
      || graphic.querySelector('source');
    if (source && source.getAttribute('srcset')) return source.getAttribute('srcset');
  }
  const img = graphic.tagName === 'IMG' ? graphic : graphic.querySelector('img');
  return img ? img.getAttribute('src') : '';
}

// Combines authored desktop/tablet/mobile graphics into one responsive <picture>
// that swaps at 900px (desktop) and 600px (tablet), falling back to mobile.
// Authored order is desktop, tablet, mobile; a missing size is simply skipped.
function buildResponsiveImage(column) {
  const graphics = [...column.querySelectorAll('picture, img')]
    .filter((el) => !(el.tagName === 'IMG' && el.closest('picture')));
  if (graphics.length < 2) return;

  const [desktop, tablet, mobile] = graphics;
  const smallest = mobile || tablet;
  const out = document.createElement('picture');

  const addSource = (graphic, media) => {
    if (!graphic) return;
    const source = document.createElement('source');
    source.media = media;
    source.srcset = bestSrc(graphic);
    out.append(source);
  };

  addSource(desktop, '(min-width: 900px)');
  addSource(mobile ? tablet : null, '(min-width: 600px)');

  const altSource = graphics.find((g) => {
    const el = g.tagName === 'IMG' ? g : g.querySelector('img');
    return el && el.getAttribute('alt');
  }) || smallest;
  const altImg = altSource.tagName === 'IMG' ? altSource : altSource.querySelector('img');
  const img = document.createElement('img');
  img.src = bestSrc(smallest);
  img.alt = altImg ? altImg.getAttribute('alt') || '' : '';
  img.loading = 'lazy';
  out.append(img);

  graphics.forEach((g) => (g.closest('p') || g).remove());
  column.prepend(out);
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-quote-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-quote-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-quote-slide-${colIdx === 0 ? 'image' : 'content'}`);
    if (colIdx === 0) {
      buildResponsiveImage(column);
    } else {
      const iconInPara = column.querySelector('p .icon');
      if (iconInPara) iconInPara.closest('p').classList.add('quotation');

      const heading = column.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const hr = document.createElement('hr');
        hr.classList.add('red-short-line');
        heading.after(hr);
      }
    }
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-quote-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-quote-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-quote-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-quote-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-quote-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-quote-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
