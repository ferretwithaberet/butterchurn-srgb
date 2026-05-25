import mockAudioEngine, { type AudioMockType } from '@/dev/audio';
import { renderElement, replaceOrCreateElement } from '@/dev/utils';
import { dispatchWindowEvent } from '@/utils/events';

const AUDIO_MOCK_BUTTONS: { label: string; type: AudioMockType }[] = [
  { label: 'Mute audio', type: null },
  { label: 'Mock random audio', type: 'random' },
  { label: 'Capture system audio', type: 'system' },
];

const createControls = (parent: HTMLElement = document.body) => {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'controls-container';
  controlsContainer.classList.add('section');

  const title = renderElement('<span class="title">Controls</span>');
  controlsContainer.appendChild(title);

  const nextPresetButton = renderElement('<button>Next preset</button>');
  nextPresetButton.addEventListener('click', () => dispatchWindowEvent('nextpreset'));
  controlsContainer.appendChild(nextPresetButton);

  AUDIO_MOCK_BUTTONS.forEach(({ label, type }) => {
    const button = renderElement(`<button>${label}</button>`);
    button.addEventListener('click', () => {
      mockAudioEngine(type);
    });
    controlsContainer.appendChild(button);
  });

  replaceOrCreateElement(parent, controlsContainer);
};

export default createControls;
