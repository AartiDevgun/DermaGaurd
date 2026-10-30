export type DermaGuardProcessingDetail = {
  active: boolean;
  stage?: string;
};

/**
 * Client-side bridge for the model request lifecycle.
 * Dispatch active=true immediately before the real API request and active=false in its finally block.
 * The homepage does not display a loading screen until this event is emitted.
 */
export function notifyDermaGuardProcessing(detail: DermaGuardProcessingDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DermaGuardProcessingDetail>('dermaguard:processing', { detail }));
}
