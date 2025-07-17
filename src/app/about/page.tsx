
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
              Platform simulasi bisnis yang lahir dari satu pertanyaan sederhana:
              <br />
              <span className="font-semibold text-foreground">"Gimana caranya kita tahu strategi ini layak, tanpa harus buang uang duluan?"</span>
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
              <p>
                Petakan.ai bukan cuma alat. Ini refleksi dari pengalaman, kegagalan, dan kebutuhan nyata para pebisnis di lapangan.
              </p>
              <p>
                Dibangun oleh RizkyFadil, Petakan lahir karena satu hal: banyak banget orang punya ide bagus, tapi gak punya alat untuk ngelihat kemungkinan sebelum nekat jalan.
              </p>
              <p>
                Kebanyakan platform bantu kamu setelah jualan. <strong className="text-foreground">Petakan bantu kamu sebelum kamu pasang iklan pertama.</strong> Sebelum kamu nyetok produk. Sebelum kamu kehabisan modal.
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
           <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="text-center p-6">
               <p className="font-semibold text-lg">
                Karena di dunia bisnis, yang dipertaruhkan bukan cuma uang... tapi waktu, tenaga, dan harapan.
              </p>
              <p className="mt-2 text-primary-foreground/90">
                Petakan.ai bantu lo ngambil langkah pertama — dengan data, bukan tebak-tebakan.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
