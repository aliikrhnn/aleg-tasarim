// ===== SYSTEM: users, audit log, status, settings, stats ================
function PlatformUsersScreen() {
  const U = window.DATA.platformUsers;
  const roleMap = { "Super Admin": "super", "Support Lead": "gold", "Support": "muted", "Finance": "ok", "Developer": "warn" };
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">SİSTEM</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Platform kullanıcıları</h1>
          <p style={{ color: "var(--ink-2)", marginTop: 8 }}>Platforma erişimi olan ekip üyeleri.</p>
        </div>
        <button className="btn btn-primary">+ Kullanıcı davet et</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead><tr><th>Kullanıcı</th><th>E-posta</th><th>Rol</th><th>Durum</th><th>Son aktivite</th><th></th></tr></thead>
          <tbody>
            {U.map(u => (
              <tr key={u.email}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar text={u.avatar} tint="var(--paper-3)" />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td><span className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{u.email}</span></td>
                <td><Pill tone={roleMap[u.role]}>{u.role}</Pill></td>
                <td><Pill tone={u.status === "active" ? "ok" : "muted"}>{u.status === "active" ? "AKTİF" : "BOŞTA"}</Pill></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{u.lastActive}</span></td>
                <td><button className="btn btn-sm btn-ghost">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogScreen() {
  const log = window.DATA.auditLog;
  const actionColors = {
    "business.suspend": "var(--danger)",
    "business.approve": "var(--ok)",
    "business.plan.upgrade": "var(--super)",
    "invoice.generate": "var(--ink-2)",
    "payment.retry": "var(--warn)",
    "plan.edit": "var(--super)",
    "auth.login": "var(--ok)",
    "business.signup": "var(--olive)",
    "module.toggle": "var(--gold)",
    "ticket.reply": "var(--ink-2)",
    "support.assign": "var(--ink-2)"
  };
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">SİSTEM · AUDIT</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Audit log</h1>
          <p style={{ color: "var(--ink-2)", marginTop: 8 }}>Platformda gerçekleşen her işlem · append-only zaman çizelgesi.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary">Filtreler</button>
          <button className="btn btn-secondary btn-sm">CSV dışa aktar</button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, display: "flex", gap: 10 }}>
        <FilterChip label="KİM" value="Hepsi" />
        <FilterChip label="AKSİYON" value="Hepsi" />
        <FilterChip label="İŞLETME" value="Hepsi" />
        <FilterChip label="TARİH" value="Bugün" active />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {log.map((e, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "180px 180px 220px 1fr auto",
            alignItems: "center", gap: 14, padding: "12px 18px",
            borderBottom: i < log.length - 1 ? "1px solid var(--line)" : "none",
            fontFamily: "var(--f-mono)", fontSize: 11.5, lineHeight: 1.4
          }}>
            <span style={{ color: "var(--ink-3)", letterSpacing: "0.02em" }}>{e.ts}</span>
            <span style={{ color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {e.actor === "system" ? <span style={{ color: "var(--olive)", fontWeight: 700 }}>[system]</span> : e.actor}
            </span>
            <span style={{ color: actionColors[e.action] || "var(--ink)", fontWeight: 700, letterSpacing: "0.02em" }}>{e.action}</span>
            <span style={{ color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              → {e.target}
              <span style={{ color: "var(--ink-3)", marginLeft: 10, fontSize: 10.5 }}>{e.meta}</span>
            </span>
            <span style={{ color: "var(--ink-3)", fontSize: 10.5 }}>{e.ip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatusScreen() {
  const sh = window.DATA.systemHealth;
  const sMap = { ok: "ok", warn: "warn", down: "danger" };
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">SİSTEM · DURUM</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Sistem durumu</h1>
      </div>

      {/* Top status */}
      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, border: "2px solid var(--ok)", display: "grid", placeItems: "center", color: "var(--ok)", fontFamily: "var(--f-mono)", fontSize: 28, fontWeight: 700 }}>✓</div>
        <div>
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 34, color: "var(--ok)" }}>Tüm sistemler çalışıyor</div>
          <div className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em", marginTop: 4 }}>
            SON KONTROL: 12 SANİYE ÖNCE · <StatusDot tone="ok" pulse /> CANLI
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>UPTIME · 30G</div>
            <SerifNum size={26} tone="var(--ok)">{sh.uptime30d}</SerifNum>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>HATA ORANI</div>
            <SerifNum size={26}>{sh.errorRate}</SerifNum>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>VERSİYON</div>
            <div style={{ fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>{sh.version}</div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div className="eyebrow">SERVİSLER</div>
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, marginTop: 2 }}>Altyapı sağlığı</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
          {sh.services.map((s, i) => (
            <div key={s.name} style={{
              padding: "14px 20px",
              borderBottom: i < sh.services.length - 2 ? "1px solid var(--line)" : "none",
              borderRight: i % 2 === 0 ? "1px solid var(--line)" : "none",
              display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center"
            }}>
              <StatusDot tone={sMap[s.status]} pulse={s.status === "ok"} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{s.region}</div>
              </div>
              <Pill tone={sMap[s.status]}>{s.status === "ok" ? "SAĞLIKLI" : s.status === "warn" ? "YAVAŞ" : "DÜŞTÜ"}</Pill>
              <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", minWidth: 60, textAlign: "right" }}>{s.latency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy log */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="eyebrow">SON DEPLOY</div>
            <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, marginTop: 2 }}>{sh.version}</div>
          </div>
          <span className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{sh.lastDeploy}</span>
        </div>
        <div style={{ display: "grid", gap: 6, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", background: "var(--paper-2)", padding: 14, borderRadius: "var(--r-sm)" }}>
          <div><span style={{ color: "var(--ok)" }}>✓</span> fix(billing): iyzico retry backoff (3x → 5x)</div>
          <div><span style={{ color: "var(--ok)" }}>✓</span> feat(admin): bulk suspend action on businesses table</div>
          <div><span style={{ color: "var(--ok)" }}>✓</span> chore(deps): bump supabase-js 2.44 → 2.45</div>
          <div><span style={{ color: "var(--ink-3)" }}>·</span> 11 commits · 4 kişi · CI 2dk 14sn</div>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">SİSTEM</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Platform ayarları</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { t: "Marka & Domain", d: "Alt domain, marka adı, logo, favicon" },
          { t: "E-posta şablonları", d: "Hoşgeldin, fatura, askıya alma, onay" },
          { t: "Ödeme sağlayıcısı", d: "iyzico, Stripe, havale hesapları" },
          { t: "SMS & Bildirim", d: "NetGSM, push bildirim kanalları" },
          { t: "Onay akışı", d: "Yeni işletme kaydında manuel/otomatik onay" },
          { t: "Yedekleme", d: "Günlük otomatik yedekleme, geri yükleme" }
        ].map(s => (
          <div key={s.t} className="card" style={{ padding: 20, display: "grid", gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{s.t}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{s.d}</div>
            <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-secondary">Aç →</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsScreen() {
  const m = window.DATA.platformMetrics;
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">PLATFORM İSTATİSTİKLERİ</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>İstatistikler</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">İŞLETME BÜYÜMESİ · 12 AY</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
            <SerifNum size={48}>{m.totalBusinesses}</SerifNum>
            <Sparkline data={m.trend.businesses} width={300} height={90} stroke="var(--super)" />
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--ok)", letterSpacing: "0.04em", marginTop: 8 }}>▲ +67 YENİ İŞLETME · +37% YIL</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow">AYLIK TEKRARLAYAN GELİR</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
            <Money amount={m.monthlyRevenue} size={48} />
            <Sparkline data={m.trend.revenue} width={300} height={90} stroke="var(--gold)" />
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--ok)", letterSpacing: "0.04em", marginTop: 8 }}>▲ +₺164K · +51% YIL</div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="eyebrow">COĞRAFİ DAĞILIM</div>
            <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22, marginTop: 2 }}>Şehir bazında aktif işletme</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <TurkiyeMap dots={window.DATA.cityDots} accent="var(--super)" />
          <div style={{ display: "grid", gap: 4 }}>
            {window.DATA.cityDots.map((c, i) => {
              const total = window.DATA.cityDots.reduce((s, x) => s + x.count, 0);
              const pct = (c.count / total) * 100;
              return (
                <div key={c.city} style={{ display: "grid", gridTemplateColumns: "120px 1fr 50px", gap: 12, alignItems: "center", padding: "6px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.city}</span>
                  <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct * 3}%`, maxWidth: "100%", height: "100%", background: "var(--super)" }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, textAlign: "right", color: "var(--ink-2)" }}>{c.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlatformUsersScreen, AuditLogScreen, SystemStatusScreen, SettingsScreen, StatsScreen });
