type SRGBBoolean = "0" | "1";

type PauseMode = "None" | "Pause canvas";

type SignalRGBProperties = {
  Preset: string;
  RandomSeconds: number;
  BlendSeconds: number;
  PauseMode: PauseMode;
  Amplify: number;
  ShowPresetTitle: SRGBBoolean;
};

type SignalRGBChangeListeners = {
  [K in keyof SignalRGBProperties as K extends string
    ? `on${K}Changed`
    : never]: () => void;
};

interface Window extends SignalRGBProperties, SignalRGBChangeListeners {}

type Engine = {
  audio: {
    level: number;
    density: number;
    freq: number[];
  };
};

const engine: Engine;
