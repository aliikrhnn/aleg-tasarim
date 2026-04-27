// Orders (Kanban) + Campaigns admin screens.

const ORDERS_STAGE_META = (lang) => [
  {id:"received",  tr:"Sipariş Alındı",  en:"Order Received", color:"#B07A2E", icon:"bell"},
  {id:"preparing", tr:"Hazırlanıyor",   en:"Preparing",     color:"#C4553A", icon:"coffee"},
  {id:"ready",     tr:"Hazır",          en:"Ready",         color:"#6B7A4B", icon:"bag"},
  {id:"delivered", tr:"Teslim Edildi",  en:"Delivered",     color:"#4F7C4C", icon:"check-circle"},
].map(s => ({...s, label: s[lang]}));

const Orders = ({t, lang, orders, setOrders}) => {
  const stages = ORDERS_STAGE_META(lang);
  const advance = (o) => {
    const idx = ["received","preparing","ready","delivered"].indexOf(o.stage);
    if (idx >= 3) return;
    const next = ["received","preparing","ready","delivered"][idx+1];
    setOrders(orders.map(x => x.id===o.id?{...x, stage:next}:x));
  };
  const rollback = (o) => {
    const idx = ["received","preparing","ready","delivered"].indexOf(o.stage);
    if (idx <= 0) return;
    const prev = ["received","preparing","ready","delivered"][idx-1];
    setOrders(orders.map(x => x.id===o.id?{...x, stage:prev}:x));
  };
  const today = orders.length;
  const revenue = orders.reduce((s,o)=>s+o.total,0);
  const active = orders.filter(o=>o.stage!=="delivered").length;

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_orders")}
        title={lang==="tr"?"Canlı Siparişler":"Live Orders"}
        sub={lang==="tr"?"Müşteriden gelen siparişleri aşamalar arasında taşıyın — takip ekranı otomatik güncellenir.":"Move guest orders between stages — the guest tracker updates automatically."}
        actions={<>
          <Button variant="soft" size="md" icon="filter">{lang==="tr"?"Filtrele":"Filter"}</Button>
          <Button variant="primary" size="md" icon="printer">{lang==="tr"?"Mutfak yazıcı":"Kitchen printer"}</Button>
        </>}
      />
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
        {[
          {label:lang==="tr"?"Aktif sipariş":"Active orders", val: active, icon:"bag", tone:"accent"},
          {label:lang==="tr"?"Bugünkü ciro":"Today's revenue", val: `₺${revenue}`, icon:"arrow-up", tone:"ok"},
          {label:lang==="tr"?"Ortalama süre":"Avg. prep time", val: "7 dk", icon:"clock", tone:"muted"},
        ].map((s,i)=>(
          <Card key={i}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
              <div>
                <div style={{fontSize:10.5,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".12em",textTransform:"uppercase",fontWeight:500}}>{s.label}</div>
                <div style={{fontSize:32,fontWeight:500,letterSpacing:"-0.025em",marginTop:6,
                  fontFamily:"var(--font-display,'Bricolage Grotesque')",color:"var(--ink)"}}>{s.val}</div>
              </div>
              <div style={{width:38,height:38,borderRadius:10,background:"var(--paper-2)",
                display:"grid",placeItems:"center",color:"var(--accent)"}}>
                <Icon name={s.icon} size={18}/>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12}}>
        {stages.map(st => {
          const col = orders.filter(o=>o.stage===st.id);
          return (
            <div key={st.id} style={{background:"var(--paper-2)", border:"1px solid var(--line)",
              borderRadius:14, padding:12, display:"flex", flexDirection:"column", gap:10,
              minHeight:400}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 4px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:st.color}}/>
                  <div style={{fontSize:12,fontWeight:600,letterSpacing:"-0.005em"}}>{st.label}</div>
                </div>
                <span style={{fontSize:10.5,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  fontWeight:600,padding:"2px 7px",background:"var(--card-2)",borderRadius:6,border:"1px solid var(--line)"}}>
                  {String(col.length).padStart(2,"0")}
                </span>
              </div>
              {col.length===0 && <div style={{padding:30,textAlign:"center",color:"var(--ink-3)",fontSize:11.5,
                border:"1.5px dashed var(--line)",borderRadius:10}}>—</div>}
              {col.map(o => (
                <div key={o.id} style={{background:"var(--card)",border:"1px solid var(--line)",
                  borderRadius:10, padding:12, boxShadow:"0 1px 2px rgba(42,31,24,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                      letterSpacing:".08em"}}>{o.id}</div>
                    <div style={{fontSize:10.5,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)"}}>
                      <Icon name="clock" size={10} style={{marginRight:3,verticalAlign:-1}}/>
                      {o.mins}{lang==="tr"?" dk":"m"}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                    <span style={{fontSize:16,fontWeight:600,letterSpacing:"-0.02em",
                      fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{lang==="tr"?"Masa":"Table"} {String(o.table).padStart(2,"0")}</span>
                    <span style={{fontSize:12,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",marginLeft:"auto"}}>
                      ₺{o.total}
                    </span>
                  </div>
                  <div style={{marginTop:8, display:"grid", gap:3}}>
                    {o.items.map((it,idx)=>(
                      <div key={idx} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"var(--ink-2)"}}>
                        <span style={{display:"flex",gap:6}}>
                          <span style={{fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--accent)",fontWeight:600,minWidth:14}}>{it.qty}×</span>
                          {it.name[lang]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--line)",
                    display:"flex",gap:5}}>
                    {o.stage!=="received" && <Button variant="ghost" size="sm" icon="chev-right"
                      style={{padding:"0 6px"}} title="Back"
                      onClick={()=>rollback(o)}>
                      <span style={{transform:"rotate(180deg)",display:"inline-flex"}}><Icon name="chev-right" size={12}/></span>
                    </Button>}
                    {o.stage!=="delivered" && <Button variant="accent" size="sm" onClick={()=>advance(o)} style={{flex:1}}>
                      {o.stage==="received" && (lang==="tr"?"Hazırla":"Start prep")}
                      {o.stage==="preparing" && (lang==="tr"?"Hazır":"Mark ready")}
                      {o.stage==="ready" && (lang==="tr"?"Teslim et":"Deliver")}
                    </Button>}
                    {o.stage==="delivered" && <div style={{flex:1,fontSize:10.5,color:"var(--ok)",
                      display:"flex",alignItems:"center",gap:5,fontWeight:600,
                      fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".06em"}}>
                      <Icon name="check" size={12}/> {lang==="tr"?"TAMAMLANDI":"COMPLETE"}
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Campaigns = ({t, lang, campaigns, setCampaigns, onPreview}) => {
  const [selected, setSelected] = React.useState(campaigns[0]?.id);
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const fileRef = React.useRef(null);
  const sel = campaigns.find(c => c.id===selected) || campaigns[0];

  // sync draft when selection changes
  React.useEffect(()=>{
    if (sel) setDraft(JSON.parse(JSON.stringify(sel)));
  }, [selected]); // eslint-disable-line

  const toggle = (c) => setCampaigns(campaigns.map(x =>
    x.id===c.id ? {...x, status: x.status==="active"?"paused":"active"} : x
  ));
  const statusTone = s => s==="active"?"ok":s==="scheduled"?"warn":"muted";
  const statusLabel = s => ({
    active:{tr:"Yayında",en:"Live"}, scheduled:{tr:"Zamanlanmış",en:"Scheduled"},
    paused:{tr:"Duraklatıldı",en:"Paused"}
  }[s][lang]);

  const weekdays = lang==="tr" ? ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const saveDraft = () => {
    if (!draft) return;
    setCampaigns(campaigns.map(x => x.id===draft.id ? draft : x));
    setSaved(true);
    setTimeout(()=>setSaved(false), 1500);
  };
  const addNew = () => {
    const id = "cmp"+Date.now();
    const nc = {
      id, title:{tr:lang==="tr"?"Yeni kampanya":"New campaign", en:"New campaign"},
      body:{tr:"", en:""}, ctaLabel:{tr:"Keşfet", en:"Discover"},
      starts: "2026-04-20", ends: "2026-05-20",
      daily:{from:"", to:""}, weekdays:[0,1,2,3,4,5,6],
      display:"popup", accent:"#C4553A", image:"",
      status:"scheduled", impressions:0, claims:0
    };
    setCampaigns([nc, ...campaigns]);
    setSelected(id);
    setCreating(false);
  };
  const deleteSel = () => {
    if (!draft) return;
    const idx = campaigns.findIndex(c=>c.id===draft.id);
    const next = campaigns.filter(c=>c.id!==draft.id);
    setCampaigns(next);
    setSelected(next[Math.max(0, idx-1)]?.id);
    setConfirmDel(null);
  };
  const toggleDay = (i) => {
    if (!draft) return;
    const has = draft.weekdays.includes(i);
    setDraft({...draft, weekdays: has ? draft.weekdays.filter(d=>d!==i) : [...draft.weekdays, i].sort()});
  };
  const pickImage = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setDraft({...draft, image: r.result});
    r.readAsDataURL(f);
  };

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_campaigns")}
        title={t("campaignTitle")}
        sub={lang==="tr"?"Müşterinin açılır pencere veya bannerda göreceği kampanyalar. Tarih, saat ve gün aralıklarıyla programla.":"Popups and banners guests see in the menu. Schedule with date, hour and weekday windows."}
        actions={<>
          {saved && <Pill tone="ok" icon="check">{lang==="tr"?"Kaydedildi":"Saved"}</Pill>}
          <Button variant="primary" icon="plus" onClick={addNew}>{t("campaignAdd")}</Button>
        </>}
      />
      <div style={{display:"grid", gridTemplateColumns:"1.1fr 1.4fr", gap:14}}>
        <Card pad={0}>
          {campaigns.map((c,i)=>(
            <div key={c.id} onClick={()=>setSelected(c.id)} style={{
              display:"grid",gridTemplateColumns:"44px 1fr auto",gap:12,
              padding:"14px 18px",borderBottom: i<campaigns.length-1?"1px solid var(--line)":"none",
              cursor:"pointer",alignItems:"center",
              background: selected===c.id?"var(--paper-2)":"transparent",
              borderLeft: selected===c.id?`3px solid ${c.accent}`:"3px solid transparent"
            }}>
              <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",
                background: c.image?`url(${c.image}) center/cover`:`linear-gradient(135deg, ${c.accent}, ${c.accent}99)`,
                display:"grid",placeItems:"center",color:"#FFF8EC"}}>
                {!c.image && <Icon name={c.display==="popup"?"megaphone":"image"} size={18}/>}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,letterSpacing:"-0.005em",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title[lang]}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",marginTop:2,fontFamily:"'DM Mono',ui-monospace,monospace"}}>
                  {c.starts} → {c.ends} · {c.display.toUpperCase()}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Pill tone={statusTone(c.status)} size="sm">{statusLabel(c.status)}</Pill>
                <Toggle on={c.status==="active"} onChange={()=>toggle(c)}/>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          {draft && <div style={{display:"grid", gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".14em",textTransform:"uppercase",fontWeight:500}}>
                  {lang==="tr"?"Düzenle":"Edit"}
                </div>
                <div style={{fontSize:20,fontWeight:500,letterSpacing:"-0.02em",marginTop:2,
                  fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{draft.title[lang]}</div>
              </div>
              <Button variant="soft" size="sm" icon="eye" onClick={()=>onPreview && onPreview(draft)}>
                {t("preview")}
              </Button>
            </div>

            {/* Image picker */}
            <Field label={lang==="tr"?"Görsel":"Image"}>
              <div style={{display:"grid",gridTemplateColumns:"96px 1fr",gap:10,alignItems:"stretch"}}>
                <div style={{width:96,height:96,borderRadius:10,overflow:"hidden",
                  border:"1px solid var(--line)",
                  background: draft.image?`url(${draft.image}) center/cover`:`linear-gradient(135deg, ${draft.accent}, ${draft.accent}99)`,
                  display:"grid",placeItems:"center",color:"#FFF8EC"}}>
                  {!draft.image && <Icon name="image" size={22}/>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage}/>
                  <Button variant="soft" size="sm" icon="upload" onClick={()=>fileRef.current?.click()}>
                    {lang==="tr"?"Görsel yükle":"Upload image"}
                  </Button>
                  {draft.image && <Button variant="ghost" size="sm" icon="trash" onClick={()=>setDraft({...draft, image:""})}>
                    {lang==="tr"?"Kaldır":"Remove"}
                  </Button>}
                  <div style={{fontSize:10.5,color:"var(--ink-3)",fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".04em"}}>
                    {lang==="tr"?"PNG / JPG · ≤ 2 MB":"PNG / JPG · ≤ 2 MB"}
                  </div>
                </div>
              </div>
            </Field>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field label={lang==="tr"?"Başlık":"Title"}>
                <Input value={draft.title[lang]} onChange={e=>setDraft({...draft, title:{...draft.title, [lang]:e.target.value}})}/>
              </Field>
              <Field label="CTA">
                <Input value={draft.ctaLabel[lang]} onChange={e=>setDraft({...draft, ctaLabel:{...draft.ctaLabel, [lang]:e.target.value}})}/>
              </Field>
            </div>
            <Field label={lang==="tr"?"Açıklama":"Body"}>
              <Textarea value={draft.body[lang]} onChange={e=>setDraft({...draft, body:{...draft.body, [lang]:e.target.value}})}/>
            </Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <Field label={t("starts")}>
                <Input type="date" value={draft.starts} onChange={e=>setDraft({...draft, starts:e.target.value})}/>
              </Field>
              <Field label={t("ends")}>
                <Input type="date" value={draft.ends} onChange={e=>setDraft({...draft, ends:e.target.value})}/>
              </Field>
              <Field label={lang==="tr"?"Vurgu":"Accent"}>
                <div style={{display:"flex",gap:6,padding:"9px 10px",border:"1px solid var(--line)",
                  borderRadius:10,background:"var(--card)",height:42,alignItems:"center"}}>
                  {["#C4553A","#6B7A4B","#B08A3E","#2E5B7A","#7E3A6B","#1A1410"].map(c => (
                    <button key={c} onClick={()=>setDraft({...draft, accent:c})} style={{
                      width:22,height:22,borderRadius:6,background:c,cursor:"pointer",
                      border: draft.accent===c?"2px solid var(--ink)":"1px solid rgba(0,0,0,.15)"
                    }}/>
                  ))}
                </div>
              </Field>
            </div>
            <Field label={t("dailyWindow")}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Input type="time" value={draft.daily.from||""}
                  onChange={e=>setDraft({...draft, daily:{...draft.daily, from:e.target.value}})} style={{flex:1}}/>
                <span style={{color:"var(--ink-3)",fontFamily:"'DM Mono',ui-monospace,monospace"}}>→</span>
                <Input type="time" value={draft.daily.to||""}
                  onChange={e=>setDraft({...draft, daily:{...draft.daily, to:e.target.value}})} style={{flex:1}}/>
              </div>
            </Field>
            <Field label={lang==="tr"?"Günler":"Days"}>
              <div style={{display:"flex",gap:4}}>
                {weekdays.map((d,i)=>{
                  const on = draft.weekdays.includes(i);
                  return <button key={i} onClick={()=>toggleDay(i)} style={{
                    flex:1,height:38,borderRadius:8,fontSize:11,fontWeight:600,
                    fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".04em",cursor:"pointer",
                    background: on?draft.accent:"var(--paper-2)",
                    color: on?"#FFF8EC":"var(--ink-3)",
                    border: `1px solid ${on?draft.accent:"var(--line)"}`,
                    transition:"all .14s"
                  }}>{d}</button>;
                })}
              </div>
            </Field>
            <Field label={lang==="tr"?"Gösterim tipi":"Display"}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["popup","banner"].map(dm => (
                  <button key={dm} onClick={()=>setDraft({...draft, display:dm})} style={{
                    padding:"12px 14px",borderRadius:10,textAlign:"left",cursor:"pointer",
                    border:`1.5px solid ${draft.display===dm?"var(--accent)":"var(--line)"}`,
                    background: draft.display===dm?"var(--accent-soft)":"var(--card-2)"
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Icon name={dm==="popup"?"megaphone":"image"} size={16}/>
                      <span style={{fontSize:12.5,fontWeight:600}}>{dm==="popup"?t("popup"):t("banner")}</span>
                    </div>
                    <div style={{fontSize:10.5,color:"var(--ink-3)",marginTop:4}}>
                      {dm==="popup"?(lang==="tr"?"Menü açılışında tam ekran":"Full-screen on menu open")
                        :(lang==="tr"?"Menü üstünde ince bir şerit":"A slim ribbon atop the menu")}
                    </div>
                  </button>
                ))}
              </div>
            </Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"14px 0",
              borderTop:"1px solid var(--line)"}}>
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".1em",textTransform:"uppercase",fontWeight:500}}>{lang==="tr"?"Gösterim":"Impressions"}</div>
                <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",marginTop:2,
                  fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{draft.impressions.toLocaleString()}</div>
              </div>
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".1em",textTransform:"uppercase",fontWeight:500}}>{lang==="tr"?"Tıklama":"Claims"}</div>
                <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",marginTop:2,
                  fontFamily:"var(--font-display,'Bricolage Grotesque')"}}>{draft.claims}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Button variant="danger" icon="trash" onClick={()=>setConfirmDel(draft.id)}>{t("delete")}</Button>
              <div style={{flex:1}}/>
              <Button variant="soft" icon={draft.status==="active"?"pause":"play"} onClick={()=>{toggle(draft); setDraft({...draft, status: draft.status==="active"?"paused":"active"});}}>
                {draft.status==="active"?(lang==="tr"?"Duraklat":"Pause"):(lang==="tr"?"Yayınla":"Activate")}
              </Button>
              <Button variant="primary" icon="check" onClick={saveDraft}>{t("save")}</Button>
            </div>
          </div>}
        </Card>
      </div>

      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} width={420}
        title={lang==="tr"?"Kampanyayı sil?":"Delete campaign?"}
        subtitle={lang==="tr"?"Bu işlem geri alınamaz.":"This cannot be undone."}>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setConfirmDel(null)}>{t("cancel")}</Button>
          <Button variant="danger" icon="trash" onClick={deleteSel}>{t("delete")}</Button>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Orders, Campaigns });
