
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          <h1 className="text-h1 font-bold text-center">About Petakan.ai</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Misi Kami</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-body text-muted-foreground">
              <p>
                Di Petakan.ai, kami percaya bahwa setiap ide bisnis, sekecil apapun, berhak mendapatkan kesempatan untuk berhasil. Kami melihat banyak UMKM dan pebisnis pemula di Indonesia memiliki semangat yang luar biasa, namun seringkali terhalang oleh ketidakpastian dan risiko finansial. "Bakar uang" tanpa strategi yang jelas adalah jalan pintas menuju kegagalan.
              </p>
              <p>
                Misi kami adalah mendemokratisasi akses terhadap analisis bisnis yang cerdas. Kami ingin membekali Anda dengan alat simulasi berbasis AI yang kuat namun mudah digunakan, sehingga Anda bisa "menguji strategi, bukan uangmu."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Bagaimana Cara Kerjanya?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-body text-muted-foreground">
              <p>
                Platform kami menggabungkan model finansial standar dengan kekuatan kecerdasan buatan (AI). Anda cukup memasukkan beberapa variabel kunci tentang ide bisnis Anda—seperti harga jual, biaya, dan target pasar.
              </p>
              <p>
                AI kami kemudian akan memproses data ini, membandingkannya dengan wawasan pasar e-commerce di Indonesia, dan menghasilkan proyeksi untung-rugi serta arus kas. Lebih dari itu, AI juga akan memberikan evaluasi kelayakan dan rekomendasi strategis yang bisa langsung Anda terapkan. Semuanya disajikan dalam bahasa yang santai dan mudah dimengerti.
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="text-h3">Di Balik Layar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-body text-muted-foreground">
              <p>
                Petakan.ai dibangun oleh tim yang bersemangat tentang teknologi dan kewirausahaan. Aplikasi ini ditenagai oleh teknologi modern termasuk Next.js, Tailwind CSS, dan yang terpenting, Google's Generative AI (Gemini) melalui platform Genkit.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
