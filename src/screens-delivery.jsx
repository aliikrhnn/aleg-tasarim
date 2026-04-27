// Paket Servis / Delivery module.
// Exports on window: DeliveryScreen, CallerIdPopup

const _minsAgo = (iso) => iso ? Math.max(0, Math.floor((Date.now()-new Date(iso).getTime())/60000)) : null;
const _minsUntil = (iso) => iso ? Math.max(0, Math.round((new Date(iso).getTime()-Date.now())/60000)) : null;
const _fmtTime = (iso, lang) => iso ? new Date(iso).toLocaleTimeString(lang==="tr"?"tr-TR":"en-US",{hour:"2-digit",minute:"2-digit"}) : "—";
const _fmtMoney = (n) => "₺" + (n||0).toLocaleString("tr-TR");

const STAGE_META = {
  new:       {tr:"Yeni",         en:"New",        dot:"#C4553A"},
  preparing: {tr:"Hazırlanıyor", en:"Preparing",  dot:"#C8862C"},
  ready:     {tr:"Hazır",        en:"Ready",      dot:"#4F7C4C"},
  on_route:  {tr:"Yolda",        en:"On route",   dot:"#2E5B7A"},
  delivered: {tr:"Teslim",       en:"Delivered",  dot:"#8E8579"},
  cancelled: {tr:"İptal",        en:"Cancelled",  dot:"#8E8579"},
};

const PAY_META = {
  cash:             {tr:"Nakit",        en:"Cash",             icon:"cash"},
  card_on_delivery: {tr:"Kapıda Kart",  en:"Card on delivery", icon:"credit-card"},
  online:           {tr:"Online Ödeme", en:"Online",           icon:"globe"},
};

const nextStage = (s)=>({new:"preparing",preparing:"ready",ready:"on_route",on_route:"delivered"})[s];
const advanceLabel = (s, lang) => {
  const L = {new:{tr:"Başlat",en:"Start"}, preparing:{tr:"Hazır",en:"Ready"},
    ready:{tr:"Kuryede",en:"Dispatch"}, on_route:{tr:"Teslim",en:"Delivered"}};
  return L[s]?.[lang] || L[s]?.en || "";
};

const Metalabel = ({children, style}) => (
  <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".1em",
    color:"var(--ink-3)", textTransform:"uppercase", fontWeight:600, ...style}}>
    {children}
  </div>
);

const StatTile = ({label, count, dotColor}) => (
  <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, padding:"14px 16px"}}>
    <div style={{display:"flex", alignItems:"center", gap:6, fontSize:10,
      fontFamily:"var(--font-mono)", letterSpacing:".12em", color:"var(--ink-3)",
      textTransform:"uppercase", fontWeight:600, marginBottom:6}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:dotColor}}/>
      {label}
    </div>
    <div style={{fontSize:28, fontWeight:500, letterSpacing:"-0.02em",
      fontFamily:"var(--font-display)", fontStyle:"italic", lineHeight:1}}>{count}</div>
  </div>
);

const MiniStat = ({label, value}) => (
  <div>
    <div style={{fontSize:9, fontFamily:"var(--font-mono)", letterSpacing:".1em",
      color:"var(--ink-3)", textTransform:"uppercase", fontWeight:600}}>{label}</div>
    <div style={{fontSize:16, fontWeight:500, marginTop:2, letterSpacing:"-0.01em",
      fontFamily:"var(--font-display)", fontStyle:"italic"}}>{value}</div>
  </div>
);

const StatBox = ({label, value}) => (
  <div style={{background:"var(--paper-2)", border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px"}}>
    <Metalabel style={{marginBottom:4}}>{label}</Metalabel>
    <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.01em",
      fontFamily:"var(--font-display)", fontStyle:"italic"}}>{value}</div>
  </div>
);

const TimelineRow = ({label, t, lang}) => (
  <div style={{display:"flex", justifyContent:"space-between", fontSize:11.5,
    color: t?"var(--ink-2)":"var(--ink-3)", opacity: t?1:.5}}>
    <span>{label}</span>
    <span style={{fontFamily:"var(--font-mono)"}}>{t ? _fmtTime(t, lang) : "—"}</span>
  </div>
);

