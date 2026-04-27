// Reviews, Bar Screen, Modules & License, rewritten Branches (CRUD + hours), QR (rewrite).

/* ============ QR helpers =============
   Uses `qrcode-generator` (exposed as global `qrcode` fn). We wrap it in
   utilities that return data URLs and React canvas renderers.            */
const _qrMatrix = (value, level="M") => {
  if (typeof window.qrcode !== "function") return null;
  try {
    const q = window.qrcode(0, level); // type 0 = auto-size
    q.addData(value);
    q.make();
    return q;
  } catch(e) { console.warn("QR build failed", e); return null; }
};

// Paint a qrcode-generator matrix into a canvas.
const _paintQR = (canvas, q, { size=220, dark="#1A1410", light="#FFFCF4", margin=2 } = {}) => {
  const count = q.getModuleCount();
  const total = count + margin*2;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr; canvas.height = size * dpr;
  canvas.style.width = size + "px"; canvas.style.height = size + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = light; ctx.fillRect(0, 0, size, size);
  const cell = size / total;
  ctx.fillStyle = dark;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (q.isDark(r, c)) {
        ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell + 0.6, cell + 0.6);
      }
    }
  }
};

const QRCanvas = ({value, size=220, dark="#1A1410", light="#FFFCF4", level="M"}) => {
  const ref = React.useRef(null);
  React.useEffect(()=>{
    if (!ref.current) return;
    const q = _qrMatrix(value, level);
    if (!q) return;
    _paintQR(ref.current, q, {size, dark, light});
  }, [value, size, dark, light, level]);
  return <canvas ref={ref} style={{width:size, height:size, borderRadius:4, display:"block"}}/>;
};

// Produce a PNG data URL at a given pixel size
const qrDataUrl = (value, opts={}) => {
  const q = _qrMatrix(value, opts.level || "M");
  if (!q) return "";
  const c = document.createElement("canvas");
  _paintQR(c, q, { size: opts.width || 420, dark: opts.dark || "#1A1410", light: opts.light || "#FFFCF4" });
  return c.toDataURL("image/png");
};

