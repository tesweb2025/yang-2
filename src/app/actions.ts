
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
  otherCostsPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  fixedCostsPerMonth: z.coerce.number().min(0, "Biaya tetap harus positif").optional().default(0),
  avgSalesPerMonth: z.coerce.number().min(1, "Target penjualan minimal 1 unit"),
  
  costMode: z.enum(['budget', 'cac']),
  totalMarketingBudget: z.coerce.number().min(0, "Budget harus positif").optional().default(0),
  targetCAC: z.coerce.number().min(0, "CAC harus positif").optional().default(0),

  useVideoContent: z.boolean().optional().default(false),
  useKOL: z.boolean().optional().default(false),
  usePromo: z.boolean().optional().default(false),
  useOtherChannels: z.boolean().optional().default(false),
}).refine(data => {
    const marketingStrategiesSelected = data.useVideoContent || data.useKOL || data.usePromo || data.useOtherChannels;
    if (!marketingStrategiesSelected) {
        return true; 
    }
    if (data.costMode === 'budget') {
        return data.totalMarketingBudget > 0;
    }
    if (data.costMode === 'cac') {
        return data.targetCAC > 0;
    }
    return false;
}, {
    message: "Biaya pemasaran harus diisi (tidak boleh nol)",
    path: ["totalMarketingBudget"],
});


type FormData = z.infer<typeof formSchema>;

