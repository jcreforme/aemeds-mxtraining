import { decorateIcons } from '../../scripts/aem.js';

const INPUT_TYPES = ['multiselect', 'singleselect', 'text', 'textarea', 'email', 'tel', 'name'];

/** Creates an element with optional class and text. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Slugifies a string for use as an id/name. */
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

/** Reads the keyword (first cell) of a block row. */
function rowKeyword(row) {
  return (row.children[0]?.textContent || '').trim().toLowerCase();
}

/**
 * Substitutes the `{name}` token in a template.
 * When the name is empty, the token (plus a trailing `'s`, `...` or `…`) is
 * removed and the first remaining letter is capitalized so the text still reads.
 */
function applyName(tmpl, name) {
  if (!tmpl) return tmpl;
  if (name) return tmpl.replaceAll('{name}', name);
  const stripped = tmpl.replace(/\{name\}(?:'s|\.\.\.|…)?\s*/g, '').trim();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

/**
 * Parses the authored table into a structured guide model.
 *
 * Row keywords (first cell):
 *   title          | (optional) fallback title for step 1's header
 *   step           | col2 = step/header title (supports {name}); starts a new step
 *   question       | col2 = body heading (optional), col3 = help text, col4 = input type
 *   option         | col2 = label, col3 = icon name/token
 *   submit         | col2 = finish button label, col3 = optional POST endpoint
 *   results-heading| col2 = text in the results header bar
 *   results-title  | col2 = results title template (supports {name})
 *   results-note   | col2 = italic note under the action buttons
 *   cta            | col2 = "talk to your doctor" heading
 *   tips-heading   | col2 = heading above the tips list
 *   tip            | col2 = one tip bullet (markup preserved)
 */
function parseGuide(block) {
  const guide = {
    title: '',
    steps: [],
    submitLabel: 'Finish',
    action: '',
    resultsHeading: 'Results',
    resultsTitle: "{name}'s personalized migraine discussion guide",
    resultsNote: 'Note: If you navigate away from this screen before downloading, you will lose your results.',
    cta: 'Talk to your doctor and see if VYEPTI might be right for you',
    tipsHeading: '',
    tips: [],
  };
  let currentStep = null;
  let currentQuestion = null;
  let qIndex = 0;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const keyword = rowKeyword(row);
    const c2 = cells[1]?.textContent?.trim() || '';
    const c3cell = cells[2];
    const c3 = c3cell?.textContent?.trim() || '';
    const c4 = cells[3]?.textContent?.trim().toLowerCase() || '';

    if (keyword === 'title') {
      guide.title = c2;
    } else if (keyword === 'submit') {
      guide.submitLabel = c2 || 'Finish';
      guide.action = c3;
    } else if (keyword === 'results-heading') {
      guide.resultsHeading = c2 || guide.resultsHeading;
    } else if (keyword === 'results-title') {
      guide.resultsTitle = c2 || guide.resultsTitle;
    } else if (keyword === 'results-note') {
      guide.resultsNote = c2;
    } else if (keyword === 'cta') {
      guide.cta = c2;
    } else if (keyword === 'tips-heading') {
      guide.tipsHeading = c2;
    } else if (keyword === 'tip') {
      guide.tips.push(cells[1] ? cells[1].innerHTML : c2);
    } else if (keyword === 'step') {
      currentStep = { title: c2, questions: [] };
      guide.steps.push(currentStep);
      currentQuestion = null;
    } else if (keyword === 'question') {
      if (!currentStep) {
        currentStep = { title: '', questions: [] };
        guide.steps.push(currentStep);
      }
      const type = INPUT_TYPES.includes(c4) ? c4 : 'multiselect';
      qIndex += 1;
      currentQuestion = {
        heading: c2,
        help: c3cell ? c3cell.innerHTML : '',
        helpText: c3,
        type,
        isName: type === 'name',
        options: [],
        id: `dg-q${qIndex}-${slugify(c2) || slugify(currentStep.title) || qIndex}`,
        summaryLabel: c2 || currentStep.title,
      };
      currentStep.questions.push(currentQuestion);
    } else if (keyword === 'option' && currentQuestion) {
      const iconSpan = c3cell?.querySelector('span[class*="icon-"]');
      const iconName = iconSpan
        ? (Array.from(iconSpan.classList).find((c) => c.startsWith('icon-')) || '').slice(5)
        : slugify(c3);
      currentQuestion.options.push({ label: c2, icon: iconName });
    }
  });

  return guide;
}

/** Builds a selectable answer card (checkbox or radio) with optional icon. */
function buildOptionCard(question, option, index) {
  const multi = question.type === 'multiselect';
  const optId = `${question.id}-${slugify(option.label) || index}`;
  const label = el('label', 'dg-option');
  label.htmlFor = optId;

  const input = document.createElement('input');
  input.type = multi ? 'checkbox' : 'radio';
  input.id = optId;
  input.name = question.id;
  input.value = option.label;

  const iconWrap = el('span', 'dg-option-icon');
  if (option.icon) iconWrap.append(el('span', `icon icon-${option.icon}`));

  const marker = el('span', 'dg-option-marker');
  marker.setAttribute('aria-hidden', 'true');

  label.append(input, iconWrap, el('span', 'dg-option-label', option.label), marker);
  return label;
}

/** Builds the DOM for a single question. */
function buildQuestion(question) {
  const wrap = el('div', `dg-question dg-question-${question.type}`);

  if (question.heading) wrap.append(el('h3', 'dg-question-heading', question.heading));
  if (question.helpText) {
    const help = el('div', 'dg-question-help');
    help.innerHTML = question.help;
    wrap.append(help);
  }

  if (question.type === 'multiselect' || question.type === 'singleselect') {
    const group = el('div', 'dg-options');
    group.setAttribute('role', question.type === 'multiselect' ? 'group' : 'radiogroup');
    if (question.summaryLabel) group.setAttribute('aria-label', question.summaryLabel);
    question.options.forEach((opt, i) => group.append(buildOptionCard(question, opt, i)));
    wrap.append(group);
  } else {
    let input;
    if (question.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 4;
    } else {
      input = document.createElement('input');
      input.type = question.isName ? 'text' : question.type;
    }
    input.id = question.id;
    input.name = question.id;
    input.className = 'dg-input';
    if (question.type === 'email') input.autocomplete = 'email';
    if (question.type === 'tel') input.autocomplete = 'tel';
    if (question.summaryLabel) input.setAttribute('aria-label', question.summaryLabel);
    wrap.append(input);
  }

  return wrap;
}

/** Collects the current answers (excluding the name field). */
function collectAnswers(form, guide, name) {
  const answers = [];
  guide.steps.forEach((step) => {
    step.questions.forEach((q) => {
      if (q.isName) return;
      let val;
      if (q.type === 'multiselect' || q.type === 'singleselect') {
        val = [...form.querySelectorAll(`input[name="${q.id}"]:checked`)].map((e) => e.value).join(', ');
      } else {
        val = form.querySelector(`[name="${q.id}"]`)?.value?.trim() || '';
      }
      if (val) answers.push({ label: applyName(q.summaryLabel, name), answer: val });
    });
  });
  return answers;
}

/** Builds the results view from the collected answers. */
function buildResults(guide, answers, name, onRetake) {
  const view = el('div', 'dg-results');

  const header = el('div', 'dg-header dg-header-results');
  header.append(el('h2', 'dg-title', guide.resultsHeading));
  view.append(header);

  const body = el('div', 'dg-results-body');
  body.append(el('h3', 'dg-results-title', applyName(guide.resultsTitle, name)));

  const list = el('ol', 'dg-results-list');
  answers.forEach(({ label, answer }) => {
    const li = el('li');
    li.append(el('span', 'dg-results-q', label));
    const ans = el('p', 'dg-results-a');
    ans.append(el('strong', undefined, 'Your Answer: '), el('span', 'dg-answer', answer));
    li.append(ans);
    list.append(li);
  });
  body.append(list);

  body.append(el('p', 'dg-actions-label', 'Download or email doctor discussion guide.'));

  const actions = el('div', 'dg-actions');
  const download = el('button', 'button primary dg-download');
  download.type = 'button';
  download.append(el('span', undefined, 'Download'), el('span', 'icon icon-download-18'));
  download.addEventListener('click', () => window.print());

  const emailBody = answers.map((a, i) => `${i + 1}. ${a.label}\n   ${a.answer}`).join('\n\n');
  const email = document.createElement('a');
  email.className = 'button primary dg-email';
  email.href = `mailto:?subject=${encodeURIComponent('My Doctor Discussion Guide')}&body=${encodeURIComponent(emailBody)}`;
  email.append(el('span', undefined, 'Email'), el('span', 'icon icon-email'));

  actions.append(download, email);
  body.append(actions);

  if (guide.resultsNote) {
    const note = el('p', 'dg-note');
    note.append(el('em', undefined, guide.resultsNote));
    body.append(note);
  }

  body.append(el('hr'));
  const ctaRow = el('div', 'dg-cta');
  if (guide.cta) ctaRow.append(el('h3', 'dg-cta-heading', guide.cta));
  const retake = el('button', 'dg-retake');
  retake.type = 'button';
  retake.append(el('span', undefined, 'Retake'), el('span', 'icon icon-arrow'));
  retake.addEventListener('click', onRetake);
  ctaRow.append(retake);
  body.append(ctaRow);

  if (guide.tips.length) {
    body.append(el('hr'));
    if (guide.tipsHeading) body.append(el('p', 'dg-tips-heading', guide.tipsHeading));
    const tips = el('ul', 'dg-tips');
    guide.tips.forEach((tip) => {
      const li = el('li');
      li.innerHTML = tip;
      tips.append(li);
    });
    body.append(tips);
  }

  view.append(body);
  return view;
}

/**
 * Loads and decorates the discussion guide block.
 * @param {Element} block
 */
export default function decorate(block) {
  const guide = parseGuide(block);
  if (!guide.steps.length) return;

  const form = document.createElement('form');
  form.className = 'dg-form';
  form.noValidate = true;

  const quiz = el('div', 'dg-quiz');

  // header bar: numbered badge + step title
  const header = el('div', 'dg-header');
  const badge = el('span', 'dg-step-num');
  const title = el('h2', 'dg-title');
  header.append(badge, title);

  // progress bar
  const progress = el('div', 'dg-progress');
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '1');
  progress.setAttribute('aria-valuemax', String(guide.steps.length));
  const segments = guide.steps.map(() => {
    const seg = el('span', 'dg-progress-seg');
    progress.append(seg);
    return seg;
  });

  // steps
  const stepsWrap = el('div', 'dg-steps');
  const stepEls = guide.steps.map((step, i) => {
    const stepEl = el('div', 'dg-step');
    stepEl.append(el('span', 'dg-step-count', `${i + 1} of ${guide.steps.length}`));
    step.questions.forEach((q) => stepEl.append(buildQuestion(q)));
    stepsWrap.append(stepEl);
    return stepEl;
  });

  // navigation
  const nav = el('div', 'dg-nav');
  const back = el('button', 'dg-back');
  back.type = 'button';
  back.append(el('span', 'icon icon-arrow'), el('span', undefined, 'Back'));
  const next = el('button', 'dg-next');
  next.type = 'button';
  next.append(el('span', undefined, 'Next'), el('span', 'icon icon-arrow'));
  const submit = el('button', 'dg-submit', guide.submitLabel);
  submit.type = 'submit';
  submit.append(el('span', 'icon icon-arrow'));
  nav.append(back, next, submit);

  quiz.append(header, progress, stepsWrap, nav);
  form.append(quiz);

  const nameField = () => {
    const nameQ = guide.steps.flatMap((s) => s.questions).find((q) => q.isName);
    return nameQ ? form.querySelector(`#${CSS.escape(nameQ.id)}`)?.value?.trim() || '' : '';
  };

  let current = 0;
  const render = () => {
    const name = nameField();
    stepEls.forEach((elm, i) => elm.classList.toggle('dg-step-active', i === current));
    segments.forEach((seg, i) => seg.classList.toggle('dg-progress-done', i <= current));
    badge.textContent = String(current + 1);
    title.textContent = applyName(guide.steps[current].title || guide.title, name);
    progress.setAttribute('aria-valuenow', String(current + 1));
    back.hidden = current === 0;
    const isLast = current === guide.steps.length - 1;
    next.hidden = isLast;
    submit.hidden = !isLast;
    stepEls[current].querySelector('input, textarea, select')?.focus();
  };

  next.addEventListener('click', () => {
    if (current < guide.steps.length - 1) { current += 1; render(); }
  });
  back.addEventListener('click', () => {
    if (current > 0) { current -= 1; render(); }
  });

  const retake = () => {
    form.reset();
    current = 0;
    form.querySelector('.dg-results')?.remove();
    quiz.hidden = false;
    render();
    quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameField();
    const answers = collectAnswers(form, guide, name);

    if (guide.action) {
      try {
        await fetch(guide.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, answers }),
        });
      } catch (err) {
        // graceful: still show the results even if the endpoint is unreachable
      }
    }

    const results = buildResults(guide, answers, name, retake);
    quiz.hidden = true;
    form.append(results);
    decorateIcons(results);
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  block.replaceChildren(form);
  decorateIcons(form);
  render();
}
