export const SRGB_META_TAG_TYPES = [
  'number',
  'hue',
  'boolean',
  'color',
  'textfield',
  'list',
] as const;

export type SRGBMetaTagType = (typeof SRGB_META_TAG_TYPES)[number];

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

export const renderElement = (html: string) => {
  const parent = document.createElement('div');
  parent.innerHTML = html;
  return parent.children[0];
};

export const setMetaTagValue = (name: string, value: any) => {
  (window as any)[name] = value;
  const onChanged = (window as any)[`on${name}Changed`];
  onChanged?.();
};
