import { decorateIcons } from '../../scripts/aem.js';

const INPUT_TYPES = ['multiselect', 'singleselect', 'text', 'textarea', 'email', 'tel'];

/**
 * Slugifies a string for use as an id/name.
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

/**
 * Reads the keyword (first cell) of a block row.
 * @param {Element} row
 * @returns {string}
 */
function rowKeyword(row) {
  return (row.children[0]?.textContent || '').trim().toLowerCase();
}

/**
 * Parses the authored table into a structured guide model.
 *
 * Row keywords (first cell):
 *   title    | Guide title (shown in the header bar on every step)
 *   step     | (optional) col2 = step heading; starts a new step
 *   question | col2 = heading, col3 = help text, col4 = input type
 *   option   | col2 = label, col3 = icon name (from /icons)
 *   submit   | col2 = button label, col3 = optional submit endpoint URL
 *
 * If no `step` rows are present, every question becomes its own step.
 * @param {Element} block
 */
function parseGuide(block) {
  const rows = [...block.children];
  const guide = {
    title: '', steps: [], submitLabel: 'Submit', action: '',
  };
  let currentStep = null;
  let currentQuestion = null;
  let explicitSteps = false;

  const ensureStep = () => {
    if (!currentStep) {
      currentStep = { heading: '', questions: [] };
      guide.steps.push(currentStep);
    }
    return currentStep;
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    const keyword = rowKeyword(row);
    const c2 = cells[1]?.textContent?.trim() || '';
    const c3cell = cells[2];
    const c3 = c3cell?.textContent?.trim() || '';
    const c4 = cells[3]?.textContent?.trim().toLowerCase() || '';

    if (keyword === 'title') {
      guide.title = c2 || cells[1]?.textContent?.trim() || '';
    } else if (keyword === 'submit') {
      guide.submitLabel = c2 || 'Submit';
      guide.action = c3;
    } else if (keyword === 'step') {
      explicitSteps = true;
      currentStep = { heading: c2, questions: [] };
      guide.steps.push(currentStep);
      currentQuestion = null;
    } else if (keyword === 'question') {
      const type = INPUT_TYPES.includes(c4) ? c4 : 'multiselect';
      currentQuestion = {
        heading: c2,
        help: c3cell ? c3cell.innerHTML : '',
        helpText: c3,
        type,
        options: [],
        id: `dg-${slugify(c2)}`,
      };
      // when authors don't group with `step` rows, each question is its own step
      if (!explicitSteps) {
        currentStep = { heading: '', questions: [] };
        guide.steps.push(currentStep);
      } else {
        ensureStep();
      }
      currentStep.questions.push(currentQuestion);
    } else if (keyword === 'option' && currentQuestion) {
      // icon may be authored as a token (`:name:` → span.icon.icon-name) or as plain text
      const iconSpan = c3cell?.querySelector('span[class*="icon-"]');
      const iconName = iconSpan
        ? (Array.from(iconSpan.classList).find((c) => c.startsWith('icon-')) || '').slice(5)
        : slugify(c3);
      currentQuestion.options.push({ label: c2, icon: iconName });
    }
  });

  return guide;
}

/**
 * Builds a selectable answer card (checkbox or radio) with optional icon.
 * @param {object} question
 * @param {object} option
 * @param {number} index
 */
function buildOptionCard(question, option, index) {
  const multi = question.type === 'multiselect';
  const optId = `${question.id}-${slugify(option.label) || index}`;
  const label = document.createElement('label');
  label.className = 'dg-option';
  label.htmlFor = optId;

  const input = document.createElement('input');
  input.type = multi ? 'checkbox' : 'radio';
  input.id = optId;
  input.name = question.id;
  input.value = option.label;

  const iconWrap = document.createElement('span');
  iconWrap.className = 'dg-option-icon';
  if (option.icon) {
    const icon = document.createElement('span');
    icon.className = `icon icon-${option.icon}`;
    iconWrap.append(icon);
  }

  const text = document.createElement('span');
  text.className = 'dg-option-label';
  text.textContent = option.label;

  const marker = document.createElement('span');
  marker.className = 'dg-option-marker';
  marker.setAttribute('aria-hidden', 'true');

  label.append(input, iconWrap, text, marker);
  return label;
}

/**
 * Builds the DOM for a single question.
 * @param {object} question
 */
function buildQuestion(question) {
  const wrap = document.createElement('div');
  wrap.className = `dg-question dg-question-${question.type}`;

  if (question.heading) {
    const h = document.createElement('h3');
    h.className = 'dg-question-heading';
    h.textContent = question.heading;
    wrap.append(h);
  }
  if (question.helpText) {
    const help = document.createElement('div');
    help.className = 'dg-question-help';
    help.innerHTML = question.help;
    wrap.append(help);
  }

  if (question.type === 'multiselect' || question.type === 'singleselect') {
    const group = document.createElement('div');
    group.className = 'dg-options';
    group.setAttribute('role', question.type === 'multiselect' ? 'group' : 'radiogroup');
    if (question.heading) group.setAttribute('aria-label', question.heading);
    question.options.forEach((opt, i) => group.append(buildOptionCard(question, opt, i)));
    wrap.append(group);
  } else {
    let input;
    if (question.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 4;
    } else {
      input = document.createElement('input');
      input.type = question.type;
    }
    input.id = question.id;
    input.name = question.id;
    input.className = 'dg-input';
    if (question.type === 'email') input.autocomplete = 'email';
    if (question.type === 'tel') input.autocomplete = 'tel';
    if (question.heading) input.setAttribute('aria-label', question.heading);
    wrap.append(input);
  }

  return wrap;
}

