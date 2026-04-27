// Weekly Shifts + Stock + Receipt Designer + Brand (logo) screens.

const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"];
const SHIFT_COLOR = { morning:"#B08A3E", mid:"#C4553A", evening:"#6B7A4B", off:"#C5B79C" };
const SHIFT_LABEL = {
  morning:{tr:"Sabah",en:"Morning"},
  mid:{tr:"Öğle",en:"Mid"},
  evening:{tr:"Akşam",en:"Evening"},
  off:{tr:"İzinli",en:"Off"},
};

const hoursBetween = (start, end) => {
  if (!start || !end) return 0;
  const [sh,sm] = start.split(":").map(Number);
  const [eh,em] = end.split(":").map(Number);
  let diff = (eh*60+em) - (sh*60+sm);
  if (diff < 0) diff += 24*60;
  return Math.round(diff/60*10)/10;
};

const Shifts = ({t, lang, staff, setStaff, shifts, setShifts, templates, setTemplates}) => {
  const days = DAY_KEYS;
  const [weekStart] = React.useState("2026-04-20");
  const [addOpen, setAddOpen] = React.useState(false);
  const [newStaff, setNewStaff] = React.useState({name:"", role:"barista"});

  const shiftHours = {
    morning: hoursBetween(templates.morning.start, templates.morning.end),
    mid:     hoursBetween(templates.mid.start,     templates.mid.end),
    evening: hoursBetween(templates.evening.start, templates.evening.end),
    off:     0,
  };

  const cycle = (sid, day) => {
    const order = ["off","morning","mid","evening"];
    const cur = shifts[sid]?.[day] || "off";
    const next = order[(order.indexOf(cur)+1) % order.length];
    setShifts({...shifts, [sid]: {...(shifts[sid]||{}), [day]: next}});
  };

  const totalFor = (sid) => DAY_KEYS.reduce((s,d)=>s+(shiftHours[shifts[sid]?.[d]||"off"]||0),0);
  const weeklyTotal = staff.reduce((s,p)=>Math.round((s+totalFor(p.id))*10)/10, 0);

  const roleColors = {manager:"#C4553A",barista:"#6B7A4B",server:"#2E5B7A",kitchen:"#B08A3E"};
  const roleColor = (r) => roleColors[r]||"#8C7A69";
  const roleLabel = (r) => ({
    manager:{tr:"Müdür",en:"Manager"}, barista:{tr:"Barista",en:"Barista"},
    server:{tr:"Garson",en:"Server"}, kitchen:{tr:"Mutfak",en:"Kitchen"},
  }[r]?.[lang] || r);

  const addPerson = () => {
    if (!newStaff.name.trim()) return;
    const id = "s" + Date.now();
    setStaff([...staff, {id, name:newStaff.name.trim(), role:newStaff.role, color:roleColor(newStaff.role)}]);
    setShifts({...shifts, [id]:{mon:"off",tue:"off",wed:"off",thu:"off",fri:"off",sat:"off",sun:"off"}});
    setNewStaff({name:"", role:"barista"});
    setAddOpen(false);
  };

  const removePerson = (sid) => {
    setStaff(staff.filter(p=>p.id!==sid));
    const {[sid]:_, ...rest} = shifts; setShifts(rest);
  };

  const exportPdf = () => {
    const timeOf = (k) => k==="off" ? "—" : `${templates[k].start}–${templates[k].end}`;
    const rows = staff.map(p => {
      const cells = DAY_KEYS.map(d => {
        const v = shifts[p.id]?.[d] || "off";
        return `<td><span class="tag" style="background:${SHIFT_COLOR[v]};opacity:${v==="off"?.5:1}">${SHIFT_LABEL[v][lang]}</span><div class="mono" style="font-size:10px;color:#8C7A69;margin-top:3px">${timeOf(v)}</div></td>`;
      }).join("");
      return `<tr><td><b>${p.name}</b><div class="mono" style="font-size:10px;color:#8C7A69;text-transform:uppercase;letter-spacing:.08em">${roleLabel(p.role)}</div></td>${cells}<td class="mono"><b>${totalFor(p.id)}h</b></td></tr>`;
    }).join("");
    const headers = [lang==="tr"?"Çalışan":"Staff", ...DAY_KEYS.map(d=>t(d)), t("totalHours")]
      .map(h=>`<th>${h}</th>`).join("");
    openPrintable("Weekly Shift Schedule", `
      <div class="eyebrow">${t("nav_shifts")}</div>
      <h1>${lang==="tr"?"Haftalık Vardiya":"Weekly Shifts"}</h1>
      <div class="sub">Aleg Karaköy · ${t("week")} ${weekStart}</div>
      <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
      <div class="footer">
        <span>Aleg Menu · menu.aleg.cafe</span>
        <span>${t("totalHours").toUpperCase()}: ${weeklyTotal}h</span>
      </div>
    `);
  };

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_shifts")}
        title={lang==="tr"?"Haftalık Vardiya Planı":"Weekly Shift Schedule"}
        sub={lang==="tr"?"Vardiya saatlerini işletmene göre düzenle, personel ekle ya da çıkar. Hücrelere tıklayarak planı oluştur.":"Tune the shift hours, add or remove staff, and click cells to build the plan."}
        actions={<>
          <Button variant="soft" icon="user-plus" onClick={()=>setAddOpen(true)}>{t("addStaff")}</Button>
          <Button variant="primary" icon="download" onClick={exportPdf}>{t("downloadPdf")}</Button>
        </>}
      />

      {/* Editable shift templates */}
      <Card pad={0}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--line)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:600}}>
              {t("shiftTemplate")}
            </div>
            <div style={{fontSize:13.5,fontWeight:600,marginTop:3}}>
              {lang==="tr"?"İşletme çalışma saatleri":"Business operating hours"}
            </div>
          </div>
          <div style={{fontSize:11,color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>
            {lang==="tr"?"Değişiklikler anında vardiyalara yansır":"Changes apply live"}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
          {["morning","mid","evening"].map(k => (
            <div key={k} style={{padding:"16px 18px",borderRight:"1px solid var(--line)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{width:10,height:10,borderRadius:3,background:SHIFT_COLOR[k]}}/>
                <div style={{fontSize:13,fontWeight:600}}>{SHIFT_LABEL[k][lang]}</div>
                <div style={{marginLeft:"auto",fontSize:16,fontWeight:500,
                  letterSpacing:"-0.02em",fontFamily:"var(--font-display,'Fraunces')"}}>
                  {shiftHours[k]}<span style={{fontSize:11,opacity:.5}}>h</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <label style={{display:"grid",gap:4}}>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",
                    color:"var(--ink-3)",letterSpacing:".1em",textTransform:"uppercase"}}>{t("startTime")}</span>
                  <input type="time" value={templates[k].start}
                    onChange={e=>setTemplates({...templates,[k]:{...templates[k],start:e.target.value}})}
                    style={{padding:"8px 10px",borderRadius:8,border:"1px solid var(--line)",
                      background:"var(--card)",fontSize:13,fontFamily:"var(--font-mono)",
                      color:"var(--ink)",width:"100%"}}/>
                </label>
                <label style={{display:"grid",gap:4}}>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",
                    color:"var(--ink-3)",letterSpacing:".1em",textTransform:"uppercase"}}>{t("endTime")}</span>
                  <input type="time" value={templates[k].end}
                    onChange={e=>setTemplates({...templates,[k]:{...templates[k],end:e.target.value}})}
                    style={{padding:"8px 10px",borderRadius:8,border:"1px solid var(--line)",
                      background:"var(--card)",fontSize:13,fontFamily:"var(--font-mono)",
                      color:"var(--ink)",width:"100%"}}/>
                </label>
              </div>
            </div>
          ))}
          <div style={{padding:"16px 18px",background:"var(--ink)",color:"var(--paper)"}}>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",opacity:.7,
              letterSpacing:".12em",textTransform:"uppercase"}}>{t("totalHours")}</div>
            <div style={{fontSize:34,fontWeight:500,letterSpacing:"-0.02em",marginTop:6,
              fontFamily:"var(--font-display,'Fraunces')"}}>{weeklyTotal}<span style={{fontSize:14,opacity:.5}}>h</span></div>
            <div style={{fontSize:11,opacity:.5,marginTop:4,fontFamily:"var(--font-mono)"}}>
              {staff.length} {lang==="tr"?"kişi":"staff"}
            </div>
          </div>
        </div>
      </Card>

      <Card pad={0}>
        <div style={{display:"grid",gridTemplateColumns:"220px repeat(7, 1fr) 80px 40px",
          padding:"14px 18px",borderBottom:"1px solid var(--line)",gap:8,
          fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
          letterSpacing:".12em",textTransform:"uppercase",fontWeight:600}}>
          <div>{lang==="tr"?"Çalışan":"Staff"}</div>
          {days.map(d => <div key={d}>{t(d)}</div>)}
          <div style={{textAlign:"right"}}>{lang==="tr"?"Saat":"Hrs"}</div>
          <div/>
        </div>
        {staff.map((p,pi) => (
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"220px repeat(7, 1fr) 80px 40px",
            padding:"12px 18px",borderBottom: pi<staff.length-1?"1px solid var(--line)":"none",
            gap:8,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:roleColor(p.role),
                color:"#FFF8EC",display:"grid",placeItems:"center",fontSize:11,fontWeight:700,
                letterSpacing:".04em",fontFamily:"var(--font-mono)"}}>
                {p.name.split(" ").map(s=>s[0]).slice(0,2).join("")}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:10,color:"var(--ink-3)",fontFamily:"var(--font-mono)",
                  letterSpacing:".08em",textTransform:"uppercase"}}>{roleLabel(p.role)}</div>
              </div>
            </div>
            {days.map(d => {
              const v = shifts[p.id]?.[d] || "off";
              const time = v==="off" ? "—" : `${templates[v].start}–${templates[v].end}`;
              return (
                <button key={d} onClick={()=>cycle(p.id,d)} style={{
                  padding:"7px 6px",borderRadius:8,textAlign:"left",
                  background: v==="off"?"transparent":`${SHIFT_COLOR[v]}18`,
                  border:`1px solid ${v==="off"?"var(--line)":SHIFT_COLOR[v]+"55"}`,
                  cursor:"pointer",transition:"all .15s ease"
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:6,height:6,borderRadius:"50%",
                      background: v==="off"?"var(--ink-3)":SHIFT_COLOR[v]}}/>
                    <span style={{fontSize:11,fontWeight:600,color: v==="off"?"var(--ink-3)":"var(--ink)"}}>
                      {SHIFT_LABEL[v][lang]}
                    </span>
                  </div>
                  <div style={{fontSize:9.5,fontFamily:"var(--font-mono)",
                    color:"var(--ink-3)",marginTop:2}}>{time}</div>
                </button>
              );
            })}
            <div style={{textAlign:"right",fontSize:16,fontWeight:500,
              fontFamily:"var(--font-display,'Fraunces')",letterSpacing:"-0.01em"}}>
              {totalFor(p.id)}<span style={{fontSize:11,color:"var(--ink-3)"}}>h</span>
            </div>
            <button onClick={()=>removePerson(p.id)} title={t("removeStaff")}
              style={{width:28,height:28,borderRadius:8,border:"1px solid var(--line)",
                background:"var(--card-2)",color:"var(--ink-3)",cursor:"pointer",
                display:"grid",placeItems:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(184,74,58,.1)";e.currentTarget.style.color="var(--danger)";e.currentTarget.style.borderColor="rgba(184,74,58,.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--card-2)";e.currentTarget.style.color="var(--ink-3)";e.currentTarget.style.borderColor="var(--line)";}}>
              <Icon name="trash" size={13}/>
            </button>
          </div>
        ))}
        <div style={{padding:"14px 18px",display:"flex",justifyContent:"center"}}>
          <Button variant="soft" icon="plus" onClick={()=>setAddOpen(true)}>{t("addStaff")}</Button>
        </div>
      </Card>

      <Modal open={addOpen} onClose={()=>setAddOpen(false)} width={460}
        title={t("addStaff")}
        subtitle={lang==="tr"?"Yeni personeli vardiya planına ekle.":"Add a new teammate to the schedule."}>
        <div style={{display:"grid",gap:14}}>
          <Field label={t("fullName")} required>
            <Input value={newStaff.name} onChange={e=>setNewStaff({...newStaff,name:e.target.value})}
              placeholder={lang==="tr"?"örn. Ada Yılmaz":"e.g. Ada Smith"} autoFocus/>
          </Field>
          <Field label={t("role")}>
            <Select value={newStaff.role} onChange={e=>setNewStaff({...newStaff,role:e.target.value})}>
              <option value="manager">{roleLabel("manager")}</option>
              <option value="barista">{roleLabel("barista")}</option>
              <option value="server">{roleLabel("server")}</option>
              <option value="kitchen">{roleLabel("kitchen")}</option>
            </Select>
          </Field>
        </div>
        <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setAddOpen(false)}>{t("cancel")}</Button>
          <Button variant="primary" icon="check" onClick={addPerson}>{t("save")}</Button>
        </div>
      </Modal>
    </div>
  );
};

