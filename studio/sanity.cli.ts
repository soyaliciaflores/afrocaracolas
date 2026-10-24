import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'zw44t9i9',
    dataset: 'production',
  },
  // `npm run deploy` publica el Studio en https://afrocaracolas.sanity.studio
  studioHost: 'afrocaracolas',
  deployment: { appId: 'id8vjm25elaqsrsk00s8ta8k' },
});
