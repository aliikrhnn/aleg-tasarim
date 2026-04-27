// Z-Report: end-of-day summary drawer.
// Renders a detailed cashier close-out: sales, payments, VAT, hourly,
// top items, voids/comps, cash reconciliation. Printable/PDF-exportable
// via the shared openPrintable() helper.

const ZReportModal = ({open, onClose, lang, summary, tickets, products, categories}) => {
  const [cashCount, setCashCount] = React.useState(summary.cash || 0);
  React.useEffect(() => {
    if (open) setCashCount(summary.cash || 0);
  }, [open, summary.cash]);
  if (!open) return null;

  const fmt = (n) => new Intl.NumberFormat(lang==="tr"?"tr-TR":"en-US",
    {style:"currency", currency:"TRY", maximumFractionDigits:0}).format(n||0);
  const todayStr = new Date().toLocaleDateString(lang==="tr"?"tr-TR":"en-US",
    {day:"numeric", month:"long", year:"numeric"});
  const nowStr = new Date().toLocaleTimeString(lang==="tr"?"tr-TR":"en-US",
    {hour:"2-digit", minute:"2-digit"});
  const biz = { name:"Aleg", branch:"Karaköy", tax:"1234567890", addr:"Kemankeş Mah. No:14 Karaköy, İstanbul" };

  // ─── Fabricate plausible breakdowns from summary ───
  const subtotal = Math.round((summary.revenue||0) / 1.10);       // 10% VAT
  const vat = (summary.revenue||0) - subtotal;
  const discounts = Math.round((summary.revenue||0) * 0.03);
  const net = summary.revenue||0;

  // Hourly distribution
  const hours = [
    {h:"08-10", v: Math.round(net*0.10)},
    {h:"10-12", v: Math.round(net*0.17)},
    {h:"12-14", v: Math.round(net*0.24)},
    {h:"14-16", v: Math.round(net*0.12)},
    {h:"16-18", v: Math.round(net*0.13)},
    {h:"18-20", v: Math.round(net*0.14)},
    {h:"20-22", v: Math.round(net*0.10)},
  ];
  const maxH = Math.max(...hours.map(h=>h.v));

  // Top items (derive from open tickets or fabricate)
  const topItems = [
    {name:{tr:"Flat White",en:"Flat White"}, qty:34, total:3230},
    {name:{tr:"V60 Filtre",en:"V60 Pour-over"}, qty:22, total:2860},
    {name:{tr:"Avokadolu Ekşi Maya",en:"Avocado Sourdough"}, qty:18, total:2520},
    {name:{tr:"Iced Matcha Latte",en:"Iced Matcha Latte"}, qty:15, total:1500},
    {name:{tr:"Cortado",en:"Cortado"}, qty:14, total:1190},
    {name:{tr:"Tahinli Cookie",en:"Tahini Cookie"}, qty:13, total:845},
  ];

  // Category breakdown
  const byCategory = [
    {name:{tr:"Espresso Bazlı",en:"Espresso-Based"}, count:58, total:5220, pct:38},
    {name:{tr:"Filtre Kahve",en:"Pour-over"},        count:32, total:3840, pct:28},
    {name:{tr:"Mevsimlik",en:"Seasonal"},             count:24, total:2640, pct:19},
    {name:{tr:"Tatlı & Atıştırmalık",en:"Pastry & Snacks"}, count:19, total:1330, pct:10},
    {name:{tr:"Kahvaltı",en:"Brunch"},                count:8,  total:650,  pct:5},
  ];

  // Staff breakdown
  const staffRows = [
    {name:"Barış Yılmaz", orders:14, revenue:4580},
    {name:"Deniz Ürün",   orders:12, revenue:3920},
    {name:"Sena Akın",    orders:9,  revenue:2840},
    {name:"Emre Topal",   orders:7,  revenue:2340},
  ];

  const variance = cashCount - (summary.cash||0);

  const L = (tr,en) => lang==="tr" ? tr : en;

  // ─── PDF export ───
  const exportPDF = () => {
    const row = (k,v,bold) => `<div class="row" style="padding:6px 0;${bold?'font-weight:600;':''}">
      <span>${k}</span><span class="mono">${v}</span></div>`;
    const hr = `<div style="height:1px;background:#D6C9B2;margin:10px 0;"></div>`;
    const dashed = `<div style="height:1px;background:transparent;border-top:1px dashed #C5B79C;margin:10px 0;"></div>`;

    const body = `
      <div class="eyebrow">${L("Gün Sonu · Z-Raporu","End of Day · Z-Report")}</div>
      <h1>${biz.name} · ${biz.branch}</h1>
      <div class="sub">${todayStr} · ${L("Kapanış","Closed")} ${nowStr} · ${L("Vergi No","Tax ID")} ${biz.tax}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:18px;">
        ${[
          [L("Ziyaretçi","Covers"), summary.covers],
          [L("Hesap","Checks"),     summary.orders],
          [L("Ort. Hesap","Avg."),  fmt(summary.avgTicket)],
          [L("Ciro","Revenue"),     fmt(summary.revenue)],
        ].map(([k,v])=>`
          <div style="background:#FFFDF7;border:1px solid #D6C9B2;border-radius:8px;padding:10px 12px;">
            <div class="eyebrow" style="color:#8C7A69;font-size:9px;">${k}</div>
            <div style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:22px;font-weight:500;letter-spacing:-.02em;margin-top:3px;">${v}</div>
          </div>`).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div>
          <div class="eyebrow">${L("Satış Özeti","Sales Summary")}</div>
          <div style="margin-top:10px;font-size:13px;">
            ${row(L("Ara toplam","Subtotal"), fmt(subtotal))}
            ${row(L("İndirimler","Discounts"), "− "+fmt(discounts))}
            ${row(L("İkram","Comp"), "− "+fmt(summary.compAmount))}
            ${row(L("KDV (10%)","VAT (10%)"), fmt(vat))}
            ${row(L("Bahşiş","Tips"), fmt(summary.tips))}
            ${hr}
            ${row(L("Net ciro","Net revenue"), fmt(summary.revenue), true)}
          </div>

          <div class="eyebrow" style="margin-top:20px;">${L("Ödeme Yöntemi","Payments")}</div>
          <div style="margin-top:10px;font-size:13px;">
            ${row(L("💵 Nakit","💵 Cash"), fmt(summary.cash))}
            ${row(L("💳 Kart","💳 Card"), fmt(summary.card))}
            ${row(L("🎁 İkram","🎁 Comp"), fmt(summary.compAmount))}
            ${hr}
            ${row(L("Toplam","Total"), fmt((summary.cash||0)+(summary.card||0)+(summary.compAmount||0)), true)}
          </div>
        </div>

        <div>
          <div class="eyebrow">${L("Kasa Sayımı","Cash Reconciliation")}</div>
          <div style="margin-top:10px;font-size:13px;">
            ${row(L("Beklenen","Expected"), fmt(summary.cash))}
            ${row(L("Sayılan","Counted"), fmt(cashCount))}
            ${hr}
            ${row(L("Fark","Variance"),
              (variance>=0?"+":"")+fmt(variance), true)}
          </div>

          <div class="eyebrow" style="margin-top:20px;">${L("Operasyon","Operations")}</div>
          <div style="margin-top:10px;font-size:13px;">
            ${row(L("İptal edilen","Voids"), summary.voids)}
            ${row(L("İkram edilen","Comps"), fmt(summary.compAmount))}
            ${row(L("Açık hesap","Still open"), tickets.length)}
          </div>
        </div>
      </div>

      ${dashed}

      <div class="eyebrow" style="margin-top:18px;">${L("Kategoriye Göre","By Category")}</div>
      <table style="margin-top:8px;">
        <thead><tr>
          <th>${L("Kategori","Category")}</th>
          <th style="text-align:right;">${L("Adet","Qty")}</th>
          <th style="text-align:right;">${L("Tutar","Total")}</th>
          <th style="text-align:right;">%</th>
        </tr></thead>
        <tbody>
          ${byCategory.map(c=>`<tr>
            <td>${c.name[lang]}</td>
            <td class="mono" style="text-align:right;">${c.count}</td>
            <td class="mono" style="text-align:right;">${fmt(c.total)}</td>
            <td class="mono" style="text-align:right;">${c.pct}%</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <div class="eyebrow" style="margin-top:18px;">${L("En Çok Satanlar","Top Items")}</div>
      <table style="margin-top:8px;">
        <thead><tr>
          <th>${L("Ürün","Item")}</th>
          <th style="text-align:right;">${L("Adet","Qty")}</th>
          <th style="text-align:right;">${L("Tutar","Total")}</th>
        </tr></thead>
        <tbody>
          ${topItems.map(it=>`<tr>
            <td>${it.name[lang]}</td>
            <td class="mono" style="text-align:right;">${it.qty}</td>
            <td class="mono" style="text-align:right;">${fmt(it.total)}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <div class="eyebrow" style="margin-top:18px;">${L("Personel","Staff")}</div>
      <table style="margin-top:8px;">
        <thead><tr>
          <th>${L("Kişi","Name")}</th>
          <th style="text-align:right;">${L("Hesap","Checks")}</th>
          <th style="text-align:right;">${L("Ciro","Revenue")}</th>
        </tr></thead>
        <tbody>
          ${staffRows.map(s=>`<tr>
            <td>${s.name}</td>
            <td class="mono" style="text-align:right;">${s.orders}</td>
            <td class="mono" style="text-align:right;">${fmt(s.revenue)}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <div class="footer">
        <span>${biz.addr}</span>
        <span>${L("Z no","Z-no")} · ${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(summary.orders||0).padStart(4,"0")}</span>
      </div>
    `;
    openPrintable(L("Z-Raporu","Z-Report") + " — " + todayStr, body, {accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()});
  };

  // ─── Visual stats card ───
  const StatCard = ({k, v, accent}) => (
    <div style={{background:"var(--card-2)", border:"1px solid var(--line)", borderRadius:10,
      padding:"12px 14px"}}>
      <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".14em",
        textTransform:"uppercase", color:"var(--ink-3)", fontWeight:600}}>{k}</div>
      <div style={{fontSize:24, fontFamily:"var(--font-display)",
        fontStyle:"var(--font-display-style)", fontWeight:500, letterSpacing:"-.02em",
        marginTop:3, color: accent||"var(--ink)"}}>{v}</div>
    </div>
  );

  return (
    <Modal open={true} onClose={onClose} width={880}
      title={L("Gün Sonu · Z-Raporu","End of Day · Z-Report")}
      subtitle={`${biz.name} · ${biz.branch} · ${todayStr} · ${L("Kapanış","Closed")} ${nowStr}`}>
      <div style={{display:"grid", gap:18}}>

        {/* Top stat row */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8}}>
          <StatCard k={L("Ziyaretçi","Covers")} v={summary.covers}/>
          <StatCard k={L("Hesap","Checks")} v={summary.orders}/>
          <StatCard k={L("Ort. Hesap","Avg. check")} v={fmt(summary.avgTicket)}/>
          <StatCard k={L("Ciro","Revenue")} v={fmt(summary.revenue)} accent="var(--accent)"/>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18}}>
          {/* LEFT — Sales + Payments */}
          <div style={{display:"grid", gap:16}}>
            <section>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", marginBottom:10}}>
                {L("Satış Özeti","Sales Summary")}
              </div>
              <SummaryRow k={L("Ara toplam","Subtotal")} v={fmt(subtotal)} lang={lang}/>
              <SummaryRow k={L("İndirimler","Discounts")} v={"− "+fmt(discounts)} lang={lang} muted/>
              <SummaryRow k={L("İkram","Comp")} v={"− "+fmt(summary.compAmount)} lang={lang} muted/>
              <SummaryRow k={L("KDV (10%)","VAT (10%)")} v={fmt(vat)} lang={lang}/>
              <SummaryRow k={L("Bahşiş","Tips")} v={fmt(summary.tips)} lang={lang}/>
              <div style={{height:1, background:"var(--line)", margin:"8px 0"}}/>
              <SummaryRow k={L("Net ciro","Net revenue")} v={fmt(summary.revenue)} lang={lang} bold accent/>
            </section>

            <section>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", marginBottom:10}}>
                {L("Ödeme Yöntemi","Payments")}
              </div>
              {[
                {k:L("💵 Nakit","💵 Cash"), v:fmt(summary.cash), pct: (summary.cash/summary.revenue)*100, color:"#6B7A4B"},
                {k:L("💳 Kart","💳 Card"), v:fmt(summary.card), pct: (summary.card/summary.revenue)*100, color:"#2E5B7A"},
                {k:L("🎁 İkram","🎁 Comp"), v:fmt(summary.compAmount), pct: (summary.compAmount/summary.revenue)*100, color:"#B08A3E"},
              ].map((p,i)=>(
                <div key={i} style={{padding:"8px 0", display:"grid", gap:4}}>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:13}}>
                    <span>{p.k}</span>
                    <span style={{fontFamily:"var(--font-mono)", fontWeight:600}}>{p.v}</span>
                  </div>
                  <div style={{height:4, background:"var(--paper-2)", borderRadius:3, overflow:"hidden"}}>
                    <div style={{height:"100%", width:`${p.pct}%`, background:p.color, borderRadius:3}}/>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", marginBottom:10}}>
                {L("Saatlik Dağılım","Hourly Distribution")}
              </div>
              <div style={{display:"flex", alignItems:"flex-end", gap:6, height:100,
                padding:"8px 2px 4px", borderBottom:"1px solid var(--line)"}}>
                {hours.map(h=>(
                  <div key={h.h} style={{flex:1, display:"grid", gap:4, justifyItems:"center"}}>
                    <div style={{fontSize:9, fontFamily:"var(--font-mono)", color:"var(--ink-3)"}}>{fmt(h.v).replace("₺","")}</div>
                    <div style={{width:"100%", height: (h.v/maxH)*70, minHeight:4,
                      background:"var(--accent)", opacity: .3 + (h.v/maxH)*.7, borderRadius:"3px 3px 0 0"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex", gap:6, padding:"4px 2px"}}>
                {hours.map(h=>(
                  <div key={h.h} style={{flex:1, textAlign:"center", fontSize:9,
                    fontFamily:"var(--font-mono)", color:"var(--ink-3)", letterSpacing:".04em"}}>{h.h}</div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT — Cash reconciliation, operations, categories */}
          <div style={{display:"grid", gap:16}}>
            <section style={{background:"var(--paper-2)", border:"1px dashed var(--line-2)",
              borderRadius:12, padding:14}}>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--accent)", marginBottom:10}}>
                {L("Kasa Sayımı","Cash Reconciliation")}
              </div>
              <SummaryRow k={L("Beklenen","Expected")} v={fmt(summary.cash)} lang={lang}/>
              <div style={{display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"8px 0"}}>
                <span style={{fontSize:13}}>{L("Sayılan","Counted")}</span>
                <div style={{display:"flex",alignItems:"center", gap:6}}>
                  <span style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)"}}>₺</span>
                  <input type="number" value={cashCount}
                    onChange={e=>setCashCount(parseInt(e.target.value||"0",10))}
                    style={{width:100, height:32, padding:"0 8px", borderRadius:6, textAlign:"right",
                      border:"1px solid var(--line)", background:"var(--card-2)",
                      fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600}}/>
                </div>
              </div>
              <div style={{height:1, background:"var(--line)", margin:"6px 0"}}/>
              <div style={{display:"flex", justifyContent:"space-between",
                padding:"8px 0", alignItems:"baseline"}}>
                <span style={{fontSize:13, fontWeight:600}}>{L("Fark","Variance")}</span>
                <span style={{fontSize:18, fontFamily:"var(--font-display)",
                  fontStyle:"var(--font-display-style)", fontWeight:600,
                  color: Math.abs(variance)<1 ? "var(--ok)" : variance<0 ? "var(--danger)" : "var(--warn)"}}>
                  {variance>=0?"+":""}{fmt(variance)}
                </span>
              </div>
            </section>

            <section>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", marginBottom:10}}>
                {L("Operasyon","Operations")}
              </div>
              <SummaryRow k={L("İptal edilen","Voids")} v={summary.voids} lang={lang}/>
              <SummaryRow k={L("İkram edilen","Comps")} v={fmt(summary.compAmount)} lang={lang}/>
              <SummaryRow k={L("Açık hesap","Still open")} v={tickets.length} lang={lang}/>
              <SummaryRow k={L("Kapanış saati","Closed at")} v={nowStr} lang={lang}/>
            </section>

            <section>
              <div style={{fontSize:11, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600,
                color:"var(--ink-2)", marginBottom:10}}>
                {L("Kategoriye Göre","By Category")}
              </div>
              <div style={{display:"grid", gap:6}}>
                {byCategory.map((c,i)=>(
                  <div key={i} style={{display:"grid", gap:3}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:12}}>
                      <span>{c.name[lang]}</span>
                      <span style={{fontFamily:"var(--font-mono)",
                        fontWeight:600}}>{fmt(c.total)}</span>
                    </div>
                    <div style={{height:3, background:"var(--paper-2)", borderRadius:2, overflow:"hidden"}}>
                      <div style={{height:"100%", width:`${c.pct*2}%`, background:"var(--accent)",
                        opacity: .4 + (i===0 ? .6 : (.6-i*.1))}}/>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex", gap:10, paddingTop:14, borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" icon="printer" onClick={exportPDF}>
            {L("Yazdır","Print")}
          </Button>
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={onClose}>{L("Kapat","Close")}</Button>
          <Button variant="primary" icon="download" onClick={exportPDF}>
            {L("PDF indir","Download PDF")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const SummaryRow = ({k, v, lang, bold, accent, muted}) => (
  <div style={{display:"flex", justifyContent:"space-between",
    alignItems:"baseline", padding:"6px 0", fontSize:13,
    opacity: muted ? .7 : 1,
    fontWeight: bold?600:400, color: accent?"var(--accent)":"var(--ink)"}}>
    <span>{k}</span>
    <span style={{fontFamily: bold ? "var(--font-display)" : "var(--font-mono)",
      fontStyle: bold ? "var(--font-display-style)":"normal",
      fontSize: bold?18:13, fontWeight:600}}>{v}</span>
  </div>
);

Object.assign(window, { ZReportModal });
