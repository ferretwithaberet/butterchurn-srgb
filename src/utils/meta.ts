const lastMap: Partial<Record<keyof Window, Window[keyof Window]>> = {};

export const trackMetaProperty = <TProperty extends keyof Window>(
  property: TProperty,
  handler: (value: Window[TProperty]) => void,
) => {
  if (window[property] === lastMap[property]) return window[property];

  lastMap[property] = window[property];
  handler(window[property]);
  return window[property];
};
