import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GOOGLE_APPLICATION_CREDENTIALS),
        'process.env.GOOGLE_APPLICATION_CREDENTIALS': JSON.stringify(env.GOOGLE_APPLICATION_CREDENTIALS),
        'process.env.GOOGLE_CLOUD_PROJECT': JSON.stringify(env.GOOGLE_CLOUD_PROJECT),
        'process.env.GOOGLE_CLOUD_LOCATION': JSON.stringify(env.GOOGLE_CLOUD_LOCATION || 'us-central1')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
