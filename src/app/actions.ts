
"use server";

import { z } from "zod";
import { analyzeMarketEntry } from "@/ai/flows/analyze-market-entry";
import { generateStrategicRecommendations } from "@/ai/flows/generate-strategic-recommendations";

const formSchema = z.object({
  productName: z.string().min(1, "Nama produk harus diisi"),
  targetSegment: z.string().min(1, "Segmentasi target harus diisi"),
  marginModel: z.enum(['tipis', 'tebal']),
  brandStrength: z.enum(['baru', 'kuat']),
  sellPrice: z.coerce.number().min(0, "Harga harus positif").optional().default(0),
  costOfGoods: z.coerce.number().min(0, "HPP harus positif").optional().default(0),
  adCost: z.coerce.number().min(0, "Biaya iklan harus positif").optional().default(0),
  otherCostsPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  fixedCostsPerMonth: z.coerce.number().min(0, "Biaya tetap harus positif").optional().default(0),
  avgSalesPerMonth: z.coerce.number().min(0, "Penjualan harus positif").optional().default(0),
  totalMarketingBudget: z.coerce.number().min(0, "Bujet harus positif").optional().default(0),
  useVideoContent: z.boolean(),
  useKOLs: z.boolean(),
  useDiscounts: z.boolean(),
  useOtherChannels: z.boolean(),
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
    { item: 'Omzet Bulanan', value: monthlyRevenue, isNegative: false },
    { item: 'Modal Produk (HPP)', value: monthlyCostOfGoods, isNegative: true },
    { item: 'Untung Kotor', value: grossProfit, isNegative: grossProfit < 0 },
    { item: 'Biaya Operasional', value: operationalCosts, isNegative: true },
    { item: 'Untung Bersih Bulanan', value: monthlyProfit, isNegative: monthlyProfit < 0 },
  ];

  // Cashflow Table Data
  const cashIn = monthlyRevenue;
  const cashOutHpp = monthlyCostOfGoods;
  const cashOutAdCost = data.adCost * data.avgSalesPerMonth;
  const cashOutOtherFixed = (monthlyRevenue * data.otherCostsPercentage / 100) + data.fixedCostsPerMonth + data.totalMarketingBudget;
  const netCashFlow = cashIn - cashOutHpp - cashOutAdCost - cashOutOtherFixed;

  const cashflowTable = [
    { item: 'Duit Masuk dari Penjualan', value: cashIn, isNegative: false },
    { item: 'Duit Keluar buat Modal (HPP)', value: cashOutHpp, isNegative: true },
    { item: 'Duit Keluar buat Iklan', value: cashOutAdCost, isNegative: true },
    { item: 'Duit Keluar buat Biaya Lain', value: cashOutOtherFixed, isNegative: true },
    { item: 'Arus Kas Bersih', value: netCashFlow, isNegative: netCashFlow < 0 },
  ];
  
  const financialForecastSummary = `Proyeksi omzet tahunan: Rp ${annualRevenue.toLocaleString('id-ID')}. Proyeksi untung tahunan: Rp ${annualProfit.toLocaleString('id-ID')}.`;

  const marketConditionSummary = "Pasar e-commerce Indonesia sangat kompetitif, didominasi oleh Shopee dan TikTok Shop. Konsumen sensitif harga dan suka promo. Pertumbuhan didorong oleh adopsi digital di kota-kota lapis kedua dan ketiga.";
  
  const [marketAnalysis, strategicPlan] = await Promise.all([
    analyzeMarketEntry({
        productName: data.productName,
        targetSegment: data.targetSegment,
        initialMarketingBudget: data.totalMarketingBudget, // Using total marketing budget
        financialForecastSummary,
        marketConditionSummary
    }),
    generateStrategicRecommendations({
        productName: data.productName,
        targetSegmentation: data.targetSegment,
        initialMarketingBudget: data.totalMarketingBudget, // Using total marketing budget
        annualRevenueProjection: annualRevenue,
        annualProfitProjection: annualProfit,
        roas,
        monthlyProfitAndLossStatement: JSON.stringify(pnlTable.map(p => `${p.item}: Rp ${p.value.toLocaleString('id-ID')}`)),
        monthlyCashFlowSimulation: JSON.stringify(cashflowTable.map(c => `${c.item}: Rp ${c.value.toLocaleString('id-ID')}`)),
        socialMediaAds: data.useVideoContent,
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
