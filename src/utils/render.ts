import throttle from 'lodash/throttle';

export const createRenderLoop = (frame: () => void) => {
  let rafId = 0;
  let stopped = false;

  const tick = throttle(
    () => {
      if (stopped) return;
      rafId = requestAnimationFrame(() => {
        frame();
        tick();
      });
    },
    1000 / window.MaxFPS,
    { leading: false },
  );

  return {
    start: () => {
      stopped = false;
      tick();
    },
    cancel: () => {
      stopped = true;
      tick.cancel();
      cancelAnimationFrame(rafId);
    },
  };
};
