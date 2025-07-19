
"use server";

import { z } from "zod";
import { analyzeMarketEntry } from "@/ai/flows/analyze-market-entry";
import { generateStrategicRecommendations } from "@/ai/flows/generate-strategic-recommendations";

const formSchema = z.object({
  productName: z.string().min(1, "Nama produk harus diisi"),
  targetSegment: z.string().min(1, "Segmentasi target harus diisi"),
  marginModel: z.enum(['tipis', 'tebal']),
  brandStrength: z.enum(['baru', 'kuat']),
  sellPrice: z.coerce.number().min(100, "Harga jual minimal Rp 100"),
  costOfGoods: z.coerce.number().min(1, "HPP harus lebih dari 0"),
  adCost: z.coerce.number().min(0, "Biaya iklan harus positif").optional().default(0),
  otherCostsPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  fixedCostsPerMonth: z.coerce.number().min(0, "Biaya tetap harus positif").optional().default(0),
  avgSalesPerMonth: z.coerce.number().min(1, "Target penjualan minimal 1 unit"),
  totalMarketingBudget: z.coerce.number().min(0, "Bujet harus positif").optional().default(0),
  useVideoContent: z.boolean().optional().default(false),
  useKOL: z.boolean().optional().default(false),
  usePromo: z.boolean().optional().default(false),
  useOtherChannels: z.boolean().optional().default(false),
});

type FormData = z.infer<typeof formSchema>;

