// Customer Order Flow — animated phone showing a customer ordering from QR menu,
// with the order appearing live on the cafe dashboard
const { useState: useSO, useEffect: useEO } = React;

function OrderFlow() {
  const [step, setStep] = useSO(0);
  // steps: 0 scan, 1 browse, 2 add, 3 cart, 4 pay, 5 delivered
  useEO(() => {
    const timings = [2800, 2400, 2400, 2600, 2400, 3400];
    const t = setTimeout(() => setStep(s => (s + 1) % 6), timings[step]);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section className="orderflow" id="orderflow">
      <div className="container">
        <div className="of-head reveal">
          <div className="section-label"><span className="mono">Müşteri Deneyimi</span></div>
          <h2>Masadan <span className="serif">mutfağa</span>, 20 saniyede.</h2>
          <p>Müşterinin telefonu ile başlayan sipariş, aynı saniyede kasana ve mutfak ekranına düşer.</p>
        </div>

        <div className="of-stage reveal">
          {/* LEFT — phone */}
          <div className="of-phone-wrap">
            <div className="of-phone">
              <div className="of-phone-notch"></div>
              <div className="of-phone-screen">
                <PhoneStep step={step} />
              </div>
              <div className="of-phone-home"></div>
            </div>
            <div className="of-phone-label">
              <span className="mono">MÜŞTERİ · MASA 14</span>
            </div>
          </div>

          {/* MIDDLE — timeline */}
          <div className="of-timeline">
            {['QR Tarama', 'Menüyü Gez', 'Sepete Ekle', 'Onayla', 'Öde', 'Mutfakta'].map((lbl, i) => (
              <div key={i} className={`of-step ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}>
                <div className="of-step-dot">
                  {step > i ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <div className="of-step-body">
                  <div className="of-step-label">{lbl}</div>
                  {step === i && <div className="of-step-indicator"><div></div></div>}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — cafe dashboard (matches real Aleg panel) */}
          <div className="of-cafe">
            <div className="of-cafe-sidebar">
              <div className="of-cafe-logo">
                <div className="of-cafe-logo-mark">A</div>
                <div>
                  <div className="of-cafe-logo-name">Aleg</div>
                  <div className="of-cafe-logo-sub">KARAKÖY</div>
                </div>
              </div>
              <div className="of-cafe-nav-group">GENEL</div>
              <div className="of-cafe-nav-item">Gösterge Paneli</div>
              <div className="of-cafe-nav-group">OPERASYON</div>
              <div className="of-cafe-nav-item">Masalar</div>
              <div className="of-cafe-nav-item">Kasa</div>
              <div className="of-cafe-nav-item active">Siparişler</div>
              <div className="of-cafe-nav-item">Garson Çağrı</div>
            </div>
            <div className="of-cafe-body">
              <div className="of-cafe-topbar">
                <div className="of-cafe-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
                  <span>Ara veya komut çalıştır</span>
                  <span className="of-cafe-kbd mono">⌘K</span>
                </div>
                <div className="of-cafe-avatar">MK</div>
              </div>

              <div className="of-cafe-head">
                <div>
                  <div className="mono of-cafe-kicker">SİPARİŞLER</div>
                  <div className="of-cafe-title">Canlı akış</div>
                  <div className="of-cafe-desc">Kasadan, QR'dan ve paketten gelen tüm siparişler tek ekranda.</div>
                </div>
                <span className="mono live">● CANLI</span>
              </div>

              <div className="of-cafe-cols">
                <div className="of-cafe-col">
                  <div className="of-cafe-col-head">
                    <span>Sipariş Alındı</span><span className="mono">{step >= 4 ? '1' : '0'}</span>
                  </div>
                  {step >= 4 && (
                    <div className={`of-ticket ${step === 4 ? 'just-in' : ''}`}>
                      <div className="of-ticket-h">
                        <span className="mono">#A-2041</span>
                        <span className="of-ticket-time">● 0 dk</span>
                      </div>
                      <div className="of-ticket-table">Masa 14 · QR</div>
                      <div className="of-ticket-item">2× Flat White</div>
                      <div className="of-ticket-item">1× Avokadolu Ekşi Maya</div>
                      <div className="of-ticket-total">
                        <span className="mono">TOPLAM</span>
                        <span>₺355</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="of-cafe-col">
                  <div className="of-cafe-col-head">
                    <span>Hazırlanıyor</span><span className="mono">{step >= 5 ? '1' : '0'}</span>
                  </div>
                  {step >= 5 && (
                    <div className="of-ticket in-prep">
                      <div className="of-ticket-h">
                        <span className="mono">#A-2041</span>
                        <span className="of-ticket-time" style={{color:'var(--accent)'}}>● 1 dk</span>
                      </div>
                      <div className="of-ticket-table">Masa 14 · QR</div>
                      <div className="of-ticket-prep">
                        <div className="of-prep-bar"><div></div></div>
                        <span className="mono">MUTFAK ALDI</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {step >= 4 && (
                <div className="of-notif">
                  <div className="of-notif-dot"></div>
                  <div>
                    <div className="mono">YENİ SİPARİŞ · QR · 0s ÖNCE</div>
                    <div className="of-notif-txt">Masa 14 · 3 ürün · ₺355</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneStep({ step }) {
  // STEP 0 — QR scan
  if (step === 0) return (
    <div className="phs phs-scan">
      <div className="phs-scan-top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
        <span className="mono">KAMERA</span>
      </div>
      <div className="phs-scan-viewport">
        <div className="phs-qr">
          <QRSvg />
        </div>
        <div className="phs-scan-line"></div>
        <div className="phs-scan-corners">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
      <div className="phs-scan-hint">Masa üstündeki kodu tarat</div>
    </div>
  );

  // STEP 1 — menu browsing (matches real Aleg QR menu)
  if (step === 1) return (
    <div className="phs phs-menu">
      <div className="phs-menu-brand">
        <div className="mono">EST. 2021 · KARAKÖY</div>
        <div className="phs-brand-name">Aleg</div>
        <div className="phs-brand-sub">Masa 14 · Dine-in</div>
      </div>
      <div className="phs-menu-chips">
        {['Espresso Bazlı', 'Filtre & Slow', 'Mevsim Kahvaltı', 'Tatlı'].map((c, i) => (
          <span key={i} className={`phs-chip ${i === 0 ? 'on' : ''}`}>{c}</span>
        ))}
      </div>
      <div className="phs-menu-items">
        {[
          { n: 'Flat White', d: 'Ethiopia Yirgacheffe, ipeksi süt', p: '₺95', hl: true, tint: '#6B4F33' },
          { n: 'Cortado', d: 'Espresso, eşit süt', p: '₺85', tint: '#8A6B4F' },
          { n: 'V60 · Geyşa', d: 'Panama · tek çekirdek', p: '₺130', tint: '#3E2A1B' },
        ].map((m, i) => (
          <div key={i} className={`phs-item ${m.hl ? 'hover' : ''}`}>
            <div className="phs-item-img" style={{background: m.tint}}>
              <span className="mono">{m.n.split(' ')[0].toUpperCase().slice(0,6)}</span>
            </div>
            <div className="phs-item-body">
              <div className="phs-item-n">{m.n}</div>
              <div className="phs-item-d">{m.d}</div>
            </div>
            <div className="phs-item-p">
              <span>{m.p}</span>
              {m.hl && <div className="phs-add-mini">+</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // STEP 2 — add to cart (product detail)
  if (step === 2) return (
    <div className="phs phs-detail">
      <div className="phs-detail-img">
        <div className="phs-back-btn">←</div>
      </div>
      <div className="phs-detail-body">
        <div className="mono">ESPRESSO BAZLI</div>
        <div className="phs-detail-n">Flat White</div>
        <p>Ethiopia Yirgacheffe çekirdeği ile çift shot espresso üzerine buharla ısıtılmış süt.</p>
        <div className="phs-qty">
          <button>−</button>
          <span>2</span>
          <button>+</button>
        </div>
        <button className="phs-add-btn">
          Sepete Ekle · ₺190
          <div className="phs-add-pulse"></div>
        </button>
      </div>
    </div>
  );

  // STEP 3 — cart review
  if (step === 3) return (
    <div className="phs phs-cart">
      <div className="phs-menu-head">
        <div className="mono">SİPARİŞİN</div>
        <div className="phs-menu-title">Sepet</div>
      </div>
      <div className="phs-cart-list">
        {[
          { n: '2× Flat White', p: '₺190' },
          { n: '1× Avokadolu Ekşi Maya', p: '₺165' },
        ].map((c, i) => (
          <div key={i} className="phs-cart-row">
            <span>{c.n}</span><span className="mono">{c.p}</span>
          </div>
        ))}
      </div>
      <div className="phs-cart-sum">
        <div className="phs-cart-sum-row"><span>Ara toplam</span><span className="mono">₺355</span></div>
        <div className="phs-cart-sum-row total"><span>Toplam</span><span className="mono">₺355</span></div>
      </div>
      <button className="phs-add-btn go">
        Siparişi Gönder →
      </button>
    </div>
  );

  // STEP 4 — pay + send
  if (step === 4) return (
    <div className="phs phs-pay">
      <div className="phs-pay-check">
        <svg viewBox="0 0 80 80" width="72" height="72">
          <circle cx="40" cy="40" r="36" stroke="var(--olive)" strokeWidth="3" fill="none"
            strokeDasharray="226" strokeDashoffset="226" className="ring"/>
          <path d="M 25 42 L 35 52 L 56 28" stroke="var(--olive)" strokeWidth="4" fill="none"
            strokeDasharray="60" strokeDashoffset="60" className="check" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="phs-pay-title">Sipariş gönderildi</div>
      <div className="phs-pay-sub">Masanıza getirilecek. Tahmini 8 dk.</div>
      <div className="phs-pay-order">
        <span className="mono">#A-2041</span>
        <span className="mono">₺355 · KAPIDA</span>
      </div>
    </div>
  );

  // STEP 5 — live status on phone
  return (
    <div className="phs phs-track">
      <div className="phs-menu-head">
        <div className="mono">SİPARİŞ #A-2041</div>
        <div className="phs-menu-title">Hazırlanıyor</div>
      </div>
      <div className="phs-track-steps">
        {[
          { l: 'Alındı', done: true },
          { l: 'Mutfakta', done: true, active: true },
          { l: 'Hazır', done: false },
          { l: 'Teslim', done: false },
        ].map((s, i) => (
          <div key={i} className={`phs-track-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}>
            <div className="phs-track-dot"></div>
            <span>{s.l}</span>
          </div>
        ))}
      </div>
      <div className="phs-track-eta">
        <span className="mono">KALAN SÜRE</span>
        <div className="phs-track-eta-val">7 <span>dk</span></div>
      </div>
      <div className="phs-track-items">
        <div className="phs-cart-row"><span>2× Flat White</span><span className="mono">✓</span></div>
        <div className="phs-cart-row"><span>1× Avokadolu Ekşi Maya</span><span className="mono">...</span></div>
      </div>
    </div>
  );
}

function QRSvg() {
  const pattern = [
    '1111111 0 1010101 0 1111111',
    '1000001 1 0110100 1 1000001',
    '1011101 0 1011010 0 1011101',
    '1011101 1 0101101 1 1011101',
    '1011101 0 1110011 0 1011101',
    '1000001 1 0010110 1 1000001',
    '1111111 0 1010101 0 1111111',
  ];
  // flatten with rng-ish fallback
  const cells = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      // corners (finder patterns) hard-coded
      const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const onOuterRing = inFinder && (x === 0 || y === 0 || x === 6 || y === 6 ||
        (x === 14 && y < 7) || (x === 20 && y < 7) || (y === 0 && x > 13) || (y === 6 && x > 13) ||
        (x === 0 && y > 13) || (x === 6 && y > 13) || (y === 14 && x < 7) || (y === 20 && x < 7));
      const innerBlock = inFinder && x > 1 && x < 5 && y > 1 && y < 5;
      const innerBlockR = inFinder && x > 15 && x < 19 && y > 1 && y < 5;
      const innerBlockBL = inFinder && x > 1 && x < 5 && y > 15 && y < 19;
      const fill = onOuterRing || innerBlock || innerBlockR || innerBlockBL ||
        ((x * 7 + y * 13 + x * y * 3) % 5 === 0);
      if (fill) cells.push(<rect key={`${x}-${y}`} x={x * 5} y={y * 5} width="5" height="5" fill="var(--ink)"/>);
    }
  }
  return (
    <svg viewBox="0 0 105 105" width="140" height="140">
      <rect width="105" height="105" fill="var(--paper)"/>
      {cells}
    </svg>
  );
}

window.OrderFlow = OrderFlow;