/* ─── Order card ─── */
const OrderCard = ({order, customer, address, onAdvance, onSelect, selected, lang}) => {
  const age = _minsAgo(order.createdAt);
  const urgent = age >= 15 && !["delivered","cancelled"].includes(order.stage);
  return (
    <div onClick={()=>onSelect(order.id)} style={{
      background: selected?"var(--card-2)":"var(--card)",
      border: selected?"1.5px solid var(--accent)":"1px solid var(--line)",
      borderRadius:12, padding:14, cursor:"pointer",
      boxShadow: selected?"var(--shadow)":"none"}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".1em",
            color:"var(--ink-3)", textTransform:"uppercase", marginBottom:3}}>{order.id}</div>
          <div style={{fontSize:14, fontWeight:600, lineHeight:1.2,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
            {customer?.name || "—"}
          </div>
        </div>
        <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontWeight:500,
          fontSize:17, letterSpacing:"-0.02em"}}>{_fmtMoney(order.total)}</div>
      </div>
      <div style={{marginTop:8, fontSize:11.5, color:"var(--ink-2)", lineHeight:1.4,
        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
        {order.items.map(i=>`${i.qty}× ${i.name}`).join(" · ")}
      </div>
      {address && (
        <div style={{marginTop:6, fontSize:11, color:"var(--ink-3)",
          display:"flex", alignItems:"center", gap:4,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          <Icon name="home" size={10}/> {address.zone}
        </div>
      )}
      <div style={{marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
        <div style={{fontSize:10.5, fontFamily:"var(--font-mono)",
          color: urgent?"var(--danger)":"var(--ink-3)",
          letterSpacing:".06em", textTransform:"uppercase",
          display:"flex", alignItems:"center", gap:4,
          padding: urgent?"3px 7px":0,
          background: urgent?"rgba(184,74,58,.1)":"transparent",
          borderRadius:6, fontWeight:urgent?600:500}}>
          <Icon name="clock" size={10}/> {age}{lang==="tr"?"dk":"m"}
        </div>
        {onAdvance && (
          <button onClick={(e)=>{e.stopPropagation(); onAdvance(order);}} style={{
            padding:"5px 10px", fontSize:11, fontWeight:600, borderRadius:7,
            background:"var(--ink)", color:"var(--paper)"}}>
            {advanceLabel(order.stage, lang)}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Pipeline ─── */
const Pipeline = ({orders, customers, couriers, onUpdate, selected, setSelected, lang}) => {
  const stages = ["new","preparing","ready","on_route"];
  const getCust = (id)=>customers.find(c=>c.id===id);
  const getAddr = (o)=>{ const c=getCust(o.customerId); return c?c.addresses.find(a=>a.id===o.addressId)||null:null; };
  const advance = (o) => {
    const ns = nextStage(o.stage); if (!ns) return;
    const now = new Date().toISOString();
    const patch = {stage:ns};
    if (ns==="preparing") patch.prepStartedAt = now;
    if (ns==="ready") patch.readyAt = now;
    if (ns==="on_route") { patch.pickedAt = now; if (!o.courierId) { const f=couriers.find(c=>c.status==="idle"); if (f) patch.courierId=f.id; } }
    if (ns==="delivered") patch.deliveredAt = now;
    onUpdate(o.id, patch);
  };
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, alignItems:"flex-start"}}>
      {stages.map(s => {
        const col = orders.filter(o=>o.stage===s);
        const meta = STAGE_META[s];
        return (
          <div key={s} style={{display:"flex", flexDirection:"column", gap:10, minHeight:200}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4px"}}>
              <div style={{display:"flex", alignItems:"center", gap:8, fontSize:11,
                letterSpacing:".12em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", fontFamily:"var(--font-mono)"}}>
                <span style={{width:7, height:7, borderRadius:"50%", background:meta.dot}}/>
                {meta[lang]||meta.en}
              </div>
              <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{col.length}</div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {col.length===0 && (
                <div style={{padding:"18px 14px", border:"1px dashed var(--line-2)",
                  borderRadius:10, textAlign:"center", color:"var(--ink-3)", fontSize:11.5}}>
                  {lang==="tr"?"Boş":"Empty"}
                </div>
              )}
              {col.map(o => (
                <OrderCard key={o.id} order={o} customer={getCust(o.customerId)}
                  address={getAddr(o)} onAdvance={advance}
                  selected={selected===o.id} onSelect={setSelected} lang={lang}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Detail ─── */
const OrderDetail = ({order, customer, address, couriers, lang, onUpdate, onClose}) => {
  if (!order) return null;
  const pay = PAY_META[order.paymentMethod] || PAY_META.cash;
  const courier = couriers.find(c=>c.id===order.courierId);
  const etaMin = _minsUntil(order.eta);
  return (
    <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14,
      padding:22, display:"flex", flexDirection:"column", gap:16}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          <Metalabel style={{marginBottom:4}}>
            {order.id} · {STAGE_META[order.stage][lang]||STAGE_META[order.stage].en}
          </Metalabel>
          <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:26,
            fontWeight:500, letterSpacing:"-0.02em", lineHeight:1.1}}>{customer?.name || "—"}</div>
          <div style={{fontSize:12, color:"var(--ink-3)", marginTop:4,
            fontFamily:"var(--font-mono)", letterSpacing:".04em"}}>{customer?.phone}</div>
        </div>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",
          background:"var(--paper-2)", display:"grid", placeItems:"center"}}>
          <Icon name="close" size={14}/>
        </button>
      </div>
      {address && (
        <div style={{background:"var(--paper-2)", border:"1px solid var(--line)",
          borderRadius:10, padding:"12px 14px"}}>
          <Metalabel style={{marginBottom:4}}>
            <Icon name="pin" size={10} style={{marginRight:4, verticalAlign:"-1px"}}/>
            {lang==="tr"?"Teslimat":"Delivery"} · {address.label}
          </Metalabel>
          <div style={{fontSize:13, lineHeight:1.45}}>{address.text}</div>
          {address.notes && <div style={{fontSize:11.5, color:"var(--ink-2)", marginTop:6, fontStyle:"italic"}}>"{address.notes}"</div>}
        </div>
      )}
      <div>
        <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Ürünler":"Items"}</Metalabel>
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {order.items.map((it,i) => (
            <div key={i} style={{display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", fontSize:13, padding:"6px 0",
              borderBottom: i<order.items.length-1?"1px solid var(--line)":"none"}}>
              <div style={{flex:1, minWidth:0}}>
                <span style={{fontFamily:"var(--font-mono)", color:"var(--ink-3)", marginRight:8}}>{it.qty}×</span>
                {it.name}
                {it.mods?.length>0 && (
                  <div style={{fontSize:11, color:"var(--ink-3)", marginLeft:30, marginTop:2, fontStyle:"italic"}}>
                    + {it.mods.join(", ")}
                  </div>
                )}
              </div>
              <div style={{fontFamily:"var(--font-mono)"}}>{_fmtMoney(it.qty*it.price)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:4, paddingTop:10, borderTop:"1px solid var(--line)"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, color:"var(--ink-2)"}}>
          <span>{lang==="tr"?"Ara toplam":"Subtotal"}</span>
          <span style={{fontFamily:"var(--font-mono)"}}>{_fmtMoney(order.subtotal)}</span>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, color:"var(--ink-2)"}}>
          <span>{lang==="tr"?"Teslimat":"Delivery fee"}</span>
          <span style={{fontFamily:"var(--font-mono)"}}>{order.deliveryFee===0?(lang==="tr"?"Ücretsiz":"Free"):_fmtMoney(order.deliveryFee)}</span>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:600, marginTop:4}}>
          <span>{lang==="tr"?"Toplam":"Total"}</span>
          <span style={{fontFamily:"var(--font-display)", fontStyle:"italic", letterSpacing:"-0.01em"}}>{_fmtMoney(order.total)}</span>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <div style={{background:"var(--paper-2)", borderRadius:10, padding:"10px 12px", border:"1px solid var(--line)"}}>
          <Metalabel style={{marginBottom:4}}>{lang==="tr"?"Ödeme":"Payment"}</Metalabel>
          <div style={{fontSize:12.5, display:"flex", alignItems:"center", gap:6}}>
            <Icon name={pay.icon} size={13}/> {pay[lang]||pay.en}
          </div>
          <div style={{fontSize:10.5, color: order.paid?"var(--ok)":"var(--warn)", marginTop:3, fontWeight:600}}>
            {order.paid?(lang==="tr"?"Ödendi":"Paid"):(lang==="tr"?"Bekliyor":"Pending")}
          </div>
        </div>
        <div style={{background:"var(--paper-2)", borderRadius:10, padding:"10px 12px", border:"1px solid var(--line)"}}>
          <Metalabel style={{marginBottom:4}}>ETA</Metalabel>
          <div style={{fontSize:12.5}}>
            {order.eta?(<>{_fmtTime(order.eta, lang)} <span style={{color:"var(--ink-3)"}}>({etaMin}{lang==="tr"?"dk":"m"})</span></>):"—"}
          </div>
        </div>
      </div>
      {order.notes && (
        <div style={{fontSize:12, color:"var(--ink-2)", padding:"10px 12px",
          background:"var(--paper-2)", borderRadius:10, border:"1px solid var(--line)", fontStyle:"italic"}}>
          "{order.notes}"
        </div>
      )}
      <div>
        <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Kurye":"Courier"}</Metalabel>
        {courier ? (
          <div style={{display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
            background:"var(--paper-2)", borderRadius:10, border:"1px solid var(--line)"}}>
            <div style={{width:32, height:32, borderRadius:"50%", background:courier.color,
              color:"#FFF8EC", display:"grid", placeItems:"center", fontSize:12, fontWeight:600}}>
              {courier.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600}}>{courier.name}</div>
              <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{courier.phone}</div>
            </div>
            <Icon name={courier.vehicle==="bicycle"?"bicycle":"scooter"} size={18} stroke="var(--ink-2)"/>
          </div>
        ) : (
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            {couriers.filter(c=>c.status!=="break").map(c => (
              <button key={c.id} onClick={()=>onUpdate(order.id,{courierId:c.id})} style={{
                padding:"6px 10px", fontSize:12, fontWeight:500, borderRadius:8,
                background:"var(--card-2)", border:"1px solid var(--line)",
                display:"inline-flex", alignItems:"center", gap:6}}>
                <span style={{width:8, height:8, borderRadius:"50%",
                  background: c.status==="idle"?"var(--ok)":"var(--warn)"}}/>
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:6, paddingTop:10, borderTop:"1px solid var(--line)"}}>
        <TimelineRow label={lang==="tr"?"Sipariş":"Ordered"}  t={order.createdAt}    lang={lang}/>
        <TimelineRow label={lang==="tr"?"Hazırlık":"Prep"}    t={order.prepStartedAt} lang={lang}/>
        <TimelineRow label={lang==="tr"?"Hazır":"Ready"}      t={order.readyAt}      lang={lang}/>
        <TimelineRow label={lang==="tr"?"Yola çıktı":"Picked"} t={order.pickedAt}    lang={lang}/>
        <TimelineRow label={lang==="tr"?"Teslim":"Delivered"} t={order.deliveredAt}  lang={lang}/>
      </div>
    </div>
  );
};

/* ─── Customers tab ─── */
const CustomerDetail = ({customer: c, onCompose, lang}) => (
  <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14,
    padding:22, display:"flex", flexDirection:"column", gap:16}}>
    <div style={{display:"flex", alignItems:"center", gap:14}}>
      <Avatar name={c.name} size={52}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:22,
          fontWeight:500, letterSpacing:"-0.02em", lineHeight:1.1,
          display:"flex", alignItems:"center", gap:8}}>
          {c.name}
          {c.vip && <Pill tone="accent" size="sm">VIP</Pill>}
        </div>
        <div style={{fontSize:12, color:"var(--ink-3)",
          fontFamily:"var(--font-mono)", letterSpacing:".04em", marginTop:3}}>{c.phone}</div>
      </div>
    </div>
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
      <StatBox label={lang==="tr"?"Sipariş":"Orders"} value={c.orders}/>
      <StatBox label={lang==="tr"?"Toplam":"Spent"}   value={_fmtMoney(c.spent)}/>
    </div>
    <div>
      <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Adresler":"Addresses"}</Metalabel>
      <div style={{display:"flex", flexDirection:"column", gap:8}}>
        {c.addresses.map(a => (
          <div key={a.id} style={{padding:"10px 12px", background:"var(--paper-2)",
            borderRadius:10, border:"1px solid var(--line)"}}>
            <div style={{fontSize:11.5, fontWeight:600, display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
              <Icon name="home" size={10}/> {a.label}
              {a.default && <span style={{fontSize:10, color:"var(--ink-3)",
                fontFamily:"var(--font-mono)", letterSpacing:".06em"}}>
                {lang==="tr"?"· VARSAYILAN":"· DEFAULT"}
              </span>}
            </div>
            <div style={{fontSize:12.5, lineHeight:1.4}}>{a.text}</div>
            {a.notes && <div style={{fontSize:11, color:"var(--ink-3)", marginTop:4, fontStyle:"italic"}}>"{a.notes}"</div>}
          </div>
        ))}
      </div>
    </div>
    {c.fav?.length>0 && (
      <div>
        <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Favoriler":"Favorites"}</Metalabel>
        <div style={{display:"flex", flexWrap:"wrap", gap:5}}>
          {c.fav.map(f => <Pill key={f} tone="muted" size="sm">{f}</Pill>)}
        </div>
      </div>
    )}
    {c.notes && (
      <div style={{fontSize:12, color:"var(--ink-2)", padding:"10px 12px",
        background:"var(--paper-2)", borderRadius:10, border:"1px solid var(--line)", fontStyle:"italic"}}>
        "{c.notes}"
      </div>
    )}
    <Button variant="primary" icon="plus" onClick={()=>onCompose({customer:c})}>
      {lang==="tr"?"Yeni sipariş oluştur":"Create order"}
    </Button>
  </div>
);

const NewCustomerDialog = ({config, onSave, onClose, lang}) => {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addr, setAddr] = React.useState("");
  const [zone, setZone] = React.useState(config.defaultZone || config.serviceZones?.[0] || "");
  const [label, setLabel] = React.useState(lang==="tr"?"Ev":"Home");
  const [notes, setNotes] = React.useState("");
  const [vip, setVip] = React.useState(false);
  const canSave = name.trim() && phone.replace(/\s/g,"").length >= 7;
  return (
    <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(20,14,10,.45)",
      zIndex:95, backdropFilter:"blur(3px)", display:"grid", placeItems:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:"92vw",
        background:"var(--paper)", borderRadius:16, padding:"24px 26px",
        border:"1px solid var(--line)", boxShadow:"var(--shadow-lg)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <div>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".14em",
              color:"var(--accent)", textTransform:"uppercase", fontWeight:600}}>
              {lang==="tr"?"Müşteri":"Customer"}
            </div>
            <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:22,
              fontWeight:500, letterSpacing:"-0.02em", marginTop:2}}>
              {lang==="tr"?"Yeni müşteri ekle":"New customer"}
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",
            background:"var(--card-2)", display:"grid", placeItems:"center"}}>
            <Icon name="close" size={14}/>
          </button>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          <div>
            <Metalabel style={{marginBottom:6}}>{lang==="tr"?"Ad Soyad":"Full name"}</Metalabel>
            <input value={name} onChange={e=>setName(e.target.value)} autoFocus
              placeholder={lang==="tr"?"Örn. Ayşe Demir":"e.g. Ayse Demir"}
              style={{width:"100%", padding:"9px 12px", border:"1px solid var(--line)",
                borderRadius:8, fontSize:13.5, background:"var(--card)"}}/>
          </div>
          <div>
            <Metalabel style={{marginBottom:6}}>{lang==="tr"?"Telefon":"Phone"}</Metalabel>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              style={{width:"100%", padding:"9px 12px", border:"1px solid var(--line)",
                borderRadius:8, fontSize:13.5, fontFamily:"var(--font-mono)", background:"var(--card)"}}/>
          </div>
          <div style={{paddingTop:10, marginTop:4, borderTop:"1px solid var(--line)"}}>
            <Metalabel style={{marginBottom:6}}>
              <Icon name="home" size={10} style={{marginRight:4, verticalAlign:"-1px"}}/>
              {lang==="tr"?"Adres (opsiyonel)":"Address (optional)"}
            </Metalabel>
            <input value={addr} onChange={e=>setAddr(e.target.value)}
              placeholder={lang==="tr"?"Sokak, bina, daire…":"Street, building, apt…"}
              style={{width:"100%", padding:"9px 12px", border:"1px solid var(--line)",
                borderRadius:8, fontSize:13, background:"var(--card)", marginBottom:6}}/>
            <div style={{display:"flex", gap:6}}>
              <input value={label} onChange={e=>setLabel(e.target.value)}
                placeholder={lang==="tr"?"Etiket":"Label"}
                style={{width:110, padding:"8px 10px", border:"1px solid var(--line)",
                  borderRadius:8, fontSize:12.5, background:"var(--card)"}}/>
              <select value={zone} onChange={e=>setZone(e.target.value)}
                style={{flex:1, padding:"8px 10px", border:"1px solid var(--line)",
                  borderRadius:8, fontSize:12.5, background:"var(--card)"}}>
                {(config.serviceZones||[]).map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Metalabel style={{marginBottom:6}}>{lang==="tr"?"Not":"Notes"}</Metalabel>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              placeholder={lang==="tr"?"Tercihler, alerjiler…":"Preferences, allergies…"}
              style={{width:"100%", padding:"9px 12px", border:"1px solid var(--line)",
                borderRadius:8, fontSize:12.5, background:"var(--card)", resize:"vertical",
                fontFamily:"inherit"}}/>
          </div>
          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12.5, cursor:"pointer",
            padding:"6px 0"}}>
            <input type="checkbox" checked={vip} onChange={e=>setVip(e.target.checked)}/>
            {lang==="tr"?"VIP müşteri olarak işaretle":"Mark as VIP customer"}
          </label>
        </div>
        <div style={{display:"flex", gap:8, marginTop:18, justifyContent:"flex-end"}}>
          <Button variant="secondary" onClick={onClose}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="primary" icon="plus"
            onClick={()=>{
              if (!canSave) return;
              const id = "CP-" + Date.now().toString().slice(-6);
              const addresses = addr.trim() ? [{
                id:"a"+Date.now(), label:label||"—", text:addr, zone, notes:"", default:true
              }] : [];
              onSave({id, name:name.trim(), phone:phone.trim(),
                addresses, orders:0, spent:0, fav:[], notes:notes.trim(), vip});
            }}
            style={{opacity:canSave?1:.5, pointerEvents:canSave?"auto":"none"}}>
            {lang==="tr"?"Kaydet":"Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomersTab = ({customers, onCompose, onSelect, selected, onCreate, config, lang}) => {
  const [q, setQ] = React.useState("");
  const [newOpen, setNewOpen] = React.useState(false);
  const list = customers.filter(c => !q
    || c.name.toLowerCase().includes(q.toLowerCase())
    || c.phone.replace(/\s/g,"").includes(q.replace(/\s/g,"")));
  const chosen = selected ? customers.find(c=>c.id===selected) : null;
  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"flex-start"}}>
      <div>
        <div style={{display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
          background:"var(--card)", border:"1px solid var(--line)", borderRadius:10, marginBottom:14}}>
          <Icon name="search" size={14} stroke="var(--ink-3)"/>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder={lang==="tr"?"İsim veya telefon":"Name or phone"}
            style={{border:"none", outline:"none", background:"transparent", flex:1, fontSize:13, color:"var(--ink)"}}/>
          <Button size="sm" variant="primary" icon="plus" onClick={()=>setNewOpen(true)}>
            {lang==="tr"?"Yeni Müşteri":"New customer"}
          </Button>
        </div>
        {newOpen && <NewCustomerDialog config={config} lang={lang}
          onClose={()=>setNewOpen(false)}
          onSave={(c)=>{ onCreate(c); setNewOpen(false); onSelect(c.id); }}/>}
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {list.map(c => (
            <div key={c.id} onClick={()=>onSelect(c.id)} style={{
              padding:"14px 16px",
              background: selected===c.id?"var(--card-2)":"var(--card)",
              border: selected===c.id?"1.5px solid var(--accent)":"1px solid var(--line)",
              borderRadius:12, cursor:"pointer",
              display:"flex", alignItems:"center", gap:14}}>
              <Avatar name={c.name} size={40}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <div style={{fontSize:14, fontWeight:600}}>{c.name}</div>
                  {c.vip && <Pill tone="accent" size="sm">VIP</Pill>}
                </div>
                <div style={{fontSize:11.5, color:"var(--ink-3)",
                  fontFamily:"var(--font-mono)", letterSpacing:".03em"}}>{c.phone}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-display)", fontStyle:"italic",
                  fontSize:17, fontWeight:500, letterSpacing:"-0.02em"}}>{_fmtMoney(c.spent)}</div>
                <div style={{fontSize:10.5, color:"var(--ink-3)",
                  fontFamily:"var(--font-mono)", letterSpacing:".04em"}}>
                  {c.orders} {lang==="tr"?"sipariş":"orders"}
                </div>
              </div>
            </div>
          ))}
          {list.length===0 && (
            <div style={{padding:"40px 20px", textAlign:"center", color:"var(--ink-3)"}}>
              <Icon name="users" size={28} style={{opacity:.4, marginBottom:10}}/>
              <div style={{fontSize:13}}>{lang==="tr"?"Sonuç yok":"No results"}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{position:"sticky", top:20}}>
        {chosen ? <CustomerDetail customer={chosen} onCompose={onCompose} lang={lang}/> : (
          <div style={{padding:"40px 20px", background:"var(--card)",
            border:"1px solid var(--line)", borderRadius:14, textAlign:"center", color:"var(--ink-3)"}}>
            <Icon name="users" size={28} style={{opacity:.4, marginBottom:10}}/>
            <div style={{fontSize:13}}>{lang==="tr"?"Detay için müşteri seç":"Select a customer"}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Couriers tab ─── */
const CouriersTab = ({couriers, orders, lang}) => (
  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14}}>
    {couriers.map(c => {
      const active = orders.filter(o=>o.courierId===c.id && o.stage==="on_route");
      const sm = {idle:{tr:"Müsait",en:"Available",tone:"ok"},
        on_route:{tr:"Yolda",en:"On route",tone:"info"},
        break:{tr:"Mola",en:"Break",tone:"muted"}}[c.status] || {tr:"—",en:"—",tone:"muted"};
      return (
        <div key={c.id} style={{background:"var(--card)", border:"1px solid var(--line)",
          borderRadius:14, padding:18, display:"flex", flexDirection:"column", gap:14}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:44, height:44, borderRadius:"50%", background:c.color,
              color:"#FFF8EC", display:"grid", placeItems:"center", fontSize:14, fontWeight:600}}>
              {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, fontWeight:600}}>{c.name}</div>
              <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{c.phone}</div>
            </div>
            <Icon name={c.vehicle==="bicycle"?"bicycle":"scooter"} size={22} stroke="var(--ink-2)"/>
          </div>
          <Pill tone={sm.tone} size="sm">{sm[lang]||sm.en}</Pill>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8,
            paddingTop:10, borderTop:"1px solid var(--line)"}}>
            <MiniStat label={lang==="tr"?"Bugün":"Today"} value={c.deliveredToday}/>
            <MiniStat label={lang==="tr"?"Aktif":"Active"} value={active.length}/>
            <MiniStat label={lang==="tr"?"Ort.dk":"Avg"}  value={c.avgMin}/>
          </div>
          {active.length>0 && (
            <div style={{fontSize:11, color:"var(--ink-3)",
              fontFamily:"var(--font-mono)", letterSpacing:".06em", textTransform:"uppercase"}}>
              <Icon name="route" size={10} style={{marginRight:4}}/>{active[0].id}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/* ─── Call log tab ─── */
const CallLogTab = ({callLog, customers, lang}) => {
  const rm = {order:{tr:"Sipariş",en:"Order",tone:"ok"},
    missed:{tr:"Cevapsız",en:"Missed",tone:"danger"},
    info:{tr:"Bilgi",en:"Info",tone:"muted"}};
  return (
    <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 90px 110px 120px",
        padding:"10px 18px", borderBottom:"1px solid var(--line)",
        fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".1em",
        color:"var(--ink-3)", textTransform:"uppercase", fontWeight:600}}>
        <span>{lang==="tr"?"Arayan":"Caller"}</span>
        <span>{lang==="tr"?"Numara":"Number"}</span>
        <span>{lang==="tr"?"Süre":"Duration"}</span>
        <span>{lang==="tr"?"Sonuç":"Result"}</span>
        <span style={{textAlign:"right"}}>{lang==="tr"?"Saat":"Time"}</span>
      </div>
      {callLog.map(cl => {
        const cust = cl.customerId ? customers.find(c=>c.id===cl.customerId) : null;
        const r = rm[cl.result] || rm.info;
        return (
          <div key={cl.id} style={{display:"grid", gridTemplateColumns:"1fr 1fr 90px 110px 120px",
            padding:"12px 18px", borderBottom:"1px solid var(--line)", fontSize:13, alignItems:"center"}}>
            <span style={{fontWeight:cust?500:400, color:cust?"var(--ink)":"var(--ink-3)"}}>
              {cust?.name || (lang==="tr"?"Bilinmiyor":"Unknown")}
            </span>
            <span style={{fontFamily:"var(--font-mono)", color:"var(--ink-2)", fontSize:12}}>{cl.phone}</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:12, color:"var(--ink-2)"}}>
              {Math.floor(cl.duration/60)}:{String(cl.duration%60).padStart(2,"0")}
            </span>
            <span><Pill tone={r.tone} size="sm">{r[lang]||r.en}</Pill></span>
            <span style={{textAlign:"right", fontSize:11.5, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
              {_minsAgo(cl.ts)}{lang==="tr"?"dk önce":"m ago"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Settings tab ─── */
const ToggleRow = ({label, checked, onChange}) => (
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"8px 0", borderBottom:"1px solid var(--line)"}}>
    <span style={{fontSize:13}}>{label}</span>
    <Toggle on={checked} onChange={onChange}/>
  </div>
);
const NumRow = ({label, value, suffix, onChange}) => (
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"8px 0", borderBottom:"1px solid var(--line)"}}>
    <span style={{fontSize:13}}>{label}</span>
    <div style={{display:"flex", alignItems:"center", gap:6}}>
      <input type="number" value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{width:70, padding:"4px 8px", border:"1px solid var(--line)",
          borderRadius:6, fontSize:13, fontFamily:"var(--font-mono)", textAlign:"right",
          background:"var(--card-2)"}}/>
      <span style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)", minWidth:20}}>{suffix}</span>
    </div>
  </div>
);

const SettingsTab = ({config, setConfig, ringPhone, lang}) => {
  const update = (patch) => setConfig({...config, ...patch});
  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, maxWidth:900}}>
      <Card pad={22}>
        <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:20,
          fontWeight:500, letterSpacing:"-0.02em", marginBottom:14}}>{lang==="tr"?"Modül":"Module"}</div>
        <ToggleRow label={lang==="tr"?"Paket servis aktif":"Delivery enabled"} checked={config.enabled} onChange={v=>update({enabled:v})}/>
        <ToggleRow label={lang==="tr"?"Arayan kimliği":"Caller ID"} checked={config.callerIdEnabled} onChange={v=>update({callerIdEnabled:v})}/>
        <ToggleRow label={lang==="tr"?"Bilinen numaralara otomatik aç":"Auto-open for known numbers"} checked={config.autoAnswer} onChange={v=>update({autoAnswer:v})}/>
        <div style={{marginTop:16, paddingTop:14, borderTop:"1px solid var(--line)"}}>
          <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Sağlayıcı":"Provider"}</Metalabel>
          <div style={{fontSize:13}}>{config.provider}</div>
          <div style={{fontSize:12, color:"var(--ink-3)", marginTop:2, fontFamily:"var(--font-mono)"}}>{config.lineNumber}</div>
        </div>
        <div style={{marginTop:14}}>
          <Button variant="secondary" icon="phone-call" onClick={()=>ringPhone && ringPhone("+90 532 412 67 89")}>
            {lang==="tr"?"Arama simüle et":"Simulate call"}
          </Button>
        </div>
      </Card>
      <Card pad={22}>
        <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:20,
          fontWeight:500, letterSpacing:"-0.02em", marginBottom:14}}>{lang==="tr"?"Kurallar":"Rules"}</div>
        <NumRow label={lang==="tr"?"Minimum sipariş":"Min order"} value={config.minOrder} suffix="₺" onChange={v=>update({minOrder:v})}/>
        <NumRow label={lang==="tr"?"Ücretsiz teslim":"Free delivery above"} value={config.freeDeliveryAbove} suffix="₺" onChange={v=>update({freeDeliveryAbove:v})}/>
        <NumRow label={lang==="tr"?"Teslim ücreti":"Delivery fee"} value={config.deliveryFee} suffix="₺" onChange={v=>update({deliveryFee:v})}/>
        <NumRow label={lang==="tr"?"Hazırlık süresi":"Prep time"} value={config.prepTime} suffix={lang==="tr"?"dk":"m"} onChange={v=>update({prepTime:v})}/>
        <NumRow label={lang==="tr"?"Teslim yarıçapı":"Delivery radius"} value={config.deliveryRadius} suffix="km" onChange={v=>update({deliveryRadius:v})}/>
        <div style={{marginTop:14, paddingTop:14, borderTop:"1px solid var(--line)"}}>
          <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Servis Bölgeleri":"Service zones"}</Metalabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:5}}>
            {config.serviceZones.map(z => <Pill key={z} tone="muted" size="sm">{z}</Pill>)}
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ─── Composer drawer ─── */
const qtyBtn = {width:22, height:22, borderRadius:"50%", background:"var(--card-2)",
  border:"1px solid var(--line)", fontSize:14, lineHeight:"20px"};