/* ---------- STOCK ---------- */

const Stock = ({t, lang, stock, setStock}) => {
  const level = (s) => {
    const r = s.qty / Math.max(s.reorder, 0.001);
    if (r < 0.5) return "critical";
    if (r < 1.2) return "low";
    return "healthy";
  };
  const critical = stock.filter(s=>level(s)==="critical");
  const low = stock.filter(s=>level(s)==="low");
  const [filter, setFilter] = React.useState("all");
  const [editingId, setEditingId] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newItem, setNewItem] = React.useState({name:"", unit:"kg", qty:0, reorder:0, supplier:""});

  const visible = stock.filter(s => {
    if (filter==="all") return true;
    if (filter==="critical") return level(s)==="critical";
    if (filter==="low") return level(s)==="low" || level(s)==="critical";
    return true;
  });

  const toneOf = l => l==="critical"?"danger":l==="low"?"warn":"ok";
  const labelOf = l => l==="critical"?t("criticalStock"):l==="low"?t("lowStock"):t("inStock");

  const updateItem = (id, patch) => setStock(stock.map(s => s.id===id ? {...s, ...patch} : s));
  const adjust = (id, delta) => {
    const s = stock.find(x=>x.id===id);
    if (!s) return;
    updateItem(id, {qty: Math.max(0, +(s.qty+delta).toFixed(2))});
  };

  const addStockItem = () => {
    if (!newItem.name.trim()) return;
    const today = new Date().toISOString().slice(0,10);
    const id = "st" + Date.now();
    setStock([...stock, {
      id,
      name:{tr:newItem.name, en:newItem.name},
      unit:newItem.unit,
      qty:+newItem.qty || 0,
      reorder:+newItem.reorder || 0,
      supplier:newItem.supplier || "—",
      last:today,
      category:"other",
    }]);
    setNewItem({name:"", unit:"kg", qty:0, reorder:0, supplier:""});
    setAddOpen(false);
  };

  const exportPdf = () => {
    const rows = stock.map(s => {
      const l = level(s);
      const cls = l==="critical"?"danger":l==="low"?"warn":"ok";
      return `<tr>
        <td><b>${s.name[lang]}</b><div class="mono" style="font-size:10px;color:#8C7A69">${s.supplier}</div></td>
        <td class="mono">${s.qty} ${s.unit}</td>
        <td class="mono">${s.reorder} ${s.unit}</td>
        <td><span class="pill ${cls}">${labelOf(l)}</span></td>
        <td class="mono">${s.last}</td>
      </tr>`;
    }).join("");
    openPrintable("Inventory Report", `
      <div class="eyebrow">${t("nav_stock")}</div>
      <h1>${lang==="tr"?"Stok Raporu":"Inventory Report"}</h1>
      <div class="sub">Aleg Karaköy · ${new Date().toLocaleDateString(lang==="tr"?"tr-TR":"en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
      <div class="row" style="margin-bottom:16px">
        <div><span class="pill danger">${t("criticalStock")}</span> <b>${critical.length}</b></div>
        <div><span class="pill warn">${t("lowStock")}</span> <b>${low.length}</b></div>
        <div><span class="pill ok">${t("inStock")}</span> <b>${stock.length - critical.length - low.length}</b></div>
      </div>
      <table><thead><tr>
        <th>${lang==="tr"?"Malzeme":"Item"}</th><th>${t("quantity")}</th>
        <th>${t("reorderPoint")}</th><th>${t("status")}</th><th>${t("lastReceived")}</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="footer"><span>Aleg Menu · menu.aleg.cafe</span><span>${stock.length} ${lang==="tr"?"kalem":"items"}</span></div>
    `);
  };

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_stock")}
        title={lang==="tr"?"Stok & Envanter":"Stock & Inventory"}
        sub={lang==="tr"?"Yeniden sipariş noktasını hücrelere tıklayarak düzenle; yeni malzeme ekle ve raporu PDF olarak al.":"Click a reorder cell to edit it, add new items, and export the full report as PDF."}
        actions={<>
          <Button variant="soft" icon="plus" onClick={()=>setAddOpen(true)}>{t("addItem")}</Button>
          <Button variant="primary" icon="download" onClick={exportPdf}>{t("downloadPdf")}</Button>
        </>}
      />

      {critical.length>0 && <div style={{
        padding:"12px 16px",borderRadius:12,background:"rgba(184,74,58,.08)",
        border:"1px solid rgba(184,74,58,.25)",display:"flex",alignItems:"center",gap:12
      }}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"var(--danger)",
          color:"#FFF8EC",display:"grid",placeItems:"center"}}><Icon name="bell" size={18}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--danger)"}}>
            {lang==="tr"?`${critical.length} kalem kritik seviyede`:`${critical.length} items at critical level`}
          </div>
          <div style={{fontSize:11.5,color:"var(--ink-2)",marginTop:2}}>
            {critical.slice(0,3).map(s=>s.name[lang]).join(" · ")}
            {critical.length>3 && ` +${critical.length-3} ${lang==="tr"?"daha":"more"}`}
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={()=>setFilter("critical")}>
          {lang==="tr"?"Listele":"View"}
        </Button>
      </div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[
          {key:"critical", label:t("criticalStock"), val:critical.length, tone:"danger"},
          {key:"low",      label:t("lowStock"),      val:low.length,      tone:"warn"},
          {key:"healthy",  label:t("inStock"),       val:stock.length-critical.length-low.length, tone:"ok"},
        ].map(s => (
          <Card key={s.key} pad={16}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div>
                <Pill tone={s.tone}>{s.label}</Pill>
                <div style={{fontSize:34,fontWeight:500,letterSpacing:"-0.025em",marginTop:8,
                  fontFamily:"var(--font-display,'Fraunces')"}}>{s.val}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card pad={0}>
        <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid var(--line)"}}>
          <Tabs tabs={[
            {id:"all", label: lang==="tr"?"Hepsi":"All"},
            {id:"low", label: lang==="tr"?"Azalanlar":"Low"},
            {id:"critical", label: t("criticalStock")},
          ]} active={filter} onChange={setFilter}/>
          <div style={{marginLeft:"auto",fontSize:11,color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>
            {visible.length} {lang==="tr"?"kalem":"items"}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr .7fr .9fr .7fr .7fr .6fr",
          padding:"10px 18px",fontSize:10.5,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
          letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,
          borderBottom:"1px solid var(--line)"}}>
          <div>{lang==="tr"?"Malzeme":"Item"}</div>
          <div>{t("quantity")}</div>
          <div>{t("reorderPoint")}</div>
          <div>{t("unit")}</div>
          <div>{t("status")}</div>
          <div style={{textAlign:"right"}}>{lang==="tr"?"Ayarla":"Adjust"}</div>
        </div>
        {visible.map((s,i) => {
          const l = level(s);
          const r = Math.min(1, s.qty / Math.max(s.reorder*1.5, 1));
          const color = l==="critical"?"var(--danger)":l==="low"?"var(--warn)":"var(--ok)";
          const editing = editingId===s.id;
          return (
            <div key={s.id} style={{display:"grid",gridTemplateColumns:"1.4fr .7fr .9fr .7fr .7fr .6fr",
              padding:"14px 18px",borderBottom: i<visible.length-1?"1px solid var(--line)":"none",
              alignItems:"center",gap:10}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:600,letterSpacing:"-0.005em"}}>{s.name[lang]}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",marginTop:2}}>{s.supplier}</div>
                <div style={{height:4,marginTop:8,background:"var(--paper-3)",borderRadius:2,
                  position:"relative",overflow:"hidden",width:"80%"}}>
                  <div style={{position:"absolute",inset:0,width:`${r*100}%`,background:color,
                    borderRadius:2}}/>
                </div>
              </div>
              <div style={{fontSize:16,fontWeight:500,fontFamily:"var(--font-display,'Fraunces')",
                letterSpacing:"-0.015em"}}>{s.qty}<span style={{fontSize:11,color:"var(--ink-3)",marginLeft:2}}>{s.unit}</span></div>
              {editing ? (
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input type="number" step="0.1" value={s.reorder}
                    onChange={e=>updateItem(s.id,{reorder: +e.target.value || 0})}
                    onBlur={()=>setEditingId(null)}
                    onKeyDown={e=>{if(e.key==="Enter")setEditingId(null);}}
                    autoFocus
                    style={{width:70,padding:"6px 8px",borderRadius:7,border:"1.5px solid var(--accent)",
                      background:"var(--card)",fontSize:13,fontFamily:"var(--font-mono)"}}/>
                  <span style={{fontSize:11,color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>{s.unit}</span>
                </div>
              ) : (
                <button onClick={()=>setEditingId(s.id)} style={{
                  padding:"6px 10px",borderRadius:7,border:"1px dashed var(--line-2)",
                  background:"transparent",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,
                  fontSize:13,color:"var(--ink-2)",fontFamily:"var(--font-mono)"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.background="var(--accent-soft)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--line-2)";e.currentTarget.style.background="transparent";}}>
                  {s.reorder} {s.unit}
                  <Icon name="edit" size={10} stroke="var(--ink-3)"/>
                </button>
              )}
              <select value={s.unit} onChange={e=>updateItem(s.id,{unit:e.target.value})}
                style={{padding:"6px 8px",borderRadius:7,border:"1px solid var(--line)",
                  background:"var(--card)",fontSize:12,fontFamily:"var(--font-mono)",
                  color:"var(--ink)",cursor:"pointer"}}>
                {STOCK_UNITS.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
              </select>
              <div><Pill tone={toneOf(l)}>{labelOf(l)}</Pill></div>
              <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                <button onClick={()=>adjust(s.id,-1)} style={{width:28,height:28,borderRadius:8,
                  border:"1px solid var(--line)",background:"var(--card-2)",color:"var(--ink-2)",fontSize:14,cursor:"pointer"}}>–</button>
                <button onClick={()=>adjust(s.id,+1)} style={{width:28,height:28,borderRadius:8,
                  border:"1px solid var(--accent)",background:"var(--accent)",color:"#FFF8EC",fontSize:14,fontWeight:600,cursor:"pointer"}}>+</button>
              </div>
            </div>
          );
        })}
      </Card>

      <Modal open={addOpen} onClose={()=>setAddOpen(false)} width={520}
        title={t("addItem")}
        subtitle={lang==="tr"?"Stoğa yeni bir malzeme ekle.":"Add a new item to inventory."}>
        <div style={{display:"grid",gap:14}}>
          <Field label={lang==="tr"?"Malzeme adı":"Item name"} required>
            <Input value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}
              placeholder={lang==="tr"?"örn. Badem sütü":"e.g. Almond milk"} autoFocus/>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <Field label={t("unit")}>
              <Select value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})}>
                {STOCK_UNITS.map(u => (
                  <option key={u.id} value={u.id}>{u.label[lang]}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("quantity")}>
              <Input type="number" step="0.1" value={newItem.qty}
                onChange={e=>setNewItem({...newItem,qty:e.target.value})} placeholder="0"/>
            </Field>
            <Field label={t("reorderPoint")}>
              <Input type="number" step="0.1" value={newItem.reorder}
                onChange={e=>setNewItem({...newItem,reorder:e.target.value})} placeholder="0"/>
            </Field>
          </div>
          <Field label={t("supplier")}>
            <Input value={newItem.supplier} onChange={e=>setNewItem({...newItem,supplier:e.target.value})}
              placeholder={lang==="tr"?"örn. Kronotrop":"e.g. Kronotrop"}/>
          </Field>
        </div>
        <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setAddOpen(false)}>{t("cancel")}</Button>
          <Button variant="primary" icon="check" onClick={addStockItem}>{t("save")}</Button>
        </div>
      </Modal>
    </div>
  );
};

