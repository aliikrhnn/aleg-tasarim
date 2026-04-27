// ===== BUSINESSES LIST + DETAIL + NEW WIZARD =============================
const { useState: uS, useMemo: uM } = React;

function planPill(plan) {
  const map = { "Starter": "muted", "Growth": "super", "Pro": "gold", "Enterprise": "danger" };
  return <Pill tone={map[plan] || "muted"}>{plan}</Pill>;
}
function statusPill(status) {
  const map = {
    active:    { tone: "ok",    label: "AKTİF" },
    grace:     { tone: "warn",  label: "UYARI" },
    suspended: { tone: "danger",label: "ASKIDA" },
    pending:   { tone: "muted", label: "BEKLİYOR" }
  };
  const s = map[status] || map.pending;
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

function BusinessesScreen({ onNavigate, setDetailBiz }) {
  const [q, setQ] = uS("");
  const [view, setView] = uS("table");
  const [selected, setSelected] = uS(new Set());
  const D = window.DATA;

  const filtered = uM(() =>
    D.businesses.filter(b => !q || b.name.toLowerCase().includes(q.toLowerCase()) || b.owner.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const toggle = (id) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20, minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>PLATFORM · İŞLETMELER</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 46, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>
            Tüm işletmeler
            <span style={{ fontFamily: "var(--f-sans)", fontStyle: "normal", fontSize: 18, color: "var(--ink-3)", marginLeft: 14, fontWeight: 400 }}>{D.businesses.length} kayıt</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("new-business")}>+ Yeni İşletme</button>
      </div>

      {/* Filters row */}
      <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <SearchInput value={q} onChange={setQ} placeholder="İşletme, sahip veya şehir ara…" width={320} />
        <FilterChip label="PLAN" value="Hepsi" />
        <FilterChip label="DURUM" value="Aktif" active onClear={() => {}} />
        <FilterChip label="ŞEHİR" value="Hepsi" />
        <FilterChip label="KAYIT" value="Son 30 gün" />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
          {[["table", "▤"], ["card", "▦"]].map(([k, ic]) => (
            <button key={k} onClick={() => setView(k)} style={{
              width: 34, height: 32, border: "none", cursor: "pointer",
              background: view === k ? "var(--paper-2)" : "var(--card)",
              color: view === k ? "var(--ink)" : "var(--ink-3)",
              fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700
            }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "color-mix(in oklab, var(--super) 10%, var(--card))", border: "1px solid var(--super)", borderRadius: "var(--r-sm)" }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--super)", fontWeight: 700 }}>{selected.size} seçildi</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm btn-secondary">Mail at</button>
          <button className="btn btn-sm btn-secondary">Plan değiştir</button>
          <button className="btn btn-sm btn-danger">Askıya al</button>
        </div>
      )}

      {view === "table" ? (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>İşletme</th>
                <th>Sahibi</th>
                <th>Şehir</th>
                <th>Plan</th>
                <th>Durum</th>
                <th style={{ textAlign: "right" }}>Aylık Gelir</th>
                <th style={{ textAlign: "right" }}>Sipariş / 30g</th>
                <th>Son giriş</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => { setDetailBiz(b); onNavigate("business-detail"); }}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <LogoTile logo={b.logo} tint={b.tint} size={28} />
                      <div style={{ display: "grid", gap: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{b.name}</span>
                        <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{b.branches} şube</span>
                      </div>
                    </div>
                  </td>
                  <td>{b.owner}</td>
                  <td><span style={{ color: "var(--ink-2)" }}>{b.city}</span> <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>· {b.district}</span></td>
                  <td>{planPill(b.plan)}</td>
                  <td>{statusPill(b.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    {b.mrr > 0 ? <Money amount={b.mrr} size={15} /> : <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>—</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{b.orders30d.toLocaleString("tr-TR")}</span>
                  </td>
                  <td><span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{b.lastLogin}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-3)", fontFamily: "var(--f-mono)" }}>⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ padding: 16, display: "grid", gap: 12, cursor: "pointer" }} onClick={() => { setDetailBiz(b); onNavigate("business-detail"); }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  <LogoTile logo={b.logo} tint={b.tint} size={38} />
                  <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                    <span className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{b.city} · {b.district}</span>
                  </div>
                </div>
                {planPill(b.plan)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>AYLIK</div>
                  {b.mrr > 0 ? <Money amount={b.mrr} size={22} /> : <span className="font-mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>—</span>}
                </div>
                <div style={{ textAlign: "right" }}>
                  {statusPill(b.status)}
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>{b.lastLogin}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== BUSINESS DETAIL ====================================================
function BusinessDetailScreen({ biz, onBack, onNavigate }) {
  const [tab, setTab] = uS("overview");
  const b = biz || window.DATA.businesses[0];
  const tabs = [
    ["overview", "Özet"], ["users", "Kullanıcılar"], ["subscription", "Abonelik"],
    ["invoices", "Faturalar"], ["activity", "Aktivite"], ["settings", "Ayarlar"]
  ];
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      {/* Breadcrumb back */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn btn-sm btn-ghost" onClick={() => onNavigate("businesses")}>← Tüm işletmeler</button>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", minWidth: 0 }}>
            <LogoTile logo={b.logo} tint={b.tint} size={72} />
            <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>{b.name}</h1>
                {planPill(b.plan)}
                {statusPill(b.status)}
              </div>
              <div className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
                {b.id.toUpperCase()} · {b.city} · {b.district} · Sahibi: <span style={{ color: "var(--ink-2)" }}>{b.owner}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary">Mesaj gönder</button>
            <button className="btn btn-secondary">Plan değiştir</button>
            <button className="btn btn-danger">Askıya al</button>
          </div>
        </div>

        {/* Header metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          {[
            ["AYLIK GELİR", <Money amount={b.mrr || 0} size={28} />, "▲ +4% ay"],
            ["SİPARİŞ · 30G", <SerifNum size={28}>{b.orders30d}</SerifNum>, "dün: 186"],
            ["ŞUBE", <SerifNum size={28}>{b.branches}</SerifNum>, "toplam aktif"],
            ["KAYIT TARİHİ", <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>{b.joined}</span>, b.lastLogin]
          ].map(([l, v, sub], i) => (
            <div key={i} style={{ padding: "0 20px", borderLeft: i > 0 ? "1px solid var(--line)" : "none" }}>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{l}</div>
              {v}
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6, letterSpacing: "0.06em" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)" }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
            borderBottom: `2px solid ${tab === k ? "var(--super)" : "transparent"}`,
            color: tab === k ? "var(--ink)" : "var(--ink-2)",
            fontSize: 13, fontWeight: tab === k ? 600 : 500, fontFamily: "var(--f-sans)"
          }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && <BizOverview b={b} />}
      {tab !== "overview" && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 20 }}>
          {tabs.find(t => t[0] === tab)[1]} sekmesi — içerik bu bölüme göre yüklenir.
        </div>
      )}
    </div>
  );
}

function BizOverview({ b }) {
  const rev = [120, 134, 156, 142, 168, 180, 195, 210, 218, 232, 248, 260];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">CİRO · SON 12 AY</div>
            <Money amount={b.mrr * 12} size={42} />
            <div className="font-mono" style={{ fontSize: 11, color: "var(--ok)", fontWeight: 700, letterSpacing: "0.06em", marginTop: 4 }}>▲ YILLIK +34%</div>
          </div>
          <Sparkline data={rev} width={280} height={90} stroke="var(--super)" showArea />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>BUGÜN SİPARİŞ</div>
            <SerifNum size={24}>186</SerifNum>
          </div>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>BUGÜN CİRO</div>
            <Money amount={12840} size={22} />
          </div>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>ORT. FİŞ</div>
            <Money amount={69} size={22} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
        <div className="eyebrow">SON GİRİŞ YAPANLAR</div>
        {[
          ["Ayşe Demir", "Sahip", "12 dk önce"],
          ["Kaan Aksoy", "Kasiyer · Şube 1", "1 saat önce"],
          ["Melis Yıldız", "Garson · Şube 2", "2 saat önce"],
          ["Ozan T.", "Mutfak", "Dün 23:14"]
        ].map(([n, r, t], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar text={n.split(" ").map(x => x[0]).join("")} tint="var(--paper-3)" />
            <div style={{ display: "grid", gap: 0, flex: 1 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n}</span>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{r}</span>
            </div>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== NEW BUSINESS WIZARD ================================================
function NewBusinessScreen({ onNavigate }) {
  const [step, setStep] = uS(0);
  const [draft, setDraft] = uS({
    name: "", slug: "", city: "İstanbul", category: "Kafe",
    ownerName: "", ownerEmail: "", ownerPhone: "",
    plan: "growth",
    modules: { pos: true, qr: true, loyalty: false, delivery: false, ops: false, stations: false }
  });
  const steps = ["İşletme", "Sahibi", "Plan", "Modüller", "Özet"];
  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>PLATFORM · KAYIT</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1 }}>
            Yeni işletme oluştur
          </h1>
        </div>
        <button className="btn btn-ghost" onClick={() => onNavigate("businesses")}>İptal ×</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <Stepper steps={steps} current={step} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 24, display: "grid", gap: 16, minHeight: 420 }}>
          {step === 0 && <Step1Biz draft={draft} setDraft={setDraft} />}
          {step === 1 && <Step2Owner draft={draft} setDraft={setDraft} />}
          {step === 2 && <Step3Plan draft={draft} setDraft={setDraft} />}
          {step === 3 && <Step4Modules draft={draft} setDraft={setDraft} />}
          {step === 4 && <Step5Summary draft={draft} />}

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <button className="btn btn-ghost" disabled={step === 0} onClick={prev}>← Geri</button>
            <span className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>{step + 1} / {steps.length}</span>
            {step < steps.length - 1
              ? <button className="btn btn-primary" onClick={next}>Devam →</button>
              : <button className="btn btn-primary" onClick={() => onNavigate("businesses")}>Davet gönder ↗</button>}
          </div>
        </div>

        {/* Live preview */}
        <div className="card" style={{ padding: 20, display: "grid", gap: 14, background: "var(--paper-2)" }}>
          <div className="eyebrow">CANLI ÖNİZLEME</div>
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 20, color: "var(--ink)" }}>
            İşte <span style={{ color: "var(--super)" }}>{draft.name || "yeni işletme"}</span>'nin paneli…
          </div>
          <div style={{ background: "var(--card)", borderRadius: "var(--r)", border: "1px solid var(--line)", padding: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", color: "var(--card)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
                {(draft.name || "XX").substring(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "grid" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{draft.name || "İşletme adı"}</span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{draft.slug ? `${draft.slug}.aleg.cafe` : "slug.aleg.cafe"}</span>
              </div>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <Placeholder label="PANEL ÖNİZLEME" height={120} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(draft.modules).filter(([, v]) => v).map(([k]) => (
                <Pill key={k} tone="super">{k}</Pill>
              ))}
              {Object.values(draft.modules).filter(Boolean).length === 0 && (
                <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>— modül seçilmedi</span>
              )}
            </div>
          </div>
          <div style={{ paddingTop: 10, borderTop: "1px dashed var(--line-2)" }}>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>PLAN</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 28 }}>
                {({ starter: "Starter", growth: "Growth", pro: "Pro", ent: "Enterprise" })[draft.plan]}
              </span>
              <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· 14 gün deneme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, children, hint }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="eyebrow" style={{ fontSize: 9.5 }}>{label}</span>
      {children}
      {hint && <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{hint}</span>}
    </label>
  );
}

function Step1Biz({ draft, setDraft }) {
  const cities = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Eskişehir", "Muğla", "Trabzon"];
  return (
    <>
      <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>İşletme bilgileri</div>
      <FormRow label="İŞLETME ADI">
        <input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="örn. Karaköy Kahve Evi" />
      </FormRow>
      <FormRow label="SLUG / ALT DOMAİN" hint="karakoy-kahve.aleg.cafe adresi olarak kullanılacak">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input className="input" style={{ flex: 1 }} value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} placeholder="karakoy-kahve" />
          <span className="font-mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>.aleg.cafe</span>
        </div>
      </FormRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormRow label="ŞEHİR">
          <select className="input" value={draft.city} onChange={e => setDraft({ ...draft, city: e.target.value })}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </FormRow>
        <FormRow label="KATEGORİ">
          <select className="input" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
            {["Kafe", "Restoran", "Pastane", "Roastery", "Çay Bahçesi"].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormRow>
      </div>
    </>
  );
}

function Step2Owner({ draft, setDraft }) {
  return (
    <>
      <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>Sahibi</div>
      <FormRow label="AD SOYAD">
        <input className="input" value={draft.ownerName} onChange={e => setDraft({ ...draft, ownerName: e.target.value })} placeholder="örn. Ayşe Demir" />
      </FormRow>
      <FormRow label="E-POSTA" hint="Davet bağlantısı bu adrese gönderilecek">
        <input className="input" type="email" value={draft.ownerEmail} onChange={e => setDraft({ ...draft, ownerEmail: e.target.value })} placeholder="ayse@karakoykahve.com" />
      </FormRow>
      <FormRow label="TELEFON">
        <input className="input" value={draft.ownerPhone} onChange={e => setDraft({ ...draft, ownerPhone: e.target.value })} placeholder="+90 5xx xxx xx xx" />
      </FormRow>
    </>
  );
}

function Step3Plan({ draft, setDraft }) {
  const plans = window.DATA.plans;
  return (
    <>
      <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>Plan seçimi</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {plans.map(p => {
          const active = draft.plan === p.id;
          return (
            <button key={p.id} onClick={() => setDraft({ ...draft, plan: p.id })} style={{
              padding: 16, textAlign: "left", cursor: "pointer",
              border: active ? "1.5px solid var(--super)" : "1px solid var(--line-2)",
              borderRadius: "var(--r)",
              background: active ? "color-mix(in oklab, var(--super) 8%, var(--card))" : "var(--card)",
              display: "grid", gap: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>{p.name}</div>
                {p.featured && <Pill tone="gold">POPÜLER</Pill>}
              </div>
              <Money amount={p.monthly} size={28} />
              <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
                MAX {p.maxBranches} ŞUBE · {p.modules} MODÜL · {p.maxTeam} KULLANICI
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step4Modules({ draft, setDraft }) {
  const modules = [
    { id: "pos", label: "POS & Sipariş", desc: "Kasa ekranı, bar, mutfak" },
    { id: "qr", label: "QR Menü", desc: "Müşteri sipariş ve menü" },
    { id: "loyalty", label: "Sadakat", desc: "Puan, kampanya, üyelik" },
    { id: "delivery", label: "Paket Servis", desc: "Telefon siparişi + kurye" },
    { id: "ops", label: "Ops Ekranı", desc: "Mutfak/bar istasyon ekranı" },
    { id: "stations", label: "Çoklu İstasyon", desc: "Bar, espresso, mutfak" }
  ];
  const toggle = (k) => setDraft({ ...draft, modules: { ...draft.modules, [k]: !draft.modules[k] } });
  return (
    <>
      <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>Modül seçimi</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {modules.map(m => {
          const on = draft.modules[m.id];
          return (
            <button key={m.id} onClick={() => toggle(m.id)} style={{
              padding: 14, textAlign: "left", cursor: "pointer",
              border: on ? "1.5px solid var(--super)" : "1px solid var(--line-2)",
              borderRadius: "var(--r-sm)",
              background: on ? "color-mix(in oklab, var(--super) 10%, var(--card))" : "var(--card)",
              display: "grid", gap: 2
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: on ? "var(--super)" : "var(--ink-3)" }}>{on ? "✓" : "○"}</span>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{m.desc}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step5Summary({ draft }) {
  return (
    <>
      <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 22 }}>Özet</div>
      <dl style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 8, columnGap: 14, margin: 0 }}>
        {[
          ["İşletme", draft.name || "—"],
          ["Slug", draft.slug ? `${draft.slug}.aleg.cafe` : "—"],
          ["Şehir", draft.city],
          ["Kategori", draft.category],
          ["Sahibi", draft.ownerName || "—"],
          ["E-posta", draft.ownerEmail || "—"],
          ["Telefon", draft.ownerPhone || "—"],
          ["Plan", ({ starter: "Starter · ₺399/ay", growth: "Growth · ₺999/ay", pro: "Pro · ₺2.499/ay", ent: "Enterprise · ₺7.499/ay" })[draft.plan]],
          ["Modüller", Object.entries(draft.modules).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"],
        ].map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="eyebrow" style={{ fontSize: 10, color: "var(--ink-3)", paddingTop: 4 }}>{k}</dt>
            <dd style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
      <div style={{ marginTop: 8, padding: 12, background: "color-mix(in oklab, var(--super) 8%, transparent)", borderRadius: "var(--r-sm)", border: "1px dashed var(--super)" }}>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--super)", fontWeight: 700, letterSpacing: "0.06em" }}>
          DAVET E-POSTA İLE GÖNDERİLECEK · 14 GÜNLÜK PRO DENEME
        </span>
      </div>
    </>
  );
}

// ===== PENDING / SUSPENDED lists (simple filtered views) ==================
function PendingBusinessesScreen() {
  const list = window.DATA.businesses.filter(b => b.status === "pending");
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">BEKLEYEN</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em" }}>Onay bekleyen işletmeler</h1>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>Yeni kayıt olan ve manuel onay gerektiren işletmeler.</p>
      </div>
      <div className="card">
        {list.map((b, i) => (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 16, padding: 16, borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none" }}>
            <LogoTile logo={b.logo} tint={b.tint} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
              <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{b.owner} · {b.city} · kayıt: {b.joined}</div>
            </div>
            <button className="btn btn-secondary btn-sm">İncele</button>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm btn-danger">Reddet</button>
              <button className="btn btn-sm btn-primary">Onayla</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuspendedBusinessesScreen() {
  const list = window.DATA.businesses.filter(b => b.status === "suspended" || b.status === "grace");
  return (
    <div style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow" style={{ color: "var(--danger)" }}>ASKIDA · UYARI</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em" }}>Askıya alınanlar</h1>
      </div>
      <div className="card">
        {list.map((b, i) => (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 16, padding: 16, borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none" }}>
            <LogoTile logo={b.logo} tint={b.tint} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
              <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{b.owner} · son giriş: {b.lastLogin}</div>
            </div>
            {statusPill(b.status)}
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm btn-secondary">Mesaj</button>
              <button className="btn btn-sm btn-primary">Tekrar aç</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BusinessesScreen, BusinessDetailScreen, NewBusinessScreen, PendingBusinessesScreen, SuspendedBusinessesScreen });
