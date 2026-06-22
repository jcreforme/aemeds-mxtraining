export default function decorate(block) {
  const [imageCell, contentCell] = [...block.firstElementChild.children];

  if (imageCell) {
    imageCell.classList.add('side-effects-image');

    // caption authored as a standalone paragraph
    let caption = [...imageCell.querySelectorAll('p')]
      .find((p) => !p.querySelector('picture, img'));

    // caption authored as text inside the image's own paragraph
    if (!caption) {
      const imgPara = imageCell.querySelector('p:has(picture), p:has(img)');
      const text = imgPara && imgPara.textContent.trim();
      if (imgPara && text) {
        caption = document.createElement('p');
        caption.textContent = text;
        imgPara.after(caption);
        [...imgPara.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .forEach((n) => n.remove());
      }
    }

    if (caption) {
      caption.classList.add('side-effects-caption');
    }
  }

  if (contentCell) {
    contentCell.classList.add('side-effects-content');
  }
}
