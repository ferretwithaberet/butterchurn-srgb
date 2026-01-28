interface Window {
  preset: string;
  randomSeconds: number;
  blendSeconds: number;
}

type Engine = {
  audio: {
    level: number;
    density: number;
    freq: number[];
  };
};

const engine: Engine;
