const FIELD_TYPES = ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'submit'];

/**
 * Parses field config from second column: "email" or "select:Option A,Option B".
 * @param {string} raw
 * @returns {{ type: string, options?: string[] }}
 */
function parseFieldConfig(raw) {
  const value = (raw || 'text').trim().toLowerCase();
  if (value.startsWith('select:')) {
    return {
      type: 'select',
      options: value.slice(7).split(',').map((o) => o.trim()).filter(Boolean),
    };
  }
  if (FIELD_TYPES.includes(value)) return { type: value };
  return { type: 'text' };
}

/**
 * Lead capture form block.
 * Each row: col1 = label, col2 = field type (text|email|tel|textarea|select:a,b|checkbox|submit).
 * Submit row: col1 = button label (e.g. "Sign Up"), col2 = "submit".
 * @param {Element} block
 */
export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'lead-form';
  form.noValidate = true;

  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    const labelText = cells[0]?.textContent?.trim();
    let typeRaw = cells[1]?.textContent?.trim() || '';
    const selectOptions = cells[2]?.textContent?.trim();
    if (typeRaw === 'select' && selectOptions) {
      typeRaw = `select:${selectOptions}`;
    }
    const config = parseFieldConfig(typeRaw);
    if (!labelText) return;

    const fieldId = `form-${labelText.replace(/\s+/g, '-').toLowerCase()}`;

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
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = fieldId;
      input.name = fieldId;
      input.required = true;
      const label = document.createElement('label');
      label.htmlFor = fieldId;
      label.textContent = labelText;
      fieldWrap.append(input, label);
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
      if (config.type !== 'select') input.required = true;
      fieldWrap.append(input);
    }

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
