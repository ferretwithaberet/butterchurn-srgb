// TODO: Persist settings to localstorage
import { getMetaTags, renderElement, setMetaTagValue } from '@/dev/utils';

const renderField = (metaTag: HTMLMetaElement) => {
  const name = metaTag.getAttribute('property');
  const label = metaTag.getAttribute('label');
  const type = metaTag.getAttribute('type');
  const defaultValue = metaTag.getAttribute('default');

  if (!(name && type)) return null;

  let fieldEl: Element;
  switch (type) {
    case 'number':
    case 'hue': {
      const min = metaTag.getAttribute('min');
      const max = metaTag.getAttribute('max');

      fieldEl = renderElement(
        `<input name="${name}" type="range" placeholder=${label ?? name} value="${defaultValue}" min="${min}" max="${max}" />`,
      );
      break;
    }

    case 'boolean': {
      fieldEl = renderElement(
        `<input name="${name}" type="checkbox" placeholder=${label ?? name} value="${defaultValue}" />`,
      );
      break;
    }

    case 'list': {
      const options = (metaTag.getAttribute('values') ?? '').split(',');
      fieldEl = renderElement(`<select name="${name}" placeholder=${label ?? name}">
        ${options.map((option) => `<option value="${option}"${option === defaultValue ? ' selected' : ''}>${option}</option>`).join('/n')}
      </select>`);
      break;
    }

    default: {
      fieldEl = renderElement(
        `<input name="${name}" type="${type}" placeholder=${label ?? name} value="${defaultValue}" />`,
      );
    }
  }

  fieldEl.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    let value: any;
    switch (type) {
      case 'number':
      case 'hue': {
        value = Number(target.value);
        break;
      }

      case 'boolean': {
        value = Number(target.checked).toString();
        break;
      }

      default:
        value = target.value;
    }
    setMetaTagValue(target.name, value);
    console.info(`Value change for "${target.name}": ${value}`);
  });

  const fieldWrapper = renderElement(`<div class="field">
    <label for=${name}>${label ?? name}</label>
  </div`);
  fieldWrapper.appendChild(fieldEl);

  return fieldWrapper;
};

const FORM_ID = 'property-form';
export const createForm = () => {
  import('@/dev/form.css');

  const form = document.createElement('form');
  form.id = FORM_ID;

  getMetaTags().forEach((metaTag) => {
    const field = renderField(metaTag);
    if (!field) return;
    form.appendChild(field);
  });

  const oldForm = document.getElementById(FORM_ID);
  if (oldForm) {
    oldForm.replaceWith(form);
    return;
  }

  document.body.appendChild(form);
};
