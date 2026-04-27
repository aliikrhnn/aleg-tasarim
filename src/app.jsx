// Main app — wires everything together.

const { useState, useEffect, useMemo } = React;

const TWEAKS = /*EDITMODE-BEGIN*/{
  "theme": "warm",
  "lang": "tr",
  "accent": "#C4553A",
  "density": "comfortable",
  "showPreview": true,
  "font": "warm"
}/*EDITMODE-END*/;

const FONT_PRESETS = {
  warm: {
    name: {tr:"Warm Editorial", en:"Warm Editorial"},
    sub:  {tr:"Fraunces · italic", en:"Fraunces · italic"},
    display: "'Fraunces','Iowan Old Style','Palatino',Georgia,serif",
    body:    "'Fraunces','Iowan Old Style','Palatino',Georgia,serif",
    mono:    "'DM Mono',ui-monospace,Menlo,monospace",
    displayStyle: "italic",
    feature:   '"ss01","ss03","cv11"',
    variation: '"SOFT" 100, "WONK" 0',
    sample: "Aleg",
  },
  hot: {
    name: {tr:"Hot Italic", en:"Hot Italic"},
    sub:  {tr:"Playfair + Plex Serif", en:"Playfair + Plex Serif"},
    display: "'Playfair Display', 'Didot', Georgia, serif",
    body:    "'IBM Plex Serif', 'Iowan Old Style', Georgia, serif",
    mono:    "'JetBrains Mono', ui-monospace, Menlo, monospace",
    displayStyle: "italic",
    feature:   '"liga","kern"',
    variation: 'normal',
    sample: "Aleg",
  },
  brutal: {
    name: {tr:"Brutalist Spice", en:"Brutalist Spice"},
    sub:  {tr:"Bricolage + Instrument", en:"Bricolage + Instrument"},
    display: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
    body:    "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
    mono:    "'Space Mono', ui-monospace, Menlo, monospace",
    displayStyle: "normal",
    feature:   '"ss01","ss02"',
    variation: 'normal',
    sample: "Aleg",
  },
};

