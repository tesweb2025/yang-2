
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
});

type FormData = z.infer<typeof formSchema>;

export async function runAnalysis(data: FormData) {
  const sellPrice = data.sellPrice ?? 0;
  const avgSalesPerMonth = data.avgSalesPerMonth ?? 0;
  const costOfGoods = data.costOfGoods ?? 0;
  const adCost = data.adCost ?? 0;
  const otherCostsPercentage = data.otherCostsPercentage ?? 0;
  const totalMarketingBudget = data.totalMarketingBudget ?? 0;
  const fixedCostsPerMonth = data.fixedCostsPerMonth ?? 0;

  // Financial Calculations
  const monthlyRevenue = sellPrice * avgSalesPerMonth;
  const annualRevenue = monthlyRevenue * 12;
  const monthlyCostOfGoods = costOfGoods * avgSalesPerMonth;
  const grossProfit = monthlyRevenue - monthlyCostOfGoods;
  const otherVariableCosts = (adCost * avgSalesPerMonth) + (monthlyRevenue * otherCostsPercentage / 100);
  const operationalCosts = otherVariableCosts + totalMarketingBudget + fixedCostsPerMonth;
  const monthlyProfit = grossProfit - operationalCosts;
  const annualProfit = monthlyProfit * 12;
  const roas = totalMarketingBudget > 0 ? monthlyRevenue / totalMarketingBudget : 0;
  
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
  const cashOutAdCost = adCost * avgSalesPerMonth;
  const cashOutOtherFixed = (monthlyRevenue * otherCostsPercentage / 100) + fixedCostsPerMonth + totalMarketingBudget;
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
        initialMarketingBudget: totalMarketingBudget,
        financialForecastSummary,
        marketConditionSummary
    }),
    generateStrategicRecommendations({
        productName: data.productName,
        targetSegmentation: data.targetSegment,
        initialMarketingBudget: totalMarketingBudget,
        annualRevenueProjection: annualRevenue,
        annualProfitProjection: annualProfit,
        roas,
        monthlyProfitAndLossStatement: JSON.stringify(pnlTable.map(p => `${p.item}: Rp ${p.value.toLocaleString('id-ID')}`)),
        monthlyCashFlowSimulation: JSON.stringify(cashflowTable.map(c => `${c.item}: Rp ${c.value.toLocaleString('id-ID')}`)),
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
