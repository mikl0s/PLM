import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlexToken } from '$lib/server/services/plex';

export const POST: RequestHandler = async ({ request, locals }) => {
  const { username, password } = await request.json();
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const token = await getPlexToken({ username, password });
    return json({ token });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to get Plex token', {
      status: 500
    });
  }
}; 