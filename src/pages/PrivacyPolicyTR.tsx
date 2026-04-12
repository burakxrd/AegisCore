import React from 'react';
import { Shield, Mail } from 'lucide-react';

const PrivacyPolicyTR: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md p-10">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0 mt-1">
            <Shield className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Gizlilik <span className="text-cyan-500">Politikası</span></h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Yürürlük Tarihi: 18 Mart 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <div className="prose max-w-none">

          <p>
            <strong>Aegis</strong> (aegis.net.tr) platformuna hoş geldiniz. Gizliliğinize saygı duyuyor ve korumaya kararlıyız.
            Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde ve güvenlik protokolü araç setlerimizi kullandığınızda verileri nasıl işlediğimizi açıklar.
          </p>

          <h2>1. Kriptografik Araçlarda Sıfır Veri Toplama</h2>
          <p>Temel felsefemiz mutlak gizliliktir. Araçlarımızı (Hash Oluşturucu veya Base64 Codec gibi) kullandığınızda:</p>
          <ul>
            <li><strong>Terminal çevrimdışı modda çalışır.</strong></li>
            <li><strong>Kriptografik işlemler, Web Crypto API aracılığıyla yerel olarak gerçekleştirilir.</strong></li>
            <li><strong>Hiçbir veri cihazınızdan çıkmaz.</strong></li>
          </ul>
          <p>
            İstemci tarafı araçlarımız aracılığıyla işlediğiniz herhangi bir girdi verisini, dizgeyi veya dosyayı iletmez, günlüğe kaydetmez,
            depolamaz veya izlemeyiz. Her şey yalnızca yerel tarayıcı ortamınızda gerçekleşir.
          </p>

          <h2>2. Otomatik Olarak Topladığımız Bilgiler</h2>
          <p>
            İsim veya kullanıcı hesabı gibi kişisel bilgileri toplamıyor olsak da (kayıt sistemimiz bulunmamaktadır),
            altyapımız siteyi güvenli ve işlevsel tutmak için otomatik olarak temel, tanımlanamayan verileri toplar:
          </p>
          <ul>
            <li>
              <strong>Sunucu Günlükleri:</strong> Çoğu standart web sitesi gibi, Nginx sunucularımız güvenlik izleme,
              DDoS saldırılarını önleme ve sunucu kararlılığını sağlama amacıyla temel istek verilerini
              (ör. anonimleştirilmiş IP adresleri, tarayıcı türleri, zaman damgaları) geçici olarak günlüğe kaydeder.
            </li>
            <li>
              <strong>Cloudflare:</strong> DNS yönlendirme ve güvenlik için Cloudflare kullanıyoruz. Cloudflare,
              sunucularımıza ulaşmadan önce kötü niyetli trafiği filtrelemek için ağ verilerini işleyebilir.
            </li>
          </ul>

          <h2>3. Analitik ve İzleme</h2>
          <p>Web sitesi trafiğimizi anlamak ve kullanıcı deneyimini iyileştirmek için birden fazla analitik hizmeti kullanıyoruz:</p>
          <ul>
            <li>
              <strong>Cloudflare Web Analytics:</strong> Kullanım metriklerini toplamak için istemci tarafı durumu
              (çerezler gibi) kullanmayan, gizlilik öncelikli bir analitik aracı.
            </li>
            <li>
              <strong>Google Analytics:</strong> Web sitesi trafiğini ölçmek için Google Analytics kullanıyoruz. Google Analytics,
              sitemizle etkileşimleriniz hakkında anonim veri toplamak için çerezler kullanır.{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                Google Gizlilik ve Şartlar
              </a>
              {' '}sayfasını ziyaret ederek daha fazla bilgi edinebilirsiniz.{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
                Google Analytics Devre Dışı Bırakma Tarayıcı Eklentisi
              </a>
              {' '}ile çıkış yapabilirsiniz.
            </li>
          </ul>

          <h2>4. Reklam ve Google AdSense</h2>
          <p>
            Araçlarımızı ücretsiz tutmak ve sunucularımızı sürdürmek için, web sitemizi ziyaret ettiğinizde reklam sunmak
            üzere <strong>Google AdSense</strong> kullanıyoruz.
          </p>
          <ul>
            <li>Google, üçüncü taraf sağlayıcı olarak, bu sitede reklam sunmak için çerezler kullanır.</li>
            <li>
              Google'ın <strong>DART çerezi</strong> kullanımı, sitemize ve İnternet'teki diğer sitelere önceki
              ziyaretlerinize göre reklam sunmasını sağlar.
            </li>
            <li>
              Kullanıcılar{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
                Google Reklam ve İçerik Ağı gizlilik politikası
              </a>
              {' '}sayfasını ziyaret ederek çıkış yapabilir.
            </li>
          </ul>
          <p>
            Bu üçüncü taraf reklam sunucuları, reklamlarında çerezler, JavaScript veya Web Beacon'lar gibi teknolojiler kullanır.
            Bu gerçekleştiğinde IP adresinizi otomatik olarak alırlar. Aegis, üçüncü taraf reklamcılar tarafından kullanılan
            bu çerezlere erişim veya kontrol hakkına sahip değildir.
          </p>

          <h2>5. Üçüncü Taraf Bağlantıları</h2>
          <p>
            Web sitemiz veya istihbarat raporlarımız, tarafımızca işletilmeyen harici sitelere bağlantılar içerebilir.
            Bu sitelerin içeriği ve uygulamaları üzerinde hiçbir kontrolümüz yoktur ve ilgili gizlilik politikalarının
            sorumluluğunu kabul edemeyiz.
          </p>

          <h2>6. Bu Politikadaki Değişiklikler</h2>
          <p>
            Yeni araçlar veya özellikler ekledikçe Gizlilik Politikamızı zaman zaman güncelleyebiliriz.
            Değişiklikleri, yeni Gizlilik Politikasını bu sayfada yayınlayarak size bildireceğiz.
          </p>

          <h2>7. Bize Ulaşın</h2>
          <p>
            Bu Gizlilik Politikası veya veri işleme uygulamalarımız hakkında herhangi bir sorunuz veya endişeniz varsa,
            lütfen bizimle iletişime geçin:
          </p>
        </div>

        {/* Contact card */}
        <div className="mt-6 flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-6 py-4">
          <Mail className="w-5 h-5 text-cyan-500 shrink-0" />
          <span className="text-slate-400 font-mono text-sm">
            <a href="mailto:info@aegis.net.tr" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              info@aegis.net.tr
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyTR;
