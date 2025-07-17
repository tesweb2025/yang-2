import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "AIzaSyBGPmo-WzowPYjnl3-CQYHsb-98k9eGbYU", // PERINGATAN: Tidak disarankan menaruh API key di sini.
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
