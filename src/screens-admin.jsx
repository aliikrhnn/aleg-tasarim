// Stations admin + Roles & Permissions + Category modal
// These power the "organisation" side of the cafe OS: what stations exist,
// who can do what, and a polished category creation flow.

/* ============ ADD/EDIT CATEGORY MODAL ============ */
const HERO_CHOICES = [
  "coffee","pourover","seasonal","pastry","brunch","cold","wine",
  "cookie","v60","lemonade","salad","sourdough"
];

const AddCategoryModal = ({open, onClose, t, lang, onSave, draft, setDraft, mode="add"}) => {
  if (!draft) return null;
  const canSave = (draft.name?.tr||"").trim() || (draft.name?.en||"").trim();
  return (
    <Modal open={open} onClose={onClose} width={580}
      title={mode==="edit"?t("editCategoryTitle"):t("addCategoryTitle")}
      subtitle={lang==="tr"
        ?"Menü ana başlığı. İki dilde ad, görsel stili ve isteğe bağlı rozet."
        :"A top-level menu section. Name in both languages, a hero style and optional badge."}>
      <div style={{display:"grid",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("catNameTr")} required>
            <Input autoFocus value={draft.name?.tr||""}
              onChange={e=>setDraft({...draft,name:{...draft.name,tr:e.target.value}})}
              placeholder="Espresso Bazlı"/>
          </Field>
          <Field label={t("catNameEn")}>
            <Input value={draft.name?.en||""}
              onChange={e=>setDraft({...draft,name:{...draft.name,en:e.target.value}})}
              placeholder="Espresso Bar"/>
          </Field>
        </div>

        <Field label={t("catHero")}
          hint={lang==="tr"?"Kategori kartı için görsel stili seç.":"Pick a hero style for the card."}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginTop:4}}>
            {HERO_CHOICES.map(h => (
              <button key={h} onClick={()=>setDraft({...draft,hero:h})} style={{
                padding:4,borderRadius:8,background:"var(--card-2)",
                border: draft.hero===h?"2px solid var(--accent)":"1.5px solid var(--line)",
                cursor:"pointer",display:"grid",placeItems:"center"
              }} title={h}>
                <FoodTile kind={h} w={64} h={46}/>
              </button>
            ))}
          </div>
        </Field>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("catBadge")}>
            <Select value={draft.badge||""}
              onChange={e=>setDraft({...draft,badge:e.target.value||null})}>
              <option value="">—</option>
              <option value="new">NEW</option>
              <option value="seasonal">{lang==="tr"?"Mevsimlik":"Seasonal"}</option>
              <option value="bestseller">{lang==="tr"?"En çok":"Best"}</option>
            </Select>
          </Field>
          <Field label={t("status")}>
            <div style={{padding:"9px 12px",borderRadius:10,border:"1px solid var(--line)",
              background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13}}>{draft.active?t("active"):(lang==="tr"?"Kapalı":"Hidden")}</span>
              <Toggle on={draft.active} onChange={v=>setDraft({...draft,active:v})}/>
            </div>
          </Field>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
        paddingTop:18,borderTop:"1px solid var(--line)"}}>
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" icon="check" onClick={()=>canSave && onSave()}>{t("save")}</Button>
      </div>
    </Modal>
  );
};


/* ============ STATIONS ADMIN ============
   List the stations, let the user add, rename, recolor, pick categories
   and on-shift staff per station.                                         */

const STATION_ICONS = ["glass","chef","cookie","bag","coffee","bell"];
const STATION_COLORS = ["#2E5B7A","#C4553A","#B08A3E","#6B7A4B","#7E3A6B","#1E1E1E"];