function App(){
  // persisted playback state
  const [screen, setScreen] = useState(()=> localStorage.getItem("aleg:screen") || "dashboard");
  const [lang, setLang] = useState(TWEAKS.lang);
  const [theme, setTheme] = useState(TWEAKS.theme);
  const [accent, setAccent] = useState(TWEAKS.accent);
  const [density, setDensity] = useState(TWEAKS.density);
  const [showPreview, setShowPreview] = useState(TWEAKS.showPreview);
  const [font, setFont] = useState(TWEAKS.font || "warm");
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [stationFocus, setStationFocus] = useState(false);

  const [categories, setCategories] = useState(CATEGORIES_SEED);
  const [products, setProducts] = useState(PRODUCTS_SEED);
  const [calls, setCalls] = useState(CALLS_SEED);
  const [onboarding] = useState(ONBOARDING_SEED);
  const [orders, setOrders] = useState(ORDERS_SEED);
  const [campaigns, setCampaigns] = useState(CAMPAIGNS_SEED);
  const [shiftsData, setShiftsData] = useState(SHIFTS_SEED);
  const [staff, setStaff] = useState(STAFF_SEED);
  const [team, setTeam] = useState(TEAM_SEED);
  const [branches, setBranches] = useState(BRANCHES_SEED);
  const [stock, setStock] = useState(STOCK_SEED);
  const [reviews, setReviews] = useState(REVIEWS_SEED);
  const [modules, setModules] = useState(MODULES_SEED);
  const [stations, setStations] = useState(STATIONS_SEED);
  const [roles, setRoles] = useState(ROLES_SEED);
  const [tables, setTables] = useState(TABLES_SEED);
  const [zones, setZones] = useState(TABLE_ZONES_SEED);
  const [tickets, setTickets] = useState(TICKETS_SEED);
  const [daySummary] = useState(DAILY_SUMMARY_SEED);
  const [loyaltyMembers, setLoyaltyMembers] = useState(LOYALTY_SEED);
  const [loyaltyConfig, setLoyaltyConfig] = useState(LOYALTY_CONFIG_SEED);
  const [loyaltyCampaigns, setLoyaltyCampaigns] = useState(LOYALTY_CAMPAIGNS_SEED);
  const [loyaltyNotifications, setLoyaltyNotifications] = useState(LOYALTY_NOTIFICATIONS_SEED);

  // Delivery / phone-order module
  const [deliveryCustomers, setDeliveryCustomers] = useState(DELIVERY_CUSTOMERS_SEED);
  const [couriers, setCouriers] = useState(COURIERS_SEED);
  const [deliveryOrders, setDeliveryOrders] = useState(DELIVERY_ORDERS_SEED);
  const [callLog, setCallLog] = useState(CALL_LOG_SEED);
  const [deliveryConfig, setDeliveryConfig] = useState(DELIVERY_CONFIG_SEED);
  const [incomingCall, setIncomingCall] = useState(null);
  const [deliveryComposerSeed, setDeliveryComposerSeed] = useState(null);
  const ringPhone = (phone) => {
    const c = deliveryCustomers.find(x => x.phone.replace(/\s/g,"")===phone.replace(/\s/g,"")) || null;
    setIncomingCall({ phone, customer:c, state:"ringing", startedAt: Date.now() });
  };

  // Category modal
  const [catModal, setCatModal] = useState({open:false, mode:"add", draft:null, editId:null});
  const openAddCategory = () => setCatModal({open:true, mode:"add", editId:null,
    draft:{name:{tr:"",en:""}, hero:"coffee", active:true, badge:null, count:0}});
  const openEditCategory = (c) => setCatModal({open:true, mode:"edit", editId:c.id, draft:{...c}});
  const closeCatModal = () => setCatModal(m=>({...m, open:false}));
  const setCatDraft = (d) => setCatModal(m=>({...m, draft:d}));
  const saveCategory = () => {
    const d = catModal.draft;
    if (catModal.mode === "edit") {
      setCategories(categories.map(c => c.id===catModal.editId ? {...d, id:catModal.editId} : c));
    } else {
      setCategories([...categories, {...d, id:"c_"+Date.now(), count: d.count||0}]);
    }
    closeCatModal();
  };
  const [shiftTemplates, setShiftTemplates] = useState({
    morning: {start:"07:00", end:"15:00"},
    mid:     {start:"11:00", end:"19:00"},
    evening: {start:"15:00", end:"23:00"},
  });
  const [serviceFee, setServiceFee] = useState(10);
  const [logoSrc, setLogoSrc] = useState(()=> localStorage.getItem("aleg:logo") || null);
  const [previewView, setPreviewView] = useState("menu");
  const [previewCampaign, setPreviewCampaign] = useState(null);

  // Guest app content (editable from Brand → App tab)
  const APP_CONFIG_DEFAULTS = {
    heroTitle:      {tr:"Ne içersin?",                 en:"What'll it be?"},
    heroSubtitle:   {tr:"İyi günler",                  en:"Good day"},
    locationLabel:  {tr:"Karaköy · AÇIK",              en:"Karaköy · OPEN"},
    modeDineIn:     {tr:"Masada",                      en:"Dine-in"},
    modePickup:     {tr:"Al götür",                    en:"Pickup"},
    modeDelivery:   {tr:"Paket",                       en:"Delivery"},
    featuredLabel:  {tr:"Öne Çıkanlar",                en:"Featured"},
    searchPlaceholder:{tr:"Menüde ara…",               en:"Search menu…"},
    loyaltyNudge:   {tr:"puan sonra ücretsiz kahve",   en:"pts to free coffee"},
    emptyCartTitle: {tr:"Sepetiniz boş",               en:"Your cart is empty"},
    emptyCartSub:   {tr:"Menüden ürün ekleyerek başla",en:"Browse the menu to start an order."},
    checkoutCta:    {tr:"Siparişi onayla",             en:"Place order"},
    reviewThanks:   {tr:"Teşekkürler!",                en:"Thanks a lot!"},
    reviewBonus:    {tr:"+25 bonus puan",              en:"+25 bonus points"},
    welcomeTitle:   {tr:"Aleg'e hoşgeldin",            en:"Welcome to Aleg"},
    welcomeSub:     {tr:"Üye ol, 50 hoşgeldin puanını kap.", en:"Sign up, grab 50 welcome points."},
    trackerTitleLive:{tr:"Siparişiniz yolda",          en:"Your order is on the way"},
    trackerTitleDone:{tr:"Afiyet olsun",               en:"Enjoy your order"},
    heroImage: null,   // data URL or null
    showHeroImage: false,
    accentOverlayOpacity: 0,
  };
  const [appConfig, setAppConfig] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("aleg:app-config") || "{}");
      return {...APP_CONFIG_DEFAULTS, ...stored};
    } catch { return APP_CONFIG_DEFAULTS; }
  });
  useEffect(()=>{
    try { localStorage.setItem("aleg:app-config", JSON.stringify(appConfig)); } catch(_) {}
  }, [appConfig]);

  useEffect(()=>{
    if (logoSrc) localStorage.setItem("aleg:logo", logoSrc);
    else localStorage.removeItem("aleg:logo");
  }, [logoSrc]);

  useEffect(()=>{ localStorage.setItem("aleg:screen", screen); }, [screen]);
  useEffect(()=>{ document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(()=>{ document.documentElement.style.setProperty("--accent", accent); window.__appLang = lang; }, [accent, lang]);

  useEffect(()=>{
    const p = FONT_PRESETS[font] || FONT_PRESETS.warm;
    const r = document.documentElement.style;
    r.setProperty("--font-display",       p.display);
    r.setProperty("--font-body",          p.body);
    r.setProperty("--font-mono",          p.mono);
    r.setProperty("--font-display-style", p.displayStyle);
    r.setProperty("--font-feature",       p.feature);
    r.setProperty("--font-variation",     p.variation);
  }, [font]);

  // ⌘K
  useEffect(()=>{
    const h = (e) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="k"){ e.preventDefault(); setCmdOpen(o=>!o); }
      if (e.key==="Escape"){ setCmdOpen(false); setTweaksOpen(false); setProductOpen(false); }
    };
    window.addEventListener("keydown", h);
    return ()=>window.removeEventListener("keydown", h);
  }, []);

  // edit-mode protocol
  useEffect(()=>{
    const h = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", h);
    try { window.parent.postMessage({type:"__edit_mode_available"}, "*"); } catch(_) {}
    return ()=>window.removeEventListener("message", h);
  }, []);

  const persist = (k, v) => {
    try { window.parent.postMessage({type:"__edit_mode_set_keys", edits:{[k]:v}}, "*"); } catch(_) {}
  };

  const t = (k) => I18N[lang][k] || I18N.tr[k] || k;

  // Dynamic station routes: each station gets `station:<id>` route key.
  const stationScreens = {};
  stations.forEach(s => {
    stationScreens["station:"+s.id] = (
      <BarScreen t={t} lang={lang} orders={orders} setOrders={setOrders}
        station={s.kind||"bar"} stationConfig={s} staff={staff}
        categories={categories} products={products}
        focused={stationFocus} onEnterFocus={()=>setStationFocus(true)}
        onExitFocus={()=>{
          setStationFocus(false);
          if (document.fullscreenElement) document.exitFullscreen?.();
        }}/>
    );
  });

  // Exit focus when leaving a station route or when browser fullscreen is exited via ESC.
  useEffect(()=>{
    if (!screen.startsWith("station:") && screen!=="bar" && screen!=="kitchen") {
      if (stationFocus) setStationFocus(false);
    }
  }, [screen]);
  useEffect(()=>{
    const onFs = () => { if (!document.fullscreenElement) setStationFocus(false); };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const screens = {
    dashboard:  <Dashboard t={t} lang={lang} products={products} categories={categories} calls={calls}
                   onboarding={onboarding} onNavigate={setScreen}
                   members={loyaltyMembers} loyaltyCampaigns={loyaltyCampaigns} loyaltyConfig={loyaltyConfig}/>,
    categories: <Categories t={t} lang={lang} categories={categories} setCategories={setCategories}
                   onNavigate={setScreen} onAddNew={openAddCategory} onEdit={openEditCategory}/>,
    products:   <Products t={t} lang={lang} products={products} setProducts={setProducts}
                   categories={categories} onAddNew={()=>setProductOpen(true)}/>,

    appearance: <Appearance t={t} lang={lang} theme={theme} setTheme={setTheme}
                   accent={accent} setAccent={setAccent} density={density} setDensity={setDensity}
                   categories={categories} products={products}/>,
    qr:         <QRScreen t={t} lang={lang} branches={branches} tables={tables} zones={zones}/>,
    waiter:     <Waiter t={t} lang={lang} calls={calls} setCalls={setCalls}/>,
    orders:     <Orders t={t} lang={lang} orders={orders} setOrders={setOrders}/>,
    bar:        <BarScreen t={t} lang={lang} orders={orders} setOrders={setOrders}
                   station="bar" stationConfig={stations.find(s=>s.kind==="bar")} staff={staff}
                   categories={categories} products={products}
                   focused={stationFocus} onEnterFocus={()=>setStationFocus(true)}
                   onExitFocus={()=>{setStationFocus(false); if(document.fullscreenElement)document.exitFullscreen?.();}}/>,
    kitchen:    <BarScreen t={t} lang={lang} orders={orders} setOrders={setOrders}
                   station="kitchen" stationConfig={stations.find(s=>s.kind==="kitchen")} staff={staff}
                   categories={categories} products={products}
                   focused={stationFocus} onEnterFocus={()=>setStationFocus(true)}
                   onExitFocus={()=>{setStationFocus(false); if(document.fullscreenElement)document.exitFullscreen?.();}}/>,
    reviews:    <Reviews t={t} lang={lang} reviews={reviews} setReviews={setReviews} branches={branches}/>,
    modules:    <Modules t={t} lang={lang} modules={modules} setModules={setModules}/>,
    campaigns:  <Campaigns t={t} lang={lang} campaigns={campaigns} setCampaigns={setCampaigns}
                   onPreview={(c)=>{setPreviewCampaign(c); setPreviewView("campaign");}}/>,
    shifts:     <Shifts t={t} lang={lang} staff={staff} setStaff={setStaff}
                   shifts={shiftsData} setShifts={setShiftsData}
                   templates={shiftTemplates} setTemplates={setShiftTemplates}/>,
    stock:      <Stock t={t} lang={lang} stock={stock} setStock={setStock}/>,
    receipt:    <ReceiptDesigner t={t} lang={lang} orders={orders} logoSrc={logoSrc}
                   serviceFee={serviceFee} setServiceFee={setServiceFee}/>,
    brand:      <Brand t={t} lang={lang} logoSrc={logoSrc} setLogoSrc={setLogoSrc}
                   appConfig={appConfig} setAppConfig={setAppConfig}
                   appConfigDefaults={APP_CONFIG_DEFAULTS}
                   onPreviewApp={(view)=>{ if (view) setPreviewView(view); setScreen("brand"); }}/>,
    settings:   <Settings t={t} lang={lang}/>,
    branches:   <Branches t={t} lang={lang} branches={branches} setBranches={setBranches}/>,
    team:       <Team t={t} lang={lang} team={team} setTeam={setTeam} branches={branches}/>,
    stations_admin: <StationsAdmin t={t} lang={lang} stations={stations} setStations={setStations}
                      categories={categories} staff={staff}
                      onOpenStation={(id)=>setScreen("station:"+id)}/>,
    roles:      <Roles t={t} lang={lang} roles={roles} setRoles={setRoles}
                   sections={PERMISSION_SECTIONS} team={team}/>,
    tables:     <TablesScreen t={t} lang={lang} tables={tables} setTables={setTables}
                   zones={zones} setZones={setZones}
                   onOpenPOS={(tid)=>{
                     // ensure a ticket exists for this table then open POS
                     let tk = tickets.find(x=>x.tableId===tid);
                     if (!tk) {
                       const id = "tk_"+Date.now();
                       tk = {id, tableId:tid, openedAt:new Date().toISOString().replace("T"," ").slice(0,16),
                             guests:2, waiter:null, items:[], discountPct:0, discountFlat:0, tipPct:0, note:""};
                       setTickets(p => [...p, tk]);
                     }
                     setScreen("pos");
                   }}/>,
    pos:        <POSScreen t={t} lang={lang} tables={tables} setTables={setTables}
                   tickets={tickets} setTickets={setTickets}
                   zones={zones} products={products} categories={categories}
                   staff={staff} team={team} summary={daySummary}
                   members={loyaltyMembers} setMembers={setLoyaltyMembers}
                   loyaltyConfig={loyaltyConfig}
                   loyaltyOn={(modules||[]).find(m=>m.id==="loyalty")?.on !== false}
                   onOpenDrawer={()=>{}}/>,
    loyalty:    <LoyaltyScreen t={t} lang={lang}
                   members={loyaltyMembers} setMembers={setLoyaltyMembers}
                   loyaltyCampaigns={loyaltyCampaigns} setLoyaltyCampaigns={setLoyaltyCampaigns}
                   notifications={loyaltyNotifications} setNotifications={setLoyaltyNotifications}
                   config={loyaltyConfig} setConfig={setLoyaltyConfig}/>,
    delivery:   <DeliveryScreen t={t} lang={lang} products={products}
                   customers={deliveryCustomers} setCustomers={setDeliveryCustomers}
                   couriers={couriers} setCouriers={setCouriers}
                   orders={deliveryOrders} setOrders={setDeliveryOrders}
                   callLog={callLog} setCallLog={setCallLog}
                   config={deliveryConfig} setConfig={setDeliveryConfig}
                   ringPhone={ringPhone}
                   seed={deliveryComposerSeed} clearSeed={()=>setDeliveryComposerSeed(null)}/>,
    ...stationScreens,
  };

  if (stationFocus) {
    return (
      <div style={{position:"fixed",inset:0,background:"var(--paper)",overflowY:"auto",
        zIndex:1000,padding:"28px 32px"}}>
        {screens[screen]}
        <div style={{height:40}}/>
      </div>
    );
  }

  return (
    <div style={{display:"flex", minHeight:"100vh", height:"100vh", overflow:"hidden"}}>
      <Sidebar t={t} lang={lang} current={screen} onNavigate={setScreen}
        collapsed={collapsed} onToggleCollapse={()=>setCollapsed(c=>!c)}
        stations={stations} modules={Object.fromEntries((modules||[]).map(m=>[m.id, m.on]))}
        badges={{ delivery: deliveryOrders.filter(o => !["delivered","cancelled"].includes(o.stage)).length }}/>
      <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>
        <Topbar t={t} lang={lang} setLang={(l)=>{setLang(l);persist("lang",l);}}
          onOpenCmd={()=>setCmdOpen(true)} showPreview={showPreview}
          setShowPreview={(v)=>{setShowPreview(v);persist("showPreview",v);}}
          onOpenTweaks={()=>setTweaksOpen(true)}/>
        <div style={{flex:1, display:"flex", overflow:"hidden"}}>
          <main style={{flex:1, padding:"28px 32px", overflowY:"auto"}}>
            {screens[screen]}
            <div style={{height:40}}/>
          </main>
          {showPreview && !["appearance","brand","stations_admin","roles","team","tables","pos","loyalty","delivery"].includes(screen) && !screen.startsWith("station:") && screen!=="bar" && screen!=="kitchen" && (
            <div style={{width:340, padding:"28px 20px", borderLeft:"1px solid var(--line)",
              background:"var(--paper-2)", display:"flex", flexDirection:"column", alignItems:"center",
              gap:16, overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".14em",
                    color:"var(--accent)",textTransform:"uppercase",fontWeight:500}}>LIVE</div>
                  <div style={{fontSize:14,fontWeight:600,letterSpacing:"-0.01em",marginTop:2}}>
                    {t("liveMenu")}
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon="close" onClick={()=>{setShowPreview(false);persist("showPreview",false);}}/>
              </div>
              <MenuPreview categories={categories} products={products}
                theme={theme==="espresso"?"dark":"cream"} brandName="Aleg"
                appConfig={appConfig}
                screen={previewView} campaign={previewCampaign}
                onScreenChange={setPreviewView}/>
              <div style={{height:24}}/>
              <div style={{fontSize:11,color:"var(--ink-3)",fontFamily:"'DM Mono',ui-monospace,monospace",
                textAlign:"center",letterSpacing:".06em"}}>
                menu.aleg.cafe/karakoy
              </div>
            </div>
          )}
          {showPreview && (screen === "appearance" || screen === "brand") && (
            <div style={{width:340, padding:"28px 20px", borderLeft:"1px solid var(--line)",
              background:"var(--paper-2)", display:"flex", flexDirection:"column", alignItems:"center",
              gap:16, overflowY:"auto"}}>
              <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".14em",
                color:"var(--accent)",textTransform:"uppercase",fontWeight:500,alignSelf:"flex-start"}}>
                {screen==="brand" ? (lang==="tr"?"MOBİL UYGULAMA":"MOBILE APP") : "PREVIEW"}
              </div>
              <MenuPreview categories={categories} products={products}
                theme={theme==="espresso"?"dark":"cream"} brandName="Aleg"
                appConfig={appConfig}
                screen={previewView} campaign={previewCampaign}
                onScreenChange={setPreviewView}/>
            </div>
          )}
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} lang={lang} onNavigate={setScreen}
        stations={stations}/>
      <CallerIdPopup lang={lang} incoming={incomingCall}
        onAnswer={()=>setIncomingCall(c=>c?{...c,state:"answered"}:c)}
        onDismiss={()=>setIncomingCall(null)}
        onNewOrder={(customer)=>{ setIncomingCall(null); setDeliveryComposerSeed({customer}); setScreen("delivery"); }}
        onNewCustomer={(phone)=>{ setIncomingCall(null); setDeliveryComposerSeed({phone}); setScreen("delivery"); }}/>
      <AddProductModal open={productOpen} onClose={()=>setProductOpen(false)}
        categories={categories} lang={lang} t={t} onSave={()=>{}}/>
      <AddCategoryModal open={catModal.open} onClose={closeCatModal} t={t} lang={lang}
        draft={catModal.draft} setDraft={setCatDraft} onSave={saveCategory} mode={catModal.mode}/>

      {/* Tweaks panel */}
      {tweaksOpen && (
        <div style={{position:"fixed", right:20, bottom:20, width:320, zIndex:90,
          background:"var(--card)", border:"1px solid var(--line)", borderRadius:16,
          boxShadow:"var(--shadow-lg)", padding:18, animation:"slideUp .22s cubic-bezier(.4,0,.2,1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500}}>{t("tweaks")}</div>
            <button onClick={()=>setTweaksOpen(false)} style={{width:26,height:26,borderRadius:"50%",
              display:"grid",placeItems:"center",color:"var(--ink-3)"}}><Icon name="close" size={14}/></button>
          </div>
          <div style={{display:"grid", gap:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ink-2)",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Theme</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
                {[
                  {id:"warm",      name:t("themeWarm"),     colors:["#F4EEE2","#2A1F18","#C4553A"]},
                  {id:"espresso",  name:t("themeEspresso"), colors:["#1A1410","#F2E9DA","#E08060"]},
                  {id:"swiss",     name:t("themeSwiss"),    colors:["#FAFAF7","#0B0B0A","#E33E1C"]},
                  {id:"editorial", name:t("themeEditorial"),colors:["#F2EEE8","#181412","#7E5B3A"]},
                ].map(th=>(
                  <button key={th.id} onClick={()=>{setTheme(th.id);persist("theme",th.id);}} style={{
                    padding:8,borderRadius:8,textAlign:"left",
                    border:`1.5px solid ${theme===th.id?"var(--accent)":"var(--line)"}`,
                    background:"var(--card-2)",display:"flex",alignItems:"center",gap:8
                  }}>
                    <div style={{display:"flex",gap:2}}>
                      {th.colors.map((c,i)=>(
                        <div key={i} style={{width:10,height:18,borderRadius:2,background:c,
                          border:"1px solid rgba(0,0,0,.08)"}}/>
                      ))}
                    </div>
                    <div style={{fontSize:11.5,fontWeight:600}}>{th.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ink-2)",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Accent</div>
              <div style={{display:"flex",gap:6}}>
                {["#C4553A","#6B7A4B","#B08A3E","#2E5B7A","#7E3A6B","#1E1E1E"].map(c=>(
                  <button key={c} onClick={()=>{setAccent(c);persist("accent",c);}} style={{
                    width:28,height:28,borderRadius:7,background:c,
                    border: accent===c?"2px solid var(--ink)":"1px solid var(--line)"
                  }}/>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ink-2)",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Typography</div>
              <div style={{display:"grid",gap:6}}>
                {Object.entries(FONT_PRESETS).map(([id, p]) => (
                  <button key={id} onClick={()=>{setFont(id);persist("font",id);}} style={{
                    display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                    borderRadius:8,textAlign:"left",
                    border:`1.5px solid ${font===id?"var(--accent)":"var(--line)"}`,
                    background: font===id?"var(--paper-2)":"var(--card-2)"
                  }}>
                    <div style={{
                      width:38,height:38,display:"grid",placeItems:"center",
                      fontFamily:p.display, fontStyle:p.displayStyle,
                      fontSize:22, fontWeight:600, color:"var(--ink)",
                      background:"var(--paper)",borderRadius:6,border:"1px solid var(--line)",
                      lineHeight:1
                    }}>{p.sample[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:"var(--ink)",
                        fontFamily:p.display,fontStyle:p.displayStyle}}>{p.name[lang]}</div>
                      <div style={{fontSize:10.5,color:"var(--ink-3)",
                        fontFamily:"'DM Mono',ui-monospace,monospace",
                        letterSpacing:".06em",marginTop:1}}>{p.sub[lang]}</div>
                    </div>
                    {font===id && <Icon name="check" size={14} style={{color:"var(--accent)"}}/>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ink-2)",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>{t("language")}</div>
              <Tabs tabs={[{id:"tr",label:"Türkçe"},{id:"en",label:"English"}]} active={lang}
                onChange={(l)=>{setLang(l);persist("lang",l);}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ink-2)",marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>{t("density")}</div>
              <Tabs tabs={[{id:"comfortable",label:t("comfortable")},{id:"compact",label:t("compact")}]}
                active={density} onChange={(d)=>{setDensity(d);persist("density",d);}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"8px 0",borderTop:"1px solid var(--line)"}}>
              <div style={{fontSize:12,color:"var(--ink-2)"}}>{t("liveMenu")}</div>
              <Toggle on={showPreview} onChange={(v)=>{setShowPreview(v);persist("showPreview",v);}}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
