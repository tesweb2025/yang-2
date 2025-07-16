// src/ai/flows/generate-strategic-recommendations.ts
'use server';

/**
 * @fileOverview Generates strategic recommendations based on the simulation's outcome.
 *
 * - generateStrategicRecommendations - A function that generates a list of actionable recommendations.
 * - StrategicRecommendationsInput - The input type for the generateStrategicRecommendations function.
 * - StrategicRecommendationsOutput - The return type for the generateStrategicRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicRecommendationsInputSchema = z.object({
  annualRevenueProjection: z.number().describe('The projected annual revenue.'),
  annualProfitProjection: z.number().describe('The projected annual profit.'),
  roas: z.number().describe('The Return on Ad Spend (ROAS).'),
  monthlyProfitAndLossStatement: z.string().describe('The monthly profit and loss statement.'),
  monthlyCashFlowSimulation: z.string().describe('The monthly cash flow simulation.'),
  productName: z.string().describe('The name of the product or business.'),
  targetSegmentation: z.string().describe('The primary target segmentation.'),
  initialMarketingBudget: z.number().describe('The initial marketing budget.'),
  socialMediaAds: z.boolean().describe('Whether social media ads are used.'),
  endorsementKOL: z.boolean().describe('Whether endorsement and KOL marketing are used.'),
});
export type StrategicRecommendationsInput = z.infer<typeof StrategicRecommendationsInputSchema>;

const StrategicRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('A numbered list of actionable recommendations.')
  ),
});
export type StrategicRecommendationsOutput = z.infer<typeof StrategicRecommendationsOutputSchema>;

export async function generateStrategicRecommendations(
  input: StrategicRecommendationsInput
): Promise<StrategicRecommendationsOutput> {
  return generateStrategicRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicRecommendationsPrompt',
  input: {schema: StrategicRecommendationsInputSchema},
  output: {schema: StrategicRecommendationsOutputSchema},
  prompt: `You are an expert e-commerce business strategist specializing in the Indonesian market. Based on the provided business data and simulation outcomes, generate a numbered list of actionable recommendations to improve the business performance. Be concise and specific, suggesting concrete actions. Write the recommendation in Indonesian.

Here's the business data:

Product/Business Name: {{{productName}}}
Target Segmentation: {{{targetSegmentation}}}
Initial Marketing Budget: Rp {{{initialMarketingBudget}}}
Social Media Ads: {{#if socialMediaAds}}Yes{{else}}No{{/if}}
Endorsement & KOL: {{#if endorsementKOL}}Yes{{else}}No{{/if}}

Key Metrics:
Annual Revenue Projection: {{{annualRevenueProjection}}}
Annual Profit Projection: {{{annualProfitProjection}}}
Return on Ad Spend (ROAS): {{{roas}}}

Financial Tables:
Monthly Profit & Loss Statement: {{{monthlyProfitAndLossStatement}}}
Monthly Cash Flow Simulation: {{{monthlyCashFlowSimulation}}}


Generate a numbered list of strategic recommendations:
`,
});

const generateStrategicRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateStrategicRecommendationsFlow',
    inputSchema: StrategicRecommendationsInputSchema,
    outputSchema: StrategicRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
