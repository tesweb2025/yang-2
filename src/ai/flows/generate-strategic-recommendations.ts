
'use server';

/**
 * @fileOverview Generates strategic recommendations based on the simulation's outcome.
 *
 * - generateStrategicRecommendations - A function that generates a list of actionable recommendations.
 * - StrategicRecommendationsInput - The input type for the generateStrategicRecommendations function.
 * - StrategicRecommendationsOutput - The return type for the generateStrategicRecommendations function.
 */

import { z } from 'genkit';
import { generativeModel } from '@/ai/genkit';

const StrategicRecommendationsInputSchema = z.object({
  annualRevenueProjection: z.number().describe('The projected annual revenue.'),
  annualProfitProjection: z.number().describe('The projected annual profit.'),
  roas: z.number().describe('The Return on Ad Spend (ROAS).'),
  monthlyProfitAndLossStatement: z.string().describe('The monthly profit and loss statement.'),
  monthlyCashFlowSimulation: z.string().describe('The monthly cash flow simulation.'),
  productName: z.string().describe('The name of the product or business.'),
  targetSegmentation: z.string().describe('The primary target segmentation.'),
  initialMarketingBudget: z.number().describe('The initial marketing budget.'),
  selectedMarketingStrategies: z.array(z.string()).describe('List of marketing strategies selected by the user.'),
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
  const validatedInput = StrategicRecommendationsInputSchema.parse(input);

  const prompt = `Kamu adalah seorang Business Strategist AI yang jago banget ngasih saran praktis buat UMKM di Indonesia. Gaya bicaramu santai, memotivasi, dan solutif.

Tugasmu adalah memberikan 3-5 Rencana Aksi Prioritas berdasarkan data simulasi bisnis ini. Fokus pada saran yang paling besar dampaknya.

**Data Bisnis:**
- Nama Produk: ${validatedInput.productName}
- Target Pasar: ${validatedInput.targetSegmentation}
- Bujet Promosi Bulanan: Rp ${validatedInput.initialMarketingBudget}
- Strategi Pemasaran Pilihan: ${validatedInput.selectedMarketingStrategies.join(', ')}

**Hasil Simulasi Keuangan:**
- Proyeksi Omzet Tahunan: Rp ${validatedInput.annualRevenueProjection}
- Proyeksi Untung Tahunan: Rp ${validatedInput.annualProfitProjection}
- ROAS (Return on Ad Spend): ${validatedInput.roas}x
- Laporan Untung Rugi Bulanan: ${validatedInput.monthlyProfitAndLossStatement}
- Arus Kas Bulanan: ${validatedInput.monthlyCashFlowSimulation}

**Instruksi:**
1.  Analisis semua data di atas. Cari di mana letak "kebocoran" atau "potensi" terbesarnya.
2.  Berikan 3-5 rekomendasi dalam bentuk list.
3.  Setiap rekomendasi harus berupa langkah taktis yang bisa langsung dikerjakan, dan harus relevan dengan strategi pemasaran yang dipilih. Contoh: "Karena memilih KOL, fokuskan bujet iklan ke KOL micro-niche di kategori parenting", "Naikkan harga jual sebesar 10% jadi Rp XX.XXX", "Cari supplier baru untuk turunkan HPP sebesar Rp X.XXX".
4.  Gunakan bahasa Indonesia yang santai dan jelas. Mulai setiap poin dengan kata kerja.
5.  Jika hasilnya rugi, berikan saran yang fokus untuk membalikkan keadaan. Jika sudah untung, berikan saran untuk scale-up.

Contoh output item: "Naikin harga pelan-pelan sambil tetap pantau kompetitor" atau "Tekan biaya operasional bulanan Rp 4 juta".

Pastikan outputmu adalah objek JSON yang valid dan hanya berisi list string, sesuai dengan skema berikut:
{
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "dst..."]
}
`;

  const result = await generativeModel.generateContent(prompt);
  const responseText = result.response.text();
  const responseObject = JSON.parse(responseText);

  return StrategicRecommendationsOutputSchema.parse(responseObject);
}
