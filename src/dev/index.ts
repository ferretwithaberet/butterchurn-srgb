import mockAudioEngine from '@/dev/audio';
import createControls from '@/dev/controls';
import setupProperties, { type SetupPropertiesOptions } from '@/dev/properties';
import { replaceOrCreateElement } from '@/dev/utils';

export type SetupDevOptions = {
  randomAudioData?: boolean;
  properties?: SetupPropertiesOptions;
};

const setupDev = (options: SetupDevOptions = {}) => {
  import('@/dev/dev.css');

  const { randomAudioData, properties } = options;

  const devtoolsContainer = document.createElement('div');
  devtoolsContainer.id = 'devtools';
  replaceOrCreateElement(document.body, devtoolsContainer);

  setupProperties({ ...properties, formParent: devtoolsContainer });
  createControls(devtoolsContainer);
  mockAudioEngine(randomAudioData);

  if (randomAudioData) {
    setInterval(() => mockAudioEngine(true), 500);
  }
};

export default setupDev;
