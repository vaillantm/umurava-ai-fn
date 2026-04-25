export const APP_REQUEST_START_EVENT = 'umurava:request-start';
export const APP_REQUEST_END_EVENT = 'umurava:request-end';
export const APP_CONNECTION_EVENT = 'umurava:connection';

export type AppConnectionState = 'connected' | 'disconnected';

export function emitAppStatusEvent(name: string, detail?: unknown) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
