
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pt-12 pb-6">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-h1 font-bold">Petakan.ai</h1>
            <p className="text-subtitle text-muted-foreground">Mimpi Gede Gak Cukup, Lo Butuh Strategi</p>
          </div>

          <Card>
            <CardContent className="space-y-4 text-body text-muted-foreground pt-6">
              <p>
                Awalnya, kami pikir semuanya udah siap. Produk udah ada, stok numpuk, feed Instagram rapi. Tinggal tunggu orderan masuk.
              </p>
              <p>
                Padahal bukan karena produknya jelek. Tapi karena <strong className="text-foreground">strateginya ngaco.</strong>
              </p>
              <p>
                Iklan udah running, tapi asal tembak. Gak tahu siapa yang harus dituju. Harga ditetapkan tanpa hitung-hitungan. Akhirnya? Budget iklan ludes, stok gak muter, dan waktu kebuang percuma.
              </p>
            </CardContent>
          </Card>

          <div className="text-center space-y-2 py-4">
            <p className="text-subtitle text-foreground max-w-2xl mx-auto">
              Dari situ muncul satu pertanyaan penting: <strong className="text-primary">“Gimana caranya tahu strategi ini layak, sebelum uang dan waktu benar-benar habis?”</strong>
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Di Petakan.ai, lo bisa:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-body">
                <li>Cek <strong className="text-foreground">untung-rugi</strong> dari ide yang mau lo jalanin.</li>
                <li>Uji <strong className="text-foreground">harga jual</strong> dan budget iklan.</li>
                <li>Baca <strong className="text-foreground">tren perilaku pasar</strong> digital Indonesia.</li>
                <li>Dapat <strong className="text-foreground">rekomendasi strategi</strong> berbasis data lokal — dari AI yang ngerti konteks.</li>
              </ul>
            </CardContent>
          </Card>
           
           <Card>
             <CardContent className="text-center p-6 space-y-4">
                <p className="text-body text-muted-foreground">
                    Platform ini dibuat oleh RizkyFadil, karena gue inget banget waktu pertama kali jualan di internet... ujung-ujungnya rungkad. Bukan karena produknya jelek, atau gak punya nilai. Tapi karena gak ngerti siapa targetnya. Dan yang paling parah: gak paham strategi apa yang sebenarnya dibutuhin.
                </p>
                 <p className="text-body text-muted-foreground">
                    Waktu, tenaga, dan uang kebuang percuma. Cuma gara-gara gak tahu arah. Dari situ gue sadar: setiap ide bisnis selalu datang bawa harapan. Dan harapan itu gak cukup dikawal semangat doang. Lo butuh strategi. Yang jelas. Yang tepat. Dari awal.
                </p>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <h2 className="text-h2 font-semibold tracking-tight">Petakan Sebelum Jalan.</h2>
          </div>
        </div>
      </main>
      <footer className="text-center text-sm text-muted-foreground mt-4 mb-8 container max-w-3xl px-4">
        <p>Laporan ini disusun berdasarkan analisis dan proyeksi dari data publik. Gunakan petakan.ai sebagai alat bantu strategis.</p>
        <p className="mt-2">© 2025 Dibuat oleh RizkyFadil.</p>
      </footer>
    </>
  );
}
