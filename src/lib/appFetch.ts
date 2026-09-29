import { getPreviewRole } from './preview/session';

/**
 * Drop-in for fetch() on this app's own /api/* routes. Identical to
 * fetch() unless a preview session is active (see lib/preview/session.ts),
 * in which case the request is answered from sample data instead.
 *
 * The sample-data module is imported dynamically so it lands in its own
 * chunk that is only downloaded once a preview session actually starts —
 * normal builds and users never load it.
 */
export async function appFetch(input: string, init?: RequestInit): Promise<Response> {
  const role = getPreviewRole();
  if (role) {
    const { handlePreviewRequest } = await import('./preview/handler');
    return handlePreviewRequest(role, input, init);
  }
  return fetch(input, init);
}
