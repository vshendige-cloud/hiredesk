import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/auth/password.ts';

describe('password hashing', () => {
  it('verifies the correct password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse battery staple');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery staple', stored)).toBe(true);
    expect(await verifyPassword('wrong', stored)).toBe(false);
  });
  it('salts each hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
  it('rejects malformed stored values', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
  });
});
