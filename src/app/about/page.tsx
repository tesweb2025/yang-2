
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-h1 font-bold">Lahir dari Strategi yang Salah.</h1>
          </div>

          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
              <p>
                Dulu, waktu pertama kali mau jualan online, kami cuma modal keyakinan. Produk udah jadi, stok udah numpuk, desain feed Instagram rapi. Tapi pas launching? Sepi. Gak ada yang beli.
              </p>
              <p>
                Bukan karena produknya jelek. Tapi karena <strong className="text-foreground">strateginya salah.</strong>
              </p>
              <p>
                Iklan ke sembarang orang, harga asal tembak, gak ngerti siapa target yang sebenernya butuh produk itu. Akhirnya uang iklan habis, stok gak muter, dan semua energi kebuang sia-sia.
              </p>
            </CardContent>
          </Card>

          <div className="text-center space-y-2 py-4">
            <p className="text-subtitle text-foreground max-w-2xl mx-auto">
              Dari situ, lahirlah satu pertanyaan: “Gimana caranya kita bisa ngelihat potensi cuan dan risiko dari sebuah strategi, <strong className="text-primary">sebelum</strong> kita buang waktu & modal?”
            </p>
            <p className="text-h2 font-semibold">Dan lahirlah Petakan.ai.</p>
          </div>
          
          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
               <p>
                Ini bukan alat canggih yang dibikin di dalam lab, tapi dari <strong className="text-foreground">pengalaman gagal dan belajar di lapangan.</strong> Petakan.ai adalah cermin dari keputusan-keputusan yang pernah salah—dan sekarang, jadi panduan biar lo gak ngulangin kesalahan yang sama.
              </p>
              <p className="text-lg text-center font-medium text-foreground py-2">
                Sebelum lo keluar duit buat iklan. Sebelum lo beli stok. Simulasikan dulu. Pakai data, bukan firasat.
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
                  <span><strong className="text-foreground">Simulasiin untung-rugi</strong> dari ide lo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong className="text-foreground">Validasi harga</strong> dan bujet iklan sebelum eksekusi.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Lihat <strong className="text-foreground">tren dan perilaku pasar</strong> digital di Indonesia.</span>
                </li>
                 <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Dapat <strong className="text-foreground">rekomendasi strategi dari AI</strong> yang ngerti konteks lokal.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
           
           <Card>
             <CardContent className="text-center p-6 space-y-4">
                <p className="text-body text-muted-foreground">
                    Platform ini dibuat oleh <strong className="text-foreground">RizkyFadil</strong>—yang melihat terlalu banyak ide bagus tumbang cuma karena gak bisa melihat peta perangnya sejak awal.
                </p>
               <p className="text-lg text-foreground">
                 Setiap ide bisnis lahir dengan harapan. Sayangnya, harapan aja gak cukup. <strong className="text-primary">Lo butuh peta.</strong> Biar langkah lo gak salah arah.
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
