'use server';

import {genkit, ai} from 'genkit';
import {googleAI}s from '@genkit-ai/googleai';
import {z} from 'zod';

genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export {ai, z};
