const generateRandomInt = (start: number, end: number) =>
  start + Math.floor(Math.random() * (end - start));

function parseSRGBValue(value: string, type: 'number' | 'hue'): number;
function parseSRGBValue(value: string, type: 'boolean'): boolean;
function parseSRGBValue(value: string, type: 'color' | 'textfield' | 'list'): string;
function parseSRGBValue(value: string, type: string): number | boolean | string | null;
function parseSRGBValue(value: string, type: string) {
  if (!['number', 'hue', 'boolean', 'color', 'textfield', 'list'].includes(type)) return null;

  if (['number', 'hue'].includes(type)) return Number(value);
  if (type === 'boolean') return Boolean(Number(value));

  return value;
}

const setupProperties = (overrideValues?: Partial<SignalRGBProperties>) => {
  const metaTags = document.querySelectorAll('meta[property][type]');

  void [...metaTags].forEach((metaTag) => {
    const name = metaTag.getAttribute('property');
    const type = metaTag.getAttribute('type');
    const defaultValue = metaTag.getAttribute('default');

    if (!(name && type && defaultValue != null)) return;

    const parsedValue = parseSRGBValue(defaultValue, type);
    if (parsedValue === null) return;

    (window as any)[name] = (overrideValues as any)?.[name] ?? parsedValue;
  });
};

const triggerChangeListeners = () => {
  const metaTags = document.querySelectorAll('meta[property][type]');

  void [...metaTags].forEach((metaTag) => {
    const name = metaTag.getAttribute('property');
    const onChanged = (window as any)[`on${name}Changed`];
    onChanged?.();
  });
};

const mockAudioEngine = (random = false) => {
  const level = random ? -generateRandomInt(0, 101) : -100;
  (window as any).engine = {
    audio: {
      level,
      rawlevel: level,
      density: random ? Math.random() : 0,
      freq: Array.from({ length: 200 }).map(() => (random ? generateRandomInt(0, 255) : 0)),
    },
  };
};

type SetupDevOptions = {
  overridePropertyValues?: Partial<SignalRGBProperties>;
  randomAudioData?: boolean;
};

export const setupDev = (options: SetupDevOptions = {}) => {
  const { randomAudioData = true, overridePropertyValues } = options;

  setupProperties(overridePropertyValues);
  queueMicrotask(triggerChangeListeners);
  mockAudioEngine(randomAudioData);

  if (randomAudioData) {
    setInterval(() => mockAudioEngine(true), 500);
  }
};
