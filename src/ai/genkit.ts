import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';

configureGenkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = genkit;
