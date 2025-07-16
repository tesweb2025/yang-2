
"use client";

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, BrainCircuit, LineChart, Loader2, Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle, ArrowRight, Video, Users, Receipt, Share2, Clock, Percent, Zap, Sparkles } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { runAnalysis } from './actions';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, ResponsiveContainer, LabelList, Cell, ComposedChart, PieChart, Pie, TooltipProps, Legend, Line } from 'recharts';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


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

const formatNumberWithCommas = (value: number | undefined) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const parseNumberWithCommas = (value: string) => {
  const parsed = parseInt(value.replace(/\./g, ''), 10);
  return isNaN(parsed) ? undefined : parsed;
};


const businessModelContent: any = {
  'tipis-baru': {
    persona: "Pejuang Volume",
    analysis: "Fokus kejar volume penjualan dan perputaran cepat. Harga kompetitif jadi senjata utama.",
    platforms: "Rekomendasi: TikTok Shop, Shopee."
  },
  'tipis-kuat': {
    persona: "Pemain Skala Besar",
    analysis: "Manfaatkan brand yang dikenal untuk jaga volume. Kunci di efisiensi operasional.",
    platforms: "Shopee Mall, Tokopedia."
  },
  'tebal-baru': {
    persona: "Spesialis Niche",
    analysis: "Targetkan segmen spesifik dengan produk unik. Branding dan cerita produk jadi ujung tombak.",
    platforms: "Rekomendasi: Instagram, Website (Shopify)."
  },
  'tebal-kuat': {
    persona: "Merek Premium",
    analysis: "Jual nilai dan status, bukan cuma produk. Pengalaman pelanggan harus premium.",
    platforms: "Rekomendasi: Website, Lazada LazMall."
  }
};

const marketShareData = [
    { name: 'Tokopedia & TikTok Shop', value: 39, fill: 'var(--color-chart-tiktok)' },
    { name: 'Shopee', value: 37, fill: 'var(--color-chart-shopee)' },
    { name: 'Lazada', value: 10, fill: 'var(--color-chart-lazada)' },
    { name: 'Bukalapak', value: 6, fill: 'var(--color-chart-bukalapak)' },
    { name: 'Blibli', value: 5, fill: 'var(--color-chart-blibli)' },
];

const marketShareChartConfig = {
  value: { label: 'Value' },
  'Tokopedia & TikTok Shop': { label: 'Tokopedia & TikTok Shop', color: 'hsl(var(--chart-tiktok))' },
  'Shopee': { label: 'Shopee', color: 'hsl(var(--chart-shopee))' },
  'Lazada': { label: 'Lazada', color: 'hsl(var(--chart-lazada))' },
  'Bukalapak': { label: 'Bukalapak', color: 'hsl(var(--chart-bukalapak))' },
  'Blibli': { label: 'Blibli', color: 'hsl(var(--chart-blibli))' },
} satisfies ChartConfig;


const gmvComboData = [
    { month: 'Jan', shopee: 1800, tokopedia: 1500, average: 1650 },
    { month: 'Feb', shopee: 1700, tokopedia: 1600, average: 1650 },
    { month: 'Mar', shopee: 2100, tokopedia: 1800, average: 1950 },
    { month: 'Apr', shopee: 2200, tokopedia: 2000, average: 2100 },
    { month: 'May', shopee: 2500, tokopedia: 2200, average: 2350 },
    { month: 'Jun', shopee: 2300, tokopedia: 2100, average: 2200 },
];

