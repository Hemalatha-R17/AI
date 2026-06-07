// Traces to: RICE-POT C — base class for all API page objects
import type { APIRequestContext } from '@playwright/test';
import { config } from '../config/config';

export abstract class BasePage {
  protected readonly request: APIRequestContext;
  protected readonly baseURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = config.baseURL;
  }

  protected getAuthHeaders(): Record<string, string> {
    if (config.authToken) {
      return { Authorization: `Bearer ${config.authToken}` };
    }
    return {};
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };
  }
}
