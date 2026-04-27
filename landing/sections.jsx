// Sections: Problems, Features, Steps, Showcase, Modules
const { useState: useSt, useEffect: useEf } = React;

function Problems() {
  const items = [
    { t: 'Menü güncellemek için 4 ayrı sistem', d: 'QR menü, adisyon, instagram, google... Her yerde fiyat farklı. Bir ürünü değiştirmek yarım günün.' },
    { t: 'Kağıt adisyon kaybolursa sipariş kaybolur', d: 'Masadan gelen kağıt fişler, mutfakta karışan siparişler, unutulan istekler. Müşteri hayal kırıklığı.' },
    { t: 'Sadakat programı? O ayrı bir abonelik', d: 'Damga karttan uygulamaya geçmek istiyorsun ama kimse seninle konuşmadı. Her ay başka bir fatura.' },
  ];
  return (
    <section className="problems container reveal" id="problems">
      <div className="section-label"><span className="mono">Problem</span></div>
      <h2>Kafeni <span className="serif">yönetmek</span>, kafe açmaktan daha zor olmasın.</h2>
      <div className="problems-grid">
        {items.map((p, i) => (
          <div key={i} className="card problem-card">
            <div className="problem-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {i === 0 && <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}
                {i === 1 && <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 13l2 2 4-4"/></>}
                {i === 2 && <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>}
              </svg>
            </div>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
            <a href="#features" className="problem-link">→ Aleg nasıl çözüyor?</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturePreview({ kind }) {
  const styles = {
    qr: { background: 'var(--paper)', padding: 16 },
    pos: { background: 'var(--paper-2)', padding: 14 },
    kds: { background: 'var(--ink)', padding: 14, color: 'var(--paper)' },
    loy: { background: 'var(--paper)', padding: 14 },
    del: { background: 'var(--paper-3)', padding: 14 },
    mul: { background: 'var(--paper-2)', padding: 14 },
  };
  if (kind === 'qr') return (
    <div className="feature-preview" style={styles.qr}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:16}}>Menü</div>
        <div className="mono" style={{fontSize:9}}>MASA 14</div>
      </div>
      {['Flat White · ₺85','Croissant · ₺65','Cold Brew · ₺95'].map((l,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderTop:'1px solid var(--line)',fontSize:12}}>
          <span>{l.split(' · ')[0]}</span><span style={{color:'var(--ink-3)'}}>{l.split(' · ')[1]}</span>
        </div>
      ))}
    </div>
  );
  if (kind === 'pos') return (
    <div className="feature-preview" style={styles.pos}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
        {Array.from({length:12}).map((_,i)=>(
          <div key={i} style={{background:'var(--card)',borderRadius:4,padding:'12px 4px',textAlign:'center',fontSize:9,border:'1px solid var(--line)',color: i===3 ? 'var(--paper)' : 'var(--ink)', backgroundColor: i===3 ? 'var(--accent)' : 'var(--card)'}}>M{i+1}</div>
        ))}
      </div>
    </div>
  );
  if (kind === 'kds') return (
    <div className="feature-preview" style={styles.kds}>
      {['#1284 · 2 dk','#1285 · HAZIRLANIYOR','#1286 · YENİ'].map((l,i)=>(
        <div key={i} style={{padding:'8px 10px',borderBottom:'1px solid rgba(255,255,255,0.08)',fontSize:11,fontFamily:'var(--f-mono)',letterSpacing:'0.06em',color: i===2 ? 'var(--accent)' : 'var(--paper)'}}>{l}</div>
      ))}
    </div>
  );
  if (kind === 'loy') return (
    <div className="feature-preview" style={styles.loy}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'var(--f-mono)',fontSize:9,color:'var(--ink-3)',letterSpacing:'0.1em'}}>PUAN</div>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:42,color:'var(--accent)',margin:'4px 0'}}>1,240</div>
        <div style={{display:'flex',justifyContent:'center',gap:4}}>
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} style={{width:16,height:16,borderRadius:'50%',background: i<3 ? 'var(--accent)' : 'var(--line)'}}></div>
          ))}
        </div>
      </div>
    </div>
  );
  if (kind === 'del') return (
    <div className="feature-preview" style={styles.del}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'var(--card)',borderRadius:6,marginBottom:6,border:'1px solid var(--line)'}}>
        <div style={{width:26,height:26,borderRadius:'50%',background:'var(--accent)',color:'var(--paper)',display:'grid',placeItems:'center',fontSize:10,fontWeight:500}}>EY</div>
        <div><div style={{fontSize:12,fontWeight:500}}>Elif Yılmaz</div><div className="mono" style={{fontSize:9}}>0532 ●●● ●● 42</div></div>
      </div>
      <div className="mono" style={{fontSize:9,color:'var(--ink-3)',textAlign:'center'}}>12. ZİYARET · BEŞİKTAŞ</div>
    </div>
  );
  if (kind === 'mul') return (
    <div className="feature-preview" style={styles.mul}>
      {['Kadıköy Şube','Beşiktaş Şube','Bodrum Yaz'].map((l,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 12px',background:'var(--card)',borderRadius:6,marginBottom:5,fontSize:12,border:'1px solid var(--line)'}}>
          <span>{l}</span><span style={{fontFamily:'var(--f-mono)',fontSize:10,color:'var(--olive)'}}>● AKTİF</span>
        </div>
      ))}
    </div>
  );
  return null;
}

