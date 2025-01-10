import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$lib/types/auth';
import { getDuplicateMatches, updateMatchStatus } from '$lib/server/services/fingerprint';

type Locals = {
  user?: User;
  [key: string]: unknown;
};

export const GET = async ({ locals }: RequestEvent<Locals>) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const matches = await getDuplicateMatches(locals.user.id);
    return json(matches);
  } catch (error) {
    console.error('Failed to get duplicate matches:', error);
    return json({ error: 'Failed to get duplicate matches' }, { status: 500 });
  }
};

type DuplicateParams = {
  id: string;
};

export const PATCH = async ({ locals, request, params }: RequestEvent<Locals, DuplicateParams>) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await request.json() as { status: 'confirmed' | 'rejected' };
    const { id } = params;

    if (!id) {
      return json({ error: 'Match ID is required' }, { status: 400 });
    }

    if (!['confirmed', 'rejected'].includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    await updateMatchStatus(id, status, locals.user.id);
    return json({ success: true });
  } catch (error) {
    console.error('Failed to update match status:', error);
    return json({ error: 'Failed to update match status' }, { status: 500 });
  }
}; 