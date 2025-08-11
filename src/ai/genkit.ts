/**
 * @fileoverview This file initializes the Genkit AI platform. It should be imported
 * ONLY once at the root of the application.
 */
import {genkit, ai} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
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
