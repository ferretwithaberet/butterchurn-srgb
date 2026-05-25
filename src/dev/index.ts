import mockAudioEngine, { type AudioMockType } from '@/dev/audio';
import createControls from '@/dev/controls';
import setupProperties, { type SetupPropertiesOptions } from '@/dev/properties';
import { replaceOrCreateElement } from '@/dev/utils';

export type SetupDevOptions = {
  audioMockType?: AudioMockType;
  properties?: SetupPropertiesOptions;
};

const setupDev = (options: SetupDevOptions = {}) => {
  import('@/dev/dev.css');

  const { audioMockType = 'random', properties } = options;

  const devtoolsContainer = document.createElement('div');
  devtoolsContainer.id = 'devtools';
  replaceOrCreateElement(document.body, devtoolsContainer);

  createControls(devtoolsContainer);
  setupProperties({ ...properties, formParent: devtoolsContainer });
  mockAudioEngine(audioMockType);
};

export default setupDev;
