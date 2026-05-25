import { mockAudioEngine } from '@/dev/audio';
import createControls from '@/dev/controls';
import createForm from '@/dev/form';
import options from '@/dev/options';
import { getMetaTags, parseSRGBValue } from '@/dev/utils';

const setupProperties = (overrideValues?: Partial<SignalRGBProperties>) => {
  getMetaTags().forEach((metaTag) => {
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
  getMetaTags().forEach((metaTag) => {
    const name = metaTag.getAttribute('property');
    const onChanged = (window as any)[`on${name}Changed`];
    onChanged?.();
  });
};

const setupDev = () => {
  const { randomAudioData = true, overridePropertyValues } = options;

  setupProperties(overridePropertyValues);
  queueMicrotask(triggerChangeListeners);
  mockAudioEngine(randomAudioData);
  createForm();
  createControls();

  if (randomAudioData) {
    setInterval(() => mockAudioEngine(true), 500);
  }
};

export default setupDev;
