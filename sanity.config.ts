import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { nota } from './studio/schemas/nota';

export default defineConfig({
  projectId: 'zw44t9i9',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [nota],
  },
});
