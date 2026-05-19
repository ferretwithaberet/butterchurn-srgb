type SRGBBoolean = "0" | "1";

type PauseMode = "None" | "Pause canvas";

type SignalRGBProperties = {
  Preset: string;
  RandomSeconds: number;
  BlendSeconds: number;
  PauseMode: PauseMode;
  Amplify: number;
  RGBMode: SRGBBoolean;
  RGBModeSpeed: number;
  HueShift: number;
  Saturation: number;
  Contrast: number;
  ShowPresetTitle: SRGBBoolean;
};

type SignalRGBChangeListeners = {
  [K in keyof SignalRGBProperties as K extends string
    ? `on${K}Changed`
    : never]: () => void;
};

type Engine = {
  audio: {
    level: number;
    rawlevel: number;
    density: number;
    freq: number[];
  };
};

let engine: Engine;

interface Window extends SignalRGBProperties, SignalRGBChangeListeners {}
