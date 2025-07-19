
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-h1 font-bold">Lahir dari Strategi yang Salah.</h1>
          </div>

          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
              <p>
                Awalnya, kami pikir semuanya udah siap. Produk udah ada, stok numpuk, feed Instagram rapi. Tinggal tunggu orderan masuk. Tapi pas launching? Sunyi. Gak ada suara. Gak ada transaksi.
              </p>
              <p>
                Padahal bukan karena produknya jelek. Tapi karena <strong className="text-foreground">strateginya ngaco.</strong>
              </p>
              <p>
                Iklan udah jalan, tapi asal tembak. Gak tahu siapa yang harus dituju. Harga ditetapkan tanpa hitung-hitungan. Akhirnya? Budget iklan ludes, stok gak muter, dan waktu kebuang percuma.
              </p>
            </CardContent>
          </Card>

          <div className="text-center space-y-2 py-4">
            <p className="text-subtitle text-foreground max-w-2xl mx-auto">
              Dari situ muncul satu pertanyaan penting: <strong className="text-primary">“Gimana caranya tahu strategi ini layak, sebelum uang dan waktu benar-benar habis?”</strong>
            </p>
            <p className="text-h2 font-semibold">Itu titik lahirnya Petakan.ai.</p>
          </div>
          
          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
               <p>
                Bukan alat yang lahir dari ruang rapat ber-AC, tapi dari <strong className="text-foreground">pengalaman gagal di lapangan.</strong> Petakan.ai dibangun supaya lo bisa ambil keputusan lebih tenang, karena ada data dan simulasi yang bantu buka mata — bahkan sebelum iklan pertama tayang.
              </p>
              <p className="text-lg text-center font-medium text-foreground py-2">
                Sebelum lo keluar duit buat stok. Sebelum lo spending di iklan. Simulasikan dulu.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Di Petakan.ai, lo bisa:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Cek <strong className="text-foreground">untung-rugi</strong> dari ide yang mau lo jalanin.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Uji <strong className="text-foreground">harga jual</strong> dan budget iklan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Baca <strong className="text-foreground">tren perilaku pasar</strong> digital Indonesia.</span>
                </li>
                 <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Dapat <strong className="text-foreground">rekomendasi strategi</strong> berbasis data lokal — dari AI yang ngerti konteks.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
           
           <Card>
             <CardContent className="text-center p-6 space-y-4">
                <p className="text-body text-muted-foreground">
                    Platform ini dibuat sama <strong className="text-foreground">RizkyFadil</strong>, setelah lihat terlalu banyak bisnis bagus kandas. Bukan karena produknya salah, tapi karena gak tahu arah dari awal.
                </p>
               <p className="text-lg text-foreground">
                 Karena setiap ide bisnis datang dengan harapan. Dan harapan itu layak dikawal dengan strategi yang tepat.
              </p>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <h2 className="text-h2 font-semibold tracking-tight">Petakan Sebelum Jalan.</h2>
          </div>
        </div>
      </main>
    </>
  );
}
