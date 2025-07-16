
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
import { BarChart, BrainCircuit, LineChart, Loader2, Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { runAnalysis } from './actions';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, Label, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart as RechartsPieChart, BarChart as RechartsBarChart, ResponsiveContainer, LabelList, Cell } from 'recharts';
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

const businessModelContent: any = {
  'tipis-baru': {
    persona: "Sang Pejuang (The Hustler)",
    analysis: "Fokus kejar volume penjualan tinggi dan perputaran cepat. Harga kompetitif jadi senjata utama. Hati-hati perang harga.",
    platforms: "Rekomendasi: TikTok Shop, Shopee. Platform dengan audiens massa dan fitur live-selling cocok buat lo."
  },
  'tipis-kuat': {
    persona: "Pemain Volume (The Volume Player)",
    analysis: "Lo manfaatin brand yang udah dikenal buat jaga volume walau margin tipis. Kuncinya di efisiensi operasional.",
    platforms: "Rekomendasi: Shopee Mall, Tokopedia Power Merchant. Butuh skala produksi & distribusi besar."
  },
  'tebal-baru': {
    persona: "Spesialis Niche (The Niche Specialist)",
    analysis: "Targetin segmen yang spesifik dengan produk unik. Branding dan cerita produk jadi ujung tombak.",
    platforms: "Rekomendasi: Instagram Shopping, Website (Shopify/Sirclo). Fokus bangun komunitas loyal."
  },
  'tebal-kuat': {
    persona: "Merek Premium (The Premium Brand)",
    analysis: "Jual nilai dan status, bukan cuma produk. Pengalaman pelanggan harus premium dari awal sampai akhir.",
    platforms: "Rekomendasi: Website sendiri, Lazada LazMall. Jaga eksklusivitas brand lo."
  }
};

const gmvData = [
  { month: 'Jan', value: 3.1 }, { month: 'Feb', value: 3.2 }, { month: 'Mar', value: 3.5 },
  { month: 'Apr', value: 3.4 }, { month: 'May', value: 3.6 }, { month: 'Jun', value: 3.8 }
];
const marketShareData = [
    { name: 'Shopee', value: 46, fill: 'var(--color-shopee)', label: 'Shopee' },
    { name: 'Tokopedia', value: 23, fill: 'var(--color-tokopedia)', label: 'Tokopedia' },
    { name: 'TikTok Shop', value: 13, fill: 'var(--color-tiktok)', label: 'TikTok Shop' },
    { name: 'Bukalapak', value: 10, fill: 'var(--color-bukalapak)', label: 'Bukalapak' },
    { name: 'Lazada', value: 6, fill: 'var(--color-lazada)', label: 'Lazada' },
    { name: 'Blibli', value: 2, fill: 'var(--color-blibli)', label: 'Blibli' },
];

