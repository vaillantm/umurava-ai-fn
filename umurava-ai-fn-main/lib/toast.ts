export function showToast(message: string, type: 'info' | 'success' = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('umurava:toast', { detail: { message, type } }));
}
