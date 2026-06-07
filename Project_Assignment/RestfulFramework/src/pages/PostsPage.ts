// Traces to: JSONPlaceholder API — /posts endpoint
// Page Object 2 of 2

import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/config';
import type { CreatePostPayload, UpdatePostPayload, PatchPostPayload } from '../models/Post';

export class PostsPage extends BasePage {
  private readonly endpoint: string;

  constructor(request: APIRequestContext) {
    super(request);
    this.endpoint = config.endpoints.posts;
  }

  /** GET /posts — retrieve all posts */
  async getAll(): Promise<APIResponse> {
    return this.request.get(this.endpoint, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }

  /** GET /posts/:id — retrieve a single post */
  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }

  /** GET /posts?userId=:userId — filter posts by user */
  async getByUserId(userId: number): Promise<APIResponse> {
    return this.request.get(this.endpoint, {
      headers: this.getDefaultHeaders(),
      params: { userId },
      timeout: config.timeouts.request,
    });
  }

  /** POST /posts — create a new post */
  async create(payload: CreatePostPayload | Partial<CreatePostPayload>): Promise<APIResponse> {
    return this.request.post(this.endpoint, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** PUT /posts/:id — full update of a post */
  async update(id: number, payload: UpdatePostPayload): Promise<APIResponse> {
    return this.request.put(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** PATCH /posts/:id — partial update of a post */
  async patch(id: number, payload: PatchPostPayload): Promise<APIResponse> {
    return this.request.patch(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** DELETE /posts/:id — delete a post */
  async delete(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }
}
