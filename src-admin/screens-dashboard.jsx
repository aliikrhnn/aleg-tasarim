// ===== DASHBOARD ==========================================================
function DashboardScreen({ onNavigate }) {
  const D = window.DATA;
  const m = D.platformMetrics;

  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 24 }}>
      {/* Welcome header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>18 NİS 2026 · CUMARTESİ · 14:32</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--ink)" }}>
            İyi günler, <span style={{ color: "var(--super)" }}>Mert.</span>
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 14.5, color: "var(--ink-2)", maxWidth: 620, lineHeight: 1.55 }}>
            Platformda bugün <strong style={{ color: "var(--ink)" }}>3 yeni işletme</strong> kayıt oldu,
            <strong style={{ color: "var(--danger)" }}> 4 fatura</strong> ödeme bekliyor ve
            <strong style={{ color: "var(--ok)" }}> tüm servisler</strong> sağlıklı çalışıyor.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary">Rapor al</button>
          <button className="btn btn-primary" onClick={() => onNavigate("new-business")}>+ Yeni İşletme</button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <MetricCard label="TOPLAM İŞLETME" value={m.totalBusinesses}
          trend={8.2} trendLabel="Geçen aya göre" sparkline={m.trend.businesses}
          sparkColor="var(--super)" />
        <MetricCard label="AKTİF ABONELİK" value={m.activeSubscriptions}
          trend={5.1} trendLabel="30 gün" sparkline={m.trend.subscriptions}
          sparkColor="var(--olive)" />
        <MetricCard label="BU AYKİ GELİR" value={m.monthlyRevenue} currency
          trend={4.3} trendLabel="Tahmini ₺540K ay sonu" sparkline={m.trend.revenue}
          sparkColor="var(--gold)" accent="var(--ink)" />
        <MetricCard label="BUGÜN YENİ KAYIT" value={m.newToday}
          trend={50} trendLabel="Dün 2 kayıt" sparkline={m.trend.newSignups}
          sparkColor="var(--accent)" accent="var(--accent)" />
      </div>

      {/* Main grid: activity + critical */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Activity feed */}
        <div className="card" style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: 420 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="eyebrow">PLATFORM AKIŞI</div>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, fontWeight: 400, marginTop: 2 }}>Son aktiviteler</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusDot tone="ok" pulse />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--ok)", fontWeight: 700, letterSpacing: "0.08em" }}>CANLI</span>
            </div>
          </div>
          <div className="scroll-y" style={{ padding: "8px 0" }}>
            {D.activityFeed.map((a, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "60px 1fr auto",
                alignItems: "center", gap: 12, padding: "12px 20px",
                borderBottom: i < D.activityFeed.length - 1 ? "1px solid var(--line)" : "none"
              }}>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{a.t}</span>
                <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{a.who}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.what}</span>
                </div>
                <Pill tone={a.tone}>{a.kind}</Pill>
              </div>
            ))}
          </div>
        </div>

        {/* Pending payments — critical */}
        <div className="card" style={{ display: "grid", gridTemplateRows: "auto 1fr auto", borderColor: "var(--accent-soft)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", background: "color-mix(in oklab, var(--accent) 7%, transparent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--accent)" }}>KRİTİK</div>
                <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, fontWeight: 400, marginTop: 2 }}>Ödemesi bekleyenler</div>
              </div>
              <Pill tone="danger">{D.pendingPayments.length} adet</Pill>
            </div>
          </div>
          <div>
            {D.pendingPayments.map((p, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                alignItems: "center", gap: 12, padding: "14px 20px",
                borderBottom: i < D.pendingPayments.length - 1 ? "1px solid var(--line)" : "none"
              }}>
                <LogoTile logo={p.logo} tint="var(--accent)" size={32} />
                <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.business}</span>
                  <span className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{p.invoice} · {p.days} gün geçti</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Money amount={p.amount} size={22} tone="var(--accent)" />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>TOPLAM ₺6.396</span>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("pending-pay")}>Hepsini gör →</button>
          </div>
        </div>
      </div>

      {/* Second row: signups trend + map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
        {/* New signups — last 7 days */}
        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="eyebrow">SON 7 GÜN</div>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, fontWeight: 400, marginTop: 2 }}>Yeni kayıtlar</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <SerifNum size={36} tone="var(--super)">27</SerifNum>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ok)", fontWeight: 700, letterSpacing: "0.06em", marginTop: 2 }}>▲ +18%</div>
            </div>
          </div>
          <BarChart data={[2, 4, 3, 6, 2, 7, 3]} labels={["Pt","Sa","Çr","Pr","Cu","Ct","Pa"]} color="var(--olive)" width={280} height={96} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 6, borderTop: "1px solid var(--line)" }}>
            <div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>ORTALAMA</div>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 18, color: "var(--ink)" }}>3.9 / gün</div>
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>EN YÜKSEK</div>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 18, color: "var(--ink)" }}>Cumartesi · 7</div>
            </div>
          </div>
        </div>

        {/* Türkiye map */}
        <div className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="eyebrow">COĞRAFİ DAĞILIM</div>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, fontWeight: 400, marginTop: 2 }}>Aktif işletmeler</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <FilterChip label="TÜR" value="Hepsi" />
              <FilterChip label="PLAN" value="Hepsi" />
            </div>
          </div>
          <TurkiyeMap dots={D.cityDots} accent="var(--super)" />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
