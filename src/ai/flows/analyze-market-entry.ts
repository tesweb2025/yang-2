'use server';

/**
 * @fileOverview An AI agent that evaluates market entry potential for e-commerce sellers.
 *
 * - analyzeMarketEntry - A function that analyzes market entry potential.
 * - AnalyzeMarketEntryInput - The input type for the analyzeMarketEntry function.
 * - AnalyzeMarketEntryOutput - The return type for the analyzeMarketEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketEntryInputSchema = z.object({
  productName: z.string().describe('The name of the product or business.'),
  targetSegment: z.string().describe('The main target segment for the product.'),
  initialMarketingBudget: z
    .number()
    .describe('The initial marketing budget in Indonesian Rupiah (Rp).'),
  financialForecastSummary: z
    .string()
    .describe('A summary of the financial forecast, including projected revenue, profit, and cash flow.'),
  marketConditionSummary: z
    .string()
    .describe('A summary of the current market conditions in the Indonesian e-commerce market.'),
});
export type AnalyzeMarketEntryInput = z.infer<typeof AnalyzeMarketEntryInputSchema>;

const AnalyzeMarketEntryOutputSchema = z.object({
  evaluation: z.string().describe('An evaluation of the market entry potential.'),
  keyConsiderations: z
    .string()
    .describe('Key considerations for the e-commerce seller based on the analysis.'),
});
export type AnalyzeMarketEntryOutput = z.infer<typeof AnalyzeMarketEntryOutputSchema>;

export async function analyzeMarketEntry(input: AnalyzeMarketEntryInput): Promise<AnalyzeMarketEntryOutput> {
  return analyzeMarketEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketEntryPrompt',
  input: {schema: AnalyzeMarketEntryInputSchema},
  output: {schema: AnalyzeMarketEntryOutputSchema},
  prompt: `You are an AI-powered market analyst specializing in the Indonesian e-commerce market.

You will evaluate the market entry potential for an e-commerce seller based on the provided product details, target segment, initial marketing budget, financial forecast summary, and market condition summary.

Product Name: {{{productName}}}
Target Segment: {{{targetSegment}}}
Initial Marketing Budget (Rp): {{{initialMarketingBudget}}}
Financial Forecast Summary: {{{financialForecastSummary}}}
Market Condition Summary: {{{marketConditionSummary}}}

Provide a detailed evaluation of the market entry potential, including key considerations for the seller.  Consider both the financial forecast and the overall market conditions.`,
});

const analyzeMarketEntryFlow = ai.defineFlow(
  {
    name: 'analyzeMarketEntryFlow',
    inputSchema: AnalyzeMarketEntryInputSchema,
    outputSchema: AnalyzeMarketEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
