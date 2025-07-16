"use server";

import { z } from "zod";
import { analyzeMarketEntry } from "@/ai/flows/analyze-market-entry";
import { generateStrategicRecommendations } from "@/ai/flows/generate-strategic-recommendations";

const formSchema = z.object({
  productName: z.string().min(1, "Nama produk harus diisi"),
  targetSegment: z.string().min(1, "Segmentasi target harus diisi"),
  initialMarketingBudget: z.coerce.number().min(0, "Modal tidak boleh negatif"),
  marginModel: z.enum(['tipis', 'tebal']),
  brandStrength: z.enum(['baru', 'kuat']),
  sellPrice: z.coerce.number().min(0, "Harga harus positif"),
  costOfGoods: z.coerce.number().min(0, "HPP harus positif"),
  adCost: z.coerce.number().min(0, "Biaya iklan harus positif"),
  otherCostsPercentage: z.coerce.number().min(0).max(100),
  fixedCostsPerMonth: z.coerce.number().min(0, "Biaya tetap harus positif"),
  avgSalesPerMonth: z.coerce.number().min(0, "Penjualan harus positif"),
  totalMarketingBudget: z.coerce.number().min(0, "Bujet harus positif"),
  useSocialMediaAds: z.boolean(),
  useKOLs: z.boolean(),
  useVideoContent: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export async function runAnalysis(data: FormData) {
  // Financial Calculations
  const monthlyRevenue = data.sellPrice * data.avgSalesPerMonth;
  const annualRevenue = monthlyRevenue * 12;
  const monthlyCostOfGoods = data.costOfGoods * data.avgSalesPerMonth;
  const grossProfit = monthlyRevenue - monthlyCostOfGoods;
  const otherVariableCosts = (data.adCost * data.avgSalesPerMonth) + (monthlyRevenue * data.otherCostsPercentage / 100);
  const operationalCosts = otherVariableCosts + data.totalMarketingBudget + data.fixedCostsPerMonth;
  const monthlyProfit = grossProfit - operationalCosts;
  const annualProfit = monthlyProfit * 12;
  const roas = data.totalMarketingBudget > 0 ? monthlyRevenue / data.totalMarketingBudget : 0;
  
  // P&L Table Data
  const pnlTable = [
    { item: 'Pendapatan', value: monthlyRevenue, isNegative: false },
    { item: 'Harga Pokok Penjualan (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Laba Kotor', value: grossProfit, isNegative: grossProfit < 0 },
    { item: 'Biaya Operasional', value: operationalCosts, isNegative: true },
    { item: 'Laba Bersih (Net Profit)', value: monthlyProfit, isNegative: monthlyProfit < 0 },
  ];

  // Cashflow Table Data
  const cashIn = monthlyRevenue;
  const cashOutHpp = monthlyCostOfGoods;
  const cashOutAdCost = data.adCost * data.avgSalesPerMonth;
  const cashOutOtherFixed = (monthlyRevenue * data.otherCostsPercentage / 100) + data.fixedCostsPerMonth + data.totalMarketingBudget;
  const netCashFlow = cashIn - cashOutHpp - cashOutAdCost - cashOutOtherFixed;

  const cashflowTable = [
    { item: 'Kas Masuk dari Penjualan', value: cashIn, isNegative: false },
    { item: 'Kas Keluar untuk HPP', value: cashOutHpp, isNegative: true },
    { item: 'Kas Keluar untuk Iklan', value: cashOutAdCost, isNegative: true },
    { item: 'Kas Keluar untuk Biaya Tetap & Lainnya', value: cashOutOtherFixed, isNegative: true },
    { item: 'Arus Kas Bersih', value: netCashFlow, isNegative: netCashFlow < 0 },
  ];
  
  const financialForecastSummary = `Proyeksi pendapatan tahunan: ${annualRevenue.toLocaleString('id-ID')}. Proyeksi profit tahunan: ${annualProfit.toLocaleString('id-ID')}.`;

  const marketConditionSummary = "Pasar e-commerce Indonesia sangat kompetitif, didominasi oleh Shopee dan TikTok-Shop. Konsumen sensitif terhadap harga dan promosi. Pertumbuhan didorong oleh adopsi digital di luar kota-kota besar.";
  
  const [marketAnalysis, strategicPlan] = await Promise.all([
    analyzeMarketEntry({
        productName: data.productName,
        targetSegment: data.targetSegment,
        initialMarketingBudget: data.initialMarketingBudget,
        financialForecastSummary,
        marketConditionSummary
    }),
    generateStrategicRecommendations({
        productName: data.productName,
        targetSegmentation: data.targetSegment,
        initialMarketingBudget: data.initialMarketingBudget,
        annualRevenueProjection: annualRevenue,
        annualProfitProjection: annualProfit,
        roas,
        monthlyProfitAndLossStatement: JSON.stringify(pnlTable.map(p => `${p.item}: ${p.value.toLocaleString('id-ID')}`)),
        monthlyCashFlowSimulation: JSON.stringify(cashflowTable.map(c => `${c.item}: ${c.value.toLocaleString('id-ID')}`)),
        socialMediaAds: data.useSocialMediaAds,
        endorsementKOL: data.useKOLs,
    })
  ]);


  return {
    annualRevenue,
    annualProfit,
    roas,
    pnlTable,
    cashflowTable,
    marketAnalysis,
    strategicPlan
  };
}