/* ---------- RECEIPT DESIGNER ---------- */

const ReceiptPreview = ({cfg, order, lang, logoSrc, serviceFee}) => {
  const pad = cfg.density==="compact" ? 10 : 14;
  const serviceAmt = Math.round(order.total*serviceFee/100);
  const total = cfg.showService ? order.total + serviceAmt : order.total;
  return (
    <div style={{
      width:280, minHeight:420, background:"#FFFCF4", color:"#1E1612",
      fontFamily: cfg.font==="mono" ? "ui-monospace, Menlo, monospace" : "ui-sans-serif, system-ui",
      padding: pad, border:"1px dashed #C5B79C",
      boxShadow:"0 1px 0 rgba(0,0,0,.04), 0 20px 40px rgba(42,31,24,.15)",
      clipPath:"polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))",
      position:"relative"
    }}>
      <div style={{position:"absolute",top:-1,left:0,right:0,height:6,
        background:"repeating-linear-gradient(90deg,#FFFCF4 0,#FFFCF4 6px,transparent 6px,transparent 10px)"}}/>
      <div style={{textAlign:"center",padding:"6px 0 10px",borderBottom:"1px dashed #C5B79C"}}>
        {cfg.showLogo && logoSrc && <img src={logoSrc} alt="" style={{height:40,marginBottom:6}}/>}
        {cfg.showLogo && !logoSrc && <div style={{fontSize:24,fontFamily:"var(--font-display)",
          fontStyle:"italic",fontWeight:500,letterSpacing:"-0.02em"}}>Aleg</div>}
        {cfg.showTagline && <div style={{fontSize:9.5,letterSpacing:".2em",textTransform:"uppercase",
          fontFamily:"ui-monospace, Menlo, monospace",marginTop:2,opacity:.7}}>
          {cfg.tagline || "EST. 2021 · KARAKÖY"}
        </div>}
        {cfg.showAddr && <div style={{fontSize:10,marginTop:6,opacity:.65,lineHeight:1.4}}>
          Kemankeş Mah., Karaköy · +90 212 000 00 00
        </div>}
      </div>
      <div style={{padding:"8px 0",fontSize:10.5,fontFamily:"ui-monospace, Menlo, monospace",
        display:"flex",justifyContent:"space-between",opacity:.7}}>
        <span>{order.id}</span>
        <span>{lang==="tr"?"Masa":"Table"} {order.table}</span>
      </div>
      <div style={{fontSize:10.5,fontFamily:"ui-monospace, Menlo, monospace",
        display:"flex",justifyContent:"space-between",opacity:.7,paddingBottom:8,
        borderBottom:"1px dashed #C5B79C"}}>
        <span>2026-04-18 14:32</span>
        <span>{lang==="tr"?"Garson":"Server"}: Emre T.</span>
      </div>
      <div style={{padding:"10px 0",display:"grid",gap:6}}>
        {order.items.map((it,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:8,fontSize:12}}>
            <span style={{fontFamily:"ui-monospace, Menlo, monospace",fontWeight:600,width:22}}>{it.qty}×</span>
            <span>{it.name[lang]}</span>
            <span style={{fontFamily:"ui-monospace, Menlo, monospace"}}>₺{it.price*it.qty}</span>
          </div>
        ))}
      </div>
      <div style={{paddingTop:8,borderTop:"1px dashed #C5B79C",display:"grid",gap:3,fontSize:11.5}}>
        <div style={{display:"flex",justifyContent:"space-between",opacity:.7}}>
          <span>{lang==="tr"?"Ara toplam":"Subtotal"}</span>
          <span style={{fontFamily:"ui-monospace, Menlo, monospace"}}>₺{order.total}</span>
        </div>
        {cfg.showService && <div style={{display:"flex",justifyContent:"space-between",opacity:.7}}>
          <span>{lang==="tr"?`Servis (%${serviceFee})`:`Service (${serviceFee}%)`}</span>
          <span style={{fontFamily:"ui-monospace, Menlo, monospace"}}>₺{serviceAmt}</span>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,
          marginTop:6,paddingTop:6,borderTop:"1px solid #1E1612"}}>
          <span>{lang==="tr"?"TOPLAM":"TOTAL"}</span>
          <span style={{fontFamily:"ui-monospace, Menlo, monospace"}}>₺{total}</span>
        </div>
      </div>
      {cfg.showQr && <div style={{textAlign:"center",padding:"14px 0 6px"}}>
        <div style={{width:78,height:78,margin:"0 auto",padding:6,border:"1px solid #1E1612",
          background:"#FFFCF4",display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:0}}>
          {Array.from({length:81}).map((_,i)=>{
            const on = (i*7 + (i%5) + (i%3)) % 2 === 0 || i<9 || i>71 || i%9===0 || i%9===8;
            return <div key={i} style={{background:on?"#1E1612":"transparent"}}/>;
          })}
        </div>
        <div style={{fontSize:9.5,fontFamily:"ui-monospace, Menlo, monospace",
          marginTop:6,opacity:.6,letterSpacing:".1em"}}>
          {lang==="tr"?"DEĞERLENDIR":"SCAN TO REVIEW"}
        </div>
      </div>}
      {cfg.footerMsg && <div style={{textAlign:"center",fontSize:10.5,opacity:.7,
        padding:"8px 0 2px",fontStyle:"italic"}}>{cfg.footerMsg}</div>}
    </div>
  );
};

