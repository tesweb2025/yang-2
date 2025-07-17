import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyAsV-2PwQZ4QxlkE9Jr-Vy4hoFZzR_SpR0',
    }),
  ],
});
