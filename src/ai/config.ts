
import {googleAI} from '@genkit-ai/googleai';
import next from '@genkit-ai/next';

export const genkitConfig = {
  plugins: [
    next(),
    googleAI({
      apiKey: 'AIzaSyAsV-2PwQZ4QxlkE9Jr-Vy4hoFZzR_SpR0',
    }),
  ],
  logLevel: 'debug' as const,
  enableTracingAndMetrics: true,
};
