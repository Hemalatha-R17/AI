import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  authToken: process.env.AUTH_TOKEN ?? '',
  timeouts: {
    request: 15_000,
    assertion: 5_000,
  },
  endpoints: {
    users: '/users',
    posts: '/posts',
  },
} as const;