function Features() {
  const feats = [
    { num: '01', kind: 'qr', t: 'QR Menü & Sipariş', d: 'Müşteriler masadan QR ile sipariş verir. Ödeme dahil.' },
    { num: '02', kind: 'pos', t: 'POS & Adisyon', d: 'Masalar, hesaplar, indirimler — karışıklık yok.' },
    { num: '03', kind: 'kds', t: 'Mutfak Ekranı (KDS)', d: 'Siparişler anında bara ve mutfağa düşer.' },
    { num: '04', kind: 'loy', t: 'Sadakat Programı', d: 'Puan kazan, puan harca. Otomatik kampanyalar.' },
    { num: '05', kind: 'del', t: 'Paket Servis', d: 'Çağrı geldiğinde müşteri kim olduğunu görür.' },
    { num: '06', kind: 'mul', t: 'Çoklu Şube', d: 'Bir panelden tüm şubelerini yönet.' },
  ];
  return (
    <section className="features" id="features">
      <div className="container reveal">
        <div className="features-head">
          <div className="section-label"><span className="mono">Platform · 6 Çekirdek Modül</span></div>
          <h2>Tek çatı altında, <span className="serif">her şey.</span></h2>
          <p style={{fontSize:17, maxWidth:520}}>Ayrı ayrı abonelikler, eşleşmeyen sistemler, çakışan veriler yok. Aleg çekirdekten tek bir ürün.</p>
        </div>
        <div className="features-grid">
          {feats.map((f, i) => (
            <div key={i} className="card feature-card">
              <FeaturePreview kind={f.kind} />
              <span className="num">{f.num}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <a href="#" className="feature-link">Detaylar →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const [active, setActive] = useSt(0);
  const steps = [
    { no: '01', t: 'İşletmeni aç', d: 'Demo talebini alır almaz hesabını kuruyoruz. Giriş bilgilerin mail\'ine düşer.' },
    { no: '02', t: 'Menünü yükle', d: 'Kategoriler, ürünler, fotoğraflar. Sürükle-bırak. Yapay zekâ açıklamalarını yazsın istersen.' },
    { no: '03', t: 'QR\'ı yazdır, aç gitsin', d: 'Her masaya bir QR. Müşterin tarar, menüyü görür, sipariş verir.' },
  ];

  useEf(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const visuals = [
    // step 1: form
    <div key="1" style={{padding:24,height:'100%',display:'flex',flexDirection:'column',gap:10}}>
      <div className="mono" style={{fontSize:10}}>DEMO TALEBİ</div>
      {['Ad Soyad','İşletme Adı','Telefon','E-posta'].map((l,i)=>(
        <div key={i} style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:8,padding:'11px 14px',fontSize:12,color: i===0 ? 'var(--ink)' : 'var(--ink-3)'}}>{i===0 ? 'Mehmet Yılmaz' : l}</div>
      ))}
      <button className="btn btn-primary btn-sm" style={{alignSelf:'flex-start',marginTop:6}}>Gönder →</button>
    </div>,
    // step 2: menu editor
    <div key="2" style={{padding:20,height:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:22}}>Menü Editörü</div>
        <div className="mono" style={{fontSize:10,color:'var(--olive)'}}>● KAYDEDİLDİ</div>
      </div>
      {[
        {n:'Flat White', p:'₺85', c:'Kahve', selected:true},
        {n:'Cortado', p:'₺75', c:'Kahve'},
        {n:'Sourdough Toast', p:'₺95', c:'Kahvaltı'},
      ].map((item,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',background: item.selected ? 'var(--paper-2)' : 'transparent',borderRadius:8,marginBottom:4,border:'1px solid var(--line)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>{item.n}</div>
            <div className="mono" style={{fontSize:9}}>{item.c}</div>
          </div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:13}}>{item.p}</div>
        </div>
      ))}
    </div>,
    // step 3: QR
    <div key="3" style={{padding:24,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{background:'var(--ink)',padding:20,borderRadius:12}}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {Array.from({length:11}).map((_,i)=>Array.from({length:11}).map((_,j)=>{
            const v = (i*7+j*3+i*j)%3;
            return v===0 && <rect key={`${i}-${j}`} x={i*10+4} y={j*10+4} width="8" height="8" fill="var(--paper)"/>;
          }))}
        </svg>
      </div>
      <div style={{textAlign:'center'}}>
        <div className="mono" style={{fontSize:9}}>MASA 14 · CEYLAN CAFÉ</div>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:18,marginTop:4}}>Hoş geldin.</div>
      </div>
    </div>
  ];

  return (
    <section className="steps" id="steps">
      <div className="container reveal">
        <div className="steps-head">
          <div className="section-label"><span className="mono">Başlangıç</span></div>
          <h2>15 dakikada kurulum, <span className="serif">bir ömür kolaylık.</span></h2>
        </div>
        <div className="steps-grid">
          <div className="step-list">
            {steps.map((s, i) => (
              <div key={i} className={`step-item ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>
                <div className="no">{s.no}</div>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="step-visual">
            {visuals[active]}
          </div>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const [tab, setTab] = useSt(0);
  const [paused, setPaused] = useSt(false);
  const [fadeKey, setFadeKey] = useSt(0);
  const shots = [
    { label: 'Dashboard',    src: 'shots/dashboard.png',    title: 'Gösterge Paneli',        caption: 'Günün özeti — ciro, sipariş, aktif masalar ve garson çağrıları tek ekranda.' },
    { label: 'Kasa',         src: 'shots/pos.png',          title: 'Kasa & Adisyon',          caption: 'Masalar, servisler, müşteri sadakati — hepsi aynı anda.' },
    { label: 'Sipariş Akışı',src: 'shots/orders.png',       title: 'Canlı Siparişler',        caption: 'QR\'dan gelen siparişler mutfağa düşer, aşamalar arasında sürükle-bırak.' },
    { label: 'Stok',         src: 'shots/stock.png',        title: 'Stok & Envanter',         caption: 'Kritik seviyede ne var? Yeniden sipariş noktalarını hücrelerden düzenle.' },
    { label: 'Vardiya',      src: 'shots/shift.png',        title: 'Haftalık Vardiya Planı',  caption: 'Şablon bir kez, haftalar boyunca. Personel saatleri otomatik hesaplanır.' },
    { label: 'Kampanya',     src: 'shots/campaigns.png',    title: 'Kampanya Editörü',        caption: 'Popup, banner, zamanlı — menüde ne ne zaman gösterilecek, sen belirle.' },
    { label: 'Sadakat',      src: 'shots/loyalty.png',      title: 'Sadakat Programı',        caption: 'VIP, büyük harcayan, uyuyan müşteri — her segment için ayrı yaklaşım.' },
    { label: 'Paket Servis', src: 'shots/phone-order.png',  title: 'Telefonla Sipariş',       caption: 'Gelen aramayı yakala, müşterinin geçmişini anında gör.' },
    { label: 'Fiş',          src: 'shots/receipt.png',      title: 'Fiş Tasarımcısı',         caption: 'Logo, alt başlık, QR — müşterinin eline giden kâğıdı sen tasarla.' },
    { label: 'Çağrı',        src: 'shots/waiter-call.png',  title: 'Garson Çağrı',            caption: 'Masadan gelen her çağrı sesli uyarıyla sana düşer.' },
    { label: 'Değerlendirme',src: 'shots/reviews.png',      title: 'Müşteri Yorumları',       caption: 'QR fişten gelen yorumlar — olumsuzları işaretle, anında cevap ver.' },
    { label: 'Ekip',         src: 'shots/team.png',         title: 'Ekip & Roller',           caption: 'Sahip, yönetici, müdür, operatör — her role gereken kadar erişim.' },
    { label: 'Gün Sonu',     src: 'shots/daily-report.png', title: 'Günün Özeti',             caption: 'Kasa sayımı, ödeme dağılımı, saatlik trend — gün sonunda tek raporda.' },
  ];
  const tabs = shots.map(s => s.label);

  // Auto-advance every 4s; pause on hover/click
  useEf(() => {
    if (paused) return;
    const t = setInterval(() => {
      setTab(i => (i + 1) % shots.length);
      setFadeKey(k => k + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, shots.length]);

  const selectTab = (i) => {
    setTab(i);
    setFadeKey(k => k + 1);
    setPaused(true);
    // resume auto-advance after 10s of inactivity
    clearTimeout(window.__shotPauseT);
    window.__shotPauseT = setTimeout(() => setPaused(false), 10000);
  };

  const screens = shots.map((s, i) => (
    <div key={i} className="shot-frame">
      <div className="shot-topbar">
        <span className="tl-dot r"></span><span className="tl-dot y"></span><span className="tl-dot g"></span>
        <span className="shot-url mono">app.aleg.cafe / {s.label.toLowerCase().replace(/[^a-z]/g,'')}</span>
      </div>
      <img src={s.src} alt={s.title} className="shot-img" loading="lazy"/>
      <div className="shot-caption">
        <div className="mono">{s.label.toUpperCase()}</div>
        <div className="shot-title">{s.title}</div>
        <p>{s.caption}</p>
      </div>
    </div>
  ));

  const _unusedLegacyScreens = [
    // Dashboard
    <div key="0" style={{padding:28,height:'100%',background:'var(--card)'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <div className="mono" style={{fontSize:10}}>CEYLAN CAFÉ · BEŞİKTAŞ</div>
          <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:32,marginTop:4}}>Bugün nasıl gidiyor?</div>
        </div>
        <div className="mono" style={{fontSize:10,color:'var(--olive)',alignSelf:'flex-start'}}>● CANLI · 18:42</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{l:'CİRO',v:'₺14.284',d:'+%18'},{l:'SİPARİŞ',v:'142',d:'+22'},{l:'ORT. SEPET',v:'₺100',d:'─'},{l:'AKTİF MASA',v:'12/18',d:'↑'}].map((s,i)=>(
          <div key={i} style={{padding:18,background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10}}>
            <div className="mono" style={{fontSize:9,marginBottom:8}}>{s.l}</div>
            <div style={{fontSize:28,fontWeight:500,letterSpacing:'-0.02em'}}>{s.v}</div>
            <div className="mono" style={{fontSize:10,color:'var(--olive)',marginTop:6}}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
        <div style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10,padding:16,height:180}}>
          <div className="mono" style={{fontSize:10,marginBottom:10}}>HAFTALIK CİRO</div>
          <svg viewBox="0 0 400 130" preserveAspectRatio="none" style={{width:'100%',height:'80%'}}>
            <path d="M 0 100 L 57 85 L 114 75 L 171 55 L 228 65 L 285 40 L 342 25 L 400 15 L 400 130 L 0 130 Z" fill="var(--accent)" opacity="0.14"/>
            <path d="M 0 100 L 57 85 L 114 75 L 171 55 L 228 65 L 285 40 L 342 25 L 400 15" stroke="var(--accent)" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10,padding:16}}>
          <div className="mono" style={{fontSize:10,marginBottom:12}}>EN ÇOK SATAN</div>
          {['Flat White','Cortado','Croissant'].map((n,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:12,borderBottom: i<2 ? '1px dashed var(--line)' : 'none'}}>
              <span>{n}</span><span className="mono" style={{fontSize:11}}>×{42-i*8}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    // Kasa / POS
    <div key="1" style={{padding:20,height:'100%',background:'var(--paper-2)',display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
          {Array.from({length:15}).map((_,i)=>(
            <div key={i} style={{aspectRatio:'1',background: i===3 ? 'var(--accent)' : 'var(--card)',color: i===3 ? 'var(--paper)' : 'var(--ink)',borderRadius:8,padding:12,display:'flex',flexDirection:'column',justifyContent:'space-between',border:'1px solid var(--line)'}}>
              <div className="mono" style={{fontSize:9}}>M{i+1}</div>
              <div style={{fontSize:10}}>{i===3 ? '₺342' : (i%3===0 ? 'Boş' : '₺—')}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--line)',borderRadius:10,padding:16}}>
        <div className="mono" style={{fontSize:10,marginBottom:4}}>MASA 04 · ADİSYON</div>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:22,marginBottom:14}}>Hesap</div>
        {[['Flat White','₺85'],['Cortado','₺75'],['Croissant','₺65'],['Cold Brew','₺95'],['Espresso 2×','₺60']].map(([n,p],i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',fontSize:12,borderBottom:'1px dashed var(--line)'}}>
            <span>{n}</span><span className="mono">{p}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'1px solid var(--ink)'}}>
          <span style={{fontSize:12,fontWeight:500}}>TOPLAM</span>
          <span style={{fontFamily:'var(--f-mono)',fontSize:18}}>₺380</span>
        </div>
      </div>
    </div>,
    // Mutfak
    <div key="2" style={{padding:20,height:'100%',background:'var(--ink)',color:'var(--paper)'}}>
      <div className="mono" style={{fontSize:10,color:'var(--paper)',marginBottom:16,opacity:0.6}}>MUTFAK EKRANI · 18:42</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[
          {n:'#1284',t:'M14',items:['Flat White','Croissant','Cortado'],time:'2:15',color:'var(--olive)'},
          {n:'#1285',t:'M07',items:['Cold Brew','Sourdough'],time:'4:32',color:'var(--accent)'},
          {n:'#1286',t:'M11',items:['Espresso','Double Espresso','Macchiato'],time:'YENİ',color:'var(--gold)'},
        ].map((o,i)=>(
          <div key={i} style={{background:'rgba(244,238,226,0.06)',border:`1px solid ${o.color}`,borderRadius:10,padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontFamily:'var(--f-mono)',fontSize:14}}>{o.n}</div>
              <div style={{fontFamily:'var(--f-mono)',fontSize:11,color:o.color}}>{o.time}</div>
            </div>
            <div className="mono" style={{fontSize:9,opacity:0.6,marginBottom:10}}>MASA {o.t}</div>
            {o.items.map((it,j)=><div key={j} style={{fontSize:12,padding:'4px 0',borderBottom:'1px solid rgba(244,238,226,0.08)'}}>• {it}</div>)}
          </div>
        ))}
      </div>
    </div>,
    // Müşteri Menüsü
    <div key="3" style={{padding:24,height:'100%',background:'var(--paper)',maxWidth:420,margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:20}}>
        <div className="mono" style={{fontSize:10}}>MASA 14 · CEYLAN CAFÉ</div>
        <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:28,marginTop:6}}>Hoş geldin.</div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto'}}>
        {['Tümü','Kahve','Kahvaltı','Tatlı','İçecek'].map((c,i)=>(
          <div key={i} style={{padding:'7px 14px',borderRadius:999,fontSize:11,background: i===1 ? 'var(--ink)' : 'var(--card)',color: i===1 ? 'var(--paper)' : 'var(--ink)',border:'1px solid var(--line)',whiteSpace:'nowrap'}}>{c}</div>
        ))}
      </div>
      {[
        {n:'Flat White', d:'Çift shot espresso, buharla ısıtılmış süt', p:'₺85'},
        {n:'Cortado', d:'Espresso, eşit miktarda süt', p:'₺75'},
        {n:'Cold Brew', d:'12 saat demlenmiş, hafif tatlı', p:'₺95'},
      ].map((m,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px dashed var(--line)'}}>
          <div>
            <div style={{fontSize:14,fontWeight:500}}>{m.n}</div>
            <div style={{fontSize:11,color:'var(--ink-3)',marginTop:3}}>{m.d}</div>
          </div>
          <div style={{fontFamily:'var(--f-mono)',fontSize:14,alignSelf:'flex-start'}}>{m.p}</div>
        </div>
      ))}
    </div>,
    // Super Admin
    <div key="4" style={{padding:24,height:'100%',background:'var(--card)'}}>
      <div className="mono" style={{fontSize:10,marginBottom:4,color:'var(--accent)'}}>SÜPER ADMIN · ALEG STUDIO</div>
      <div style={{fontFamily:'var(--f-serif)',fontStyle:'italic',fontSize:28,marginBottom:22}}>Tüm tenant'lar</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {[{l:'AKTİF',v:'28'},{l:'TRİAL',v:'14'},{l:'MRR',v:'₺42.4K'},{l:'CHURN',v:'%1.2'}].map((s,i)=>(
          <div key={i} style={{padding:14,background:'var(--paper-2)',borderRadius:8,border:'1px solid var(--line)'}}>
            <div className="mono" style={{fontSize:9,marginBottom:6}}>{s.l}</div>
            <div style={{fontSize:22,fontWeight:500}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:'var(--paper-2)',borderRadius:8,border:'1px solid var(--line)'}}>
        {['Ceylan Café · Beşiktaş','Kırmızı Fincan · Kadıköy','Mor Bahçe · Çankaya','Deniz Kıyısı · Bodrum'].map((n,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderBottom: i<3 ? '1px solid var(--line)' : 'none',fontSize:13}}>
            <span>{n}</span>
            <span className="mono" style={{fontSize:10,color: i===0 ? 'var(--olive)' : (i===3 ? 'var(--gold)' : 'var(--ink-3)')}}>● {i===3 ? 'TRIAL' : 'AKTİF'}</span>
          </div>
        ))}
      </div>
    </div>
  ];

  const highlights = [
    ['TEK EKRAN','Her şey parmak ucunda'],
    ['GERÇEK ZAMANLI','Güncellemeler anında'],
    ['MATBAA-KALİTESİ','Editörel detay'],
  ];

  return (
    <section className="showcase" id="showcase">
      <div className="container reveal">
        <div className="showcase-head">
          <div className="section-label" style={{justifyContent:'center',display:'flex'}}><span className="mono">Ürün Turu</span></div>
          <h2>İşte böyle <span className="serif">görünüyor.</span></h2>
        </div>
        <div className="showcase-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={tab === i ? 'active' : ''} onClick={() => selectTab(i)}>{t}</button>
          ))}
        </div>
        <div
          className="showcase-screen"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { clearTimeout(window.__shotPauseT); setPaused(false); }}
        >
          <div className="shot-progress"><div className="shot-progress-bar" key={fadeKey} style={{ animationPlayState: paused ? 'paused' : 'running' }}></div></div>
          <div className="shot-fader" key={fadeKey}>
            {screens[tab]}
          </div>
        </div>
        <div className="showcase-highlights">
          {highlights.map(([l, t], i) => (
            <div key={i} className="highlight">
              <div className="mono">{l}</div>
              <div className="t">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modules() {
  const mods = [
    { name: 'QR Menü', desc: 'Her planda dahil', on: true },
    { name: 'POS & Adisyon', desc: 'Her planda dahil', on: true },
    { name: 'Mutfak Ekranı', desc: 'Her planda dahil', on: true },
    { name: 'Sadakat Programı', desc: 'Eklenti · Pro+' },
    { name: 'Paket Servis', desc: 'Eklenti · Pro+' },
    { name: 'Stok Takibi', desc: 'Eklenti · Pro+' },
    { name: 'Vardiya Planı', desc: 'Eklenti · Kurumsal' },
    { name: 'Çoklu Şube', desc: 'Eklenti · Kurumsal' },
    { name: 'Özel Domain', desc: 'Eklenti · Kurumsal' },
  ];
  return (
    <section className="modules container reveal" id="modules" style={{padding:'120px 32px'}}>
      <div className="section-label"><span className="mono">Modüller</span></div>
      <h2>İhtiyacın kadar, <span className="serif">ihtiyaç olunca.</span></h2>
      <p className="lede">Modüler yapı — her kafenin ihtiyacı farklı. Başlangıçta QR menü yeter, büyüdükçe aç.</p>
      <div className="module-grid">
        {mods.map((m, i) => (
          <div key={i} className={`module-card ${m.on ? 'on' : ''}`}>
            <div className="ck">
              {m.on ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </div>
            <div>
              <div className="m-name">{m.name}</div>
              <div className="m-desc">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

window.Problems = Problems;
window.Features = Features;
window.Steps = Steps;
window.Showcase = Showcase;
window.Modules = Modules;
