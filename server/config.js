import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Resolve relative to this module so root and server-directory launches agree.
// Existing process environment variables take precedence over the local file.
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });

const secret = process.env.JWT_SECRET;
if (!secret || !secret.trim()) {
  throw new Error('JWT_SECRET is required. Set it in the environment or server/.env.');
}

export const JWT_SECRET = secret;
export const PORT = process.env.PORT || 5000;
