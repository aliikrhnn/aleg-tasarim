// POS modals — add item, discount, void, comp, split, transfer, merge, payment, note.

/* ─── Add item (catalog picker) ─── */
const AddItemModal = ({open, onClose, products, categories, lang, onAdd}) => {
  const [q, setQ] = React.useState("");
  const [catF, setCatF] = React.useState("all");
  if (!open) return null;
  const filtered = products.filter(p => {
    if (catF !== "all" && p.cat !== catF) return false;
    if (q && !(p.name[lang]||"").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <Modal open={open} onClose={onClose} width={720}
      title={lang==="tr"?"Ürün ekle":"Add item"}>
      <div style={{display:"grid", gap:14}}>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
          placeholder={lang==="tr"?"Ürün ara…":"Search item…"}
          style={{height:42, padding:"0 14px", borderRadius:10, fontSize:14,
            background:"var(--card-2)", border:"1px solid var(--line)", width:"100%"}}/>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          <button onClick={()=>setCatF("all")} style={{
            padding:"6px 12px", borderRadius:999, cursor:"pointer",
            border:"1px solid var(--line)",
            background: catF==="all"?"var(--ink)":"var(--card)",
            color: catF==="all"?"var(--paper)":"var(--ink)",
            fontSize:12, fontWeight:600}}>{lang==="tr"?"Tümü":"All"}</button>
          {categories.map(c => (
            <button key={c.id} onClick={()=>setCatF(c.id)} style={{
              padding:"6px 12px", borderRadius:999, cursor:"pointer",
              border:"1px solid var(--line)",
              background: catF===c.id?"var(--ink)":"var(--card)",
              color: catF===c.id?"var(--paper)":"var(--ink)",
              fontSize:12, fontWeight:600}}>{c.name[lang]}</button>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8,
          maxHeight:400, overflow:"auto"}}>
          {filtered.map(p => (
            <button key={p.id} onClick={()=>{onAdd(p); onClose();}} style={{
              padding:"12px", textAlign:"left", borderRadius:10, cursor:"pointer",
              background:"var(--card)", border:"1px solid var(--line)",
              display:"grid", gap:4}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.background="var(--paper-2)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--line)";e.currentTarget.style.background="var(--card)";}}>
              <div style={{fontSize:13, fontWeight:500}}>{p.name[lang]}</div>
              <div style={{fontSize:12, color:"var(--accent)", fontWeight:600,
                fontFamily:"var(--font-mono)"}}>₺{p.price}</div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

/* ─── Discount ─── */
const DiscountModal = ({modal, setModal, lang, items, onApplyItem, onApplyTicket}) => {
  const [type, setType] = React.useState("pct");
  const [value, setValue] = React.useState(10);
  if (!modal) return null;
  const apply = () => {
    const patch = type === "pct" ? {discountPct: value, discountFlat:0} : {discountFlat: value, discountPct:0};
    if (modal.scope === "ticket") onApplyTicket(patch);
    else onApplyItem(modal.itemId, patch);
    setModal(null);
  };
  const clear = () => {
    const patch = {discountPct:0, discountFlat:0};
    if (modal.scope === "ticket") onApplyTicket(patch);
    else onApplyItem(modal.itemId, patch);
    setModal(null);
  };
  const target = modal.scope === "item" ? items.find(i=>i.id===modal.itemId) : null;
  return (
    <Modal open={true} onClose={()=>setModal(null)} width={420}
      title={lang==="tr"?"İndirim uygula":"Apply discount"}
      subtitle={target ? target.name[lang] : (lang==="tr"?"Tüm adisyon":"Whole check")}>
      <div style={{display:"grid", gap:14}}>
        <div style={{display:"flex", gap:6}}>
          <button onClick={()=>setType("pct")} style={typeBtn(type==="pct")}>%</button>
          <button onClick={()=>setType("flat")} style={typeBtn(type==="flat")}>₺</button>
        </div>
        <Field label={type==="pct"?(lang==="tr"?"Yüzde":"Percent"):(lang==="tr"?"Tutar":"Amount")}>
          <Input type="number" min="0" value={value} onChange={e=>setValue(parseFloat(e.target.value)||0)}/>
        </Field>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {(type==="pct"?[5,10,15,20,25,50]:[10,25,50,100]).map(v => (
            <button key={v} onClick={()=>setValue(v)} style={{
              padding:"6px 12px", borderRadius:8, cursor:"pointer",
              border:"1px solid var(--line)",
              background: value===v?"var(--accent)":"var(--card)",
              color: value===v?"var(--paper)":"var(--ink)",
              fontSize:12, fontWeight:600, fontFamily:"var(--font-mono)"}}>
              {type==="pct"?v+"%":"₺"+v}
            </button>
          ))}
        </div>
        <div style={{display:"flex", gap:8, paddingTop:8, borderTop:"1px solid var(--line)"}}>
          <Button variant="danger" onClick={clear}>{lang==="tr"?"Sıfırla":"Clear"}</Button>
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={()=>setModal(null)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="primary" onClick={apply}>{lang==="tr"?"Uygula":"Apply"}</Button>
        </div>
      </div>
    </Modal>
  );
};
const typeBtn = (on) => ({
  flex:1, padding:"12px", borderRadius:10, cursor:"pointer",
  border:`1.5px solid ${on?"var(--accent)":"var(--line)"}`,
  background: on?"var(--paper-2)":"var(--card)",
  color: on?"var(--accent)":"var(--ink-2)",
  fontSize:18, fontWeight:700, fontFamily:"var(--font-mono)"
});

/* ─── Void ─── */
const VoidModal = ({modal, setModal, lang, items, onApply}) => {
  const [reason, setReason] = React.useState("");
  if (!modal) return null;
  const it = items.find(i=>i.id===modal.itemId);
  const reasons = [
    {tr:"Yanlış sipariş",     en:"Wrong order"},
    {tr:"Müşteri vazgeçti",   en:"Customer changed mind"},
    {tr:"Mutfak gecikti",     en:"Kitchen delay"},
    {tr:"Ürün tükendi",       en:"Out of stock"},
    {tr:"Kalite sorunu",      en:"Quality issue"},
    {tr:"Diğer",              en:"Other"},
  ];
  return (
    <Modal open={true} onClose={()=>setModal(null)} width={420}
      title={lang==="tr"?"Ürünü iptal et":"Void item"}
      subtitle={it?.name[lang]}>
      <div style={{display:"grid", gap:8}}>
        <div style={{fontSize:12, color:"var(--ink-3)", marginBottom:4}}>
          {lang==="tr"?"Sebep seçin:":"Select reason:"}
        </div>
        {reasons.map(r => (
          <button key={r.en} onClick={()=>setReason(r[lang])} style={{
            padding:"12px 14px", borderRadius:10, textAlign:"left", cursor:"pointer",
            border:`1.5px solid ${reason===r[lang]?"#C4553A":"var(--line)"}`,
            background: reason===r[lang]?"#F7E2D855":"var(--card)",
            color: reason===r[lang]?"#8B3B24":"var(--ink)",
            fontSize:13, fontWeight:500}}>{r[lang]}</button>
        ))}
        <div style={{display:"flex", gap:8, paddingTop:8, borderTop:"1px solid var(--line)", marginTop:8}}>
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={()=>setModal(null)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="danger" onClick={()=>onApply(modal.itemId, reason || "—")}
            disabled={!reason}>{lang==="tr"?"İptal et":"Void"}</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Comp (PIN gate) ─── */
const CompModal = ({modal, setModal, lang, items, totals, onApplyItem, onApplyTicket}) => {
  const [pin, setPin] = React.useState("");
  const [err, setErr] = React.useState("");
  if (!modal) return null;
  const isTicket = modal === "ticket";
  const it = !isTicket ? items.find(i=>i.id===modal.itemId) : null;
  const amount = isTicket ? totals.subtotal : (it ? it.qty * it.price : 0);
  const submit = () => {
    if (pin !== "1234") { setErr(lang==="tr"?"Yanlış PIN":"Wrong PIN"); return; }
    if (isTicket) onApplyTicket();
    else onApplyItem(modal.itemId);
    setPin(""); setErr("");
  };
  return (
    <Modal open={true} onClose={()=>{setModal(null);setPin("");setErr("");}} width={380}
      title={lang==="tr"?"Müdür onayı — ikram":"Manager comp"}
      subtitle={isTicket ? (lang==="tr"?"Tüm adisyon":"Whole check") : it?.name[lang]}>
      <div style={{display:"grid", gap:14, textAlign:"center"}}>
        <div style={{padding:"14px", background:"var(--paper-2)", borderRadius:10}}>
          <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
            letterSpacing:".1em", textTransform:"uppercase"}}>
            {lang==="tr"?"İkram tutarı":"Comp amount"}
          </div>
          <div style={{fontSize:28, fontFamily:"var(--font-display)", fontStyle:"italic",
            fontWeight:600, color:"var(--accent)"}}>
            {fmtMoney(amount, lang)}
          </div>
        </div>
        <Field label={lang==="tr"?"Müdür PIN (demo: 1234)":"Manager PIN (demo: 1234)"}>
          <Input autoFocus type="password" inputMode="numeric" maxLength="4"
            value={pin} onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setErr("");}}
            onKeyDown={e=>{if(e.key==="Enter")submit();}}
            placeholder="••••"
            style={{height:50, fontSize:22, textAlign:"center", letterSpacing:"0.4em",
              fontFamily:"var(--font-mono)"}}/>
        </Field>
        {err && <div style={{color:"#C4553A", fontSize:12, fontWeight:600}}>{err}</div>}
        <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <Button variant="ghost" onClick={()=>{setModal(null);setPin("");setErr("");}}>
            {lang==="tr"?"Vazgeç":"Cancel"}
          </Button>
          <Button variant="primary" icon="gift" onClick={submit} disabled={pin.length<4}>
            {lang==="tr"?"İkram et":"Comp"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Split ─── */
const SplitModal = ({open, setOpen, lang, tk, totals, products}) => {
  const [mode, setMode] = React.useState("even");      // "even" | "by-item"
  const [parts, setParts] = React.useState(tk.guests || 2);
  const [assign, setAssign] = React.useState({});       // itemId -> guestIdx
  if (!open) return null;
  const perHead = Math.round(totals.total / parts);

  // compute per-guest totals when by-item
  const guestTotals = Array(parts).fill(0);
  tk.items.forEach(it => {
    if (it.voided || it.compd) return;
    const g = assign[it.id];
    if (g != null) {
      const line = it.qty * it.price * (1 - (it.discountPct||0)/100) - (it.discountFlat||0);
      guestTotals[g] = (guestTotals[g] || 0) + line;
    }
  });
  const unassignedCount = tk.items.filter(it=>!it.voided && !it.compd && assign[it.id]==null).length;

  return (
    <Modal open={open} onClose={()=>setOpen(false)} width={640}
      title={lang==="tr"?"Hesabı böl":"Split check"}>
      <div style={{display:"grid", gap:16}}>
        <div style={{display:"flex", gap:6}}>
          <button onClick={()=>setMode("even")} style={typeBtn(mode==="even")}>
            {lang==="tr"?"Eşit":"Even"}
          </button>
          <button onClick={()=>setMode("by-item")} style={typeBtn(mode==="by-item")}>
            {lang==="tr"?"Ürüne göre":"By item"}
          </button>
        </div>
        <Field label={lang==="tr"?"Bölme adedi":"Number of splits"}>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {[2,3,4,5,6,8].map(n => (
              <button key={n} onClick={()=>setParts(n)} style={{
                width:44, height:44, borderRadius:10, cursor:"pointer",
                border:`1.5px solid ${parts===n?"var(--accent)":"var(--line)"}`,
                background: parts===n?"var(--paper-2)":"var(--card)",
                color: parts===n?"var(--accent)":"var(--ink)",
                fontSize:16, fontWeight:700, fontFamily:"var(--font-display)", fontStyle:"italic"}}>
                {n}
              </button>
            ))}
          </div>
        </Field>

        {mode === "even" ? (
          <div style={{padding:"22px 20px", background:"var(--paper-2)", borderRadius:12,
            textAlign:"center"}}>
            <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
              letterSpacing:".1em", textTransform:"uppercase"}}>
              {lang==="tr"?"Kişi başı":"Per person"}
            </div>
            <div style={{fontSize:44, fontFamily:"var(--font-display)", fontStyle:"italic",
              fontWeight:600, color:"var(--accent)", marginTop:4}}>
              {fmtMoney(perHead, lang)}
            </div>
            <div style={{fontSize:12, color:"var(--ink-3)", marginTop:4}}>
              {lang==="tr"?`${fmtMoney(totals.total, lang)} ÷ ${parts}`:`${fmtMoney(totals.total, lang)} ÷ ${parts}`}
            </div>
          </div>
        ) : (
          <>
            <div style={{maxHeight:280, overflow:"auto", display:"grid", gap:6}}>
              {tk.items.filter(it=>!it.voided).map(it => (
                <div key={it.id} style={{
                  padding:"10px 12px", borderRadius:10, background:"var(--card)",
                  border:"1px solid var(--line)",
                  display:"grid", gridTemplateColumns:"1fr auto", gap:8, alignItems:"center"
                }}>
                  <div>
                    <div style={{fontSize:13, fontWeight:500}}>{it.qty}× {it.name[lang]}</div>
                    <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
                      ₺{it.qty * it.price}
                    </div>
                  </div>
                  <div style={{display:"flex", gap:3}}>
                    {Array.from({length:parts}).map((_,i) => (
                      <button key={i} onClick={()=>setAssign(a => ({...a, [it.id]: a[it.id]===i?undefined:i}))}
                        style={{
                          width:32, height:32, borderRadius:6, cursor:"pointer",
                          border:`1.5px solid ${assign[it.id]===i?"var(--accent)":"var(--line)"}`,
                          background: assign[it.id]===i?"var(--accent)":"var(--card)",
                          color: assign[it.id]===i?"var(--paper)":"var(--ink-2)",
                          fontSize:12, fontWeight:700, fontFamily:"var(--font-mono)"
                        }}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"grid", gridTemplateColumns:`repeat(${parts},1fr)`, gap:6}}>
              {guestTotals.map((gt, i) => (
                <div key={i} style={{padding:"12px", background:"var(--paper-2)",
                  borderRadius:10, textAlign:"center"}}>
                  <div style={{fontSize:10.5, color:"var(--ink-3)",
                    fontFamily:"var(--font-mono)", letterSpacing:".1em",
                    textTransform:"uppercase"}}>G{i+1}</div>
                  <div style={{fontSize:18, fontFamily:"var(--font-display)",
                    fontStyle:"italic", fontWeight:600, marginTop:2}}>
                    {fmtMoney(gt, lang)}
                  </div>
                </div>
              ))}
            </div>
            {unassignedCount > 0 && (
              <div style={{fontSize:11.5, color:"#C4553A"}}>
                {unassignedCount} {lang==="tr"?"ürün henüz atanmadı":"items not yet assigned"}
              </div>
            )}
          </>
        )}

        <div style={{display:"flex", gap:8, paddingTop:8, borderTop:"1px solid var(--line)"}}>
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={()=>setOpen(false)}>{lang==="tr"?"Kapat":"Close"}</Button>
          <Button variant="primary" icon="printer"
            onClick={()=>{alert(lang==="tr"?"Her kişi için ayrı fiş yazdırıldı.":"Separate slips printed."); setOpen(false);}}>
            {lang==="tr"?"Fişleri yazdır":"Print slips"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Transfer (item -> another table) ─── */
const TransferModal = ({modal, setModal, lang, tables, tickets, currentTicketId, onPick}) => {
  if (!modal) return null;
  const others = tables.filter(tb => !tickets.find(tk => tk.tableId === tb.id && tk.id === currentTicketId));
  return (
    <Modal open={true} onClose={()=>setModal(null)} width={560}
      title={lang==="tr"?"Ürünü başka masaya aktar":"Transfer item to another table"}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))", gap:8}}>
        {others.map(tb => {
          const tk = tickets.find(tk => tk.tableId === tb.id);
          return (
            <button key={tb.id} onClick={()=>onPick(tb.id)} style={{
              padding:"14px 10px", borderRadius:10, cursor:"pointer",
              background:"var(--card)", border:"1.5px solid var(--line)",
              textAlign:"center"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}>
              <div style={{fontSize:28, fontFamily:"var(--font-display)", fontStyle:"italic",
                fontWeight:500, lineHeight:1}}>{tb.name}</div>
              <div style={{fontSize:10, color:"var(--ink-3)", marginTop:4,
                fontFamily:"var(--font-mono)", letterSpacing:".08em"}}>
                {tk ? (lang==="tr"?"DOLU":"OPEN") : (lang==="tr"?"BOŞ":"FREE")}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

/* ─── Merge (combine two checks) ─── */
const MergeModal = ({open, setOpen, lang, tables, tickets, currentTicketId, onPick}) => {
  if (!open) return null;
  const other = tickets.filter(tk => tk.id !== currentTicketId);
  const tableById = Object.fromEntries(tables.map(tb => [tb.id, tb]));
  return (
    <Modal open={open} onClose={()=>setOpen(false)} width={520}
      title={lang==="tr"?"Başka bir hesabı buna birleştir":"Merge another check into this one"}>
      <div style={{display:"grid", gap:6}}>
        {other.length === 0 && (
          <div style={{color:"var(--ink-3)", padding:16, textAlign:"center"}}>
            {lang==="tr"?"Birleştirilecek başka hesap yok.":"No other open checks."}
          </div>
        )}
        {other.map(tk => {
          const tb = tableById[tk.tableId];
          return (
            <button key={tk.id} onClick={()=>onPick(tk.tableId)} style={{
              padding:"12px 14px", borderRadius:10, cursor:"pointer",
              background:"var(--card)", border:"1px solid var(--line)",
              display:"flex", justifyContent:"space-between", alignItems:"center"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:20, fontFamily:"var(--font-display)", fontStyle:"italic",
                  fontWeight:600}}>{tb?.name}</div>
                <div style={{fontSize:11, color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>
                  {tk.items.length} items · {tk.guests} guests
                </div>
              </div>
              <Icon name="arrow-right" size={14}/>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

/* ─── Payment ─── */
const PaymentModal = ({open, setOpen, tk, totals, lang, member, members, setMembers, config, onClose, onUpdate}) => {
  const [method, setMethod] = React.useState("cash");     // cash | card | split
  const [cashAmt, setCashAmt] = React.useState(totals.total);
  const [cardAmt, setCardAmt] = React.useState(0);
  const [redeem, setRedeem] = React.useState(false);
  const [stage, setStage] = React.useState("entry");      // entry | success

  const cfg = config || {};
  const redeemValue = cfg.redeemValue || 1;          // 1 point = 1₺
  const maxRedeemable = member
    ? Math.min(Math.floor(totals.total / redeemValue), member.points || 0)
    : 0;
  const redeemAmt = redeem ? maxRedeemable * redeemValue : 0;
  const payable = Math.max(0, totals.total - redeemAmt);

  const earned = member && !redeem
    ? (cfg.mode==="currency"
        ? Math.floor(payable / (cfg.currencyPerPoint||10))
        : cfg.mode==="percent"
          ? Math.floor(payable * (cfg.percentBack||5)/100)
          : 1)
    : 0;

  React.useEffect(() => {
    if (method === "cash") { setCashAmt(payable); setCardAmt(0); }
    else if (method === "card") { setCashAmt(0); setCardAmt(payable); }
    else { setCashAmt(Math.round(payable/2)); setCardAmt(payable - Math.round(payable/2)); }
  }, [method, payable]);

  if (!open) return null;
  const paid = (cashAmt || 0) + (cardAmt || 0);
  const change = Math.max(0, (cashAmt || 0) - Math.max(0, payable - (cardAmt || 0)));
  const shortfall = Math.max(0, payable - paid);

  const complete = () => {
    // update member points + visits
    if (member && setMembers) {
      setMembers(list => list.map(m => m.id === member.id
        ? {...m,
           points: Math.max(0, (m.points||0) - (redeem ? maxRedeemable : 0) + earned),
           visits: (m.visits||0) + 1,
           lifetimeSpent: (m.lifetimeSpent||0) + totals.total,
           lastVisit: new Date().toISOString().slice(0,10)}
        : m));
    }
    setStage("success");
    setTimeout(() => { onClose(); setOpen(false); setStage("entry"); setRedeem(false); }, 1800);
  };

  if (stage === "success") {
    return (
      <Modal open={true} onClose={()=>{}} width={440} title={lang==="tr"?"Ödeme alındı":"Payment received"}>
        <div style={{textAlign:"center", padding:"20px 10px"}}>
          <div style={{width:72, height:72, borderRadius:"50%", margin:"0 auto",
            background:"#E9EFE0", display:"grid", placeItems:"center", color:"#3F5B36"}}>
            <Icon name="check" size={32}/>
          </div>
          <div style={{fontSize:28, fontFamily:"var(--font-display)", fontStyle:"italic",
            fontWeight:600, marginTop:16}}>
            {fmtMoney(totals.total, lang)}
          </div>
          <div style={{fontSize:13, color:"var(--ink-3)", marginTop:6}}>
            {lang==="tr"?"Fiş yazdırıldı · Masa boşaltılıyor":"Receipt printed · Clearing table"}
          </div>
          {member && (earned > 0 || redeem) && (
            <div style={{marginTop:14, padding:"12px 16px", background:"#E9EFE0",
              borderRadius:10, fontSize:13, color:"#3F5B36", fontWeight:500,
              display:"inline-flex", alignItems:"center", gap:8}}>
              <Icon name="gift" size={14}/>
              {redeem
                ? (lang==="tr" ? `${maxRedeemable} puan kullanıldı · ${fmtMoney(redeemAmt,lang)} indirim`
                               : `${maxRedeemable} points redeemed · ${fmtMoney(redeemAmt,lang)} off`)
                : (lang==="tr" ? `${member.name.split(" ")[0]} için +${earned} puan`
                               : `+${earned} points for ${member.name.split(" ")[0]}`)}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={()=>setOpen(false)} width={520}
      title={lang==="tr"?"Ödeme":"Payment"}
      subtitle={fmtMoney(payable, lang) + (redeem ? " · " + (lang==="tr"?"puan ile":"with points") : "")}>
      <div style={{display:"grid", gap:14}}>
        {/* Loyalty redeem (only when member attached) */}
        {member && maxRedeemable > 0 && (
          <div style={{padding:"12px 14px", background:"var(--card-2)", borderRadius:10,
            border:"1px solid var(--line)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{width:32, height:32, borderRadius:"50%",
                background:"var(--accent)", color:"var(--paper)",
                display:"grid", placeItems:"center"}}>
                <Icon name="gift" size={14}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600}}>{member.name}</div>
                <div style={{fontSize:11, color:"var(--ink-3)",
                  fontFamily:"var(--font-mono)"}}>
                  {member.points} {lang==="tr"?"puan mevcut":"points available"}
                </div>
              </div>
              <label style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
                <input type="checkbox" checked={redeem}
                  onChange={e=>setRedeem(e.target.checked)}
                  style={{width:16, height:16, accentColor:"var(--accent)"}}/>
                <span style={{fontSize:12, fontWeight:600}}>
                  {lang==="tr"
                    ? `${maxRedeemable} puan kullan (−${fmtMoney(maxRedeemable*redeemValue,lang)})`
                    : `Use ${maxRedeemable} pts (−${fmtMoney(maxRedeemable*redeemValue,lang)})`}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Method */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
          {[
            {id:"cash", tr:"Nakit", en:"Cash",  icon:"cash"},
            {id:"card", tr:"Kart",  en:"Card",  icon:"credit-card"},
            {id:"split",tr:"Karma", en:"Split", icon:"percent"},
          ].map(m => (
            <button key={m.id} onClick={()=>setMethod(m.id)} style={{
              padding:"14px", borderRadius:10, cursor:"pointer",
              border:`1.5px solid ${method===m.id?"var(--accent)":"var(--line)"}`,
              background: method===m.id?"var(--paper-2)":"var(--card)",
              color: method===m.id?"var(--accent)":"var(--ink)",
              fontSize:13, fontWeight:600,
              display:"grid", placeItems:"center", gap:6}}>
              <Icon name={m.icon} size={20}/>
              {m[lang]}
            </button>
          ))}
        </div>

        {/* Split amounts */}
        {method === "split" && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <Field label={lang==="tr"?"Nakit":"Cash"}>
              <Input type="number" value={cashAmt}
                onChange={e=>setCashAmt(parseFloat(e.target.value)||0)}/>
            </Field>
            <Field label={lang==="tr"?"Kart":"Card"}>
              <Input type="number" value={cardAmt}
                onChange={e=>setCardAmt(parseFloat(e.target.value)||0)}/>
            </Field>
          </div>
        )}

        {method === "cash" && (
          <div>
            <Field label={lang==="tr"?"Alınan":"Received"}>
              <Input type="number" value={cashAmt}
                onChange={e=>setCashAmt(parseFloat(e.target.value)||0)}/>
            </Field>
            <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>
              {[50, 100, 200, 500, 1000].map(n => (
                <button key={n} onClick={()=>setCashAmt(n)} style={{
                  padding:"6px 12px", borderRadius:8, cursor:"pointer",
                  border:"1px solid var(--line)",
                  background: cashAmt===n?"var(--accent)":"var(--card)",
                  color: cashAmt===n?"var(--paper)":"var(--ink)",
                  fontSize:12, fontWeight:600, fontFamily:"var(--font-mono)"}}>
                  ₺{n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Change / shortfall */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10,
          padding:"14px", background:"var(--paper-2)", borderRadius:10}}>
          <div>
            <div style={{fontSize:10, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
              letterSpacing:".1em", textTransform:"uppercase"}}>{lang==="tr"?"Alınan":"Paid"}</div>
            <div style={{fontSize:20, fontFamily:"var(--font-display)", fontStyle:"italic",
              fontWeight:600, marginTop:2}}>{fmtMoney(paid, lang)}</div>
          </div>
          <div>
            <div style={{fontSize:10, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
              letterSpacing:".1em", textTransform:"uppercase"}}>
              {shortfall > 0 ? (lang==="tr"?"Kalan":"Shortfall") : (lang==="tr"?"Para üstü":"Change")}
            </div>
            <div style={{fontSize:20, fontFamily:"var(--font-display)", fontStyle:"italic",
              fontWeight:600, marginTop:2, color: shortfall>0?"#C4553A":"var(--accent)"}}>
              {shortfall > 0 ? fmtMoney(shortfall, lang) : fmtMoney(change, lang)}
            </div>
          </div>
        </div>

        {/* Earn preview */}
        {member && earned > 0 && (
          <div style={{padding:"10px 14px", background:"#E9EFE0", borderRadius:8,
            fontSize:12, color:"#3F5B36", fontWeight:500,
            display:"flex", alignItems:"center", gap:8}}>
            <Icon name="gift" size={13}/>
            {lang==="tr"
              ? `${member.name.split(" ")[0]} +${earned} puan kazanacak`
              : `${member.name.split(" ")[0]} earns +${earned} points`}
          </div>
        )}

        <div style={{display:"flex", gap:8, paddingTop:8, borderTop:"1px solid var(--line)"}}>
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={()=>setOpen(false)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="primary" icon="check" onClick={complete} disabled={paid < payable}>
            {lang==="tr"?"Ödemeyi tamamla":"Complete payment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Note ─── */
const NoteModal = ({open, setOpen, lang, value, onSave}) => {
  const [v, setV] = React.useState(value);
  React.useEffect(()=>setV(value), [value, open]);
  if (!open) return null;
  return (
    <Modal open={open} onClose={()=>setOpen(false)} width={440}
      title={lang==="tr"?"Adisyon notu":"Check note"}>
      <div style={{display:"grid", gap:14}}>
        <textarea value={v} onChange={e=>setV(e.target.value)} rows={4}
          placeholder={lang==="tr"?"Örn. doğum günü, alerji…":"e.g. birthday, allergy…"}
          style={{padding:"12px 14px", borderRadius:10, fontSize:14, resize:"vertical",
            background:"var(--card-2)", border:"1px solid var(--line)", width:"100%",
            fontFamily:"inherit"}}/>
        <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <Button variant="ghost" onClick={()=>setOpen(false)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="primary" onClick={()=>onSave(v)}>{lang==="tr"?"Kaydet":"Save"}</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ─── Member lookup: search or create ─── */
const MemberLookupModal = ({open, onClose, members, setMembers, lang, config, onAttach}) => {
  const [q, setQ] = React.useState("");
  const [stage, setStage] = React.useState("search"); // search | create
  const [newMember, setNewMember] = React.useState({name:"", phone:"", email:"", birthday:""});

  React.useEffect(()=>{
    if (open) { setQ(""); setStage("search"); setNewMember({name:"", phone:"", email:"", birthday:""}); }
  }, [open]);

  if (!open) return null;

  const digits = q.replace(/\D/g,"");
  const matches = q.trim() === "" ? members.slice(0,6) : members.filter(m => {
    if (digits.length >= 3) return m.phone.replace(/\D/g,"").includes(digits);
    return m.name.toLowerCase().includes(q.toLowerCase());
  }).slice(0,8);

  const create = () => {
    if (!newMember.name.trim() || !newMember.phone.trim()) return;
    const m = {
      id: "l"+Date.now(),
      name: newMember.name.trim(),
      phone: newMember.phone.trim(),
      email: newMember.email.trim() || null,
      birthday: newMember.birthday || null,
      points: (config?.welcomeBonus || 50),
      since: new Date().toISOString().slice(0,10),
      visits: 0, lifetimeSpent: 0,
      lastVisit: new Date().toISOString().slice(0,10),
      channels: {push:true, email:!!newMember.email},
    };
    setMembers && setMembers(p => [m, ...p]);
    onAttach(m);
  };

  return (
    <Modal open={open} onClose={onClose} width={460}
      title={stage==="search" ? (lang==="tr"?"Müşteri bul":"Find member") : (lang==="tr"?"Yeni üye":"New member")}
      subtitle={stage==="search" ? (lang==="tr"?"Telefon veya isim ile":"Phone or name") : null}>
      {stage === "search" && (
        <div style={{display:"grid", gap:12}}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            placeholder={lang==="tr"?"0532... veya isim":"0532... or name"}
            style={{height:44, padding:"0 14px", borderRadius:10, fontSize:15,
              background:"var(--card-2)", border:"1px solid var(--line)",
              fontFamily:"var(--font-mono)"}}/>
          <div style={{display:"grid", maxHeight:280, overflowY:"auto"}}>
            {matches.length === 0 && (
              <div style={{padding:"20px 10px", textAlign:"center",
                color:"var(--ink-3)", fontSize:13}}>
                {lang==="tr"?"Eşleşme yok.":"No matches."}
              </div>
            )}
            {matches.map(m => {
              const ini = m.name.split(" ").map(x=>x[0]).join("").slice(0,2);
              return (
                <button key={m.id} onClick={()=>onAttach(m)} style={{
                  display:"grid", gridTemplateColumns:"auto 1fr auto", gap:12,
                  alignItems:"center", padding:"10px 8px", cursor:"pointer",
                  borderBottom:"1px solid var(--line)", textAlign:"left",
                  background:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--paper-2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:34, height:34, borderRadius:"50%",
                    background:"var(--paper-2)", display:"grid", placeItems:"center",
                    fontFamily:"var(--font-display)", fontStyle:"italic",
                    fontWeight:600, fontSize:13}}>{ini}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:500}}>{m.name}</div>
                    <div style={{fontSize:11, color:"var(--ink-3)",
                      fontFamily:"var(--font-mono)"}}>
                      {m.phone} · {m.visits} {lang==="tr"?"ziyaret":"visits"}
                    </div>
                  </div>
                  <div style={{fontSize:13, fontFamily:"var(--font-mono)",
                    fontWeight:700, color:"var(--accent)"}}>
                    {m.points}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{paddingTop:10, borderTop:"1px solid var(--line)",
            display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <Button variant="ghost" onClick={onClose}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
            <Button variant="primary" icon="plus" onClick={()=>{
              setStage("create");
              if (digits) setNewMember(n=>({...n, phone:q}));
            }}>
              {lang==="tr"?"Yeni üye oluştur":"Create new"}
            </Button>
          </div>
        </div>
      )}
      {stage === "create" && (
        <div style={{display:"grid", gap:12}}>
          <Field label={lang==="tr"?"Ad soyad":"Name"}>
            <Input autoFocus value={newMember.name}
              onChange={e=>setNewMember({...newMember, name:e.target.value})}/>
          </Field>
          <Field label={lang==="tr"?"Telefon":"Phone"}>
            <Input value={newMember.phone}
              onChange={e=>setNewMember({...newMember, phone:e.target.value})}/>
          </Field>
          <Field label={lang==="tr"?"E-posta (opsiyonel)":"Email (optional)"}>
            <Input type="email" value={newMember.email}
              onChange={e=>setNewMember({...newMember, email:e.target.value})}/>
          </Field>
          <Field label={lang==="tr"?"Doğum günü (opsiyonel)":"Birthday (optional)"}>
            <Input type="date" value={newMember.birthday}
              onChange={e=>setNewMember({...newMember, birthday:e.target.value})}/>
          </Field>
          <div style={{padding:"10px 12px", background:"#E9EFE0", borderRadius:8,
            fontSize:12, color:"#3F5B36", display:"flex", alignItems:"center", gap:8}}>
            <Icon name="gift" size={13}/>
            {lang==="tr"?`Hoş geldin bonusu: +${config?.welcomeBonus||50} puan`
                       :`Welcome bonus: +${config?.welcomeBonus||50} points`}
          </div>
          <div style={{display:"flex", gap:8, justifyContent:"space-between",
            paddingTop:8, borderTop:"1px solid var(--line)"}}>
            <Button variant="ghost" onClick={()=>setStage("search")}>
              {lang==="tr"?"Geri":"Back"}
            </Button>
            <Button variant="primary" icon="check" onClick={create}
              disabled={!newMember.name.trim() || !newMember.phone.trim()}>
              {lang==="tr"?"Oluştur ve bağla":"Create & attach"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

Object.assign(window, {
  AddItemModal, DiscountModal, VoidModal, CompModal,
  SplitModal, TransferModal, MergeModal, PaymentModal, NoteModal,
  MemberLookupModal,
});
