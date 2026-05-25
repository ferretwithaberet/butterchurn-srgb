import mockAudioEngine, { type AudioMockType } from '@/dev/audio';
import createControls from '@/dev/controls';
import setupProperties, { type SetupPropertiesOptions } from '@/dev/properties';
import { replaceOrCreateElement } from '@/dev/utils';
/* eslint-disable-next-line import-x/no-extraneous-dependencies */
import Choices from 'choices.js';

export type SetupDevOptions = {
  audioMockType?: AudioMockType;
  properties?: SetupPropertiesOptions;
};

const setupDev = (options: SetupDevOptions = {}) => {
  import('@/dev/dev.css');
  /* eslint-disable-next-line import-x/no-extraneous-dependencies */
  import('choices.js/public/assets/styles/choices.css');

  const { audioMockType = 'random', properties } = options;

  const devtoolsContainer = document.createElement('div');
  devtoolsContainer.id = 'devtools';
  replaceOrCreateElement(document.body, devtoolsContainer);

  createControls(devtoolsContainer);
  setupProperties({ ...properties, formParent: devtoolsContainer });
  mockAudioEngine(audioMockType);

  void [...document.querySelectorAll('#devtools select')].forEach((select) => {
    const choices = new Choices(select, { shouldSort: false, itemSelectText: undefined });
    const target = select as HTMLSelectElement & { choicesInstance?: Choices };
    target.choicesInstance = choices;
  });
};

export default setupDev;
