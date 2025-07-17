import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import next from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: 'AIzaSyAsV-2PwQZ4QxlkE9Jr-Vy4hoFZzR_SpR0',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
