import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    MONGODB_URI: process.env.MONGODB_URI || '',
    API_BASE_URL: process.env.API_BASE_URL || '',
    PROJECT_ID: config.extra?.PROJECT_ID || 'lotushealthedm',
  },
}); 