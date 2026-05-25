import { renderElement, replaceOrCreateElement } from '@/dev/utils';
import { dispatchWindowEvent } from '@/utils/events';

const createControls = (parent: HTMLElement = document.body) => {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'controls-container';
  controlsContainer.classList.add('section');

  const title = renderElement('<span class="title">Controls</span>');
  controlsContainer.appendChild(title);

  const nextPresetButton = renderElement('<button>Next preset</button>');
  nextPresetButton.addEventListener('click', () => dispatchWindowEvent('nextpreset'));
  controlsContainer.appendChild(nextPresetButton);

  replaceOrCreateElement(parent, controlsContainer);
};

export default createControls;