const ReceiptDesigner = ({t, lang, orders, logoSrc, serviceFee, setServiceFee}) => {
  const [cfg, setCfg] = React.useState({
    showLogo:true, showTagline:true, showAddr:true, showService:true,
    showQr:true, tagline: lang==="tr"?"EST. 2021 · KARAKÖY":"EST. 2021 · KARAKÖY",
    footerMsg: lang==="tr"?"Ziyaretiniz için teşekkür ederiz!":"Thanks for visiting Aleg!",
    font:"sans", density:"comfortable"
  });
  const sampleOrder = orders[1] || orders[0];

  const set = (k,v) => setCfg(c => ({...c, [k]:v}));

  const printTest = () => {
    const items = sampleOrder.items.map(it =>
      `<div class="row"><span><span class="mono">${it.qty}×</span> ${it.name[lang]}</span>
       <span class="mono">₺${it.price*it.qty}</span></div>`).join("");
    const serviceAmt = Math.round(sampleOrder.total*serviceFee/100);
    const total = cfg.showService ? sampleOrder.total + serviceAmt : sampleOrder.total;
    openPrintable("Receipt — Test print", `
      <div style="max-width:320px;margin:0 auto;padding:20px;background:#FFFCF4;
        font-family:ui-${cfg.font==="mono"?"monospace":"sans-serif"}, system-ui;">
        <div style="text-align:center;padding-bottom:10px;border-bottom:1px dashed #C5B79C;">
          ${cfg.showLogo && logoSrc ? `<img src="${logoSrc}" style="height:40px"/>` :
            `<div style="font-family:'Fraunces',serif;font-style:italic;font-size:28px;">Aleg</div>`}
          ${cfg.showTagline?`<div class="mono" style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.7;margin-top:4px">${cfg.tagline}</div>`:""}
          ${cfg.showAddr?`<div style="font-size:11px;opacity:.6;margin-top:6px">Kemankeş Mah., Karaköy</div>`:""}
        </div>
        <div style="padding:8px 0;font-size:11px;opacity:.7;" class="mono">
          <div class="row"><span>${sampleOrder.id}</span><span>${lang==="tr"?"Masa":"Table"} ${sampleOrder.table}</span></div>
        </div>
        <div style="padding:8px 0;border-top:1px dashed #C5B79C;border-bottom:1px dashed #C5B79C">${items}</div>
        <div style="padding-top:8px">
          <div class="row" style="font-size:12px;opacity:.7"><span>${lang==="tr"?"Ara toplam":"Subtotal"}</span><span class="mono">₺${sampleOrder.total}</span></div>
          ${cfg.showService?`<div class="row" style="font-size:12px;opacity:.7"><span>${lang==="tr"?`Servis (%${serviceFee})`:`Service (${serviceFee}%)`}</span><span class="mono">₺${serviceAmt}</span></div>`:""}
          <div class="row" style="font-size:16px;font-weight:700;margin-top:6px;padding-top:6px;border-top:1px solid #1E1612"><span>${lang==="tr"?"TOPLAM":"TOTAL"}</span><span class="mono">₺${total}</span></div>
        </div>
        ${cfg.footerMsg?`<div style="text-align:center;font-style:italic;font-size:11px;opacity:.7;padding-top:12px">${cfg.footerMsg}</div>`:""}
      </div>
    `);
  };

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_receipt")}
        title={t("receiptDesigner")}
        sub={lang==="tr"?"Siparişle birlikte yazıcıya gönderilecek fişin görünümünü ayarla.":"Design the receipt printed when each order is placed."}
        actions={<Button variant="primary" icon="printer" onClick={printTest}>{t("printTest")}</Button>}
      />
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:24}}>
        <Card>
          <div style={{display:"grid",gap:14}}>
            <Field label={lang==="tr"?"İçerik":"Content"}>
              <div style={{display:"grid",gap:8}}>
                {[
                  {k:"showLogo", tr:"Logoyu göster", en:"Show logo"},
                  {k:"showTagline", tr:"Alt başlık", en:"Tagline"},
                  {k:"showAddr", tr:"Adres / Telefon", en:"Address / Phone"},
                  {k:"showService", tr:"Servis bedeli", en:"Service charge"},
                  {k:"showQr", tr:"Değerlendirme QR'ı", en:"Review QR code"},
                ].map(o => (
                  <div key={o.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"10px 12px",borderRadius:10,background:"var(--paper-2)",
                    border:"1px solid var(--line)"}}>
                    <span style={{fontSize:13}}>{o[lang]}</span>
                    <Toggle on={cfg[o.k]} onChange={(v)=>set(o.k,v)}/>
                  </div>
                ))}
              </div>
            </Field>

            {/* Service fee — editable */}
            <Field label={t("serviceFee")} hint={lang==="tr"?"Fişte ve hesap toplamında kullanılır.":"Applied to receipts and order totals."}>
              <div style={{display:"flex",alignItems:"stretch",gap:0,
                border:`1.5px solid ${cfg.showService?"var(--accent)":"var(--line)"}`,
                borderRadius:10,overflow:"hidden",
                background:cfg.showService?"var(--card)":"var(--paper-2)",
                opacity:cfg.showService?1:.55,transition:"all .15s"}}>
                <input type="number" min="0" max="30" step="0.5" value={serviceFee}
                  disabled={!cfg.showService}
                  onChange={e=>setServiceFee(Math.max(0, Math.min(30, +e.target.value || 0)))}
                  style={{flex:1,padding:"12px 14px",border:"none",outline:"none",
                    fontSize:15,fontWeight:600,fontFamily:"var(--font-mono)",
                    background:"transparent",color:"var(--ink)"}}/>
                <div style={{padding:"0 16px",display:"grid",placeItems:"center",
                  background:"var(--paper-2)",borderLeft:"1px solid var(--line)",
                  fontSize:14,fontWeight:600,color:"var(--ink-2)",
                  fontFamily:"var(--font-mono)"}}>%</div>
              </div>
              <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                {[0, 5, 10, 12, 15].map(v => (
                  <button key={v} onClick={()=>setServiceFee(v)} disabled={!cfg.showService}
                    style={{padding:"5px 10px",borderRadius:7,fontSize:11.5,fontWeight:600,
                      fontFamily:"var(--font-mono)",cursor:cfg.showService?"pointer":"not-allowed",
                      background: serviceFee===v?"var(--accent)":"var(--paper-2)",
                      color: serviceFee===v?"#FFF8EC":"var(--ink-2)",
                      border:`1px solid ${serviceFee===v?"var(--accent)":"var(--line)"}`,
                      opacity:cfg.showService?1:.5}}>%{v}</button>
                ))}
              </div>
            </Field>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field label={lang==="tr"?"Alt başlık":"Tagline"}>
                <Input value={cfg.tagline} onChange={e=>set("tagline",e.target.value)}/>
              </Field>
              <Field label={lang==="tr"?"Teşekkür mesajı":"Footer message"}>
                <Input value={cfg.footerMsg} onChange={e=>set("footerMsg",e.target.value)}/>
              </Field>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field label={lang==="tr"?"Yazı tipi":"Font"}>
                <Tabs tabs={[
                  {id:"sans",label:lang==="tr"?"Sade":"Sans"},
                  {id:"mono",label:"Mono"},
                ]} active={cfg.font} onChange={v=>set("font",v)}/>
              </Field>
              <Field label={t("density")}>
                <Tabs tabs={[
                  {id:"comfortable",label:t("comfortable")},
                  {id:"compact",label:t("compact")},
                ]} active={cfg.density} onChange={v=>set("density",v)}/>
              </Field>
            </div>
            <div style={{padding:"14px 16px",borderRadius:12,background:"var(--paper-2)",
              border:"1px solid var(--line)",display:"flex",gap:12,alignItems:"center"}}>
              <Icon name="printer" size={20} stroke="var(--accent)"/>
              <div style={{flex:1,fontSize:12,color:"var(--ink-2)",lineHeight:1.5}}>
                {lang==="tr"
                  ? "Her sipariş, ürüne göre mutfağa ya da bara otomatik yazdırılır. Yazıcılar Ayarlar › Donanım'dan bağlanır."
                  : "Each order auto-prints to kitchen or bar based on item routing. Configure printers in Settings › Hardware."}
              </div>
            </div>
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
            color:"var(--accent)",textTransform:"uppercase",fontWeight:500,alignSelf:"flex-start"}}>
            {t("receiptPreview")}
          </div>
          <ReceiptPreview cfg={cfg} order={sampleOrder} lang={lang} logoSrc={logoSrc} serviceFee={serviceFee}/>
        </div>
      </div>
    </div>
  );
};

/* ---------- BRAND ---------- */

const BRAND_PRESETS = [
  {id:"espresso", name:{tr:"Espresso", en:"Espresso"},  accent:"#C4553A", ink:"#2A1F18", paper:"#FFFCF4"},
  {id:"matcha",   name:{tr:"Matcha",   en:"Matcha"},    accent:"#6B7A4B", ink:"#1F2A1C", paper:"#FAFCEF"},
  {id:"midnight", name:{tr:"Gece",     en:"Midnight"},  accent:"#D4A645", ink:"#14171F", paper:"#F8F6F0"},
  {id:"rose",     name:{tr:"Gül",      en:"Rose"},      accent:"#B83A5E", ink:"#2A1A22", paper:"#FFF5F3"},
  {id:"ocean",    name:{tr:"Okyanus",  en:"Ocean"},     accent:"#2E5B7A", ink:"#0F2230", paper:"#F1F7FB"},
  {id:"hazel",    name:{tr:"Fındık",   en:"Hazel"},     accent:"#8A5A2B", ink:"#2A1F14", paper:"#FDF8EE"},
];

const TYPE_PRESETS = [
  {id:"fraunces", name:"Fraunces + Geist",    display:"'Fraunces', serif",   displayStyle:"italic", body:"'Fraunces', system-ui"},
  {id:"playfair", name:"Playfair + Inter",    display:"'Playfair Display', serif", displayStyle:"normal", body:"'Inter', system-ui"},
  {id:"dmserif",  name:"DM Serif + DM Sans",  display:"'DM Serif Display', serif", displayStyle:"normal", body:"'DM Sans', system-ui"},
  {id:"mono",     name:"Geist Mono + Geist",  display:"'DM Mono', ui-monospace, monospace", displayStyle:"normal", body:"'Fraunces', system-ui"},
];

const APP_COPY_FIELDS = [
  {k:"heroTitle",        tr:"Ana başlık",          en:"Hero title",            hint:{tr:"“Ne içersin?” yerine.", en:"Replaces \"What'll it be?\""}, max:36, size:"large"},
  {k:"heroSubtitle",     tr:"Karşılama",           en:"Greeting",              hint:{tr:"Başlığın üstünde küçük yazı.", en:"Small line above the hero."}, max:40},
  {k:"locationLabel",    tr:"Konum etiketi",       en:"Location label",        hint:{tr:"Üstteki nokta + metin.", en:"Top dot + text."}, max:32},
  {k:"searchPlaceholder",tr:"Arama placeholder",   en:"Search placeholder",    max:32},
  {k:"modeDineIn",       tr:"Mod: Masada",         en:"Mode: Dine-in",         max:14, short:true},
  {k:"modePickup",       tr:"Mod: Al götür",       en:"Mode: Pickup",          max:14, short:true},
  {k:"modeDelivery",     tr:"Mod: Paket",          en:"Mode: Delivery",        max:14, short:true},
  {k:"featuredLabel",    tr:"Öne çıkanlar başlığı",en:"Featured label",        max:20, short:true},
  {k:"loyaltyNudge",     tr:"Sadakat dürtmesi",    en:"Loyalty nudge",         hint:{tr:"“…puan sonra ücretsiz kahve”", en:"\"…pts to free coffee\""}, max:36},
  {k:"emptyCartTitle",   tr:"Boş sepet · başlık",  en:"Empty cart title",      max:30},
  {k:"emptyCartSub",     tr:"Boş sepet · alt",     en:"Empty cart subtitle",   max:60},
  {k:"checkoutCta",      tr:"Siparişi onayla CTA", en:"Checkout CTA",          max:24, short:true},
  {k:"trackerTitleLive", tr:"Takip · yolda",       en:"Tracker · live",        max:36},
  {k:"trackerTitleDone", tr:"Takip · teslim",      en:"Tracker · delivered",   max:36},
  {k:"reviewThanks",     tr:"Teşekkür başlığı",    en:"Thank-you headline",    max:30},
  {k:"reviewBonus",      tr:"Teşekkür bonusu",     en:"Thank-you bonus line",  max:40},
  {k:"welcomeTitle",     tr:"Üyelik · başlık",     en:"Signup · title",        max:36, size:"large"},
  {k:"welcomeSub",       tr:"Üyelik · alt",        en:"Signup · subtitle",     max:80},
];

const AppCustomizer = ({lang, appConfig={}, setAppConfig, appConfigDefaults={}}) => {
  const [panel, setPanel] = React.useState("copy");
  const fileRef = React.useRef();
  const val = (k, l) => {
    const v = appConfig[k];
    if (v && typeof v === "object") return v[l] || "";
    return "";
  };
  const setOne = (k, l, next) => {
    setAppConfig({
      ...appConfig,
      [k]: { ...(appConfig[k] && typeof appConfig[k]==="object"?appConfig[k]:{}), [l]: next }
    });
  };
  const resetOne = (k) => {
    setAppConfig({...appConfig, [k]: appConfigDefaults[k]});
  };
  const resetAll = () => {
    if (!confirm(lang==="tr"?"Tüm metinler sıfırlansın mı?":"Reset all app copy to defaults?")) return;
    setAppConfig(appConfigDefaults);
  };
  const handleFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => setAppConfig({...appConfig, heroImage:e.target.result, showHeroImage:true});
    r.readAsDataURL(file);
  };

  const panels = [
    {id:"copy",  label: lang==="tr"?"Metinler":"Copy",      icon:"menu"},
    {id:"image", label: lang==="tr"?"Görseller":"Imagery",  icon:"image"},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:20}}>
      <Card>
        {/* Sub-panel tabs */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",gap:4,padding:3,background:"var(--paper-2)",
            border:"1px solid var(--line)",borderRadius:10}}>
            {panels.map(p=>(
              <button key={p.id} onClick={()=>setPanel(p.id)} style={{
                padding:"6px 12px", fontSize:12, fontWeight:500, borderRadius:7,
                background: panel===p.id?"var(--card)":"transparent",
                color: panel===p.id?"var(--ink)":"var(--ink-3)",
                display:"inline-flex", alignItems:"center", gap:6,
                boxShadow: panel===p.id?"0 1px 2px rgba(42,31,24,.06)":"none"
              }}>
                <Icon name={p.icon} size={13}/>{p.label}
              </button>
            ))}
          </div>
          <button onClick={resetAll} style={{
            padding:"6px 10px", fontSize:11, color:"var(--ink-3)", fontWeight:500,
            display:"inline-flex",alignItems:"center",gap:5
          }}>
            <Icon name="refresh" size={12}/>
            {lang==="tr"?"Tümünü sıfırla":"Reset all"}
          </button>
        </div>

        {panel==="copy" && (
          <div style={{display:"grid",gap:12,maxHeight:640,overflowY:"auto",paddingRight:4}}>
            {APP_COPY_FIELDS.map(f => {
              const trVal = val(f.k, "tr");
              const enVal = val(f.k, "en");
              const defTr = appConfigDefaults[f.k]?.tr || "";
              const defEn = appConfigDefaults[f.k]?.en || "";
              const changed = trVal !== defTr || enVal !== defEn;
              return (
                <div key={f.k} style={{padding:"12px 12px",borderRadius:10,
                  border:`1px solid ${changed?"var(--accent)":"var(--line)"}`,
                  background: changed?"var(--card-2)":"var(--card)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",
                    marginBottom:8,gap:10}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--ink)",
                        display:"flex",alignItems:"center",gap:6}}>
                        {f[lang]}
                        {changed && <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,
                          background:"var(--accent)",color:"#FFF8EC",fontWeight:700,
                          letterSpacing:".1em"}}>
                          {lang==="tr"?"DÜZENLENDİ":"EDITED"}
                        </span>}
                      </div>
                      {f.hint && <div style={{fontSize:10.5,color:"var(--ink-3)",marginTop:2,
                        lineHeight:1.4}}>{f.hint[lang]}</div>}
                    </div>
                    {changed && (
                      <button onClick={()=>resetOne(f.k)} style={{
                        fontSize:10, color:"var(--ink-3)", display:"inline-flex",
                        alignItems:"center", gap:4, fontWeight:500, flexShrink:0
                      }}>
                        <Icon name="refresh" size={10}/>
                        {lang==="tr"?"Sıfırla":"Reset"}
                      </button>
                    )}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {["tr","en"].map(l => (
                      <div key={l}>
                        <div style={{fontSize:9.5,fontFamily:"var(--font-mono)",
                          letterSpacing:".1em",color:"var(--ink-3)",textTransform:"uppercase",
                          fontWeight:600,marginBottom:3}}>
                          {l==="tr"?"Türkçe":"English"}
                        </div>
                        <input
                          value={val(f.k, l)}
                          maxLength={f.max}
                          placeholder={appConfigDefaults[f.k]?.[l] || ""}
                          onChange={e=>setOne(f.k, l, e.target.value)}
                          style={{
                            width:"100%", padding:"8px 10px", borderRadius:7,
                            border:"1px solid var(--line)", background:"var(--card-2)",
                            color:"var(--ink)", fontSize: f.size==="large"?14:12.5,
                            fontWeight: f.size==="large"?500:400,
                            outline:"none", fontFamily:"inherit"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {panel==="image" && (
          <div style={{display:"grid",gap:16}}>
            <Field label={lang==="tr"?"Kapak görseli":"Hero image"}
              hint={lang==="tr"?"Ana sayfada arama çubuğunun altında görünür. 16:9 önerilir.":"Shown on home below the search bar. 16:9 recommended."}>
              <div
                onClick={()=>fileRef.current?.click()}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault(); handleFile(e.dataTransfer.files[0]);}}
                style={{
                  padding: appConfig.heroImage ? 0 : 24,
                  borderRadius:12,
                  border: appConfig.heroImage ? "1px solid var(--line)" : "1.5px dashed var(--line-2)",
                  background:"var(--paper-2)",
                  textAlign:"center",
                  cursor:"pointer",
                  minHeight: appConfig.heroImage ? 0 : 140,
                  display:"flex",flexDirection:"column",alignItems:"center",
                  justifyContent:"center",gap:8,
                  overflow:"hidden"
                }}>
                {appConfig.heroImage ? (
                  <img src={appConfig.heroImage} alt=""
                    style={{width:"100%",height:160,objectFit:"cover",display:"block"}}/>
                ) : (
                  <>
                    <div style={{width:48,height:48,borderRadius:12,background:"var(--card-2)",
                      border:"1px solid var(--line)",display:"grid",placeItems:"center"}}>
                      <Icon name="image" size={22} stroke="var(--ink-3)"/>
                    </div>
                    <div style={{fontSize:13,fontWeight:600}}>
                      {lang==="tr"?"Görsel yükle":"Upload image"}
                    </div>
                    <div style={{fontSize:11,color:"var(--ink-3)"}}>
                      {lang==="tr"?"Tıkla veya sürükle bırak":"Click or drag & drop"}
                    </div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>handleFile(e.target.files[0])}/>
              </div>
            </Field>
            {appConfig.heroImage && (
              <>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 12px",background:"var(--card)",border:"1px solid var(--line)",
                  borderRadius:10}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>
                      {lang==="tr"?"Görseli göster":"Show image"}
                    </div>
                    <div style={{fontSize:10.5,color:"var(--ink-3)",marginTop:2}}>
                      {lang==="tr"?"Mobil uygulama ana sayfasında":"On the home screen"}
                    </div>
                  </div>
                  <Toggle on={!!appConfig.showHeroImage}
                    onChange={v=>setAppConfig({...appConfig, showHeroImage:v})}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Button variant="soft" icon="refresh" onClick={()=>fileRef.current?.click()}>
                    {lang==="tr"?"Değiştir":"Replace"}
                  </Button>
                  <Button variant="danger" icon="trash"
                    onClick={()=>setAppConfig({...appConfig, heroImage:null, showHeroImage:false})}>
                    {lang==="tr"?"Kaldır":"Remove"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Preview column */}
      <Card>
        <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
          color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:14,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{lang==="tr"?"Canlı Önizleme":"Live Preview"}</span>
          <span style={{color:"var(--ink-3)",fontSize:9}}>
            {lang==="tr"?"Sağ panelde telefon":"Phone in right panel"}
          </span>
        </div>

        {/* Quick overview of changed fields */}
        <div style={{display:"grid",gap:6}}>
          {APP_COPY_FIELDS.filter(f => {
            const cur = appConfig[f.k];
            const def = appConfigDefaults[f.k];
            return cur && typeof cur==="object" && def && typeof def==="object" &&
              (cur.tr !== def.tr || cur.en !== def.en);
          }).map(f => (
            <div key={f.k} style={{padding:"10px 12px",background:"var(--card-2)",
              border:"1px solid var(--line)",borderRadius:8,
              display:"grid",gridTemplateColumns:"auto 1fr",gap:10,alignItems:"baseline"}}>
              <span style={{fontSize:9.5,fontFamily:"var(--font-mono)",letterSpacing:".1em",
                color:"var(--ink-3)",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>
                {f[lang]}
              </span>
              <span style={{fontSize:12,color:"var(--ink)",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                “{val(f.k, lang) || (appConfigDefaults[f.k]?.[lang] || "")}”
              </span>
            </div>
          ))}
          {(() => {
            const changedCount = APP_COPY_FIELDS.filter(f => {
              const cur = appConfig[f.k], def = appConfigDefaults[f.k];
              return cur && def && typeof cur==="object" && typeof def==="object" &&
                (cur.tr !== def.tr || cur.en !== def.en);
            }).length;
            if (changedCount === 0) return (
              <div style={{padding:"24px 20px", textAlign:"center", color:"var(--ink-3)",
                fontSize:12, background:"var(--paper-2)", borderRadius:10,
                border:"1px dashed var(--line-2)"}}>
                <Icon name="sparkle" size={20} stroke="var(--ink-3)"
                  style={{opacity:.4, marginBottom:6, display:"inline-block"}}/>
                <div>{lang==="tr"?"Henüz özelleştirme yok.":"No customisations yet."}</div>
                <div style={{fontSize:10.5,marginTop:4,opacity:.8}}>
                  {lang==="tr"?"Solda ne istersen değiştir.":"Edit anything on the left."}
                </div>
              </div>
            );
            return null;
          })()}
        </div>

        {/* Inline phone preview of the home hero, so changes are visible here too */}
        <div style={{marginTop:20,padding:"18px 16px 16px",borderRadius:14,
          background:"var(--paper-2)", border:"1px solid var(--line)"}}>
          <div style={{fontSize:9.5,fontFamily:"var(--font-mono)",letterSpacing:".14em",
            color:"var(--ink-3)",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>
            {lang==="tr"?"Mini Önizleme · Ana Sayfa":"Mini Preview · Home"}
          </div>
          <div style={{padding:"10px 14px",background:"var(--card)", borderRadius:12,
            border:"1px solid var(--line)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"var(--ok)"}}/>
              <span style={{fontSize:9,fontFamily:"var(--font-mono)",letterSpacing:".14em",
                color:"var(--ink-3)",fontWeight:600,textTransform:"uppercase"}}>
                {val("locationLabel", lang) || appConfigDefaults.locationLabel?.[lang]}
              </span>
            </div>
            <div style={{fontSize:11,color:"var(--ink-3)",marginTop:4}}>
              {val("heroSubtitle", lang) || appConfigDefaults.heroSubtitle?.[lang]}
            </div>
            <div style={{fontSize:20,fontWeight:500,letterSpacing:"-0.025em",
              fontFamily:"var(--font-display)",fontStyle:"italic",lineHeight:1.15,
              color:"var(--ink)",marginTop:2}}>
              {val("heroTitle", lang) || appConfigDefaults.heroTitle?.[lang]}
            </div>
            {appConfig.showHeroImage && appConfig.heroImage && (
              <div style={{marginTop:10,height:72,borderRadius:10,overflow:"hidden"}}>
                <img src={appConfig.heroImage} alt=""
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const Brand = ({t, lang, logoSrc, setLogoSrc, appConfig={}, setAppConfig, appConfigDefaults={}}) => {
  const [name, setName] = React.useState("Aleg");
  const [tagTr, setTagTr] = React.useState("Karaköy'ün üçüncü nesil kahvecisi");
  const [tagEn, setTagEn] = React.useState("Third-wave coffee in Karaköy");
  const [accent, setAccent] = React.useState("#C4553A");
  const [ink, setInk] = React.useState("#2A1F18");
  const [paper, setPaper] = React.useState("#FFFCF4");
  const [typeId, setTypeId] = React.useState("fraunces");
  const [tab, setTab] = React.useState("identity");
  const fileRef = React.useRef();

  const typography = TYPE_PRESETS.find(p => p.id === typeId) || TYPE_PRESETS[0];

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setLogoSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const applyPreset = (p) => { setAccent(p.accent); setInk(p.ink); setPaper(p.paper); };
  const activePreset = BRAND_PRESETS.find(p => p.accent===accent && p.ink===ink && p.paper===paper);

  // Logo presentation: show on light + dark bgs, as favicon, as wordmark
  const LogoMark = ({bg, fg, size=36, radius=10}) => (
    <div style={{width:size, height:size, borderRadius:radius, background:bg,
      display:"grid", placeItems:"center", color:fg, flexShrink:0,
      fontFamily:typography.display, fontStyle:typography.displayStyle, fontWeight:600,
      fontSize:size*0.55, letterSpacing:"-0.03em"}}>
      {logoSrc
        ? <img src={logoSrc} alt="" style={{maxWidth:"74%",maxHeight:"74%",objectFit:"contain",
            filter: fg==="#FFFCF4"||fg==="#FFF8EC"?"brightness(0) invert(1)":"none"}}/>
        : name[0]}
    </div>
  );

  const ColorSwatch = ({value, onChange, label}) => (
    <label style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
      background:"var(--card)",border:"1px solid var(--line)",borderRadius:10,cursor:"pointer",
      position:"relative"}}>
      <div style={{width:40,height:40,borderRadius:8,background:value,
        boxShadow:"inset 0 0 0 1px rgba(0,0,0,.08)"}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10.5,fontFamily:"var(--font-mono)",letterSpacing:".1em",
          color:"var(--ink-3)",textTransform:"uppercase",fontWeight:600}}>{label}</div>
        <div style={{fontSize:14,fontWeight:500,fontFamily:"var(--font-mono)",marginTop:2,
          letterSpacing:"-.01em"}}>{value.toUpperCase()}</div>
      </div>
      <input type="color" value={value} onChange={e=>onChange(e.target.value)}
        style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}}/>
    </label>
  );

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_brand")}
        title={lang==="tr"?"Marka Kimliği":"Brand Identity"}
        sub={lang==="tr"?"Logo, renkler, tipografi. Menüde, fişlerde ve kampanyalarda otomatik uygulanır.":"Logo, colours, typography. Auto-applied across the guest menu, receipts and campaigns."}
      />

      {/* Tabs */}
      <div style={{display:"flex",gap:4,padding:4,background:"var(--paper-2)",
        border:"1px solid var(--line)",borderRadius:12,width:"fit-content"}}>
        {[
          {id:"identity", label:lang==="tr"?"Kimlik":"Identity", icon:"sparkle"},
          {id:"colors",   label:lang==="tr"?"Renkler":"Colours", icon:"palette"},
          {id:"type",     label:lang==="tr"?"Tipografi":"Typography", icon:"menu"},
          {id:"app",      label:lang==="tr"?"Mobil Uygulama":"Mobile App", icon:"phone"},
          {id:"preview",  label:lang==="tr"?"Uygulamalar":"Applications", icon:"eye"},
        ].map(tb => (
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{padding:"8px 14px",fontSize:13,fontWeight:500,borderRadius:8,cursor:"pointer",
              border:"none",display:"inline-flex",alignItems:"center",gap:6,
              background: tab===tb.id?"var(--card)":"transparent",
              color: tab===tb.id?"var(--ink)":"var(--ink-3)",
              boxShadow: tab===tb.id?"0 1px 2px rgba(42,31,24,.06)":"none"}}>
            <Icon name={tb.icon} size={14}/>{tb.label}
          </button>
        ))}
      </div>

      {/* TAB: Identity (logo + names) */}
      {tab==="identity" && (
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:20}}>
          <Card>
            <div style={{display:"grid",gap:16}}>
              <Field label={t("logo")} hint={lang==="tr"?"Önerilen: şeffaf PNG veya SVG, min 512×512 px.":"Recommended: transparent PNG or SVG, min 512×512 px."}>
                <div
                  onDragOver={e=>{e.preventDefault();}}
                  onDrop={e=>{e.preventDefault(); handleFile(e.dataTransfer.files[0]);}}
                  onClick={()=>fileRef.current?.click()}
                  style={{
                    padding:30,borderRadius:14,border:"1.5px dashed var(--line-2)",
                    background:"var(--paper-2)",textAlign:"center",cursor:"pointer",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:10,
                    minHeight:180,justifyContent:"center"
                  }}>
                  {logoSrc ? (
                    <>
                      <img src={logoSrc} alt="logo" style={{maxHeight:100,maxWidth:"80%",objectFit:"contain"}}/>
                      <div style={{fontSize:11,color:"var(--ink-3)"}}>
                        {lang==="tr"?"Değiştirmek için tıkla":"Click to replace"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{width:56,height:56,borderRadius:14,background:"var(--card-2)",
                        border:"1px solid var(--line)",display:"grid",placeItems:"center"}}>
                        <Icon name="image" size={24} stroke="var(--ink-3)"/>
                      </div>
                      <div style={{fontSize:14,fontWeight:600}}>{t("uploadLogo")}</div>
                      <div style={{fontSize:11,color:"var(--ink-3)"}}>
                        {lang==="tr"?"Tıkla ya da dosyayı buraya bırak":"Click or drop a file"}
                      </div>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>handleFile(e.target.files[0])}/>
                </div>
              </Field>
              {logoSrc && (
                <div style={{display:"flex",gap:10}}>
                  <Button variant="soft" icon="refresh" onClick={()=>fileRef.current?.click()}>
                    {lang==="tr"?"Değiştir":"Replace"}
                  </Button>
                  <Button variant="danger" icon="trash" onClick={()=>setLogoSrc(null)}>
                    {lang==="tr"?"Kaldır":"Remove"}
                  </Button>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label={lang==="tr"?"İşletme adı":"Business name"}>
                  <Input value={name} onChange={e=>setName(e.target.value)}/>
                </Field>
                <Field label={lang==="tr"?"Kısa ad (fiş)":"Short name (receipt)"}>
                  <Input value={name.toUpperCase()} onChange={()=>{}} disabled/>
                </Field>
              </div>
              <Field label={lang==="tr"?"Alt başlık · Türkçe":"Tagline · Turkish"}>
                <Input value={tagTr} onChange={e=>setTagTr(e.target.value)}/>
              </Field>
              <Field label={lang==="tr"?"Alt başlık · İngilizce":"Tagline · English"}>
                <Input value={tagEn} onChange={e=>setTagEn(e.target.value)}/>
              </Field>
            </div>
          </Card>
          {/* Logo lockups preview */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500}}>
              {lang==="tr"?"Logo Kullanımları":"Logo Lockups"}
            </div>
            <div style={{marginTop:14,display:"grid",gap:14}}>
              {/* Light lockup */}
              <div style={{padding:"22px 20px",background:paper,border:"1px solid var(--line)",
                borderRadius:12,display:"flex",alignItems:"center",gap:14}}>
                <LogoMark bg={ink} fg={paper} size={52} radius={12}/>
                <div>
                  <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",color:ink,
                    fontFamily:typography.display,fontStyle:typography.displayStyle}}>{name}</div>
                  <div style={{fontSize:11,color:ink,opacity:.58,marginTop:2,fontFamily:typography.body}}>{lang==="tr"?tagTr:tagEn}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:9.5,fontFamily:"var(--font-mono)",
                  letterSpacing:".14em",color:ink,opacity:.35,textTransform:"uppercase"}}>LIGHT</div>
              </div>
              {/* Dark lockup */}
              <div style={{padding:"22px 20px",background:ink,borderRadius:12,
                display:"flex",alignItems:"center",gap:14}}>
                <LogoMark bg={accent} fg={paper} size={52} radius={12}/>
                <div>
                  <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",color:paper,
                    fontFamily:typography.display,fontStyle:typography.displayStyle}}>{name}</div>
                  <div style={{fontSize:11,color:paper,opacity:.6,marginTop:2,fontFamily:typography.body}}>{lang==="tr"?tagTr:tagEn}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:9.5,fontFamily:"var(--font-mono)",
                  letterSpacing:".14em",color:paper,opacity:.35,textTransform:"uppercase"}}>DARK</div>
              </div>
              {/* Accent lockup */}
              <div style={{padding:"22px 20px",background:accent,borderRadius:12,
                display:"flex",alignItems:"center",gap:14}}>
                <LogoMark bg={paper} fg={accent} size={52} radius={12}/>
                <div>
                  <div style={{fontSize:22,fontWeight:500,letterSpacing:"-0.02em",color:paper,
                    fontFamily:typography.display,fontStyle:typography.displayStyle}}>{name}</div>
                  <div style={{fontSize:11,color:paper,opacity:.78,marginTop:2,fontFamily:typography.body}}>{lang==="tr"?tagTr:tagEn}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:9.5,fontFamily:"var(--font-mono)",
                  letterSpacing:".14em",color:paper,opacity:.5,textTransform:"uppercase"}}>ACCENT</div>
              </div>
              {/* Favicon sizes */}
              <div style={{padding:"14px 20px",background:"var(--paper-2)",border:"1px dashed var(--line-2)",
                borderRadius:12,display:"flex",alignItems:"center",gap:18}}>
                <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".12em",
                  color:"var(--ink-3)",textTransform:"uppercase",fontWeight:600,minWidth:100}}>
                  {lang==="tr"?"İkon":"Favicon"}
                </div>
                <LogoMark bg={accent} fg={paper} size={48} radius={10}/>
                <LogoMark bg={accent} fg={paper} size={32} radius={8}/>
                <LogoMark bg={accent} fg={paper} size={22} radius={6}/>
                <LogoMark bg={accent} fg={paper} size={16} radius={4}/>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Colours */}
      {tab==="colors" && (
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:20}}>
          <Card>
            <div style={{display:"grid",gap:18}}>
              <div>
                <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
                  color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
                  {lang==="tr"?"Paletler":"Palettes"}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {BRAND_PRESETS.map(p => {
                    const on = activePreset?.id === p.id;
                    return (
                      <button key={p.id} onClick={()=>applyPreset(p)}
                        style={{padding:"12px 12px",borderRadius:12,border:`1.5px solid ${on?p.accent:"var(--line)"}`,
                          background: on?"var(--card-2)":"var(--card)",cursor:"pointer",textAlign:"left",
                          display:"flex",flexDirection:"column",gap:10,
                          boxShadow: on?`0 0 0 3px ${p.accent}15`:"none"}}>
                        <div style={{display:"flex",gap:4,height:22}}>
                          <span style={{flex:2,background:p.accent,borderRadius:4}}/>
                          <span style={{flex:1,background:p.ink,borderRadius:4}}/>
                          <span style={{flex:1.5,background:p.paper,borderRadius:4,border:"1px solid var(--line)"}}/>
                        </div>
                        <div style={{fontSize:12.5,fontWeight:600}}>{p.name[lang]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
                  color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
                  {lang==="tr"?"Özel Renkler":"Custom Colours"}
                </div>
                <div style={{display:"grid",gap:10}}>
                  <ColorSwatch value={accent} onChange={setAccent} label={lang==="tr"?"Vurgu":"Accent"}/>
                  <ColorSwatch value={ink} onChange={setInk} label={lang==="tr"?"Yazı":"Ink"}/>
                  <ColorSwatch value={paper} onChange={setPaper} label={lang==="tr"?"Kağıt":"Paper"}/>
                </div>
              </div>
            </div>
          </Card>
          {/* Contrast + color applications */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:14}}>
              {lang==="tr"?"Renk Uygulaması":"Colour in Action"}
            </div>
            {/* Buttons */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              <span style={{padding:"10px 18px",borderRadius:10,background:accent,color:paper,
                fontSize:13,fontWeight:600,fontFamily:typography.body}}>
                {lang==="tr"?"Sipariş ver":"Order now"}
              </span>
              <span style={{padding:"10px 18px",borderRadius:10,background:ink,color:paper,
                fontSize:13,fontWeight:600,fontFamily:typography.body}}>
                {lang==="tr"?"Detay":"Details"}
              </span>
              <span style={{padding:"10px 18px",borderRadius:10,background:"transparent",
                color:accent,border:`1.5px solid ${accent}`,fontSize:13,fontWeight:600,fontFamily:typography.body}}>
                {lang==="tr"?"Yeni":"New"}
              </span>
            </div>
            {/* Product card demo */}
            <div style={{padding:20,background:paper,borderRadius:14,
              border:`1px solid ${ink}15`,display:"grid",gridTemplateColumns:"auto 1fr",gap:16,
              alignItems:"center",marginBottom:12}}>
              <div style={{width:80,height:80,borderRadius:12,
                background:`linear-gradient(135deg, ${accent}, ${ink})`,
                display:"grid",placeItems:"center",color:paper,
                fontFamily:typography.display,fontStyle:typography.displayStyle,fontSize:38,fontWeight:600}}>
                {logoSrc ? <img src={logoSrc} style={{maxWidth:"70%",maxHeight:"70%",filter:"brightness(0) invert(1)"}}/> : name[0]}
              </div>
              <div>
                <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:accent,
                  letterSpacing:".12em",textTransform:"uppercase",fontWeight:600}}>
                  {lang==="tr"?"İmza Kahve":"Signature Coffee"}
                </div>
                <div style={{fontSize:22,fontWeight:500,color:ink,marginTop:4,letterSpacing:"-0.02em",
                  fontFamily:typography.display,fontStyle:typography.displayStyle}}>
                  Flat White
                </div>
                <div style={{fontSize:12.5,color:ink,opacity:.6,marginTop:3,fontFamily:typography.body}}>
                  {lang==="tr"?"Ethiopia Yirgacheffe · Oat milk":"Ethiopia Yirgacheffe · Oat milk"}
                </div>
                <div style={{marginTop:10,display:"flex",alignItems:"baseline",gap:4,
                  fontFamily:typography.display,fontStyle:typography.displayStyle}}>
                  <span style={{fontSize:20,color:accent,fontWeight:600}}>₺95</span>
                </div>
              </div>
            </div>
            {/* Accent chips */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["100","200","400","600","800"].map((tone,i) => (
                <div key={tone} style={{flex:1,minWidth:50,height:44,borderRadius:8,
                  background: accent, opacity: 0.18+i*0.2,
                  display:"flex",alignItems:"flex-end",padding:5,color:i>2?paper:ink,
                  fontSize:9.5,fontFamily:"var(--font-mono)",fontWeight:600}}>
                  {tone}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Typography */}
      {tab==="type" && (
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:20}}>
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:12}}>
              {lang==="tr"?"Yazı Kombinasyonu":"Type Pairings"}
            </div>
            <div style={{display:"grid",gap:10}}>
              {TYPE_PRESETS.map(tp => {
                const on = tp.id === typeId;
                return (
                  <button key={tp.id} onClick={()=>setTypeId(tp.id)}
                    style={{padding:"16px 18px",borderRadius:12,cursor:"pointer",textAlign:"left",
                      border: `1.5px solid ${on?accent:"var(--line)"}`,
                      background: on?"var(--card-2)":"var(--card)",
                      boxShadow: on?`0 0 0 3px ${accent}15`:"none",
                      display:"grid",gap:8}}>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,fontFamily:"var(--font-mono)",
                        letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink-3)",fontWeight:600}}>
                        {tp.name}
                      </span>
                      {on && <Icon name="check" size={14} stroke={accent}/>}
                    </div>
                    <div style={{fontSize:34,lineHeight:1,letterSpacing:"-0.025em",fontWeight:500,
                      fontFamily:tp.display,fontStyle:tp.displayStyle,color:"var(--ink)"}}>
                      {name}
                    </div>
                    <div style={{fontSize:12.5,color:"var(--ink-3)",fontFamily:tp.body}}>
                      {lang==="tr"?tagTr:tagEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:14}}>
              {lang==="tr"?"Tipografi Ölçeği":"Type Scale"}
            </div>
            <div style={{display:"grid",gap:14}}>
              {[
                {label:"Display · 48", size:48, family:typography.display, style:typography.displayStyle, weight:500, text:name},
                {label:"Headline · 32", size:32, family:typography.display, style:typography.displayStyle, weight:500, text:lang==="tr"?"Bugünün Menüsü":"Today's Menu"},
                {label:"Title · 22", size:22, family:typography.body, style:"normal", weight:600, text:"Flat White"},
                {label:"Body · 15", size:15, family:typography.body, style:"normal", weight:400, text:lang==="tr"?"Ethiopia Yirgacheffe · yulaf sütü · 8oz":"Ethiopia Yirgacheffe · oat milk · 8oz"},
                {label:"Caption · 11", size:11, family:"'DM Mono', ui-monospace, monospace", style:"normal", weight:500, text:"EST. 2021 · KARAKÖY"},
              ].map((row,i)=>(
                <div key={i} style={{display:"grid",gap:4,paddingBottom:12,
                  borderBottom: i<4?"1px solid var(--line)":"none"}}>
                  <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--ink-3)",
                    letterSpacing:".12em",textTransform:"uppercase"}}>{row.label}</div>
                  <div style={{fontSize:row.size,fontFamily:row.family,fontStyle:row.style,
                    fontWeight:row.weight,lineHeight:1.1,letterSpacing: row.size>24?"-0.025em":"-0.01em"}}>
                    {row.text}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Mobile App content */}
      {tab==="app" && (
        <AppCustomizer lang={lang} appConfig={appConfig} setAppConfig={setAppConfig}
          appConfigDefaults={appConfigDefaults}/>
      )}

      {/* TAB: Applications (how it looks in the wild) */}
      {tab==="preview" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(2, minmax(0,1fr))",gap:20}}>
          {/* Menu header */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
              {lang==="tr"?"Müşteri Menüsü":"Guest Menu"}
            </div>
            <div style={{background:paper,borderRadius:14,padding:24,border:`1px solid ${ink}12`}}>
              <div style={{textAlign:"center",paddingBottom:20,borderBottom:`1px dashed ${ink}25`}}>
                <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:accent,
                  letterSpacing:".16em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>
                  EST. 2021 · KARAKÖY
                </div>
                {logoSrc
                  ? <img src={logoSrc} alt="" style={{height:48,marginBottom:8}}/>
                  : <div style={{fontSize:44,fontFamily:typography.display,fontStyle:typography.displayStyle,
                      fontWeight:500,letterSpacing:"-0.02em",color:ink,lineHeight:1}}>{name}</div>}
                <div style={{fontSize:11.5,color:ink,opacity:.55,marginTop:6,fontFamily:typography.body}}>
                  {lang==="tr"?tagTr:tagEn}
                </div>
              </div>
              <div style={{padding:"18px 4px",display:"grid",gap:12}}>
                {[
                  {n:"Flat White", p:"₺95", d: lang==="tr"?"Ethiopia Yirgacheffe":"Ethiopia Yirgacheffe"},
                  {n:"V60 Geyşa", p:"₺220", d: lang==="tr"?"Tek köken · el demliği":"Single origin · pour-over"},
                  {n:"Tahinli Cookie", p:"₺65", d: lang==="tr"?"Ev yapımı":"House-baked"},
                ].map((it,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:600,color:ink,fontFamily:typography.body}}>{it.n}</div>
                      <div style={{fontSize:11.5,color:ink,opacity:.55,marginTop:1,fontFamily:typography.body}}>{it.d}</div>
                    </div>
                    <div style={{flex:1,height:1,borderBottom:`1px dotted ${ink}30`,marginBottom:4}}/>
                    <div style={{fontSize:14,fontWeight:600,color:accent,fontFamily:typography.body}}>{it.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          {/* Receipt */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
              {lang==="tr"?"Termal Fiş":"Thermal Receipt"}
            </div>
            <div style={{background:"#FBF8F0",border:"1px solid var(--line)",borderRadius:8,
              padding:"24px 20px",fontFamily:"var(--font-mono)",fontSize:11.5,color:"#2A1F18",
              lineHeight:1.7}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                {logoSrc
                  ? <img src={logoSrc} alt="" style={{height:32,marginBottom:4,
                      filter:"grayscale(1) contrast(1.4)"}}/>
                  : <div style={{fontSize:22,fontFamily:typography.display,fontStyle:typography.displayStyle,
                      fontWeight:600}}>{name}</div>}
                <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:".16em"}}>
                  {lang==="tr"?tagTr.slice(0,30):tagEn.slice(0,30)}
                </div>
              </div>
              <div style={{borderTop:"1px dashed #2A1F18",borderBottom:"1px dashed #2A1F18",
                padding:"8px 0",marginBottom:10,fontSize:10}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span>MASA / TABLE</span><span>14</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span>GARSON / SERVER</span><span>EMRE</span>
                </div>
              </div>
              {[["Flat White x2","190.00"],["Tahini Cookie","65.00"],["Matcha Latte","100.00"]].map(([n,p],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between"}}>
                  <span>{n}</span><span>{p}</span>
                </div>
              ))}
              <div style={{borderTop:"1px dashed #2A1F18",marginTop:10,paddingTop:8,
                display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13}}>
                <span>TOTAL</span><span>₺355.00</span>
              </div>
              <div style={{textAlign:"center",marginTop:14,fontSize:10,opacity:.6}}>
                TEŞEKKÜRLER · THANK YOU
              </div>
            </div>
          </Card>
          {/* QR card */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
              {lang==="tr"?"Masa QR Kartı":"Table QR Card"}
            </div>
            <div style={{padding:"30px 20px",background:accent,borderRadius:14,
              display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
              <div style={{color:paper,fontSize:34,fontFamily:typography.display,fontStyle:typography.displayStyle,
                fontWeight:500,letterSpacing:"-0.02em"}}>{name}</div>
              <div style={{fontSize:11,color:paper,opacity:.8,fontFamily:"var(--font-mono)",
                letterSpacing:".16em",textTransform:"uppercase"}}>
                {lang==="tr"?"Masa · Table":"TABLE"} 14
              </div>
              <div style={{width:120,height:120,background:paper,borderRadius:12,padding:10,
                display:"grid",gridTemplateColumns:"repeat(11,1fr)",gridTemplateRows:"repeat(11,1fr)",gap:1}}>
                {Array.from({length:121}).map((_,i)=>{
                  // deterministic pseudo QR pattern
                  const on = ((i*7)%5 < 2) || (i%11===0) || (Math.floor(i/11)===0&&i<8);
                  return <span key={i} style={{background:on?ink:"transparent",borderRadius:1}}/>;
                })}
              </div>
              <div style={{fontSize:11,color:paper,opacity:.75,fontFamily:typography.body}}>
                {lang==="tr"?"Menüyü görmek için taratın":"Scan to view menu"}
              </div>
            </div>
          </Card>
          {/* Social avatar + email signature */}
          <Card>
            <div style={{fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:".14em",
              color:"var(--accent)",textTransform:"uppercase",fontWeight:500,marginBottom:10}}>
              {lang==="tr"?"Sosyal Medya · E-posta":"Social · Email"}
            </div>
            <div style={{display:"grid",gap:14}}>
              {/* instagram-like preview */}
              <div style={{padding:14,background:"var(--paper-2)",borderRadius:12,
                border:"1px solid var(--line)",display:"flex",alignItems:"center",gap:12}}>
                <div style={{padding:3,borderRadius:"50%",background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743)"}}>
                  <LogoMark bg={paper} fg={accent} size={52} radius={999}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:typography.body}}>{name.toLowerCase()}.cafe</div>
                  <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:1,fontFamily:typography.body}}>
                    {lang==="tr"?tagTr:tagEn}
                  </div>
                  <div style={{fontSize:11,color:"var(--ink-3)",marginTop:3,fontFamily:"var(--font-mono)",
                    letterSpacing:".06em"}}>2.4K followers · 316 posts</div>
                </div>
              </div>
              {/* email sig */}
              <div style={{padding:16,background:paper,borderRadius:12,border:`1px solid ${ink}15`,
                fontFamily:typography.body,color:ink}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <LogoMark bg={ink} fg={paper} size={46} radius={10}/>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:ink}}>Melis Karaca</div>
                    <div style={{fontSize:12,color:ink,opacity:.7,marginTop:1}}>
                      Founder · {name}
                    </div>
                  </div>
                </div>
                <div style={{borderTop:`1px solid ${ink}15`,marginTop:12,paddingTop:10,
                  fontSize:11,color:ink,opacity:.65,display:"grid",gap:2}}>
                  <div>melis@{name.toLowerCase()}.cafe · +90 555 000 00 00</div>
                  <div>{lang==="tr"?"Karaköy · Çukurcuma · Alaçatı":"Karaköy · Çukurcuma · Alaçatı"}</div>
                  <div style={{color:accent,fontWeight:600,marginTop:3}}>{name.toLowerCase()}.cafe</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Shifts, Stock, ReceiptDesigner, ReceiptPreview, Brand });
