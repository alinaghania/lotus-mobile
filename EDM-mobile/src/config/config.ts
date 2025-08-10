import Constants from 'expo-constants';

const extras = (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};

export const AppConfig = {
  openAiApiKey: extras.OPENAI_API_KEY as string | undefined,
  mongodbUri: extras.MONGODB_URI as string | undefined,
  projectId: extras.PROJECT_ID as string | undefined,
  apiBaseUrl: extras.API_BASE_URL as string | undefined,
}; 