// Pricing, Early partner, FAQ, Final CTA, Footer, Modal
const { useState: useStateP, useEffect: useEffectP } = React;

function Pricing({ onDemo }) {
  const [yearly, setYearly] = useStateP(false);
  const plans = [
    {
      name: 'Başlangıç',
      monthly: 1499,
      desc: 'Tek şubeli küçük kafeler için',
      features: ['QR Menü & Sipariş','POS & Adisyon','Mutfak Ekranı','5 masaya kadar ücretsiz','Türkçe destek','Sınırsız ürün']
    },
    {
      name: 'Pro',
      monthly: 2999,
      desc: 'Büyüyen kafeler için',
      badge: 'En Popüler',
      featured: true,
      features: ['Başlangıç\'taki her şey','Sadakat Programı','Paket Servis','Stok Takibi','Sınırsız masa','WhatsApp destek','Detaylı raporlar']
    },
    {
      name: 'Kurumsal',
      monthly: 5999,
      desc: 'Zincir işletmeler için sınırsız',
      features: ['Pro\'daki her şey','Çoklu Şube yönetimi','Vardiya Planı','Özel Domain','API erişimi','Özel hesap yöneticisi','SLA garantisi']
    }
  ];

  const price = (p) => {
    const v = yearly ? Math.round(p * 12 * 0.8 / 12) : p;
    return v.toLocaleString('tr-TR');
  };

  return (
    <section className="pricing" id="pricing">
      <div className="container reveal">
        <div className="pricing-head">
          <div className="section-label" style={{justifyContent:'center',display:'flex'}}><span className="mono">Fiyatlandırma</span></div>
          <h2>Fiyat mı? <span className="serif">Açık ve şeffaf.</span></h2>
          <div className="pricing-toggle" style={{marginTop:14}}>
            <button className={!yearly ? 'active' : ''} onClick={() => setYearly(false)}>Aylık</button>
            <button className={yearly ? 'active' : ''} onClick={() => setYearly(true)}>Yıllık<span className="saver">−%20</span></button>
          </div>
        </div>
        <div className="plans">
          {plans.map((p, i) => (
            <div key={i} className={`plan ${p.featured ? 'featured' : ''}`}>
              {p.badge && <div className="plan-badge">{p.badge}</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-desc">{p.desc}</div>
              <div className="plan-price">
                <span className="num">₺{price(p.monthly)}</span>
                <span className="per">/ay</span>
              </div>
              <ul className="plan-features">
                {p.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <button className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-lg`} onClick={onDemo}>
                14 gün ücretsiz dene
              </button>
            </div>
          ))}
        </div>
        <p className="pricing-note">Tüm planlar ücretsiz kurulum · Türkçe destek · Güncellemeler dahil</p>
      </div>
    </section>
  );
}

function Early({ onDemo }) {
  return (
    <section className="early">
      <div className="container reveal">
        <div className="early-inner">
          <div className="section-label" style={{justifyContent:'center',display:'flex'}}><span className="mono">Erken Ortak · Founders' Circle</span></div>
          <h2>İlk <span className="serif">50</span> kafemizi kuruyoruz.</h2>
          <p>Erken dönem ortağımız ol — 3 ay %50 indirim, kurulum desteği bizden, özelliklerde öncelikli söz hakkı senden.</p>
          <div className="early-counter">
            <div className="big"><span>34</span><span className="slash">/</span><span>50</span></div>
            <div className="early-bar"><div className="early-bar-fill"></div></div>
            <div className="lab">Yer Kaldı</div>
          </div>
          <div>
            <button className="btn btn-primary btn-lg" onClick={onDemo}>Erken ortak ol →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: 'Mevcut POS\'umdan veri aktarabilir miyim?', a: 'Evet. Menü, müşteri listesi ve geçmiş satış verilerinin çoğunu Excel veya doğrudan API üzerinden aktarıyoruz. Kurulum ekibi senin için yapıyor.' },
    { q: 'İnternet kesilirse ne olur?', a: 'POS ve mutfak ekranı offline-first çalışır. Siparişler lokal olarak kaydedilir, internet döndüğünde otomatik senkronize edilir. Müşterin hiçbir şey fark etmez.' },
    { q: 'Yazıcı ve terminal uyumu nasıl?', a: 'ESC/POS standardındaki tüm termal fiş yazıcılar, Epson TM serisi, Star Micronics çalışır. Ingenico ve Verifone POS cihazları entegredir.' },
    { q: 'İptal edebilir miyim?', a: 'Her zaman. Taahhüt yok, ceza yok. İstediğin zaman panelden tek tıkla iptal edebilirsin. Verilerini de her zaman export edebilirsin.' },
    { q: 'Ekibime nasıl kullanmayı öğretirim?', a: 'Aleg tasarımı kasiyer-dostu. Yeni başlayan biri 15 dakikada öğrenir. Ayrıca video eğitimler, canlı onboarding ve WhatsApp destek hattı dahil.' },
    { q: 'Yurtdışında kullanılabilir mi?', a: '2027\'den itibaren Avrupa ve Orta Doğu pazarlarında aktif olacağız. Çoklu para birimi, çoklu dil, yerel ödeme sağlayıcıları dahil.' },
  ];
  const [open, setOpen] = useStateP(0);
  return (
    <section className="faq" id="faq">
      <div className="container reveal">
        <div className="faq-grid">
          <div>
            <div className="section-label"><span className="mono">SSS</span></div>
            <h2>Merak ettiklerin.</h2>
          </div>
          <div>
            {qs.map((item, i) => (
              <div key={i} className={`faq-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <div className="faq-q">
                  <h4>{item.q}</h4>
                  <div className="plus"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg></div>
                </div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onDemo }) {
  return (
    <section className="final-cta" id="contact">
      <div className="container reveal">
        <h2><span className="serif">Başlayalım.</span></h2>
        <p>14 günlük ücretsiz denemeyle başla. Hiçbir şey ödemeden tüm özellikleri dene.</p>
        <div className="final-cta-btns">
          <button className="btn btn-primary btn-lg" onClick={onDemo}>Demo Talep Et</button>
          <a href="https://panel.alegstudio.com" className="btn btn-ghost btn-lg">Hemen Giriş Yap</a>
        </div>
        <p className="final-cta-note">
          Sorularını 7/24 <a href="https://wa.me/905000000000">WhatsApp</a>'tan da sorabilirsin
        </p>
      </div>
    </section>
  );
}

function Footer({ theme, setTheme }) {
  const themes = [
    ['warm', 'Warm'],
    ['espresso', 'Espresso'],
    ['swiss', 'Swiss'],
    ['editorial', 'Editorial'],
  ];
  const cols = [
    { h: 'Ürün', links: ['Özellikler','Fiyatlar','Modüller','Yenilikler','Yol Haritası'] },
    { h: 'Şirket', links: ['Hakkımızda','Blog','Kariyer','Basın Kiti'] },
    { h: 'Destek', links: ['Yardım Merkezi','Dokümantasyon','İletişim','Durum Sayfası'] },
    { h: 'Yasal', links: ['Kullanım Şartları','Gizlilik','Çerezler','KVKK'] },
  ];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>Aleg Studio</h4>
            <p>Kafen için tasarlanmış, kafecinle beraber büyüyen işletim sistemi. Isparta'dan dünyaya.</p>
          </div>
          {cols.map((c, i) => (
            <div className="footer-col" key={i}>
              <h5>{c.h}</h5>
              <ul>{c.links.map((l, j) => <li key={j}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span className="copy">© 2026 Aleg Studio · Tüm hakları saklıdır</span>
          <div className="footer-controls">
            <div className="theme-toggles">
              {themes.map(([k, l]) => (
                <button key={k} className={theme === k ? 'active' : ''} onClick={() => setTheme(k)}>{l}</button>
              ))}
            </div>
            <span className="lang-toggle">TR / EN</span>
            <div className="social">
              {['ig','tw','in'].map(s => (
                <a key={s} href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/></svg></a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Modal({ open, onClose }) {
  useEffectP(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`modal-overlay open`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <span className="mono">Demo Talebi · 24 Saat İçinde Dönüş</span>
        <h3>Kafen için 15 dakika ayır.</h3>
        <form className="form-grid" onSubmit={(e)=>{e.preventDefault(); onClose(); alert('Teşekkürler! 24 saat içinde sana ulaşacağız.');}}>
          <div className="form-field"><label>Ad Soyad</label><input required placeholder="Mehmet Yılmaz" /></div>
          <div className="form-field"><label>İşletme Adı</label><input required placeholder="Ceylan Café" /></div>
          <div className="form-field"><label>Telefon</label><input required placeholder="+90 5•• ••• •• ••" /></div>
          <div className="form-field"><label>E-posta</label><input required type="email" placeholder="sen@kafen.com" /></div>
          <div className="form-field"><label>Şehir</label>
            <select><option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Isparta</option><option>Antalya</option><option>Bursa</option><option>Eskişehir</option><option>Diğer</option></select>
          </div>
          <div className="form-field"><label>İşletme Tipi</label>
            <select><option>Kafe</option><option>Restoran</option><option>Brunch</option><option>Specialty Coffee</option><option>Bar</option><option>Pastane</option><option>Diğer</option></select>
          </div>
          <div className="form-field full"><label>Masa Sayısı</label>
            <select><option>1–5 masa</option><option>6–15 masa</option><option>16–30 masa</option><option>30+ masa</option></select>
          </div>
          <div className="form-field full"><label>Ek Mesaj (opsiyonel)</label><textarea placeholder="Aleg'den ne bekliyorsun? Hangi sorunlarını çözmeli?"></textarea></div>
          <button className="btn btn-primary btn-lg form-field full" style={{justifyContent:'center'}} type="submit">Demo Talep Et →</button>
          <p className="form-note form-field full">24 saat içinde sana ulaşırız · KVKK kapsamında bilgilerin korunur</p>
        </form>
      </div>
    </div>
  );
}

function WhatsAppFloat() {
  return (
    <a href="https://wa.me/905000000000?text=Merhaba%2C%20Aleg%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" className="wa-float" aria-label="WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.881 11.881 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

window.Pricing = Pricing;
window.Early = Early;
window.FAQ = FAQ;
window.FinalCTA = FinalCTA;
window.Footer = Footer;
window.Modal = Modal;
window.WhatsAppFloat = WhatsAppFloat;
