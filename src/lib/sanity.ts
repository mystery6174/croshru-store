import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'uedbuwqv', // Paste your 8-character ID here
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
});