/* ============ QR SCREEN — tied to real tables & zones ============ */
const QRScreen = ({t, lang, branches, tables = [], zones = []}) => {
  const [branchId, setBranchId] = React.useState(branches[0]?.id);
  const branch = branches.find(b=>b.id===branchId) || branches[0];
  const [zoneF, setZoneF] = React.useState("all");
  const [design, setDesign] = React.useState("classic");
  const [verification, setVerification] = React.useState("open");
  const [selected, setSelected] = React.useState(() => new Set(tables.map(tb => tb.id)));
  const [copiedId, setCopiedId] = React.useState(null);
  const [previewTable, setPreviewTable] = React.useState(null);

  // When tables prop changes, keep selection in sync (add new tables, drop removed)
  React.useEffect(() => {
    setSelected(prev => {
      const ids = new Set(tables.map(tb => tb.id));
      const next = new Set();
      prev.forEach(id => { if (ids.has(id)) next.add(id); });
      // auto-include any newly added tables
      tables.forEach(tb => { if (!prev.has(tb.id) && prev.size === 0) return; next.add(tb.id); });
      return next.size ? next : new Set(ids);
    });
  }, [tables.length]);

  const zonesShown = zones.length ? zones : [{id:"_all", name:{tr:"Tümü",en:"All"}, color:"var(--accent)"}];
  const tablesByZone = zonesShown.map(z => ({
    zone: z,
    items: tables.filter(tb => tb.zone === z.id),
  })).filter(g => g.items.length);

  const visibleTables = zoneF === "all" ? tables : tables.filter(tb => tb.zone === zoneF);
  const selectedTables = tables.filter(tb => selected.has(tb.id));

  const toggleAll = (on) => {
    setSelected(prev => {
      const next = new Set(prev);
      visibleTables.forEach(tb => on ? next.add(tb.id) : next.delete(tb.id));
      return next;
    });
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const urlFor = (tb) => {
    const zone = zones.find(z => z.id === tb.zone);
    const zoneSlug = zone ? (zone.name.en || zone.name.tr).toLowerCase().replace(/[^a-z0-9]/g,"") : "";
    const tableSlug = String(tb.name).toLowerCase().replace(/\s+/g, "-");
    const v = verification==="code" ? "&v=code" : verification==="staff" ? "&v=staff" : "";
    return `https://menu.aleg.cafe/${branch?.slug || "branch"}/${zoneSlug}/${tableSlug}?t=${tb.id}${v}`;
  };

  const copyLink = async (tb) => {
    try {
      await navigator.clipboard.writeText(urlFor(tb));
      setCopiedId(tb.id);
      setTimeout(()=>setCopiedId(null), 1400);
    } catch(_) {}
  };

  const downloadPng = async (tb) => {
    const zone = zones.find(z => z.id === tb.zone);
    const canvas = document.createElement("canvas");
    const S = 720;
    canvas.width = S; canvas.height = S + 180;
    const ctx = canvas.getContext("2d");
    const bg = design==="midnight"?"#1A1410" : design==="coral"?"#C4553A" : "#FFFCF4";
    const fg = design==="midnight"?"#FFFCF4" : design==="coral"?"#FFFCF4" : "#1A1410";
    ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);

    const qrSize = S - 80;
    const tmp = document.createElement("canvas");
    const q = _qrMatrix(urlFor(tb), "M");
    if (q) _paintQR(tmp, q, { size: qrSize, dark: "#1A1410", light: "#FFFCF4" });
    let qx = 40, qy = 40;
    if (design !== "minimal") {
      const pad = 28, sq = qrSize + pad*2;
      ctx.fillStyle = "#FFFCF4";
      ctx.fillRect((S-sq)/2, 40, sq, sq);
      qx = (S - qrSize)/2; qy = 40 + pad;
    }
    ctx.drawImage(tmp, qx, qy, qrSize, qrSize);

    ctx.fillStyle = fg;
    ctx.font = "italic 500 52px 'Bricolage Grotesque', serif";
    ctx.textAlign = "center";
    ctx.fillText("Aleg", S/2, S + 54);
    if (zone) {
      ctx.font = "500 14px 'DM Mono', monospace";
      ctx.fillStyle = design==="minimal" ? (zone.color || "#8C7A69") : fg;
      ctx.fillText(zone.name[lang].toUpperCase() + " · " + (lang==="tr"?"MASA":"TABLE") + " " + tb.name, S/2, S + 88);
    }
    ctx.font = "400 13px 'DM Mono', monospace";
    ctx.fillStyle = design==="minimal" ? "#8C7A69" : fg;
    ctx.fillText(urlFor(tb).replace("https://",""), S/2, S + 118);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `aleg-${branch?.slug||"branch"}-${tb.name}.png`;
    a.click();
  };

  const printAll = async () => {
    const list = selectedTables.length ? selectedTables : tables;
    const data = list.map(tb => {
      const zone = zones.find(z => z.id === tb.zone);
      return { tb, zone, url: urlFor(tb), img: qrDataUrl(urlFor(tb), { width: 480 }) };
    });
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return alert("Please allow popups.");
    const cardStyle = design==="midnight"
      ? "background:#1A1410;color:#FFFCF4;"
      : design==="coral"
      ? "background:#C4553A;color:#FFFCF4;"
      : "background:#FFFCF4;color:#1A1410;border:1px solid #E7DFD2;";
    const plateStyle = design==="minimal" ? "" : "background:#FFFCF4;padding:10px;border-radius:6px;";
    const cards = data.map(d => `
      <div class="card" style="${cardStyle}">
        <div class="brand">Aleg</div>
        <div class="sub">${d.zone ? d.zone.name[lang] + " · " : ""}${lang==="tr"?"Masa":"Table"} ${d.tb.name}</div>
        <div class="qr" style="${plateStyle}"><img src="${d.img}"/></div>
        <div class="url">${d.url.replace("https://","")}</div>
        <div class="scan">${lang==="tr"?"Menüyü aç, sipariş ver":"Scan to order"}</div>
      </div>`).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
      <title>Aleg QR · ${branch?.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        @page { size: A4; margin: 12mm; }
        body { margin:0; font-family: 'DM Mono', ui-monospace, monospace; background:#F4EEE2; }
        .grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 14mm; padding: 6mm; }
        .card { padding: 18mm 14mm; border-radius: 8px; display:flex; flex-direction:column; align-items:center; gap:8mm; page-break-inside: avoid; }
        .brand { font-family: 'Bricolage Grotesque', serif; font-style: italic; font-size: 40px; font-weight:500; letter-spacing:-0.02em; }
        .sub { font-size: 12px; letter-spacing:.16em; text-transform:uppercase; opacity:.75; }
        .qr img { width: 100%; display:block; max-width: 66mm; }
        .qr { width: 66mm; }
        .url { font-size:10px; opacity:.6; letter-spacing:.04em; }
        .scan { font-size:9.5px; letter-spacing:.2em; text-transform:uppercase; opacity:.55; }
      </style></head><body>
      <div class="grid">${cards}</div>
      <script>setTimeout(()=>window.print(), 400);<\/script>
      </body></html>`);
    w.document.close();
  };

  const designs = [
    {id:"minimal",  name:lang==="tr"?"Minimal":"Minimal"},
    {id:"classic",  name:lang==="tr"?"Klasik":"Classic"},
    {id:"midnight", name:lang==="tr"?"Gece":"Midnight"},
    {id:"coral",    name:lang==="tr"?"Mercan":"Coral"},
  ];

  const CardBody = ({tb}) => {
    const url = urlFor(tb);
    const zone = zones.find(z => z.id === tb.zone);
    if (design === "minimal") {
      return (
        <div style={{background:"var(--card)",border:"1px solid var(--line)",borderRadius:12,padding:16,
          display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{alignSelf:"stretch",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:10,letterSpacing:".14em",fontFamily:"var(--font-mono)",
              color:zone?.color||"var(--ink-3)",textTransform:"uppercase",fontWeight:600}}>
              {zone?.name[lang]} · {tb.name}
            </div>
            <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:15,fontWeight:500}}>Aleg</div>
          </div>
          <QRCanvas value={url} size={150}/>
        </div>
      );
    }
    if (design === "midnight") {
      return (
        <div style={{background:"#1A1410",color:"#FFFCF4",borderRadius:12,padding:18,
          display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:24,fontWeight:500}}>Aleg</div>
          <div style={{padding:8,background:"#FFFCF4",borderRadius:8}}><QRCanvas value={url} size={140}/></div>
          <div style={{fontSize:10,letterSpacing:".16em",opacity:.75,fontFamily:"var(--font-mono)",textTransform:"uppercase"}}>
            {zone?.name[lang]} · {lang==="tr"?"Masa":"Table"} {tb.name}
          </div>
        </div>
      );
    }
    if (design === "coral") {
      return (
        <div style={{background:"var(--accent)",color:"#FFFCF4",borderRadius:12,padding:18,
          display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:22,textAlign:"center"}}>Scan · Sip · Savor</div>
          <div style={{padding:8,background:"#FFFCF4",borderRadius:8}}><QRCanvas value={url} size={140} dark="#1A1410"/></div>
          <div style={{fontSize:10,letterSpacing:".16em",opacity:.9,fontFamily:"var(--font-mono)",textTransform:"uppercase"}}>
            {zone?.name[lang]} · {tb.name}
          </div>
        </div>
      );
    }
    return (
      <div style={{background:"var(--card)",border:"1px solid var(--line)",borderRadius:12,padding:16,
        display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:20,fontWeight:500}}>Aleg</div>
        <div style={{fontSize:9,letterSpacing:".22em",fontFamily:"var(--font-mono)",
          color:zone?.color||"var(--ink-3)",textTransform:"uppercase",fontWeight:600,marginTop:-4}}>
          {zone?.name[lang]} · {tb.name}
        </div>
        <QRCanvas value={url} size={150}/>
      </div>
    );
  };

  // ── Table-linked list ──
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("nav_qr")}
        sub={lang==="tr"
          ? "Her masa kendi QR kodunu alır. Bölgeye göre filtrele, tasarımını seç, tek tek ya da toplu bas."
          : "Every table gets its own QR. Filter by zone, pick a design, print one or all at once."}
        actions={<>
          <Button variant="soft" icon="printer" onClick={printAll}>
            {selected.size ? `${selected.size} ${lang==="tr"?"seçileni yazdır":"selected · print"}` : t("printAll")}
          </Button>
        </>}
      />

      {tables.length === 0 ? (
        <div style={{padding:"60px 24px",textAlign:"center",background:"var(--paper-2)",
          borderRadius:16,border:"1px dashed var(--line-2)"}}>
          <div style={{fontSize:30,fontFamily:"var(--font-display)",fontStyle:"italic",
            fontWeight:500,marginBottom:8,letterSpacing:"-0.02em"}}>
            {lang==="tr"?"Önce masa ekleyin":"Add a table first"}
          </div>
          <div style={{fontSize:13,color:"var(--ink-2)",maxWidth:420,margin:"0 auto 14px",lineHeight:1.5}}>
            {lang==="tr"
              ? "Masalar ekranında bölgeleri ve masaları oluşturun. Her eklediğiniz masa otomatik olarak burada QR kodu için listelenir."
              : "Create zones and tables from the Tables screen. Every table you add shows up here automatically with its own QR code."}
          </div>
        </div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:16}}>
          {/* Settings panel */}
          <div style={{display:"grid",gap:14,alignContent:"start"}}>
            <Card>
              <div style={{display:"grid", gap:14}}>
                <Field label={t("nav_branches")}>
                  <Select value={branchId} onChange={e=>setBranchId(e.target.value)}>
                    {branches.map(b=>(<option key={b.id} value={b.id}>{b.name}</option>))}
                  </Select>
                </Field>
                <Field label={lang==="tr"?"Doğrulama":"Verification"}>
                  <Select value={verification} onChange={e=>setVerification(e.target.value)}>
                    <option value="open">{lang==="tr"?"Açık (herkes)":"Open (anyone)"}</option>
                    <option value="code">{lang==="tr"?"Masa kodu gerekli":"Table code required"}</option>
                    <option value="staff">{lang==="tr"?"Personel onayı":"Staff approval"}</option>
                  </Select>
                </Field>
                <Field label={lang==="tr"?"Stil":"Style"}>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
                    {designs.map(d=>(
                      <button key={d.id} onClick={()=>setDesign(d.id)} style={{
                        padding:"10px 12px", borderRadius:8, fontSize:12, fontWeight:600,
                        background: design===d.id?"var(--accent)":"var(--paper-2)",
                        color: design===d.id?"#FFF8EC":"var(--ink-2)",
                        border:`1px solid ${design===d.id?"var(--accent)":"var(--line)"}`
                      }}>{d.name}</button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>
            <Card>
              <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
                color:"var(--ink-3)",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>
                {lang==="tr"?"Özet":"Summary"}
              </div>
              <div style={{display:"grid",gap:8,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--ink-2)"}}>{lang==="tr"?"Toplam masa":"Total tables"}</span>
                  <span style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontWeight:600}}>{tables.length}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--ink-2)"}}>{lang==="tr"?"Bölge":"Zones"}</span>
                  <span style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontWeight:600}}>{tablesByZone.length}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid var(--line)"}}>
                  <span style={{color:"var(--accent)",fontWeight:600}}>{lang==="tr"?"Seçili":"Selected"}</span>
                  <span style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontWeight:600,color:"var(--accent)"}}>
                    {selected.size} / {tables.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main list grouped by zone */}
          <div style={{display:"grid",gap:14}}>
            {/* Zone filter chips */}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={()=>setZoneF("all")} style={{
                padding:"7px 14px", borderRadius:999, border:"1px solid var(--line)",
                background: zoneF==="all"?"var(--ink)":"var(--card)",
                color: zoneF==="all"?"var(--paper)":"var(--ink)",
                fontSize:12.5, fontWeight:600, cursor:"pointer"}}>
                {lang==="tr"?"Tüm bölgeler":"All zones"} <span style={{opacity:.7,marginLeft:4,fontFamily:"var(--font-mono)"}}>{tables.length}</span>
              </button>
              {zonesShown.map(z => {
                const n = tables.filter(tb=>tb.zone===z.id).length;
                if (!n) return null;
                const on = zoneF === z.id;
                return (
                  <button key={z.id} onClick={()=>setZoneF(z.id)} style={{
                    padding:"7px 14px", borderRadius:999, border:`1px solid ${on?z.color:"var(--line)"}`,
                    background: on?`${z.color}15`:"var(--card)",
                    color: on?z.color:"var(--ink)",
                    fontSize:12.5, fontWeight:600, cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:6}}>
                    <span style={{width:8,height:8,borderRadius:2,background:z.color}}/>
                    {z.name[lang]}
                    <span style={{opacity:.7,marginLeft:2,fontFamily:"var(--font-mono)"}}>{n}</span>
                  </button>
                );
              })}
              <div style={{flex:1}}/>
              <button onClick={()=>toggleAll(true)} style={{
                padding:"7px 12px",borderRadius:8,border:"1px solid var(--line)",
                background:"var(--card)",fontSize:12,fontWeight:600,color:"var(--ink-2)",cursor:"pointer"}}>
                {lang==="tr"?"Tümünü seç":"Select all"}
              </button>
              <button onClick={()=>toggleAll(false)} style={{
                padding:"7px 12px",borderRadius:8,border:"1px solid var(--line)",
                background:"var(--card)",fontSize:12,fontWeight:600,color:"var(--ink-2)",cursor:"pointer"}}>
                {lang==="tr"?"Temizle":"Clear"}
              </button>
            </div>

            {/* Grouped by zone rows */}
            <div style={{display:"grid",gap:18}}>
              {(zoneF==="all" ? zonesShown : zonesShown.filter(z=>z.id===zoneF)).map(z => {
                const items = tables.filter(tb=>tb.zone===z.id);
                if (!items.length) return null;
                return (
                  <div key={z.id}>
                    <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
                      <div style={{width:8,height:8,borderRadius:2,background:z.color}}/>
                      <div style={{fontSize:12,fontFamily:"var(--font-mono)",
                        letterSpacing:".14em",textTransform:"uppercase",fontWeight:600,color:z.color}}>
                        {z.name[lang]}
                      </div>
                      <div style={{fontSize:11,color:"var(--ink-3)"}}>
                        {items.length} {lang==="tr"?"masa":"tables"}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
                      {items.map(tb => {
                        const isSel = selected.has(tb.id);
                        return (
                          <div key={tb.id} style={{position:"relative",
                            opacity: isSel ? 1 : .5,
                            transition:"opacity .15s"}}>
                            <CardBody tb={tb}/>
                            {/* row of actions */}
                            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                              <label style={{display:"inline-flex",alignItems:"center",gap:6,
                                fontSize:11,color:"var(--ink-2)",cursor:"pointer",
                                fontFamily:"var(--font-mono)",fontWeight:600}}>
                                <input type="checkbox" checked={isSel} onChange={()=>toggleOne(tb.id)}
                                  style={{accentColor:"var(--accent)",cursor:"pointer"}}/>
                                {lang==="tr"?"Seç":"Pick"}
                              </label>
                              <div style={{flex:1}}/>
                              <button onClick={()=>copyLink(tb)} title={t("copyLink")}
                                style={{width:28,height:28,borderRadius:7,border:"1px solid var(--line)",
                                  background:"var(--card-2)",color:"var(--ink-2)",cursor:"pointer",
                                  display:"grid",placeItems:"center"}}>
                                <Icon name={copiedId===tb.id?"check":"copy"} size={12}/>
                              </button>
                              <button onClick={()=>downloadPng(tb)} title="PNG"
                                style={{width:28,height:28,borderRadius:7,border:"1px solid var(--line)",
                                  background:"var(--card-2)",color:"var(--ink-2)",cursor:"pointer",
                                  display:"grid",placeItems:"center"}}>
                                <Icon name="download" size={12}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============ REVIEWS ============ */
const Stars = ({value, size=14, color="#C4553A"}) => (
  <div style={{display:"inline-flex",gap:2}}>
    {[1,2,3,4,5].map(i => (
      <Icon key={i} name="star" size={size}
        stroke={i<=value?color:"var(--line-2)"}
        style={{fill: i<=value?color:"transparent"}}/>
    ))}
  </div>
);

const Reviews = ({t, lang, reviews, setReviews, branches}) => {
  const [filter, setFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [replyingId, setReplyingId] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");

  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : "—";
  const dist = [5,4,3,2,1].map(n => ({n, count: reviews.filter(r=>r.rating===n).length}));
  const pendingCount = reviews.filter(r=>r.status==="pending").length;
  const flaggedCount = reviews.filter(r=>r.flagged).length;

  const match = (r) => {
    if (branchFilter!=="all" && r.branch!==branchFilter) return false;
    if (search && !((r.body[lang]||"").toLowerCase().includes(search.toLowerCase())
       || r.author.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filter==="all") return true;
    if (filter==="positive") return r.rating>=4;
    if (filter==="negative") return r.rating<=3;
    if (filter==="unanswered") return !r.reply;
    if (filter==="flagged") return r.flagged;
    return true;
  };
  const visible = reviews.filter(match);

  const sendReply = (r) => {
    if (!replyText.trim()) return;
    setReviews(reviews.map(x => x.id===r.id
      ? {...x, reply:{tr:replyText, en:replyText}, status:"replied"}
      : x));
    setReplyingId(null); setReplyText("");
  };
  const toggleFlag = (r) => setReviews(reviews.map(x => x.id===r.id ? {...x, flagged:!x.flagged, status: !x.flagged?"flagged":"pending"} : x));
  const resolve = (r) => setReviews(reviews.map(x => x.id===r.id ? {...x, status:"resolved", flagged:false} : x));

  const statusTone = s => ({replied:"ok", pending:"warn", flagged:"danger", resolved:"muted"}[s]||"muted");
  const statusLabel = s => ({replied:t("replied"), pending:t("pending"), flagged:t("flagged"), resolved:t("resolved")}[s]||s);

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_reviews")}
        title={t("reviewsTitle")}
        sub={t("reviewsSub")}
      />

      {/* Summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.3fr 1fr 1fr",gap:14}}>
        <Card pad={20}>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:500}}>{t("avgRating")}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:10}}>
            <div style={{fontSize:44,fontWeight:500,letterSpacing:"-0.03em",
              fontFamily:"var(--font-display,'Bricolage Grotesque')",lineHeight:1,color:"var(--accent)"}}>{avg}</div>
            <div style={{fontSize:14,color:"var(--ink-3)"}}>/ 5</div>
          </div>
          <div style={{marginTop:8}}><Stars value={Math.round(+avg)} size={16}/></div>
          <div style={{fontSize:11,color:"var(--ink-3)",marginTop:4,fontFamily:"var(--font-mono)"}}>
            {reviews.length} {t("reviewsCount").toLowerCase()}
          </div>
        </Card>
        <Card pad={20}>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
            {lang==="tr"?"Dağılım":"Distribution"}
          </div>
          <div style={{display:"grid",gap:4}}>
            {dist.map(d => {
              const pct = reviews.length ? d.count/reviews.length*100 : 0;
              return (
                <div key={d.n} style={{display:"grid",gridTemplateColumns:"28px 1fr 32px",gap:8,alignItems:"center"}}>
                  <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--ink-2)",fontWeight:600}}>{d.n}★</div>
                  <div style={{height:6,background:"var(--paper-3)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:d.n>=4?"var(--ok)":d.n>=3?"var(--warn)":"var(--danger)",borderRadius:3,transition:"width .3s"}}/>
                  </div>
                  <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--ink-3)",textAlign:"right"}}>{d.count}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card pad={20}>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:500}}>{t("pending")}</div>
          <div style={{fontSize:44,fontWeight:500,letterSpacing:"-0.03em",
            fontFamily:"var(--font-display,'Bricolage Grotesque')",lineHeight:1,marginTop:10}}>{pendingCount}</div>
          <div style={{fontSize:11,color:"var(--ink-3)",marginTop:8}}>
            {lang==="tr"?"Müşteri cevap bekliyor":"Awaiting a reply"}
          </div>
        </Card>
        <Card pad={20} style={flaggedCount?{background:"rgba(184,74,58,.06)",borderColor:"rgba(184,74,58,.25)"}:{}}>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--danger)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:500}}>{t("flagged")}</div>
          <div style={{fontSize:44,fontWeight:500,letterSpacing:"-0.03em",
            fontFamily:"var(--font-display,'Bricolage Grotesque')",lineHeight:1,marginTop:10,
            color: flaggedCount?"var(--danger)":"var(--ink)"}}>{flaggedCount}</div>
          <div style={{fontSize:11,color:"var(--ink-3)",marginTop:8}}>
            {lang==="tr"?"Acil dikkat gerekiyor":"Needs attention"}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card pad={0}>
        <div style={{padding:"12px 18px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",
          borderBottom:"1px solid var(--line)"}}>
          <Tabs tabs={[
            {id:"all", label: t("filterAll")},
            {id:"positive", label: t("filterPositive")},
            {id:"negative", label: t("filterNegative")},
            {id:"unanswered", label: t("filterUnanswered")},
            {id:"flagged", label: t("filterFlagged")},
          ]} active={filter} onChange={setFilter}/>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            <Select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}
              style={{minWidth:160,padding:"6px 10px",fontSize:12,height:34}}>
              <option value="all">{lang==="tr"?"Tüm şubeler":"All branches"}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",
              border:"1px solid var(--line)",borderRadius:8,background:"var(--card-2)",minWidth:180}}>
              <Icon name="search" size={14} stroke="var(--ink-3)"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder={t("typeToSearch")}
                style={{border:"none",outline:"none",background:"transparent",fontSize:12,flex:1,color:"var(--ink)"}}/>
            </div>
            <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--ink-3)"}}>
              {visible.length} {t("filledCount")}
            </span>
          </div>
        </div>

        {/* List */}
        {visible.length === 0 && (
          <div style={{padding:48,textAlign:"center",color:"var(--ink-3)",fontSize:13}}>
            {t("noReviews")}
          </div>
        )}
        {visible.map((r,i) => {
          const branch = branches.find(b=>b.id===r.branch);
          const isReplying = replyingId===r.id;
          return (
            <div key={r.id} style={{padding:"20px 22px",
              borderBottom: i<visible.length-1?"1px solid var(--line)":"none",
              background: r.flagged?"rgba(184,74,58,.03)":"transparent"}}>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:14}}>
                <div style={{width:40,height:40,borderRadius:"50%",
                  background:`hsl(${r.author.charCodeAt(0)*9 % 360},34%,62%)`,
                  color:"#FFF8EC",display:"grid",placeItems:"center",
                  fontSize:13,fontWeight:600,letterSpacing:".02em"}}>
                  {r.author.split(" ").map(x=>x[0]).join("").slice(0,2)}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:600}}>{r.author}</span>
                    <Stars value={r.rating} size={13}/>
                    <span style={{fontSize:10.5,color:"var(--ink-3)",fontFamily:"var(--font-mono)",
                      letterSpacing:".08em"}}>
                      {lang==="tr"?"Masa":"Table"} {String(r.table).padStart(2,"0")} · {branch?.name} · {r.ts.replace("2026-04-","")}
                    </span>
                    <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                      <Pill tone={statusTone(r.status)} size="sm">{statusLabel(r.status)}</Pill>
                      {r.flagged && <Pill tone="danger" size="sm" icon="flag">{t("flagged")}</Pill>}
                    </div>
                  </div>
                  <div style={{fontSize:13.5,color:"var(--ink)",marginTop:10,lineHeight:1.55,maxWidth:780}}>
                    {r.body[lang]}
                  </div>
                  {r.tags?.length > 0 && (
                    <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                      {r.tags.map(tag => (
                        <span key={tag} style={{fontSize:10,fontFamily:"var(--font-mono)",
                          color:"var(--ink-3)",padding:"2px 7px",background:"var(--paper-2)",
                          border:"1px solid var(--line)",borderRadius:999,letterSpacing:".06em"}}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* reply shown */}
                  {r.reply && (
                    <div style={{marginTop:12,padding:"12px 14px",borderRadius:10,
                      background:"var(--accent-soft)",borderLeft:"3px solid var(--accent)"}}>
                      <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",
                        color:"var(--accent-ink)",letterSpacing:".1em",textTransform:"uppercase",
                        fontWeight:600,marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
                        <Icon name="reply" size={11}/> Aleg
                      </div>
                      <div style={{fontSize:13,color:"var(--ink)",lineHeight:1.5}}>{r.reply[lang]}</div>
                    </div>
                  )}

                  {/* inline reply editor */}
                  {isReplying && (
                    <div style={{marginTop:12,padding:12,borderRadius:10,
                      background:"var(--card-2)",border:"1px solid var(--line)"}}>
                      <Textarea value={replyText} autoFocus rows={3}
                        onChange={e=>setReplyText(e.target.value)}
                        placeholder={t("replyPlaceholder")}/>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:10}}>
                        <Button variant="ghost" size="sm" onClick={()=>{setReplyingId(null);setReplyText("");}}>
                          {t("cancel")}
                        </Button>
                        <Button variant="accent" size="sm" icon="send" onClick={()=>sendReply(r)}>
                          {t("sendReply")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* actions */}
                  {!isReplying && (
                    <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
                      {!r.reply && (
                        <Button variant="soft" size="sm" icon="reply" onClick={()=>{setReplyingId(r.id);setReplyText("");}}>
                          {t("reply")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" icon="flag"
                        onClick={()=>toggleFlag(r)}
                        style={r.flagged?{color:"var(--danger)"}:undefined}>
                        {r.flagged?t("unflag"):t("markFlagged")}
                      </Button>
                      {r.status!=="resolved" && (
                        <Button variant="ghost" size="sm" icon="check-circle" onClick={()=>resolve(r)}>
                          {t("markResolved")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

/* ============ BAR SCREEN ============ */
// Split orders into bar (drinks) vs kitchen (food) by looking at category keywords in the product name.
const isDrinkName = (nameObj) => {
  const s = ((nameObj.tr||"")+" "+(nameObj.en||"")).toLowerCase();
  return /espresso|flat white|cortado|chemex|v60|filter|pour|coffee|latte|moka|americano|tea|çay|limon|kombucha|matcha|lemonade|cold brew/i.test(s);
};

const splitOrdersForStation = (orders, station) => {
  return orders
    .filter(o => o.stage !== "delivered")
    .map(o => ({
      ...o,
      items: o.items.filter(it => station==="bar" ? isDrinkName(it.name) : !isDrinkName(it.name))
    }))
    .filter(o => o.items.length > 0);
};

const BarScreen = ({t, lang, orders, setOrders, station="bar", stationConfig, staff=[], categories=[], products=[], focused=false, onEnterFocus, onExitFocus}) => {
  // per-order prep state tracked locally in component (derived from order.stage but per-station tickets)
  const [localStages, setLocalStages] = React.useState({});
  const getStage = (o) => localStages[o.id] || (o.stage==="received" ? "new" : o.stage==="preparing" ? "preparing" : "ready");

  const tickets = splitOrdersForStation(orders, station);

  const advance = (o) => {
    const cur = getStage(o);
    const next = cur==="new" ? "preparing" : cur==="preparing" ? "ready" : "done";
    if (next==="done") {
      // on "done" — mark the full order preparing or delivered on the central store if no other station still has items
      setLocalStages({...localStages, [o.id]: "done"});
      setTimeout(() => {
        // remove from view after ~600ms
        setLocalStages(ls => { const {[o.id]:_, ...rest} = ls; return rest; });
      }, 600);
      setOrders(orders.map(x => x.id===o.id ? {...x, stage: x.stage==="received"?"preparing":"ready"} : x));
    } else {
      setLocalStages({...localStages, [o.id]: next});
      if (next === "preparing" && o.stage === "received") {
        setOrders(orders.map(x => x.id===o.id ? {...x, stage: "preparing"} : x));
      }
    }
  };

  const bucket = {
    new: tickets.filter(o => getStage(o)==="new"),
    preparing: tickets.filter(o => getStage(o)==="preparing"),
    ready: tickets.filter(o => getStage(o)==="ready"),
  };

  const stationTitle = stationConfig?.name?.[lang] || (station==="bar" ? t("barScreenTitle") : t("kitchenScreenTitle"));
  const stationSub = stationConfig?.description?.[lang] || t("barScreenSub");
  const accent = stationConfig?.color || (station==="bar" ? "#2E5B7A" : "#C4553A");
  const stationStaff = (stationConfig?.staff||[]).map(sid => staff.find(s=>s.id===sid)).filter(Boolean);

  const openFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
    onEnterFocus && onEnterFocus();
  };
  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    onExitFocus && onExitFocus();
  };

  const Ticket = ({o}) => {
    const stage = getStage(o);
    const ageMin = o.mins || 0;
    const urgent = ageMin > 10;
    return (
      <div style={{
        background: stage==="done"?"var(--ok)":"var(--card)",
        border: `1px solid ${stage==="ready"?"var(--ok)":urgent?"var(--danger)":"var(--line)"}`,
        borderLeft: `4px solid ${stage==="new"?accent:stage==="preparing"?"var(--warn)":"var(--ok)"}`,
        borderRadius: 12,
        padding: 16,
        display: "flex", flexDirection:"column", gap: 10,
        boxShadow: urgent?"0 0 0 3px rgba(184,74,58,.08)":"0 1px 2px rgba(42,31,24,.04)",
        transition: "all .3s",
        opacity: stage==="done"?0.5:1
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:22,fontWeight:600,letterSpacing:"-0.02em",
            fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>
            {lang==="tr"?"Masa":"T"} {String(o.table).padStart(2,"0")}
          </div>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
            letterSpacing:".08em"}}>{o.id}</div>
          <div style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--font-mono)",
            color: urgent?"var(--danger)":"var(--ink-3)",fontWeight: urgent?700:500,
            display:"inline-flex",alignItems:"center",gap:4,
            padding:urgent?"3px 8px":0,
            background:urgent?"rgba(184,74,58,.1)":"transparent",borderRadius:6}}>
            <Icon name="clock" size={12}/>
            {ageMin}{lang==="tr"?"dk":"m"}
          </div>
        </div>
        <div style={{display:"grid",gap:6,paddingTop:8,borderTop:"1px dashed var(--line)"}}>
          {o.items.map((it,idx) => (
            <div key={idx} style={{display:"flex",alignItems:"baseline",gap:10,fontSize:15}}>
              <span style={{fontSize:18,fontFamily:"var(--font-mono)",color:accent,
                fontWeight:700,minWidth:30}}>{it.qty}×</span>
              <span style={{flex:1,fontWeight:500,letterSpacing:"-0.01em",lineHeight:1.3}}>{it.name[lang]}</span>
            </div>
          ))}
        </div>
        {stage !== "done" && (
          <button onClick={()=>advance(o)} style={{
            marginTop:"auto",padding:"12px",borderRadius:10,border:"none",cursor:"pointer",
            background: stage==="new"?accent:stage==="preparing"?"var(--ok)":"var(--ink)",
            color:"#FFF8EC",fontSize:13,fontWeight:700,letterSpacing:".04em",
            fontFamily:"var(--font-mono)",textTransform:"uppercase",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8
          }}>
            {stage==="new" && <><Icon name="play" size={13}/>{t("startPrep")}</>}
            {stage==="preparing" && <><Icon name="check" size={14}/>{t("markReady")}</>}
            {stage==="ready" && <><Icon name="bag" size={13}/>{lang==="tr"?"Teslim":"Deliver"}</>}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{display:"grid",gap:focused?18:22}}>
      {focused ? (
        /* Focus-mode hero header — station color band, staff on duty, exit top-right */
        <div style={{padding:"22px 26px",borderRadius:16,
          background:`linear-gradient(135deg, ${accent}, ${accent}dd)`,color:"#FFF8EC",
          display:"flex",alignItems:"center",gap:20,position:"relative"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontFamily:"var(--font-mono)",letterSpacing:".18em",
              textTransform:"uppercase",opacity:.8,fontWeight:600}}>
              {lang==="tr"?"İstasyon · Tam Ekran":"Station · Fullscreen"}
            </div>
            <div style={{fontSize:40,fontWeight:500,letterSpacing:"-0.025em",marginTop:4,lineHeight:1,
              fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{stationTitle}</div>
            <div style={{fontSize:13,opacity:.85,marginTop:6}}>{stationSub}</div>
          </div>
          {stationStaff.length > 0 && (
            <div style={{display:"flex",gap:-6}}>
              {stationStaff.slice(0,5).map((st,i)=>{
                const ini = st.name.split(" ").map(x=>x[0]).join("").slice(0,2);
                return (
                  <div key={st.id} title={st.name}
                    style={{width:44,height:44,borderRadius:"50%",background:"#FFF8EC",color:accent,
                      display:"grid",placeItems:"center",fontSize:13,fontWeight:700,
                      fontFamily:"var(--font-mono)",border:"2px solid #FFF8EC",
                      marginLeft: i===0?0:-10,boxShadow:"0 2px 6px rgba(0,0,0,.15)"}}>{ini}</div>
                );
              })}
            </div>
          )}
          <div style={{height:40,width:1,background:"rgba(255,255,255,.25)"}}/>
          <Button variant="soft" icon="refresh" onClick={()=>setLocalStages({})}>
            {lang==="tr"?"Sıfırla":"Reset"}
          </Button>
          <button onClick={exitFullscreen}
            style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,.3)",
              background:"rgba(0,0,0,.2)",color:"#FFF8EC",cursor:"pointer",fontSize:13,fontWeight:600,
              display:"inline-flex",alignItems:"center",gap:8,fontFamily:"var(--font-mono)",
              letterSpacing:".06em",textTransform:"uppercase"}}>
            <Icon name="close" size={14} stroke="#FFF8EC"/>
            {t("exitFullscreen")}
            <Kbd>ESC</Kbd>
          </button>
        </div>
      ) : (
        <SectionHead
          eyebrow={t("nav_orders")}
          title={stationTitle}
          sub={stationSub}
          actions={<>
            <Button variant="soft" icon="refresh" onClick={()=>setLocalStages({})}>
              {lang==="tr"?"Sıfırla":"Reset"}
            </Button>
            <Button variant="primary" icon="maximize" onClick={openFullscreen}>
              {t("fullscreen")}
            </Button>
          </>}
        />
      )}

      {/* Status strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {label:t("newOrders"), val:bucket.new.length, color: accent},
          {label:t("preparing"), val:bucket.preparing.length, color:"var(--warn)"},
          {label:t("ready"), val:bucket.ready.length, color:"var(--ok)"},
          {label:t("avgPrep"), val:"6"+(lang==="tr"?" dk":"m"), color:"var(--ink-2)"},
        ].map((s,i)=>(
          <div key={i} style={{background:"var(--card)",border:"1px solid var(--line)",borderRadius:12,
            padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{width:8,height:40,borderRadius:3,background:s.color}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
                letterSpacing:".12em",textTransform:"uppercase",fontWeight:500}}>{s.label}</div>
              <div style={{fontSize:30,fontWeight:500,letterSpacing:"-0.025em",lineHeight:1,
                fontFamily:"var(--font-display,'Bricolage Grotesque')",marginTop:4}}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {stationStaff.length > 0 && (
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",
          background:"var(--paper-2)",border:"1px solid var(--line)",borderRadius:12}}>
          <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:600}}>{t("onDuty")}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
            {stationStaff.map(st => {
              const ini = st.name.split(" ").map(x=>x[0]).join("").slice(0,2);
              return (
                <div key={st.id} style={{display:"flex",alignItems:"center",gap:7,
                  padding:"4px 10px 4px 4px",background:"var(--card)",
                  borderRadius:999,border:"1px solid var(--line)"}}>
                  <span style={{width:22,height:22,borderRadius:"50%",background:st.color,
                    color:"#FFF8EC",display:"grid",placeItems:"center",fontSize:10,fontWeight:700,
                    fontFamily:"var(--font-mono)"}}>{ini}</span>
                  <span style={{fontSize:12,fontWeight:500}}>{st.name}</span>
                </div>
              );
            })}
          </div>
          <span style={{width:8,height:8,borderRadius:"50%",background:"var(--ok)",
            animation:"pulse 2s ease-in-out infinite"}}/>
        </div>
      )}

      {tickets.length === 0 ? (
        <div style={{padding:80,textAlign:"center",background:"var(--card)",
          border:"1px dashed var(--line-2)",borderRadius:16}}>
          <div style={{fontSize:48,fontFamily:"var(--font-display)",fontStyle:"italic",
            color:"var(--accent)",fontWeight:500,letterSpacing:"-0.03em"}}>✓</div>
          <div style={{fontSize:20,fontWeight:500,letterSpacing:"-0.02em",marginTop:10,
            fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{t("allOrdersDone")}</div>
          <div style={{fontSize:13,color:"var(--ink-3)",marginTop:6}}>{t("allOrdersDoneSub")}</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {/* column: new */}
          {[
            {id:"new", label:t("newOrders"), items:bucket.new, color:accent},
            {id:"preparing", label:t("preparing"), items:bucket.preparing, color:"var(--warn)"},
            {id:"ready", label:t("ready"), items:bucket.ready, color:"var(--ok)"},
          ].map(col => (
            <div key={col.id} style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 4px"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
                <div style={{fontSize:11,fontWeight:700,fontFamily:"var(--font-mono)",
                  letterSpacing:".12em",textTransform:"uppercase"}}>{col.label}</div>
                <div style={{marginLeft:"auto",fontSize:11,fontFamily:"var(--font-mono)",
                  color:"var(--ink-3)",padding:"2px 8px",borderRadius:6,background:"var(--card-2)",
                  border:"1px solid var(--line)"}}>{col.items.length}</div>
              </div>
              {col.items.length === 0 ? (
                <div style={{padding:32,textAlign:"center",color:"var(--ink-3)",fontSize:11.5,
                  border:"1.5px dashed var(--line)",borderRadius:12,fontFamily:"var(--font-mono)",
                  letterSpacing:".08em",textTransform:"uppercase"}}>—</div>
              ) : (
                col.items.map(o => <Ticket key={o.id} o={o}/>)
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============ MODULES ============ */
const Modules = ({t, lang, modules, setModules}) => {
  const [saved, setSaved] = React.useState(false);
  const toggle = (id) => {
    const m = modules.find(x=>x.id===id);
    if (!m || m.core) return;
    setModules(modules.map(x => x.id===id ? {...x, on:!x.on} : x));
    setSaved(true);
    setTimeout(()=>setSaved(false), 1500);
  };
  const activeCount = modules.filter(m=>m.on).length;

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_business")}
        title={t("modulesTitle")}
        sub={t("modulesSub")}
        actions={saved && <Pill tone="ok" icon="check">{t("moduleSaved")}</Pill>}
      />

      {/* Plan card */}
      <Card pad={0}>
        <div style={{padding:"22px 26px",display:"grid",gridTemplateColumns:"auto 1fr auto 1fr auto",
          gap:24,alignItems:"center",background:"linear-gradient(135deg,var(--paper-3),var(--paper-2))"}}>
          <div style={{width:54,height:54,borderRadius:14,
            background:"linear-gradient(135deg,var(--accent),#8A3822)",color:"#FFF8EC",
            display:"grid",placeItems:"center"}}>
            <Icon name="bolt" size={24}/>
          </div>
          <div>
            <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--accent)",
              letterSpacing:".14em",textTransform:"uppercase",fontWeight:600}}>{t("modulesPlan")}</div>
            <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",marginTop:2,
              fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>Growth</div>
            <div style={{fontSize:12,color:"var(--ink-3)",marginTop:2,fontFamily:"var(--font-mono)"}}>
              ₺890 / {lang==="tr"?"ay":"mo"} · {lang==="tr"?"sınırsız masa":"unlimited tables"}
            </div>
          </div>
          <div style={{width:1,height:46,background:"var(--line)"}}/>
          <div>
            <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
              letterSpacing:".14em",textTransform:"uppercase",fontWeight:500}}>{t("modulesRemain")}</div>
            <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",marginTop:2,
              fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>29<span style={{fontSize:13,color:"var(--ink-3)"}}>{lang==="tr"?" gün":" d"}</span> 3<span style={{fontSize:13,color:"var(--ink-3)"}}>h</span></div>
            <div style={{fontSize:12,color:"var(--ink-3)",marginTop:2,fontFamily:"var(--font-mono)"}}>
              {lang==="tr"?"2026-05-17'de yenilenir":"Renews 2026-05-17"}
            </div>
          </div>
          <Button variant="primary" icon="external">
            {lang==="tr"?"Plan değiştir":"Change plan"}
          </Button>
        </div>
        <div style={{padding:"12px 26px",borderTop:"1px solid var(--line)",display:"flex",gap:14,
          fontSize:11.5,color:"var(--ink-2)",alignItems:"center"}}>
          <span style={{fontFamily:"var(--font-mono)",color:"var(--accent)",letterSpacing:".08em"}}>
            {activeCount}/{modules.length}
          </span>
          <span>{lang==="tr"?"modül aktif":"modules active"}</span>
          <span style={{flex:1}}/>
          <span style={{color:"var(--ink-3)",fontFamily:"var(--font-mono)",letterSpacing:".06em"}}>
            {lang==="tr"?"Değişiklikler sol paneli ve menüyü anında etkiler":"Changes update the sidebar and guest menu instantly"}
          </span>
        </div>
      </Card>

      {/* Modules grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {modules.map(m => (
          <div key={m.id} style={{
            background: m.on?"var(--card)":"var(--paper-2)",
            border:`1.5px solid ${m.on?"var(--line)":"var(--line)"}`,
            borderRadius:14,padding:18,
            display:"grid",gridTemplateColumns:"48px 1fr auto",gap:14,alignItems:"center",
            opacity: m.on?1:.72,
            transition:"all .18s"
          }}>
            <div style={{width:48,height:48,borderRadius:12,
              background: m.on?"var(--accent-soft)":"var(--card-2)",
              color: m.on?"var(--accent-ink)":"var(--ink-3)",
              border: m.on?"1px solid rgba(196,85,58,.18)":"1px solid var(--line)",
              display:"grid",placeItems:"center"}}>
              <Icon name={m.icon} size={22}/>
            </div>
            <div style={{minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:14,fontWeight:600,letterSpacing:"-0.005em"}}>{m[lang]}</div>
                {m.core && <span style={{fontSize:9,fontFamily:"var(--font-mono)",
                  padding:"2px 6px",borderRadius:4,background:"var(--ink)",color:"var(--paper)",
                  letterSpacing:".1em",fontWeight:600}}>CORE</span>}
              </div>
              <div style={{fontSize:12,color:"var(--ink-3)",marginTop:3,lineHeight:1.4}}>
                {m.desc[lang]}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <Toggle on={m.on} onChange={()=>toggle(m.id)} disabled={m.core}/>
              {m.core && <span style={{fontSize:9.5,color:"var(--ink-3)",
                fontFamily:"var(--font-mono)",letterSpacing:".06em"}}>
                {lang==="tr"?"değiştirilemez":"required"}
              </span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============ BRANCHES (full CRUD + hours) ============ */
const defaultBranchDraft = () => ({
  name:"", address:"", manager:"", tables:16, status:"active", online:true,
  phone:"", slug:"",
  weekdayHours:{open:"08:00", close:"22:00"},
  weekendHours:{open:"09:00", close:"23:00"},
});

const BranchModal = ({open, onClose, t, lang, draft, setDraft, onSave, mode}) => {
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"").slice(0,20);
  const applyAll = () => {
    setDraft({...draft, weekendHours: {...draft.weekdayHours}});
  };
  return (
    <Modal open={open} onClose={onClose} width={620}
      title={mode==="edit"?t("editBranch"):t("addBranch")}
      subtitle={lang==="tr"?"Şubeyi ekle, çalışma saatlerini ayarla. Masa sayısı QR üretiminde kullanılır.":"Set up the branch, its hours and table count (drives QR generation)."}>
      <div style={{display:"grid",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
          <Field label={t("branchName")} required>
            <Input value={draft.name}
              onChange={e=>setDraft({...draft, name:e.target.value, slug: draft.slug || slugify(e.target.value)})}
              placeholder="Aleg Moda" autoFocus/>
          </Field>
          <Field label={t("branchTables")}>
            <Input type="number" min="1" max="200" value={draft.tables}
              onChange={e=>setDraft({...draft, tables: Math.max(1, +e.target.value||1)})}/>
          </Field>
        </div>
        <Field label={t("branchAddress")} required>
          <Input value={draft.address} onChange={e=>setDraft({...draft, address:e.target.value})}
            placeholder={lang==="tr"?"Moda Cad., Kadıköy, İstanbul":"Moda Ave., Kadıköy, İstanbul"}/>
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("branchManager")}>
            <Input value={draft.manager} onChange={e=>setDraft({...draft, manager:e.target.value})}
              placeholder={lang==="tr"?"örn. Ada Yılmaz":"e.g. Ada Smith"}/>
          </Field>
          <Field label={lang==="tr"?"Telefon":"Phone"}>
            <Input value={draft.phone} onChange={e=>setDraft({...draft, phone:e.target.value})}
              placeholder="+90 212 000 00 00"/>
          </Field>
        </div>
        <Field label="URL slug" hint={`menu.aleg.cafe/${draft.slug||"..."}`}>
          <Input value={draft.slug} onChange={e=>setDraft({...draft, slug:slugify(e.target.value)})}
            placeholder="moda" style={{fontFamily:"var(--font-mono)"}}/>
        </Field>

        <div style={{marginTop:6,padding:"14px 16px",borderRadius:12,background:"var(--paper-2)",
          border:"1px solid var(--line)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
              letterSpacing:".12em",textTransform:"uppercase",fontWeight:600}}>{t("hoursOfOp")}</div>
            <Button variant="ghost" size="sm" icon="copy" onClick={applyAll}>{t("applyAll")}</Button>
          </div>
          {[
            {k:"weekdayHours", label:t("weekdayHours")},
            {k:"weekendHours", label:t("weekendHours")},
          ].map(row => (
            <div key={row.k} style={{display:"grid",gridTemplateColumns:"120px 1fr 20px 1fr",
              gap:10,alignItems:"center",padding:"6px 0"}}>
              <div style={{fontSize:12,fontWeight:500}}>{row.label}</div>
              <input type="time" value={draft[row.k].open}
                onChange={e=>setDraft({...draft, [row.k]:{...draft[row.k],open:e.target.value}})}
                style={{padding:"8px 10px",borderRadius:7,border:"1px solid var(--line)",
                  background:"var(--card)",fontSize:12.5,fontFamily:"var(--font-mono)",color:"var(--ink)"}}/>
              <div style={{textAlign:"center",color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>→</div>
              <input type="time" value={draft[row.k].close}
                onChange={e=>setDraft({...draft, [row.k]:{...draft[row.k],close:e.target.value}})}
                style={{padding:"8px 10px",borderRadius:7,border:"1px solid var(--line)",
                  background:"var(--card)",fontSize:12.5,fontFamily:"var(--font-mono)",color:"var(--ink)"}}/>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("branchStatus")}>
            <Select value={draft.status} onChange={e=>setDraft({...draft, status:e.target.value})}>
              <option value="active">{t("active")}</option>
              <option value="seasonal">{t("seasonal")}</option>
              <option value="closed">{lang==="tr"?"Kapalı":"Closed"}</option>
            </Select>
          </Field>
          <Field label={lang==="tr"?"Menü durumu":"Menu status"}>
            <div style={{padding:"9px 12px",borderRadius:10,border:"1px solid var(--line)",
              background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13}}>{draft.online?t("online"):t("offline")}</span>
              <Toggle on={draft.online} onChange={v=>setDraft({...draft, online:v})}/>
            </div>
          </Field>
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
        paddingTop:18,borderTop:"1px solid var(--line)"}}>
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" icon="check" onClick={onSave}>{t("save")}</Button>
      </div>
    </Modal>
  );
};

const Branches = ({t, lang, branches, setBranches}) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(defaultBranchDraft());
  const [editId, setEditId] = React.useState(null);
  const [confirmId, setConfirmId] = React.useState(null);

  const openAdd = () => { setDraft(defaultBranchDraft()); setEditId(null); setOpen(true); };
  const openEdit = (b) => {
    setDraft({
      ...defaultBranchDraft(), ...b,
      weekdayHours: b.weekdayHours || {open:"08:00", close:"22:00"},
      weekendHours: b.weekendHours || {open:"09:00", close:"23:00"},
    });
    setEditId(b.id); setOpen(true);
  };
  const onSave = () => {
    if (!draft.name.trim() || !draft.address.trim()) return;
    if (editId) {
      setBranches(branches.map(b => b.id===editId ? {...b, ...draft, id:editId} : b));
    } else {
      const id = "b" + Date.now();
      setBranches([...branches, {...draft, id, slug: draft.slug || ("b"+Date.now().toString().slice(-5))}]);
    }
    setOpen(false);
  };
  const onDelete = (id) => { setBranches(branches.filter(b=>b.id!==id)); setConfirmId(null); };

  const statusTone = (s) => s==="active"?"ok":s==="seasonal"?"warn":"muted";
  const statusLabel = (s) => s==="active"?t("active"):s==="seasonal"?t("seasonal"):(lang==="tr"?"Kapalı":"Closed");

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("nav_branches")}
        sub={lang==="tr"?"Aleg'in tüm şubeleri. Her şubenin kendi menüsü, masa düzeni, saatleri ve ekibi olur.":"All your Aleg branches — each with its own menu, floor plan, hours and team."}
        actions={<Button variant="primary" icon="plus" onClick={openAdd}>{t("addBranch")}</Button>}
      />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {branches.map(b => (
          <Card key={b.id} pad={0} style={{overflow:"hidden"}}>
            <div style={{height:110,background:"linear-gradient(135deg,var(--paper-3),var(--paper-2))",
              position:"relative",borderBottom:"1px solid var(--line)"}}>
              <div style={{position:"absolute",top:12,left:14,display:"inline-flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:b.online?"var(--ok)":"var(--ink-3)",
                  animation: b.online?"pulse 2s ease-in-out infinite":""}}/>
                <span style={{fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-2)",
                  letterSpacing:".1em",textTransform:"uppercase"}}>
                  {b.online?t("online"):t("offline")}
                </span>
              </div>
              <div style={{position:"absolute",top:12,right:14}}>
                <Pill tone={statusTone(b.status)} size="sm">{statusLabel(b.status)}</Pill>
              </div>
              <div style={{position:"absolute",bottom:10,right:14,opacity:.12}}>
                <Icon name="building" size={56} stroke="var(--ink)"/>
              </div>
              <div style={{position:"absolute",bottom:10,left:14,fontSize:11,color:"var(--ink-3)",
                fontFamily:"var(--font-mono)",letterSpacing:".08em"}}>
                menu.aleg.cafe/{b.slug}
              </div>
            </div>
            <div style={{padding:"16px 18px 18px"}}>
              <div style={{fontSize:18,fontWeight:500,letterSpacing:"-0.02em",
                fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{b.name}</div>
              <div style={{fontSize:12,color:"var(--ink-3)",marginTop:4,display:"flex",gap:5,
                alignItems:"flex-start",lineHeight:1.4}}>
                <Icon name="pin" size={12} style={{marginTop:2,flexShrink:0}}/> {b.address}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14,
                padding:"10px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)"}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
                    letterSpacing:".1em",textTransform:"uppercase"}}>{lang==="tr"?"Masa":"Tables"}</div>
                  <div style={{fontSize:20,fontWeight:500,fontFamily:"var(--font-display,'Bricolage Grotesque')",marginTop:2}}>
                    {b.tables}</div>
                </div>
                <div>
                  <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
                    letterSpacing:".1em",textTransform:"uppercase"}}>{lang==="tr"?"Yönetici":"Manager"}</div>
                  <div style={{fontSize:13,fontWeight:500,marginTop:4}}>{b.manager || "—"}</div>
                </div>
              </div>
              {/* Hours */}
              {(b.weekdayHours || b.weekendHours) && (
                <div style={{marginTop:10,display:"grid",gap:3}}>
                  {b.weekdayHours && (
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5}}>
                      <span style={{color:"var(--ink-3)"}}>{t("weekdayHours")}</span>
                      <span style={{fontFamily:"var(--font-mono)",color:"var(--ink-2)"}}>
                        {b.weekdayHours.open}–{b.weekdayHours.close}</span>
                    </div>
                  )}
                  {b.weekendHours && (
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5}}>
                      <span style={{color:"var(--ink-3)"}}>{t("weekendHours")}</span>
                      <span style={{fontFamily:"var(--font-mono)",color:"var(--ink-2)"}}>
                        {b.weekendHours.open}–{b.weekendHours.close}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{display:"flex",gap:6,marginTop:14,justifyContent:"flex-end"}}>
                <Button variant="ghost" size="sm" icon="trash"
                  onClick={()=>setConfirmId(b.id)}
                  style={{color:"var(--ink-3)"}}>
                  {t("delete")}
                </Button>
                <Button variant="soft" size="sm" icon="edit" onClick={()=>openEdit(b)}>{t("edit")}</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BranchModal open={open} onClose={()=>setOpen(false)} t={t} lang={lang}
        draft={draft} setDraft={setDraft} onSave={onSave} mode={editId?"edit":"add"}/>

      {/* Confirm delete */}
      <Modal open={!!confirmId} onClose={()=>setConfirmId(null)} width={440}
        title={t("deleteBranch")}
        subtitle={t("confirmDelete")}>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setConfirmId(null)}>{t("cancel")}</Button>
          <Button variant="danger" icon="trash" onClick={()=>onDelete(confirmId)}>{t("delete")}</Button>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { QRScreen, Reviews, BarScreen, Modules, Branches, QRCanvas });
