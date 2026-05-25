export const dispatchWindowEvent = (name: string, payload?: any) => {
  const event = new CustomEvent(name, { detail: payload });
  window.dispatchEvent(event);
};
