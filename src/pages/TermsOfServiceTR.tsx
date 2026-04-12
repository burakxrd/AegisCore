import React from 'react';
import { FileText, Mail } from 'lucide-react';

const TermsOfServiceTR: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md p-10">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0 mt-1">
            <FileText className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Kullanım <span className="text-cyan-500">Şartları</span></h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Yürürlük Tarihi: 18 Mart 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        <div className="prose max-w-none">

          <p>
            <strong>Aegis Core</strong> (aegis.net.tr) platformuna hoş geldiniz. Web sitemize, araçlarımıza ve
            istihbarat raporlarımıza erişerek veya kullanarak bu Kullanım Şartlarına bağlı olmayı kabul edersiniz.
            Bu şartların herhangi bir bölümüne katılmıyorsanız, hizmetlerimizi kullanmamalısınız.
          </p>

          <h2>1. Yalnızca Eğitim ve Savunma Amaçlı</h2>
          <p>
            Bu, Aegis Core'un en kritik kuralıdır. Tüm araçlar (IP Intelligence, Domain Analyzer, Hash Generator
            ve Base64 Codec dahil) ve tüm yazılı istihbarat raporları{' '}
            <strong>yalnızca eğitim, savunma ve yetkili test amaçları için</strong> sağlanmaktadır.
          </p>
          <ul>
            <li>
              Bu araçları yalnızca sahip olduğunuz veya test etmek için açık, yazılı yetkinize sahip olduğunuz
              ağlarda, domainlerde ve sistemlerde kullanabilirsiniz.
            </li>
            <li>
              Herhangi bir kötü niyetli kullanım, yasa dışı bilgisayar korsanlığı veya araçlarımızın yetkisiz erişimi
              kolaylaştırmak için kullanılması kesinlikle yasaktır.
            </li>
            <li>Aegis Core, sağlanan araçların veya bilgilerin herhangi bir kötüye kullanımından sıfır sorumluluk taşır.</li>
          </ul>

          <h2>2. "Olduğu Gibi" Hizmet ve Garanti Yokluğu</h2>
          <p>
            Siber güvenlik araç setlerimiz "olduğu gibi" ve "kullanılabilir olduğu sürece" temelinde sağlanmaktadır.
            OSINT ve kriptografik araçlarımızda aşırı doğruluk için çaba göstersek de, araçların eksiksizliği, doğruluğu,
            güvenilirliği veya kullanılabilirliği konusunda açık veya zımni hiçbir garanti vermeyiz. Terminal ve çıktılarının
            kullanımı tamamen kendi sorumluluğunuzdadır.
          </p>

          <h2>3. Yerel İşleme ve Veri Bütünlüğü</h2>
          <p>
            Gizlilik Politikamızda belirtildiği gibi, kriptografik işlemler (Hash, Base64) tarayıcı ortamınızda yerel olarak
            işlenir. Çevrimdışı terminalimize girdiğiniz dizgeler ve dosyalar tamamen sizin sorumluluğunuzdadır.
            Aegis Core, işlediğiniz verileri kurtaramaz, izleyemez veya doğrulayamaz.
          </p>

          <h2>4. Kullanıcı Davranışı ve Kötüye Kullanım</h2>
          <p>Aegis Core altyapısını kullanırken, aşağıdakileri yapmamayı kabul edersiniz:</p>
          <ul>
            <li>
              Nginx sunucularımızda veya Cloudflare uç noktalarımızda aşırı yük oluşturan otomatik betikler,
              botlar veya kazıyıcılar dağıtmak.
            </li>
            <li>
              Aegis Core uygulamasının işlevselliğini istismar etmeye, tersine mühendislik yapmaya veya
              bozmaya çalışmak.
            </li>
            <li>Sitemizi kötü amaçlı yazılım, oltalama bağlantıları veya kötü niyetli yükler dağıtmak için kullanmak.</li>
          </ul>

          <h2>5. Üçüncü Taraf İçeriği</h2>
          <p>
            Platformumuz, Aegis tarafından sahiplenilmeyen veya kontrol edilmeyen üçüncü taraf web sitelerine veya hizmetlere
            (AdSense reklamları dahil) bağlantılar içerebilir. Herhangi bir üçüncü taraf web sitesinin veya hizmetinin
            içeriği, gizlilik politikaları veya uygulamaları için hiçbir sorumluluk kabul etmiyoruz.
          </p>

          <h2>6. Şartlardaki Değişiklikler</h2>
          <p>
            Bu Şartları herhangi bir zamanda değiştirme veya değiştirme hakkını saklı tutarız. Önemli değişiklikler
            hakkında kullanıcıları bu belgenin üst kısmındaki "Yürürlük Tarihi"ni güncelleyerek bilgilendireceğiz.
          </p>

          <h2>7. İletişim Bilgileri</h2>
          <p>Bu Şartlar hakkında herhangi bir sorunuz varsa, lütfen yönetim kanalımızla iletişime geçin:</p>
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

export default TermsOfServiceTR;
