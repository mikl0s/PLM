import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  addPlexServer,
  getPlexServers,
  getPlexToken
} from '$lib/server/services/plex';

export const POST: RequestHandler = async ({ request, locals }) => {
  const { name, url, token } = await request.json();
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const server = await addPlexServer(userId, name, url, token);
    return json(server);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to add Plex server', {
      status: 500
    });
  }
};

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const servers = await getPlexServers(userId);
    return json(servers);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to get Plex servers', {
      status: 500
    });
  }
}; 