import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';

configureGenkit({
  plugins: [
    next(),
    googleAI({
      apiKey: "AIzaSyBGPmo-WzowPYjnl3-CQYHsb-98k9eGbYU",
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = genkit;
