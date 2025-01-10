import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../types/auth';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export async function verifyToken(request: AuthRequest): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request: AuthRequest): Promise<JwtPayload> {
  const user = await verifyToken(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
