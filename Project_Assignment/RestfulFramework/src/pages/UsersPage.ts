// Traces to: JSONPlaceholder API — /users endpoint
// Page Object 1 of 2

import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../config/config';
import type { CreateUserPayload } from '../models/User';

export class UsersPage extends BasePage {
  private readonly endpoint: string;

  constructor(request: APIRequestContext) {
    super(request);
    this.endpoint = config.endpoints.users;
  }

  /** GET /users — retrieve all users */
  async getAll(): Promise<APIResponse> {
    return this.request.get(this.endpoint, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }

  /** GET /users/:id — retrieve a single user */
  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }

  /** POST /users — create a new user */
  async create(payload: CreateUserPayload | Partial<CreateUserPayload>): Promise<APIResponse> {
    return this.request.post(this.endpoint, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** PUT /users/:id — full update of a user */
  async update(id: number, payload: CreateUserPayload): Promise<APIResponse> {
    return this.request.put(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** PATCH /users/:id — partial update of a user */
  async patch(id: number, payload: Partial<CreateUserPayload>): Promise<APIResponse> {
    return this.request.patch(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
      timeout: config.timeouts.request,
    });
  }

  /** DELETE /users/:id — delete a user */
  async delete(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.endpoint}/${id}`, {
      headers: this.getDefaultHeaders(),
      timeout: config.timeouts.request,
    });
  }
}
