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
  const monthlyVariableCostsPerUnit = data.costOfGoods + data.adCost + (data.sellPrice * data.otherCostsPercentage / 100);
  const totalMonthlyVariableCosts = monthlyVariableCostsPerUnit * data.avgSalesPerMonth;
  const totalMonthlyCosts = data.fixedCostsPerMonth + totalMonthlyVariableCosts; // Marketing budget is part of fixed costs in this simple model
  const monthlyProfit = monthlyRevenue - totalMonthlyCosts;
  const annualProfit = monthlyProfit * 12;
  const roas = data.totalMarketingBudget > 0 ? monthlyRevenue / data.totalMarketingBudget : 0;
  
  // P&L Table Data
  const pnlTable = [
    { item: 'Pendapatan', value: monthlyRevenue, isNegative: false },
    { item: 'HPP', value: data.costOfGoods * data.avgSalesPerMonth, isNegative: true },
    { item: 'Laba Kotor', value: monthlyRevenue - (data.costOfGoods * data.avgSalesPerMonth), isNegative: (monthlyRevenue - (data.costOfGoods * data.avgSalesPerMonth)) < 0 },
    { item: 'Biaya Variabel Lain', value: (data.adCost + (data.sellPrice * data.otherCostsPercentage / 100)) * data.avgSalesPerMonth, isNegative: true},
    { item: 'Biaya Tetap', value: data.fixedCostsPerMonth, isNegative: true },
    { item: 'Laba Bersih Bulanan', value: monthlyProfit, isNegative: monthlyProfit < 0 },
  ];

  // Cashflow Table Data
  let currentCash = data.initialMarketingBudget;
  const cashflowTable = Array.from({ length: 12 }, (_, i) => {
    const cashIn = monthlyRevenue;
    const cashOut = totalMonthlyCosts;
    const netCashFlow = cashIn - cashOut;
    const endCash = currentCash + netCashFlow;
    const row = {
      month: i + 1,
      startCash: currentCash,
      cashIn,
      cashOut,
      netCashFlow,
      endCash,
    };
    currentCash = endCash;
    return row;
  });

  const financialForecastSummary = `Proyeksi pendapatan tahunan: ${annualRevenue.toLocaleString('id-ID')}. Proyeksi profit tahunan: ${annualProfit.toLocaleString('id-ID')}. Proyeksi arus kas pada akhir tahun: ${currentCash.toLocaleString('id-ID')}.`;

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
        monthlyCashFlowSimulation: JSON.stringify(cashflowTable.map(c => `Bulan ${c.month} Kas Akhir: ${c.endCash.toLocaleString('id-ID')}`)),
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
