import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { nota } from './schemas/nota';

export default defineConfig({
  name: 'afrocaracolas',
  title: 'Afrocaracolas CMS',
  projectId: 'zw44t9i9',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [nota],
  },
});
