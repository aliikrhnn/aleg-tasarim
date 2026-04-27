// Customer-facing phone app — full guest experience.
// Exports on window: MenuPreview, MiniPhone, STAGE_INDEX, STAGE_LABEL

const { useState: _uS, useEffect: _uE, useMemo: _uM, useRef: _uR } = React;

const STAGE_INDEX = { received:0, preparing:1, ready:2, delivered:3 };
const STAGE_LABEL = (lang, t) => [t("orderReceived"), t("orderPreparing"), t("orderReady"), t("orderDelivered")];

// ─── Theme helper ─────────────────────────────────────────
const makeTheme = (dark) => ({
  bg: dark ? "#0F0906" : "#F4EEE2",
  paper: dark ? "#1a1410" : "#FAF5EA",
  paperAlt: dark ? "#221913" : "#F0E7D3",
  text: dark ? "#F2E9DA" : "#2A1F18",
  text2: dark ? "#BFB19A" : "#5C4A3B",
  muted: dark ? "#8C7A63" : "#8C7A69",
  line: dark ? "#2a1f18" : "#E5D9C1",
  line2: dark ? "#3a2f24" : "#D6C9AB",
  accent: "#C4553A",
  accent2: "#E08060",
  gold: "#B08A3E",
  green: "#4F7C4C",
});

const money = (n) => `₺${n}`;
const pad2 = (n) => String(n).padStart(2,"0");

// ─── Shared tiny primitives ───────────────────────────────
const MonoLabel = ({children, color, style}) => (
  <span style={{fontSize:9.5, fontFamily:"var(--font-mono)", letterSpacing:".14em",
    textTransform:"uppercase", fontWeight:600, color, ...style}}>{children}</span>
);

const Chip = ({active, onClick, children, th, size="md"}) => {
  const pad = size==="sm" ? "5px 9px" : "6px 11px";
  const fs  = size==="sm" ? 10 : 10.5;
  return (
    <button onClick={onClick} style={{
      padding:pad, borderRadius:999, fontSize:fs, fontWeight:600, whiteSpace:"nowrap",
      background: active ? th.text : "transparent",
      color: active ? th.bg : th.text,
      border:`1px solid ${active?"transparent":th.line}`,
      transition:"all .15s ease", cursor:"pointer"
    }}>{children}</button>
  );
};

