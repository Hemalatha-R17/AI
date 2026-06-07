// Traces to: RICE-POT P — deterministic test data; no random values
import type { CreateUserPayload } from '../models/User';
import type { CreatePostPayload, UpdatePostPayload, PatchPostPayload } from '../models/Post';

export const UserTestData = {
  valid: {
    name: 'Jane Doe',
    username: 'janedoe',
    email: 'jane.doe@example.com',
  } satisfies CreateUserPayload,

  missingEmail: {
    name: 'No Email User',
    username: 'noemail',
  } as Partial<CreateUserPayload>,

  missingName: {
    username: 'noname',
    email: 'noname@example.com',
  } as Partial<CreateUserPayload>,
};

export const PostTestData = {
  valid: {
    userId: 1,
    title: 'Playwright API Test Post',
    body: 'This post was created by an automated Playwright test.',
  } satisfies CreatePostPayload,

  updated: {
    id: 1,
    userId: 1,
    title: 'Updated Post Title',
    body: 'Updated body content via PUT request.',
  } satisfies UpdatePostPayload,

  patched: {
    title: 'Patched Title Only',
  } satisfies PatchPostPayload,

  missingTitle: {
    userId: 1,
    body: 'Body without a title.',
  } as Partial<CreatePostPayload>,
};
