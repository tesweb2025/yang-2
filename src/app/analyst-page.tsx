
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { BrainCircuit, Loader2, Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle, ArrowRight, Video, Users, Receipt, Share2, Clock, Percent, Zap, Sparkles } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { runAnalysis } from './actions';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, ResponsiveContainer, LabelList, Cell, ComposedChart, Line } from 'recharts';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';


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
  useVideoContent: z.boolean().optional().default(false),
  useKOL: z.boolean().optional().default(false),
  usePromo: z.boolean().optional().default(false),
  useOtherChannels: z.boolean().optional().default(false),
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

const marketingStrategies = [
    {
        id: 'useVideoContent' as const,
        title: "Video Content & Ads",
        description: "Buat konten video pendek & pasang iklan di platform sosial.",
        channel: "Video & Ads",
        color: "hsl(var(--chart-1))",
        icon: Video,
        percentage: 0.479
    },
    {
        id: 'useKOL' as const,
        title: "KOL & Afiliasi",
        description: "Gunakan influencer atau program afiliasi untuk promosi.",
        channel: "KOL",
        color: "hsl(var(--chart-2))",
        icon: Users,
        percentage: 0.394
    },
    {
        id: 'usePromo' as const,
        title: "Promosi & Diskon",
        description: "Tawarkan diskon, voucher, atau promo bundling ke pelanggan.",
        channel: "Promo",
        color: "hsl(var(--chart-3))",
        icon: Receipt,
        percentage: 0.0635
    },
    {
        id: 'useOtherChannels' as const,
        title: "Kanal Lainnya",
        description: "Manfaatkan kanal lain seperti SEO, event, atau marketplace ads.",
        channel: "Lainnya",
        color: "hsl(var(--chart-4))",
        icon: Share2,
        percentage: 0.0635
    }
];


const formatCurrency = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumberInput = (value: string | number): string => {
    if (value === '' || value === null || value === undefined) return '';
    const num = String(value).replace(/[^\d]/g, '');
    if (num === '') return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num, 10));
};

const unformatNumberInput = (value: string): number => {
    if (value === '' || value === null || value === undefined) return 0;
    return parseInt(String(value).replace(/[^\d]/g, ''), 10) || 0;
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
    { name: 'Tokopedia & TikTok Shop', value: 39 },
    { name: 'Shopee', value: 37 },
    { name: 'Lazada', value: 10 },
    { name: 'Bukalapak', value: 6 },
    { name: 'Blibli', value: 5 },
];

