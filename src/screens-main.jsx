// Dashboard + Categories screens.

const Dashboard = ({t, lang, products, categories, calls, onboarding, onNavigate,
    members, loyaltyCampaigns, loyaltyConfig}) => {
  const scansToday = 142;
  const scansTotal = 18_430;
  const ordersToday = 38;
  const revenueToday = 4820;
  const avgCheck = 127;
  const doneSteps = onboarding.filter(o=>o.done).length;
  const progress = doneSteps / onboarding.length;

  const topProducts = [...products].sort((a,b)=>b.sales-a.sales).slice(0,5);

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_business")+" · Karaköy"}
        title={lang==="tr"?"Günaydın, Melis":"Good morning, Melis"}
        sub={lang==="tr"?"Kafenin bugünkü nabzı. Her şey yolunda görünüyor — kahve üretimi dünden %18 yüksek.":"Today's pulse at a glance. Things look good — coffee output is up 18% versus yesterday."}
        actions={<>
          <Button variant="soft" icon="download" size="md">{lang==="tr"?"Rapor":"Export"}</Button>
          <Button variant="primary" icon="plus" size="md" onClick={()=>onNavigate("products")}>{lang==="tr"?"Ürün ekle":"Add product"}</Button>
        </>}
      />

      {/* KPI row */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14}}>
        {[
          {label:t("scans"),  value:scansToday,   sub:`${scansTotal.toLocaleString()} ${lang==="tr"?"toplam":"total"}`, trend:[20,25,30,28,36,42,45,50,58,62], change:"+12%"},
          {label:t("orders"), value:ordersToday,  sub:lang==="tr"?"bugün":"today",       trend:[6,8,10,14,12,18,22,28,32,38],  change:"+8%"},
          {label:t("revenue"),value:`₺${revenueToday}`, sub:lang==="tr"?"bugün":"today", trend:[420,480,560,520,610,680,740,820,780,820], change:"+22%", accent:true},
          {label:t("avgCheck"), value:`₺${avgCheck}`, sub:lang==="tr"?"sipariş başına":"per order", trend:[118,120,125,122,126,128,130,127,128,127], change:"+2%"},
        ].map((k,i)=> (
          <Card key={i} pad={18}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"start"}}>
              <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".12em",
                textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>{k.label}</div>
              <Pill tone="ok">{k.change}</Pill>
            </div>
            <div style={{fontSize:32, fontWeight:500, letterSpacing:"-0.03em",
              color: k.accent?"var(--accent)":"var(--ink)", marginTop:10, lineHeight:1,
              fontFamily:"var(--font-display, 'Fraunces')"}}>{k.value}</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"end", marginTop:10}}>
              <div style={{fontSize:11, color:"var(--ink-3)"}}>{k.sub}</div>
              <Sparkline data={k.trend} width={80} height={22} color={k.accent?"var(--accent)":"var(--olive)"}/>
            </div>
          </Card>
        ))}
      </div>

      {/* two columns */}
      <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:14}}>
        {/* onboarding */}
        <Card pad={0}>
          <div style={{padding:"18px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"start"}}>
            <div>
              <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".14em",
                textTransform:"uppercase", color:"var(--accent)", fontWeight:500}}>{t("onboarding")}</div>
              <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.02em", marginTop:4,
                fontFamily:"var(--font-display,'Fraunces')"}}>
                {doneSteps}/{onboarding.length} · {lang==="tr"?"kurulum tamamlandı":"setup completed"}
              </div>
              <div style={{fontSize:13, color:"var(--ink-3)", marginTop:2}}>{t("onboardingSub")}</div>
            </div>
            <div style={{width:64, height:64, position:"relative"}}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" strokeWidth="4"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" strokeWidth="4"
                  strokeDasharray={`${progress*163.36} 163.36`} strokeLinecap="round"
                  transform="rotate(-90 32 32)" style={{transition:"stroke-dasharray .6s ease"}}/>
              </svg>
              <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center",
                fontSize:14, fontWeight:600, fontFamily:"'DM Mono',ui-monospace,monospace"}}>{Math.round(progress*100)}%</div>
            </div>
          </div>
          <div style={{padding:"16px 14px 18px", display:"grid", gap:2}}>
            {onboarding.map((o,i)=>(
              <div key={o.id} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 8px",
                borderRadius:8, transition:"background .1s", cursor:"pointer",
                ...(o.done?{}:{background:i===doneSteps?"var(--paper-2)":"transparent"})}}>
                <div style={{width:22, height:22, borderRadius:"50%",
                  background: o.done?"var(--accent)":"transparent",
                  border:`1.5px solid ${o.done?"var(--accent)":"var(--line-2)"}`,
                  display:"grid", placeItems:"center", flexShrink:0}}>
                  {o.done && <Icon name="check" size={12} stroke="#FFF8EC"/>}
                </div>
                <div style={{flex:1, fontSize:13.5, fontWeight: o.done?400:600,
                  color: o.done?"var(--ink-3)":"var(--ink)",
                  textDecoration: o.done?"line-through":"none"}}>{o[lang]}</div>
                {!o.done && i===doneSteps && <Button variant="soft" size="sm">{lang==="tr"?"Başla":"Start"}</Button>}
              </div>
            ))}
          </div>
        </Card>

        {/* service requests */}
        <Card pad={0}>
          <div style={{padding:"18px 22px 14px", display:"flex", justifyContent:"space-between", alignItems:"center",
            borderBottom:"1px solid var(--line)"}}>
            <div>
              <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".14em",
                textTransform:"uppercase", color:"var(--accent)", fontWeight:500}}>LIVE</div>
              <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em", marginTop:2,
                fontFamily:"var(--font-display,'Fraunces')"}}>{t("waiterCallsTitle")}</div>
            </div>
            <div style={{display:"inline-flex", alignItems:"center", gap:6}}>
              <span style={{width:8, height:8, borderRadius:"50%", background:"var(--accent)",
                animation:"pulse 1.4s ease-in-out infinite"}}/>
              <span style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", color:"var(--ink-2)"}}>{calls.length} active</span>
            </div>
          </div>
          <div>
            {calls.map(c => (
              <div key={c.id} style={{display:"grid", gridTemplateColumns:"auto 1fr auto",
                gap:12, padding:"14px 22px", borderBottom:"1px solid var(--line)", alignItems:"center"}}>
                <div style={{width:44, height:44, borderRadius:12, background:"var(--accent-soft)",
                  display:"grid", placeItems:"center", color:"var(--accent-ink)"}}>
                  <Icon name="bell" size={18} style={{animation: c.mins===0?"bell 1.2s ease-in-out infinite":""}}/>
                </div>
                <div>
                  <div style={{fontSize:14, fontWeight:600}}>
                    {lang==="tr"?"Masa":"Table"} <span style={{fontFamily:"'DM Mono',ui-monospace,monospace"}}>{c.table}</span>
                  </div>
                  <div style={{fontSize:12, color:"var(--ink-3)", marginTop:2}}>
                    {c.reason[lang]} · {c.mins===0?t("justNow"):`${c.mins} ${t("minute")}`}
                  </div>
                </div>
                <Button variant="soft" size="sm">{t("resolve")}</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top products + smart suggestion */}
      <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:14}}>
        <Card pad={0}>
          <div style={{padding:"18px 22px 14px", borderBottom:"1px solid var(--line)",
            display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em",
              fontFamily:"var(--font-display,'Fraunces')"}}>
              {lang==="tr"?"En çok satanlar":"Best sellers"} · {lang==="tr"?"Bu hafta":"This week"}
            </div>
            <Button variant="ghost" size="sm" icon="chev-right" onClick={()=>onNavigate("products")}>
              {lang==="tr"?"Tümü":"All"}
            </Button>
          </div>
          {topProducts.map((p,i)=> (
            <div key={p.id} style={{display:"grid", gridTemplateColumns:"26px 56px 1fr auto auto",
              gap:14, padding:"12px 22px", borderBottom: i<topProducts.length-1?"1px solid var(--line)":"none",
              alignItems:"center"}}>
              <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", color:"var(--ink-3)",
                fontWeight:500}}>#{String(i+1).padStart(2,"0")}</div>
              <FoodTile kind={p.hero} w={56} h={42}/>
              <div>
                <div style={{fontSize:14, fontWeight:600}}>{p.name[lang]}</div>
                <div style={{fontSize:11, color:"var(--ink-3)", marginTop:2, fontFamily:"'DM Mono',ui-monospace,monospace"}}>
                  {p.sales} × ₺{p.price} · ₺{(p.sales*p.price).toLocaleString()}
                </div>
              </div>
              <Sparkline data={p.trend} width={72} height={22}/>
              <div style={{fontSize:13, fontWeight:600, fontFamily:"'DM Mono',ui-monospace,monospace",
                color:"var(--accent)"}}>+{Math.round(Math.random()*30+5)}%</div>
            </div>
          ))}
        </Card>

        <Card pad={0} style={{background:"linear-gradient(135deg, var(--paper-3), var(--paper-2))",
          overflow:"hidden", position:"relative"}}>
          <div style={{padding:"20px 22px"}}>
            <div style={{display:"flex", alignItems:"center", gap:6, color:"var(--accent)",
              fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".14em",
              textTransform:"uppercase", fontWeight:500}}>
              <Icon name="sparkle" size={14}/> {t("smartSuggest")}
            </div>
            <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.02em", marginTop:10,
              fontFamily:"var(--font-display,'Fraunces')", lineHeight:1.25}}>
              {lang==="tr"
                ? "Filtre & Slow kategorin hafiflemiş. Bu hafta 3 yeni tek-kaynak öner."
                : "Your Filter & Slow shelf looks thin. Suggest 3 new single-origins this week."}
            </div>
            <div style={{fontSize:13, color:"var(--ink-2)", marginTop:10, lineHeight:1.55}}>
              {lang==="tr"
                ? "Geisha ve Yirgacheffe dışında tek ürün kaldı. Kenya AA veya Sumatra Mandheling benzer ciro profilinde."
                : "Only one product beyond Geisha and Yirgacheffe. Kenya AA or Sumatra Mandheling fit the same revenue profile."}
            </div>
            <div style={{display:"flex", gap:8, marginTop:16}}>
              <Button variant="accent" size="sm" icon="sparkle">{lang==="tr"?"Öneriyi uygula":"Apply"}</Button>
              <Button variant="ghost" size="sm">{lang==="tr"?"Daha sonra":"Later"}</Button>
            </div>
          </div>
          {/* decorative corner */}
          <div style={{position:"absolute", bottom:-30, right:-30, width:140, height:140,
            borderRadius:"50%", background:"var(--accent)", opacity:.08, pointerEvents:"none"}}/>
        </Card>
      </div>

      {/* Loyalty snapshot */}
      {members && members.length > 0 && (
        <LoyaltyWidget lang={lang} members={members} campaigns={loyaltyCampaigns||[]}
          config={loyaltyConfig||{}} onNavigate={onNavigate}/>
      )}
    </div>
  );
};

