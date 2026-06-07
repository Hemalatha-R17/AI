// Traces to: JSONPlaceholder API — GET /posts response schema

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostPayload {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PatchPostPayload {
  title?: string;
  body?: string;
}
