import { describe, it, expect } from 'vitest';
import { readPublicConfig } from './config';
describe('public configuration', () => {
 it('fails closed without both settings', () => { expect(readPublicConfig({})).toBeNull(); expect(readPublicConfig({VITE_SUPABASE_URL:'https://example.supabase.co'})).toBeNull(); });
 it('rejects malformed URLs and private keys', () => {
  expect(readPublicConfig({VITE_SUPABASE_URL:'bad',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'})).toBeNull();
  expect(readPublicConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_do_not_ship'})).toBeNull();
  const token = `x.${btoa(JSON.stringify({role:'service_role'}))}.x`;
  expect(readPublicConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:token})).toBeNull();
 });
 it('accepts a publishable key with a valid project URL', () => { expect(readPublicConfig({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'})).toEqual({url:'https://example.supabase.co',publishableKey:'sb_publishable_example'}); });
});