export async function runAnalysis(data: FormData) {
  const validatedData = formSchema.parse(data);

  const { 
    sellPrice, 
    costOfGoods, 
    otherCostsPercentage, 
    fixedCostsPerMonth, 
    avgSalesPerMonth: targetUnits,
    costMode,
    totalMarketingBudget: inputBudget,
    targetCAC,
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

  // Determine the actual marketing budget used for calculation
  const calculatedMarketingBudget = costMode === 'budget'
    ? (inputBudget || 0)
    : (targetCAC || 0) * targetUnits;
  
  // Marketing Strategy Logic
  let effectivenessFactor = 1;
  const hasMarketingSpend = calculatedMarketingBudget > 0;
  
  if (hasMarketingSpend) {
    if (useVideoContent) effectivenessFactor += 0.8;
    if (useKOL) effectivenessFactor += 0.6;
    if (usePromo) effectivenessFactor += 0.4;
    if (useOtherChannels) effectivenessFactor += 0.3;
  }

  const soldUnits = Math.floor(targetUnits * 0.6 + (targetUnits * 0.4 * effectivenessFactor / 2.1));
  
  // --- FINANCIAL CALCULATIONS ---
  // Monthly
  const monthlyRevenue = sellPrice * soldUnits;
  const annualRevenue = monthlyRevenue * 12;
  const monthlyCostOfGoods = costOfGoods * soldUnits;
  const monthlyOtherVariableCosts = monthlyRevenue * (otherCostsPercentage / 100);
  const totalVariableCosts = monthlyCostOfGoods + monthlyOtherVariableCosts;
  const totalMonthlyCosts = totalVariableCosts + fixedCostsPerMonth + calculatedMarketingBudget;
  const monthlyProfit = monthlyRevenue - totalMonthlyCosts;
  const annualProfit = monthlyProfit * 12;

  // Weekly (approximated)
  const weeklySoldUnits = Math.floor(soldUnits / 4);
  const weeklyRevenue = monthlyRevenue / 4;
  const weeklyCostOfGoods = monthlyCostOfGoods / 4;
  const weeklyOtherVariableCosts = monthlyOtherVariableCosts / 4;
  const weeklyFixedCosts = fixedCostsPerMonth / 4;
  const weeklyMarketingBudget = calculatedMarketingBudget / 4;
  const weeklyProfit = monthlyProfit / 4;

  // ROAS Calculation
  const roas = calculatedMarketingBudget > 0 ? monthlyRevenue / calculatedMarketingBudget : 0;
  
  // BEP Calculation
  const profitPerUnitExcludingMarketing = sellPrice - costOfGoods - (sellPrice * (otherCostsPercentage / 100));
  const bepUnit = profitPerUnitExcludingMarketing > 0 
    ? Math.ceil((fixedCostsPerMonth + calculatedMarketingBudget) / profitPerUnitExcludingMarketing) 
    : Infinity;

  // --- WARNINGS ---
  const warnings = [];
  if ((useVideoContent || useKOL || usePromo || useOtherChannels) && calculatedMarketingBudget === 0) {
    warnings.push("Strategi pemasaran diaktifkan tapi Budget pemasaran nol. Hasil simulasi mungkin tidak akurat karena tidak ada biaya iklan yang dihitung.");
  }
  if (calculatedMarketingBudget > 0 && roas < 1) {
    warnings.push("Iklan kamu belum balik modal (ROAS < 1). Perlu evaluasi konten atau targeting iklan.");
  }
  if (isFinite(bepUnit) && bepUnit > soldUnits) {
    warnings.push("Target penjualanmu belum bisa menutupi biaya (BEP > Penjualan Aktual). Atur ulang harga, biaya, atau target volume.");
  }

  // --- P&L and Cashflow Tables ---
  // Monthly Tables
  const grossProfit = monthlyRevenue - monthlyCostOfGoods;
  const pnlTable = [
    { item: `Omzet Bulanan (dari ${soldUnits} unit)`, value: monthlyRevenue, isNegative: false },
    { item: 'Modal Produk (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor', value: grossProfit, isNegative: grossProfit < 0 },
    { item: `Biaya Variabel Lainnya (${otherCostsPercentage}%)`, value: monthlyOtherVariableCosts, isNegative: true },
    { item: 'Biaya Tetap Bulanan', value: fixedCostsPerMonth, isNegative: true },
    { item: 'Biaya Pemasaran (Budget)', value: calculatedMarketingBudget, isNegative: true },
    { item: 'Untung Bersih Bulanan', value: monthlyProfit, isNegative: monthlyProfit < 0 },
  ];
  const netCashFlow = monthlyRevenue - (monthlyCostOfGoods + monthlyOtherVariableCosts + fixedCostsPerMonth + calculatedMarketingBudget);
  const cashflowTable = [
    { item: 'Duit Masuk dari Penjualan', value: monthlyRevenue, isNegative: false },
    { item: 'Duit Keluar: Modal Produk (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor (Non-operasional)', value: grossProfit, isNegative: grossProfit < 0, isPlaceholder: true },
    { item: `Duit Keluar: Biaya Variabel Lain (${otherCostsPercentage}%)`, value: monthlyOtherVariableCosts, isNegative: true },
    { item: 'Duit Keluar: Biaya Tetap', value: fixedCostsPerMonth, isNegative: true },
    { item: 'Duit Keluar: Budget Pemasaran', value: calculatedMarketingBudget, isNegative: true },
    { item: 'Arus Kas Bersih', value: netCashFlow, isNegative: netCashFlow < 0 },
  ];

  // Weekly Tables
  const weeklyGrossProfit = weeklyRevenue - weeklyCostOfGoods;
  const pnlTableWeekly = [
    { item: `Omzet Mingguan (dari ${weeklySoldUnits} unit)`, value: weeklyRevenue, isNegative: false },
    { item: 'Modal Produk (HPP)', value: weeklyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor', value: weeklyGrossProfit, isNegative: weeklyGrossProfit < 0 },
    { item: `Biaya Variabel Lainnya (${otherCostsPercentage}%)`, value: weeklyOtherVariableCosts, isNegative: true },
    { item: 'Biaya Tetap Mingguan', value: weeklyFixedCosts, isNegative: true },
    { item: 'Biaya Pemasaran (Budget)', value: weeklyMarketingBudget, isNegative: true },
    { item: 'Untung Bersih Mingguan', value: weeklyProfit, isNegative: weeklyProfit < 0 },
  ];
  const weeklyNetCashFlow = weeklyRevenue - (weeklyCostOfGoods + weeklyOtherVariableCosts + weeklyFixedCosts + weeklyMarketingBudget);
  const cashflowTableWeekly = [
    { item: 'Duit Masuk dari Penjualan', value: weeklyRevenue, isNegative: false },
    { item: 'Duit Keluar: Modal Produk (HPP)', value: weeklyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor (Non-operasional)', value: weeklyGrossProfit, isNegative: weeklyGrossProfit < 0, isPlaceholder: true },
    { item: `Duit Keluar: Biaya Variabel Lain (${otherCostsPercentage}%)`, value: weeklyOtherVariableCosts, isNegative: true },
    { item: 'Duit Keluar: Biaya Tetap', value: weeklyFixedCosts, isNegative: true },
    { item: 'Duit Keluar: Budget Pemasaran', value: weeklyMarketingBudget, isNegative: true },
    { item: 'Arus Kas Bersih', value: weeklyNetCashFlow, isNegative: weeklyNetCashFlow < 0 },
  ];
  
  // --- AI Flow Inputs ---
  const financialForecastSummary = `Proyeksi omzet tahunan: Rp ${annualRevenue.toLocaleString('id-ID')}. Proyeksi untung tahunan: Rp ${annualProfit.toLocaleString('id-ID')}. ROAS: ${roas.toFixed(2)}x. BEP: ${isFinite(bepUnit) ? `${Math.ceil(bepUnit)} unit/bulan` : 'Tidak tercapai'}.`;
  
  const marketConditionSummary = "Pasar e-commerce Indonesia sangat kompetitif, didominasi oleh Shopee dan TikTok Shop. Konsumen sensitif harga dan suka promo. Pertumbuhan didorong oleh adopsi digital di kota-kota lapis kedua dan ketiga.";
  
  const [marketAnalysis, strategicPlan] = await Promise.all([
    analyzeMarketEntry({
        productName: validatedData.productName,
        targetSegment: validatedData.targetSegment,
        calculatedMarketingBudget,
        financialForecastSummary,
        marketConditionSummary
    }),
    generateStrategicRecommendations({
        productName: validatedData.productName,
        targetSegmentation: validatedData.targetSegment,
        calculatedMarketingBudget,
        selectedMarketingStrategies: selectedStrategies,
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
    pnlTableWeekly,
    cashflowTableWeekly,
    marketAnalysis,
    strategicPlan,
    warnings,
    soldUnits,
    targetUnits,
    calculatedMarketingBudget,
  };
}
