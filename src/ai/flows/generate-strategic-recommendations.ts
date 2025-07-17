
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
});
export type StrategicRecommendationsInput = z.infer<typeof StrategicRecommendationsInputSchema>;

const StrategicRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('A single, actionable, and prioritized recommendation. Be specific and tactical.')
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
  prompt: `Kamu adalah seorang Business Strategist AI yang jago banget ngasih saran praktis buat UMKM di Indonesia. Gaya bicaramu santai, memotivasi, dan solutif.

Tugasmu adalah memberikan 3-5 Rencana Aksi Prioritas berdasarkan data simulasi bisnis ini. Fokus pada saran yang paling besar dampaknya.

**Data Bisnis:**
- Nama Produk: {{{productName}}}
- Target Pasar: {{{targetSegmentation}}}
- Bujet Promosi Bulanan: Rp {{{initialMarketingBudget}}}

**Hasil Simulasi Keuangan:**
- Proyeksi Omzet Tahunan: Rp {{{annualRevenueProjection}}}
- Proyeksi Untung Tahunan: Rp {{{annualProfitProjection}}}
- ROAS (Return on Ad Spend): {{{roas}}}x
- Laporan Untung Rugi Bulanan: {{{monthlyProfitAndLossStatement}}}
- Arus Kas Bulanan: {{{monthlyCashFlowSimulation}}}

**Instruksi:**
1.  Analisis semua data di atas. Cari di mana letak "kebocoran" atau "potensi" terbesarnya.
2.  Berikan 3-5 rekomendasi dalam bentuk list.
3.  Setiap rekomendasi harus berupa langkah taktis yang bisa langsung dikerjakan. Contoh: "Naikkan harga jual sebesar 10% jadi Rp XX.XXX", "Cari supplier baru untuk turunkan HPP sebesar Rp X.XXX", atau "Fokuskan bujet iklan ke KOL micro-niche di kategori parenting".
4.  Gunakan bahasa Indonesia yang santai dan jelas. Mulai setiap poin dengan kata kerja.
5.  Jika hasilnya rugi, berikan saran yang fokus untuk membalikkan keadaan. Jika sudah untung, berikan saran untuk scale-up.

Contoh output item: "Naikin harga pelan-pelan sambil tetap pantau kompetitor" atau "Tekan biaya operasional bulanan Rp 4 juta".

Buat daftar Rencana Aksi Prioritas:
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