const Composer = ({seed, products, config, customers, onSubmit, onClose, lang}) => {
  const initial = seed?.customer || null;
  const [cust, setCust] = React.useState(initial);
  const [phone, setPhone] = React.useState(seed?.phone || initial?.phone || "");
  const [nameDraft, setNameDraft] = React.useState(initial?.name || "");
  const [addrId, setAddrId] = React.useState(initial?.addresses?.[0]?.id || null);
  const [addrText, setAddrText] = React.useState("");
  const [addrZone, setAddrZone] = React.useState(config.defaultZone);
  const [items, setItems] = React.useState([]);
  const [pay, setPay] = React.useState("cash");
  const [notes, setNotes] = React.useState("");
  const [search, setSearch] = React.useState("");

  const address = cust ? cust.addresses.find(a=>a.id===addrId) : null;
  const subtotal = items.reduce((s,it)=>s+it.qty*it.price, 0);
  const fee = subtotal >= config.freeDeliveryAbove ? 0 : (subtotal>0?config.deliveryFee:0);
  const total = subtotal + fee;

  const filtered = React.useMemo(()=>
    products.filter(p => !search || (p.name?.[lang]||p.name?.tr||"").toLowerCase().includes(search.toLowerCase())).slice(0,40),
    [products, search, lang]);

  const normalized = (phone||"").replace(/\s/g,"");
  const matches = normalized.length >= 3
    ? customers.filter(c => c.phone.replace(/\s/g,"").includes(normalized)).slice(0,5) : [];
  const exact = customers.find(c => c.phone.replace(/\s/g,"")===normalized);

  const addItem = (p) => {
    const price = p.price||0;
    const pname = p.name?.[lang]||p.name?.tr||p.name?.en||p.id;
    setItems(arr => {
      const ex = arr.find(x=>x.pid===p.id);
      return ex ? arr.map(x=>x.pid===p.id?{...x,qty:x.qty+1}:x)
                : [...arr, {pid:p.id, name:pname, qty:1, price, mods:[]}];
    });
  };
  const adjust = (pid, d) => setItems(arr =>
    arr.map(x=>x.pid===pid?{...x,qty:Math.max(0,x.qty+d)}:x).filter(x=>x.qty>0));

  const canSubmit = cust && address && items.length>0 && subtotal>=config.minOrder;

  return (
    <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(20,14,10,.45)",
      zIndex:95, backdropFilter:"blur(3px)", display:"flex", justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:580, maxWidth:"100vw", height:"100vh",
        background:"var(--paper)", overflowY:"auto", padding:"24px 28px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
          <div>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".14em",
              color:"var(--accent)", textTransform:"uppercase", fontWeight:600}}>
              {lang==="tr"?"Yeni Paket Servis":"New Delivery Order"}
            </div>
            <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:24,
              fontWeight:500, letterSpacing:"-0.02em", marginTop:2}}>
              {lang==="tr"?"Telefonla sipariş":"Phone order"}
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",
            background:"var(--card-2)", display:"grid", placeItems:"center"}}>
            <Icon name="close" size={14}/>
          </button>
        </div>

        {cust ? (
          <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
            padding:14, marginBottom:14, display:"flex", alignItems:"center", gap:12}}>
            <Avatar name={cust.name} size={40}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:6}}>
                {cust.name}
                {cust.vip && <Pill tone="accent" size="sm">VIP</Pill>}
              </div>
              <div style={{fontSize:11.5, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{cust.phone}</div>
            </div>
            <button onClick={()=>{setCust(null); setAddrId(null);}}
              style={{fontSize:11, color:"var(--ink-3)", textDecoration:"underline"}}>
              {lang==="tr"?"Değiştir":"Change"}
            </button>
          </div>
        ) : (
          <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
            padding:14, marginBottom:14}}>
            <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Arayan":"Caller"}</Metalabel>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder={lang==="tr"?"Telefon numarası":"Phone number"}
              style={{width:"100%", padding:"8px 10px", border:"1px solid var(--line)",
                borderRadius:8, fontSize:13.5, fontFamily:"var(--font-mono)", background:"var(--card-2)"}}/>
            {matches.length>0 && (
              <div style={{display:"flex", flexDirection:"column", gap:4, marginTop:8}}>
                {matches.map(c => (
                  <button key={c.id} onClick={()=>{setCust(c); setAddrId(c.addresses[0]?.id||null);}}
                    style={{padding:"8px 10px", textAlign:"left", fontSize:12.5, borderRadius:8,
                      background:"var(--paper-2)", border:"1px solid var(--line)",
                      display:"flex", alignItems:"center", gap:8}}>
                    <Avatar name={c.name} size={26}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600}}>{c.name}</div>
                      <div style={{fontSize:10.5, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{c.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {normalized.length>=7 && !exact && (
              <div style={{marginTop:8}}>
                <input value={nameDraft} onChange={e=>setNameDraft(e.target.value)}
                  placeholder={lang==="tr"?"Ad (yeni müşteri)":"Name (new customer)"}
                  style={{width:"100%", padding:"8px 10px", border:"1px solid var(--line)",
                    borderRadius:8, fontSize:13, background:"var(--card-2)", marginBottom:6}}/>
                <Button size="sm" variant="secondary" icon="plus" onClick={()=>{
                  const id = "CP-" + Date.now().toString().slice(-6);
                  setCust({id, name: nameDraft || (lang==="tr"?"Yeni Müşteri":"New Customer"),
                    phone, addresses:[], orders:0, spent:0, fav:[], notes:"", vip:false});
                  setAddrId(null);
                }}>{lang==="tr"?"Yeni müşteri oluştur":"New customer"}</Button>
              </div>
            )}
          </div>
        )}

        {cust && (
          <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
            padding:14, marginBottom:14}}>
            <Metalabel style={{marginBottom:8}}>
              <Icon name="home" size={10} style={{marginRight:4}}/>
              {lang==="tr"?"Teslimat Adresi":"Delivery Address"}
            </Metalabel>
            {cust.addresses.length>0 ? (
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                {cust.addresses.map(a => (
                  <label key={a.id} style={{display:"flex", alignItems:"flex-start", gap:10,
                    padding:"10px 12px", borderRadius:8, cursor:"pointer",
                    border: addrId===a.id?"1.5px solid var(--accent)":"1px solid var(--line)",
                    background: addrId===a.id?"var(--card-2)":"transparent"}}>
                    <input type="radio" checked={addrId===a.id} onChange={()=>setAddrId(a.id)} style={{marginTop:3}}/>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12.5, fontWeight:600}}>{a.label}</div>
                      <div style={{fontSize:12, color:"var(--ink-2)", lineHeight:1.4}}>{a.text}</div>
                      {a.notes && <div style={{fontSize:11, color:"var(--ink-3)", marginTop:3, fontStyle:"italic"}}>"{a.notes}"</div>}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{fontSize:12.5, color:"var(--ink-3)", fontStyle:"italic"}}>
                {lang==="tr"?"Bu müşterinin kayıtlı adresi yok. Aşağıdan ekleyin.":"No saved addresses."}
              </div>
            )}
            <div style={{marginTop:10, paddingTop:10, borderTop:"1px solid var(--line)"}}>
              <div style={{fontSize:10.5, color:"var(--ink-3)", marginBottom:6,
                fontFamily:"var(--font-mono)", letterSpacing:".06em", textTransform:"uppercase"}}>
                {lang==="tr"?"Yeni adres":"New address"}
              </div>
              <input value={addrText} onChange={e=>setAddrText(e.target.value)}
                placeholder={lang==="tr"?"Sokak, bina no, daire…":"Street, building, apt…"}
                style={{width:"100%", padding:"8px 10px", border:"1px solid var(--line)",
                  borderRadius:8, fontSize:12.5, background:"var(--card-2)"}}/>
              <div style={{display:"flex", gap:6, marginTop:6}}>
                <select value={addrZone} onChange={e=>setAddrZone(e.target.value)}
                  style={{padding:"6px 10px", border:"1px solid var(--line)",
                    borderRadius:8, fontSize:12, background:"var(--card-2)", flex:1}}>
                  {config.serviceZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <Button size="sm" variant="secondary" onClick={()=>{
                  if (!addrText.trim()) return;
                  const aid = "a"+Date.now();
                  const a = {id:aid, label:lang==="tr"?"Yeni":"New", text:addrText,
                    zone:addrZone, notes:"", default: cust.addresses.length===0};
                  setCust({...cust, addresses:[...cust.addresses, a]});
                  setAddrId(aid); setAddrText("");
                }}>{lang==="tr"?"Ekle":"Add"}</Button>
              </div>
            </div>
          </div>
        )}

        <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
          padding:14, marginBottom:14}}>
          <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Menü":"Menu"}</Metalabel>
          <div style={{display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
            background:"var(--card-2)", border:"1px solid var(--line)", borderRadius:8, marginBottom:10}}>
            <Icon name="search" size={13} stroke="var(--ink-3)"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={lang==="tr"?"Ürün ara…":"Search…"}
              style={{border:"none", outline:"none", background:"transparent", flex:1, fontSize:12.5}}/>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",
            gap:6, maxHeight:220, overflowY:"auto"}}>
            {filtered.map(p => (
              <button key={p.id} onClick={()=>addItem(p)} style={{
                padding:"8px 10px", textAlign:"left", border:"1px solid var(--line)",
                borderRadius:8, background:"var(--card-2)", fontSize:12, lineHeight:1.3,
                display:"flex", flexDirection:"column", gap:2}}>
                <span style={{fontWeight:500, overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap"}}>{p.name?.[lang]||p.name?.tr||p.id}</span>
                <span style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{_fmtMoney(p.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {items.length>0 && (
          <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
            padding:14, marginBottom:14}}>
            <Metalabel style={{marginBottom:8}}>
              {lang==="tr"?"Sepet":"Cart"} ({items.reduce((s,i)=>s+i.qty,0)})
            </Metalabel>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {items.map(it => (
                <div key={it.pid} style={{display:"flex", alignItems:"center", gap:8,
                  fontSize:13, padding:"6px 0", borderBottom:"1px solid var(--line)"}}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{it.name}</div>
                    <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>{_fmtMoney(it.price)} × {it.qty}</div>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:2}}>
                    <button onClick={()=>adjust(it.pid,-1)} style={qtyBtn}>−</button>
                    <span style={{minWidth:20, textAlign:"center", fontSize:13, fontFamily:"var(--font-mono)"}}>{it.qty}</span>
                    <button onClick={()=>adjust(it.pid,+1)} style={qtyBtn}>+</button>
                  </div>
                  <span style={{fontFamily:"var(--font-mono)", fontWeight:500, minWidth:60, textAlign:"right"}}>{_fmtMoney(it.qty*it.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:"var(--card)", border:"1px solid var(--line)", borderRadius:12,
          padding:14, marginBottom:14}}>
          <Metalabel style={{marginBottom:8}}>{lang==="tr"?"Ödeme":"Payment"}</Metalabel>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6}}>
            {config.paymentMethods.map(m => {
              const pm = PAY_META[m] || {tr:m,en:m,icon:"cash"};
              const active = pay===m;
              return (
                <button key={m} onClick={()=>setPay(m)} style={{
                  padding:"10px 8px", borderRadius:8,
                  border: active?"1.5px solid var(--accent)":"1px solid var(--line)",
                  background: active?"var(--card-2)":"transparent",
                  fontSize:11.5, display:"flex", flexDirection:"column", alignItems:"center",
                  gap:4, fontWeight: active?600:500}}>
                  <Icon name={pm.icon} size={16} stroke={active?"var(--accent)":"var(--ink-2)"}/>
                  {pm[lang]||pm.en}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder={lang==="tr"?"Sipariş notu (opsiyonel)":"Order notes (optional)"}
          rows={2} style={{marginBottom:18}}/>

        <div style={{position:"sticky", bottom:0, background:"var(--paper)",
          paddingTop:14, borderTop:"1px solid var(--line)", marginTop:14}}>
          <div style={{display:"flex", flexDirection:"column", gap:4, marginBottom:12}}>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, color:"var(--ink-2)"}}>
              <span>{lang==="tr"?"Ara toplam":"Subtotal"}</span>
              <span style={{fontFamily:"var(--font-mono)"}}>{_fmtMoney(subtotal)}</span>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, color:"var(--ink-2)"}}>
              <span>{lang==="tr"?"Teslimat":"Delivery"}</span>
              <span style={{fontFamily:"var(--font-mono)"}}>{fee===0?(lang==="tr"?"Ücretsiz":"Free"):_fmtMoney(fee)}</span>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:600, marginTop:2}}>
              <span>{lang==="tr"?"Toplam":"Total"}</span>
              <span style={{fontFamily:"var(--font-display)", fontStyle:"italic", letterSpacing:"-0.02em"}}>{_fmtMoney(total)}</span>
            </div>
            {subtotal>0 && subtotal<config.minOrder && (
              <div style={{fontSize:11.5, color:"var(--danger)", marginTop:6}}>
                {lang==="tr"?`Min. sipariş: ${_fmtMoney(config.minOrder)}`:`Min. order: ${_fmtMoney(config.minOrder)}`}
              </div>
            )}
          </div>
          <Button variant="primary" onClick={()=>{
            if (!canSubmit) return;
            onSubmit({customerObj:cust, customerId:cust.id, addressId:address.id,
              items, subtotal, deliveryFee:fee, total, paymentMethod:pay, notes});
          }} style={{width:"100%", opacity:canSubmit?1:.5, pointerEvents:canSubmit?"auto":"none"}}>
            {lang==="tr"?"Siparişi oluştur":"Create order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main screen ─── */
const DeliveryScreen = ({t, lang, products, customers, setCustomers, couriers, setCouriers,
  orders, setOrders, callLog, setCallLog, config, setConfig, ringPhone, seed, clearSeed}) => {
  const [tab, setTab] = React.useState("pipeline");
  const [selected, setSelected] = React.useState(null);
  const [selectedCust, setSelectedCust] = React.useState(null);
  const [composerFor, setComposerFor] = React.useState(null);

  React.useEffect(() => {
    if (!seed) return;
    setComposerFor(seed);
    clearSeed && clearSeed();
  }, [seed]);

  const selectedOrder = orders.find(o=>o.id===selected) || null;
  const selectedCustObj = selectedOrder ? (customers.find(c=>c.id===selectedOrder.customerId)||null) : null;
  const selectedAddress = (selectedCustObj && selectedOrder) ? (selectedCustObj.addresses.find(a=>a.id===selectedOrder.addressId)||null) : null;

  const activeCount = orders.filter(o => !["delivered","cancelled"].includes(o.stage)).length;

  const tabs = [
    {id:"pipeline",  tr:"Sipariş Akışı", en:"Pipeline",  icon:"bag",    count: activeCount},
    {id:"customers", tr:"Müşteriler",    en:"Customers", icon:"users",  count: customers.length},
    {id:"couriers",  tr:"Kuryeler",      en:"Couriers",  icon:"scooter",count: couriers.filter(c=>c.status!=="break").length},
    {id:"calls",     tr:"Çağrı Kaydı",   en:"Call log",  icon:"phone",  count: callLog.length},
    {id:"settings",  tr:"Ayarlar",       en:"Settings",  icon:"settings"},
  ];

  const updateOrder = (id, patch) =>
    setOrders(arr => arr.map(o=>o.id===id?{...o,...patch}:o));

  const handleCreateOrder = (data) => {
    if (data.customerObj) {
      const exists = customers.find(c=>c.id===data.customerObj.id);
      if (!exists) setCustomers(arr => [data.customerObj, ...arr]);
      else if (data.customerObj.addresses.length !== exists.addresses.length)
        setCustomers(arr => arr.map(c=>c.id===exists.id?data.customerObj:c));
    }
    const id = "D-" + (2053 + orders.length);
    const now = new Date().toISOString();
    const newOrder = {
      id, customerId:data.customerId, addressId:data.addressId,
      items:data.items, subtotal:data.subtotal, deliveryFee:data.deliveryFee,
      total:data.total, paymentMethod:data.paymentMethod, paid:false,
      notes:data.notes, stage:"new", createdAt:now, receivedVia:"phone", courierId:null,
      eta: new Date(Date.now()+config.prepTime*60000).toISOString(),
      prepStartedAt:null, readyAt:null, pickedAt:null, deliveredAt:null,
    };
    setOrders(arr => [newOrder, ...arr]);
    setCallLog(arr => [{id:"c"+Date.now(), phone:data.customerObj?.phone||"",
      customerId:data.customerId, duration:95, result:"order", ts:now, orderId:id}, ...arr]);
    setCustomers(arr => arr.map(c=>c.id===data.customerId
      ? {...c, orders:c.orders+1, spent:c.spent+data.total, lastOrder:now.slice(0,10)} : c));
    setComposerFor(null);
  };

  const stageCounts = React.useMemo(() =>
    ["new","preparing","ready","on_route","delivered"].map(s => ({
      id:s, n: orders.filter(o=>o.stage===s).length
    })), [orders]);

  return (
    <div style={{padding:"28px 36px 40px", maxWidth:1400}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:24, marginBottom:24}}>
        <div>
          <div style={{fontSize:11, color:"var(--accent)", fontWeight:600, letterSpacing:".14em",
            textTransform:"uppercase", fontFamily:"var(--font-mono)", marginBottom:6}}>
            {lang==="tr"?"Paket Servis":"Delivery"}
          </div>
          <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:42,
            fontWeight:500, letterSpacing:"-0.025em", lineHeight:1}}>
            {lang==="tr"?"Telefonla sipariş":"Phone orders"}
          </div>
          <div style={{fontSize:13.5, color:"var(--ink-2)", maxWidth:520, marginTop:8, lineHeight:1.5}}>
            {lang==="tr"?"Gelen aramaları yakala, müşteri geçmişi gör, kurye ata, ETA izle.":"Catch incoming calls, see customer history, assign couriers, track ETA."}
          </div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <div style={{padding:"8px 12px", background:"var(--card)", border:"1px solid var(--line)",
            borderRadius:10, fontSize:11, color:"var(--ink-3)", display:"flex",
            alignItems:"center", gap:6, fontFamily:"var(--font-mono)"}}>
            <span style={{width:7, height:7, borderRadius:"50%", background:"var(--ok)",
              boxShadow:"0 0 0 3px rgba(79,124,76,.2)"}}/>
            {lang==="tr"?"Hat aktif · ":"Line live · "}
            <span style={{color:"var(--ink-2)"}}>{config.lineNumber}</span>
          </div>
          <Button variant="primary" icon="plus" onClick={()=>setComposerFor({phone:""})}>
            {lang==="tr"?"Yeni sipariş":"New order"}
          </Button>
        </div>
      </div>

      <div style={{marginBottom:24, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12}}>
        {stageCounts.map(c => (
          <StatTile key={c.id} count={c.n}
            label={STAGE_META[c.id][lang]||STAGE_META[c.id].en} dotColor={STAGE_META[c.id].dot}/>
        ))}
      </div>

      <div style={{display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid var(--line)"}}>
        {tabs.map(tb => {
          const active = tab===tb.id;
          return (
            <button key={tb.id} onClick={()=>setTab(tb.id)} style={{
              padding:"10px 14px", fontSize:13, fontWeight:active?600:500,
              color: active?"var(--ink)":"var(--ink-3)",
              borderBottom: active?"2px solid var(--accent)":"2px solid transparent",
              marginBottom:-1, display:"inline-flex", alignItems:"center", gap:8}}>
              <Icon name={tb.icon} size={14} stroke={active?"var(--accent)":"var(--ink-3)"}/>
              {tb[lang]||tb.en}
              {tb.count!==undefined && (
                <span style={{fontSize:10, padding:"1px 6px", borderRadius:6,
                  background: active?"var(--accent)":"var(--card-2)",
                  color: active?"#FFF8EC":"var(--ink-3)", fontFamily:"var(--font-mono)", fontWeight:600}}>
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab==="pipeline" && (
        <div style={{display:"grid", gridTemplateColumns: selectedOrder?"1fr 380px":"1fr",
          gap:20, alignItems:"flex-start"}}>
          <Pipeline orders={orders} customers={customers} couriers={couriers}
            onUpdate={updateOrder} selected={selected} setSelected={setSelected} lang={lang}/>
          {selectedOrder && (
            <OrderDetail order={selectedOrder} customer={selectedCustObj}
              address={selectedAddress} couriers={couriers} lang={lang}
              onUpdate={updateOrder} onClose={()=>setSelected(null)}/>
          )}
        </div>
      )}
      {tab==="customers" && (
        <CustomersTab customers={customers} lang={lang} config={config}
          onCompose={s=>setComposerFor(s)} onSelect={setSelectedCust} selected={selectedCust}
          onCreate={(c)=>setCustomers(arr => [c, ...arr])}/>
      )}
      {tab==="couriers" && <CouriersTab couriers={couriers} orders={orders} lang={lang}/>}
      {tab==="calls" && <CallLogTab callLog={callLog} customers={customers} lang={lang}/>}
      {tab==="settings" && <SettingsTab config={config} setConfig={setConfig} ringPhone={ringPhone} lang={lang}/>}

      {composerFor && (
        <Composer seed={composerFor} products={products} config={config} customers={customers}
          onSubmit={handleCreateOrder} onClose={()=>setComposerFor(null)} lang={lang}/>
      )}
    </div>
  );
};

/* ─── Caller-ID popup ─── */
const CallerIdPopup = ({lang, incoming, onAnswer, onDismiss, onNewOrder, onNewCustomer}) => {
  if (!incoming) return null;
  const c = incoming.customer;
  const ringing = incoming.state==="ringing";
  const defaultAddr = c?.addresses?.find(a=>a.default) || c?.addresses?.[0];
  return (
    <div style={{position:"fixed", right:24, top:80, width:360, zIndex:150,
      background:"var(--card)", border:"1px solid var(--line)", borderRadius:16,
      boxShadow:"var(--shadow-lg)", overflow:"hidden",
      animation:"cidSlide .25s cubic-bezier(.4,0,.2,1)"}}>
      <style>{`
        @keyframes cidSlide { from {opacity:0; transform:translateY(-10px);} to {opacity:1; transform:none;} }
        @keyframes cidRing  { 0%,100% {transform:scale(1);} 50% {transform:scale(1.08);} }
      `}</style>
      <div style={{padding:"14px 16px", display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid var(--line)",
        background: ringing?"linear-gradient(135deg,var(--accent),#8A3822)":"var(--card-2)"}}>
        <div style={{width:34, height:34, borderRadius:"50%",
          background: ringing?"rgba(255,248,236,.2)":"var(--paper-2)", display:"grid", placeItems:"center",
          animation: ringing?"cidRing 1s ease-in-out infinite":"none"}}>
          <Icon name="phone-call" size={16} stroke={ringing?"#FFF8EC":"var(--ink-2)"}/>
        </div>
        <div style={{flex:1, minWidth:0, color: ringing?"#FFF8EC":"var(--ink)"}}>
          <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".14em",
            textTransform:"uppercase", opacity:.8, fontWeight:600}}>
            {ringing?(lang==="tr"?"Gelen Arama":"Incoming Call"):(lang==="tr"?"Aktif Arama":"Active Call")}
          </div>
          <div style={{fontSize:14, fontWeight:600, fontFamily:"var(--font-mono)", letterSpacing:".02em"}}>{incoming.phone}</div>
        </div>
        <button onClick={onDismiss} style={{width:26, height:26, borderRadius:"50%",
          background: ringing?"rgba(255,248,236,.15)":"var(--paper-2)", display:"grid", placeItems:"center"}}>
          <Icon name="close" size={12} stroke={ringing?"#FFF8EC":"var(--ink-2)"}/>
        </button>
      </div>
      <div style={{padding:"16px 18px"}}>
        {c ? (
          <>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <Avatar name={c.name} size={42}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:18,
                  fontWeight:500, letterSpacing:"-0.01em", lineHeight:1.1,
                  display:"flex", alignItems:"center", gap:6}}>
                  {c.name}
                  {c.vip && <Pill tone="accent" size="sm">VIP</Pill>}
                </div>
                <div style={{fontSize:11, color:"var(--ink-3)", marginTop:2,
                  fontFamily:"var(--font-mono)", letterSpacing:".04em"}}>
                  {c.orders} {lang==="tr"?"sipariş":"orders"} · {_fmtMoney(c.spent)}
                </div>
              </div>
            </div>
            {defaultAddr && (
              <div style={{background:"var(--paper-2)", border:"1px solid var(--line)",
                borderRadius:10, padding:"10px 12px", marginBottom:12}}>
                <Metalabel style={{marginBottom:3}}>
                  <Icon name="home" size={10} style={{marginRight:4, verticalAlign:"-1px"}}/>
                  {defaultAddr.label}
                </Metalabel>
                <div style={{fontSize:12, lineHeight:1.4}}>{defaultAddr.text}</div>
              </div>
            )}
            {c.fav?.length>0 && (
              <div style={{marginBottom:12}}>
                <Metalabel style={{marginBottom:5}}>{lang==="tr"?"Favoriler":"Usual order"}</Metalabel>
                <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                  {c.fav.map(f => <Pill key={f} tone="muted" size="sm">{f}</Pill>)}
                </div>
              </div>
            )}
            {c.notes && (
              <div style={{fontSize:11.5, color:"var(--ink-2)", padding:"8px 10px",
                background:"var(--paper-2)", borderRadius:8, border:"1px solid var(--line)",
                marginBottom:12, fontStyle:"italic"}}>"{c.notes}"</div>
            )}
            <div style={{display:"flex", gap:6}}>
              <Button variant="primary" icon="plus" onClick={()=>onNewOrder(c)} style={{flex:1}}>
                {lang==="tr"?"Yeni sipariş":"New order"}
              </Button>
              {ringing && <Button variant="secondary" icon="phone" onClick={onAnswer}>{lang==="tr"?"Aç":"Answer"}</Button>}
            </div>
          </>
        ) : (
          <>
            <div style={{textAlign:"center", padding:"12px 0 18px"}}>
              <div style={{width:54, height:54, borderRadius:"50%",
                background:"var(--paper-2)", border:"1px solid var(--line)",
                display:"grid", placeItems:"center", margin:"0 auto 10px"}}>
                <Icon name="users" size={22} stroke="var(--ink-3)"/>
              </div>
              <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:17,
                fontWeight:500, letterSpacing:"-0.01em"}}>
                {lang==="tr"?"Bilinmeyen numara":"Unknown number"}
              </div>
              <div style={{fontSize:11.5, color:"var(--ink-3)", marginTop:4}}>
                {lang==="tr"?"Bu numara müşteri listesinde yok.":"This number isn't in your list yet."}
              </div>
            </div>
            <div style={{display:"flex", gap:6}}>
              <Button variant="primary" icon="plus" onClick={()=>onNewCustomer(incoming.phone)} style={{flex:1}}>
                {lang==="tr"?"Yeni müşteri":"New customer"}
              </Button>
              {ringing && <Button variant="secondary" icon="phone" onClick={onAnswer}>{lang==="tr"?"Aç":"Answer"}</Button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { DeliveryScreen, CallerIdPopup });
