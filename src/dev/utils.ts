export const SRGB_META_TAG_TYPES = [
  'number',
  'hue',
  'boolean',
  'color',
  'textfield',
  'list',
] as const;

export type SRGBMetaTagType = (typeof SRGB_META_TAG_TYPES)[number];

export const getParsedPersistedValue = <T = any>(key: string): T | null => {
  const json = localStorage.getItem(key);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};

export const generateRandomInt = (start: number, end: number) =>
  start + Math.floor(Math.random() * (end - start));

export const getMetaTags = () => [
  ...document.querySelectorAll<HTMLMetaElement>('meta[property][type]'),
];

export function parseSRGBValue(value: string, type: 'number' | 'hue'): number;
export function parseSRGBValue(value: string, type: 'boolean'): boolean;
export function parseSRGBValue(value: string, type: 'color' | 'textfield' | 'list'): string;
export function parseSRGBValue(value: string, type: string): number | boolean | string | null;
export function parseSRGBValue(value: string, type: string) {
  if (!SRGB_META_TAG_TYPES.includes(type as any)) return null;

  if (['number', 'hue'].includes(type)) return Number(value);
  if (type === 'boolean') return Boolean(Number(value));

  return value;
}

export const replaceOrCreateElement = (parent: HTMLElement, element: HTMLElement) => {
  if (!element.id) return;

  const oldElement = document.getElementById(element.id);
  if (oldElement) {
    oldElement.replaceWith(element);
    return;
  }

  parent.appendChild(element);
};

export const renderElement = (html: string) => {
  const parent = document.createElement('div');
  parent.innerHTML = html;
  return parent.children[0];
};

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
