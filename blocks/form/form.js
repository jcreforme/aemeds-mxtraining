const FIELD_TYPES = ['text', 'email', 'tel', 'date', 'textarea', 'select', 'radio', 'checkbox', 'submit'];

/**
 * Parses the type/config cell into a structured config.
 * Supported values:
 *   text | email | tel | date | textarea | checkbox | submit
 *   select: Option A, Option B
 *   radio: Yes, No
 * A standalone "optional" keyword before the colon marks the field as not required.
 * @param {string} raw
 * @returns {{ type: string, options?: string[], required: boolean }}
 */
function parseFieldConfig(raw) {
  let value = (raw || 'text').trim();
  const colonIdx = value.indexOf(':');
  let prefix = colonIdx >= 0 ? value.slice(0, colonIdx) : value;
  const rest = colonIdx >= 0 ? value.slice(colonIdx + 1) : '';

  let required = true;
  if (/\boptional\b/i.test(prefix)) {
    required = false;
    prefix = prefix.replace(/\boptional\b/i, '').trim();
  }

  const type = prefix.toLowerCase().trim() || 'text';
  value = colonIdx >= 0 ? `${type}:${rest}` : type;

  if (type === 'select' || type === 'radio') {
    return {
      type,
      required,
      options: rest.split(',').map((o) => o.trim()).filter(Boolean),
    };
  }
  if (FIELD_TYPES.includes(type)) return { type, required };
  return { type: 'text', required };
}

function slugify(text) {
  return text.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

/**
 * Lead capture / sign-up form block.
 * Each row: col1 = label (may contain links for consent text), col2 = field config.
 * Field config: text | email | tel | date | textarea | checkbox | submit,
 *   select: A, B | radio: Yes, No. Prefix "optional" makes the field not required.
 * Legacy support: type "select" with options in a third column.
 * @param {Element} block
 */
export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'lead-form';
  form.noValidate = true;

  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const labelText = labelCell?.textContent?.trim();
    let typeRaw = cells[1]?.textContent?.trim() || '';
    const extraCol = cells[2]?.textContent?.trim();
    if ((typeRaw === 'select' || typeRaw === 'radio') && extraCol) {
      typeRaw = `${typeRaw}:${extraCol}`;
    }
    if (!labelText) return;

    const config = parseFieldConfig(typeRaw);
    const fieldId = `form-${slugify(labelText).slice(0, 40)}`;

    if (config.type === 'submit') {
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'button primary';
      submit.textContent = labelText;
      form.append(submit);
      return;
    }

    const fieldWrap = document.createElement('div');
    fieldWrap.className = 'form-field';

    if (config.type === 'checkbox') {
      fieldWrap.classList.add('form-field-checkbox');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = fieldId;
      input.name = fieldId;
      input.required = config.required;
      const label = document.createElement('label');
      label.htmlFor = fieldId;
      // preserve any links (Terms of Use / Privacy Policy) in the consent text
      const source = labelCell.querySelector('p') || labelCell;
      label.innerHTML = source.innerHTML;
      fieldWrap.append(input, label);
    } else if (config.type === 'radio') {
      fieldWrap.classList.add('form-field-radio');
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = labelText;
      fieldset.append(legend);
      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'radio-options';
      (config.options || []).forEach((opt, i) => {
        const optId = `${fieldId}-${slugify(opt) || i}`;
        const optWrap = document.createElement('div');
        optWrap.className = 'radio-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = optId;
        input.name = fieldId;
        input.value = opt;
        input.required = config.required;
        const label = document.createElement('label');
        label.htmlFor = optId;
        label.textContent = opt;
        optWrap.append(input, label);
        optionsWrap.append(optWrap);
      });
      fieldset.append(optionsWrap);
      fieldWrap.append(fieldset);
    } else {
      const label = document.createElement('label');
      label.htmlFor = fieldId;
      label.textContent = labelText;
      fieldWrap.append(label);

      let input;
      if (config.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 4;
      } else if (config.type === 'select') {
        input = document.createElement('select');
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = `Select ${labelText}`;
        placeholder.disabled = true;
        placeholder.selected = true;
        input.append(placeholder);
        (config.options || []).forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          input.append(option);
        });
      } else {
        input = document.createElement('input');
        input.type = config.type;
      }
      input.id = fieldId;
      input.name = fieldId;
      if (config.type === 'email') input.autocomplete = 'email';
      if (config.type === 'tel') input.autocomplete = 'tel';
      input.required = config.required;
      fieldWrap.append(input);
    }

    if (!config.required) fieldWrap.classList.add('form-field-optional');
    form.append(fieldWrap);
  });

  const message = document.createElement('p');
  message.className = 'form-message';
  message.hidden = true;
  form.append(message);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.classList.add('form-success');
    message.hidden = false;
    message.textContent = 'Thank you. Your information has been submitted.';
    form.querySelectorAll('input, select, textarea, button').forEach((el) => {
      el.disabled = true;
    });
  });

  block.replaceChildren(form);
}
