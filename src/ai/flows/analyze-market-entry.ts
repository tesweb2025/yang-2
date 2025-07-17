
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
  evaluation: z.string().describe('An evaluation of the market entry potential. Start with a bold one-liner like "Potensial banget!" or "Waduh, ini berisiko.".'),
  keyConsiderations: z
    .string()
    .describe('Key considerations for the e-commerce seller based on the analysis. Provide 1-2 sentences explaining why.'),
});
export type AnalyzeMarketEntryOutput = z.infer<typeof AnalyzeMarketEntryOutputSchema>;

export async function analyzeMarketEntry(input: AnalyzeMarketEntryInput): Promise<AnalyzeMarketEntryOutput> {
  return analyzeMarketEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketEntryPrompt',
  model: 'gemini-2.0-flash',
  input: {schema: AnalyzeMarketEntryInputSchema},
  output: {schema: AnalyzeMarketEntryOutputSchema},
  prompt: `Kamu adalah seorang Business Analyst AI yang ahli di pasar e-commerce Indonesia. Gaya bicaramu santai, to the point, dan mudah dimengerti UMKM.

Tugasmu adalah mengevaluasi kelayakan sebuah ide bisnis berdasarkan data berikut:

Nama Produk: {{{productName}}}
Target Pasar: {{{targetSegment}}}
Modal Awal (Bujet Promosi): Rp {{{initialMarketingBudget}}}
Ringkasan Finansial: {{{financialForecastSummary}}}
Kondisi Pasar: {{{marketConditionSummary}}}

**PENTING**: Gunakan HANYA informasi dari "Kondisi Pasar" di atas untuk konteks pasarnya. Jangan membuat asumsi tentang pasar berdasarkan nama produk.

Berdasarkan data di atas, berikan evaluasi singkat.
1.  **Evaluation**: Mulai dengan kalimat pembuka yang tegas. Contoh: "Potensial banget, bro!", "Wah, ini ide bagus!", atau "Waduh, ini strategi yang berisiko.".
2.  **Key Considerations**: Lanjutkan dengan 1-2 kalimat penjelasan singkat dan padat mengenai 'kenapa'-nya. Fokus pada poin paling krusial dari data yang ada (misal: profit tipis, target pasar terlalu luas, dll).

Buat seolah-olah kamu sedang memberi nasihat cepat ke teman bisnismu.
`,
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
