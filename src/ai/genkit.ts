import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import next from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY || "AIzaSyBGPmo-WzowPYjnl3-CQYHsb-98k9eGbYU",
    }),
  ],
});
