// ===== SUPPORT: tickets (kanban) + notifications =========================
function TicketsScreen() {
  const T = window.DATA.tickets;
  const cols = [
    { id: "new", label: "Yeni", tone: "danger", items: T.new },
    { id: "in_progress", label: "Devam Ediyor", tone: "warn", items: T.in_progress },
    { id: "waiting", label: "Müşteri Bekliyor", tone: "muted", items: T.waiting },
    { id: "resolved", label: "Çözüldü", tone: "ok", items: T.resolved }
  ];
  const prioMap = { high: "danger", medium: "warn", low: "muted" };
  const prioLabel = { high: "YÜKSEK", medium: "ORTA", low: "DÜŞÜK" };

  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20, minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">DESTEK</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Destek talepleri</h1>
          <p style={{ color: "var(--ink-2)", marginTop: 8 }}>
            {T.new.length + T.in_progress.length} açık talep · ort. yanıt süresi <strong>24 dk</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary">Filtreler</button>
          <button className="btn btn-primary">+ Talep oluştur</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, minHeight: 520 }}>
        {cols.map(col => (
          <div key={col.id} style={{
            background: "var(--paper-2)",
            borderRadius: "var(--r)",
            border: "1px solid var(--line)",
            display: "grid", gridTemplateRows: "auto 1fr",
            overflow: "hidden"
          }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", background: "var(--card)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusDot tone={col.tone} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{col.label}</span>
              </div>
              <span className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", padding: "2px 8px", borderRadius: 999, background: "var(--paper)", letterSpacing: "0.06em" }}>
                {col.items.length}
              </span>
            </div>
            <div style={{ padding: 10, display: "grid", gap: 8, alignContent: "start" }}>
              {col.items.map(t => (
                <div key={t.id} className="card" style={{ padding: 12, display: "grid", gap: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{t.id}</span>
                    <Pill tone={prioMap[t.priority]}>{prioLabel[t.priority]}</Pill>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35 }}>{t.subject}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: "0.02em" }}>
                    {t.business}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 2 }}>
                    {t.owner ? <Avatar text={t.owner.split(" ").map(x=>x[0]).join("")} size={22} tint="var(--paper-3)" />
                             : <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>— atanmadı</span>}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>◌ {t.msgs}</span>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{t.last}</span>
                    </div>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && (
                <div style={{ padding: "30px 12px", textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.08em" }}>
                  — BOŞ —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const items = [
    { t: "14:32", tone: "danger", who: "Konyaaltı Kahvecisi", what: "Ödeme 12 gündür bekliyor — plan otomatik askıya alındı" },
    { t: "14:12", tone: "ok",     who: "Moda Sahil Kafe", what: "Yeni aylık fatura oluşturuldu — ₺999" },
    { t: "13:58", tone: "super",  who: "Karaköy Kahve Evi", what: "Growth → Pro plan yükseltmesi" },
    { t: "13:20", tone: "ok",     who: "Eskişehir Odunpazarı Kahve", what: "Onayladın — onboarding maili gönderildi" },
    { t: "12:58", tone: "warn",   who: "INV-2604-0287", what: "İyzico ödeme deneme #3 başarısız" },
    { t: "11:22", tone: "muted",  who: "Bursa Cumalıkızık Kahve", what: "Yeni işletme kaydı (organik)" },
    { t: "Dün",  tone: "ok",     who: "Sistem", what: "v2.14.3 deploy tamamlandı — 0 hata" }
  ];
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">BİLDİRİM MERKEZİ</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Bildirimler</h1>
      </div>
      <div className="card">
        {items.map((n, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "72px 1fr auto",
            alignItems: "center", gap: 14, padding: "16px 20px",
            borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none"
          }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{n.t}</span>
            <div style={{ display: "grid", gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{n.who}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{n.what}</span>
            </div>
            <Pill tone={n.tone}>{n.tone}</Pill>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TicketsScreen, NotificationsScreen });
