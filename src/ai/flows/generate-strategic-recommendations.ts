
'use server';

/**
 * @fileOverview Generates strategic recommendations based on the simulation's outcome.
 *
 * - generateStrategicRecommendations - A function that generates a list of actionable recommendations.
 */

import { ai } from '@/ai/genkit';
import {
    StrategicRecommendationsInputSchema,
    StrategicRecommendationsOutputSchema,
    type StrategicRecommendationsInput,
    type StrategicRecommendationsOutput
} from './types';


const generateStrategicRecommendationsPrompt = ai.definePrompt({
  name: 'generateStrategicRecommendationsPrompt',
  input: { schema: StrategicRecommendationsInputSchema },
  output: { schema: StrategicRecommendationsOutputSchema },
  prompt: `Kamu adalah seorang Business Strategist AI yang jago banget ngasih saran praktis buat UMKM di Indonesia. Gaya bicaramu santai, memotivasi, dan solutif.

Tugasmu adalah memberikan 3-5 Rencana Aksi Prioritas berdasarkan data simulasi bisnis ini.

**Data Bisnis:**
- Nama Produk: {{{productName}}}
- Target Pasar: {{{targetSegmentation}}}
- Strategi Pemasaran Pilihan: {{#each selectedMarketingStrategies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Budget Pemasaran: Rp {{calculatedMarketingBudget}}

**Hasil Simulasi Keuangan & Peringatan:**
- Proyeksi Untung Tahunan: Rp {{annualProfitProjection}}
- ROAS (Return on Ad Spend): {{roas}}x
- Peringatan Logika: {{{warningsSummary}}}
- Laporan Untung Rugi Bulanan: {{{monthlyProfitAndLossStatement}}}
- Arus Kas Bulanan: {{{monthlyCashFlowSimulation}}}

**Instruksi:**
-   **Analisis Menyeluruh**: Cermati semua data, terutama \`Proyeksi Untung Tahunan\` dan \`Peringatan Logika\`.
-   **Prioritaskan Rekomendasi**:
    *   **Jika ada \`Peringatan Logika\` yang signifikan (selain "Tidak ada.")**: Jadikan solusi untuk peringatan itu sebagai rekomendasi PERTAMA. Contoh: Jika peringatan "BEP > Penjualan", rekomendasi pertama harus tentang "Cara menurunkan BEP atau menaikkan penjualan".
    *   **Jika \`Budget Pemasaran\` adalah 0**: Fokuskan rekomendasi untuk menjelaskan mengapa hasil mungkin tidak akurat dan sarankan untuk mengalokasikan budget.
    *   **Jika \`Untung Tahunan\` negatif (RUGI)**: Fokuskan rekomendasi pada cara membalikkan keadaan (efisiensi biaya, menaikkan harga, optimasi strategi).
    *   **Jika \`Untung Tahunan\` positif (UNTUNG)**: Fokuskan rekomendasi pada cara *scale-up* (meningkatkan budget iklan secara bertahap, ekspansi channel, optimasi konversi).
-   **Buat Rekomendasi Spesifik & Kontekstual (3-5 poin)**:
    *   Sebutkan \`Nama Produk\` dalam rekomendasi jika relevan. Contoh: "Tingkatkan persepsi nilai untuk '{{{productName}}}' dengan..."
    *   Hubungkan rekomendasi dengan \`Target Pasar\`. Contoh: "Karena target Anda '{{{targetSegmentation}}}', fokuskan iklan di Instagram Reels dan TikTok."
    *   Rekomendasi harus berupa langkah taktis yang bisa langsung dikerjakan. Mulai setiap poin dengan kata kerja.
    *   Gunakan bahasa Indonesia yang santai dan jelas.

**Contoh Rekomendasi (Budget Pemasaran = 0):**
-   "Kamu belum mengalokasikan anggaran pemasaran. Untuk mendapatkan proyeksi realistis, aktifkan setidaknya satu strategi promosi dengan biaya."
-   "Tanpa iklan atau diskon, hasil penjualan yang ditampilkan tidak mencerminkan potensi pertumbuhan dari strategi digital yang akurat."

**Contoh Rekomendasi (Rugi):**
-   "Turunkan BEP dengan negosiasi ulang HPP ke supplier agar bisa turun minimal 10%."
-   "Karena ROAS rendah, uji coba audiens iklan baru yang lebih spesifik untuk '{{{productName}}}'."
-   "Naikkan harga jual secara bertahap sebesar 5% untuk meningkatkan margin per produk."

**Contoh Rekomendasi (Untung):**
-   "Alokasikan 20% dari keuntungan bulanan untuk meningkatkan budget iklan secara bertahap."
-   "Karena targetnya '{{{targetSegmentation}}}', buat konten video testimoni untuk meningkatkan kepercayaan."
-   "Pertimbangkan untuk membuat varian baru dari '{{{productName}}}' untuk menjangkau pasar yang lebih luas."

Pastikan outputmu adalah objek JSON yang valid, hanya berisi list string, sesuai dengan skema berikut:
{
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "dst..."]
}
`
});

const generateStrategicRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateStrategicRecommendationsFlow',
    inputSchema: StrategicRecommendationsInputSchema,
    outputSchema: StrategicRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await generateStrategicRecommendationsPrompt(input);
    return output!;
  }
);


export async function generateStrategicRecommendations(
  input: StrategicRecommendationsInput
): Promise<StrategicRecommendationsOutput> {
  return generateStrategicRecommendationsFlow(input);
}
