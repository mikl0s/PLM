import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Protected routes
  if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/library')) {
    const token = event.cookies.get('auth_token');
    if (!token) {
      throw redirect(303, '/login');
    }
  }

  // Login route
  if (event.url.pathname === '/login') {
    const token = event.cookies.get('auth_token');
    if (token) {
      throw redirect(303, '/dashboard');
    }
  }

  const response = await resolve(event);
  return response;
};
