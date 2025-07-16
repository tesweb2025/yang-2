"use client";

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, BrainCircuit, LineChart, Loader2, Lightbulb, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { runAnalysis } from './actions';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, Label, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { PieChart as RechartsPieChart, BarChart as RechartsBarChart } from 'recharts';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


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
type AnalysisResult = {
  annualRevenue: number;
  annualProfit: number;
  roas: number;
  pnlTable: any[];
  cashflowTable: any[];
  marketAnalysis: any;
  strategicPlan: any;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const businessModelContent: any = {
  'tipis-baru': {
    persona: "The Hustler",
    analysis: "Fokus pada volume penjualan tinggi dan perputaran cepat. Strategi harga kompetitif adalah kunci. Rentan terhadap perang harga.",
    platforms: "Rekomendasi: TikTok Shop, Shopee. Platform dengan audiens massa dan fitur live-selling."
  },
  'tipis-kuat': {
    persona: "The Volume Player",
    analysis: "Memanfaatkan kekuatan brand untuk menjaga volume meski margin tipis. Efisiensi operasional sangat penting.",
    platforms: "Rekomendasi: Shopee Mall, Tokopedia Power Merchant. Membutuhkan skala besar."
  },
  'tebal-baru': {
    persona: "The Niche Specialist",
    analysis: "Menargetkan segmen spesifik dengan produk unik. Branding dan story-telling menjadi ujung tombak.",
    platforms: "Rekomendasi: Instagram Shopping, Website (Shopify/Sirclo). Bangun komunitas."
  },
  'tebal-kuat': {
    persona: "The Premium Brand",
    analysis: "Menjual nilai dan status, bukan hanya produk. Pengalaman pelanggan premium dari awal hingga akhir.",
    platforms: "Rekomendasi: Website sendiri, Lazada LazMall. Jaga eksklusivitas."
  }
};

const gmvData = [
  { month: 'Jan', value: 3.1 }, { month: 'Feb', value: 3.2 }, { month: 'Mar', value: 3.5 },
  { month: 'Apr', value: 3.4 }, { month: 'May', value: 3.6 }, { month: 'Jun', value: 3.8 }
];
const marketShareData = [
  { name: 'TikTok-Toko', value: 35, fill: 'hsl(var(--chart-2))' },
  { name: 'Shopee', value: 30, fill: 'hsl(var(--chart-3))' },
  { name: 'Lazada', value: 15, fill: 'hsl(var(--chart-4))' },
  { name: 'Lainnya', value: 20, fill: 'hsl(var(--chart-5))' }
];
const chartConfig: ChartConfig = {
  value: { label: 'Value' },
  'TikTok-Toko': { label: 'TikTok-Toko', color: 'hsl(var(--chart-2))' },
  'Shopee': { label: 'Shopee', color: 'hsl(var(--chart-3))' },
  'Lazada': { label: 'Lazada', color: 'hsl(var(--chart-4))' },
  'Lainnya': { label: 'Lainnya', color: 'hsl(var(--chart-5))' },
};

export default function AnalystPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      targetSegment: "",
      initialMarketingBudget: 10000000,
      marginModel: 'tipis',
      brandStrength: 'baru',
      sellPrice: 150000,
      costOfGoods: 80000,
      adCost: 20000,
      otherCostsPercentage: 15,
      fixedCostsPerMonth: 5000000,
      avgSalesPerMonth: 200,
      totalMarketingBudget: 5000000,
      useSocialMediaAds: true,
      useKOLs: false,
      useVideoContent: true,
    },
  });

  const watchedValues = form.watch();

  const calculations = useMemo(() => {
    const { sellPrice, costOfGoods, adCost, otherCostsPercentage, fixedCostsPerMonth, avgSalesPerMonth } = watchedValues;
    const grossProfitPerUnit = sellPrice - costOfGoods;
    const netProfitPerUnit = grossProfitPerUnit - adCost - (sellPrice * otherCostsPercentage / 100);
    const netProfitMargin = sellPrice > 0 ? (netProfitPerUnit / sellPrice) * 100 : 0;
    const bepUnit = netProfitPerUnit > 0 ? fixedCostsPerMonth / netProfitPerUnit : Infinity;
    const monthlyRevenue = sellPrice * avgSalesPerMonth;

    return { netProfitPerUnit, netProfitMargin, bepUnit, monthlyRevenue };
  }, [watchedValues]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await runAnalysis(data);
      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      let errorMessage = "Terjadi kesalahan saat analisis AI. Silakan coba lagi.";
      if (error.message && error.message.includes('429')) {
        errorMessage = "Batas penggunaan AI telah tercapai. Coba lagi nanti atau periksa paket Anda.";
      } else if (error.message && error.message.includes('503')) {
        errorMessage = "Server AI sedang sibuk. Silakan coba lagi beberapa saat lagi.";
      }
      toast({
        variant: "destructive",
        title: "Analisis Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      if (analysisResult) {
        document.getElementById('simulation-results')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const selectedBusinessModel = businessModelContent[`${watchedValues.marginModel}-${watchedValues.brandStrength}`];

  const budgetAllocationData = useMemo(() => {
      const { useVideoContent, useKOLs, useSocialMediaAds } = watchedValues;
      const allocations = [];
      if (useVideoContent) allocations.push({ name: 'Video Content & Ads', value: 40, fill: 'hsl(var(--chart-1))' });
      if (useKOLs) allocations.push({ name: 'KOL & Afiliasi', value: 35, fill: 'hsl(var(--chart-2))' });
      if (useSocialMediaAds) allocations.push({ name: 'Iklan Media Sosial', value: 25, fill: 'hsl(var(--chart-3))' });
      
      if (allocations.length === 0) {
        return [{ name: 'Tidak ada alokasi', value: 100, fill: 'hsl(var(--muted))' }];
      }

      const total = allocations.reduce((acc, item) => acc + item.value, 0);
      return allocations.map(item => ({...item, value: (item.value / total) * 100}));

  }, [watchedValues.useVideoContent, watchedValues.useKOLs, watchedValues.useSocialMediaAds]);

  const renderFittableNumber = (value: string | number, isCurrency = true, isNegative = false, className = "text-2xl") => {
    const displayValue = isCurrency ? formatCurrency(Number(value)) : String(value);
    const baseLength = isCurrency ? 12 : 8;
    const scaleFactor = Math.min(1, baseLength / displayValue.length);
    const dynamicFontSize = `calc(${scaleFactor} * 1.5rem)`;
  
    return (
      <div 
        className={cn(className, "font-bold", isNegative ? 'text-destructive' : '')}
        style={{ fontSize: displayValue.length > baseLength ? dynamicFontSize : undefined }}
      >
        {displayValue}
      </div>
    );
  };
  
  const renderFittableTableCell = (value: number, isNegative = false, addSign = false) => {
    const displayValue = formatCurrency(value);
    const prefix = addSign ? (isNegative ? '- ' : '+ ') : (isNegative ? '- ' : '');
    const finalDisplayValue = prefix + displayValue.replace('Rp', '').trim();
    const baseLength = 12; 
    const scaleFactor = Math.min(1, baseLength / finalDisplayValue.length);
    const dynamicFontSize = `calc(${scaleFactor} * 0.875rem)`;
  
    return (
       <span style={{ fontSize: finalDisplayValue.length > baseLength ? dynamicFontSize : undefined }} className={cn(isNegative ? 'text-destructive' : 'text-green-600', {'text-foreground': !addSign && !isNegative})}>
        {finalDisplayValue}
      </span>
    );
  };

  const renderFittableTableCellSimple = (value: number, isNegative = false) => {
    const displayValue = formatCurrency(value);
    const baseLength = 12;
    const scaleFactor = Math.min(1, baseLength / displayValue.length);
    const dynamicFontSize = `calc(${scaleFactor} * 0.875rem)`;

    return (
        <span style={{ fontSize: displayValue.length > baseLength ? dynamicFontSize : undefined }} className={cn(isNegative ? 'text-destructive' : 'text-foreground')}>
            {isNegative ? `- ${displayValue}`: displayValue}
        </span>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <main className="space-y-12">
        {/* 1. Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-headline">Simulasikan Strategi<br/>Bisnismu.</h1>
          <div className="mt-8 relative aspect-video max-w-lg mx-auto p-4">
            <Image src="https://placehold.co/600x400.png" alt="3D Illustration of e-commerce logistics" layout="fill" objectFit="contain" className="rounded-lg" data-ai-hint="delivery truck" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">Gunakan AI Marketplace Analyst untuk memvalidasi ide, merencanakan keuangan, dan menyusun strategi aksi yang solid untuk pasar e-commerce Indonesia.</p>
           <Button asChild size="lg" className="mt-8">
             <Link href="#ai-analyst-form">Mulai Simulasi</Link>
           </Button>
        </section>

        {/* 2. Market Insights */}
        <section id="market-insights" className="space-y-4">
            <h2 className="text-3xl font-bold text-center">Wawasan Pasar E-Commerce Indonesia</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Proyeksi Gross Merchandise Value (GMV)</CardTitle>
                        <CardDescription>Pertumbuhan pasar e-commerce di Indonesia terus melesat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary mb-4">US$4 Miliar</p>
                        <ChartContainer config={chartConfig} className="w-full h-[250px]">
                            <RechartsBarChart data={gmvData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Konsumen Digital</CardTitle>
                        <CardDescription>Memahami siapa dan bagaimana mereka berbelanja.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><Target className="w-8 h-8 text-primary" /></div>
                            <div>
                                <p className="font-semibold">Usia Dominan</p>
                                <p className="text-2xl font-bold">26-35 Tahun</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><LineChart className="w-8 h-8 text-primary" /></div>
                            <div>
                                <p className="font-semibold">Transaksi Seluler</p>
                                <p className="text-2xl font-bold">67% Volume</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><TrendingUp className="w-8 h-8 text-primary" /></div>
                            <div>
                                <p className="font-semibold">Motivasi Utama</p>
                                <p className="text-xl font-bold">Promo & Gratis Ongkir</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
        
        {/* 3. Market Share */}
        <section id="market-share">
            <Card>
                <CardHeader>
                    <CardTitle>Pangsa Pasar GMV (Estimasi 2025)</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                            <RechartsPieChart>
                                <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={marketShareData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} strokeWidth={2}>
                                </Pie>
                                <ChartLegend content={<ChartLegendContent layout="vertical" align="right" verticalAlign="middle" />} />
                            </RechartsPieChart>
                        </ChartContainer>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Analisis Medan Perang</h3>
                        <p className="text-muted-foreground">
                            Persaingan didominasi oleh pemain besar dengan strategi yang berbeda. <strong>TikTok-Toko</strong> mengandalkan 'shoppertainment' dan impulse buying. <strong>Shopee</strong> kuat dalam promo dan jangkauan logistik. <strong>Lazada</strong> berfokus pada pengalaman brand premium di LazMall. Pemain baru harus menemukan celah di antara raksasa-raksasa ini.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* 8. AI Analyst Form */}
            <section id="ai-analyst-form">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Input Strategis (AI Marketplace Analyst)</CardTitle>
                        <CardDescription>Masukkan data dasar bisnismu untuk dianalisis oleh AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="productName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Produk / Bisnis</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Kopi Susu Gula Aren" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="targetSegment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Segmentasi Target Utama</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Mahasiswa & pekerja muda" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="initialMarketingBudget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modal Marketing Awal (Rp)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
            </section>

            {/* 4. Business Model Validator */}
            <section id="business-model-validator">
                <Card>
                    <CardHeader>
                        <CardTitle>Validator Model Bisnis</CardTitle>
                        <CardDescription>Pilih model yang paling sesuai dengan bisnismu.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                         <div>
                            <FormField
                                control={form.control}
                                name="marginModel"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Model Margin</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="tipis">Margin Tipis</TabsTrigger>
                                                    <TabsTrigger value="tebal">Margin Tebal</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="mt-4"></div>
                            <FormField
                                control={form.control}
                                name="brandStrength"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Kekuatan Brand</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="baru">Brand Baru</TabsTrigger>
                                                    <TabsTrigger value="kuat">Brand Kuat</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                          <h4 className="font-bold text-lg text-primary">{selectedBusinessModel.persona}</h4>
                          <p className="mt-2 text-sm">{selectedBusinessModel.analysis}</p>
                          <p className="mt-2 text-sm font-semibold">{selectedBusinessModel.platforms}</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 5. Strategy Lab */}
            <section id="strategy-lab">
                <Card>
                    <CardHeader>
                        <CardTitle>Laboratorium Strategi</CardTitle>
                        <CardDescription>Atur angka-angka kunci untuk melihat profitabilitas bisnismu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Kalkulator Profitabilitas</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField control={form.control} name="sellPrice" render={({ field }) => (<FormItem><FormLabel>Harga Jual</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="costOfGoods" render={({ field }) => (<FormItem><FormLabel>HPP</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="adCost" render={({ field }) => (<FormItem><FormLabel>Biaya Iklan (CAC)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="otherCostsPercentage" render={({ field }) => (<FormItem><FormLabel>Biaya Lain (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <Card className="p-4 bg-muted">
                                    <p className="text-sm text-muted-foreground">Profit Bersih / Unit</p>
                                    {renderFittableNumber(calculations.netProfitPerUnit, true, calculations.netProfitPerUnit < 0)}
                                </Card>
                                <Card className="p-4 bg-muted">
                                    <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                                    <p className={`text-2xl font-bold ${calculations.netProfitMargin < 0 ? 'text-destructive' : 'text-green-600'}`}>{calculations.netProfitMargin.toFixed(1)}%</p>
                                </Card>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Kalkulator Break-Even Point (BEP)</h3>
                                <FormField control={form.control} name="fixedCostsPerMonth" render={({ field }) => (<FormItem><FormLabel>Total Biaya Tetap / Bulan</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <Card className="p-4 bg-muted mt-2">
                                  <p className="text-sm text-muted-foreground">BEP (Unit / Bulan)</p>
                                  {renderFittableNumber(isFinite(calculations.bepUnit) ? Math.ceil(calculations.bepUnit) : 'N/A', false, false, "text-xl")}
                                </Card>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Kalkulator Proyeksi Pendapatan</h3>
                                <FormField control={form.control} name="avgSalesPerMonth" render={({ field }) => (<FormItem><FormLabel>Rata-rata Penjualan / Bulan (Unit)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <Card className="p-4 bg-muted mt-2">
                                  <p className="text-sm text-muted-foreground">Proyeksi Pendapatan / Bulan</p>
                                  {renderFittableNumber(calculations.monthlyRevenue, true, false, "text-xl")}
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
            
            {/* 6. Budget Allocator */}
            <section id="budget-allocator">
                <Card>
                    <CardHeader>
                        <CardTitle>Alokator Bujet Pemasaran</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <FormField control={form.control} name="totalMarketingBudget" render={({ field }) => (<FormItem><FormLabel>Total Bujet Pemasaran / Bulan</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            <div className="mt-4 space-y-4">
                                <FormField control={form.control} name="useVideoContent" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Video Content & Ads</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="useKOLs" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>KOL & Afiliasi</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="useSocialMediaAds" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Iklan Media Sosial</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </div>
                        </div>
                        <div>
                             <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                                <RechartsPieChart>
                                    <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={budgetAllocationData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} />
                                </RechartsPieChart>
                            </ChartContainer>
                            <p className="text-center text-sm text-muted-foreground mt-2">Estimasi alokasi bujet berdasarkan channel yang aktif.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" className="w-full text-lg" disabled={isLoading}>
                           {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '⚡ Analisis dengan AI'}
                       </Button>
                    </CardFooter>
                </Card>
            </section>
          </form>
        </Form>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold">AI sedang menganalisis strategimu...</p>
            <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
          </div>
        )}

        {analysisResult && (
          <>
            {/* 7. Strategic Impact Simulation */}
            <section id="simulation-results" className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Simulasi Dampak Strategis</h2>
                    <p className="text-muted-foreground mt-2">Lihat kesehatan bisnismu di sini berdasarkan input dari Laboratorium Strategi.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 flex flex-col justify-between text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Proyeksi Pendapatan Tahunan</p>
                            {renderFittableNumber(analysisResult.annualRevenue, true, false, "text-3xl mt-2 text-primary")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Total penjualan yang diproyeksikan dalam satu tahun.</p>
                    </Card>
                    <Card className="p-6 flex flex-col justify-between text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Proyeksi Profit Tahunan</p>
                            {renderFittableNumber(analysisResult.annualProfit, true, analysisResult.annualProfit < 0, `text-3xl mt-2 ${analysisResult.annualProfit < 0 ? '' : 'text-green-600'}`)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Perkiraan keuntungan bersih setelah semua biaya diperhitungkan.</p>
                    </Card>
                    <Card className="p-6 flex flex-col justify-between text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Return on Ad Spend (ROAS)</p>
                            {renderFittableNumber(`${analysisResult.roas.toFixed(2)}x`, false, false, "text-3xl mt-2 text-primary")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Setiap Rp1 iklan menghasilkan Rp{analysisResult.roas.toFixed(2)} pendapatan.</p>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Laporan Laba Rugi (Bulanan)</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                {analysisResult.pnlTable.map(item => (
                                    <TableRow key={item.item}>
                                    <TableCell className={cn("py-2 px-4", item.item === 'Laba Kotor' || item.item === 'Laba Bersih (Net Profit)' ? 'font-bold' : '')}>{item.item}</TableCell>
                                    <TableCell className={cn("text-right font-medium py-2 px-4", item.item === 'Laba Kotor' || item.item === 'Laba Bersih (Net Profit)' ? 'font-bold' : '')}>
                                        {renderFittableTableCellSimple(item.value, item.isNegative)}
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Simulasi Arus Kas (Bulanan)</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                {analysisResult.cashflowTable.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className={cn("py-2 px-4", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>{row.item}</TableCell>
                                        <TableCell className={cn("text-right font-medium py-2 px-4", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>
                                        {renderFittableTableCell(row.value, row.isNegative, true)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader><CardTitle>Vonis & Rekomendasi Strategis</CardTitle></CardHeader>
                    <CardContent>
                        {analysisResult.marketAnalysis.evaluation.includes("negatif") || analysisResult.annualProfit < 0 ?
                        (<Alert variant="destructive" className="bg-destructive/5">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Peringatan Kritis</AlertTitle>
                            <AlertDescription>{analysisResult.marketAnalysis.evaluation} {analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                        </Alert>) :
                        (<Alert className="bg-primary/5 border-primary/20">
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Evaluasi AI</AlertTitle>
                            <AlertDescription>{analysisResult.marketAnalysis.evaluation} {analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                        </Alert>)
                        }
                    </CardContent>
                </Card>

            </section>
            
            {/* 9. Strategic Action Plan */}
            <section id="action-plan">
              <Card>
                <CardHeader>
                  <CardTitle>Rencana Aksi Strategis</CardTitle>
                  <CardDescription>Rekomendasi dari AI untuk meningkatkan performa bisnismu.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-3">
                    {analysisResult.strategicPlan.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="pl-2">{rec}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
