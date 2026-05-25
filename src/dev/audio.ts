import { generateRandomInt } from '@/dev/utils';

export const mockAudioEngine = (random = false) => {
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
