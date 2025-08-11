
import { z } from '@/ai/genkit';

/**
 * @fileOverview Shared types for AI flows.
 */

// Types for analyze-market-entry.ts
export const AnalyzeMarketEntryInputSchema = z.object({
  productName: z.string().describe('The name of the product or business.'),
  targetSegment: z.string().describe('The main target segment for the product.'),
  calculatedMarketingBudget: z
    .number()
    .describe('The calculated monthly marketing budget in Indonesian Rupiah (Rp).'),
  financialForecastSummary: z
    .string()
    .describe('A summary of the financial forecast, including projected revenue, profit, and cash flow. Contains key metrics like ROAS and BEP.'),
  marketConditionSummary: z
    .string()
    .describe('A summary of the current market conditions in the Indonesian e-commerce market.'),
});
export type AnalyzeMarketEntryInput = z.infer<typeof AnalyzeMarketEntryInputSchema>;

export const AnalyzeMarketEntryOutputSchema = z.object({
  evaluation: z.string().describe('An evaluation of the market entry potential. Start with a bold one-liner like "Potensial banget!" or "Waduh, ini berisiko.".'),
  keyConsiderations: z
    .string()
    .describe('Key considerations for the e-commerce seller based on the analysis. Provide 1-2 sentences explaining why.'),
});
export type AnalyzeMarketEntryOutput = z.infer<typeof AnalyzeMarketEntryOutputSchema>;


// Types for generate-strategic-recommendations.ts
export const StrategicRecommendationsInputSchema = z.object({
  productName: z.string().describe('The name of the product or business.'),
  targetSegmentation: z.string().describe('The primary target segmentation.'),
  selectedMarketingStrategies: z.array(z.string()).describe('List of marketing strategies selected by the user.'),
  monthlyProfitAndLossStatement: z.string().describe('The monthly profit and loss statement.'),
  monthlyCashFlowSimulation: z.string().describe('The monthly cash flow simulation.'),
  calculatedMarketingBudget: z.number().describe('The calculated monthly marketing budget.'),
  annualProfitProjection: z.number().describe('The projected annual profit.'),
  roas: z.number().describe('The Return on Ad Spend (ROAS).'),
  warningsSummary: z.string().describe('A summary string of logical warnings based on user input, e.g., "BEP > Target Sales." or "Tidak ada." if no warnings.'),
});
export type StrategicRecommendationsInput = z.infer<typeof StrategicRecommendationsInputSchema>;

export const StrategicRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('A single, actionable, and prioritized recommendation. Be specific and tactical.')
  ),
});
export type StrategicRecommendationsOutput = z.infer<typeof StrategicRecommendationsOutputSchema>;
