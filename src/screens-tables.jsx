// Tables management screen.
// - Grid of tables with zone filter + status badges
// - Floor-plan mode: tiles positioned via x/y percent in a canvas
// - CRUD: add, edit, delete table
// - Zones: customizable (add/rename/recolor)
//
// Uses TABLES_SEED + TABLE_ZONES_SEED from data.jsx.

const TablesScreen = ({t, lang, tables, setTables, zones, setZones, onOpenPOS}) => {
  const [view, setView]       = React.useState("grid"); // grid | floor
  const [zoneF, setZoneF]     = React.useState("all");
  const [modal, setModal]     = React.useState(null);  // {mode, draft}
  const [zoneModal, setZoneModal] = React.useState(null);

  const zoneById = Object.fromEntries(zones.map(z=>[z.id, z]));
  const filtered = zoneF === "all" ? tables : tables.filter(tb => tb.zone === zoneF);

  const statusLabel = {
    available: {tr:"Boş",      en:"Available"},
    occupied:  {tr:"Dolu",     en:"Occupied"},
    bill:      {tr:"Hesap",    en:"Bill"},
    reserved:  {tr:"Rezerve",  en:"Reserved"},
    cleaning:  {tr:"Temizlik", en:"Cleaning"},
  };
  const statusColor = {
    available: {bg:"#E9EFE0",        fg:"#3F5B36", dot:"#6B7A4B"},
    occupied:  {bg:"#F7E2D8",        fg:"#8B3B24", dot:"#C4553A"},
    bill:      {bg:"#F4E7C4",        fg:"#6B4C0A", dot:"#B08A3E"},
    reserved:  {bg:"#E1EAF4",        fg:"#274C72", dot:"#2E5B7A"},
    cleaning:  {bg:"var(--paper-2)", fg:"var(--ink-3)", dot:"#AAA"},
  };

  const openAdd = () => {
    const maxNum = tables.reduce((m,tb) => {
      const n = parseInt(tb.name, 10);
      return isFinite(n) && n > m ? n : m;
    }, 0);
    setModal({mode:"add", draft:{
      id:"t_"+Date.now(), name:String(maxNum+1), zone:zones[0]?.id || "z_hall",
      seats:4, shape:"square", x:50, y:50, status:"available"
    }});
  };
  const openEdit = (tb) => setModal({mode:"edit", draft:{...tb}});
  const saveTable = () => {
    const d = modal.draft;
    if (!d.name) return;
    setTables(prev => modal.mode === "add" ? [...prev, d] : prev.map(tb => tb.id === d.id ? d : tb));
    setModal(null);
  };
  const deleteTable = (id) => {
    if (!confirm(lang==="tr"?"Masayı sil?":"Delete table?")) return;
    setTables(prev => prev.filter(tb => tb.id !== id));
    setModal(null);
  };
  const saveZone = () => {
    const d = zoneModal.draft;
    if (!d.name?.tr && !d.name?.en) return;
    setZones(prev => zoneModal.mode === "add" ? [...prev, d] : prev.map(z => z.id === d.id ? d : z));
    setZoneModal(null);
  };
  const deleteZone = (id) => {
    if (tables.some(tb => tb.zone === id)) {
      alert(lang==="tr"?"Bu bölgede masalar var. Önce onları taşıyın.":"This zone has tables. Move them first.");
      return;
    }
    setZones(prev => prev.filter(z => z.id !== id));
    setZoneModal(null);
  };

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={lang==="tr"?"Operasyon":"Operations"}
        title={lang==="tr"?"Masalar":"Tables"}
        sub={lang==="tr"
          ? "Masaları düzenleyin, bölgelere atayın ve yerleşimi ayarlayın."
          : "Manage tables, assign zones, and arrange the floor plan."}
        actions={
          <div style={{display:"flex", gap:8}}>
            <Button variant="soft" icon="grid" onClick={()=>setView("grid")}
              style={view==="grid"?{borderColor:"var(--accent)",color:"var(--accent)"}:undefined}>
              {lang==="tr"?"Izgara":"Grid"}
            </Button>
            <Button variant="soft" icon="layout" onClick={()=>setView("floor")}
              style={view==="floor"?{borderColor:"var(--accent)",color:"var(--accent)"}:undefined}>
              {lang==="tr"?"Yerleşim":"Floor plan"}
            </Button>
            <Button variant="primary" icon="plus" onClick={openAdd}>
              {lang==="tr"?"Masa ekle":"Add table"}
            </Button>
          </div>
        }
      />

      {/* Zone chips */}
      <div style={{display:"flex", flexWrap:"wrap", gap:8, alignItems:"center"}}>
        <button onClick={()=>setZoneF("all")} style={{
          padding:"7px 14px", borderRadius:999, border:"1px solid var(--line)",
          background: zoneF==="all"?"var(--ink)":"var(--card)",
          color: zoneF==="all"?"var(--paper)":"var(--ink)",
          fontSize:12.5, fontWeight:600, cursor:"pointer",
          display:"inline-flex", alignItems:"center", gap:6}}>
          {lang==="tr"?"Tümü":"All"}
          <span style={{fontSize:11, opacity:.7, fontFamily:"var(--font-mono)"}}>{tables.length}</span>
        </button>
        {zones.map(z => {
          const count = tables.filter(tb=>tb.zone===z.id).length;
          const on = zoneF === z.id;
          return (
            <button key={z.id} onClick={()=>setZoneF(z.id)} style={{
              padding:"7px 14px", borderRadius:999, border:`1px solid ${on?z.color:"var(--line)"}`,
              background: on?`${z.color}15`:"var(--card)",
              color: on?z.color:"var(--ink)",
              fontSize:12.5, fontWeight:600, cursor:"pointer",
              display:"inline-flex", alignItems:"center", gap:8}}>
              <span style={{width:8,height:8,borderRadius:2,background:z.color,display:"inline-block"}}/>
              {z.name[lang]}
              <span style={{fontSize:11, opacity:.75, fontFamily:"var(--font-mono)"}}>{count}</span>
            </button>
          );
        })}
        <button onClick={()=>setZoneModal({mode:"add",
            draft:{id:"z_"+Date.now(), name:{tr:"",en:""}, color:"#7E5B3A", icon:"sun"}})}
          style={{padding:"7px 12px", borderRadius:999, border:"1.5px dashed var(--line-2)",
            background:"transparent", fontSize:12, color:"var(--ink-3)", fontWeight:600,
            display:"inline-flex", alignItems:"center", gap:5, cursor:"pointer"}}>
          <Icon name="plus" size={12}/>{lang==="tr"?"Bölge ekle":"Add zone"}
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12}}>
        {[
          {k:"available", tr:"Boş masa",      en:"Available"},
          {k:"occupied",  tr:"Dolu masa",     en:"Occupied"},
          {k:"bill",      tr:"Hesap bekliyor",en:"Awaiting bill"},
          {k:"reserved",  tr:"Rezerve",       en:"Reserved"},
          {k:"cleaning",  tr:"Temizlik",      en:"Cleaning"},
        ].map(s => {
          const n = tables.filter(tb => tb.status === s.k).length;
          const c = statusColor[s.k];
          return (
            <div key={s.k} style={{padding:"14px 16px", background:"var(--card)",
              border:"1px solid var(--line)", borderRadius:12, borderLeft:`3px solid ${c.dot}`}}>
              <div style={{fontSize:10.5, color:"var(--ink-3)",fontFamily:"var(--font-mono)",
                letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
                {lang==="tr"?s.tr:s.en}
              </div>
              <div style={{fontSize:28, fontFamily:"var(--font-display)", fontStyle:"italic",
                fontWeight:500, letterSpacing:"-0.02em", marginTop:2}}>{n}</div>
            </div>
          );
        })}
      </div>

      {/* Main view */}
      {view === "grid" ? (
        <div style={{display:"grid", gap:14}}>
          {(zoneF === "all" ? zones : zones.filter(z => z.id === zoneF)).map(z => {
            const items = filtered.filter(tb => tb.zone === z.id);
            if (!items.length) return null;
            return (
              <div key={z.id}>
                <div style={{display:"flex", alignItems:"baseline", gap:10, marginBottom:10}}>
                  <div style={{width:6, height:6, borderRadius:1, background:z.color}}/>
                  <div style={{fontSize:12, fontFamily:"var(--font-mono)",
                    letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, color:z.color}}>
                    {z.name[lang]}
                  </div>
                  <div style={{fontSize:11, color:"var(--ink-3)"}}>
                    {items.length} {lang==="tr"?"masa":"tables"}
                  </div>
                  <button onClick={()=>setZoneModal({mode:"edit", draft:{...z}})}
                    style={{marginLeft:"auto", fontSize:11, color:"var(--ink-3)",
                      padding:"3px 8px", borderRadius:6, background:"transparent"}}>
                    <Icon name="edit" size={11}/>
                  </button>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10}}>
                  {items.map(tb => {
                    const sc = statusColor[tb.status] || statusColor.available;
                    return (
                      <button key={tb.id} onClick={()=>openEdit(tb)}
                        onDoubleClick={()=>{if(tb.status==="occupied"||tb.status==="bill") onOpenPOS?.(tb.id);}}
                        style={{textAlign:"left", padding:14, borderRadius:12,
                          background:"var(--card)", border:"1px solid var(--line)",
                          borderTop:`3px solid ${sc.dot}`, cursor:"pointer",
                          display:"flex", flexDirection:"column", gap:6, minHeight:94}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontSize:11, color:"var(--ink-3)",fontFamily:"var(--font-mono)",
                              letterSpacing:".1em", textTransform:"uppercase"}}>{lang==="tr"?"Masa":"Table"}</div>
                            <div style={{fontSize:28, fontFamily:"var(--font-display)", fontStyle:"italic",
                              fontWeight:500, letterSpacing:"-0.02em", lineHeight:1}}>{tb.name}</div>
                          </div>
                          <span style={{padding:"2px 8px", borderRadius:999, fontSize:10.5,
                            fontWeight:600, background:sc.bg, color:sc.fg}}>{statusLabel[tb.status]?.[lang]}</span>
                        </div>
                        <div style={{marginTop:"auto", display:"flex", justifyContent:"space-between",
                          fontSize:11, color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>
                          <span><Icon name="users" size={11}/> {tb.seats}</span>
                          <span style={{textTransform:"capitalize"}}>{tb.shape}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <FloorPlan zones={zoneF==="all"?zones:zones.filter(z=>z.id===zoneF)} tables={filtered}
          statusColor={statusColor} onOpenEdit={openEdit}
          onMove={(id, x, y) => setTables(prev => prev.map(tb => tb.id === id ? {...tb, x, y} : tb))}/>
      )}

      {/* Modals */}
      <TableModal modal={modal} setModal={setModal} zones={zones} lang={lang}
        onSave={saveTable} onDelete={deleteTable}/>
      <ZoneModal modal={zoneModal} setModal={setZoneModal} lang={lang}
        onSave={saveZone} onDelete={deleteZone}/>
    </div>
  );
};

/* ───── Floor plan (drag tables around) ───── */
const FloorPlan = ({zones, tables, statusColor, onOpenEdit, onMove}) => {
  const [dragId, setDragId] = React.useState(null);
  const canvasRefs = React.useRef({});
  const onPointerDown = (e, id) => { setDragId(id); e.preventDefault(); };
  const onPointerMove = (e, zoneId) => {
    if (!dragId) return;
    const canvas = canvasRefs.current[zoneId];
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.max(2, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(2, Math.min(94, ((e.clientY - r.top) / r.height) * 100));
    onMove(dragId, x, y);
  };
  const onPointerUp = () => setDragId(null);

  return (
    <div style={{display:"grid", gap:20}} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}>
      {zones.map(z => {
        const items = tables.filter(tb => tb.zone === z.id);
        return (
          <Card key={z.id} style={{padding:0, overflow:"hidden"}}>
            <div style={{padding:"12px 16px", borderBottom:"1px solid var(--line)",
              display:"flex", alignItems:"center", gap:10, background:`${z.color}08`}}>
              <div style={{width:6, height:6, borderRadius:1, background:z.color}}/>
              <div style={{fontSize:12, fontFamily:"var(--font-mono)",
                letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, color:z.color}}>
                {z.name["tr"] /* just display both */}  · {z.name["en"]}
              </div>
              <div style={{fontSize:11, color:"var(--ink-3)", marginLeft:"auto"}}>
                {items.length} {items.length===1?"table":"tables"} · drag to reposition
              </div>
            </div>
            <div
              ref={el => canvasRefs.current[z.id] = el}
              onMouseMove={(e)=>onPointerMove(e, z.id)}
              style={{position:"relative", height:340,
                background: `
                  linear-gradient(45deg, ${z.color}08 25%, transparent 25%, transparent 75%, ${z.color}08 75%),
                  linear-gradient(45deg, ${z.color}08 25%, transparent 25%, transparent 75%, ${z.color}08 75%)
                `,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
                borderTop:`1px solid ${z.color}20`,
              }}>
              {items.map(tb => {
                const sc = statusColor[tb.status] || statusColor.available;
                const size = tb.shape === "rect" ? 72 : 56;
                return (
                  <div key={tb.id}
                    onMouseDown={(e)=>onPointerDown(e, tb.id)}
                    onDoubleClick={()=>onOpenEdit(tb)}
                    style={{
                      position:"absolute",
                      left:`${tb.x}%`, top:`${tb.y}%`,
                      transform:"translate(-50%,-50%)",
                      width: tb.shape==="rect" ? size*1.4 : size,
                      height: size,
                      borderRadius: tb.shape === "round" ? "50%" : 12,
                      background: sc.bg, border:`2px solid ${sc.dot}`,
                      display:"grid", placeItems:"center",
                      cursor: dragId === tb.id ? "grabbing" : "grab",
                      userSelect:"none",
                      boxShadow: dragId === tb.id ? "0 8px 24px rgba(0,0,0,.15)" : "0 2px 6px rgba(0,0,0,.06)",
                      transition: dragId === tb.id ? "none" : "box-shadow .15s",
                      color: sc.fg, fontFamily:"var(--font-display)", fontStyle:"italic",
                      fontSize:20, fontWeight:600,
                    }}>
                    {tb.name}
                    <div style={{position:"absolute", bottom:-18, fontSize:9.5, fontWeight:500,
                      color:"var(--ink-3)", fontFamily:"var(--font-mono)",
                      letterSpacing:".05em", whiteSpace:"nowrap"}}>
                      {tb.seats} seats
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

/* ───── Table Modal — refined ───── */
const TableModal = ({modal, setModal, zones, lang, onSave, onDelete}) => {
  if (!modal) return null;
  const d = modal.draft;
  const set = (k, v) => setModal(m => ({...m, draft:{...m.draft, [k]:v}}));
  const zone = zones.find(z => z.id === d.zone) || zones[0];
  const shapes = [
    {id:"round",  tr:"Yuvarlak", en:"Round"},
    {id:"square", tr:"Kare",     en:"Square"},
    {id:"rect",   tr:"Dikdörtgen",en:"Rectangle"},
  ];
  const statusOpts = [
    {id:"available", tr:"Boş",      en:"Available",      dot:"#6B7A4B"},
    {id:"occupied",  tr:"Dolu",     en:"Occupied",       dot:"#C4553A"},
    {id:"bill",      tr:"Hesap",    en:"Awaiting bill",  dot:"#B08A3E"},
    {id:"reserved",  tr:"Rezerve",  en:"Reserved",       dot:"#2E5B7A"},
    {id:"cleaning",  tr:"Temizlik", en:"Cleaning",       dot:"#AAA"},
  ];
  const previewSize = d.shape === "rect" ? 86 : 70;
  return (
    <Modal open={true} onClose={()=>setModal(null)} width={620}
      title={modal.mode==="add" ? (lang==="tr"?"Masa ekle":"Add table") : (lang==="tr"?"Masa düzenle":"Edit table")}
      subtitle={modal.mode==="add"
        ? (lang==="tr"?"Bölge seç, kapasite ve şekil belirle. Masa kaydedildiğinde QR kodu otomatik üretilir.":"Pick a zone, set capacity and shape. A QR code is generated automatically on save.")
        : (lang==="tr"?"Masayı düzenle veya sil.":"Edit or delete this table.")}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 220px", gap:20}}>
        {/* Left — fields */}
        <div style={{display:"grid", gap:14}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <Field label={lang==="tr"?"Masa adı / no":"Table name / no"}>
              <Input value={d.name} onChange={e=>set("name", e.target.value)} placeholder="1"
                style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:20,fontWeight:500,letterSpacing:"-0.01em"}}/>
            </Field>
            <Field label={lang==="tr"?"Kapasite":"Seats"}>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <button onClick={()=>set("seats", Math.max(1,(d.seats||2)-1))}
                  style={{width:36,height:38,borderRadius:8,border:"1px solid var(--line)",
                    background:"var(--card-2)",cursor:"pointer",fontSize:16,color:"var(--ink-2)"}}>–</button>
                <Input type="number" min="1" max="20" value={d.seats}
                  onChange={e=>set("seats", parseInt(e.target.value||"0",10))}
                  style={{textAlign:"center",fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:18,fontWeight:500}}/>
                <button onClick={()=>set("seats", Math.min(20,(d.seats||2)+1))}
                  style={{width:36,height:38,borderRadius:8,border:"1px solid var(--line)",
                    background:"var(--card-2)",cursor:"pointer",fontSize:16,color:"var(--ink-2)"}}>+</button>
              </div>
              <div style={{display:"flex",gap:4,marginTop:6}}>
                {[2,4,6,8].map(n=>(
                  <button key={n} onClick={()=>set("seats",n)} style={{
                    padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,
                    border:`1px solid ${d.seats===n?"var(--accent)":"var(--line)"}`,
                    background:d.seats===n?"var(--accent)":"transparent",
                    color:d.seats===n?"var(--paper)":"var(--ink-3)",
                    fontFamily:"var(--font-mono)",cursor:"pointer"}}>{n}</button>
                ))}
              </div>
            </Field>
          </div>

          <Field label={lang==="tr"?"Bölge":"Zone"}>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {zones.map(z => (
                <button key={z.id} onClick={()=>set("zone", z.id)} style={{
                  padding:"9px 14px", borderRadius:10, cursor:"pointer",
                  border:`1.5px solid ${d.zone===z.id?z.color:"var(--line)"}`,
                  background: d.zone===z.id?`${z.color}18`:"var(--card-2)",
                  color: d.zone===z.id?z.color:"var(--ink)",
                  fontSize:13, fontWeight:600,
                  display:"inline-flex", alignItems:"center", gap:8}}>
                  <span style={{width:9,height:9,borderRadius:2,background:z.color}}/>
                  {z.name[lang]}
                </button>
              ))}
            </div>
          </Field>

          <Field label={lang==="tr"?"Şekil":"Shape"}>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
              {shapes.map(sh => (
                <button key={sh.id} onClick={()=>set("shape", sh.id)} style={{
                  padding:"14px 10px", borderRadius:10, cursor:"pointer",
                  border:`1.5px solid ${d.shape===sh.id?"var(--accent)":"var(--line)"}`,
                  background: d.shape===sh.id?"var(--paper-2)":"var(--card-2)",
                  fontSize:12, fontWeight:600,
                  display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                  <div style={{
                    width:sh.id==="rect"?34:22,
                    height:sh.id==="rect"?16:22,
                    borderRadius:sh.id==="round"?"50%":4,
                    background: d.shape===sh.id?"var(--accent)":"var(--ink-3)",
                    opacity: d.shape===sh.id?.9:.4}}/>
                  {sh[lang]}
                </button>
              ))}
            </div>
          </Field>

          <Field label={lang==="tr"?"Durum":"Status"}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {statusOpts.map(st => (
                <button key={st.id} onClick={()=>set("status", st.id)} style={{
                  padding:"8px 12px", borderRadius:999, cursor:"pointer",
                  border:`1px solid ${d.status===st.id?st.dot:"var(--line)"}`,
                  background: d.status===st.id?`${st.dot}15`:"var(--card-2)",
                  color: d.status===st.id?st.dot:"var(--ink-2)",
                  fontSize:12, fontWeight:600,
                  display:"inline-flex", alignItems:"center", gap:6}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:st.dot}}/>
                  {st[lang]}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Right — live preview */}
        <div style={{display:"grid",gap:10,alignContent:"start"}}>
          <div style={{fontSize:10,fontFamily:"var(--font-mono)",
            letterSpacing:".14em",textTransform:"uppercase",fontWeight:600,color:"var(--ink-3)"}}>
            {lang==="tr"?"Önizleme":"Preview"}
          </div>
          <div style={{height:200,borderRadius:14,background:`${zone?.color||"#ccc"}10`,
            border:`1px dashed ${zone?.color||"var(--line-2)"}55`,
            display:"grid",placeItems:"center",position:"relative"}}>
            <div style={{
              width: d.shape==="rect" ? previewSize*1.4 : previewSize,
              height: previewSize,
              borderRadius: d.shape==="round" ? "50%" : 14,
              background: "var(--card)",
              border: `2px solid ${statusOpts.find(s=>s.id===d.status)?.dot || "var(--accent)"}`,
              display:"grid", placeItems:"center",
              fontFamily:"var(--font-display)",fontStyle:"italic",
              fontSize: d.shape==="rect"?26:24, fontWeight:600,
              color:"var(--ink)",
              boxShadow:"0 4px 14px rgba(0,0,0,.07)"}}>
              {d.name || "?"}
            </div>
            <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center",
              fontSize:10,fontFamily:"var(--font-mono)",
              letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink-3)",fontWeight:600}}>
              {zone?.name[lang]} · {d.seats} {lang==="tr"?"kişi":"seats"}
            </div>
          </div>
          <div style={{padding:"10px 12px",borderRadius:10,background:"var(--paper-2)",
            border:"1px solid var(--line)",fontSize:11,color:"var(--ink-2)",lineHeight:1.5}}>
            <Icon name="qr" size={12} style={{marginRight:6,color:zone?.color}}/>
            {lang==="tr"
              ? <>QR kodu <b>QR Kod</b> ekranında bu masa için otomatik görünür.</>
              : <>A QR code for this table appears automatically in the <b>QR Code</b> screen.</>}
          </div>
        </div>
      </div>

      <div style={{display:"flex", gap:8, paddingTop:14, borderTop:"1px solid var(--line)", marginTop:16}}>
        {modal.mode === "edit" && (
          <Button variant="danger" icon="trash" onClick={()=>onDelete(d.id)}>
            {lang==="tr"?"Sil":"Delete"}
          </Button>
        )}
        <div style={{flex:1}}/>
        <Button variant="ghost" onClick={()=>setModal(null)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
        <Button variant="primary" icon="check" onClick={onSave}>{lang==="tr"?"Kaydet":"Save"}</Button>
      </div>
    </Modal>
  );
};

/* ───── Zone Modal ───── */
const ZoneModal = ({modal, setModal, lang, onSave, onDelete}) => {
  if (!modal) return null;
  const d = modal.draft;
  const set = (k, v) => setModal(m => ({...m, draft:{...m.draft, [k]:v}}));
  const setName = (l, v) => setModal(m => ({...m, draft:{...m.draft, name:{...m.draft.name, [l]:v}}}));
  const colors = ["#C4553A","#6B7A4B","#2E5B7A","#B08A3E","#7E3A6B","#4A3A2C","#D97757","#6E7F8D"];
  return (
    <Modal open={true} onClose={()=>setModal(null)} width={440}
      title={modal.mode==="add" ? (lang==="tr"?"Bölge ekle":"Add zone") : (lang==="tr"?"Bölge düzenle":"Edit zone")}>
      <div style={{display:"grid", gap:12}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <Field label={lang==="tr"?"Ad · Türkçe":"Name · Turkish"}>
            <Input value={d.name?.tr || ""} onChange={e=>setName("tr", e.target.value)} placeholder="Teras"/>
          </Field>
          <Field label={lang==="tr"?"Ad · İngilizce":"Name · English"}>
            <Input value={d.name?.en || ""} onChange={e=>setName("en", e.target.value)} placeholder="Terrace"/>
          </Field>
        </div>
        <Field label={lang==="tr"?"Renk":"Color"}>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {colors.map(c => (
              <button key={c} onClick={()=>set("color", c)} style={{
                width:32, height:32, borderRadius:8, background:c, cursor:"pointer",
                border: d.color===c?"2px solid var(--ink)":"1px solid var(--line)"}}/>
            ))}
          </div>
        </Field>
        <div style={{display:"flex", gap:8, paddingTop:8, borderTop:"1px solid var(--line)", marginTop:4}}>
          {modal.mode === "edit" && (
            <Button variant="danger" icon="trash" onClick={()=>onDelete(d.id)}>
              {lang==="tr"?"Sil":"Delete"}
            </Button>
          )}
          <div style={{flex:1}}/>
          <Button variant="ghost" onClick={()=>setModal(null)}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
          <Button variant="primary" onClick={onSave}>{lang==="tr"?"Kaydet":"Save"}</Button>
        </div>
      </div>
    </Modal>
  );
};

Object.assign(window, { TablesScreen });
