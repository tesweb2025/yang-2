/**
 * @fileoverview This file initializes the Genkit AI platform. It should be imported
 * ONLY once at the root of the application.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

// Logic to select the API key. Use GEMINI_API_KEY if available, otherwise fallback to GOOGLE_API_KEY.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export {z};
