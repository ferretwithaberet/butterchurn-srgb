import { renderElement } from '@/dev/utils';
import { dispatchWindowEvent } from '@/utils/events';

const CONTROLS_ID = 'controls-container';
const createControls = () => {
  const controlsWrapper = document.createElement('div');
  controlsWrapper.id = CONTROLS_ID;

  const nextPresetButton = renderElement('<button>Next preset</button>');
  nextPresetButton.addEventListener('click', () => dispatchWindowEvent('nextpreset'));
  controlsWrapper.appendChild(nextPresetButton);

  const oldControls = document.getElementById(CONTROLS_ID);
  if (oldControls) {
    oldControls.replaceWith(controlsWrapper);
    return;
  }

  document.body.appendChild(controlsWrapper);
};

export default createControls;
