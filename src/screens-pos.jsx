// POS / Cash Register screen — full point-of-sale system.
//
// Layout:
//   Left (flexible):  grid of open checks (tables with live duration/amount)
//                     -or- when a ticket is selected: the active ticket editor
//   Right (fixed):    day-summary strip, cash drawer, Z-report shortcut
//
// Features wired up:
//   - Table grid with status, duration (auto-ticks), guest count, total, age alert >45min
//   - Open a ticket -> itemized editor with qty +/-, add-item catalog, notes, course bump
//   - Discounts: per-item %/₺, whole-ticket %/₺, manager-comp (PIN 1234)
//   - Void item with reason picker (reasons from VOID_REASONS)
//   - Mark item complimentary (100% off, kept on receipt)
//   - Split: by item (assign to guest 1..N) or evenly by N guests
//   - Transfer items between tables · Merge tables into one check
//   - Course firing: hold/fire per course (1 drinks, 2 mains, 3 dessert)
//   - Tip/service % slider on the whole check
//   - Payment: cash, card, split (partial cash + partial card); per-category VAT calc
//   - Loyalty lookup by phone from LOYALTY_SEED
//   - Print receipt (toasts) + email receipt (stub)
//   - Top strip: covers, avg ticket, revenue today (DAILY_SUMMARY_SEED)
//   - Open cash drawer · End-of-day Z-report (summary modal)
//
// After payment: ticket closes, table status flips to 'available'.

