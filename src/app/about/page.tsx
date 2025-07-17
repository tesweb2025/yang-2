
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-h1 font-bold">Tentang Petakan.ai</h1>
            <p className="text-subtitle text-muted-foreground">
              Platform simulasi bisnis yang lahir dari satu pertanyaan sederhana: "Gimana caranya kita tahu strategi ini layak, tanpa harus buang uang duluan?"
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
              <p>
                Petakan.ai bukan cuma alat. Ini refleksi dari pengalaman, kegagalan, dan kebutuhan nyata para pebisnis di lapangan. Dibangun oleh RizkyFadil, platform ini lahir karena satu alasan: banyak sekali ide bagus yang kandas hanya karena tak punya cara untuk melihat potensi risiko sebelum nekat jalan.
              </p>
              <p>
                Saat platform lain membantumu setelah penjualan terjadi, <strong className="text-foreground">Petakan hadir sebelum kamu memasang iklan pertama,</strong> sebelum menyetok produk, dan sebelum kehabisan modal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Di Petakan, lo bisa:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong className="text-foreground">Simulasiin untung-rugi</strong> dari ide lo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong className="text-foreground">Validasi strategi harga</strong> dan bujet iklan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Dapat <strong className="text-foreground">insight dari perilaku pasar</strong> digital Indonesia</span>
                </li>
              </ul>
               <p className="text-body text-muted-foreground pt-2">
                Semua dirancang biar lo bisa ngambil keputusan bisnis dengan kepala dingin, bukan dengan feeling.
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardContent className="text-center p-6">
               <p className="text-lg text-foreground">
                Di balik setiap ide bisnis, selalu ada harapan yang dibawa, waktu yang dikorbankan, dan tabungan yang dipertaruhkan. Petakan.ai hadir buat bantu lo lihat gambaran besar sejak awal — biar semua usaha itu gak berakhir sia-sia cuma karena strategi yang keliru.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