const StationModal = ({open, onClose, t, lang, draft, setDraft, onSave, mode, categories, staff}) => {
  if (!draft) return null;
  const toggleCat = (id) => {
    const has = draft.categories.includes(id);
    setDraft({...draft, categories: has ? draft.categories.filter(x=>x!==id) : [...draft.categories, id]});
  };
  const toggleStaff = (id) => {
    const has = draft.staff.includes(id);
    setDraft({...draft, staff: has ? draft.staff.filter(x=>x!==id) : [...draft.staff, id]});
  };
  return (
    <Modal open={open} onClose={onClose} width={620}
      title={mode==="edit"?t("editStation"):t("addStation")}
      subtitle={lang==="tr"
        ?"Her istasyonun kendi ekranı olur — bu kategorilere ait siparişleri gösterir."
        :"Each station has its own screen showing orders for these categories."}>
      <div style={{display:"grid",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("stationName") + " (TR)"} required>
            <Input autoFocus value={draft.name?.tr||""}
              onChange={e=>setDraft({...draft,name:{...draft.name,tr:e.target.value}})}
              placeholder="Bar"/>
          </Field>
          <Field label={t("stationName") + " (EN)"}>
            <Input value={draft.name?.en||""}
              onChange={e=>setDraft({...draft,name:{...draft.name,en:e.target.value}})}
              placeholder="Bar"/>
          </Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label={t("stationIcon")}>
            <div style={{display:"flex",gap:6}}>
              {STATION_ICONS.map(ic => (
                <button key={ic} onClick={()=>setDraft({...draft,icon:ic})} style={{
                  width:42,height:42,borderRadius:10,display:"grid",placeItems:"center",
                  background: draft.icon===ic?"var(--accent-soft)":"var(--card-2)",
                  color: draft.icon===ic?"var(--accent-ink)":"var(--ink-2)",
                  border: draft.icon===ic?"1.5px solid var(--accent)":"1.5px solid var(--line)",
                  cursor:"pointer"
                }}><Icon name={ic} size={20}/></button>
              ))}
            </div>
          </Field>
          <Field label={t("stationColor")}>
            <div style={{display:"flex",gap:6}}>
              {STATION_COLORS.map(c=>(
                <button key={c} onClick={()=>setDraft({...draft,color:c})} style={{
                  width:32,height:32,borderRadius:8,background:c,cursor:"pointer",
                  border: draft.color===c?"3px solid var(--ink)":"1px solid var(--line)"
                }}/>
              ))}
            </div>
          </Field>
        </div>

        <Field label={t("stationCategories")} hint={t("stationCategoriesHint")}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginTop:4}}>
            {categories.map(c => {
              const on = draft.categories.includes(c.id);
              return (
                <button key={c.id} onClick={()=>toggleCat(c.id)} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                  borderRadius:10,cursor:"pointer",
                  background: on?"var(--accent-soft)":"var(--card-2)",
                  border: on?"1.5px solid var(--accent)":"1.5px solid var(--line)",
                  color: on?"var(--accent-ink)":"var(--ink)",textAlign:"left"
                }}>
                  <span style={{width:16,height:16,borderRadius:5,display:"grid",placeItems:"center",
                    background: on?draft.color:"transparent",
                    border: on?"none":"1.5px solid var(--line-2)",color:"#fff"}}>
                    {on && <Icon name="check" size={11}/>}
                  </span>
                  <span style={{fontSize:12.5,fontWeight:500,flex:1}}>{c.name[lang]}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={t("stationStaff")} hint={t("stationStaffHint")}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
            {staff.map(s => {
              const on = draft.staff.includes(s.id);
              const initials = s.name.split(" ").map(x=>x[0]).join("").slice(0,2);
              return (
                <button key={s.id} onClick={()=>toggleStaff(s.id)} style={{
                  display:"flex",alignItems:"center",gap:8,padding:"6px 10px 6px 6px",
                  borderRadius:999,cursor:"pointer",
                  background: on?"var(--accent-soft)":"var(--card-2)",
                  border: on?"1.5px solid var(--accent)":"1.5px solid var(--line)",
                }}>
                  <span style={{width:24,height:24,borderRadius:"50%",background:s.color,
                    color:"#FFF8EC",display:"grid",placeItems:"center",fontSize:10,fontWeight:700,
                    fontFamily:"'DM Mono',ui-monospace,monospace"}}>{initials}</span>
                  <span style={{fontSize:12,fontWeight:500}}>{s.name}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
      <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
        paddingTop:18,borderTop:"1px solid var(--line)"}}>
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" icon="check" onClick={onSave}>{t("save")}</Button>
      </div>
    </Modal>
  );
};

const defaultStationDraft = () => ({
  name:{tr:"",en:""}, icon:"glass", color:"#2E5B7A",
  categories:[], staff:[], kind:"bar",
  description:{tr:"",en:""}
});

const StationsAdmin = ({t, lang, stations, setStations, categories, staff, onOpenStation}) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(defaultStationDraft());
  const [editId, setEditId] = React.useState(null);
  const [confirmId, setConfirmId] = React.useState(null);

  const openAdd = () => { setDraft(defaultStationDraft()); setEditId(null); setOpen(true); };
  const openEdit = (s) => { setDraft({...s}); setEditId(s.id); setOpen(true); };
  const onSave = () => {
    if (!(draft.name?.tr||draft.name?.en||"").trim()) return;
    if (editId) setStations(stations.map(s => s.id===editId ? {...draft, id:editId} : s));
    else setStations([...stations, {...draft, id:"st_"+Date.now()}]);
    setOpen(false);
  };
  const onDelete = (id) => { setStations(stations.filter(s=>s.id!==id)); setConfirmId(null); };

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("stationsTitle")}
        sub={t("stationsSub")}
        actions={<Button variant="primary" icon="plus" onClick={openAdd}>{t("addStation")}</Button>}
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {stations.map(s => {
          const catNames = s.categories.map(cid => categories.find(c=>c.id===cid)?.name[lang]).filter(Boolean);
          const staffOnDuty = s.staff.map(sid => staff.find(x=>x.id===sid)).filter(Boolean);
          return (
            <Card key={s.id} pad={0} style={{overflow:"hidden"}}>
              <div style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12,
                background:`linear-gradient(100deg, ${s.color}15, transparent 60%)`,
                borderBottom:"1px solid var(--line)",flexWrap:"wrap"}}>
                <div style={{width:48,height:48,borderRadius:12,background:s.color,color:"#FFF8EC",
                  display:"grid",placeItems:"center",boxShadow:`0 4px 12px ${s.color}30`,flexShrink:0}}>
                  <Icon name={s.icon} size={24}/>
                </div>
                <div style={{flex:"1 1 120px",minWidth:0}}>
                  <div style={{fontSize:18,fontWeight:500,letterSpacing:"-0.02em",
                    fontFamily:"var(--font-display,'Bricolage Grotesque')",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name[lang]}</div>
                  {s.description && (s.description[lang]||"") && (
                    <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:2,lineHeight:1.3,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {s.description[lang]}
                    </div>
                  )}
                </div>
                <Button variant="soft" size="sm" icon="maximize" onClick={()=>onOpenStation(s.id)}>
                  {t("openStation")}
                </Button>
              </div>

              <div style={{padding:"14px 20px",display:"grid",gap:10}}>
                <div>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",
                    color:"var(--ink-3)",letterSpacing:".12em",textTransform:"uppercase",
                    fontWeight:600,marginBottom:6}}>
                    {t("stationCategories")} <span style={{color:"var(--ink-3)"}}>· {catNames.length}</span>
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {catNames.length === 0 ? (
                      <span style={{fontSize:11,color:"var(--ink-3)",fontStyle:"italic"}}>
                        {lang==="tr"?"Kategori seçilmedi":"No categories assigned"}
                      </span>
                    ) : catNames.map((n,i)=>(
                      <span key={i} style={{fontSize:11,padding:"3px 9px",borderRadius:999,
                        background:"var(--card-2)",border:"1px solid var(--line)",
                        color:"var(--ink-2)",fontWeight:500}}>{n}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",
                    color:"var(--ink-3)",letterSpacing:".12em",textTransform:"uppercase",
                    fontWeight:600,marginBottom:6}}>
                    {t("stationStaff")} <span style={{color:"var(--ink-3)"}}>· {staffOnDuty.length}</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {staffOnDuty.length === 0 ? (
                      <span style={{fontSize:11,color:"var(--ink-3)",fontStyle:"italic"}}>
                        {lang==="tr"?"Personel atanmadı":"No staff assigned"}
                      </span>
                    ) : (
                      <>
                        <div style={{display:"flex"}}>
                          {staffOnDuty.slice(0,5).map((st,i)=>{
                            const ini = st.name.split(" ").map(x=>x[0]).join("").slice(0,2);
                            return (
                              <div key={st.id} title={st.name} style={{
                                width:30,height:30,borderRadius:"50%",background:st.color,
                                color:"#FFF8EC",display:"grid",placeItems:"center",
                                fontSize:11,fontWeight:700,fontFamily:"'DM Mono',ui-monospace,monospace",
                                border:"2px solid var(--card)",
                                marginLeft:i===0?0:-8
                              }}>{ini}</div>
                            );
                          })}
                        </div>
                        {staffOnDuty.length > 5 && (
                          <span style={{fontSize:11,color:"var(--ink-3)",
                            fontFamily:"'DM Mono',ui-monospace,monospace"}}>+{staffOnDuty.length-5}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{padding:"10px 16px",borderTop:"1px solid var(--line)",
                display:"flex",gap:6,justifyContent:"flex-end",background:"var(--paper-2)"}}>
                <Button variant="ghost" size="sm" icon="trash"
                  onClick={()=>setConfirmId(s.id)} style={{color:"var(--ink-3)"}}>
                  {t("delete")}
                </Button>
                <Button variant="soft" size="sm" icon="edit" onClick={()=>openEdit(s)}>{t("edit")}</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <StationModal open={open} onClose={()=>setOpen(false)} t={t} lang={lang}
        draft={draft} setDraft={setDraft} onSave={onSave} mode={editId?"edit":"add"}
        categories={categories} staff={staff}/>

      <Modal open={!!confirmId} onClose={()=>setConfirmId(null)} width={420}
        title={lang==="tr"?"İstasyonu sil?":"Delete station?"}
        subtitle={t("confirmDelete")}>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setConfirmId(null)}>{t("cancel")}</Button>
          <Button variant="danger" icon="trash" onClick={()=>onDelete(confirmId)}>{t("delete")}</Button>
        </div>
      </Modal>
    </div>
  );
};


/* ============ ROLES & PERMISSIONS ============
   Matrix view grouped by section. Click a cell to cycle none→view→edit.   */

const PERM_LEVELS = ["none","view","edit"];
const nextLevel = (lvl) => PERM_LEVELS[(PERM_LEVELS.indexOf(lvl)+1) % PERM_LEVELS.length];

const PermCell = ({level, onClick, locked, t}) => {
  const colors = {
    none: {bg:"var(--card-2)", ink:"var(--ink-3)", border:"var(--line)", icon:"close"},
    view: {bg:"rgba(46,91,122,.12)", ink:"#2E5B7A", border:"rgba(46,91,122,.3)", icon:"eye"},
    edit: {bg:"rgba(79,124,76,.14)", ink:"var(--ok)", border:"rgba(79,124,76,.35)", icon:"check"},
  }[level] || {bg:"var(--card-2)", ink:"var(--ink-3)", border:"var(--line)", icon:"close"};
  return (
    <button onClick={locked?null:onClick} disabled={locked} style={{
      display:"inline-flex",alignItems:"center",gap:6,padding:"6px 10px",
      borderRadius:8,fontSize:11,fontWeight:600,
      fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".08em",textTransform:"uppercase",
      background: colors.bg, color: colors.ink, border:`1px solid ${colors.border}`,
      cursor: locked?"not-allowed":"pointer", opacity: locked?.7:1,
      minWidth:88,justifyContent:"center"
    }} title={locked?(t("roleLocked")||"Locked"):""}>
      <Icon name={colors.icon} size={11}/>
      <span>{t("permission_"+level)}</span>
    </button>
  );
};

const ROLE_COLORS = ["#C4553A","#2E5B7A","#6B7A4B","#B08A3E","#7E3A6B","#1A1410","#7E5B3A"];

const RoleModal = ({open, onClose, t, lang, draft, setDraft, onSave, mode, sections, team}) => {
  if (!draft) return null;
  const grouped = {};
  sections.forEach(s => {
    grouped[s.group] = grouped[s.group] || [];
    grouped[s.group].push(s);
  });

  const members = team ? team.filter(m => m.role === (draft.id||"")) : [];

  return (
    <Modal open={open} onClose={onClose} width={760}
      title={mode==="edit"?t("editRole"):t("addRole")}
      subtitle={lang==="tr"
        ?"Her bölüm için erişim seviyesini seç. Kutuya tıklayarak yok → görüntüle → düzenle sırasıyla değiştir."
        :"Pick an access level per section. Click a cell to cycle none → view → edit."}>
      <div style={{display:"grid",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:12}}>
          <Field label={t("roleName")} required>
            <Input autoFocus value={draft.name?.[lang]||""}
              onChange={e=>setDraft({...draft,name:{...draft.name,[lang]:e.target.value}})}
              placeholder={lang==="tr"?"Barista":"Barista"}/>
          </Field>
          <Field label={t("roleColor")}>
            <div style={{display:"flex",gap:6}}>
              {ROLE_COLORS.map(c=>(
                <button key={c} onClick={()=>setDraft({...draft,color:c})} style={{
                  width:28,height:28,borderRadius:7,background:c,cursor:"pointer",
                  border: draft.color===c?"3px solid var(--ink)":"1px solid var(--line)"
                }}/>
              ))}
            </div>
          </Field>
        </div>
        <Field label={t("roleDesc")}>
          <Textarea rows={2} value={draft.desc?.[lang]||""}
            onChange={e=>setDraft({...draft,desc:{...draft.desc,[lang]:e.target.value}})}
            placeholder={lang==="tr"?"Bu rol ne yapar, kim kullanır?":"What does this role do?"}/>
        </Field>

        <div style={{background:"var(--paper-2)",border:"1px solid var(--line)",borderRadius:12,
          padding:"14px 16px"}}>
          <div style={{fontSize:11,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
            letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>
            {lang==="tr"?"İzin Matrisi":"Permission Matrix"}
          </div>
          {Object.entries(grouped).map(([group, secs]) => (
            <div key={group} style={{marginBottom:14}}>
              <div style={{fontSize:10,color:"var(--ink-3)",fontWeight:700,letterSpacing:".1em",
                textTransform:"uppercase",marginBottom:6,paddingLeft:2}}>
                {t("permSection_"+group) || group}
              </div>
              <div style={{display:"grid",gap:4}}>
                {secs.map(sec => (
                  <div key={sec.id} style={{display:"flex",alignItems:"center",gap:10,
                    padding:"7px 10px",borderRadius:8,background:"var(--card)"}}>
                    <div style={{flex:1,fontSize:13,fontWeight:500}}>
                      {t("nav_"+sec.id) || sec.id}
                    </div>
                    <div style={{fontSize:10.5,color:"var(--ink-3)",
                      fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".06em"}}>
                      {sec.screens.join(" · ")}
                    </div>
                    <PermCell level={draft.permissions[sec.id]||"none"} t={t}
                      locked={draft.locked}
                      onClick={()=>setDraft({...draft,permissions:{
                        ...draft.permissions, [sec.id]: nextLevel(draft.permissions[sec.id]||"none")
                      }})}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {members.length > 0 && (
          <div style={{fontSize:12,color:"var(--ink-3)"}}>
            {members.length} {t("roleMembers")} · {members.map(m=>m.name).join(", ")}
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
        paddingTop:18,borderTop:"1px solid var(--line)"}}>
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        {!draft.locked && (
          <Button variant="primary" icon="check" onClick={onSave}>{t("save")}</Button>
        )}
      </div>
    </Modal>
  );
};

const defaultRoleDraft = () => ({
  name:{tr:"",en:""}, color:"#2E5B7A", locked:false,
  desc:{tr:"",en:""}, permissions: {}
});

const Roles = ({t, lang, roles, setRoles, sections, team}) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(defaultRoleDraft());
  const [editId, setEditId] = React.useState(null);
  const [confirmId, setConfirmId] = React.useState(null);

  const openAdd = () => { setDraft(defaultRoleDraft()); setEditId(null); setOpen(true); };
  const openEdit = (r) => { setDraft({...r}); setEditId(r.id); setOpen(true); };
  const onSave = () => {
    if (!(draft.name?.tr||draft.name?.en||"").trim()) return;
    if (editId) setRoles(roles.map(r => r.id===editId ? {...draft, id:editId} : r));
    else setRoles([...roles, {...draft, id:"r_"+Date.now()}]);
    setOpen(false);
  };
  const onDelete = (id) => { setRoles(roles.filter(r=>r.id!==id)); setConfirmId(null); };

  const summarize = (perms) => {
    const edit = Object.values(perms).filter(v=>v==="edit").length;
    const view = Object.values(perms).filter(v=>v==="view").length;
    const total = sections.length;
    if (edit === total) return {label:t("permAll"), tone:"ok"};
    return {label:`${edit} ${t("permission_edit").toLowerCase()} · ${view} ${t("permission_view").toLowerCase()}`, tone:"muted"};
  };

  return (
    <div style={{display:"grid",gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("rolesTitle")}
        sub={t("rolesSub")}
        actions={<Button variant="primary" icon="plus" onClick={openAdd}>{t("addRole")}</Button>}
      />

      <Card pad={0}>
        <div style={{padding:"14px 22px", display:"grid",
          gridTemplateColumns:"40px 1.4fr 2fr 1fr 120px 140px",
          gap:14, borderBottom:"1px solid var(--line)", fontSize:11, fontWeight:600,
          color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:".08em",
          fontFamily:"'DM Mono',ui-monospace,monospace"}}>
          <span/>
          <span>{t("roleName")}</span>
          <span>{t("roleDesc")}</span>
          <span>{t("roleAssignees")}</span>
          <span>{t("permSummary")}</span>
          <span style={{textAlign:"right"}}>{t("actions")}</span>
        </div>

        {roles.map(r => {
          const sum = summarize(r.permissions||{});
          const members = team ? team.filter(m => m.role === r.id) : [];
          return (
            <div key={r.id} style={{padding:"14px 22px",display:"grid",
              gridTemplateColumns:"40px 1.4fr 2fr 1fr 120px 140px",
              gap:14,borderBottom:"1px solid var(--line)",alignItems:"center"}}>
              <span style={{width:28,height:28,borderRadius:"50%",background:r.color,
                display:"inline-grid",placeItems:"center",color:"#FFF8EC"}}>
                <Icon name={r.locked?"sparkle":"users"} size={14}/>
              </span>
              <div>
                <div style={{fontSize:14.5,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
                  {r.name[lang]}
                  {r.locked && <span style={{fontSize:9,fontFamily:"'DM Mono',ui-monospace,monospace",
                    padding:"2px 6px",borderRadius:4,background:"var(--ink)",color:"var(--paper)",
                    letterSpacing:".1em",fontWeight:600}}>LOCKED</span>}
                </div>
                <div style={{fontSize:11,color:"var(--ink-3)",marginTop:2,
                  fontFamily:"'DM Mono',ui-monospace,monospace"}}>{r.id}</div>
              </div>
              <div style={{fontSize:12.5,color:"var(--ink-2)",lineHeight:1.4}}>
                {r.desc?.[lang]||"—"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {members.length === 0 ? (
                  <span style={{fontSize:12,color:"var(--ink-3)"}}>—</span>
                ) : (
                  <>
                    <div style={{display:"flex"}}>
                      {members.slice(0,3).map((m,i)=>{
                        const ini = m.name.split(" ").map(x=>x[0]).join("").slice(0,2);
                        return (
                          <div key={m.id||i} title={m.name} style={{
                            width:24,height:24,borderRadius:"50%",background:r.color,
                            color:"#FFF8EC",display:"grid",placeItems:"center",
                            fontSize:9.5,fontWeight:700,fontFamily:"'DM Mono',ui-monospace,monospace",
                            border:"2px solid var(--card)",marginLeft:i===0?0:-6
                          }}>{ini}</div>
                        );
                      })}
                    </div>
                    <span style={{fontSize:12,color:"var(--ink-3)",
                      fontFamily:"'DM Mono',ui-monospace,monospace"}}>
                      {members.length}
                    </span>
                  </>
                )}
              </div>
              <div>
                <Pill tone={sum.tone} size="sm">{sum.label}</Pill>
              </div>
              <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                {!r.locked && (
                  <Button variant="ghost" size="sm" icon="trash"
                    onClick={()=>setConfirmId(r.id)} style={{color:"var(--ink-3)"}}/>
                )}
                <Button variant="soft" size="sm" icon="edit" onClick={()=>openEdit(r)}>
                  {r.locked?t("nav_products").substring(0,0)+(lang==="tr"?"Görüntüle":"View"):t("edit")}
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      <RoleModal open={open} onClose={()=>setOpen(false)} t={t} lang={lang}
        draft={draft} setDraft={setDraft} onSave={onSave} mode={editId?"edit":"add"}
        sections={sections} team={team}/>

      <Modal open={!!confirmId} onClose={()=>setConfirmId(null)} width={420}
        title={t("deleteRole")}
        subtitle={t("confirmDelete")}>
        <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setConfirmId(null)}>{t("cancel")}</Button>
          <Button variant="danger" icon="trash" onClick={()=>onDelete(confirmId)}>{t("delete")}</Button>
        </div>
      </Modal>
    </div>
  );
};


Object.assign(window, { AddCategoryModal, StationsAdmin, Roles, StationModal });