const chartConfig = {
  value: { label: 'Value' },
  shopee: { label: 'Shopee', color: 'hsl(var(--chart-shopee))' },
  tokopedia: { label: 'Tokopedia', color: 'hsl(var(--chart-tokopedia))' },
  tiktok: { label: 'TikTok Shop', color: 'hsl(var(--chart-tiktok))' },
  bukalapak: { label: 'Bukalapak', color: 'hsl(var(--chart-bukalapak))' },
  lazada: { label: 'Lazada', color: 'hsl(var(--chart-lazada))' },
  blibli: { label: 'Blibli', color: 'hsl(var(--chart-blibli))' },
  'Iklan Medsos & Video': { color: 'hsl(var(--chart-1))' },
  'Endorse & KOL': { color: 'hsl(var(--chart-2))' },
  'Promosi & Diskon': { color: 'hsl(var(--chart-3))' },
  'Lainnya': { color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

export default function AnalystPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "Sambal Roa Nona Manis",
      targetSegment: "Karyawan kantoran, suka pedas",
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
      useVideoContent: true,
      useKOLs: true,
      useDiscounts: false,
      useOtherChannels: false,
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
        errorMessage = "Sabar ya, lagi banyak yang pakai nih. Coba lagi beberapa menit lagi.";
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

  const { budgetAllocationData, budgetSummary } = useMemo(() => {
    const { totalMarketingBudget, useVideoContent, useKOLs, useDiscounts, useOtherChannels } = watchedValues;
    const channels = [
      { name: 'Iklan Medsos & Video', active: useVideoContent, fill: 'hsl(var(--chart-1))' },
      { name: 'Endorse & KOL', active: useKOLs, fill: 'hsl(var(--chart-2))' },
      { name: 'Promosi & Diskon', active: useDiscounts, fill: 'hsl(var(--chart-3))' },
      { name: 'Lainnya', active: useOtherChannels, fill: 'hsl(var(--chart-4))' },
    ];
    
    const activeChannels = channels.filter(c => c.active);
    const count = activeChannels.length;
    
    const allocation = count > 0 ? totalMarketingBudget / count : 0;
  
    const data = channels.map(c => ({
      name: c.name,
      value: c.active ? allocation : 0,
      fill: c.fill,
      active: c.active
    }));
  
    let summary = "Pilih channel promosi untuk melihat rekomendasi strategi.";
    if (count === 1) summary = `Strategi fokus, cocok untuk menguji satu channel spesifik.`;
    if (count === 2) summary = `Strategi seimbang, bagus untuk membandingkan dua channel.`;
    if (count === 3) summary = `Strategi diversifikasi, menjangkau audiens lebih luas.`;
    if (count === 4) summary = `Strategi diversifikasi penuh, ideal untuk brand mapan.`;
    if (count === 0) summary = `Tidak ada bujet yang dialokasikan.`;
  
    return { budgetAllocationData: data, budgetSummary: summary };
  }, [watchedValues.totalMarketingBudget, watchedValues.useVideoContent, watchedValues.useKOLs, watchedValues.useDiscounts, watchedValues.useOtherChannels]);


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
        <section className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-headline">Capek jualan tapi hasilnya gak jelas?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">Cek dulu strategimu di sini. SiapJual.ai bantu kamu lihat untung-rugi sebelum promo dimulai.</p>
          <div className="mt-8 relative aspect-video max-w-lg mx-auto p-4">
            <Image src="https://placehold.co/600x400.png" alt="Ilustrasi 3D logistik e-commerce" layout="fill" objectFit="contain" className="rounded-lg" data-ai-hint="e-commerce success" />
          </div>
           <Button asChild size="lg" className="mt-8">
             <Link href="#cek-strategi">Mulai Cek Strategi</Link>
           </Button>
        </section>

        <section id="wawasan-pasar" className="space-y-4">
            <h2 className="text-3xl font-bold text-center">Wawasan Pasar E-Commerce Indonesia</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Proyeksi Nilai Pasar (GMV)</CardTitle>
                        <CardDescription>Pasar e-commerce Indonesia terus tumbuh kencang. Jangan sampai ketinggalan.</CardDescription>
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
                        <CardTitle>Siapa Pembelimu?</CardTitle>
                        <CardDescription>Kenali siapa dan bagaimana mereka belanja online.</CardDescription>
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
                                <p className="font-semibold">Belanja Lewat HP</p>
                                <p className="text-2xl font-bold">67% Transaksi</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><TrendingUp className="w-8 h-8 text-primary" /></div>
                            <div>
                                <p className="font-semibold">Paling Dicari</p>
                                <p className="text-xl font-bold">Promo & Gratis Ongkir</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
        
        <section id="pangsa-pasar">
            <Card>
                <CardHeader>
                    <CardTitle>Siapa Raja di Pasar? (Estimasi Pangsa Pasar GMV 2025)</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="w-full h-[300px]">
                         <ChartContainer config={chartConfig} className="h-full w-full">
                            <RechartsBarChart layout="vertical" data={marketShareData} margin={{ left: 10, right: 50 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                    width={80}
                                />
                                <XAxis dataKey="value" type="number" hide />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }} 
                                    content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                                />
                                <Bar dataKey="value" layout="vertical" radius={5}>
                                    {marketShareData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                    <LabelList 
                                        dataKey="value" 
                                        position="right" 
                                        offset={8} 
                                        className="fill-foreground font-semibold"
                                        formatter={(value: number) => `${value}%`}
                                    />
                                 </Bar>
                            </RechartsBarChart>
                        </ChartContainer>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2">Analisis Medan Perang</h3>
                        <div>
                            <p className="font-bold">TikTok & Tokopedia</p>
                            <p className="text-muted-foreground text-sm">Kanal untuk "Shoppertainment" & Pembelian Impulsif</p>
                            <p className="text-muted-foreground">Kuasai dengan konten video pendek, live streaming, dan tren viral.</p>
                        </div>
                        <div>
                            <p className="font-bold">Shopee</p>
                            <p className="text-muted-foreground text-sm">Raksasa Pasar Massal & Promo Agresif</p>
                            <p className="text-muted-foreground">Menangkan dengan perang harga, voucher, gamifikasi, dan iklan internal yang masif.</p>
                        </div>
                        <div>
                            <p className="font-bold">Lazada & Blibli</p>
                            <p className="text-muted-foreground text-sm">Benteng untuk Brand & Audiens Berkualitas</p>
                            <p className="text-muted-foreground">Dominasi dengan branding premium, garansi (LazMall), dan layanan superior.</p>
                        </div>
                        <div>
                            <p className="font-bold">Social Commerce</p>
                            <p className="text-muted-foreground text-sm">Kanal untuk Targeting Presisi (Meta & Google Ads)</p>
                            <p className="text-muted-foreground">Jangkau audiens spesifik dengan retargeting dan lead generation.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <section id="cek-strategi">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Data Bisnis Kamu</CardTitle>
                        <CardDescription>Isi data ini biar AI bisa bantu analisis. Santai, data kamu aman.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <FormField control={form.control} name="initialMarketingBudget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modal Awal (Rp)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
            </section>

            <section id="model-bisnis">
                <Card>
                    <CardHeader>
                        <CardTitle>Gaya Jualan Kamu</CardTitle>
                        <CardDescription>Pilih model yang paling pas sama bisnismu.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                         <div>
                            <FormField
                                control={form.control}
                                name="marginModel"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Untungnya Gimana?</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="tipis">Untung Tipis</TabsTrigger>
                                                    <TabsTrigger value="tebal">Untung Tebal</TabsTrigger>
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
                                        <FormLabel>Brand Kamu Udah Dikenal?</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="baru">Baru Mulai</TabsTrigger>
                                                    <TabsTrigger value="kuat">Udah Kuat</TabsTrigger>
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

            <section id="cek-strategi-lanjutan">
                <Card>
                    <CardHeader>
                        <CardTitle>Cek Strategi Harga & Biaya</CardTitle>
                        <CardDescription>Ayo kita hitung potensi cuan dari bisnismu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Kalkulator Untung per Produk</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField control={form.control} name="sellPrice" render={({ field }) => (<FormItem><FormLabel>Harga Jual</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="costOfGoods" render={({ field }) => (<FormItem><FormLabel>Modal Produk (HPP)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="adCost" render={({ field }) => (<FormItem><FormLabel>Biaya Iklan / Produk</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="otherCostsPercentage" render={({ field }) => (<FormItem><FormLabel>Biaya Lain (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <Card className="p-4 bg-muted">
                                    <p className="text-sm text-muted-foreground">Laba/Unit</p>
                                    {renderFittableNumber(calculations.netProfitPerUnit, true, calculations.netProfitPerUnit < 0)}
                                </Card>
                                <Card className="p-4 bg-muted">
                                    <p className="text-sm text-muted-foreground">Net Margin</p>
                                    <p className={`text-2xl font-bold ${calculations.netProfitMargin < 0 ? 'text-destructive' : 'text-green-600'}`}>{calculations.netProfitMargin.toFixed(1)}%</p>
                                </Card>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Kapan Balik Modal? (BEP)</h3>
                                <FormField control={form.control} name="fixedCostsPerMonth" render={({ field }) => (<FormItem><FormLabel>Biaya Tetap / Bulan</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <Card className="p-4 bg-muted mt-2">
                                  <p className="text-sm text-muted-foreground">Jual Berapa Produk Biar BEP?</p>
                                  {renderFittableNumber(isFinite(calculations.bepUnit) ? Math.ceil(calculations.bepUnit) : 'N/A', false, false, "text-xl")}
                                </Card>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Prediksi Omzet</h3>
                                <FormField control={form.control} name="avgSalesPerMonth" render={({ field }) => (<FormItem><FormLabel>Target Jual / Bulan (Unit)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                <Card className="p-4 bg-muted mt-2">
                                  <p className="text-sm text-muted-foreground">Omzet Bulanan</p>
                                  {renderFittableNumber(calculations.monthlyRevenue, true, false, "text-xl")}
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
            
            <section id="alokasi-bujet">
                <Card>
                    <CardHeader>
                        <CardTitle>Alokator Bujet Pemasaran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="totalMarketingBudget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bujet Promosi / Bulan</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                            </FormItem>
                        )} />
                        
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <RechartsPieChart>
                                <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                                <Pie 
                                    data={budgetAllocationData.filter(d => d.active)} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    innerRadius={60} 
                                    outerRadius={90} 
                                    strokeWidth={2}
                                />
                            </RechartsPieChart>
                        </ChartContainer>

                        <div className="space-y-4">
                            {budgetAllocationData.map((channel, index) => (
                                <FormField 
                                    key={channel.name}
                                    control={form.control}
                                    name={
                                        index === 0 ? "useVideoContent" :
                                        index === 1 ? "useKOLs" :
                                        index === 2 ? "useDiscounts" :
                                        "useOtherChannels"
                                    }
                                    render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="h-2 w-2 rounded-full" style={{backgroundColor: channel.fill}}></span>
                                                <FormLabel className="font-normal">{channel.name}</FormLabel>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">{formatCurrency(channel.value)}</span>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        style={{
                                                            '--switch-bg-checked': channel.fill,
                                                            '--switch-bg-unchecked': 'hsl(var(--muted))',
                                                        } as React.CSSProperties}
                                                        className="data-[state=checked]:bg-[--switch-bg-checked] data-[state=unchecked]:bg-[--switch-bg-unchecked]"
                                                    />
                                                </FormControl>
                                            </div>
                                        </div>
                                    </FormItem>
                                )}/>
                            ))}
                        </div>
                        <p className="text-center text-sm text-muted-foreground">{budgetSummary}</p>
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" className="w-full text-lg" disabled={isLoading}>
                           {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '⚡ Cek Hasilnya dengan AI'}
                       </Button>
                    </CardFooter>
                </Card>
            </section>
          </form>
        </Form>
        
         <div id="hasil-simulasi" className="scroll-mt-20">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">AI lagi ngitung, bentar ya...</p>
                <p className="text-muted-foreground">Lagi ngeracik strategi terbaik buat lo.</p>
              </div>
            )}

            {analysisResult && (
              <>
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Hasil Simulasi Strategimu</h2>
                        <p className="text-muted-foreground mt-2">Ini dia prediksi kesehatan bisnismu berdasarkan data yang kamu isi.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="p-6 flex flex-col justify-between text-center">
                           <div>
                             <p className="text-sm text-muted-foreground">Proyeksi Pendapatan Tahunan</p>
                             {renderFittableNumber(analysisResult.annualRevenue, true, false, "text-3xl mt-2 text-primary")}
                           </div>
                           <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Estimasi total penjualan kotor kamu dalam setahun.</p>
                        </Card>
                        <Card className="p-6 flex flex-col justify-between text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Proyeksi Profit Tahunan</p>
                                {renderFittableNumber(analysisResult.annualProfit, true, analysisResult.annualProfit < 0, `text-3xl mt-2 ${analysisResult.annualProfit < 0 ? '' : 'text-green-600'}`)}
                            </div>
                           <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Perkiraan untung bersih setelah semua biaya dibayar.</p>
                        </Card>
                        <Card className="p-6 flex flex-col justify-between text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Return on Ad Spend (ROAS)</p>
                                {renderFittableNumber(`${analysisResult.roas.toFixed(2)}x`, false, false, "text-3xl mt-2 text-primary")}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">Setiap Rp1 buat iklan menghasilkan {formatCurrency(analysisResult.roas)} pendapatan.</p>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle>Laporan Untung Rugi (Bulanan)</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                    {analysisResult.pnlTable.map(item => (
                                        <TableRow key={item.item}>
                                        <TableCell className={cn("py-2 px-4", item.item === 'Laba Kotor' || item.item === 'Laba Bersih Bulanan' ? 'font-bold' : '')}>{item.item}</TableCell>
                                        <TableCell className={cn("text-right font-medium py-2 px-4", item.item === 'Laba Kotor' || item.item === 'Laba Bersih Bulanan' ? 'font-bold' : '')}>
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
                        <CardHeader>
                            <CardTitle>Kata AI Soal Strategimu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analysisResult.marketAnalysis.evaluation.includes("berisiko") || analysisResult.annualProfit < 0 ?
                                (<Alert variant="destructive" className="bg-destructive/5">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Waduh, Gawat Nih!</AlertTitle>
                                    <AlertDescription>{analysisResult.marketAnalysis.evaluation} {analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                                </Alert>) :
                                (<Alert className="bg-green-500/10 border-green-500/30 text-green-700">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <AlertTitle>Analisis AI</AlertTitle>
                                    <AlertDescription>{analysisResult.marketAnalysis.evaluation} {analysisResult.marketAnalysis.keyConsiderations}</AlertDescription>
                                </Alert>)
                            }
                        </CardContent>
                    </Card>

                </section>
                
                <section id="rencana-aksi">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rencana Aksi Biar Cuan</CardTitle>
                      <CardDescription>Ini langkah-langkah nyata dari AI yang bisa langsung kamu kerjain.</CardDescription>
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
        </div>
      </main>
    </div>
  );
}
