import {
  renderSRGBField,
  getMetaTags,
  parseSRGBValue,
  renderElement,
  replaceOrCreateElement,
  getParsedPersistedValue,
} from '@/dev/utils';

const PERSIST_PROPERTIES_KEY = '_srgb_properties';

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
