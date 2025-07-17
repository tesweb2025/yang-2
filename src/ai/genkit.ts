import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "PASTE_YOUR_API_KEY_HERE", // PERINGATAN: Tidak disarankan menaruh API key di sini.
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