const marketShareChartConfig = {
  value: { label: 'Value' },
  'Tokopedia & TikTok Shop': { label: 'Tokopedia & TikTok Shop', color: 'hsl(var(--primary))' },
  'Shopee': { label: 'Shopee', color: 'hsl(var(--primary))' },
  'Lazada': { label: 'Lazada', color: 'hsl(var(--primary))' },
  'Bukalapak': { label: 'Bukalapak', color: 'hsl(var(--primary))' },
  'Blibli': { label: 'Blibli', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;


const gmvComboData = [
    { month: 'Jan', shopee: 1800, tokopedia: 1500, average: 1650 },
    { month: 'Feb', shopee: 1700, tokopedia: 1600, average: 1650 },
    { month: 'Mar', shopee: 2100, tokopedia: 1800, average: 1950 },
    { month: 'Apr', shopee: 2200, tokopedia: 2000, average: 2100 },
    { month: 'May', shopee: 2500, tokopedia: 2200, average: 2350 },
    { month: 'Jun', shopee: 2300, tokopedia: 2100, average: 2200 },
    { month: 'Jul', shopee: 2600, tokopedia: 2400, average: 2500 },
    { month: 'Aug', shopee: 2500, tokopedia: 2300, average: 2400 },
    { month: 'Sep', shopee: 2800, tokopedia: 2600, average: 2700 },
    { month: 'Oct', shopee: 3000, tokopedia: 2800, average: 2900 },
    { month: 'Nov', shopee: 3200, tokopedia: 3000, average: 3100 },
    { month: 'Dec', shopee: 3500, tokopedia: 3300, average: 3400 },
];

const gmvComboChartConfig = {
    shopee: { label: 'GMV', color: "hsl(var(--primary))" },
    average: { label: 'Rata-rata', color: 'hsl(var(--success))' },
} satisfies ChartConfig;

const budgetChartConfig = {
  value: {
    label: "Value",
  },
  "Video & Ads": {
    label: "Video & Ads",
    color: "hsl(var(--chart-1))",
  },
  "KOL": {
    label: "KOL",
    color: "hsl(var(--chart-2))",
  },
  "Promo": {
    label: "Promo",
    color: "hsl(var(--chart-3))",
  },
  "Lainnya": {
    label: "Lainnya",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const platformStrategyDescriptions = [
    {
        title: "TikTok & Tokopedia",
        subtitle: "Kanal untuk \"Shoppertainment\" & Pembelian Impulsif",
        description: "Kuasai dengan konten video pendek, live streaming, dan tren viral."
    },
    {
        title: "Shopee",
        subtitle: "Raksasa Pasar Massal & Promo Agresif",
        description: "Menangkan dengan perang harga, voucher, gamifikasi, dan iklan internal yang masif."
    },
    {
        title: "Lazada & Blibli",
        subtitle: "Benteng untuk Brand & Audiens Berkualitas",
        description: "Dominasi dengan branding premium, garansi (LazMall), dan layanan superior."
    },
    {
        title: "Social Commerce",
        subtitle: "Kanal untuk Targeting Presisi (Meta & Google Ads)",
        description: "Jangkau audiens spesifik dengan retargeting dan lead generation."
    }
];

const NumericInput = ({ name, control, label }: { name: keyof FormData; control: any; label: string }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                // We manage a separate display value
                const [displayValue, setDisplayValue] = useState(formatNumberInput(field.value));

                useEffect(() => {
                    // Update display value if the form value changes externally
                    setDisplayValue(formatNumberInput(field.value));
                }, [field.value]);

                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                    const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
                    
                    // Update the form state with the raw numeric value
                    field.onChange(numericValue);
                    
                    // Update the display value with the formatted string
                    setDisplayValue(formatNumberInput(rawValue));
                };

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder={label.includes('%') ? "0" : "Rp 0"}
                                value={displayValue}
                                onChange={handleChange}
                                onBlur={field.onBlur}
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                );
            }}
        />
    );
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
      marginModel: 'tipis',
      brandStrength: 'baru',
      sellPrice: 0,
      costOfGoods: 0,
      adCost: 0,
      otherCostsPercentage: 0,
      fixedCostsPerMonth: 0,
      avgSalesPerMonth: 0,
      totalMarketingBudget: 0,
      useVideoContent: false,
      useKOL: false,
      usePromo: false,
      useOtherChannels: false,
    },
  });

  const watchedValues = form.watch();

  const { sellPrice, costOfGoods, adCost, otherCostsPercentage, fixedCostsPerMonth, totalMarketingBudget, useVideoContent, useKOL, usePromo, useOtherChannels } = watchedValues;

  const calculations = useMemo(() => {
    const sp = sellPrice || 0;
    const cogs = costOfGoods || 0;
    const ac = adCost || 0;
    const ocp = otherCostsPercentage || 0;
    const fcm = fixedCostsPerMonth || 0;

    const grossProfitPerUnit = sp - cogs;
    const netProfitPerUnit = grossProfitPerUnit - ac - (sp * ocp / 100);
    const bepUnit = netProfitPerUnit > 0 ? fcm / netProfitPerUnit : Infinity;
    
    return { netProfitPerUnit, bepUnit };
  }, [sellPrice, costOfGoods, adCost, otherCostsPercentage, fixedCostsPerMonth]);

  const budgetAllocations = useMemo(() => {
    const budget = totalMarketingBudget || 0;
    const activeStrategies = marketingStrategies.filter(s => {
        if (s.id === 'useVideoContent') return useVideoContent;
        if (s.id === 'useKOL') return useKOL;
        if (s.id === 'usePromo') return usePromo;
        if (s.id === 'useOtherChannels') return useOtherChannels;
        return false;
    });
    
    const totalPercentage = activeStrategies.reduce((sum, s) => sum + s.percentage, 0);

    const allocations: { [key: string]: number } = {};

    for (const strategy of marketingStrategies) {
        let isActive = false;
        if (strategy.id === 'useVideoContent') isActive = useVideoContent;
        else if (strategy.id === 'useKOL') isActive = useKOL;
        else if (strategy.id === 'usePromo') isActive = usePromo;
        else if (strategy.id === 'useOtherChannels') isActive = useOtherChannels;
        
        if (isActive && budget > 0 && totalPercentage > 0) {
            allocations[strategy.id] = (budget * strategy.percentage) / totalPercentage;
        } else {
            allocations[strategy.id] = 0;
        }
    }
    
    return allocations;
  }, [totalMarketingBudget, useVideoContent, useKOL, usePromo, useOtherChannels]);

  const budgetChartData = useMemo(() => {
    return marketingStrategies
      .filter(s => {
        if (s.id === 'useVideoContent') return useVideoContent;
        if (s.id === 'useKOL') return useKOL;
        if (s.id === 'usePromo') return usePromo;
        if (s.id === 'useOtherChannels') return useOtherChannels;
        return false;
      })
      .map(s => ({
        name: s.channel,
        value: budgetAllocations[s.id],
        fill: s.color,
      }));
  }, [budgetAllocations, useVideoContent, useKOL, usePromo, useOtherChannels]);

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
        <span className={cn('break-all', isNegative ? 'text-destructive' : 'text-foreground')}>
            {isNegative ? `- ${displayValue}`: displayValue}
        </span>
    );
  };

  const renderFittableTableCell = (value: number, isNegative = false, addSign = false) => {
    const displayValue = formatCurrency(value);
    const prefix = addSign ? (isNegative ? '− ' : '+ ') : (isNegative ? '− ' : '');
    const finalDisplayValue = prefix + displayValue.replace('Rp', '').trim();
    return (
       <span className={cn('break-all', isNegative ? 'text-destructive' : 'text-green-600', {'text-foreground': !addSign && !isNegative})}>
        {finalDisplayValue}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <main className="space-y-12 md:space-y-20">
        <section className="text-center pt-12 md:pt-20">
          <h1 className="text-h1 font-bold tracking-tight mb-4">Lihat Untung-Ruginya,<br />Sebelum Kamu Jalanin Strateginya.</h1>
           <div className="my-4 flex justify-center">
            <Image 
              src="https://raw.githubusercontent.com/tesweb2025/Market-Intelligence-5.1/3edf05a86f1e1ccf79e7463bb00ba3e48561fb1e/mobil%20paket%20kurir.png" 
              alt="Ilustrasi 3D truk pengiriman merah dengan boks dan pin lokasi"
              width={500} 
              height={375}
              className="max-w-sm md:max-w-md my-2"
              priority
            />
          </div>
          <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto">Simulasikan ide bisnis kamu dalam hitungan detik. Gratis, cepat, Petakan.ai bantu ambil keputusan lebih tenang.</p>
           <Button asChild size="lg" className="mt-8 rounded-full h-12 px-8">
             <Link href="#cek-strategi">
                Mulai Simulasi Gratis
                <ArrowRight className="ml-2"/>
             </Link>
           </Button>
        </section>

        <section id="wawasan-pasar" className="space-y-8 scroll-mt-24">
            <div className="text-center">
                <h2 className="text-h2 font-semibold">Peta Persaingan E-Commerce 2024</h2>
                <p className="text-subtitle text-muted-foreground mt-2">Data terbaru untuk bantu lo ambil keputusan yang lebih cerdas.</p>
            </div>
            <Card className="p-6 md:p-8">
                <CardHeader className="p-0">
                    <CardTitle className="text-h3 font-medium">Proyeksi Gross Merchandise Value (GMV)</CardTitle>
                    <CardDescription>Pasar mulai dewasa, fokus bergeser dari 'bakar uang' ke profitabilitas. Pertumbuhan melambat ke 5% (YoY).</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-4 space-y-4">
                    <p className="text-5xl font-bold text-primary">US$56,5 M</p>
                    <div className="h-60 w-full overflow-x-auto">
                        <ChartContainer config={gmvComboChartConfig} className="h-full min-w-[600px]">
                            <ComposedChart data={gmvComboData} barCategoryGap="30%" margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                <RechartsTooltip content={<ChartTooltipContent formatter={(value, name) => [`$${value}`, gmvComboChartConfig[name as keyof typeof gmvComboChartConfig]?.label]} />} />
                                <Bar dataKey="shopee" barSize={20} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="average" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ChartContainer>
                    </div>
                    <p className="text-caption text-muted-foreground text-center">Visualisasi tren GMV antar platform besar.</p>
                </CardContent>

                <Separator className="my-8"/>

                <CardHeader className="p-0 mt-6">
                    <CardTitle className="text-h3 font-medium">Wawasan Penting Pembeli Digital</CardTitle>
                    <CardDescription>Pola perilaku kunci yang mendorong penjualan.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                    <div className="flex items-start gap-3">
                         <div className="p-2.5 bg-primary/10 rounded-lg"><Clock className="w-5 h-5 text-primary" /></div>
                        <div>
                            <p className="font-semibold text-body">Puncak Belanja</p>
                            <p className="text-muted-foreground text-sm">Pembelian memuncak di jam 19-21 malam & saat tanggal gajian tiba.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <div className="p-2.5 bg-primary/10 rounded-lg"><Sparkles className="w-5 h-5 text-primary" /></div>
                        <div>
                            <p className="font-semibold text-body">Pendorong Utama</p>
                            <p className="text-muted-foreground text-sm">82% pelanggan membeli karena ada promo, diskon, atau gratis ongkir.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                       <div className="p-2.5 bg-primary/10 rounded-lg"><Percent className="w-5 h-5 text-primary" /></div>
                        <div>
                            <p className="font-semibold text-body">Sensitivitas Harga</p>
                            <p className="text-muted-foreground text-sm">65% audiens aktif membandingkan harga di beberapa toko sebelum checkout.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                         <div className="p-2.5 bg-primary/10 rounded-lg"><Zap className="w-5 h-5 text-primary" /></div>
                        <div>
                            <p className="font-semibold text-body">Pengiriman Cepat</p>
                            <p className="text-muted-foreground text-sm">55% cenderung membatalkan pesanan jika estimasi pengiriman terlalu lama.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
        
        <section id="pangsa-pasar" className="scroll-mt-24">
            <Card className="p-6 md:p-8">
                <CardHeader className="p-0">
                    <CardTitle className="text-h3 font-medium">Siapa Raja di Pasar? (Estimasi Pangsa Pasar GMV 2024)</CardTitle>
                    <CardDescription>Integrasi Tokopedia & TikTok Shop menciptakan duopoli baru yang menantang dominasi Shopee.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-8 space-y-8">
                    <div className="w-full h-[300px] overflow-x-auto">
                        <ChartContainer config={marketShareChartConfig} className="h-full min-w-[500px]">
                            <RechartsBarChart data={marketShareData} barCategoryGap="20%" margin={{ bottom: 20 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tickLine={false} 
                                    axisLine={false}
                                    interval={0}
                                    dy={10}
                                    tick={(props) => {
                                        const { x, y, payload } = props;
                                        const value = payload.value;
                                        if (value.includes(' & ')) {
                                          const parts = value.split(' & ');
                                          return (
                                            <g transform={`translate(${x},${y})`}>
                                              <text x={0} y={0} dy={5} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={12}>
                                                <tspan x="0" dy="0em">{parts[0]}</tspan>
                                                <tspan x="0" dy="1.2em">&amp; {parts[1]}</tspan>
                                              </text>
                                            </g>
                                          );
                                        }
                                        return (
                                          <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={0} dy={16} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={12}>
                                              {value}
                                            </text>
                                          </g>
                                        );
                                    }}
                                />
                                <YAxis hide />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }} 
                                    content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                        {platformStrategyDescriptions.map((platform, index) => (
                            <div key={index}>
                                <h4 className="font-semibold text-body">{platform.title}</h4>
                                <p className="text-primary text-sm font-medium">{platform.subtitle}</p>
                                <p className="text-sm text-muted-foreground mt-1">{platform.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <section id="cek-strategi" className="scroll-mt-24">
              <Card className="p-6 md:p-8">
                <CardHeader className="p-0">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-h3 font-medium">Data Bisnismu</CardTitle>
                      <CardDescription>Isi data ini agar AI bisa menganalisis strategimu.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="productName" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nama Produk / Bisnis</FormLabel>
                          <FormControl><Input placeholder="Contoh: Keripik Pedas" {...field} /></FormControl>
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
                  
                  <div className="space-y-2 pt-2">
                    <h3 className="font-medium text-sm">Pilih Strategi Pemasaran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketingStrategies.map((strategy) => (
                        <FormField
                          key={strategy.id}
                          control={form.control}
                          name={strategy.id}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={strategy.id}
                                className={cn(
                                  "p-4 rounded-xl border transition-all relative cursor-pointer flex flex-col gap-1",
                                  field.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/30 hover:bg-muted/60"
                                )}
                              >
                                <div className="absolute top-4 right-4">
                                  <FormControl>
                                    <Switch
                                      id={strategy.id}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="cursor-pointer"
                                    />
                                  </FormControl>
                                </div>
                                <strategy.icon className={cn("w-6 h-6 mb-2", field.value ? "text-primary-foreground" : "text-primary")} />
                                <span className="font-semibold">{strategy.title}</span>
                                <p className={cn("text-sm", field.value ? "text-primary-foreground/80" : "text-muted-foreground")}>{strategy.description}</p>
                              </FormLabel>
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
                            <div className="bg-background border p-4 rounded-xl h-full">
                              <h4 className="font-semibold text-lg text-primary">{selectedBusinessModel.persona}</h4>
                              <p className="mt-1 text-caption">{selectedBusinessModel.analysis}</p>
                              <p className="mt-2 text-caption font-semibold">{selectedBusinessModel.platforms}</p>
                            </div>
                        </div>
                        <div className="border-t -mx-8 my-8"></div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Kalkulator Harga & Biaya per Produk</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <NumericInput name="sellPrice" control={form.control} label="Harga Jual" />
                                <NumericInput name="costOfGoods" control={form.control} label="Modal Produk (HPP)" />
                                <NumericInput name="adCost" control={form.control} label="Biaya Iklan (CAC)" />
                                <NumericInput name="otherCostsPercentage" control={form.control} label="Biaya Lain (%)" />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Biaya Tetap & Target Penjualan</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <NumericInput name="fixedCostsPerMonth" control={form.control} label="Biaya Tetap / Bulan" />
                                    <NumericInput name="avgSalesPerMonth" control={form.control} label="Target Jual / Bulan" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Estimasi Profitabilitas</h3>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card className="p-4 bg-muted/50 flex flex-col justify-between rounded-xl">
                                        <div>
                                            <p className="text-caption text-muted-foreground">Laba/unit</p>
                                            <p className={cn(
                                                "text-xl font-bold break-all",
                                                calculations.netProfitPerUnit > 0 ? "text-green-600" :
                                                calculations.netProfitPerUnit < 0 ? "text-destructive" : "text-foreground"
                                            )}>{formatCurrency(calculations.netProfitPerUnit)}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Keuntungan bersih setelah semua biaya dari satu produk terjual.</p>
                                    </Card>
                                    <Card className="p-4 bg-muted/50 flex flex-col justify-between rounded-xl">
                                        <div>
                                            <p className="text-caption text-muted-foreground">BEP (unit)</p>
                                            <p className={cn(
                                                "text-xl font-bold break-all",
                                                isFinite(calculations.bepUnit) && calculations.bepUnit > 0
                                                    ? "text-green-600"
                                                    : "text-destructive"
                                            )}>
                                              {isFinite(calculations.bepUnit) ? new Intl.NumberFormat('id-ID').format(Math.ceil(calculations.bepUnit)) : 'N/A'}
                                            </p>
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
                    <CardHeader className="p-0 text-center mb-6">
                        <CardTitle className="text-h3 font-medium">Alokator Bujet Pemasaran</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="mb-8 max-w-sm mx-auto">
                           <NumericInput name="totalMarketingBudget" control={form.control} label="Total Bujet Pemasaran"/>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="overflow-x-auto flex justify-center">
                                {budgetChartData.length > 0 ? (
                                    <div className="w-full h-64">
                                        <ChartContainer config={budgetChartConfig} className="h-full w-full">
                                            <RechartsBarChart
                                                data={budgetChartData}
                                                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                                                />
                                                <YAxis type="number" hide />
                                                <RechartsTooltip
                                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {budgetChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                     <LabelList
                                                        dataKey="value"
                                                        position="top"
                                                        offset={8}
                                                        className="fill-foreground font-medium"
                                                        fontSize={12}
                                                        formatter={(value: number) => {
                                                            if (value === 0) return '';
                                                            return formatCurrency(value);
                                                        }}
                                                    />
                                                </Bar>
                                            </RechartsBarChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center bg-muted/50 rounded-xl">
                                      <p className="text-muted-foreground">Pilih strategi untuk melihat alokasi</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {marketingStrategies.map(strategy => (
                                    <FormField
                                        key={strategy.id}
                                        control={form.control}
                                        name={strategy.id}
                                        render={({ field }) => (
                                            <FormItem>
                                              <FormLabel htmlFor={strategy.id} className="flex items-center justify-between rounded-xl border p-3 cursor-pointer">
                                                  <div className="flex items-center gap-3">
                                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strategy.color }}></span>
                                                      <span className="flex-1 font-medium">{strategy.title}</span>
                                                  </div>
                                                  <div className="flex items-center gap-4">
                                                    <span className="font-medium text-sm w-28 text-right break-all">{formatCurrency(budgetAllocations[strategy.id] || 0)}</span>
                                                    <FormControl>
                                                      <Switch
                                                        id={strategy.id}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                      />
                                                    </FormControl>
                                                  </div>
                                              </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-muted-foreground text-caption pt-4">
                           Bujet dibagi secara proporsional berdasarkan strategi yang aktif.
                        </p>
                    </CardContent>
                    <div className="border-t -mx-8 my-8"></div>
                    <Button type="submit" className="w-full h-14 text-lg rounded-full" disabled={isLoading}>
                       {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '🚀 Petakan Sekarang'}
                    </Button>
                </Card>
            </section>
          </form>
        </Form>
        
         <div id="hasil-simulasi" className="scroll-mt-24 space-y-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold">AI sedang menganalisis...</p>
                <p className="text-muted-foreground text-caption">Tunggu dulu, AI sedang memproses datamu.</p>
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
                               <p className="text-2xl md:text-3xl mt-2 font-bold text-primary break-all">{formatCurrency(analysisResult.annualRevenue)}</p>
                            </div>
                            <p className="text-caption text-muted-foreground mt-2">Total omzet kotor sebelum dikurangi biaya.</p>
                        </Card>
                        <Card className="p-6 text-center flex flex-col justify-between">
                             <div>
                                <p className="text-body font-semibold">Proyeksi Profit Tahunan</p>
                                <p className={`text-2xl md:text-3xl mt-2 font-bold break-all ${analysisResult.annualProfit < 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(analysisResult.annualProfit)}</p>
                            </div>
                            <p className="text-caption text-muted-foreground mt-2">Sisa uang setelah semua biaya terbayar.</p>
                        </Card>
                        <Card className="p-6 text-center flex flex-col justify-between">
                            <div>
                               <p className="text-body font-semibold">Return on Ad Spend (ROAS)</p>
                               <p className="text-2xl md:text-3xl mt-2 font-bold break-all">{`${analysisResult.roas.toFixed(2)}x`}</p>
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
                                          <TableCell className={cn("w-[60%] py-3 px-2 md:px-4", item.item === 'Untung Kotor' || item.item === 'Untung Bersih Bulanan' ? 'font-bold' : '')}>{item.item}</TableCell>
                                          <TableCell className={cn("w-[40%] text-right font-medium py-3 px-2 md:px-4 text-sm whitespace-nowrap", item.item === 'Untung Kotor' || item.item === 'Untung Bersih Bulanan' ? 'font-bold' : '')}>
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
                                            <TableCell className={cn("w-[60%] py-3 px-2 md:px-4", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>{row.item}</TableCell>
                                            <TableCell className={cn("w-[40%] text-right font-medium py-3 px-2 md:px-4 text-sm whitespace-nowrap", row.item === 'Arus Kas Bersih' ? 'font-bold' : '')}>
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
                            <CardTitle>Status Strategi Bisnismu</CardTitle>
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
                
                <section id="rencana-aksi" className="mt-8 space-y-8">
                  <Card className="p-6 md:p-8">
                    <CardHeader className="p-0">
                      <CardTitle className="text-h3 font-medium">Rute Strategi dari Petakan.ai</CardTitle>
                      <CardDescription>Rekomendasi dari AI yang bisa langsung Anda terapkan.</CardDescription>
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
