import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import * as z from 'zod';

const themeSchema = z.union([z.literal('light'), z.literal('dark')]);
export type Theme = z.infer<typeof themeSchema>;

const STORAGE_KEY = 'hezaerd-theme';

export const getThemeFn = createServerFn().handler(async () => {
  return (getCookie(STORAGE_KEY) || 'dark') as Theme;
});

export const setThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(themeSchema)
  .handler(async ({ data }) => {
    setCookie(STORAGE_KEY, data);
  });