// ─── Bottom tab bar ───────────────────────────────────────
const TabBar = ({th, view, go, cartCount, hasActiveOrder, lang}) => {
  const tabs = [
    {id:"home",   icon:"home",   tr:"Ana sayfa", en:"Home"},
    {id:"orders", icon:"bag",    tr:"Siparişler", en:"Orders", badge: hasActiveOrder ? "•" : null},
    {id:"rewards",icon:"gift",   tr:"Ödüller",   en:"Rewards"},
    {id:"account",icon:"user",   tr:"Hesap",     en:"Account"},
  ];
  return (
    <div style={{display:"flex", borderTop:`1px solid ${th.line}`, background:th.bg, paddingBottom:16}}>
      {tabs.map(tab => {
        const active = view === tab.id || (tab.id==="home" && view==="menu")
          || (tab.id==="orders" && (view==="tracker" || view==="review" || view==="orderHistory"));
        return (
          <button key={tab.id} onClick={()=>go(tab.id)} style={{
            flex:1, padding:"8px 0 0", display:"flex", flexDirection:"column",
            alignItems:"center", gap:2, background:"transparent", position:"relative"
          }}>
            <div style={{position:"relative"}}>
              <Icon name={tab.icon} size={18} stroke={active?th.accent:th.muted}
                fill={active && tab.id==="rewards" ? th.accent : "none"}/>
              {tab.badge && <span style={{
                position:"absolute", top:-2, right:-4, width:7, height:7, borderRadius:"50%",
                background:th.accent
              }}/>}
            </div>
            <span style={{fontSize:9.5, fontWeight:600, color: active?th.accent:th.muted,
              letterSpacing:".02em"}}>{tab[lang]}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Status bar ───────────────────────────────────────────
const StatusBar = ({th}) => (
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"14px 22px 4px", fontSize:11, fontWeight:600,
    fontFamily:"var(--font-mono)", color:th.text}}>
    <span>9:41</span>
    <span style={{display:"inline-flex", gap:5, alignItems:"center", opacity:.75}}>
      <span style={{display:"inline-flex", gap:1.5}}>
        {[3,5,7,9].map(h=><span key={h} style={{width:2.5, height:h, background:th.text, borderRadius:1}}/>)}
      </span>
      <Icon name="wifi" size={11} stroke={th.text}/>
      <span style={{display:"inline-flex", width:20, height:9, borderRadius:2,
        border:`1px solid ${th.text}`, position:"relative", padding:1}}>
        <span style={{flex:1, background:th.text, borderRadius:1}}/>
        <span style={{position:"absolute", right:-2, top:2.5, width:1.5, height:4,
          background:th.text, borderRadius:"0 1px 1px 0"}}/>
      </span>
    </span>
  </div>
);

// ─── Screen header (back button variant) ──────────────────
const Header = ({th, title, sub, onBack, action}) => (
  <div style={{padding:"8px 16px 12px", display:"flex", alignItems:"center", gap:10,
    borderBottom:`1px solid ${th.line}`, minHeight:52}}>
    {onBack && (
      <button onClick={onBack} style={{width:30, height:30, borderRadius:"50%",
        background:th.paperAlt, border:`1px solid ${th.line}`, color:th.text,
        display:"grid", placeItems:"center", flexShrink:0}}>
        <Icon name="chev-right" size={14} stroke={th.text} style={{transform:"rotate(180deg)"}}/>
      </button>
    )}
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontSize:14.5, fontWeight:600, letterSpacing:"-0.01em", color:th.text,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{title}</div>
      {sub && <div style={{fontSize:10, color:th.muted, fontFamily:"var(--font-mono)",
        letterSpacing:".04em", marginTop:1}}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ─── HOME / MENU ──────────────────────────────────────────
const HomeScreen = ({th, lang, brandName, categories, products, account, cartCount, subtotal,
  activeCat, setActiveCat, addToCart, openProduct, openAccount, goCart, goOrders, hero, dineIn,
  appConfig={}, copy}) => {
  const _c = copy || ((k,f)=>f);
  const [search, setSearch] = _uS("");
  const greeting = (() => {
    const h = new Date().getHours();
    if (lang==="tr") return h<11?"Günaydın":h<18?"İyi günler":"İyi akşamlar";
    return h<11?"Good morning":h<18?"Good afternoon":"Good evening";
  })();
  const visibleCats = categories.filter(c=>c.active);
  const featured = products.filter(p=>p.badge==="new" || p.badge==="hot").slice(0,3);
  const catProducts = products.filter(p=>
    p.cat===activeCat && p.status!=="draft" && (!search ||
    (p.name[lang]||"").toLowerCase().includes(search.toLowerCase()) ||
    (p.desc[lang]||"").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{flex:1, overflow:"auto", paddingBottom:cartCount?68:0, position:"relative"}}>
      {/* Top sticky header area */}
      <div style={{padding:"10px 18px 12px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10}}>
          <div style={{minWidth:0, flex:1}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <span style={{width:6, height:6, borderRadius:"50%", background:th.green}}/>
              <MonoLabel color={th.muted}>{_c("locationLabel", lang==="tr"?"Karaköy · AÇIK":"Karaköy · OPEN")}</MonoLabel>
            </div>
            <div style={{fontSize:11.5, color:th.muted, marginTop:3}}>
              {_c("heroSubtitle", greeting)}{account?`, ${account.name.split(" ")[0]}`:""}
            </div>
            <div style={{fontSize:22, fontWeight:500, letterSpacing:"-0.025em",
              fontFamily:"var(--font-display)", fontStyle:"italic", lineHeight:1.15, color:th.text, marginTop:2}}>
              {_c("heroTitle", lang==="tr"?"Ne içersin?":"What'll it be?")}
            </div>
          </div>
          <button onClick={openAccount} style={{
            width:38, height:38, borderRadius:"50%", border:`1px solid ${th.line}`,
            background: account?th.accent:th.paperAlt,
            color: account?"#FFF8EC":th.text,
            display:"grid", placeItems:"center", fontSize:12, fontWeight:600,
            fontFamily:"var(--font-display)", fontStyle:"italic",
            flexShrink:0, position:"relative"
          }}>
            {account
              ? account.name.split(" ").map(s=>s[0]).join("").slice(0,2)
              : <Icon name="user" size={16} stroke={th.text}/>}
            {account?.points >= 500 && (
              <span style={{position:"absolute", top:-2, right:-2, width:10, height:10,
                borderRadius:"50%", background:th.gold, border:`2px solid ${th.bg}`}}/>
            )}
          </button>
        </div>

        {/* Search */}
        <div style={{marginTop:12, display:"flex", alignItems:"center", gap:6,
          padding:"8px 12px", background:th.paper, border:`1px solid ${th.line}`, borderRadius:12}}>
          <Icon name="search" size={13} stroke={th.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={_c("searchPlaceholder", lang==="tr"?"Menüde ara…":"Search menu…")}
            style={{flex:1, border:"none", outline:"none", background:"transparent",
              fontSize:12, color:th.text, fontFamily:"inherit"}}/>
          {search && <button onClick={()=>setSearch("")} style={{color:th.muted, fontSize:11}}>✕</button>}
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex", gap:6, marginTop:10}}>
          {[
            {id:"dinein", label:_c("modeDineIn", lang==="tr"?"Masada":"Dine-in"), icon:"home"},
            {id:"pickup", label:_c("modePickup", lang==="tr"?"Al götür":"Pickup"), icon:"bag"},
            {id:"delivery", label:_c("modeDelivery", lang==="tr"?"Paket":"Delivery"), icon:"scooter"},
          ].map((m,i)=>{
            const active = i===0;
            return (
              <button key={m.id} style={{
                flex:1, padding:"7px 6px", borderRadius:10, fontSize:10.5,
                fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                background: active?th.text:th.paper,
                color: active?th.bg:th.text2,
                border:`1px solid ${active?"transparent":th.line}`
              }}>
                <Icon name={m.icon} size={11} stroke={active?th.bg:th.text2}/>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional hero image banner */}
      {appConfig?.showHeroImage && appConfig?.heroImage && (
        <div style={{margin:"0 18px 12px", borderRadius:14, overflow:"hidden",
          height:120, border:`1px solid ${th.line}`, position:"relative"}}>
          <img src={appConfig.heroImage} alt="" style={{width:"100%", height:"100%",
            objectFit:"cover", display:"block"}}/>
        </div>
      )}

      {/* Featured hero rail */}
      {!search && featured.length>0 && (
        <div style={{padding:"4px 0 16px"}}>
          <div style={{padding:"0 18px 8px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <MonoLabel color={th.muted}>{_c("featuredLabel", lang==="tr"?"Öne Çıkanlar":"Featured")}</MonoLabel>
            <MonoLabel color={th.muted} style={{fontSize:9}}>
              {featured.length} {lang==="tr"?"ürün":"items"}
            </MonoLabel>
          </div>
          <div style={{display:"flex", gap:10, padding:"0 18px", overflowX:"auto",
            scrollbarWidth:"none", msOverflowStyle:"none"}}>
            {featured.map(p => (
              <button key={p.id} onClick={()=>openProduct(p)} style={{
                flexShrink:0, width:168, borderRadius:14, background:th.paper,
                border:`1px solid ${th.line}`, padding:0, overflow:"hidden", textAlign:"left",
                cursor:"pointer"
              }}>
                <div style={{height:94, position:"relative"}}>
                  <FoodTile kind={p.hero} w={168} h={94}/>
                  <span style={{position:"absolute", top:8, left:8, padding:"3px 7px",
                    borderRadius:5, fontSize:8.5, fontWeight:700, letterSpacing:".1em",
                    background: p.badge==="hot"?th.accent:th.gold, color:"#FFF8EC"}}>
                    {p.badge==="hot" ? (lang==="tr"?"POPÜLER":"POPULAR") : (lang==="tr"?"YENİ":"NEW")}
                  </span>
                </div>
                <div style={{padding:"8px 10px 10px"}}>
                  <div style={{fontSize:11.5, fontWeight:600, color:th.text, lineHeight:1.25,
                    overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box",
                    WebkitLineClamp:1, WebkitBoxOrient:"vertical"}}>{p.name[lang]}</div>
                  <div style={{fontSize:10, color:th.muted, marginTop:1, overflow:"hidden",
                    textOverflow:"ellipsis", display:"-webkit-box",
                    WebkitLineClamp:1, WebkitBoxOrient:"vertical"}}>{p.desc[lang]}</div>
                  <div style={{marginTop:6, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <span style={{fontFamily:"var(--font-mono)", fontWeight:600, fontSize:11, color:th.text}}>{money(p.price)}</span>
                    <span style={{width:22, height:22, borderRadius:"50%", background:th.accent,
                      color:"#FFF8EC", fontSize:14, lineHeight:"18px", display:"grid",
                      placeItems:"center"}}>+</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campaign banner (loyalty) */}
      {!search && account && account.points<500 && (
        <div style={{margin:"0 18px 16px", padding:"12px 14px", borderRadius:12,
          background:`linear-gradient(135deg, ${th.accent}, ${th.accent}B0)`, color:"#FFF8EC",
          display:"flex", alignItems:"center", gap:10, position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", top:-16, right:-16, width:64, height:64,
            borderRadius:"50%", background:"rgba(255,248,236,.12)"}}/>
          <Icon name="gift" size={18} stroke="#FFF8EC"/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:11.5, fontWeight:600}}>
              {lang==="tr"?`${500-account.points} ${_c("loyaltyNudge", "puan sonra ücretsiz kahve")}`:`${500-account.points} ${_c("loyaltyNudge", "pts to free coffee")}`}
            </div>
            <div style={{height:4, background:"rgba(255,248,236,.2)", borderRadius:2, marginTop:6,
              overflow:"hidden"}}>
              <div style={{width:`${(account.points/500)*100}%`, height:"100%", background:"#FFF8EC",
                borderRadius:2, transition:"width .5s ease"}}/>
            </div>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div style={{display:"flex", gap:5, padding:"0 18px 10px", overflowX:"auto",
        scrollbarWidth:"none", msOverflowStyle:"none"}}>
        {visibleCats.map(c => (
          <Chip key={c.id} active={activeCat===c.id} onClick={()=>setActiveCat(c.id)} th={th}>
            {c.name[lang]}
          </Chip>
        ))}
      </div>

      {/* Category header */}
      <div style={{padding:"0 18px 8px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em",
          fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text}}>
          {search
            ? (lang==="tr"?`"${search}" için sonuçlar`:`Results for "${search}"`)
            : visibleCats.find(c=>c.id===activeCat)?.name[lang]}
        </div>
        <MonoLabel color={th.muted}>{catProducts.length} {lang==="tr"?"ürün":"items"}</MonoLabel>
      </div>

      {/* Products list */}
      <div style={{padding:"0 14px 16px", display:"grid", gap:8}}>
        {catProducts.length===0 && (
          <div style={{padding:"40px 20px", textAlign:"center", color:th.muted, fontSize:12}}>
            <Icon name="search" size={24} stroke={th.muted} style={{opacity:.4, marginBottom:8}}/>
            <div>{lang==="tr"?"Ürün bulunamadı":"Nothing matched."}</div>
          </div>
        )}
        {catProducts.map(p => {
          const soldout = p.status==="soldout";
          return (
            <button key={p.id} onClick={()=>!soldout && openProduct(p)} style={{
              display:"grid", gridTemplateColumns:"58px 1fr auto", gap:12, alignItems:"center",
              padding:"10px 12px", borderRadius:14, background:th.paper,
              border:`1px solid ${th.line}`, textAlign:"left",
              cursor: soldout?"not-allowed":"pointer",
              opacity: soldout?.55:1
            }}>
              <FoodTile kind={p.hero} w={58} h={58}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12.5, fontWeight:600, color:th.text,
                  display:"flex", alignItems:"center", gap:5}}>
                  <span style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.name[lang]}</span>
                  {p.badge==="new" && <span style={{fontSize:8, padding:"1px 5px", borderRadius:3,
                    background:th.accent, color:"#FFF8EC", fontWeight:700, letterSpacing:".1em"}}>NEW</span>}
                </div>
                <div style={{fontSize:10, color:th.muted, marginTop:2, lineHeight:1.4,
                  overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box",
                  WebkitLineClamp:2, WebkitBoxOrient:"vertical"}}>{p.desc[lang]}</div>
                <div style={{fontSize:11.5, fontWeight:600, fontFamily:"var(--font-mono)",
                  marginTop:4, color:th.text}}>
                  {soldout
                    ? <span style={{color:th.accent, fontSize:9, letterSpacing:".12em"}}>
                        {lang==="tr"?"TÜKENDİ":"SOLD OUT"}</span>
                    : money(p.price)}
                </div>
              </div>
              <button onClick={(e)=>{e.stopPropagation(); !soldout && addToCart(p);}}
                disabled={soldout} style={{
                width:30, height:30, borderRadius:"50%",
                background: soldout?th.line:th.text, color: soldout?th.muted:th.bg,
                fontSize:18, lineHeight:"22px", display:"grid", placeItems:"center",
                cursor: soldout?"not-allowed":"pointer", flexShrink:0
              }}>+</button>
            </button>
          );
        })}
      </div>

      {/* Floating cart button */}
      {cartCount>0 && (
        <button onClick={goCart} style={{
          position:"absolute", left:14, right:14, bottom:14,
          height:48, borderRadius:14, background:th.accent, color:"#FFF8EC",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 16px", boxShadow:"0 12px 24px rgba(196,85,58,.35)",
          cursor:"pointer", border:"none"
        }}>
          <span style={{display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600}}>
            <span style={{width:22, height:22, borderRadius:"50%",
              background:"rgba(255,248,236,.25)", display:"grid", placeItems:"center",
              fontSize:11, fontFamily:"var(--font-mono)"}}>{cartCount}</span>
            {lang==="tr"?"Sepeti görüntüle":"View cart"}
          </span>
          <span style={{fontFamily:"var(--font-mono)", fontWeight:700, fontSize:13}}>{money(subtotal)}</span>
        </button>
      )}
    </div>
  );
};

// ─── Product detail sheet ─────────────────────────────────
const ProductSheet = ({th, lang, product, onClose, onAdd}) => {
  const [qty, setQty] = _uS(1);
  const [size, setSize] = _uS("M");
  const [milk, setMilk] = _uS("regular");
  const [extras, setExtras] = _uS([]);
  const [note, setNote] = _uS("");
  const [shot, setShot] = _uS("single");

  const sizes = [
    {id:"S", tr:"Küçük", en:"Small",  delta: -10},
    {id:"M", tr:"Orta",  en:"Medium", delta: 0},
    {id:"L", tr:"Büyük", en:"Large",  delta: 15},
  ];
  const milks = [
    {id:"regular", tr:"Normal süt",  en:"Regular", delta:0},
    {id:"oat",     tr:"Yulaf sütü",  en:"Oat milk",delta:12},
    {id:"almond",  tr:"Badem sütü",  en:"Almond",  delta:12},
    {id:"soy",     tr:"Soya sütü",   en:"Soy",     delta:10},
    {id:"lactose", tr:"Laktozsuz",   en:"Lactose-free", delta:8},
  ];
  const extrasList = [
    {id:"shot",    tr:"Ekstra shot", en:"Extra shot",   delta:15},
    {id:"syrup",   tr:"Vanilya şurup", en:"Vanilla syrup", delta:10},
    {id:"caramel", tr:"Karamel", en:"Caramel",        delta:10},
    {id:"ice",     tr:"Buzlu",   en:"Iced",           delta:0},
  ];

  const toggleExtra = (id) =>
    setExtras(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  const sizeDelta = sizes.find(s=>s.id===size)?.delta || 0;
  const milkDelta = milks.find(m=>m.id===milk)?.delta || 0;
  const extrasDelta = extras.reduce((s,e)=>s+(extrasList.find(x=>x.id===e)?.delta||0), 0);
  const unit = product.price + sizeDelta + milkDelta + extrasDelta;
  const total = unit * qty;

  const isDrink = ["flatwhite","cortado","coffee","chemex","v60","pourover","matcha",
    "lemonade","kombucha","cold"].includes(product.hero);

  return (
    <div style={{position:"absolute", inset:0, background:"rgba(20,14,10,.55)",
      backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", zIndex:10}}>
      <div style={{width:"100%", maxHeight:"88%", background:th.bg,
        borderRadius:"22px 22px 0 0", overflow:"hidden", display:"flex", flexDirection:"column",
        animation:"sheetUp .25s cubic-bezier(.2,.8,.2,1)"}}>
        <style>{`@keyframes sheetUp { from {transform:translateY(100%);} to {transform:none;} }`}</style>
        {/* drag handle */}
        <div style={{padding:"8px 0 0", display:"grid", placeItems:"center"}}>
          <div style={{width:36, height:4, borderRadius:2, background:th.line2}}/>
        </div>
        {/* hero */}
        <div style={{padding:"10px 18px 6px", position:"relative"}}>
          <div style={{height:140, borderRadius:14, overflow:"hidden"}}>
            <FoodTile kind={product.hero} w="100%" h={140}/>
          </div>
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:24, width:28, height:28, borderRadius:"50%",
            background:"rgba(0,0,0,.3)", color:"#FFF8EC", display:"grid", placeItems:"center",
            backdropFilter:"blur(6px)"
          }}>
            <Icon name="close" size={13}/>
          </button>
        </div>
        {/* body scroll */}
        <div style={{flex:1, overflow:"auto", padding:"8px 18px 14px"}}>
          <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.02em", lineHeight:1.15,
            fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text,
            display:"flex", alignItems:"center", gap:6}}>
            {product.name[lang]}
            {product.badge==="new" && <span style={{fontSize:8.5, padding:"2px 6px", borderRadius:4,
              background:th.accent, color:"#FFF8EC", fontWeight:700, letterSpacing:".12em"}}>NEW</span>}
          </div>
          <div style={{fontSize:11.5, color:th.text2, marginTop:6, lineHeight:1.45}}>{product.desc[lang]}</div>
          <div style={{marginTop:8, display:"flex", gap:10, flexWrap:"wrap"}}>
            <span style={{fontSize:10, color:th.muted, display:"inline-flex", alignItems:"center", gap:4,
              fontFamily:"var(--font-mono)"}}><Icon name="clock" size={10} stroke={th.muted}/>
              {isDrink ? "3-4 dk" : "8-12 dk"}</span>
            <span style={{fontSize:10, color:th.muted, display:"inline-flex", alignItems:"center", gap:4,
              fontFamily:"var(--font-mono)"}}><Icon name="star" size={10} stroke={th.gold} fill={th.gold}/>
              4.{Math.floor((product.sales||40)/10)%10}</span>
            <span style={{fontSize:10, color:th.muted, fontFamily:"var(--font-mono)"}}>
              {product.sales||0} {lang==="tr"?"satış":"sold"}</span>
          </div>

          {/* Size */}
          {isDrink && <div style={{marginTop:14}}>
            <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
              {lang==="tr"?"Boy":"Size"}
            </MonoLabel>
            <div style={{display:"flex", gap:6}}>
              {sizes.map(s => {
                const active = s.id===size;
                return (
                  <button key={s.id} onClick={()=>setSize(s.id)} style={{
                    flex:1, padding:"10px 8px", borderRadius:10, fontSize:11, fontWeight:600,
                    background: active?th.paperAlt:th.paper,
                    border:`${active?"1.5px":"1px"} solid ${active?th.accent:th.line}`,
                    color:th.text, display:"flex", flexDirection:"column", gap:2
                  }}>
                    <span>{s[lang]}</span>
                    <span style={{fontSize:9.5, color:th.muted, fontFamily:"var(--font-mono)"}}>
                      {s.delta===0 ? (lang==="tr"?"—":"—") : (s.delta>0?`+${money(s.delta)}`:money(s.delta))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>}

          {/* Milk */}
          {isDrink && <div style={{marginTop:14}}>
            <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
              {lang==="tr"?"Süt":"Milk"}
            </MonoLabel>
            <div style={{display:"flex", flexWrap:"wrap", gap:5}}>
              {milks.map(m => {
                const active = m.id===milk;
                return (
                  <button key={m.id} onClick={()=>setMilk(m.id)} style={{
                    padding:"7px 10px", borderRadius:999, fontSize:10.5, fontWeight:600,
                    background: active?th.text:th.paper,
                    color: active?th.bg:th.text,
                    border:`1px solid ${active?"transparent":th.line}`,
                    display:"inline-flex", alignItems:"center", gap:4
                  }}>
                    {m[lang]}
                    {m.delta>0 && <span style={{fontSize:9, opacity:.7,
                      fontFamily:"var(--font-mono)"}}>+{m.delta}</span>}
                  </button>
                );
              })}
            </div>
          </div>}

          {/* Extras */}
          <div style={{marginTop:14}}>
            <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
              {lang==="tr"?"Ekstralar":"Add-ons"}
            </MonoLabel>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {extrasList.filter(e => isDrink || e.id!=="shot").map(e => {
                const on = extras.includes(e.id);
                return (
                  <button key={e.id} onClick={()=>toggleExtra(e.id)} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"9px 11px",
                    borderRadius:10, background: on?th.paperAlt:th.paper,
                    border:`${on?"1.5px":"1px"} solid ${on?th.accent:th.line}`,
                    color:th.text, textAlign:"left"
                  }}>
                    <span style={{width:18, height:18, borderRadius:5,
                      border:`1.5px solid ${on?th.accent:th.line2}`,
                      background: on?th.accent:"transparent",
                      display:"grid", placeItems:"center", flexShrink:0}}>
                      {on && <Icon name="check" size={10} stroke="#FFF8EC"/>}
                    </span>
                    <span style={{fontSize:11.5, fontWeight:500, flex:1}}>{e[lang]}</span>
                    <span style={{fontSize:10.5, color:th.muted, fontFamily:"var(--font-mono)"}}>
                      {e.delta===0?"—":`+${money(e.delta)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div style={{marginTop:14}}>
            <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
              {lang==="tr"?"Not (opsiyonel)":"Note (optional)"}
            </MonoLabel>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder={lang==="tr"?"Az şekerli, bol buz…":"Less sugar, extra ice…"}
              style={{width:"100%", padding:"10px 12px", borderRadius:10, fontSize:11.5,
                background:th.paper, border:`1px solid ${th.line}`, color:th.text,
                outline:"none", resize:"none", minHeight:54, fontFamily:"inherit"}}/>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div style={{padding:"10px 14px 18px", borderTop:`1px solid ${th.line}`,
          display:"flex", gap:10, alignItems:"center", background:th.bg}}>
          <div style={{display:"flex", alignItems:"center", gap:2,
            background:th.paper, border:`1px solid ${th.line}`, borderRadius:999, padding:2}}>
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:26, height:26,
              borderRadius:"50%", background:"transparent", color:th.text, fontSize:16, lineHeight:"22px"}}>–</button>
            <span style={{minWidth:18, textAlign:"center", fontSize:12.5, fontWeight:600,
              fontFamily:"var(--font-mono)", color:th.text}}>{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} style={{width:26, height:26,
              borderRadius:"50%", background:th.text, color:th.bg, fontSize:16, lineHeight:"22px"}}>+</button>
          </div>
          <button onClick={()=>onAdd({
            pid:product.id, qty, size, milk, extras, note, unit
          })} style={{
            flex:1, height:44, borderRadius:12, background:th.accent, color:"#FFF8EC",
            fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center",
            justifyContent:"space-between", padding:"0 16px"
          }}>
            <span>{lang==="tr"?"Sepete ekle":"Add to cart"}</span>
            <span style={{fontFamily:"var(--font-mono)"}}>{money(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CART ─────────────────────────────────────────────────
const CartScreen = ({th, lang, cart, products, setQty, removeItem, onCheckout, subtotal, tip, setTip, promo, setPromo, copy}) => {
  const _c = copy || ((k,f)=>f);
  const [promoDraft, setPromoDraft] = _uS("");
  const [tipPct, setTipPct] = _uS(tip ? Math.round(tip/subtotal*100) : 0);
  _uE(()=>{ setTip(subtotal * tipPct / 100); }, [tipPct, subtotal]);

  const promoDiscount = promo ? Math.round(subtotal*0.10) : 0;
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - promoDiscount + (tip||0) + deliveryFee);

  const cartItems = cart.map(c => ({...c, p: products.find(p=>p.id===c.pid)})).filter(x=>x.p);

  return (
    <div style={{flex:1, overflow:"auto", display:"flex", flexDirection:"column"}}>
      {cartItems.length===0 ? (
        <div style={{flex:1, display:"grid", placeItems:"center", padding:30, textAlign:"center"}}>
          <div>
            <div style={{width:58, height:58, borderRadius:"50%", background:th.paperAlt,
              display:"grid", placeItems:"center", margin:"0 auto 14px"}}>
              <Icon name="bag" size={24} stroke={th.muted}/>
            </div>
            <div style={{fontSize:15, fontWeight:500, letterSpacing:"-0.01em",
              fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text}}>
              {_c("emptyCartTitle", lang==="tr"?"Sepetiniz boş":"Your cart is empty")}
            </div>
            <div style={{fontSize:11, color:th.muted, marginTop:6}}>
              {_c("emptyCartSub", lang==="tr"?"Menüden ürün ekleyerek başla":"Browse the menu to start an order.")}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{padding:"10px 16px 4px", flex:1}}>
            {cartItems.map((c, i) => (
              <div key={c.key||i} style={{display:"grid", gridTemplateColumns:"50px 1fr auto",
                gap:10, padding:"10px 0", borderBottom:`1px solid ${th.line}`, alignItems:"center"}}>
                <FoodTile kind={c.p.hero} w={50} h={50}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12.5, fontWeight:600, color:th.text}}>{c.p.name[lang]}</div>
                  {(c.size || c.milk || c.extras?.length>0) && (
                    <div style={{fontSize:10, color:th.muted, marginTop:2, lineHeight:1.35,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {[c.size && c.size!=="M" ? c.size : null,
                        c.milk && c.milk!=="regular" ? c.milk : null,
                        ...(c.extras||[])].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {c.note && <div style={{fontSize:10, color:th.accent, marginTop:2, fontStyle:"italic",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>"{c.note}"</div>}
                  <div style={{fontSize:10.5, color:th.muted, fontFamily:"var(--font-mono)", marginTop:3}}>
                    {money(c.unit || c.p.price)} × {c.qty}
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", flexDirection:"column", gap:6}}>
                  <div style={{display:"flex", alignItems:"center", gap:4}}>
                    <button onClick={()=>setQty(i, c.qty-1)} style={{width:22, height:22, borderRadius:6,
                      border:`1px solid ${th.line}`, color:th.text, background:th.paper, fontSize:12}}>–</button>
                    <span style={{fontSize:11.5, fontWeight:600, fontFamily:"var(--font-mono)",
                      minWidth:14, textAlign:"center", color:th.text}}>{c.qty}</span>
                    <button onClick={()=>setQty(i, c.qty+1)} style={{width:22, height:22, borderRadius:6,
                      background:th.text, color:th.bg, fontSize:12}}>+</button>
                  </div>
                  <div style={{fontSize:11, fontWeight:600, fontFamily:"var(--font-mono)", color:th.text}}>
                    {money((c.unit || c.p.price) * c.qty)}
                  </div>
                </div>
              </div>
            ))}

            {/* Promo */}
            <div style={{marginTop:14, display:"flex", gap:6}}>
              <div style={{flex:1, display:"flex", alignItems:"center", gap:6,
                padding:"0 12px", height:36, borderRadius:10,
                background:th.paper, border:`1px solid ${th.line}`}}>
                <Icon name="gift" size={12} stroke={th.muted}/>
                <input value={promo?"WELCOME10":promoDraft} onChange={e=>setPromoDraft(e.target.value.toUpperCase())}
                  disabled={!!promo}
                  placeholder={lang==="tr"?"Promo kodu":"Promo code"}
                  style={{flex:1, border:"none", outline:"none", background:"transparent",
                    fontSize:11.5, color:th.text, fontFamily:"var(--font-mono)",
                    letterSpacing:".04em"}}/>
              </div>
              <button onClick={()=>{
                if (promo) { setPromo(false); setPromoDraft(""); }
                else if (promoDraft) setPromo(true);
              }} style={{padding:"0 14px", height:36, borderRadius:10,
                background: promo?th.paperAlt:th.text, color: promo?th.text:th.bg,
                fontSize:11, fontWeight:600,
                border:promo?`1px solid ${th.line}`:"none"}}>
                {promo ? (lang==="tr"?"Kaldır":"Remove") : (lang==="tr"?"Uygula":"Apply")}
              </button>
            </div>
            {promo && <div style={{fontSize:10, color:th.green, marginTop:6,
              display:"flex", alignItems:"center", gap:4}}>
              <Icon name="check" size={10} stroke={th.green}/>
              {lang==="tr"?"%10 indirim uygulandı":"10% discount applied"}
            </div>}

            {/* Tip */}
            <div style={{marginTop:14}}>
              <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
                {lang==="tr"?"Bahşiş":"Tip"}
              </MonoLabel>
              <div style={{display:"flex", gap:5}}>
                {[0, 5, 10, 15].map(p => (
                  <button key={p} onClick={()=>setTipPct(p)} style={{
                    flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600,
                    background: tipPct===p?th.text:th.paper,
                    color: tipPct===p?th.bg:th.text,
                    border:`1px solid ${tipPct===p?"transparent":th.line}`
                  }}>{p===0 ? (lang==="tr"?"Yok":"None") : `%${p}`}</button>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{marginTop:14, paddingTop:10, borderTop:`1px solid ${th.line}`}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5, color:th.text2, marginBottom:4}}>
                <span>{lang==="tr"?"Ara toplam":"Subtotal"}</span>
                <span style={{fontFamily:"var(--font-mono)"}}>{money(subtotal)}</span>
              </div>
              {promo && (
                <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5, color:th.green, marginBottom:4}}>
                  <span>{lang==="tr"?"WELCOME10 indirimi":"WELCOME10 discount"}</span>
                  <span style={{fontFamily:"var(--font-mono)"}}>−{money(promoDiscount)}</span>
                </div>
              )}
              {tip>0 && (
                <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5, color:th.text2, marginBottom:4}}>
                  <span>{lang==="tr"?"Bahşiş":"Tip"}</span>
                  <span style={{fontFamily:"var(--font-mono)"}}>{money(Math.round(tip))}</span>
                </div>
              )}
              <div style={{display:"flex", justifyContent:"space-between", fontSize:14,
                fontWeight:600, color:th.text, marginTop:8}}>
                <span>{lang==="tr"?"Toplam":"Total"}</span>
                <span style={{fontFamily:"var(--font-display)", fontStyle:"italic",
                  letterSpacing:"-0.01em"}}>{money(Math.round(total))}</span>
              </div>
            </div>
          </div>

          <div style={{padding:"10px 14px 18px", borderTop:`1px solid ${th.line}`, background:th.bg}}>
            <button onClick={onCheckout} style={{
              width:"100%", height:46, borderRadius:12, background:th.accent, color:"#FFF8EC",
              fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center",
              justifyContent:"center", gap:6
            }}>
              {_c("checkoutCta", lang==="tr"?"Siparişi onayla":"Place order")}
              <Icon name="arrow-right" size={14} stroke="#FFF8EC"/>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── TRACKER ──────────────────────────────────────────────
const TrackerScreen = ({th, lang, stage, t, goMenu, goReview, order, copy}) => {
  const _c = copy || ((k,f)=>f);
  const curIdx = STAGE_INDEX[stage];
  const steps = [
    {id:"received", icon:"check", tr:"Sipariş alındı", en:"Order received",
      hint:{tr:"Siparişiniz kasaya ulaştı.",en:"Seen at the counter."}},
    {id:"preparing", icon:"coffee", tr:"Hazırlanıyor", en:"Preparing",
      hint:{tr:"Baristalar iş başında.",en:"Baristas are brewing."}},
    {id:"ready", icon:"bag", tr:"Hazır", en:"Ready",
      hint:{tr:"Garsonunuz yolda.",en:"Your server is on the way."}},
    {id:"delivered", icon:"star", tr:"Teslim edildi", en:"Delivered",
      hint:{tr:"Afiyet olsun!",en:"Enjoy!"}},
  ];
  const etaText = stage==="delivered" ? "—"
    : stage==="ready" ? (lang==="tr"?"1-2 dk":"1-2 min")
    : stage==="preparing" ? (lang==="tr"?"3-5 dk":"3-5 min")
    : (lang==="tr"?"6-9 dk":"6-9 min");

  return (
    <div style={{flex:1, overflow:"auto", display:"flex", flexDirection:"column"}}>
      {/* Hero panel */}
      <div style={{padding:"14px 18px 16px", background:th.paper,
        borderBottom:`1px solid ${th.line}`}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <MonoLabel color={th.muted}>#A-{order?.id || "2041"}</MonoLabel>
            <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em", marginTop:4,
              fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text, lineHeight:1.15}}>
              {stage==="delivered"
                ? _c("trackerTitleDone", lang==="tr"?"Afiyet olsun":"Enjoy your order")
                : _c("trackerTitleLive", lang==="tr"?"Siparişiniz yolda":"Your order is on the way")}
            </div>
            <div style={{fontSize:11, color:th.muted, marginTop:4}}>
              {lang==="tr"?"Masa 14 · 2 ürün":"Table 14 · 2 items"}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <MonoLabel color={th.muted}>ETA</MonoLabel>
            <div style={{fontSize:18, fontWeight:500, fontFamily:"var(--font-display)",
              fontStyle:"italic", color:th.accent, letterSpacing:"-0.01em", marginTop:2}}>
              {etaText}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{padding:"18px 22px 14px", flex:1}}>
        {steps.map((s, i) => {
          const done = i < curIdx;
          const active = i === curIdx;
          const sColor = done ? th.green : active ? th.accent : th.muted;
          return (
            <div key={s.id} style={{display:"grid", gridTemplateColumns:"32px 1fr", gap:12,
              position:"relative", paddingBottom: i<steps.length-1 ? 22 : 0}}>
              {i<steps.length-1 && <div style={{
                position:"absolute", left:15, top:32, bottom:6, width:2,
                background: done ? th.green : th.line
              }}/>}
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background: active?th.accent : done?th.green : "transparent",
                border:`2px solid ${sColor}`,
                display:"grid", placeItems:"center",
                color:(active||done)?"#FFF8EC":sColor,
                boxShadow: active?`0 0 0 6px ${th.accent}22`:"none",
                transition:"all .3s ease"
              }}>
                <Icon name={done?"check":s.icon} size={14} stroke={(active||done)?"#FFF8EC":sColor}/>
              </div>
              <div style={{paddingTop:4}}>
                <div style={{fontSize:12.5, fontWeight:600,
                  color: active?th.text : done?th.text : th.muted}}>{s[lang]}</div>
                <div style={{fontSize:10.5, color:th.muted, marginTop:2}}>
                  {active||done ? s.hint[lang] : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      {order?.items && (
        <div style={{padding:"0 18px 14px"}}>
          <MonoLabel color={th.muted} style={{display:"block", marginBottom:8}}>
            {lang==="tr"?"Özet":"Summary"}
          </MonoLabel>
          <div style={{background:th.paper, border:`1px solid ${th.line}`,
            borderRadius:12, padding:"10px 14px"}}>
            {order.items.map((it, i) => (
              <div key={i} style={{display:"flex", justifyContent:"space-between",
                fontSize:11.5, padding:"4px 0", color:th.text}}>
                <span>{it.qty}× {it.name}</span>
                <span style={{fontFamily:"var(--font-mono)"}}>{money(it.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{padding:"10px 14px 18px", borderTop:`1px solid ${th.line}`,
        display:"flex", gap:6, background:th.bg}}>
        {stage==="delivered" ? (
          <>
            <button onClick={goMenu} style={{flex:1, height:42, borderRadius:11, fontSize:11.5,
              fontWeight:600, background:"transparent", border:`1px solid ${th.line}`, color:th.text}}>
              {lang==="tr"?"Tekrar sipariş":"Reorder"}
            </button>
            <button onClick={goReview} style={{flex:1, height:42, borderRadius:11, fontSize:11.5,
              fontWeight:600, background:th.accent, color:"#FFF8EC"}}>
              {lang==="tr"?"Değerlendir":"Leave review"}
            </button>
          </>
        ) : (
          <>
            <button style={{flex:1, height:42, borderRadius:11, fontSize:11.5, fontWeight:600,
              background:"transparent", border:`1px solid ${th.line}`, color:th.text,
              display:"flex", alignItems:"center", justifyContent:"center", gap:5}}>
              <Icon name="phone" size={12} stroke={th.text}/>
              {lang==="tr"?"Garson çağır":"Call waiter"}
            </button>
            <button onClick={goMenu} style={{flex:1, height:42, borderRadius:11, fontSize:11.5,
              fontWeight:600, background:th.accent, color:"#FFF8EC"}}>
              {lang==="tr"?"Ek sipariş":"Add more"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── REVIEW ───────────────────────────────────────────────
const ReviewScreen = ({th, lang, t, onDone, copy}) => {
  const _c = copy || ((k,f)=>f);
  const [rating, setRating] = _uS(0);
  const [tags, setTags] = _uS([]);
  const [submitted, setSubmitted] = _uS(false);
  const tagList = [
    {id:"fast", tr:"Hızlı servis", en:"Fast service"},
    {id:"coffee", tr:"Kahve harika", en:"Great coffee"},
    {id:"warm", tr:"Sıcak karşılama", en:"Warm welcome"},
    {id:"amb", tr:"Ambiyans", en:"Ambience"},
    {id:"flavor", tr:"Lezzet", en:"Flavor"},
    {id:"clean", tr:"Temiz", en:"Clean"},
  ];
  const toggle = (id) => setTags(s => s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  if (submitted) return (
    <div style={{flex:1, display:"grid", placeItems:"center", padding:30, textAlign:"center"}}>
      <div>
        <div style={{width:78, height:78, borderRadius:"50%", background:th.accent,
          color:"#FFF8EC", display:"grid", placeItems:"center", margin:"0 auto 16px",
          animation:"pop .35s cubic-bezier(.2,.8,.2,1)"}}>
          <Icon name="check" size={34} stroke="#FFF8EC"/>
        </div>
        <style>{`@keyframes pop { 0%{transform:scale(0); opacity:0;} 60%{transform:scale(1.1);} 100%{transform:scale(1); opacity:1;} }`}</style>
        <div style={{fontSize:22, fontWeight:500, fontFamily:"var(--font-display)",
          fontStyle:"italic", letterSpacing:"-0.02em", color:th.text}}>{_c("reviewThanks", t("reviewThanks"))}</div>
        <div style={{fontSize:12, color:th.muted, marginTop:8, lineHeight:1.5}}>
          {lang==="tr"?"Değerlendirmen Aleg ekibine iletildi.":"Your review is on its way to the team."}
        </div>
        <div style={{marginTop:14, padding:"10px 14px", borderRadius:10,
          background:th.paperAlt, border:`1px solid ${th.line}`,
          display:"inline-flex", alignItems:"center", gap:6}}>
          <Icon name="gift" size={13} stroke={th.gold}/>
          <span style={{fontSize:11, color:th.text}}>{_c("reviewBonus", lang==="tr"?"+25 bonus puan":"+25 bonus points")}</span>
        </div>
        <div style={{marginTop:20}}>
          <button onClick={onDone} style={{padding:"10px 24px", borderRadius:10,
            background:th.text, color:th.bg, fontSize:12, fontWeight:600}}>
            {lang==="tr"?"Tamam":"Done"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", padding:"10px 20px 16px"}}>
      <MonoLabel color={th.muted}>#A-2041</MonoLabel>
      <div style={{marginTop:12}}>
        <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.02em",
          fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text, lineHeight:1.2}}>
          {t("reviewTitle")}</div>
        <div style={{fontSize:11.5, color:th.muted, marginTop:6, lineHeight:1.5}}>{t("reviewSub")}</div>
      </div>
      <div style={{display:"flex", justifyContent:"center", gap:8, padding:"20px 0 10px"}}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={()=>setRating(n)} style={{width:40, height:40,
            display:"grid", placeItems:"center", color: n<=rating?th.gold:th.muted,
            transition:"all .15s ease",
            transform: n<=rating?"scale(1.12)":"scale(1)"}}>
            <Icon name="star" size={30} fill={n<=rating?th.gold:"none"} stroke={n<=rating?th.gold:th.muted}/>
          </button>
        ))}
      </div>
      {rating>0 && (
        <div style={{fontSize:11, color:th.accent, textAlign:"center", fontWeight:600,
          letterSpacing:".02em", marginBottom:6}}>
          {[null,
            lang==="tr"?"Berbat":"Terrible",
            lang==="tr"?"İdare eder":"Meh",
            lang==="tr"?"Fena değil":"Not bad",
            lang==="tr"?"Güzeldi":"Great",
            lang==="tr"?"Mükemmel!":"Amazing!"][rating]}
        </div>
      )}
      <div style={{display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center", marginTop:8}}>
        {tagList.map(tag => {
          const on = tags.includes(tag.id);
          return (
            <button key={tag.id} onClick={()=>toggle(tag.id)} style={{
              padding:"6px 11px", borderRadius:999, fontSize:10.5, fontWeight:500,
              background: on?th.accent:"transparent", color: on?"#FFF8EC":th.text,
              border: `1px solid ${on?"transparent":th.line}`
            }}>{tag[lang]}</button>
          );
        })}
      </div>
      <textarea placeholder={lang==="tr"?"Bize yazmak ister misin?":"Leave a note for the team…"}
        style={{marginTop:14, padding:"10px 12px", borderRadius:10, fontSize:11.5,
          background:th.paper, border:`1px solid ${th.line}`, color:th.text,
          outline:"none", resize:"none", minHeight:64, fontFamily:"inherit"}}/>
      <button onClick={()=>setSubmitted(true)} disabled={!rating} style={{
        marginTop:"auto", height:44, borderRadius:11, fontSize:12.5, fontWeight:600,
        background: rating?th.accent:th.paperAlt,
        color: rating?"#FFF8EC":th.muted
      }}>{t("reviewSubmit")}</button>
    </div>
  );
};

// ─── ORDERS HISTORY ───────────────────────────────────────
const OrdersScreen = ({th, lang, account, goTracker, goMenu}) => {
  const history = [
    {id:"A-2041", date: lang==="tr"?"Bugün, 14:22":"Today, 2:22 PM",
      items:[{n:lang==="tr"?"Flat White":"Flat White",q:1},{n:"Cortado",q:1}], total:180, stage:"active"},
    {id:"A-1987", date: lang==="tr"?"Dün":"Yesterday",
      items:[{n:"Chemex 600ml",q:1},{n:lang==="tr"?"Tahinli Cookie":"Tahini Cookie",q:2}], total:270, stage:"done", rating:5},
    {id:"A-1932", date: lang==="tr"?"3 gün önce":"3 days ago",
      items:[{n:lang==="tr"?"V60 Geyşa":"V60 Geisha",q:1}], total:220, stage:"done", rating:4},
    {id:"A-1876", date: lang==="tr"?"Geçen hafta":"Last week",
      items:[{n:lang==="tr"?"Ice Matcha Latte":"Iced Matcha Latte",q:2},{n:lang==="tr"?"Avokadolu Ekşi Maya":"Avocado Sourdough",q:1}], total:395, stage:"done", rating:5},
  ];
  return (
    <div style={{flex:1, overflow:"auto", padding:"10px 16px 20px"}}>
      {/* Filter tabs */}
      <div style={{display:"flex", gap:5, marginBottom:12}}>
        {[
          {id:"all", tr:"Tümü", en:"All"},
          {id:"active", tr:"Aktif", en:"Active"},
          {id:"done", tr:"Geçmiş", en:"Past"},
        ].map((f,i) => (
          <Chip key={f.id} active={i===0} th={th}>{f[lang]}</Chip>
        ))}
      </div>

      {history.map((o, i) => {
        const active = o.stage==="active";
        return (
          <button key={o.id} onClick={()=>active ? goTracker() : null} style={{
            display:"block", width:"100%", padding:"12px 14px", borderRadius:12,
            background: active?`${th.accent}0D`:th.paper,
            border:`${active?"1.5px":"1px"} solid ${active?th.accent:th.line}`,
            marginBottom:8, textAlign:"left", cursor: active?"pointer":"default"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{display:"flex", alignItems:"center", gap:7}}>
                <MonoLabel color={th.muted}>#{o.id}</MonoLabel>
                {active && <span style={{fontSize:9, padding:"2px 7px", borderRadius:5,
                  background:th.accent, color:"#FFF8EC", fontWeight:700, letterSpacing:".1em"}}>
                  {lang==="tr"?"AKTİF":"LIVE"}</span>}
              </div>
              <span style={{fontSize:10.5, color:th.muted, fontFamily:"var(--font-mono)"}}>{o.date}</span>
            </div>
            <div style={{marginTop:6, fontSize:11.5, color:th.text, lineHeight:1.4}}>
              {o.items.map(it => `${it.q}× ${it.n}`).join(" · ")}
            </div>
            <div style={{marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                {o.rating && <div style={{display:"flex", gap:1}}>
                  {[1,2,3,4,5].map(n => (
                    <Icon key={n} name="star" size={10}
                      stroke={n<=o.rating?th.gold:th.line2}
                      fill={n<=o.rating?th.gold:"none"}/>
                  ))}
                </div>}
                {active && <div style={{fontSize:10.5, color:th.accent, fontWeight:600,
                  display:"flex", alignItems:"center", gap:4}}>
                  <Icon name="coffee" size={11} stroke={th.accent}/>
                  {lang==="tr"?"Hazırlanıyor":"Preparing"}
                </div>}
              </div>
              <span style={{fontSize:13, fontWeight:600, fontFamily:"var(--font-display)",
                fontStyle:"italic", color:th.text, letterSpacing:"-0.01em"}}>{money(o.total)}</span>
            </div>
          </button>
        );
      })}

      <button onClick={goMenu} style={{width:"100%", padding:"12px 14px", marginTop:8,
        borderRadius:12, background:"transparent", border:`1px dashed ${th.line2}`,
        color:th.muted, fontSize:11.5, fontWeight:500}}>
        + {lang==="tr"?"Yeni sipariş oluştur":"Start a new order"}
      </button>
    </div>
  );
};

// ─── REWARDS ──────────────────────────────────────────────
const RewardsScreen = ({th, lang, account, openAccount}) => {
  if (!account) {
    return (
      <div style={{flex:1, display:"flex", flexDirection:"column", padding:"16px 18px"}}>
        <div style={{borderRadius:16, padding:"22px 20px",
          background:`linear-gradient(135deg, ${th.accent}, ${th.accent}B0)`,
          color:"#FFF8EC", position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", top:-24, right:-24, width:110, height:110,
            borderRadius:"50%", background:"rgba(255,248,236,.1)"}}/>
          <Icon name="gift" size={26} stroke="#FFF8EC"/>
          <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.02em", marginTop:12,
            fontFamily:"var(--font-display)", fontStyle:"italic", lineHeight:1.15}}>
            {lang==="tr"?"10 ziyarette bir kahve bizden":"Every 10th coffee on us"}
          </div>
          <div style={{fontSize:11, opacity:.9, marginTop:6, lineHeight:1.5}}>
            {lang==="tr"?"Üye olun, puan kazanın, ikramları açın.":"Join, earn points, unlock treats."}
          </div>
          <button onClick={openAccount} style={{marginTop:14, padding:"9px 18px",
            borderRadius:8, background:"#FFF8EC", color:th.accent, fontSize:11.5,
            fontWeight:600, border:"none"}}>
            {lang==="tr"?"Üye ol":"Join now"}
          </button>
        </div>

        <div style={{marginTop:16}}>
          <MonoLabel color={th.muted} style={{display:"block", marginBottom:10}}>
            {lang==="tr"?"Üyelik avantajları":"Member benefits"}
          </MonoLabel>
          {[
            {i:"star",  tr:"Her ₺10'a 1 puan",         en:"1 point per ₺10"},
            {i:"gift",  tr:"Doğum gününde özel ikram", en:"Birthday treat"},
            {i:"coffee",tr:"Yeni lezzetlere öncelik",  en:"Early access"},
            {i:"users", tr:"Arkadaş davet: çift puan", en:"Refer a friend: 2x points"},
          ].map((b,i) => (
            <div key={i} style={{display:"grid", gridTemplateColumns:"36px 1fr",
              gap:10, alignItems:"center", padding:"8px 0",
              borderBottom: i<3 ? `1px solid ${th.line}` : "none"}}>
              <div style={{width:36, height:36, borderRadius:"50%",
                background:th.paperAlt, color:th.accent, display:"grid", placeItems:"center"}}>
                <Icon name={b.i} size={15} stroke={th.accent}/>
              </div>
              <div style={{fontSize:12, color:th.text}}>{b[lang]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1, overflow:"auto", padding:"10px 16px 20px"}}>
      {/* Tier card */}
      <div style={{borderRadius:16, padding:"16px 18px",
        background:`linear-gradient(135deg, #2A1F18, #5A3A28)`, color:"#FFF8EC",
        position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-40, right:-30, width:130, height:130,
          borderRadius:"50%", background:"rgba(224,128,96,.15)"}}/>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <MonoLabel color="rgba(255,248,236,.7)">
              {lang==="tr"?"Aleg Kulüp":"Aleg Club"} · {account.tier}
            </MonoLabel>
            <div style={{fontSize:40, fontWeight:500, letterSpacing:"-0.03em",
              fontFamily:"var(--font-display)", fontStyle:"italic", color:"#E08060",
              lineHeight:1, marginTop:8}}>
              {account.points}
            </div>
            <div style={{fontSize:10.5, opacity:.85, marginTop:4, fontFamily:"var(--font-mono)"}}>
              {lang==="tr"?"PUAN":"POINTS"}</div>
          </div>
          <Icon name="gift" size={26} stroke="#E08060"/>
        </div>
        <div style={{height:5, background:"rgba(255,248,236,.18)", borderRadius:3, marginTop:14,
          overflow:"hidden"}}>
          <div style={{width:`${Math.min(100,(account.points/500)*100)}%`, height:"100%",
            background:"#E08060", borderRadius:3, transition:"width .5s ease"}}/>
        </div>
        <div style={{fontSize:10.5, opacity:.85, marginTop:8, lineHeight:1.4}}>
          {account.points>=500
            ? (lang==="tr"?"Ödülün hazır! Sıradaki siparişte talep et.":"Reward ready! Claim on next order.")
            : (lang==="tr"?`${500-account.points} puan sonra ücretsiz kahve.`:`${500-account.points} pts to free coffee.`)}
        </div>
      </div>

      {/* Rewards catalog */}
      <MonoLabel color={th.muted} style={{display:"block", marginTop:18, marginBottom:8}}>
        {lang==="tr"?"Ödül kataloğu":"Reward catalog"}
      </MonoLabel>
      {[
        {cost:100, name:{tr:"Americano (küçük)",en:"Small Americano"}, hero:"coffee"},
        {cost:200, name:{tr:"Flat White",en:"Flat White"}, hero:"flatwhite"},
        {cost:300, name:{tr:"Tahinli cookie",en:"Tahini cookie"}, hero:"cookie"},
        {cost:500, name:{tr:"Özel kahvaltı",en:"Signature breakfast"}, hero:"sourdough"},
      ].map((r,i) => {
        const ok = account.points >= r.cost;
        return (
          <div key={i} style={{display:"grid", gridTemplateColumns:"48px 1fr auto",
            gap:12, alignItems:"center", padding:"10px 12px", borderRadius:12,
            background: ok?th.paper:"transparent",
            border:`1px solid ${ok?th.line:th.line}`, opacity: ok?1:.55, marginBottom:6}}>
            <FoodTile kind={r.hero} w={48} h={48}/>
            <div>
              <div style={{fontSize:12, fontWeight:600, color:th.text}}>{r.name[lang]}</div>
              <div style={{fontSize:10.5, color:th.muted, fontFamily:"var(--font-mono)", marginTop:2}}>
                {r.cost} {lang==="tr"?"puan":"pts"}
              </div>
            </div>
            <button disabled={!ok} style={{padding:"6px 12px", borderRadius:8, fontSize:10.5,
              fontWeight:600, background: ok?th.accent:"transparent",
              color: ok?"#FFF8EC":th.muted,
              border: ok?"none":`1px solid ${th.line}`}}>
              {ok ? (lang==="tr"?"Kullan":"Redeem") : (lang==="tr"?"Kilitli":"Locked")}
            </button>
          </div>
        );
      })}

      {/* Referral */}
      <div style={{marginTop:14, padding:"14px 14px", borderRadius:12,
        background:th.paperAlt, border:`1px dashed ${th.line2}`}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:36, height:36, borderRadius:"50%", background:th.accent,
            color:"#FFF8EC", display:"grid", placeItems:"center"}}>
            <Icon name="users" size={16} stroke="#FFF8EC"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12, fontWeight:600, color:th.text}}>
              {lang==="tr"?"Arkadaşını davet et":"Invite a friend"}
            </div>
            <div style={{fontSize:10.5, color:th.muted, marginTop:2}}>
              {lang==="tr"?"Her ikisine de 100 puan":"100 pts for both of you"}
            </div>
          </div>
        </div>
        <div style={{marginTop:10, display:"flex", gap:6}}>
          <div style={{flex:1, padding:"8px 10px", background:th.paper,
            border:`1px solid ${th.line}`, borderRadius:8,
            fontFamily:"var(--font-mono)", fontSize:11, fontWeight:600, color:th.text,
            letterSpacing:".06em"}}>ALEG-{account.id?.slice(-4) || "A3K9"}</div>
          <button style={{padding:"0 14px", background:th.text, color:th.bg,
            borderRadius:8, fontSize:11, fontWeight:600}}>
            {lang==="tr"?"Paylaş":"Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ACCOUNT (signup + profile) ───────────────────────────
const AccountScreen = ({th, lang, account, setAccount, authStep, setAuthStep,
  authPhone, setAuthPhone, authOtp, setAuthOtp, authName, setAuthName, goHome, copy}) => {
  const _c = copy || ((k,f)=>f);

  if (!account) {
    return (
      <div style={{flex:1, overflow:"auto", padding:"14px 18px 20px",
        display:"flex", flexDirection:"column"}}>
        {/* Hero */}
        <div style={{borderRadius:16, padding:"20px 20px 18px",
          background:`linear-gradient(135deg, ${th.accent}, ${th.accent}B0)`,
          color:"#FFF8EC", position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", top:-24, right:-24, width:120, height:120,
            borderRadius:"50%", background:"rgba(255,248,236,.12)"}}/>
          <Icon name="gift" size={22} stroke="#FFF8EC"/>
          <div style={{fontSize:19, fontWeight:500, letterSpacing:"-0.02em", marginTop:12,
            fontFamily:"var(--font-display)", fontStyle:"italic", lineHeight:1.15}}>
            {_c("welcomeTitle", lang==="tr"?"Aleg'e hoşgeldin":"Welcome to Aleg")}
          </div>
          <div style={{fontSize:11, opacity:.9, marginTop:6, lineHeight:1.5}}>
            {_c("welcomeSub", lang==="tr"?"Üye ol, 50 hoşgeldin puanını kap.":"Sign up, grab 50 welcome points.")}
          </div>
        </div>

        <div style={{marginTop:"auto", paddingTop:20}}>
          {authStep==="phone" && (
            <>
              <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
                {lang==="tr"?"Telefon numaran":"Phone number"}
              </MonoLabel>
              <div style={{display:"flex", gap:6}}>
                <div style={{padding:"0 10px", height:42, borderRadius:10,
                  background:th.paper, border:`1px solid ${th.line}`,
                  display:"grid", placeItems:"center", fontSize:12, color:th.text,
                  fontFamily:"var(--font-mono)"}}>+90</div>
                <input value={authPhone} onChange={e=>setAuthPhone(e.target.value)}
                  placeholder="555 123 45 67" autoFocus style={{
                    flex:1, padding:"0 12px", height:42, borderRadius:10,
                    background:th.paper, border:`1px solid ${th.line}`, color:th.text,
                    outline:"none", fontSize:13, fontFamily:"var(--font-mono)"
                  }}/>
              </div>
              <button onClick={()=>authPhone.length>=7 && setAuthStep("otp")}
                disabled={authPhone.length<7} style={{
                  marginTop:10, width:"100%", height:44, borderRadius:11,
                  background: authPhone.length>=7?th.accent:th.paperAlt,
                  color: authPhone.length>=7?"#FFF8EC":th.muted,
                  fontSize:12.5, fontWeight:600, display:"flex",
                  alignItems:"center", justifyContent:"center", gap:6}}>
                {lang==="tr"?"Kod gönder":"Send code"} <Icon name="arrow-right" size={13} stroke={authPhone.length>=7?"#FFF8EC":th.muted}/>
              </button>
              <div style={{fontSize:10, color:th.muted, textAlign:"center", marginTop:10, lineHeight:1.5}}>
                {lang==="tr"?"Numaran sadece bu program için kullanılır.":"Your number is only used for this program."}
              </div>
            </>
          )}

          {authStep==="otp" && (
            <>
              <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
                {lang==="tr"?"6 haneli kod":"6-digit code"}
              </MonoLabel>
              <div style={{fontSize:11, color:th.muted, marginBottom:8}}>
                +90 {authPhone} <button onClick={()=>setAuthStep("phone")}
                  style={{color:th.accent, marginLeft:6, fontWeight:600}}>
                  {lang==="tr"?"değiştir":"edit"}
                </button>
              </div>
              <input value={authOtp} onChange={e=>setAuthOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="123456" autoFocus style={{
                  width:"100%", padding:"0 16px", height:48, borderRadius:10,
                  background:th.paper, border:`1px solid ${th.line}`, color:th.text,
                  outline:"none", fontSize:20, fontFamily:"var(--font-mono)",
                  letterSpacing:".35em", textAlign:"center", fontWeight:600
                }}/>
              <button onClick={()=>authOtp.length===6 && setAuthStep("name")}
                disabled={authOtp.length<6} style={{
                  marginTop:10, width:"100%", height:44, borderRadius:11,
                  background: authOtp.length===6?th.accent:th.paperAlt,
                  color: authOtp.length===6?"#FFF8EC":th.muted,
                  fontSize:12.5, fontWeight:600}}>
                {lang==="tr"?"Doğrula":"Verify"}
              </button>
              <div style={{fontSize:10, color:th.muted, textAlign:"center", marginTop:8}}>
                {lang==="tr"?"Demo: herhangi bir 6 haneli kod":"Demo: any 6 digits"}
              </div>
            </>
          )}

          {authStep==="name" && (
            <>
              <MonoLabel color={th.muted} style={{display:"block", marginBottom:6}}>
                {lang==="tr"?"Adın":"Your name"}
              </MonoLabel>
              <input value={authName} onChange={e=>setAuthName(e.target.value)}
                placeholder={lang==="tr"?"Ada Yılmaz":"Ada Yilmaz"} autoFocus style={{
                  width:"100%", padding:"0 12px", height:42, borderRadius:10,
                  background:th.paper, border:`1px solid ${th.line}`, color:th.text,
                  outline:"none", fontSize:13
                }}/>
              <button onClick={()=>{
                if (!authName.trim()) return;
                setAccount({
                  id:"C-QR-"+Date.now(),
                  name:authName.trim(),
                  phone:"+90 "+authPhone,
                  points:50, visits:0, spent:0,
                  tier: lang==="tr"?"Bronz":"Bronze",
                  since: new Date().toISOString().slice(0,10),
                  welcome:true
                });
                setAuthStep("done");
                goHome && goHome();
              }} disabled={!authName.trim()} style={{
                marginTop:10, width:"100%", height:44, borderRadius:11,
                background: authName.trim()?th.accent:th.paperAlt,
                color: authName.trim()?"#FFF8EC":th.muted,
                fontSize:12.5, fontWeight:600}}>
                {lang==="tr"?"Üyeliğimi tamamla":"Complete signup"}
              </button>
              <div style={{fontSize:10.5, color:th.accent, textAlign:"center", marginTop:10,
                display:"flex", justifyContent:"center", alignItems:"center", gap:4, fontWeight:600}}>
                <Icon name="gift" size={11} stroke={th.accent}/>
                {lang==="tr"?"Hoşgeldin bonusu: +50 puan":"Welcome bonus: +50 points"}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Signed-in profile
  return (
    <div style={{flex:1, overflow:"auto", padding:"14px 16px 20px"}}>
      {/* Profile header */}
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:16}}>
        <div style={{width:52, height:52, borderRadius:"50%", background:th.accent,
          color:"#FFF8EC", display:"grid", placeItems:"center", fontSize:17,
          fontFamily:"var(--font-display)", fontStyle:"italic", fontWeight:600}}>
          {account.name.split(" ").map(x=>x[0]).join("").slice(0,2)}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:16, fontWeight:500, letterSpacing:"-0.01em",
            fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text}}>
            {account.name}
          </div>
          <div style={{fontSize:10.5, color:th.muted, fontFamily:"var(--font-mono)",
            marginTop:2}}>{account.phone}</div>
        </div>
        <button style={{padding:"6px 10px", borderRadius:8, fontSize:10.5,
          fontWeight:600, background:"transparent", border:`1px solid ${th.line}`, color:th.text}}>
          {lang==="tr"?"Düzenle":"Edit"}
        </button>
      </div>

      {/* Welcome banner */}
      {account.welcome && (
        <div style={{padding:"11px 14px", borderRadius:12, marginBottom:12,
          background:`linear-gradient(135deg, ${th.accent}, ${th.accent}B0)`, color:"#FFF8EC",
          display:"flex", alignItems:"center", gap:10}}>
          <Icon name="gift" size={18} stroke="#FFF8EC"/>
          <div style={{flex:1}}>
            <div style={{fontSize:11.5, fontWeight:600}}>{lang==="tr"?"Hoşgeldin! +50 puan":"Welcome! +50 points"}</div>
            <div style={{fontSize:10, opacity:.85}}>{lang==="tr"?"İlk siparişinde kullan.":"Use on your first order."}</div>
          </div>
          <button onClick={()=>setAccount({...account, welcome:false})}
            style={{width:22, height:22, borderRadius:"50%",
              background:"rgba(0,0,0,.15)", color:"#FFF8EC", display:"grid", placeItems:"center"}}>
            <Icon name="close" size={11} stroke="#FFF8EC"/>
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:16}}>
        {[
          {k: account.visits, label: lang==="tr"?"Ziyaret":"Visits"},
          {k: money(account.spent), label: lang==="tr"?"Harcama":"Spent"},
          {k: account.tier, label: lang==="tr"?"Seviye":"Tier"},
        ].map((s,i) => (
          <div key={i} style={{padding:"10px 8px", borderRadius:10, background:th.paper,
            border:`1px solid ${th.line}`, textAlign:"center"}}>
            <div style={{fontSize:15, fontWeight:500, letterSpacing:"-0.02em",
              fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text}}>{s.k}</div>
            <div style={{fontSize:9, color:th.muted, marginTop:2, letterSpacing:".08em",
              fontFamily:"var(--font-mono)", textTransform:"uppercase"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu list */}
      {[
        {i:"home", tr:"Adreslerim", en:"My addresses", sub:"2"},
        {i:"credit-card", tr:"Ödeme yöntemleri", en:"Payment methods", sub:"•••• 4242"},
        {i:"bell", tr:"Bildirimler", en:"Notifications", sub: lang==="tr"?"Açık":"On"},
        {i:"globe", tr:"Dil", en:"Language", sub: lang==="tr"?"Türkçe":"English"},
        {i:"info", tr:"Hakkında", en:"About"},
        {i:"phone", tr:"Destek", en:"Support"},
      ].map((m,i,arr) => (
        <button key={i} style={{display:"flex", alignItems:"center", gap:12, width:"100%",
          padding:"12px 12px", background:"transparent",
          borderBottom: i<arr.length-1 ? `1px solid ${th.line}` : "none",
          textAlign:"left"}}>
          <div style={{width:30, height:30, borderRadius:8, background:th.paperAlt,
            display:"grid", placeItems:"center"}}>
            <Icon name={m.i} size={13} stroke={th.text}/>
          </div>
          <span style={{fontSize:12.5, color:th.text, fontWeight:500, flex:1}}>{m[lang]}</span>
          {m.sub && <span style={{fontSize:10.5, color:th.muted,
            fontFamily:"var(--font-mono)"}}>{m.sub}</span>}
          <Icon name="chev-right" size={13} stroke={th.muted}/>
        </button>
      ))}

      <button onClick={()=>{
        setAccount(null); setAuthStep("phone");
        setAuthPhone(""); setAuthOtp(""); setAuthName("");
      }} style={{width:"100%", marginTop:18, padding:"10px", fontSize:10.5,
        color:th.muted, background:"transparent", letterSpacing:".08em",
        fontFamily:"var(--font-mono)", textTransform:"uppercase"}}>
        {lang==="tr"?"Çıkış yap":"Sign out"}
      </button>
    </div>
  );
};

// ─── CAMPAIGN OVERLAY ─────────────────────────────────────
const CampaignOverlay = ({th, lang, campaign, onClose}) => {
  if (!campaign) return null;
  return (
    <div style={{position:"absolute", inset:0, background:"rgba(20,14,10,.55)",
      backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", padding:18, zIndex:20}}>
      <div style={{width:"100%", borderRadius:20, overflow:"hidden", background:th.paper,
        border:`1px solid ${th.line}`, boxShadow:"0 24px 48px rgba(0,0,0,.35)"}}>
        <div style={{height:130, position:"relative",
          background:`linear-gradient(135deg, ${campaign.accent}, ${campaign.accent}CC)`,
          display:"grid", placeItems:"center", color:"#FFF8EC"}}>
          <FoodTile kind={campaign.imageKey} w={64} h={64}/>
          <button onClick={onClose} style={{position:"absolute", top:10, right:10,
            width:28, height:28, borderRadius:"50%", background:"rgba(0,0,0,.25)",
            color:"#FFF8EC", display:"grid", placeItems:"center", backdropFilter:"blur(4px)"}}>
            <Icon name="close" size={14} stroke="#FFF8EC"/>
          </button>
          <div style={{position:"absolute", bottom:10, left:14, fontSize:9,
            fontFamily:"var(--font-mono)", letterSpacing:".14em", opacity:.9, fontWeight:600}}>
            {lang==="tr"?"KAMPANYA":"OFFER"}</div>
        </div>
        <div style={{padding:"16px 18px 16px"}}>
          <div style={{fontSize:17, fontWeight:500, letterSpacing:"-0.01em",
            fontFamily:"var(--font-display)", fontStyle:"italic", color:th.text, lineHeight:1.2}}>
            {campaign.title[lang]}</div>
          <div style={{fontSize:11.5, color:th.muted, marginTop:6, lineHeight:1.5}}>
            {campaign.body[lang]}</div>
          <div style={{display:"flex", gap:6, marginTop:12}}>
            <button onClick={onClose} style={{flex:1, height:40, borderRadius:10,
              fontSize:11.5, fontWeight:600, background:"transparent",
              border:`1px solid ${th.line}`, color:th.text}}>
              {lang==="tr"?"Kapat":"Dismiss"}
            </button>
            <button onClick={onClose} style={{flex:2, height:40, borderRadius:10,
              fontSize:11.5, fontWeight:600, background:campaign.accent, color:"#FFF8EC"}}>
              {campaign.ctaLabel[lang]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT: phone surface ─────────────────────────────────
const MenuPreview = ({categories, products, theme, brandName="Aleg", screen="menu",
  campaign=null, onScreenChange, appConfig={}}) => {
  const lang = window.__appLang || "tr";
  const t = (k) => (window.I18N[lang] && window.I18N[lang][k]) || k;
  const th = makeTheme(theme === "dark");
  // Safe copy resolver: config[lang] → legacy string → fallback
  const copy = (key, fallback) => {
    const v = appConfig[key];
    if (v && typeof v === "object") return v[lang] || v.tr || v.en || fallback;
    if (typeof v === "string") return v;
    return fallback;
  };

  const [view, setView] = _uS(screen);
  const [activeCat, setActiveCat] = _uS(categories[0]?.id);
  const [cart, setCart] = _uS([]);
  const [stage, setStage] = _uS("received");
  const [productOpen, setProductOpen] = _uS(null);
  const [tip, setTip] = _uS(0);
  const [promo, setPromo] = _uS(false);

  const [account, setAccount] = _uS(() => {
    try { return JSON.parse(localStorage.getItem("aleg:customer-session")||"null"); }
    catch { return null; }
  });
  const [authStep, setAuthStep] = _uS("phone");
  const [authPhone, setAuthPhone] = _uS("");
  const [authOtp, setAuthOtp] = _uS("");
  const [authName, setAuthName] = _uS("");

  _uE(()=>{
    if (account) localStorage.setItem("aleg:customer-session", JSON.stringify(account));
    else localStorage.removeItem("aleg:customer-session");
  }, [account]);

  _uE(()=>{ setView(screen); }, [screen]);
  _uE(()=>{
    if (view!=="tracker") return;
    const stages = ["received","preparing","ready","delivered"];
    let i=0; setStage("received");
    const id = setInterval(()=>{ i++; if (i<stages.length) setStage(stages[i]); else clearInterval(id); }, 2400);
    return ()=>clearInterval(id);
  }, [view]);

  const addToCart = (p) => setCart(c => {
    const f = c.find(x=>x.pid===p.id && !x.size);
    return f ? c.map(x=>x===f?{...x,qty:x.qty+1}:x)
            : [...c, {pid:p.id, qty:1, unit:p.price, key:Date.now()+Math.random()}];
  });
  const addDetailedItem = (item) => {
    setCart(c => [...c, {...item, key:Date.now()+Math.random()}]);
    setProductOpen(null);
  };
  const setQtyAt = (idx, qty) => setCart(c =>
    qty<=0 ? c.filter((_,i)=>i!==idx) : c.map((x,i)=>i===idx?{...x,qty}:x));

  const cartItems = cart.map(c => ({...c, p: products.find(p=>p.id===c.pid)})).filter(x=>x.p);
  const cartCount = cartItems.reduce((s,c)=>s+c.qty, 0);
  const subtotal = cartItems.reduce((s,c)=>s+((c.unit||c.p.price)*c.qty), 0);

  const go = (v) => { setView(v); onScreenChange && onScreenChange(v); };

  // Tab → view mapping
  const handleTab = (tabId) => {
    if (tabId==="home") go("menu");
    else if (tabId==="orders") go("orderHistory");
    else if (tabId==="rewards") go("rewards");
    else if (tabId==="account") { setAuthStep(account?"done":"phone"); go("account"); }
  };

  // Current view resolution
  const renderView = () => {
    switch (view) {
      case "menu":
      case "home":
        return <HomeScreen th={th} lang={lang} brandName={brandName}
          appConfig={appConfig} copy={copy}
          categories={categories} products={products} account={account}
          cartCount={cartCount} subtotal={subtotal}
          activeCat={activeCat} setActiveCat={setActiveCat}
          addToCart={addToCart} openProduct={setProductOpen}
          openAccount={()=>{ setAuthStep(account?"done":"phone"); go("account"); }}
          goCart={()=>go("cart")} dineIn={true}/>;
      case "cart":
        return <CartScreen th={th} lang={lang} copy={copy} cart={cart} products={products}
          setQty={setQtyAt} removeItem={(i)=>setQtyAt(i,0)}
          subtotal={subtotal} tip={tip} setTip={setTip}
          promo={promo} setPromo={setPromo}
          onCheckout={()=>{ setCart([]); go("tracker"); }}/>;
      case "tracker":
        return <TrackerScreen th={th} lang={lang} stage={stage} t={t} copy={copy}
          goMenu={()=>go("menu")} goReview={()=>go("review")}
          order={{id:"2041", items:[
            {name:"Flat White", qty:1, price:95},
            {name:"Cortado", qty:1, price:85},
          ]}}/>;
      case "review":
        return <ReviewScreen th={th} lang={lang} t={t} copy={copy} onDone={()=>go("menu")}/>;
      case "orderHistory":
      case "orders":
        return <OrdersScreen th={th} lang={lang} account={account}
          goTracker={()=>go("tracker")} goMenu={()=>go("menu")}/>;
      case "rewards":
        return <RewardsScreen th={th} lang={lang} account={account}
          openAccount={()=>{ setAuthStep("phone"); go("account"); }}/>;
      case "account":
        return <AccountScreen th={th} lang={lang} copy={copy} account={account} setAccount={setAccount}
          authStep={authStep} setAuthStep={setAuthStep}
          authPhone={authPhone} setAuthPhone={setAuthPhone}
          authOtp={authOtp} setAuthOtp={setAuthOtp}
          authName={authName} setAuthName={setAuthName}
          goHome={()=>go("menu")}/>;
      default: return null;
    }
  };

  // View-specific headers
  const headerFor = () => {
    if (view==="cart") return <Header th={th} title={t("cart")}
      sub={lang==="tr"?"Masa 14":"Table 14"} onBack={()=>go("menu")}/>;
    if (view==="tracker") return <Header th={th}
      title={lang==="tr"?"Sipariş takibi":"Order tracking"}
      sub={lang==="tr"?"Masa 14":"Table 14"} onBack={()=>go("menu")}/>;
    if (view==="review") return <Header th={th}
      title={lang==="tr"?"Değerlendirme":"Review"} onBack={()=>go("tracker")}/>;
    if (view==="account") return <Header th={th}
      title={account ? (lang==="tr"?"Hesabım":"My account") : (lang==="tr"?"Üyelik":"Join Aleg")}
      sub={account ? (lang==="tr"?`${account.points} puan · ${account.visits} ziyaret`:`${account.points} pts · ${account.visits} visits`) : null}
      onBack={()=>go("menu")}/>;
    if (view==="orderHistory") return <Header th={th}
      title={lang==="tr"?"Siparişlerim":"My orders"}
      sub={lang==="tr"?"Aktif + geçmiş":"Active + history"}/>;
    if (view==="rewards") return <Header th={th}
      title={lang==="tr"?"Ödüller":"Rewards"}
      sub={account?`${account.tier}`:null}/>;
    return null;
  };

  const showTabBar = ["menu","home","orderHistory","orders","rewards","account"].includes(view) && !productOpen;
  const showCampaign = view==="campaign" && campaign;

  return (
    <div style={{
      width:300, height:620, borderRadius:42, padding:8,
      background:"linear-gradient(180deg, #1a1410, #2a1f18)",
      boxShadow:"0 0 0 1px rgba(0,0,0,.25), 0 30px 60px rgba(42,31,24,.3), inset 0 1px 0 rgba(255,255,255,.04)",
      position:"relative", flexShrink:0
    }}>
      {/* Notch */}
      <div style={{position:"absolute", top:14, left:"50%", transform:"translateX(-50%)",
        width:88, height:22, borderRadius:14, background:"#000", zIndex:3}}/>
      <div style={{width:"100%", height:"100%", borderRadius:36, overflow:"hidden",
        background:th.bg, color:th.text, display:"flex", flexDirection:"column", position:"relative"}}>
        <StatusBar th={th}/>
        {headerFor()}
        {view!=="campaign" && renderView()}
        {showTabBar && <TabBar th={th} view={view} go={handleTab} cartCount={cartCount}
          hasActiveOrder={view==="tracker" || stage!=="received" /*heuristic*/}
          lang={lang}/>}
        {/* Home indicator */}
        <div style={{position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)",
          width:100, height:3, borderRadius:2, background:th.text, opacity:.35, zIndex:4}}/>

        {productOpen && (
          <ProductSheet th={th} lang={lang} product={productOpen}
            onClose={()=>setProductOpen(null)} onAdd={addDetailedItem}/>
        )}

        {showCampaign && <CampaignOverlay th={th} lang={lang} campaign={campaign}
          onClose={()=>go("menu")}/>}
      </div>

      {/* Preview screen chips (external) */}
      <div style={{position:"absolute", bottom:-40, left:0, right:0, display:"flex",
        gap:4, justifyContent:"center", flexWrap:"wrap"}}>
        {[
          {id:"menu",         tr:"Ana sayfa",  en:"Home"},
          {id:"cart",         tr:"Sepet",      en:"Cart"},
          {id:"tracker",      tr:"Takip",      en:"Tracker"},
          {id:"review",       tr:"Değerl.",    en:"Review"},
          {id:"orderHistory", tr:"Siparişler", en:"Orders"},
          {id:"rewards",      tr:"Ödüller",    en:"Rewards"},
          {id:"account",      tr:"Hesap",      en:"Account"},
        ].map(c => (
          <button key={c.id} onClick={()=>go(c.id)} style={{
            padding:"4px 8px", borderRadius:7, fontSize:9.5, fontWeight:600,
            fontFamily:"var(--font-mono)", letterSpacing:".06em",
            background: view===c.id ? "var(--ink)" : "var(--paper-2)",
            color: view===c.id ? "var(--paper)" : "var(--ink-3)",
            border:"1px solid var(--line)"
          }}>{c[lang]}</button>
        ))}
      </div>
    </div>
  );
};

const MiniPhone = ({theme="cream", children, w=130, h=240}) => (
  <div style={{width:w, height:h, borderRadius:22, padding:4,
    background:"linear-gradient(180deg,#1a1410,#2a1f18)",
    boxShadow:"0 12px 24px rgba(42,31,24,.18)"}}>
    <div style={{width:"100%", height:"100%", borderRadius:18, overflow:"hidden",
      background: theme==="dark"?"#0F0906":theme==="cream"?"#F4EEE2":theme==="swiss"?"#FFF":"#F2EEE8"}}>
      {children}
    </div>
  </div>
);

Object.assign(window, { MenuPreview, MiniPhone, STAGE_INDEX, STAGE_LABEL });
