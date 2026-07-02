export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('cta-card');
    const body = card.firstElementChild;
    if (body) body.classList.add('cta-card-body');
  });
}
