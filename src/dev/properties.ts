import {
  getMetaTags,
  parseSRGBValue,
  renderElement,
  replaceOrCreateElement,
  getParsedPersistedValue,
} from '@/dev/utils';

const PERSIST_PROPERTIES_KEY = '_srgb_properties';

export const setSRGBProperty = (name: string, value: any) => {
  (window as any)[name] = value;
  const onChanged = (window as any)[`on${name}Changed`];
  onChanged?.();
};

export const renderSRGBField = (metaTag: HTMLMetaElement) => {
  const name = metaTag.getAttribute('property');
  const label = metaTag.getAttribute('label');
  const type = metaTag.getAttribute('type');

  if (!(name && type)) return null;

  let fieldEl: Element;
  const fieldValue = (window as any)[name];
  switch (type) {
    case 'number':
    case 'hue': {
      const min = metaTag.getAttribute('min');
      const max = metaTag.getAttribute('max');

      fieldEl = renderElement(
        `<input name="${name}" type="range" placeholder=${label ?? name} value="${fieldValue}" min="${min}" max="${max}" />`,
      );
      break;
    }

    case 'boolean': {
      fieldEl = renderElement(
        `<input name="${name}" type="checkbox" placeholder=${label ?? name} value="${fieldValue}" />`,
      );
      break;
    }

    case 'list': {
      const options = (metaTag.getAttribute('values') ?? '').split(',');
      fieldEl = renderElement(`<select name="${name}" placeholder=${label ?? name}">
        ${options.map((option) => `<option value="${option}"${option === fieldValue ? ' selected' : ''}>${option}</option>`).join('/n')}
      </select>`);
      break;
    }

    default: {
      fieldEl = renderElement(
        `<input name="${name}" type="${type}" placeholder=${label ?? name} value="${fieldValue}" />`,
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
    setSRGBProperty(target.name, value);
    console.info(`Value change for "${target.name}": ${value}`);
  });

  const fieldWrapper = renderElement(`<div class="field">
    <label for=${name}>${label ?? name}</label>
  </div`);
  fieldWrapper.appendChild(fieldEl);

  return fieldWrapper;
};

const createForm = (parent: HTMLElement = document.body) => {
  const metaTags = getMetaTags();
  const form = document.createElement('form');
  form.id = 'properties-form';
  form.classList.add('section');

  const title = renderElement('<span class="title">SRGB Properties</span>');
  form.appendChild(title);

  metaTags.forEach((metaTag) => {
    const field = renderSRGBField(metaTag);
    if (!field) return;
    form.appendChild(field);
  });

  const resetButton = renderElement('<button type="button">Reset properties</button>');
  resetButton.addEventListener('click', () => {
    metaTags.forEach((metaTag) => {
      const name = metaTag.getAttribute('property');
      const defaultValue = metaTag.getAttribute('default');
      if (!name) return;
      const field = document.getElementsByName(name)[0] as HTMLInputElement;
      field.value = defaultValue ?? '';
      setSRGBProperty(name, defaultValue ?? '');
    });

    const event = new CustomEvent('change');
    form.dispatchEvent(event);
  });
  form.appendChild(resetButton);

  replaceOrCreateElement(parent, form);
  return form;
};

export type SetupPropertiesOptions = {
  persist?: boolean;
  formParent?: HTMLElement;
};

const setupProperties = (options: SetupPropertiesOptions = {}) => {
  const { persist, formParent } = options;

  const metaTags = getMetaTags();
  const persistedValues = getParsedPersistedValue<SignalRGBProperties>(PERSIST_PROPERTIES_KEY);

  metaTags.forEach((metaTag) => {
    const name = metaTag.getAttribute('property');
    const type = metaTag.getAttribute('type');
    const defaultValue = metaTag.getAttribute('default');

    if (!(name && type && defaultValue != null)) return;

    const parsedValue = parseSRGBValue(defaultValue, type);
    if (parsedValue === null) return;

    (window as any)[name] =
      persist && persistedValues ? (persistedValues as any)[name] : parsedValue;
  });

  const form = createForm(formParent);
  if (persist)
    form.addEventListener('change', () => {
      localStorage.setItem(
        PERSIST_PROPERTIES_KEY,
        JSON.stringify(Object.fromEntries(new FormData(form))),
      );
    });

  queueMicrotask(() => {
    metaTags.forEach((metaTag) => {
      const name = metaTag.getAttribute('property');
      const onChanged = (window as any)[`on${name}Changed`];
      onChanged?.();
    });
  });
};

export default setupProperties;
