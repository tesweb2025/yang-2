
'use server';

/**
 * @fileOverview Generates strategic recommendations based on the simulation's outcome.
 *
 * - generateStrategicRecommendations - A function that generates a list of actionable recommendations.
 * - StrategicRecommendationsInput - The input type for the generateStrategicRecommendations function.
 * - StrategicRecommendationsOutput - The return type for the generateStrategicRecommendations function.
 */

import { z } from 'zod';
import { generativeModel } from '@/ai/genkit';

const StrategicRecommendationsInputSchema = z.object({
  productName: z.string().describe('The name of the product or business.'),
  targetSegmentation: z.string().describe('The primary target segmentation.'),
  selectedMarketingStrategies: z.array(z.string()).describe('List of marketing strategies selected by the user.'),
  monthlyProfitAndLossStatement: z.string().describe('The monthly profit and loss statement.'),
  monthlyCashFlowSimulation: z.string().describe('The monthly cash flow simulation.'),
  calculatedMarketingBudget: z.number().describe('The calculated monthly marketing budget.'),
  annualProfitProjection: z.number().describe('The projected annual profit.'),
  roas: z.number().describe('The Return on Ad Spend (ROAS).'),
  warnings: z.array(z.string()).describe('A list of logical warnings based on user input, e.g., BEP > Target Sales.'),
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

Tugasmu adalah memberikan 3-5 Rencana Aksi Prioritas berdasarkan data simulasi bisnis ini.

**Data Bisnis:**
- Nama Produk: ${validatedInput.productName}
- Target Pasar: ${validatedInput.targetSegmentation}
- Strategi Pemasaran Pilihan: ${validatedInput.selectedMarketingStrategies.join(', ')}
- Bujet Pemasaran: Rp ${validatedInput.calculatedMarketingBudget.toLocaleString('id-ID')}

**Hasil Simulasi Keuangan & Peringatan:**
- Proyeksi Untung Tahunan: Rp ${validatedInput.annualProfitProjection.toLocaleString('id-ID')}
- ROAS (Return on Ad Spend): ${validatedInput.roas.toFixed(2)}x
- Peringatan Logika: ${validatedInput.warnings.length > 0 ? validatedInput.warnings.join('. ') : 'Tidak ada.'}
- Laporan Untung Rugi Bulanan: ${validatedInput.monthlyProfitAndLossStatement}
- Arus Kas Bulanan: ${validatedInput.monthlyCashFlowSimulation}

**Instruksi:**
-   **Analisis Menyeluruh**: Cermati semua data, terutama \`Proyeksi Untung Tahunan\` dan \`Peringatan Logika\`.
-   **Prioritaskan Rekomendasi**:
    *   **Jika ada \`Peringatan Logika\`**: Jadikan solusi untuk peringatan itu sebagai rekomendasi PERTAMA. Contoh: Jika peringatan "BEP > Penjualan", rekomendasi pertama harus tentang "Cara menurunkan BEP atau menaikkan penjualan".
    *   **Jika \`Bujet Pemasaran\` adalah 0**: Fokuskan rekomendasi untuk menjelaskan mengapa hasil mungkin tidak akurat dan sarankan untuk mengalokasikan bujet.
    *   **Jika \`Untung Tahunan\` negatif (RUGI)**: Fokuskan rekomendasi pada cara membalikkan keadaan (efisiensi biaya, menaikkan harga, optimasi strategi).
    *   **Jika \`Untung Tahunan\` positif (UNTUNG)**: Fokuskan rekomendasi pada cara *scale-up* (meningkatkan bujet iklan secara bertahap, ekspansi channel, optimasi konversi).
-   **Buat Rekomendasi Spesifik & Kontekstual (3-5 poin)**:
    *   Sebutkan \`Nama Produk\` dalam rekomendasi jika relevan. Contoh: "Tingkatkan persepsi nilai untuk '${validatedInput.productName}' dengan..."
    *   Hubungkan rekomendasi dengan \`Target Pasar\`. Contoh: "Karena target Anda '${validatedInput.targetSegmentation}', fokuskan iklan di Instagram Reels dan TikTok."
    *   Rekomendasi harus berupa langkah taktis yang bisa langsung dikerjakan. Mulai setiap poin dengan kata kerja.
    *   Gunakan bahasa Indonesia yang santai dan jelas.

**Contoh Rekomendasi (Bujet Pemasaran = 0):**
-   "Kamu belum mengalokasikan anggaran pemasaran. Untuk mendapatkan proyeksi realistis, aktifkan setidaknya satu strategi promosi dengan biaya."
-   "Tanpa iklan atau diskon, hasil penjualan yang ditampilkan tidak mencerminkan potensi pertumbuhan dari strategi digital yang akurat."

**Contoh Rekomendasi (Rugi):**
-   "Turunkan BEP dengan negosiasi ulang HPP ke supplier agar bisa turun minimal 10%."
-   "Karena ROAS rendah, uji coba audiens iklan baru yang lebih spesifik untuk '${validatedInput.productName}'."
-   "Naikkan harga jual secara bertahap sebesar 5% untuk meningkatkan margin per produk."

**Contoh Rekomendasi (Untung):**
-   "Alokasikan 20% dari keuntungan bulanan untuk meningkatkan bujet iklan secara bertahap."
-   "Karena targetnya '${validatedInput.targetSegmentation}', buat konten video testimoni untuk meningkatkan kepercayaan."
-   "Pertimbangkan untuk membuat varian baru dari '${validatedInput.productName}' untuk menjangkau pasar yang lebih luas."

Pastikan outputmu adalah objek JSON yang valid, hanya berisi list string, sesuai dengan skema berikut:
{
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "dst..."]
}
`;

  const result = await generativeModel.generateContent(prompt);
  const responseText = result.response.text();
  try {
    const responseObject = JSON.parse(responseText);
    return StrategicRecommendationsOutputSchema.parse(responseObject);
  } catch (e) {
    console.error("Failed to parse AI response:", responseText);
    throw new Error("Gagal memproses respon dari AI. Coba lagi.");
  }
}
