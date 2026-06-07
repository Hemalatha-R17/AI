// Traces to: RICE-POT I step 3 — contract/schema validation

import { expect } from '@playwright/test';

type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SchemaField {
  key: string;
  type: FieldType;
  required: boolean;
}

export function validateSchema(body: Record<string, unknown>, schema: SchemaField[]): void {
  for (const field of schema) {
    if (field.required) {
      expect(body, `Required field "${field.key}" missing`).toHaveProperty(field.key);
    }

    if (Object.prototype.hasOwnProperty.call(body, field.key)) {
      const value = body[field.key];
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      expect(
        actualType,
        `Field "${field.key}" expected type "${field.type}" but got "${actualType}"`,
      ).toBe(field.type);
    }
  }
}

export const UserSchema: SchemaField[] = [
  { key: 'id', type: 'number', required: true },
  { key: 'name', type: 'string', required: true },
  { key: 'username', type: 'string', required: true },
  { key: 'email', type: 'string', required: true },
  { key: 'phone', type: 'string', required: true },
  { key: 'website', type: 'string', required: true },
];

export const PostSchema: SchemaField[] = [
  { key: 'id', type: 'number', required: true },
  { key: 'userId', type: 'number', required: true },
  { key: 'title', type: 'string', required: true },
  { key: 'body', type: 'string', required: true },
];