const POSScreen = ({t, lang, tables, setTables, tickets, setTickets,
                    zones, products, categories, staff, team,
                    summary, members, setMembers, loyaltyConfig, loyaltyOn, onOpenDrawer}) => {
  // which ticket is "active" (opens the editor)
  const [activeTicketId, setActiveTicketId] = React.useState(null);
  const [filter, setFilter] = React.useState("all");   // zone filter
  const [query,  setQuery]  = React.useState("");
  const [zReportOpen, setZReportOpen] = React.useState(false);
  const [drawerPulse, setDrawerPulse] = React.useState(false);
  const [isFs, setIsFs] = React.useState(() => !!document.fullscreenElement);

  React.useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFs = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(()=>{});
    }
  };

  // clock for live durations
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const it = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(it);
  }, []);

  // derive ticket->table map
  const ticketsByTable = Object.fromEntries(tickets.map(tk => [tk.tableId, tk]));
  const tableById     = Object.fromEntries(tables.map(tb => [tb.id, tb]));
  const zoneById      = Object.fromEntries(zones.map(z=>[z.id, z]));

  // current tickets (open only) + derived info
  const openTickets = tickets.map(tk => {
    const tb = tableById[tk.tableId];
    const minutesOpen = diffMinutes(new Date(tk.openedAt), now);
    const totals = computeTotals(tk, products, categories);
    return { ...tk, table: tb, minutesOpen, totals };
  });

  // filter & sort
  let visible = openTickets;
  if (filter !== "all") visible = visible.filter(tk => tk.table?.zone === filter);
  if (query) visible = visible.filter(tk =>
    (tk.table?.name || "").toLowerCase().includes(query.toLowerCase())
    || tk.items.some(it => (it.name?.[lang]||"").toLowerCase().includes(query.toLowerCase()))
  );
  visible.sort((a,b) => b.minutesOpen - a.minutesOpen);

  const activeTicket = tickets.find(tk => tk.id === activeTicketId);
  const activeTable  = activeTicket ? tableById[activeTicket.tableId] : null;

  // ─────────────── mutations ───────────────
  const updateTicket = (id, patch) => setTickets(prev =>
    prev.map(tk => tk.id === id ? (typeof patch === "function" ? patch(tk) : {...tk, ...patch}) : tk)
  );
  const closeTicket = (id) => {
    const tk = tickets.find(t => t.id === id);
    if (!tk) return;
    setTickets(prev => prev.filter(t => t.id !== id));
    setTables(prev => prev.map(tb => tb.id === tk.tableId ? {...tb, status:"available"} : tb));
    setActiveTicketId(null);
  };
  const newTicketFor = (tableId) => {
    const id = "tk_"+Date.now();
    setTickets(prev => [...prev, {
      id, tableId, openedAt: new Date().toISOString().replace("T"," ").slice(0,16),
      guests:2, waiter:null, items:[], discountPct:0, discountFlat:0, tipPct:0, note:""
    }]);
    setTables(prev => prev.map(tb => tb.id === tableId ? {...tb, status:"occupied"} : tb));
    setActiveTicketId(id);
  };

  // ─────────────── UI ───────────────
  return (
    <div style={{display:"grid", gap:18}}>
      <SectionHead
        eyebrow={lang==="tr"?"Kasa":"POS"}
        title={lang==="tr"?"Kasa":"Cash Register"}
        sub={lang==="tr"
          ? "Açık hesaplar, ödeme, indirimler ve kasa raporu tek ekranda."
          : "Open checks, payments, discounts and end-of-day reports in one place."}
        actions={
          <div style={{display:"flex", gap:8}}>
            <Button variant="ghost" icon={isFs?"minimize":"maximize"} onClick={toggleFs}>
              {isFs
                ? (lang==="tr"?"Tam ekrandan çık":"Exit fullscreen")
                : (lang==="tr"?"Tam ekran":"Fullscreen")}
            </Button>
            <Button variant="soft" icon="cash" onClick={()=>{
              setDrawerPulse(true);
              setTimeout(()=>setDrawerPulse(false), 2200);
              onOpenDrawer?.();
            }}>
              {lang==="tr"?"Çekmeceyi aç":"Open drawer"}
            </Button>
            <Button variant="soft" icon="printer" onClick={()=>setZReportOpen(true)}>
              {lang==="tr"?"Gün sonu Z":"Z-report"}
            </Button>
          </div>
        }
      />

      {/* Daily summary strip */}
      <DailySummary summary={summary} lang={lang}/>

      {!activeTicket ? (
        <>
          {/* Filters */}
          <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
            <div style={{position:"relative", flex:"0 1 280px"}}>
              <Icon name="search" size={14}
                style={{position:"absolute", left:14, top:14, color:"var(--ink-3)"}}/>
              <input value={query} onChange={e=>setQuery(e.target.value)}
                placeholder={lang==="tr"?"Masa veya ürün ara…":"Search table or item…"}
                style={{width:"100%", height:42, padding:"0 14px 0 38px", borderRadius:10, fontSize:13,
                  background:"var(--card-2)", border:"1px solid var(--line)"}}/>
            </div>
            <button onClick={()=>setFilter("all")} style={chipStyle(filter==="all", "var(--ink)", "var(--ink)", true)}>
              {lang==="tr"?"Tüm bölgeler":"All zones"}
              <span style={{opacity:.7, marginLeft:6, fontFamily:"var(--font-mono)", fontSize:11}}>
                {tickets.length}
              </span>
            </button>
            {zones.map(z => {
              const c = tickets.filter(tk => tableById[tk.tableId]?.zone===z.id).length;
              return (
                <button key={z.id} onClick={()=>setFilter(z.id)}
                  style={chipStyle(filter===z.id, z.color, `${z.color}15`)}>
                  <span style={{width:7,height:7,borderRadius:1,background:z.color,display:"inline-block",marginRight:6}}/>
                  {z.name[lang]}
                  <span style={{opacity:.7, marginLeft:6, fontFamily:"var(--font-mono)", fontSize:11}}>
                    {c}
                  </span>
                </button>
              );
            })}
            <div style={{flex:1}}/>
            <Button variant="ghost" icon="refresh" onClick={()=>setNow(new Date())}>
              {lang==="tr"?"Yenile":"Refresh"}
            </Button>
          </div>

          {/* Empty-table grid for quick new-ticket creation */}
          <AvailableTablesStrip tables={tables} zones={zones}
            filter={filter} lang={lang} onNewTicket={newTicketFor}/>

          {/* Ticket grid */}
          <div style={{display:"grid", gap:14}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)",
              letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
              color:"var(--ink-3)"}}>
              {lang==="tr"?"Açık hesaplar":"Open checks"} · {visible.length}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12}}>
              {visible.map(tk => (
                <TicketCard key={tk.id} tk={tk} lang={lang}
                  zone={zoneById[tk.table?.zone]} staff={staff}
                  onClick={()=>setActiveTicketId(tk.id)}/>
              ))}
            </div>
            {visible.length === 0 && (
              <div style={{padding:"40px 20px", textAlign:"center", color:"var(--ink-3)",
                background:"var(--paper-2)", borderRadius:12, border:"1px dashed var(--line-2)"}}>
                {lang==="tr"?"Bu filtreyle açık hesap yok.":"No open checks match."}
              </div>
            )}
          </div>
        </>
      ) : (
        <TicketEditor
          tk={activeTicket} table={activeTable} zone={zoneById[activeTable?.zone]}
          products={products} categories={categories} tickets={tickets} tables={tables}
          lang={lang} staff={staff} team={team}
          members={members} setMembers={setMembers}
          loyaltyConfig={loyaltyConfig} loyaltyOn={loyaltyOn}
          onBack={()=>setActiveTicketId(null)}
          onUpdate={(patch)=>updateTicket(activeTicket.id, patch)}
          onClose={()=>closeTicket(activeTicket.id)}
          onTransfer={(itemId, toTableId)=>{
            setTickets(prev => {
              const fromTk = prev.find(x => x.id === activeTicket.id);
              const item = fromTk.items.find(i => i.id === itemId);
              if (!item) return prev;
              const toTk = prev.find(x => x.tableId === toTableId);
              return prev.map(x => {
                if (x.id === fromTk.id) return {...x, items: x.items.filter(i => i.id !== itemId)};
                if (toTk && x.id === toTk.id) return {...x, items: [...x.items, {...item, id:"i"+Date.now()}]};
                return x;
              }).concat(!toTk ? [{
                id:"tk_"+Date.now(), tableId:toTableId,
                openedAt: new Date().toISOString().replace("T"," ").slice(0,16),
                guests:1, waiter:null, items:[{...item, id:"i"+Date.now()}],
                discountPct:0, discountFlat:0, tipPct:0, note:""
              }] : []);
            });
          }}
          onMerge={(fromTableId)=>{
            // merge items from another table into this one, delete that ticket
            setTickets(prev => {
              const srcTk = prev.find(x => x.tableId === fromTableId);
              if (!srcTk || srcTk.id === activeTicket.id) return prev;
              return prev
                .map(x => x.id === activeTicket.id ? {...x, items:[...x.items, ...srcTk.items], guests:x.guests+srcTk.guests, note:(x.note?x.note+" · ":"")+"Merged "+(tableById[fromTableId]?.name||"")} : x)
                .filter(x => x.id !== srcTk.id);
            });
            setTables(prev => prev.map(tb => tb.id === fromTableId ? {...tb, status:"available"} : tb));
          }}
        />
      )}

      <ZReportModal open={zReportOpen} onClose={()=>setZReportOpen(false)}
        lang={lang} summary={summary} tickets={tickets}
        products={products} categories={categories}/>

      {drawerPulse && (
        <div style={{position:"fixed", bottom:24, right:24, zIndex:200,
          background:"var(--ink)", color:"var(--paper)",
          padding:"12px 16px 12px 14px", borderRadius:12,
          boxShadow:"var(--shadow-lg)",
          display:"flex", alignItems:"center", gap:10,
          animation:"slideUp .22s cubic-bezier(.4,0,.2,1)",
          fontSize:13, fontWeight:500, letterSpacing:"-0.01em"}}>
          <div style={{width:28, height:28, borderRadius:"50%",
            background:"rgba(196,85,58,.25)", display:"grid", placeItems:"center"}}>
            <Icon name="cash" size={14} stroke="#E08060"/>
          </div>
          <div>
            <div style={{fontFamily:"var(--font-display)",
              fontStyle:"var(--font-display-style)", fontSize:15, fontWeight:600}}>
              {lang==="tr"?"Çekmece açıldı":"Drawer opened"}
            </div>
            <div style={{fontSize:11, opacity:.7, fontFamily:"var(--font-mono)",
              letterSpacing:".06em", marginTop:1}}>
              {new Date().toLocaleTimeString(lang==="tr"?"tr-TR":"en-US",
                {hour:"2-digit", minute:"2-digit", second:"2-digit"})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────── helpers ──────── */
function diffMinutes(from, to) {
  return Math.max(0, Math.floor((to - from) / 60000));
}
function formatDuration(mins, lang) {
  if (mins < 60) return mins + (lang==="tr"?" dk":" min");
  const h = Math.floor(mins/60), m = mins%60;
  return h + "s " + m + (lang==="tr"?"dk":"m");
}
function computeTotals(tk, products, categories) {
  let subtotal = 0, vat = 0;
  tk.items.forEach(it => {
    if (it.voided) return;
    const rawLine = it.qty * it.price;
    let lineDisc = 0;
    if (it.compd) lineDisc = rawLine;
    else {
      if (it.discountPct) lineDisc += rawLine * (it.discountPct/100);
      if (it.discountFlat) lineDisc += Math.min(it.discountFlat, rawLine);
    }
    const line = rawLine - lineDisc;
    subtotal += line;
    // VAT per category (from category.vat, default 10%)
    const prod = products?.find?.(p => p.id === it.pid);
    const cat  = prod && categories?.find?.(c => c.id === prod.cat);
    const vatPct = cat?.vat ?? 10;
    vat += line * (vatPct/100) / (1 + vatPct/100); // assume price includes VAT
  });
  const globalDiscPct  = subtotal * ((tk.discountPct||0)/100);
  const globalDiscFlat = Math.min(tk.discountFlat||0, subtotal - globalDiscPct);
  const afterDisc = subtotal - globalDiscPct - globalDiscFlat;
  const tip = afterDisc * ((tk.tipPct||0)/100);
  const total = afterDisc + tip;
  return {
    subtotal: Math.round(subtotal),
    globalDisc: Math.round(globalDiscPct + globalDiscFlat),
    afterDisc: Math.round(afterDisc),
    tip: Math.round(tip),
    vat: Math.round(vat),
    total: Math.round(total),
  };
}
function chipStyle(on, activeColor, activeBg, invertText) {
  return {
    padding:"8px 14px", borderRadius:999, border:`1px solid ${on?activeColor:"var(--line)"}`,
    background: on?activeBg:"var(--card)",
    color: on ? (invertText ? "var(--paper)" : activeColor) : "var(--ink)",
    fontSize:12.5, fontWeight:600, cursor:"pointer",
    display:"inline-flex", alignItems:"center"
  };
}
function fmtMoney(n, lang) {
  return "₺" + Math.round(n).toLocaleString(lang==="tr"?"tr-TR":"en-US");
}

/* ──────── daily summary strip ──────── */
const DailySummary = ({summary, lang}) => {
  const items = [
    {k:"covers",    tr:"Kapak",         en:"Covers",        v: summary.covers},
    {k:"orders",    tr:"Kapanan adisyon",en:"Closed checks", v: summary.orders},
    {k:"avgTicket", tr:"Ortalama adisyon",en:"Avg ticket",   v: fmtMoney(summary.avgTicket, lang)},
    {k:"revenue",   tr:"Ciro",          en:"Revenue",        v: fmtMoney(summary.revenue, lang)},
    {k:"cash",      tr:"Nakit",         en:"Cash",           v: fmtMoney(summary.cash, lang), dim:true},
    {k:"card",      tr:"Kart",          en:"Card",           v: fmtMoney(summary.card, lang), dim:true},
    {k:"tips",      tr:"Bahşiş",        en:"Tips",           v: fmtMoney(summary.tips, lang), dim:true},
    {k:"voids",     tr:"İptal",         en:"Voids",          v: summary.voids, dim:true},
  ];
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:10,
      padding:"14px 16px", background:"var(--ink)", color:"var(--paper)", borderRadius:14,
      boxShadow:"var(--shadow)"}}>
      {items.map(it => (
        <div key={it.k}>
          <div style={{fontSize:10, fontFamily:"var(--font-mono)",
            letterSpacing:".1em", textTransform:"uppercase", fontWeight:500,
            color: it.dim ? "rgba(255,255,255,.5)" : "var(--accent)"}}>
            {lang==="tr"?it.tr:it.en}
          </div>
          <div style={{fontSize: it.dim ? 16 : 22, fontFamily:"var(--font-display)",
            fontStyle:"italic", fontWeight:500, letterSpacing:"-0.01em",
            marginTop:2, color: it.dim ? "rgba(255,255,255,.85)" : "var(--paper)"}}>
            {it.v}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ──────── available tables horizontal strip ──────── */
const AvailableTablesStrip = ({tables, zones, filter, lang, onNewTicket}) => {
  const avail = tables.filter(tb =>
    tb.status === "available" && (filter === "all" || tb.zone === filter)
  );
  if (!avail.length) return null;
  return (
    <div>
      <div style={{fontSize:11, fontFamily:"var(--font-mono)",
        letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
        color:"var(--ink-3)", marginBottom:8}}>
        {lang==="tr"?"Boş masalar — açmak için tıkla":"Available tables — tap to open a check"}
      </div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
        {avail.map(tb => {
          const z = zones.find(z=>z.id===tb.zone);
          return (
            <button key={tb.id} onClick={()=>onNewTicket(tb.id)} style={{
              padding:"8px 14px", borderRadius:10,
              background:"var(--card)", border:`1.5px dashed ${z?.color||"var(--line-2)"}`,
              cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8,
              fontSize:13, fontWeight:600, color:"var(--ink-2)"}}>
              <Icon name="plus" size={12}/>
              <span style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:16}}>{tb.name}</span>
              <span style={{fontSize:10, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
                {z?.name[lang]} · {tb.seats}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ──────── ticket card (open check preview) ──────── */
const TicketCard = ({tk, lang, zone, staff, onClick}) => {
  const alert = tk.minutesOpen >= 45;
  const hasUnfired = tk.items.some(it => !it.fired && !it.voided);
  return (
    <button onClick={onClick} style={{
      textAlign:"left", background:"var(--card)",
      border:`1.5px solid ${alert ? "#C4553A55" : "var(--line)"}`,
      borderTop:`3px solid ${zone?.color || "var(--accent)"}`,
      borderRadius:14, padding:14, cursor:"pointer",
      display:"flex", flexDirection:"column", gap:10,
      boxShadow: alert ? "0 0 0 3px #C4553A15" : "var(--shadow)",
      transition:"transform .15s, box-shadow .15s"
    }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
       onMouseLeave={e=>e.currentTarget.style.transform="none"}>
      {/* header */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
            letterSpacing:".1em", textTransform:"uppercase"}}>
            {zone?.name[lang] || ""} · {lang==="tr"?"Masa":"Table"}
          </div>
          <div style={{fontSize:32, fontFamily:"var(--font-display)", fontStyle:"italic",
            fontWeight:500, letterSpacing:"-0.02em", lineHeight:1}}>
            {tk.table?.name}
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
          <span style={{padding:"3px 9px", borderRadius:999, fontSize:10.5, fontWeight:600,
            background: alert ? "#F7E2D8" : "var(--paper-2)",
            color: alert ? "#8B3B24" : "var(--ink-2)",
            fontFamily:"var(--font-mono)", letterSpacing:".04em"}}>
            {formatDuration(tk.minutesOpen, lang)}
          </span>
          {hasUnfired && (
            <span style={{padding:"2px 7px", borderRadius:999, fontSize:9.5, fontWeight:600,
              background:"#F4E7C4", color:"#6B4C0A", fontFamily:"var(--font-mono)",
              letterSpacing:".04em"}}>
              {lang==="tr"?"ATEŞLE":"FIRE"}
            </span>
          )}
        </div>
      </div>
      {/* items summary */}
      <div style={{fontSize:12, color:"var(--ink-2)", display:"grid", gap:3}}>
        {tk.items.slice(0,3).map(it => (
          <div key={it.id} style={{display:"flex", justifyContent:"space-between",
            opacity: it.voided ? .4 : 1,
            textDecoration: it.voided ? "line-through" : "none"}}>
            <span>{it.qty}× {it.name[lang]}{it.compd && <span style={{color:"var(--accent)",marginLeft:6,fontSize:10,fontWeight:600}}>İKRAM</span>}</span>
          </div>
        ))}
        {tk.items.length > 3 && (
          <div style={{fontSize:11, color:"var(--ink-3)"}}>
            +{tk.items.length - 3} {lang==="tr"?"ürün daha":"more"}
          </div>
        )}
      </div>
      {/* footer */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline",
        borderTop:"1px solid var(--line)", paddingTop:10, marginTop:"auto"}}>
        <span style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
          letterSpacing:".06em"}}>
          <Icon name="users" size={11}/> {tk.guests} {lang==="tr"?"kişi":"guests"}
        </span>
        <span style={{fontSize:20, fontFamily:"var(--font-display)", fontStyle:"italic",
          fontWeight:600, color:"var(--ink)"}}>
          {fmtMoney(tk.totals.total, lang)}
        </span>
      </div>
    </button>
  );
};

Object.assign(window, { POSScreen, computeTotals, fmtMoney, diffMinutes, formatDuration });
