// Detailed animated module showcase — based on actual panel domain
const { useState: useS2, useEffect: useE2 } = React;

// Module detail card with animated mini-demo inside
function ModuleDetail({ num, title, lead, bullets, visual, reverse }) {
  return (
    <div className={`mod-detail ${reverse ? 'reverse' : ''}`}>
      <div className="mod-detail-copy">
        <span className="mono mod-num">MODÜL {num}</span>
        <h3>{title}</h3>
        <p className="mod-lead">{lead}</p>
        <ul className="mod-bullets">
          {bullets.map((b, i) => (
            <li key={i}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className="mod-detail-vis">{visual}</div>
    </div>
  );
}

// QR + Table Session animated
function VisQR() {
  const [step, setStep] = useS2(0);
  useE2(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 1800); return () => clearInterval(t); }, []);
  const labels = ['QR TARANDI', 'İMZA DOĞRULANDI', 'POLİTİKA: table_code', 'OTURUM AKTİF'];
  return (
    <div className="vis vis-qr">
      <div className="vis-chip mono">OTURUM DOĞRULAMASI</div>
      <div className="qr-wrap">
        <div className="qr-code">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {Array.from({length:13}).map((_,i)=>Array.from({length:13}).map((_,j)=>{
              const v = (i*7+j*3+i*j+step)%4;
              return v===0 && <rect key={`${i}-${j}`} x={i*10+5} y={j*10+5} width="8" height="8" fill="currentColor"/>;
            }))}
          </svg>
        </div>
        <div className="qr-scan"></div>
      </div>
      <div className="qr-steps">
        {labels.map((l, i) => (
          <div key={i} className={`qr-step ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
            <div className="qr-dot"></div>
            <span className="mono">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Station routing animation
function VisStations() {
  const [tick, setTick] = useS2(0);
  useE2(() => { const t = setInterval(() => setTick(x => x + 1), 1600); return () => clearInterval(t); }, []);
  const orders = [
    { n: '#1284', lines: [{ st: 'Bar', i: 'Flat White' }, { st: 'Pastane', i: 'Croissant' }] },
    { n: '#1285', lines: [{ st: 'Mutfak', i: 'Sourdough' }, { st: 'Bar', i: 'Cortado' }] },
  ];
  const active = orders[tick % orders.length];
  return (
    <div className="vis vis-stations">
      <div className="vis-chip mono">İSTASYON YÖNLENDİRME</div>
      <div className="st-order">
        <div className="mono">{active.n}</div>
        <div className="st-lines">
          {active.lines.map((l, i) => (
            <div key={i} className="st-line">
              <span>{l.i}</span>
              <svg width="28" height="8" viewBox="0 0 28 8" fill="none"><path d="M0 4h26M22 1l4 3-4 3" stroke="currentColor" strokeWidth="1.2"/></svg>
              <span className="mono st-target">{l.st}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="st-grid">
        {['Bar', 'Mutfak', 'Pastane', 'Soğuk'].map((s, i) => {
          const isActive = active.lines.some(l => l.st === s);
          return (
            <div key={i} className={`st-cell ${isActive ? 'lit' : ''}`}>
              <span className="mono">{s}</span>
              {isActive && <span className="st-pulse"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Offline-safe cashier
function VisOffline() {
  const [phase, setPhase] = useS2(0);
  useE2(() => { const t = setInterval(() => setPhase(p => (p + 1) % 3), 2200); return () => clearInterval(t); }, []);
  const status = ['ONLINE · SYNC', 'OFFLINE · LOCAL WRITE', 'RECONNECTED · SYNCED'];
  return (
    <div className="vis vis-offline">
      <div className="vis-chip mono">OFFLINE-SAFE KASİYER</div>
      <div className={`off-wifi off-${phase}`}>
        <span></span><span></span><span></span>
      </div>
      <div className="off-status mono">{status[phase]}</div>
      <div className="off-log">
        {['Ödeme · ₺342','Ödeme · ₺185','Ödeme · ₺94'].map((l, i) => (
          <div key={i} className={`off-log-item ${phase===1 && i===2 ? 'pending' : 'ok'}`}>
            <span>{l}</span>
            <span className="mono">{phase===1 && i===2 ? 'QUEUED' : 'SYNCED'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loyalty
function VisLoyalty() {
  const [count, setCount] = useS2(1240);
  useE2(() => { const t = setInterval(() => setCount(c => c + 5), 120); return () => clearInterval(t); }, []);
  return (
    <div className="vis vis-loyalty">
      <div className="vis-chip mono">SADAKAT · LOYALTYACCOUNT</div>
      <div className="loy-num">
        <span className="serif">{count.toLocaleString('tr-TR')}</span>
        <span className="mono">PUAN</span>
      </div>
      <div className="loy-bar"><div className="loy-bar-fill" style={{width: `${(count % 2000)/20}%`}}></div></div>
      <div className="loy-tier">
        {['BRONZ','GÜMÜŞ','ALTIN'].map((t,i)=>(
          <div key={i} className={`loy-tier-item ${i===1?'current':''}`}>{t}</div>
        ))}
      </div>
    </div>
  );
}

// AI-powered product descriptions
function VisAI() {
  const [phase, setPhase] = useS2(0);
  useE2(() => { const t = setInterval(() => setPhase(p => (p + 1) % 4), 1400); return () => clearInterval(t); }, []);
  const fullText = 'Çift shot espresso, buharla ısıtılmış süt ve kadifemsi mikro-köpük. Sabahlarına dengeli bir başlangıç.';
  const progress = phase === 0 ? 0 : phase === 1 ? 0.35 : phase === 2 ? 0.7 : 1;
  const shown = fullText.slice(0, Math.floor(fullText.length * progress));
  return (
    <div className="vis vis-ai">
      <div className="vis-chip mono">✦ AI AÇIKLAMA</div>
      <div className="ai-input">
        <span className="mono">ÜRÜN</span>
        <span>Flat White · ₺85</span>
      </div>
      <div className="ai-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4v16M5 13l7 7 7-7"/></svg>
      </div>
      <div className="ai-out">
        <span className="ai-out-text">{shown}</span>
        {progress < 1 && <span className="ai-caret"></span>}
      </div>
      <div className="ai-foot mono">Bricolage · TR · editorial tonu</div>
    </div>
  );
}

// Payment intent → record
function VisPayment() {
  const [phase, setPhase] = useS2(0);
  useE2(() => { const t = setInterval(() => setPhase(p => (p + 1) % 3), 1400); return () => clearInterval(t); }, []);
  const states = [
    { l: 'PAYMENT_INTENT', d: 'Idempotency: 8f2-a9c', c: 'pending' },
    { l: 'PROCESSING', d: 'Ingenico terminali ·', c: 'pending' },
    { l: 'PAYMENT_RECORD', d: 'APPROVED · ₺342', c: 'ok' },
  ];
  return (
    <div className="vis vis-payment">
      <div className="vis-chip mono">ÖDEME AKIŞI</div>
      {states.map((s, i) => (
        <div key={i} className={`pay-row ${i <= phase ? 'on' : ''} ${i === phase ? 'current' : ''}`}>
          <span className={`pay-dot ${s.c}`}></span>
          <div>
            <div className="mono">{s.l}</div>
            <div className="pay-d">{s.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleDeepDive() {
  return (
    <section className="mod-deep" id="modules-deep">
      <div className="container reveal">
        <div className="section-label"><span className="mono">Derinlik · Panel'den Doğrudan</span></div>
        <h2 className="mod-deep-title">
          Her modül, tek başına bir <span className="serif">ürün gibi.</span>
        </h2>
        <p className="mod-deep-lede">
          Aleg'in iç modelinden doğrudan çıkan 14 çekirdek modül. Hiçbiri "eklenti" değil — çekirdek ürünle beraber geliyor, birlikte konuşuyor.
        </p>

        <div className="mod-stack">
          <ModuleDetail
            num="01"
            title="QR Menü & İmzalı Masa Oturumları"
            lead="Her masa için imzalı, versiyonlu QR. Kopya veya uzaktan taranmış QR'lara karşı dört farklı doğrulama politikası: open, table_code, staff_unlock, hybrid."
            bullets={[
              'Imzalı TableQr — iptal edilebilir, versiyonlanmış',
              'Kısa ömürlü oturum token\'ları · hız limiti',
              'Politikaya göre sipariş yetkilendirmesi',
              'Internet\'e yüklenen QR fotoğrafı sonsuz sipariş yetkisi vermez',
            ]}
            visual={<VisQR />}
          />
          <ModuleDetail
            reverse
            num="02"
            title="İstasyon Bazlı Yönlendirme"
            lead="Her OrderLine, ilgili istasyona otomatik düşer. Bar, mutfak, soğuk prep, pastane — herkes sadece kendi işini görür. Yazıcılar lokasyon ve doküman tipine göre yönlendirilir."
            bullets={[
              'OrderTicket · istasyon bazlı execution view',
              'Yazıcı yönlendirme: lokasyon, istasyon, doküman',
              'Modifier ve notların istasyon metadata\'sı',
              'Gerçek zamanlı ekran güncellemesi',
            ]}
            visual={<VisStations />}
          />
          <ModuleDetail
            num="03"
            title="Offline-Safe Kasiyer"
            lead="İnternet kesilirse kasiyer durmaz. Siparişler ve ödemeler CashSession sınırı içinde yerel olarak yazılır; bağlantı dönünce sessizce senkronize olur. Hiçbir sipariş kaybolmaz."
            bullets={[
              'CashSession · terminal + operator + vardiya',
              'PaymentIntent idempotent · her retry izlenebilir',
              'Lokal kuyruk — bağlantı sonrası sync',
              'UI varsayımları yerine durable ledger',
            ]}
            visual={<VisOffline />}
          />
          <ModuleDetail
            reverse
            num="04"
            title="✦ Yapay Zeka · Menü Asistanı"
            lead="Her ürüne editöryal bir açıklama yaz, allergen etiketlerini öner, kategorileri otomatik düzenle, fotoğraflardan içerik çıkar. Menüyü AI ile besle — ton senin, kelimeler sana uygun."
            bullets={[
              'Ürün açıklamaları · seçtiğin ton & dil',
              'Otomatik kategori & etiket önerileri',
              'Fotoğrafdan içerik ve allergen çıkarımı',
              'Toplu menü çeviri · TR / EN / DE',
            ]}
            visual={<VisAI />}
          />
          <ModuleDetail
            num="05"
            title="Sadakat · LoyaltyAccount"
            lead="Tenant-scoped puan ledger\'ı. Kampanyalar menu indirimi, sadakat tetikleyicisi veya misafir teşviki verebilir. Damga kart yerine imzalı dijital hesap."
            bullets={[
              'Kazanma kuralları · kampanyaya bağlanır',
              'Otomatik seviye sistemi · Bronz/Gümüş/Altın',
              'Doğum günü, ilk ziyaret, referans tetikleri',
              'QR menüden ve kasadan ortak bakiye',
            ]}
            visual={<VisLoyalty />}
          />
          <ModuleDetail
            reverse
            num="06"
            title="PaymentIntent → PaymentRecord"
            lead="Beklenen ödemenin idempotent kaydı, gerçekleşen ödemenin dayanıklı finansal kaydı. UI varsayımları finansal gerçek değildir."
            bullets={[
              'Idempotent payment intent · retry-safe',
              'Ingenico & Verifone terminal entegrasyonu',
              'Onaylı · Reddedilen · Voidlenmiş · İade durumları',
              'Denetim izi · her işleme traceable',
            ]}
            visual={<VisPayment />}
          />
        </div>

        <div className="mod-grid-extra">
          {[
            { t: 'Kampanyalar', d: 'Menu indirimi, loyalty tetikleyici, misafir teşviki.' },
            { t: 'Stok Hareketleri', d: 'Satış, fire, transfer, teslim — immutable hareket kaydı.' },
            { t: 'Paket Servis', d: 'CourierJob · atama, teslim alma, transit, tamamlama.' },
            { t: 'Telefon Siparişi', d: 'Çağrı merkezi operatörleri için ayrı akış.' },
            { t: 'Vardiya Planı & Çizelge', d: 'ShiftPlan · ShiftInstance · clock-in sınırları.' },
            { t: 'Yorum & Şikayet', d: 'ReviewCase · sipariş veya teslimat bağlamı.' },
            { t: 'Cihaz & Yazıcı', d: 'Her aksiyon tenant/location bağlamına izlenebilir.' },
            { t: 'Çoklu Lokasyon', d: 'BusinessTenant altında birden fazla Location.' },
          ].map((m, i) => (
            <div key={i} className="mod-extra">
              <span className="mono">MODÜL {String(i + 7).padStart(2, '0')}</span>
              <h4>{m.t}</h4>
              <p>{m.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.ModuleDeepDive = ModuleDeepDive;
