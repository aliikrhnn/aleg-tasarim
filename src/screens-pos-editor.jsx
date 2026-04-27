// POS ticket editor — opens when a ticket card is clicked.
//
// Two-column layout:
//   left:  items list grouped by course, with per-line actions
//          (qty +/-, discount, void, comp, move course, fire)
//   right: totals + tip/service + discount + payment launcher
//
// Modals launched from here:
//   - Discount: picks type (% or ₺) and scope (item or whole ticket)
//   - Void: reason picker
//   - Manager comp: PIN gate (1234 demo)
//   - Split: by item / by guests evenly
//   - Transfer: pick destination table (moves the last-right-clicked item)
//   - Payment: cash / card / split, partial amounts, tip, change calc, loyalty lookup

const TicketEditor = ({tk, table, zone, products, categories, tickets, tables, lang,
                       staff, team, members, setMembers, loyaltyConfig, loyaltyOn,
                       onBack, onUpdate, onClose, onTransfer, onMerge}) => {
  // totals
  const totals = computeTotals(tk, products, categories);

  // attached member
  const member = members?.find(m => m.id === tk.memberId) || null;

  // modals
  const [addItemOpen, setAddItemOpen] = React.useState(false);
  const [memberOpen, setMemberOpen] = React.useState(false);
  const [discountModal, setDiscountModal] = React.useState(null); // {scope: "item"|"ticket", itemId?}
  const [voidModal, setVoidModal] = React.useState(null);         // {itemId}
  const [compModal, setCompModal] = React.useState(null);         // "ticket"|{itemId}
  const [splitModal, setSplitModal] = React.useState(false);
  const [transferModal, setTransferModal] = React.useState(null); // {itemId}
  const [mergeModal, setMergeModal] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [noteOpen, setNoteOpen] = React.useState(false);

  // group items by course
  const courseItems = {1:[], 2:[], 3:[]};
  tk.items.forEach(it => (courseItems[it.course || 1] ||= []).push(it));
  const courseLabels = {
    1: {tr:"İçecekler & Başlangıç", en:"Drinks & Starters"},
    2: {tr:"Ana yemekler",          en:"Mains"},
    3: {tr:"Tatlı & Son",           en:"Dessert"},
  };

  const setItem = (id, patch) => onUpdate(t => ({...t, items: t.items.map(i => i.id === id ? {...i, ...patch} : i)}));
  const removeItem = (id) => onUpdate(t => ({...t, items: t.items.filter(i => i.id !== id)}));
  const addItemToTicket = (prod) => {
    const newIt = {
      id:"i"+Date.now()+Math.random().toString(36).slice(2,5),
      pid: prod.id, name: prod.name, qty:1, price: prod.price,
      course: prod.print === "kitchen" ? 2 : 1, fired:false
    };
    onUpdate(t => ({...t, items:[...t.items, newIt]}));
  };
  const bumpQty = (id, delta) => setItem(id, {qty: Math.max(1, (tk.items.find(i=>i.id===id).qty || 1) + delta)});
  const fireCourse = (c) => onUpdate(t => ({...t, items: t.items.map(i => i.course === c ? {...i, fired:true} : i)}));

  return (
    <div style={{display:"grid", gridTemplateColumns:"minmax(0, 1.5fr) minmax(0, 1fr)", gap:18, alignItems:"flex-start"}}>
      {/* ─── LEFT: ticket items ─── */}
      <div style={{display:"grid", gap:14}}>
        {/* header */}
        <Card style={{padding:0, overflow:"hidden"}}>
          <div style={{padding:"18px 22px", background: zone?.color || "var(--ink)",
            color: "var(--paper)", display:"flex", alignItems:"center", gap:16}}>
            <button onClick={onBack} style={{width:36,height:36,borderRadius:"50%",
              background:"rgba(255,255,255,.15)", display:"grid", placeItems:"center",
              cursor:"pointer", color:"var(--paper)"}}>
              <Icon name="arrow-left" size={16}/>
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:11, opacity:.8, fontFamily:"var(--font-mono)",
                letterSpacing:".12em", textTransform:"uppercase", fontWeight:500}}>
                {zone?.name[lang]} · {lang==="tr"?"Masa":"Table"}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:14,marginTop:2}}>
                <div style={{fontSize:36, fontFamily:"var(--font-display)", fontStyle:"italic",
                  fontWeight:500, letterSpacing:"-0.02em", lineHeight:1}}>{table?.name}</div>
                <div style={{fontSize:12, opacity:.85, fontFamily:"var(--font-mono)"}}>
                  {tk.guests} {lang==="tr"?"kişi":"guests"} · {tk.openedAt?.slice(11,16)}
                </div>
              </div>
            </div>
            <div style={{display:"flex", gap:6}}>
              <button onClick={()=>onUpdate({guests: Math.max(1, (tk.guests||1) - 1)})}
                style={tinyChromeBtn}>−</button>
              <span style={{minWidth:28, textAlign:"center", fontFamily:"var(--font-mono)",
                fontSize:13, fontWeight:600, padding:"0 6px", lineHeight:"32px"}}>{tk.guests}</span>
              <button onClick={()=>onUpdate({guests: (tk.guests||1) + 1})} style={tinyChromeBtn}>+</button>
            </div>
          </div>

          {/* toolbar */}
          <div style={{padding:"10px 14px", borderBottom:"1px solid var(--line)",
            background:"var(--card-2)", display:"flex", gap:6, flexWrap:"wrap"}}>
            <Button variant="primary" size="sm" icon="plus" onClick={()=>setAddItemOpen(true)}>
              {lang==="tr"?"Ürün ekle":"Add item"}
            </Button>
            <Button variant="ghost" size="sm" icon="edit" onClick={()=>setNoteOpen(true)}>
              {lang==="tr"?"Not":"Note"}
            </Button>
            <div style={{width:1, background:"var(--line)", margin:"0 4px"}}/>
            <Button variant="ghost" size="sm" icon="cash" onClick={()=>setSplitModal(true)}>
              {lang==="tr"?"Böl":"Split"}
            </Button>
            <Button variant="ghost" size="sm" icon="refresh" onClick={()=>setMergeModal(true)}>
              {lang==="tr"?"Birleştir":"Merge"}
            </Button>
            <div style={{flex:1}}/>
            <Button variant="soft" size="sm" icon="printer"
              onClick={()=>alert(lang==="tr"?"Fiş yazdırılıyor…":"Printing receipt…")}>
              {lang==="tr"?"Fiş yazdır":"Print bill"}
            </Button>
          </div>

          {/* courses */}
          <div style={{padding:"14px 20px", display:"grid", gap:18}}>
            {[1,2,3].map(c => {
              const items = courseItems[c] || [];
              if (!items.length) return null;
              const allFired = items.every(it => it.fired || it.voided);
              return (
                <div key={c}>
                  <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                    <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                      letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                      color: allFired ? "var(--ink-3)" : "var(--accent)"}}>
                      {lang==="tr"?"Servis " + c:"Course " + c} · {courseLabels[c][lang]}
                    </div>
                    <div style={{flex:1, height:1, background:"var(--line)"}}/>
                    {!allFired && (
                      <button onClick={()=>fireCourse(c)} style={{
                        padding:"4px 10px", borderRadius:999,
                        background:"var(--accent)", color:"var(--paper)",
                        fontSize:10.5, fontWeight:700, letterSpacing:".08em",
                        fontFamily:"var(--font-mono)", cursor:"pointer"}}>
                        {lang==="tr"?"ATEŞLE":"FIRE"}
                      </button>
                    )}
                    {allFired && (
                      <span style={{padding:"2px 8px", borderRadius:999,
                        background:"#E9EFE0", color:"#3F5B36",
                        fontSize:10, fontWeight:600, fontFamily:"var(--font-mono)",
                        letterSpacing:".06em"}}>
                        {lang==="tr"?"ATEŞLENDİ":"FIRED"}
                      </span>
                    )}
                  </div>
                  <div style={{display:"grid", gap:6}}>
                    {items.map(it => (
                      <LineItem key={it.id} it={it} lang={lang}
                        onBump={(d)=>bumpQty(it.id, d)}
                        onRemove={()=>removeItem(it.id)}
                        onDiscount={()=>setDiscountModal({scope:"item", itemId:it.id})}
                        onVoid={()=>setVoidModal({itemId:it.id})}
                        onComp={()=>setCompModal({itemId:it.id})}
                        onMoveCourse={(nc)=>setItem(it.id, {course:nc})}
                        onTransfer={()=>setTransferModal({itemId:it.id})}/>
                    ))}
                  </div>
                </div>
              );
            })}
            {tk.items.length === 0 && (
              <div style={{padding:"30px 10px", textAlign:"center", color:"var(--ink-3)"}}>
                {lang==="tr"?"Hiç ürün yok. 'Ürün ekle' ile başlayın.":"No items yet. Add one to begin."}
              </div>
            )}
          </div>

          {/* note */}
          {tk.note && (
            <div style={{padding:"10px 20px 18px", fontSize:12, color:"var(--ink-3)",
              fontStyle:"italic"}}>
              {lang==="tr"?"Not":"Note"}: {tk.note}
            </div>
          )}
        </Card>
      </div>

      {/* ─── RIGHT: totals & payment ─── */}
      <div style={{position:"sticky", top:20, display:"grid", gap:12}}>
        {loyaltyOn && (
          <Card style={{padding:0, overflow:"hidden"}}>
            <div style={{padding:"12px 18px", borderBottom:"1px solid var(--line)",
              display:"flex", alignItems:"center", gap:10}}>
              <Icon name="user" size={14}/>
              <div style={{fontSize:10, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", color:"var(--ink-3)",
                textTransform:"uppercase", fontWeight:500, flex:1}}>
                {lang==="tr"?"Müşteri":"Member"}
              </div>
              {member && (
                <button onClick={()=>onUpdate({memberId:null})} style={{
                  fontSize:10.5, color:"var(--ink-3)", cursor:"pointer",
                  fontFamily:"var(--font-mono)", letterSpacing:".05em"}}>
                  {lang==="tr"?"Kaldır":"Remove"}
                </button>
              )}
            </div>
            {!member && (
              <button onClick={()=>setMemberOpen(true)} style={{
                width:"100%", padding:"16px 18px", textAlign:"left", cursor:"pointer",
                background:"var(--card)", display:"flex", alignItems:"center", gap:12}}>
                <div style={{width:36, height:36, borderRadius:"50%",
                  background:"var(--paper-2)", border:"1px dashed var(--line-2)",
                  display:"grid", placeItems:"center", color:"var(--ink-3)"}}>
                  <Icon name="plus" size={14}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:500}}>
                    {lang==="tr"?"Müşteri bağla":"Attach member"}
                  </div>
                  <div style={{fontSize:11, color:"var(--ink-3)", marginTop:1}}>
                    {lang==="tr"?"Telefon ile ara, puan biriktir":"Search by phone, earn points"}
                  </div>
                </div>
                <Icon name="chevron-right" size={14}/>
              </button>
            )}
            {member && (()=>{
              const cfg = loyaltyConfig || {};
              const earn = cfg.mode==="currency"
                ? Math.floor(totals.total / (cfg.currencyPerPoint||10))
                : cfg.mode==="percent"
                  ? Math.floor(totals.total * (cfg.percentBack||5)/100)
                  : 1;
              const after = (member.points||0) + earn;
              const goal = cfg.rewardAt || 500;
              const pct = Math.min(100, Math.round(after/goal*100));
              const ini = member.name.split(" ").map(x=>x[0]).join("").slice(0,2);
              return (
                <div style={{padding:"14px 18px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:12}}>
                    <div style={{width:38, height:38, borderRadius:"50%",
                      background:"var(--accent)", color:"var(--paper)",
                      display:"grid", placeItems:"center",
                      fontFamily:"var(--font-display)", fontStyle:"italic",
                      fontWeight:600, fontSize:15}}>{ini}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13.5, fontWeight:600,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                        {member.name}
                      </div>
                      <div style={{fontSize:11, color:"var(--ink-3)",
                        fontFamily:"var(--font-mono)"}}>
                        {member.phone} · {member.visits} {lang==="tr"?"ziyaret":"visits"}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18, fontWeight:700,
                        fontFamily:"var(--font-mono)"}}>{member.points}</div>
                      <div style={{fontSize:9, color:"var(--ink-3)",
                        fontFamily:"var(--font-mono)", letterSpacing:".08em",
                        textTransform:"uppercase"}}>{lang==="tr"?"puan":"points"}</div>
                    </div>
                  </div>
                  <div style={{marginTop:12, padding:"10px 12px",
                    background:"#E9EFE0", borderRadius:8,
                    display:"flex", alignItems:"center", gap:8}}>
                    <Icon name="gift" size={13}/>
                    <span style={{fontSize:12, color:"#3F5B36", fontWeight:500, flex:1}}>
                      {lang==="tr"?`Bu ödemede +${earn} puan`:`+${earn} points on this payment`}
                    </span>
                  </div>
                  <div style={{marginTop:10}}>
                    <div style={{display:"flex", justifyContent:"space-between",
                      fontSize:10, color:"var(--ink-3)",
                      fontFamily:"var(--font-mono)", letterSpacing:".06em",
                      textTransform:"uppercase", marginBottom:4}}>
                      <span>{after} / {goal}</span>
                      <span>{(loyaltyConfig?.rewardName||{})[lang] || "Reward"}</span>
                    </div>
                    <div style={{height:4, background:"var(--line)", borderRadius:2,
                      overflow:"hidden"}}>
                      <div style={{height:"100%", width:pct+"%",
                        background:"var(--accent)"}}/>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}
        <Card style={{padding:0, overflow:"hidden"}}>
          <div style={{padding:"16px 20px", borderBottom:"1px solid var(--line)"}}>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)",
              letterSpacing:".14em", color:"var(--accent)",
              textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Hesap":"Bill"}
            </div>
            <div style={{fontSize:13, color:"var(--ink-3)", marginTop:2}}>
              {tk.items.filter(i=>!i.voided).reduce((s,i)=>s+i.qty,0)} {lang==="tr"?"ürün":"items"}
            </div>
          </div>

          <div style={{padding:"14px 20px", display:"grid", gap:10}}>
            <TotalRow label={lang==="tr"?"Ara toplam":"Subtotal"} value={fmtMoney(totals.subtotal, lang)}/>
            {totals.globalDisc > 0 && (
              <TotalRow label={lang==="tr"?"İndirim":"Discount"}
                value={"− " + fmtMoney(totals.globalDisc, lang)} accent/>
            )}
            {totals.tip > 0 && (
              <TotalRow label={lang==="tr"?"Bahşiş":"Tip"} value={fmtMoney(totals.tip, lang)}/>
            )}
            <div style={{height:1, background:"var(--line)", margin:"4px 0"}}/>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
              <span style={{fontSize:13, fontWeight:600, textTransform:"uppercase",
                letterSpacing:".06em", fontFamily:"var(--font-mono)"}}>
                {lang==="tr"?"Toplam":"Total"}
              </span>
              <span style={{fontSize:36, fontFamily:"var(--font-display)", fontStyle:"italic",
                fontWeight:600, letterSpacing:"-0.02em"}}>
                {fmtMoney(totals.total, lang)}
              </span>
            </div>
            <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
              textAlign:"right"}}>
              {lang==="tr"?"KDV dahil":"VAT included"}: {fmtMoney(totals.vat, lang)}
            </div>
          </div>

          {/* Tip slider */}
          <div style={{padding:"10px 20px 16px", borderTop:"1px solid var(--line)"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
              <span style={{fontSize:11, fontWeight:600, color:"var(--ink-2)",
                letterSpacing:".04em", textTransform:"uppercase"}}>
                {lang==="tr"?"Servis/Bahşiş":"Service/Tip"}
              </span>
              <span style={{fontSize:12, fontWeight:600, color:"var(--accent)",
                fontFamily:"var(--font-mono)"}}>
                {tk.tipPct || 0}%
              </span>
            </div>
            <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
              {[0, 5, 10, 15, 20].map(v => (
                <button key={v} onClick={()=>onUpdate({tipPct:v})}
                  style={{flex:1, padding:"8px 0", borderRadius:8, fontSize:12.5,
                    fontFamily:"var(--font-mono)", fontWeight:600, cursor:"pointer",
                    border:`1.5px solid ${tk.tipPct===v?"var(--accent)":"var(--line)"}`,
                    background: tk.tipPct===v?"var(--paper-2)":"var(--card)",
                    color: tk.tipPct===v?"var(--accent)":"var(--ink-2)"}}>
                  {v}%
                </button>
              ))}
            </div>
          </div>

          {/* Discount actions */}
          <div style={{padding:"10px 20px 14px", borderTop:"1px solid var(--line)",
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
            <Button variant="soft" size="sm" icon="percent"
              onClick={()=>setDiscountModal({scope:"ticket"})}>
              {lang==="tr"?"İndirim":"Discount"}
            </Button>
            <Button variant="soft" size="sm" icon="gift"
              onClick={()=>setCompModal("ticket")}>
              {lang==="tr"?"İkram (PIN)":"Comp (PIN)"}
            </Button>
          </div>

          {/* Pay button */}
          <div style={{padding:"14px 20px", background:"var(--ink)",
            borderTop:"1px solid var(--line)"}}>
            <button onClick={()=>setPaymentOpen(true)}
              disabled={totals.total <= 0}
              style={{width:"100%", padding:"16px 14px", borderRadius:12,
                background:"var(--accent)", color:"var(--paper)",
                fontSize:16, fontWeight:700, cursor: totals.total<=0?"not-allowed":"pointer",
                opacity: totals.total<=0?.5:1,
                display:"flex", justifyContent:"center", alignItems:"center", gap:10,
                letterSpacing:".02em"}}>
              <Icon name="cash" size={18}/>
              {lang==="tr"?"Ödeme al":"Take payment"}
              <span style={{fontFamily:"var(--font-mono)", opacity:.9}}>
                {fmtMoney(totals.total, lang)}
              </span>
            </button>
          </div>
        </Card>
      </div>

      {/* ─── modals ─── */}
      <AddItemModal open={addItemOpen} onClose={()=>setAddItemOpen(false)}
        products={products} categories={categories} lang={lang} onAdd={addItemToTicket}/>
      <MemberLookupModal open={memberOpen} onClose={()=>setMemberOpen(false)}
        members={members||[]} setMembers={setMembers} lang={lang} config={loyaltyConfig}
        onAttach={(m)=>{ onUpdate({memberId:m.id}); setMemberOpen(false); }}/>
      <DiscountModal modal={discountModal} setModal={setDiscountModal} lang={lang}
        items={tk.items} onApplyItem={(id,patch)=>setItem(id,patch)}
        onApplyTicket={(patch)=>onUpdate(patch)}/>
      <VoidModal modal={voidModal} setModal={setVoidModal} lang={lang}
        items={tk.items} onApply={(id, reason)=>{
          const it = tk.items.find(i=>i.id===id);
          if (!it) return;
          if (it.fired) setItem(id, {voided: reason});  // keep record if fired
          else removeItem(id);                          // unfired = silent delete
          setVoidModal(null);
        }}/>
      <CompModal modal={compModal} setModal={setCompModal} lang={lang}
        items={tk.items} totals={totals}
        onApplyItem={(id)=>{ setItem(id, {compd:true}); setCompModal(null); }}
        onApplyTicket={()=>{ onUpdate({discountPct:100, discountFlat:0}); setCompModal(null); }}/>
      <SplitModal open={splitModal} setOpen={setSplitModal} lang={lang}
        tk={tk} totals={totals} products={products}/>
      <TransferModal modal={transferModal} setModal={setTransferModal} lang={lang}
        tables={tables} tickets={tickets} currentTicketId={tk.id}
        onPick={(toTableId)=>{ onTransfer(transferModal.itemId, toTableId); setTransferModal(null); }}/>
      <MergeModal open={mergeModal} setOpen={setMergeModal} lang={lang}
        tables={tables} tickets={tickets} currentTicketId={tk.id}
        onPick={(fromTableId)=>{ onMerge(fromTableId); setMergeModal(false); }}/>
      <PaymentModal open={paymentOpen} setOpen={setPaymentOpen}
        tk={tk} totals={totals} lang={lang}
        member={member} setMembers={setMembers} members={members||[]}
        config={loyaltyConfig}
        onClose={onClose} onUpdate={onUpdate}/>
      <NoteModal open={noteOpen} setOpen={setNoteOpen} lang={lang}
        value={tk.note||""} onSave={(v)=>{onUpdate({note:v}); setNoteOpen(false);}}/>
    </div>
  );
};

const tinyChromeBtn = {
  width:32, height:32, borderRadius:8, background:"rgba(255,255,255,.15)",
  color:"var(--paper)", fontSize:18, fontWeight:600, cursor:"pointer",
  display:"grid", placeItems:"center"
};

const TotalRow = ({label, value, accent}) => (
  <div style={{display:"flex", justifyContent:"space-between", fontSize:13, color: accent?"var(--accent)":"var(--ink-2)"}}>
    <span>{label}</span>
    <span style={{fontFamily:"var(--font-mono)", fontWeight:600}}>{value}</span>
  </div>
);

/* ──────── Line item ──────── */
const LineItem = ({it, lang, onBump, onRemove, onDiscount, onVoid, onComp, onMoveCourse, onTransfer}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const gross = it.qty * it.price;
  const discAmt = it.compd ? gross : (gross * (it.discountPct||0)/100 + Math.min(it.discountFlat||0, gross));
  const net = gross - discAmt;
  const muted = it.voided || it.compd;
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"auto 1fr auto auto", gap:12, alignItems:"center",
      padding:"10px 12px", borderRadius:10,
      background: it.fired ? "var(--card)" : "#FBF6E6",
      border: `1px solid ${it.fired ? "var(--line)" : "#E8D48C"}`,
      opacity: it.voided ? .5 : 1,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:2,
        background:"var(--card-2)", borderRadius:8, border:"1px solid var(--line)"}}>
        <button disabled={it.voided} onClick={()=>onBump(-1)} style={qtyBtn}>−</button>
        <span style={{minWidth:22, textAlign:"center", fontFamily:"var(--font-mono)",
          fontSize:13, fontWeight:600}}>{it.qty}</span>
        <button disabled={it.voided} onClick={()=>onBump(+1)} style={qtyBtn}>+</button>
      </div>
      <div style={{minWidth:0}}>
        <div style={{fontSize:13.5, fontWeight:500,
          textDecoration: it.voided ? "line-through" : "none"}}>
          {it.name[lang]}
          {!it.fired && !it.voided && (
            <span style={{marginLeft:6, padding:"1px 6px", borderRadius:3, fontSize:9,
              fontWeight:700, letterSpacing:".08em", fontFamily:"var(--font-mono)",
              background:"#B08A3E22", color:"#6B4C0A"}}>
              {lang==="tr"?"BEKLEMEDE":"HOLD"}
            </span>
          )}
          {it.compd && (
            <span style={{marginLeft:6, padding:"1px 6px", borderRadius:3, fontSize:9,
              fontWeight:700, letterSpacing:".08em", fontFamily:"var(--font-mono)",
              background:"var(--accent)", color:"var(--paper)"}}>
              {lang==="tr"?"İKRAM":"COMP"}
            </span>
          )}
          {it.voided && (
            <span style={{marginLeft:6, fontSize:10, color:"#8B3B24", fontWeight:600}}>
              {lang==="tr"?"İptal":"Void"}{typeof it.voided === "string" ? ": " + it.voided : ""}
            </span>
          )}
          {(it.discountPct || it.discountFlat) && !it.compd && (
            <span style={{marginLeft:6, padding:"1px 6px", borderRadius:3, fontSize:9,
              fontWeight:700, letterSpacing:".08em", fontFamily:"var(--font-mono)",
              background:"#6B7A4B22", color:"#3F5B36"}}>
              {it.discountPct ? it.discountPct+"%" : "−₺"+it.discountFlat}
            </span>
          )}
        </div>
        <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
          ₺{it.price} × {it.qty}
        </div>
      </div>
      <div style={{textAlign:"right", fontFamily:"var(--font-mono)", fontWeight:600,
        fontSize:13}}>
        {muted ? <s style={{opacity:.5}}>₺{gross}</s> : null}
        {!muted && "₺"+net}
        {muted && !it.voided && <span style={{display:"block",fontSize:12}}> ₺{Math.round(net)}</span>}
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{
          width:30, height:30, borderRadius:8, background:"var(--card-2)",
          border:"1px solid var(--line)", cursor:"pointer", color:"var(--ink-2)"}}>
          ⋯
        </button>
        {menuOpen && (
          <>
            <div onClick={()=>setMenuOpen(false)} style={{position:"fixed", inset:0, zIndex:50}}/>
            <div style={{position:"absolute", right:0, top:34, zIndex:51, minWidth:180,
              background:"var(--card)", border:"1px solid var(--line)", borderRadius:10,
              boxShadow:"var(--shadow-lg)", padding:4, display:"grid"}}>
              {[
                {label: lang==="tr"?"İndirim":"Discount",       icon:"percent", fn:onDiscount},
                {label: lang==="tr"?"İkram yap":"Make comp",    icon:"gift",    fn:onComp},
                {label: lang==="tr"?"Servis 1":"Course 1",      icon:"menu",    fn:()=>onMoveCourse(1)},
                {label: lang==="tr"?"Servis 2":"Course 2",      icon:"menu",    fn:()=>onMoveCourse(2)},
                {label: lang==="tr"?"Servis 3":"Course 3",      icon:"menu",    fn:()=>onMoveCourse(3)},
                {label: lang==="tr"?"Masa değiştir":"Transfer", icon:"refresh", fn:onTransfer},
                {label: lang==="tr"?"İptal":"Void",             icon:"trash",   fn:onVoid, danger:true},
              ].map(a => (
                <button key={a.label} onClick={()=>{a.fn(); setMenuOpen(false);}} style={{
                  padding:"8px 10px", fontSize:12.5, textAlign:"left", borderRadius:6,
                  background:"transparent", cursor:"pointer",
                  color: a.danger?"#C4553A":"var(--ink)",
                  display:"flex", alignItems:"center", gap:8}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--paper-2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Icon name={a.icon} size={12}/>{a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
const qtyBtn = {
  width:26, height:28, background:"transparent", cursor:"pointer",
  color:"var(--ink-2)", fontSize:14, fontWeight:600
};

Object.assign(window, { TicketEditor });