export async function runAnalysis(data: FormData) {
  const validatedData = formSchema.parse(data);

  const { 
    sellPrice, 
    costOfGoods, 
    adCost, 
    otherCostsPercentage, 
    fixedCostsPerMonth, 
    avgSalesPerMonth: targetUnits,
    totalMarketingBudget,
    useVideoContent,
    useKOL,
    usePromo,
    useOtherChannels
  } = validatedData;
  
  const selectedStrategies = [];
  if (useVideoContent) selectedStrategies.push("Video Content & Ads");
  if (useKOL) selectedStrategies.push("KOL & Afiliasi");
  if (usePromo) selectedStrategies.push("Promosi & Diskon");
  if (useOtherChannels) selectedStrategies.push("Kanal Lainnya");

  // Marketing Strategy Logic
  let effectivenessFactor = 1;
  if (useVideoContent) effectivenessFactor += 0.8;
  if (useKOL) effectivenessFactor += 0.6;
  if (usePromo) effectivenessFactor += 0.4;
  if (useOtherChannels) effectivenessFactor += 0.3;

  const soldUnits = Math.floor(targetUnits * 0.6 + (targetUnits * 0.4 * effectivenessFactor / 2.1));
  
  // Financial Calculations
  const monthlyRevenue = sellPrice * soldUnits;
  const annualRevenue = monthlyRevenue * 12;
  const monthlyCostOfGoods = costOfGoods * soldUnits;
  const monthlyAdCost = adCost * soldUnits;
  const monthlyOtherVariableCosts = monthlyRevenue * (otherCostsPercentage / 100);
  const totalVariableCosts = monthlyCostOfGoods + monthlyAdCost + monthlyOtherVariableCosts;
  const totalCosts = totalVariableCosts + fixedCostsPerMonth + totalMarketingBudget;
  const monthlyProfit = monthlyRevenue - totalCosts;
  const annualProfit = monthlyProfit * 12;
  const roas = totalMarketingBudget > 0 ? monthlyRevenue / totalMarketingBudget : 0;
  
  // BEP Calculation
  const profitPerUnit = sellPrice - costOfGoods - adCost - (sellPrice * (otherCostsPercentage / 100));
  const bepUnit = profitPerUnit > 0 ? Math.ceil((fixedCostsPerMonth + totalMarketingBudget) / profitPerUnit) : Infinity;

  // Warnings
  const warnings = [];
  if ((useVideoContent || useKOL) && adCost === 0 && totalMarketingBudget === 0) {
    warnings.push("Strategi iklan/KOL aktif tapi biaya CAC dan bujet pemasaran nol. Ini tidak realistis.");
  }
  if (roas < 1 && totalMarketingBudget > 0) {
    warnings.push("Iklan kamu belum balik modal (ROAS < 1). Perlu evaluasi konten atau targeting iklan.");
  }
  if (isFinite(bepUnit) && bepUnit > targetUnits) {
    warnings.push("Target penjualanmu belum bisa menutupi biaya tetap (BEP > Target). Atur ulang harga atau target volume.");
  }

  // P&L Table Data
  const grossProfit = monthlyRevenue - monthlyCostOfGoods;
  const operationalCosts = monthlyAdCost + monthlyOtherVariableCosts + fixedCostsPerMonth;
  
  const pnlTable = [
    { item: 'Omzet Bulanan (dari '+ soldUnits +' unit)', value: monthlyRevenue, isNegative: false },
    { item: 'Modal Produk (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor', value: grossProfit, isNegative: grossProfit < 0 },
    { item: 'Biaya Operasional (termasuk CAC)', value: operationalCosts, isNegative: true },
    { item: 'Biaya Pemasaran (Bujet)', value: totalMarketingBudget, isNegative: true },
    { item: 'Untung Bersih Bulanan', value: monthlyProfit, isNegative: monthlyProfit < 0 },
  ];

  // Cashflow Table Data
  const netCashFlow = monthlyRevenue - totalVariableCosts - fixedCostsPerMonth - totalMarketingBudget;

  const cashflowTable = [
    { item: 'Duit Masuk dari Penjualan', value: monthlyRevenue, isNegative: false },
    { item: 'Duit Keluar buat Modal (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Duit Keluar buat Iklan (per penjualan)', value: monthlyAdCost, isNegative: true },
    { item: 'Duit Keluar buat Biaya Lain', value: monthlyOtherVariableCosts + fixedCostsPerMonth, isNegative: true },
    { item: 'Duit Keluar buat Bujet Pemasaran', value: totalMarketingBudget, isNegative: true },
    { item: 'Arus Kas Bersih', value: netCashFlow, isNegative: netCashFlow < 0 },
  ];
  
  const financialForecastSummary = `Proyeksi omzet tahunan: Rp ${annualRevenue.toLocaleString('id-ID')}. Proyeksi untung tahunan: Rp ${annualProfit.toLocaleString('id-ID')}. ROAS: ${roas.toFixed(2)}x. BEP: ${isFinite(bepUnit) ? `${Math.ceil(bepUnit)} unit/bulan` : 'Tidak tercapai'}.`;
  
  const marketConditionSummary = "Pasar e-commerce Indonesia sangat kompetitif, didominasi oleh Shopee dan TikTok Shop. Konsumen sensitif harga dan suka promo. Pertumbuhan didorong oleh adopsi digital di kota-kota lapis kedua dan ketiga.";
  
  const [marketAnalysis, strategicPlan] = await Promise.all([
    analyzeMarketEntry({
        productName: validatedData.productName,
        targetSegment: validatedData.targetSegment,
        initialMarketingBudget: totalMarketingBudget,
        financialForecastSummary,
        marketConditionSummary
    }),
    generateStrategicRecommendations({
        productName: validatedData.productName,
        targetSegmentation: validatedData.targetSegment,
        initialMarketingBudget: totalMarketingBudget,
        selectedMarketingStrategies: selectedStrategies,
        annualRevenueProjection: annualRevenue,
        annualProfitProjection: annualProfit,
        roas,
        monthlyProfitAndLossStatement: JSON.stringify(pnlTable.map(p => `${p.item}: Rp ${p.value.toLocaleString('id-ID')}`)),
        monthlyCashFlowSimulation: JSON.stringify(cashflowTable.map(c => `${c.item}: Rp ${c.value.toLocaleString('id-ID')}`)),
        warnings,
    })
  ]);

  return {
    annualRevenue,
    annualProfit,
    roas,
    bepUnit,
    pnlTable,
    cashflowTable,
    marketAnalysis,
    strategicPlan,
    warnings,
    soldUnits,
    targetUnits
  };
}
