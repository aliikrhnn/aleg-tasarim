// ===== BILLING: Plans, Invoices, Payments, Pending =========================
const { useState: bS } = React;

function PlansScreen() {
  const plans = window.DATA.plans;
  const totalRev = plans.reduce((s, p) => s + p.users * p.monthly, 0);
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow">ABONELİK · PLANLAR</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Planlar</h1>
          <p style={{ color: "var(--ink-2)", marginTop: 8 }}>
            Toplam <strong style={{ color: "var(--ink)" }}>201 aktif abonelik</strong> · aylık tekrarlayan gelir <Money amount={totalRev} size={18} />
          </p>
        </div>
        <button className="btn btn-primary">+ Yeni plan</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {plans.map(p => (
          <div key={p.id} className="card" style={{
            padding: 22, display: "grid", gap: 14,
            position: "relative", overflow: "hidden",
            borderColor: p.featured ? "var(--gold)" : "var(--line)",
            borderWidth: p.featured ? 1.5 : 1
          }}>
            {p.featured && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <Pill tone="gold">POPÜLER</Pill>
              </div>
            )}
            <div>
              <div className="eyebrow" style={{ color: "var(--ink-3)" }}>PLAN</div>
              <h2 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4 }}>
                {p.name}
              </h2>
            </div>
            <div>
              <Money amount={p.monthly} size={40} />
              <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em", marginTop: 2 }}>
                / AY · YILLIK ₺{p.yearly.toLocaleString("tr-TR")}
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              {[
                ["MAKS. ŞUBE", p.maxBranches === 99 ? "Sınırsız" : p.maxBranches],
                ["MAKS. ÜRÜN", p.maxProducts === 9999 ? "Sınırsız" : p.maxProducts],
                ["MAKS. EKİP", p.maxTeam === 99 ? "Sınırsız" : p.maxTeam],
                ["MODÜL", p.modules]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div>
                <SerifNum size={20} tone="var(--super)">{p.users}</SerifNum>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", marginLeft: 4 }}>İŞLETME</span>
              </div>
              <button className="btn btn-sm btn-secondary">Düzenle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicesScreen() {
  const [q, setQ] = bS("");
  const inv = window.DATA.invoices;
  const paid = inv.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending = inv.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const failed = inv.filter(i => i.status === "failed").reduce((s, i) => s + i.amount, 0);

  const sMap = { paid: { t: "ok", l: "ÖDENDİ" }, pending: { t: "warn", l: "BEKLİYOR" }, failed: { t: "danger", l: "BAŞARISIZ" } };

  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">FİNANS · FATURALAR</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Faturalar</h1>
      </div>

      {/* Financial summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow">BU AY · TOPLAM</div>
          <Money amount={paid + pending + failed} size={36} />
          <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{inv.length} fatura</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ color: "var(--ok)" }}>TAHSİL EDİLEN</div>
          <Money amount={paid} size={36} tone="var(--ok)" />
          <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{inv.filter(i => i.status === "paid").length} ödeme</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ color: "var(--warn)" }}>BEKLEYEN</div>
          <Money amount={pending} size={36} tone="var(--warn)" />
          <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{inv.filter(i => i.status === "pending").length} fatura</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ color: "var(--danger)" }}>BAŞARISIZ</div>
          <Money amount={failed} size={36} tone="var(--danger)" />
          <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{inv.filter(i => i.status === "failed").length} fatura · tekrar dene</div>
        </div>
      </div>

      <div className="card" style={{ padding: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <SearchInput value={q} onChange={setQ} placeholder="Fatura no veya işletme ara…" width={320} />
        <FilterChip label="DURUM" value="Hepsi" />
        <FilterChip label="DÖNEM" value="Nis 2026" active />
        <FilterChip label="YÖNTEM" value="Hepsi" />
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary btn-sm">CSV dışa aktar</button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Fatura No</th>
              <th>İşletme</th>
              <th>Dönem</th>
              <th style={{ textAlign: "right" }}>Tutar</th>
              <th>Durum</th>
              <th>Yöntem</th>
              <th>Tarih</th>
              <th style={{ width: 120 }}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {inv.filter(i => !q || i.id.toLowerCase().includes(q.toLowerCase()) || i.business.toLowerCase().includes(q.toLowerCase())).map(i => (
              <tr key={i.id}>
                <td><span className="font-mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>{i.id}</span></td>
                <td style={{ fontWeight: 500 }}>{i.business}</td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{i.period}</span></td>
                <td style={{ textAlign: "right" }}><Money amount={i.amount} size={15} /></td>
                <td><Pill tone={sMap[i.status].t}>{sMap[i.status].l}</Pill></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{i.method}</span></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{i.date}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-sm btn-ghost" title="PDF indir">PDF</button>
                    {i.status !== "paid" && <button className="btn btn-sm btn-secondary">Hatırlat</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsScreen() {
  const paid = window.DATA.invoices.filter(i => i.status === "paid");
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">FİNANS · ÖDEMELER</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Ödemeler</h1>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr><th>Fatura</th><th>İşletme</th><th style={{ textAlign: "right" }}>Tutar</th><th>Yöntem</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            {paid.map(p => (
              <tr key={p.id}>
                <td><span className="font-mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{p.id}</span></td>
                <td>{p.business}</td>
                <td style={{ textAlign: "right" }}><Money amount={p.amount} size={15} tone="var(--ok)" /></td>
                <td><span className="font-mono" style={{ fontSize: 11 }}>{p.method}</span></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.date}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingPaymentsScreen() {
  const pend = window.DATA.pendingPayments;
  const total = pend.reduce((s, p) => s + p.amount, 0);
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>KRİTİK · BEKLEYEN ÖDEMELER</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>Bekleyen ödemeler</h1>
          <p style={{ color: "var(--ink-2)", marginTop: 8 }}>
            Toplam <Money amount={total} size={18} tone="var(--accent)" /> · {pend.length} işletme
          </p>
        </div>
        <button className="btn btn-primary">Toplu hatırlatma</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {pend.map((p, i) => (
          <div key={i} className="card" style={{ padding: 20, display: "grid", gap: 14, borderLeft: "3px solid var(--accent)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LogoTile logo={p.logo} tint="var(--accent)" size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{p.business}</div>
                <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{p.invoice}</div>
              </div>
              <Pill tone={p.days > 7 ? "danger" : "warn"}>{p.days} gün</Pill>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>TUTAR</div>
                <Money amount={p.amount} size={32} tone="var(--accent)" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-sm btn-secondary">Hatırlat</button>
                <button className="btn btn-sm btn-danger">Askıya al</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PlansScreen, InvoicesScreen, PaymentsScreen, PendingPaymentsScreen });
