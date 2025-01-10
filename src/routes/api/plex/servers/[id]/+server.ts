import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlexServer, updatePlexServer, deletePlexServer } from '$lib/server/services/plex';

export const GET: RequestHandler = async ({ params, locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const server = await getPlexServer(params.id);
    if (!server) {
      return new Response('Server not found', { status: 404 });
    }

    if (server.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    return json(server);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to get Plex server', {
      status: 500
    });
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const server = await getPlexServer(params.id);
    if (!server) {
      return new Response('Server not found', { status: 404 });
    }

    if (server.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const updates = await request.json();
    const updatedServer = await updatePlexServer(params.id, updates);
    return json(updatedServer);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to update Plex server', {
      status: 500
    });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const server = await getPlexServer(params.id);
    if (!server) {
      return new Response('Server not found', { status: 404 });
    }

    if (server.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deletePlexServer(params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Failed to delete Plex server', {
      status: 500
    });
  }
}; 