/**
 * Collects the current answers from the form.
 * @param {HTMLFormElement} form
 * @param {object} guide
 * @returns {Array<{question: string, answer: string}>}
 */
function collectAnswers(form, guide) {
  const answers = [];
  guide.steps.forEach((step) => {
    step.questions.forEach((q) => {
      if (q.type === 'multiselect' || q.type === 'singleselect') {
        const checked = [...form.querySelectorAll(`input[name="${q.id}"]:checked`)]
          .map((el) => el.value);
        if (checked.length) answers.push({ question: q.heading, answer: checked.join(', ') });
      } else {
        const el = form.querySelector(`[name="${q.id}"]`);
        const val = el?.value?.trim();
        if (val) answers.push({ question: q.heading, answer: val });
      }
    });
  });
  return answers;
}

/**
 * Builds the end-of-guide summary view.
 * @param {Array} answers
 */
function buildSummary(answers) {
  const summary = document.createElement('div');
  summary.className = 'dg-summary';
  const list = document.createElement('dl');
  list.className = 'dg-summary-list';
  answers.forEach(({ question, answer }) => {
    const dt = document.createElement('dt');
    dt.textContent = question;
    const dd = document.createElement('dd');
    dd.textContent = answer;
    list.append(dt, dd);
  });
  summary.append(list);
  return summary;
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

  // header bar
  const header = document.createElement('div');
  header.className = 'dg-header';
  const stepNum = document.createElement('span');
  stepNum.className = 'dg-step-num';
  const title = document.createElement('h2');
  title.className = 'dg-title';
  title.textContent = guide.title;
  header.append(stepNum, title);

  // progress bar
  const progress = document.createElement('div');
  progress.className = 'dg-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '1');
  progress.setAttribute('aria-valuemax', String(guide.steps.length));
  const segments = guide.steps.map(() => {
    const seg = document.createElement('span');
    seg.className = 'dg-progress-seg';
    progress.append(seg);
    return seg;
  });

  // steps
  const stepsWrap = document.createElement('div');
  stepsWrap.className = 'dg-steps';
  const stepEls = guide.steps.map((step) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'dg-step';
    if (step.heading) {
      const h = document.createElement('h3');
      h.className = 'dg-step-heading';
      h.textContent = step.heading;
      stepEl.append(h);
    }
    step.questions.forEach((q) => stepEl.append(buildQuestion(q)));
    stepsWrap.append(stepEl);
    return stepEl;
  });

  // navigation
  const nav = document.createElement('div');
  nav.className = 'dg-nav';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'button secondary dg-back';
  back.textContent = 'Back';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'button primary dg-next';
  next.textContent = 'Next';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button primary dg-submit';
  submit.textContent = guide.submitLabel;
  nav.append(back, next, submit);

  const message = document.createElement('p');
  message.className = 'dg-message';
  message.hidden = true;

  form.append(header, progress, stepsWrap, nav, message);

  let current = 0;
  const render = () => {
    stepEls.forEach((el, i) => {
      el.classList.toggle('dg-step-active', i === current);
    });
    segments.forEach((seg, i) => seg.classList.toggle('dg-progress-done', i <= current));
    stepNum.textContent = `${current + 1} of ${guide.steps.length}`;
    progress.setAttribute('aria-valuenow', String(current + 1));
    back.hidden = current === 0;
    const isLast = current === guide.steps.length - 1;
    next.hidden = isLast;
    submit.hidden = !isLast;
    const firstField = stepEls[current].querySelector('input, textarea, select');
    if (firstField) firstField.focus();
  };

  next.addEventListener('click', () => {
    if (current < guide.steps.length - 1) {
      current += 1;
      render();
    }
  });
  back.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const answers = collectAnswers(form, guide);

    if (guide.action) {
      try {
        await fetch(guide.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });
      } catch (err) {
        // graceful: still show the summary even if the endpoint is unreachable
      }
    }

    form.classList.add('dg-complete');
    const summary = buildSummary(answers);
    const doneHeading = document.createElement('h2');
    doneHeading.className = 'dg-title';
    doneHeading.textContent = 'Your Doctor Discussion Guide';

    const printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'button primary dg-print';
    printBtn.textContent = 'Print / Save as PDF';
    printBtn.addEventListener('click', () => window.print());

    header.replaceChildren(doneHeading);
    stepsWrap.replaceChildren(summary);
    nav.replaceChildren(printBtn);
    progress.hidden = true;
    message.hidden = false;
    message.textContent = 'Bring this summary to your next appointment to guide the conversation with your doctor.';
  });

  block.replaceChildren(form);
  decorateIcons(form);
  render();
}