/* ─── Loyalty widget (dashboard) ─── */
const LoyaltyWidget = ({lang, members, campaigns, config, onNavigate}) => {
  const total = members.length;
  const thisMonth = new Date().toISOString().slice(0,7);
  const newThisMonth = members.filter(m => m.since && m.since.startsWith(thisMonth)).length;
  const totalPoints = members.reduce((s,m)=>s+(m.points||0), 0);
  const nearReward = members
    .filter(m => {
      const need = (config.rewardAt||500) - (m.points||0);
      return need > 0 && need <= 150;
    })
    .sort((a,b)=>b.points-a.points)
    .slice(0,4);
  const recent = [...members].sort((a,b)=>{
    const A = a.lastVisit || "", B = b.lastVisit || "";
    return B.localeCompare(A);
  }).slice(0,5);
  const birthdaysThisMonth = members.filter(m => {
    if (!m.birthday) return false;
    return new Date(m.birthday).getMonth() === new Date().getMonth();
  }).length;
  const activeCampaigns = campaigns.filter(c => c.status !== "draft").length;

  return (
    <Card pad={0} style={{overflow:"hidden"}}>
      <div style={{padding:"18px 22px 14px", borderBottom:"1px solid var(--line)",
        display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace",
            letterSpacing:".14em", textTransform:"uppercase", color:"var(--accent)",
            fontWeight:500, display:"flex", alignItems:"center", gap:6}}>
            <Icon name="gift" size={12}/> {lang==="tr"?"Sadakat":"Loyalty"}
          </div>
          <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em", marginTop:2,
            fontFamily:"var(--font-display,'Fraunces')"}}>
            {lang==="tr"?"Üye nabzı":"Member pulse"}
          </div>
        </div>
        <Button variant="ghost" size="sm" icon="chev-right" onClick={()=>onNavigate("loyalty")}>
          {lang==="tr"?"Program":"Program"}
        </Button>
      </div>

      {/* stat strip */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)",
        borderBottom:"1px solid var(--line)"}}>
        {[
          {k: total.toString(), label: lang==="tr"?"Toplam üye":"Members",
           sub: newThisMonth ? (lang==="tr"?`+${newThisMonth} bu ay`:`+${newThisMonth} this month`) : "—"},
          {k: totalPoints.toLocaleString(), label: lang==="tr"?"Puan havuzu":"Point pool",
           sub: lang==="tr"?"dolaşımda":"in circulation"},
          {k: birthdaysThisMonth.toString(), label: lang==="tr"?"Doğum günü":"Birthdays",
           sub: lang==="tr"?"bu ay":"this month"},
          {k: activeCampaigns.toString(), label: lang==="tr"?"Kampanya":"Campaigns",
           sub: lang==="tr"?"aktif":"active", accent:true},
        ].map((s,i) => (
          <div key={i} style={{padding:"16px 22px",
            borderRight: i<3?"1px solid var(--line)":"none"}}>
            <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace",
              letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-3)",
              fontWeight:500}}>{s.label}</div>
            <div style={{fontSize:28, fontWeight:500, letterSpacing:"-0.03em", marginTop:8,
              fontFamily:"var(--font-display,'Fraunces')",
              color: s.accent?"var(--accent)":"var(--ink)", lineHeight:1}}>
              {s.k}
            </div>
            <div style={{fontSize:11, color:"var(--ink-3)", marginTop:8,
              fontFamily:"'DM Mono',ui-monospace,monospace"}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* two-column: near reward + recent activity */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
        <div style={{padding:"16px 22px", borderRight:"1px solid var(--line)"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:12}}>
            <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace",
              letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-3)",
              fontWeight:500}}>
              {lang==="tr"?"Ödüle yakın":"Near reward"}
            </div>
            <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
              {nearReward.length} {lang==="tr"?"üye":"members"}
            </div>
          </div>
          {nearReward.length === 0 ? (
            <div style={{fontSize:12, color:"var(--ink-3)", padding:"8px 0"}}>
              {lang==="tr"?"Kimse ödüle yakın değil.":"Nobody close to a reward."}
            </div>
          ) : (
            <div style={{display:"grid", gap:10}}>
              {nearReward.map(m => {
                const pct = Math.min(100, ((m.points||0) / (config.rewardAt||500)) * 100);
                const ini = m.name.split(" ").map(x=>x[0]).join("").slice(0,2);
                return (
                  <div key={m.id} style={{display:"grid",
                    gridTemplateColumns:"28px 1fr auto", gap:10, alignItems:"center"}}>
                    <div style={{width:28, height:28, borderRadius:"50%",
                      background:"var(--paper-2)", display:"grid", placeItems:"center",
                      fontSize:11, fontFamily:"var(--font-display)", fontStyle:"italic",
                      fontWeight:600}}>{ini}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12.5, fontWeight:500, whiteSpace:"nowrap",
                        overflow:"hidden", textOverflow:"ellipsis"}}>{m.name}</div>
                      <div style={{height:4, background:"var(--line)", borderRadius:2,
                        marginTop:4, overflow:"hidden"}}>
                        <div style={{width:`${pct}%`, height:"100%",
                          background:"var(--accent)", borderRadius:2,
                          transition:"width .6s ease"}}/>
                      </div>
                    </div>
                    <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                      color:"var(--ink-2)", fontWeight:600, textAlign:"right"}}>
                      {m.points}<span style={{color:"var(--ink-3)"}}>/{config.rewardAt||500}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{padding:"16px 22px"}}>
          <div style={{fontSize:11, fontFamily:"'DM Mono',ui-monospace,monospace",
            letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-3)",
            fontWeight:500, marginBottom:12}}>
            {lang==="tr"?"Son ziyaretler":"Recent visits"}
          </div>
          <div style={{display:"grid", gap:8}}>
            {recent.map(m => {
              const ini = m.name.split(" ").map(x=>x[0]).join("").slice(0,2);
              return (
                <div key={m.id} style={{display:"grid",
                  gridTemplateColumns:"24px 1fr auto", gap:10, alignItems:"center",
                  padding:"4px 0"}}>
                  <div style={{width:24, height:24, borderRadius:"50%",
                    background:"var(--paper-2)", display:"grid", placeItems:"center",
                    fontSize:10, fontFamily:"var(--font-display)", fontStyle:"italic",
                    fontWeight:600}}>{ini}</div>
                  <div style={{fontSize:12.5, fontWeight:500, whiteSpace:"nowrap",
                    overflow:"hidden", textOverflow:"ellipsis"}}>
                    {m.name}
                    <span style={{color:"var(--ink-3)", fontWeight:400, marginLeft:6,
                      fontSize:11}}>
                      · {m.visits} {lang==="tr"?"ziyaret":"visits"}
                    </span>
                  </div>
                  <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                    color:"var(--ink-3)"}}>
                    {m.lastVisit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Categories = ({t, lang, categories, setCategories, onNavigate, onAddNew, onEdit}) => {
  const [drag, setDrag] = React.useState(null);
  const move = (from, to) => {
    const n = [...categories];
    const [x] = n.splice(from, 1);
    n.splice(to, 0, x);
    setCategories(n);
  };
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_menu")}
        title={t("nav_categories")}
        sub={lang==="tr"
          ?"Menünün ana bölümleri. Sürükleyerek sırala, görselleri güncelle, menüde görünürlüklerini kontrol et."
          :"The top-level sections of your menu. Drag to reorder, update imagery, control visibility."}
        actions={<>
          <Button variant="soft" icon="sort" size="md">{lang==="tr"?"Sırala":"Sort"}</Button>
          <Button variant="primary" icon="plus" size="md" onClick={onAddNew}>{t("addNew")}</Button>
        </>}
      />
      <Card pad={0}>
        <div style={{padding:"14px 22px", display:"grid", gridTemplateColumns:"40px 80px 1fr 140px 120px 180px",
          gap:14, borderBottom:"1px solid var(--line)", fontSize:11, fontWeight:600,
          color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:".08em",
          fontFamily:"'DM Mono',ui-monospace,monospace"}}>
          <span/>
          <span>{t("image")}</span>
          <span>{t("name")}</span>
          <span>{t("products")}</span>
          <span>{t("status")}</span>
          <span style={{textAlign:"right"}}>{t("actions")}</span>
        </div>
        {categories.map((c,i)=> (
          <div key={c.id}
            draggable
            onDragStart={()=>setDrag(i)}
            onDragOver={e=>{e.preventDefault();}}
            onDrop={()=>{ if(drag!==null && drag!==i) move(drag, i); setDrag(null); }}
            style={{display:"grid", gridTemplateColumns:"40px 80px 1fr 140px 120px 180px",
            gap:14, padding:"14px 22px", borderBottom:"1px solid var(--line)",
            alignItems:"center", background: drag===i?"var(--paper-2)":"transparent",
            transition:"background .12s"}}>
            <button style={{display:"grid",placeItems:"center",cursor:"grab",color:"var(--ink-3)",
              padding:4, borderRadius:6}}><Icon name="drag" size={18}/></button>
            <FoodTile kind={c.hero} w={64} h={48}/>
            <div>
              <div style={{fontSize:15, fontWeight:600, display:"flex", alignItems:"center", gap:8}}>
                {c.name[lang]}
                {c.badge==="new" && <Pill tone="accent">NEW</Pill>}
              </div>
              <div style={{fontSize:12, color:"var(--ink-3)", marginTop:2, fontFamily:"'DM Mono',ui-monospace,monospace"}}>
                /menu/{c.id}
              </div>
            </div>
            <div style={{fontSize:14, fontFamily:"'DM Mono',ui-monospace,monospace", color:"var(--ink-2)"}}>
              {c.count} <span style={{color:"var(--ink-3)"}}>{t("products").toLowerCase()}</span>
            </div>
            <Toggle on={c.active} onChange={v=>{
              const n=[...categories]; n[i]={...n[i],active:v}; setCategories(n);
            }}/>
            <div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
              <Button variant="ghost" size="sm" icon="eye" onClick={()=>onNavigate("products")}>
                {t("products")}
              </Button>
              <Button variant="ghost" size="sm" icon="edit" onClick={()=>onEdit && onEdit(c)}>{t("edit")}</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

Object.assign(window, { Dashboard, Categories });