const gmvComboChartConfig = {
    shopee: { label: 'Shopee', color: "hsl(212 100% 50%)" },
    tokopedia: { label: 'Tokopedia', color: "hsl(142 71% 45%)" },
    average: { label: 'Rata-rata', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const budgetChartConfig = {
  channels: {
    label: "Channels",
  },
  "Iklan Medsos & Video": {
    label: "Iklan Medsos & Video",
    color: "hsl(var(--chart-1))",
  },
  "Endorse & KOL": {
    label: "Endorse & KOL",
    color: "hsl(var(--chart-2))",
  },
  "Promosi & Diskon": {
    label: "Promosi & Diskon",
    color: "hsl(var(--chart-3))",
  },
  "Kanal Lainnya": {
    label: "Kanal Lainnya",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function AnalystPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      targetSegment: "",
      marginModel: 'tipis',
      brandStrength: 'baru',
      sellPrice: undefined,
      costOfGoods: undefined,
      adCost: undefined,
      otherCostsPercentage: undefined,
      fixedCostsPerMonth: undefined,
      avgSalesPerMonth: undefined,
      totalMarketingBudget: undefined,
      useVideoContent: false,
      useKOLs: false,
      useDiscounts: false,
      useOtherChannels: false,
    },
  });

  const watchedValues = form.watch();

  const calculations = useMemo(() => {
    const { sellPrice, costOfGoods, adCost, otherCostsPercentage, fixedCostsPerMonth, avgSalesPerMonth } = watchedValues;
    const grossProfitPerUnit = (sellPrice || 0) - (costOfGoods || 0);
    const netProfitPerUnit = grossProfitPerUnit - (adCost || 0) - ((sellPrice || 0) * (otherCostsPercentage || 0) / 100);
    const netProfitMargin = (sellPrice || 0) > 0 ? (netProfitPerUnit / (sellPrice || 1)) * 100 : 0;
    const bepUnit = netProfitPerUnit > 0 ? (fixedCostsPerMonth || 0) / netProfitPerUnit : Infinity;
    const monthlyRevenue = (sellPrice || 0) * (avgSalesPerMonth || 0);

    return { netProfitPerUnit, netProfitMargin, bepUnit, monthlyRevenue };
  }, [
    watchedValues.sellPrice,
    watchedValues.costOfGoods,
    watchedValues.adCost,
    watchedValues.otherCostsPercentage,
    watchedValues.fixedCostsPerMonth,
    watchedValues.avgSalesPerMonth,
  ]);

    const budgetAllocation = useMemo(() => {
    const { totalMarketingBudget, useVideoContent, useKOLs, useDiscounts, useOtherChannels } = watchedValues;
    const channels = [
      { name: "Iklan Medsos & Video", active: useVideoContent, color: "hsl(var(--chart-1))" },
      { name: "Endorse & KOL", active: useKOLs, color: "hsl(var(--chart-2))" },
      { name: "Promosi & Diskon", active: useDiscounts, color: "hsl(var(--chart-3))" },
      { name: "Kanal Lainnya", active: useOtherChannels, color: "hsl(var(--chart-4))" },
    ];
    const activeChannels = channels.filter(c => c.active);
    if (activeChannels.length === 0 || (totalMarketingBudget || 0) <= 0) {
      return [{ name: 'Belum ada alokasi', value: 1, fill: 'hsl(var(--muted))' }];
    }
    const valuePerChannel = (totalMarketingBudget || 0) / activeChannels.length;
    return activeChannels.map(c => ({ name: c.name, value: valuePerChannel, fill: c.color }));
  }, [
    watchedValues.totalMarketingBudget,
    watchedValues.useVideoContent,
    watchedValues.useKOLs,
    watchedValues.useDiscounts,
    watchedValues.useOtherChannels,
  ]);

  const channelConfig = useMemo(() => {
    const { totalMarketingBudget, useVideoContent, useKOLs, useDiscounts, useOtherChannels } = watchedValues;
    const channels = [
      { id: 'useVideoContent', name: "Video Content & Ads", active: useVideoContent, color: "hsl(var(--chart-1))", switchClass: "data-[state=checked]:bg-green-500" },
      { id: 'useKOLs', name: "KOL & Afiliasi", active: useKOLs, color: "hsl(var(--chart-2))", switchClass: "data-[state=checked]:bg-green-500" },
      { id: 'useDiscounts', name: "Promosi & Diskon", active: useDiscounts, color: "hsl(var(--chart-3))", switchClass: "data-[state=checked]:bg-green-500" },
      { id: 'useOtherChannels', name: "Lainnya", active: useOtherChannels, color: "hsl(var(--chart-4))", switchClass: "data-[state=checked]:bg-green-500" },
    ];

    const activeChannelsCount = channels.filter(c => c.active).length;
    const budgetPerChannel = activeChannelsCount > 0 ? (totalMarketingBudget || 0) / activeChannelsCount : 0;

    return {
      channels,
      budgetPerChannel,
      activeChannelsCount
    }
  }, [
    watchedValues.totalMarketingBudget,
    watchedValues.useVideoContent,
    watchedValues.useKOLs,
    watchedValues.useDiscounts,
    watchedValues.useOtherChannels,
  ]);


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setTimeout(() => {
        document.getElementById('hasil-simulasi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const result = await runAnalysis(data);
      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      let errorMessage = "Waduh, AI-nya lagi pusing. Coba lagi beberapa saat, ya.";
       if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
        errorMessage = "Kuota gratis hari ini sudah habis. Coba lagi besok ya, atau upgrade paketmu!";
      } else if (error.message && (error.message.includes('503') || error.message.includes('overloaded'))) {
        errorMessage = "Server AI lagi penuh, bro. Coba refresh dan ulangi lagi, ya.";
      }
      toast({
        variant: "destructive",
        title: "Analisis Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBusinessModel = businessModelContent[`${watchedValues.marginModel}-${watchedValues.brandStrength}`];

  const renderFittableTableCellSimple = (value: number, isNegative = false) => {
    const displayValue = formatCurrency(value);
    return (
        <span className={cn(isNegative ? 'text-destructive' : 'text-foreground')}>
            {isNegative ? `- ${displayValue}`: displayValue}
        </span>
    );
  };

  const renderFittableTableCell = (value: number, isNegative = false, addSign = false) => {
    const displayValue = formatCurrency(value);
    const prefix = addSign ? (isNegative ? '− ' : '+ ') : (isNegative ? '− ' : '');
    const finalDisplayValue = prefix + displayValue.replace('Rp', '').trim();
    return (
       <span className={cn(isNegative ? 'text-destructive' : 'text-green-600', {'text-foreground': !addSign && !isNegative})}>
        {finalDisplayValue}
      </span>
    );
  };

  const marketingStrategies = [
    { id: 'useVideoContent', icon: Video, title: 'Video Content & Ads', description: 'Buat konten video pendek & pasang iklan di platform sosial.' },
    { id: 'useKOLs', icon: Users, title: 'KOL & Afiliasi', description: 'Gunakan influencer atau program afiliasi untuk promosi.' },
    { id: 'useDiscounts', icon: Receipt, title: 'Promosi & Diskon', description: 'Tawarkan diskon, voucher, atau promo bundling ke pelanggan.' },
    { id: 'useOtherChannels', icon: Share2, title: 'Kanal Lainnya', description: 'Manfaatkan kanal lain seperti SEO, event, atau marketplace ads.' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <main className="space-y-12 md:space-y-20">
        <section className="text-center pt-12 md:pt-20">
          <h1 className="text-h1 font-bold tracking-tight mb-4">Uji Strategi Bisnismu, Bukan Uangmu.</h1>
          <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto">Gunakan Simulasi AI untuk melihat proyeksi untung-rugi sebelum mengambil risiko. Gratis, cepat, dan akurat.</p>
           <Button asChild size="lg" className="mt-8 rounded-full h-12 px-8">
             <Link href="#cek-strategi">
                Mulai Simulasi Gratis
                <ArrowRight className="ml-2"/>
             </Link>
           </Button>
        </section>

        <section id="wawasan-pasar" className="space-y-8">
            <div className="text-center">
                <h2 className="text-h2 font-semibold">Wawasan Pasar E-Commerce 2024</h2>
                <p className="text-subtitle text-muted-foreground mt-2">Data terbaru untuk membantumu mengambil keputusan.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                 <Card className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-h3 font-medium">Proyeksi Gross Merchandise Value (GMV)</CardTitle>
                        <CardDescription>Pasar mulai dewasa, fokus bergeser dari 'bakar uang' ke profitabilitas. Pertumbuhan melambat ke 5% (YoY).</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <p className="text-5xl font-bold text-primary">US$56,5 M</p>
                        <div className="h-60 w-full">
                            <ChartContainer config={gmvComboChartConfig} className="h-full w-full">
                                <ComposedChart data={gmvComboData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <RechartsTooltip content={<ChartTooltipContent formatter={(value, name) => [`$${value}`, gmvComboChartConfig[name as keyof typeof gmvComboChartConfig]?.label]} />} />
                                    <Bar dataKey="tokopedia" barSize={20} fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="shopee" barSize={20} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ChartContainer>
                        </div>
                        <p className="text-caption text-muted-foreground text-center">Visualisasi tren GMV antar platform besar.</p>
                    </CardContent>
                </Card>
                <Card className="p-6">
                    <CardHeader className="p-0">
                        <CardTitle className="text-h3 font-medium">Wawasan Penting Pembeli Digital</CardTitle>
                        <CardDescription>Pola perilaku kunci yang mendorong penjualan.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                        <div className="flex items-start gap-3">
                             <div className="p-2.5 bg-primary/10 rounded-lg"><Clock className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="font-semibold text-body">Puncak Belanja</p>
                                <p className="text-muted-foreground text-sm">Jam 19-21 & Hari Gajian</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="p-2.5 bg-primary/10 rounded-lg"><Sparkles className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="font-semibold text-body">Pendorong Utama</p>
                                <p className="text-muted-foreground text-sm">82% karena Promo & Diskon</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                           <div className="p-2.5 bg-primary/10 rounded-lg"><Percent className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="font-semibold text-body">Sensitivitas Harga</p>
                                <p className="text-muted-foreground text-sm">65% membandingkan harga</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                             <div className="p-2.5 bg-primary/10 rounded-lg"><Zap className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="font-semibold text-body">Pengiriman Cepat</p>
                                <p className="text-muted-foreground text-sm">55% batal jika estimasi lama</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
        
        <section id="pangsa-pasar">
            <Card className="p-6 md:p-8">
                <CardHeader className="p-0">
                    <CardTitle className="text-h3 font-medium">Siapa Raja di Pasar? (Estimasi Pangsa Pasar GMV 2024)</CardTitle>
                    <CardDescription>Integrasi Tokopedia & TikTok Shop menciptakan duopoli baru yang menantang dominasi Shopee.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-8">
                     <div className="w-full h-[300px]">
                        <ChartContainer config={marketShareChartConfig} className="h-full w-full">
                            <RechartsBarChart data={marketShareData} barCategoryGap="20%">
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                    interval={0}
                                    tickFormatter={(value) => value.includes(' & ') ? value.split(' & ')[0] + '\n& ' + value.split(' & ')[1] : value}
                                />
                                <YAxis hide />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }} 
                                    content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {marketShareData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                    <LabelList 
                                        dataKey="value" 
                                        position="top" 
                                        offset={8} 
                                        className="fill-foreground font-semibold"
                                        formatter={(value: number) => `${value}%`}
                                        fontSize={12}
                                    />
                                 </Bar>
                            </RechartsBarChart>
                        </ChartContainer>
                    </div>
                     <div className="mt-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                           <div className="space-y-2">
                                <p className="font-bold text-base">TikTok & Tokopedia</p>
                                <p className="text-muted-foreground text-caption font-semibold">Kanal untuk "Shoppertainment" & Pembelian Impulsif</p>
                                <p className="text-muted-foreground text-sm">Kuasai dengan konten video pendek, live streaming, dan tren viral.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-base">Shopee</p>
                                <p className="text-muted-foreground text-caption font-semibold">Raksasa Pasar Massal & Promo Agresif</p>
                                <p className="text-muted-foreground text-sm">Menangkan dengan perang harga, voucher, gamifikasi, dan iklan internal yang masif.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-base">Lazada & Blibli</p>
                                <p className="text-muted-foreground text-caption font-semibold">Benteng untuk Brand & Audiens Berkualitas</p>
                                <p className="text-muted-foreground text-sm">Dominasi dengan branding premium, garansi (LazMall), dan layanan superior.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-base">Social Commerce</p>
                                <p className="text-muted-foreground text-caption font-semibold">Kanal untuk Targeting Presisi (Meta & Google Ads)</p>
                                <p className="text-muted-foreground text-sm">Jangkau audiens spesifik dengan retargeting dan lead generation.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <section id="cek-strategi" className="scroll-mt-24">
                <Card className="p-6 md:p-8">
                    <CardHeader className="p-0">
                        <CardTitle className="text-h3 font-medium flex items-center gap-2"><BrainCircuit className="text-primary"/> Data Bisnismu</CardTitle>
                        <CardDescription>Isi data ini agar AI bisa menganalisis strategimu.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="productName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Produk / Bisnis</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Sambal Roa Nona Manis" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="targetSegment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Pasar Utama</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Karyawan kantoran, suka pedas" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="space-y-3 pt-2">
                            <FormLabel>Pilih Strategi Pemasaran</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {marketingStrategies.map(strategy => (
                                    <FormField
                                        key={strategy.id}
                                        control={form.control}
                                        name={strategy.id as keyof FormData}
                                        render={({ field }) => (
                                            <FormItem className={cn(
                                                "h-full p-4 flex flex-col items-start gap-2 text-left rounded-lg border transition-all",
                                                field.value
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-transparent hover:bg-accent'
                                                )}
                                            >
                                                <div className="flex justify-between w-full items-center">
                                                    <FormLabel className="cursor-pointer">
                                                        <strategy.icon className="w-6 h-6" />
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className={cn(
                                                                "data-[state=unchecked]:bg-input",
                                                                    field.value ? 'data-[state=checked]:bg-green-500' : ''
                                                            )}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <div className="mt-2 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                    <p className="font-semibold">{strategy.title}</p>
                                                    <p className={cn("text-xs", field.value ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{strategy.description}</p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section id="model-bisnis">
                <Card className="p-6 md:p-8">
                    <CardHeader className="p-0">
                        <CardTitle className="text-h3 font-medium">Model Bisnis & Strategi Harga</CardTitle>
                        <CardDescription>Pilih model yang paling sesuai, lalu atur harga dan biaya.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-8">
                         <div className="grid md:grid-cols-2 gap-8 items-start">
                             <div className="space-y-6 flex flex-col justify-center h-full">
                                <FormField control={form.control} name="marginModel" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model Margin</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="tipis">Untung Tipis</TabsTrigger>
                                                    <TabsTrigger value="tebal">Untung Tebal</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="brandStrength" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kekuatan Brand</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="baru">Baru Mulai</TabsTrigger>
                                                    <TabsTrigger value="kuat">Sudah Kuat</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="bg-background border p-4 rounded-lg h-full">
                              <h4 className="font-semibold text-lg text-primary">{selectedBusinessModel.persona}</h4>
                              <p className="mt-1 text-caption">{selectedBusinessModel.analysis}</p>
                              <p className="mt-2 text-caption font-semibold">{selectedBusinessModel.platforms}</p>
                            </div>
                        </div>
                        <div className="border-t -mx-8 my-8"></div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Kalkulator Harga & Biaya per Produk</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Controller
                                    name="sellPrice"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Harga Jual</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Rp 0"
                                                    value={formatNumberWithCommas(field.value)}
                                                    onChange={(e) => field.onChange(parseNumberWithCommas(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Controller
                                    name="costOfGoods"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Modal Produk (HPP)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Rp 0"
                                                    value={formatNumberWithCommas(field.value)}
                                                    onChange={(e) => field.onChange(parseNumberWithCommas(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Controller
                                    name="adCost"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Biaya Iklan (CAC)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Rp 0"
                                                    value={formatNumberWithCommas(field.value)}
                                                    onChange={(e) => field.onChange(parseNumberWithCommas(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="otherCostsPercentage" render={({ field }) => (<FormItem><FormLabel>Biaya Lain (%)</FormLabel><FormControl><Input type="number" placeholder="0%" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Biaya Tetap & Target Penjualan</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <Controller
                                      name="fixedCostsPerMonth"
                                      control={form.control}
                                      render={({ field, fieldState }) => (
                                          <FormItem>
                                              <FormLabel>Biaya Tetap / Bulan</FormLabel>
                                              <FormControl>
                                                  <Input
                                                      placeholder="Rp 0"
                                                      value={formatNumberWithCommas(field.value)}
                                                      onChange={(e) => field.onChange(parseNumberWithCommas(e.target.value))}
                                                  />
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                  <FormField control={form.control} name="avgSalesPerMonth" render={({ field }) => (<FormItem><FormLabel>Target Jual / Bulan</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Estimasi Profitabilitas</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-4 bg-muted/50 flex flex-col justify-between">
                                        <div>
                                            <p className="text-caption text-muted-foreground">Laba/unit</p>
                                            <p className={cn(
                                                "text-xl font-bold",
                                                calculations.netProfitPerUnit > 0 ? "text-green-600" :
                                                calculations.netProfitPerUnit < 0 ? "text-destructive" : "text-foreground"
                                            )}>{formatCurrency(calculations.netProfitPerUnit)}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Keuntungan bersih setelah semua biaya dari satu produk terjual.</p>
                                    </Card>
                                    <Card className="p-4 bg-muted/50 flex flex-col justify-between">
                                        <div>
                                            <p className="text-caption text-muted-foreground">BEP (unit)</p>
                                            <p className="text-xl font-bold">{isFinite(calculations.bepUnit) ? Math.ceil(calculations.bepUnit) : 'N/A'}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Jumlah produk yang harus terjual untuk balik modal setiap bulan.</p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
            
            <section id="alokasi-bujet">
                 <Card className="p-6 md:p-8">
                    <CardHeader className="p-0 text-center">
                        <CardTitle className="text-h3 font-medium">Alokator Bujet Pemasaran</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 max-w-lg mx-auto">
                        <Controller
                            name="totalMarketingBudget"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Total Bujet Pemasaran</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Rp 0"
                                            className="text-2xl font-bold h-auto py-3"
                                            value={formatNumberWithCommas(field.value)}
                                            onChange={(e) => field.onChange(parseNumberWithCommas(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="h-64 w-full my-6">
                           <ResponsiveContainer width="100%" height="100%">
                                <ChartContainer config={budgetChartConfig}>
                                  <PieChart>
                                    <RechartsTooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                    />
                                    <Pie
                                      data={budgetAllocation}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="60%"
                                      outerRadius="100%"
                                      paddingAngle={2}
                                      labelLine={false}
                                      label={false}
                                    >
                                      {budgetAllocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                </ChartContainer>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                          {channelConfig.channels.map(channel => (
                            <div key={channel.id} className="flex items-center justify-between border-b pb-4">
                              <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: channel.color }}></span>
                                <span className="text-sm font-medium">{channel.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold">{channel.active ? formatCurrency(channelConfig.budgetPerChannel) : 'Rp 0'}</span>
                                <FormField
                                  control={form.control}
                                  name={channel.id as any}
                                  render={({ field }) => (
                                    <FormItem className="m-0">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          className={cn(channel.switchClass)}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-muted-foreground text-caption mt-6">
                          {channelConfig.activeChannelsCount === 4 && "Strategi diversifikasi penuh, ideal untuk brand mapan."}
                          {channelConfig.activeChannelsCount > 0 && channelConfig.activeChannelsCount < 4 && "Strategi terfokus, bagus untuk memaksimalkan kanal pilihan."}
                          {channelConfig.activeChannelsCount === 0 && "Pilih setidaknya satu kanal untuk memulai."}
                        </p>
                    </CardContent>
                    <div className="border-t -mx-8 my-8"></div>
                    <Button type="submit" className="w-full h-14 text-lg rounded-full" disabled={isLoading}>
                       {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '⚡ Jalankan Simulasi AI'}
                    </Button>
                </Card>
            </section>
          </form>
        </Form>
        
         <div id="hasil-simulasi" className="scroll-mt-24 space-y-12">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">AI sedang menganalisis...</p>
                <p className="text-muted-foreground text-caption">Meracik strategi terbaik berdasarkan data Anda.</p>
              </div>
            )}

            {analysisResult && (
              <>
                <section>
                    <div className="text-center">
                        <h2 className="text-h2 font-semibold">Hasil Simulasi Strategi</h2>
                        <p className="text-subtitle text-muted-foreground mt-2">Proyeksi kesehatan bisnismu berdasarkan data yang kamu isi.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <Card className="p-6 text-center flex flex-col justify-between">
                            <div>
                               <p className="text-body font-semibold">Proyeksi Pendapatan Tahunan</p>
                               <p className="text-2xl md:text-3xl mt-2 font-bold text-primary break-words">{formatCurrency(analysisResult.annualRevenue)}</p>
                            </div>
                            <p className="text-caption text-muted-foreground mt-2">Total omzet kotor sebelum dikurangi biaya.</p>
                        </Card>
                        <Card className="p-6 text-center flex flex-col justify-between">
                             <div>
                                <p className="text-body font-semibold">Proyeksi Profit Tahunan</p>
                                <p className={`text-2xl md:text-3xl mt-2 font-bold break-words ${analysisResult.annualProfit < 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(analysisResult.annualProfit)}</p>
                            </div>
                            <p className="text-caption text-muted-foreground mt-2">Sisa uang setelah semua biaya terbayar.</p>
                        </Card>
                        <Card className="p-6 text-center flex flex-col justify-between">
                            <div>
                               <p className="text-body font-semibold">Return on Ad Spend (ROAS)</p>
                               <p className="text-2xl md:text-3xl mt-2 font-bold text-primary break-words">{`${analysisResult.roas.toFixed(2)}x`}</p>
                            </div>
                            <p className="text-caption text-muted-foreground mt-2">Pengembalian dari setiap Rupiah untuk iklan.</p>
                        </Card>
                    </div>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <Card>
                            <CardHeader><CardTitle>Laporan Untung Rugi (Bulanan)</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                    {analysisResult.pnlTable.map(item => (
                                        <TableRow key={item.item}>
                                        <TableCell className={cn("py-3 px-4", item.item === 'Untung Kotor' || item.item === 'Untung Bersih Bulanan' ? 'font-bold' : '')}>{item.item}</TableCell>
                                        <TableCell className={cn("text-right font-medium py-3 px-4 text-sm", item.item === 'Untung Kotor' || item.item === 'Untung Bersih Bulanan' ? 'font-bold' : '')}>
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
                                            <TableCell className={cn("py-3 px-4", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>{row.item}</TableCell>
                                            <TableCell className={cn("text-right font-medium py-3 px-4 text-sm", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>
                                            {renderFittableTableCell(row.value, row.isNegative, true)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card className="mt-8 p-6">
                        <CardHeader className="p-0">
                            <CardTitle>Kata AI Soal Strategimu</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-4">
                            {analysisResult.marketAnalysis.evaluation.includes("berisiko") || analysisResult.annualProfit < 0 ?
                                (<Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>{analysisResult.marketAnalysis.evaluation}</AlertTitle>
                                    <AlertDescription>{analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                                </Alert>) :
                                (<Alert className="bg-green-500/10 border-green-500/30 text-green-700">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <AlertTitle>{analysisResult.marketAnalysis.evaluation}</AlertTitle>
                                    <AlertDescription>{analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                                </Alert>)
                            }
                        </CardContent>
                    </Card>

                </section>
                
                <section id="rencana-aksi" className="mt-12">
                  <Card className="p-6 md:p-8">
                    <CardHeader className="p-0">
                      <CardTitle className="text-h3 font-medium">Rencana Aksi Biar Cuan</CardTitle>
                      <CardDescription>Rekomendasi taktis dari AI yang bisa langsung Anda terapkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6">
                      <ul className="list-decimal list-outside space-y-3 pl-5 text-body">
                        {analysisResult.strategicPlan.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="pl-2">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
        </div>
      </main>
    </div>
  );
}
