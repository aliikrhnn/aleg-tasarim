// Nav + Hero + Floating notifications
const { useState: useStateH, useEffect: useEffectH } = React;

function Nav({ onDemo, onMobile }) {
  const [scrolled, setScrolled] = useStateH(false);
  const [mobileOpen, setMobileOpen] = useStateH(false);

  useEffectH(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="logo">
            <div className="logo-mark">A</div>
            <div className="logo-text">
              <span className="brand">Aleg</span>
              <span className="sub">STUDIO</span>
            </div>
          </a>
          <div className="nav-links">
            <a href="#features">Özellikler</a>
            <a href="#modules">Modüller</a>
            <a href="#pricing">Fiyatlar</a>
            <a href="#map">Harita</a>
            <a href="#faq">SSS</a>
            <a href="#contact">İletişim</a>
          </div>
          <div className="nav-actions">
            <a href="https://panel.alegstudio.com" className="btn btn-ghost btn-sm btn-ghost-nav">Giriş</a>
            <button className="btn btn-primary btn-sm" onClick={onDemo}>Demo Talep Et</button>
            <button className="nav-hamb" onClick={() => setMobileOpen(!mobileOpen)} aria-label="menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMobileOpen(false)}>Özellikler</a>
        <a href="#modules" onClick={() => setMobileOpen(false)}>Modüller</a>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Fiyatlar</a>
        <a href="#map" onClick={() => setMobileOpen(false)}>Harita</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>SSS</a>
        <button className="btn btn-primary btn-lg" onClick={() => { setMobileOpen(false); onDemo(); }}>Demo Talep Et</button>
      </div>
    </>
  );
}

function DashboardMockup() {
  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="dash-side-logo"><div className="dot"></div><span>Aleg</span></div>
        <div className="dash-side-item active"><i></i>Dashboard</div>
        <div className="dash-side-item"><i></i>Siparişler</div>
        <div className="dash-side-item"><i></i>Menü</div>
        <div className="dash-side-item"><i></i>Masalar</div>
        <div className="dash-side-item"><i></i>Sadakat</div>
        <div className="dash-side-item"><i></i>Raporlar</div>
        <div className="dash-side-item"><i></i>Ayarlar</div>
      </aside>
      <main className="dash-main">
        <div className="dash-h">
          <div>
            <h3>Bugün</h3>
            <span className="mono">18 NİSAN · CUMA</span>
          </div>
          <span className="mono" style={{color:'var(--olive)'}}>● CANLI</span>
        </div>
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="lab">Ciro</div>
            <div className="val">₺14.284</div>
            <div className="delta">↑ %18</div>
          </div>
          <div className="dash-stat">
            <div className="lab">Sipariş</div>
            <div className="val">142</div>
            <div className="delta">↑ 22</div>
          </div>
          <div className="dash-stat">
            <div className="lab">Ort. Sepet</div>
            <div className="val">₺100</div>
            <div className="delta" style={{color:'var(--ink-3)'}}>─</div>
          </div>
        </div>
        <div className="dash-chart">
          <svg viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M 0 80 L 40 70 L 80 60 L 120 65 L 160 40 L 200 45 L 240 30 L 280 35 L 320 20 L 360 15 L 400 10 L 400 100 L 0 100 Z"
              fill="var(--accent)" opacity="0.12"/>
            <path d="M 0 80 L 40 70 L 80 60 L 120 65 L 160 40 L 200 45 L 240 30 L 280 35 L 320 20 L 360 15 L 400 10"
              stroke="var(--accent)" strokeWidth="2" fill="none"/>
            {[[40,70],[80,60],[120,65],[160,40],[200,45],[240,30],[280,35],[320,20],[360,15]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)"/>
            ))}
          </svg>
        </div>
      </main>
    </div>
  );
}

const notifications = [
  { dot: 'accent', label: 'YENİ SİPARİŞ', text: 'Masa 14 · 3 ürün' },
  { dot: 'olive', label: 'ÖDEME ALINDI', text: '+₺342 · Masa 7' },
  { dot: 'accent', label: 'YENİ MÜŞTERİ', text: 'Elif K. · 280 puan' },
  { dot: 'olive', label: 'MUTFAK HAZIR', text: 'Sipariş #1284' },
  { dot: 'accent', label: 'PAKET SERVİS', text: 'Yeni çağrı · 0532...' },
];

function FloatingCards() {
  const [idx, setIdx] = useStateH(0);
  const [idx2, setIdx2] = useStateH(1);
  const [idx3, setIdx3] = useStateH(2);

  useEffectH(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 3) % notifications.length);
    }, 3000);
    const t2 = setInterval(() => {
      setIdx2(i => (i + 3) % notifications.length);
    }, 3400);
    const t3 = setInterval(() => {
      setIdx3(i => (i + 3) % notifications.length);
    }, 3800);
    return () => { clearInterval(t); clearInterval(t2); clearInterval(t3); };
  }, []);

  const FCard = ({ pos, i }) => {
    const n = notifications[i];
    return (
      <div className={`float-card fc-${pos}`} key={`${pos}-${i}`}>
        <div className={`dot ${n.dot === 'olive' ? 'olive' : ''}`}></div>
        <div className="txt"><small>{n.label}</small><b>{n.text}</b></div>
      </div>
    );
  };

  return (
    <>
      <FCard pos="1" i={idx} />
      <FCard pos="2" i={idx2} />
      <FCard pos="3" i={idx3} />
    </>
  );
}

function Hero({ onDemo }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="reveal">
          <div className="section-label"><span className="mono">Kafe İşletim Sistemi · B2B SaaS</span></div>
          <h1>
            İşletmenin
            <span className="breath">tek kumanda paneli.</span>
          </h1>
          <p className="hero-sub">
            QR sipariş, POS, mutfak ekranı, stok, vardiya, sadakat ve çoklu şube — 12 ayrı aboneliğin yerine tek platform. Kurulum 15 dakika, geri dönüş ilk haftadan.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={onDemo}>
              Demo Talep Et
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <a href="#features" className="btn btn-ghost btn-lg">
              Platformu Gezin
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <p className="hero-trust">14 gün ücretsiz · Kurulum desteği dahil · Kredi kartı gerekmez</p>
        </div>
        <div className="hero-visual reveal">
          <div className="hero-mockup">
            <div className="browser-chrome">
              <div className="browser-dots"><span></span><span></span><span></span></div>
              <div className="browser-url">panel.alegstudio.com</div>
            </div>
            <DashboardMockup />
          </div>
          <FloatingCards />
        </div>
      </div>
    </section>
  );
}

window.Nav = Nav;
window.Hero = Hero;
