type NoneValue = '# None';

type Mode = 'Cycle' | 'Random';

type SRGBBoolean = '0' | '1';

type PauseMode = NoneValue | 'Pause canvas';

type BlendMode =
  | NoneValue
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
  | 'plus-darker'
  | 'plus-lighter';

type SignalRGBProperties = {
  Preset: string;
  PresetRanges: string;
  ExtraPresets: string;
  Mode: Mode;
  ModeSeconds: number;
  BlendSeconds: number;
  PauseMode: PauseMode;
  Amplify: number;
  RGBModeEnabled: SRGBBoolean;
  RGBModeSpeed: number;
  BlendMode: BlendMode;
  BlendColor: string;
  HueShift: number;
  Saturation: number;
  Contrast: number;
  ShowPresetTitle: SRGBBoolean;
};

type SignalRGBChangeListeners = {
  [K in keyof SignalRGBProperties as K extends string ? `on${K}Changed` : never]: () => void;
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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface required for declaration merging with lib.dom Window
interface Window extends SignalRGBProperties, SignalRGBChangeListeners {}
