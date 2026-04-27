// Waiter calls + Settings + Branches + Team screens

const Waiter = ({t, lang, calls, setCalls}) => {
  const [enabled, setEnabled] = React.useState(true);
  const [sound, setSound] = React.useState("s2");
  const sounds = [
    {id:"s0", name:{tr:"Sessiz",en:"Silent"}},
    {id:"s1", name:{tr:"Bildirim + Konuşma",en:"Chime + voice"}},
    {id:"s2", name:{tr:"Klasik",en:"Classic"}},
    {id:"s3", name:{tr:"Yumuşak",en:"Soft"}},
    {id:"s4", name:{tr:"Restoran zili",en:"Restaurant bell"}},
  ];
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_menu")}
        title={t("nav_waiter")}
        sub={lang==="tr"?"Müşterinin menüden garson çağırması ve gelen çağrıların yönetimi.":"Guests can call service from the menu; manage incoming requests here."}
      />
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <Card pad={0}>
          <div style={{padding:"18px 22px", borderBottom:"1px solid var(--line)",
            display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:16, fontWeight:600, letterSpacing:"-0.01em"}}>
                {lang==="tr"?"Modül Aktif":"Module active"}
              </div>
              <div style={{fontSize:12, color:"var(--ink-3)", marginTop:2}}>
                {lang==="tr"?"Garson çağır butonu menüde görünsün":"Show 'Call waiter' on the guest menu"}
              </div>
            </div>
            <Toggle on={enabled} onChange={setEnabled}/>
          </div>
          <div style={{padding:"6px 0"}}>
            {sounds.map(s=>(
              <div key={s.id} onClick={()=>setSound(s.id)} style={{
                display:"flex",alignItems:"center",gap:14,padding:"14px 22px",cursor:"pointer",
                background: sound===s.id?"var(--accent-soft)":"transparent",
                borderLeft: sound===s.id?"3px solid var(--accent)":"3px solid transparent"
              }}>
                <div style={{width:18,height:18,borderRadius:"50%",
                  border:`1.5px solid ${sound===s.id?"var(--accent)":"var(--line-2)"}`,
                  background: sound===s.id?"var(--accent)":"transparent",
                  display:"grid", placeItems:"center"}}>
                  {sound===s.id && <div style={{width:6,height:6,borderRadius:"50%",background:"#FFF8EC"}}/>}
                </div>
                <div style={{flex:1, fontSize:13.5, fontWeight: sound===s.id?600:500}}>{s.name[lang]}</div>
                <Button variant="soft" size="sm" icon="play">{lang==="tr"?"Çal":"Play"}</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={0}>
          <div style={{padding:"18px 22px", borderBottom:"1px solid var(--line)",
            display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:16, fontWeight:600, letterSpacing:"-0.01em"}}>{t("waiterCallsTitle")}</div>
              <div style={{fontSize:12, color:"var(--ink-3)", marginTop:2, fontFamily:"'DM Mono',ui-monospace,monospace"}}>
                {calls.length} {lang==="tr"?"aktif":"active"}
              </div>
            </div>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,
              padding:"4px 10px",borderRadius:999,background:"var(--accent-soft)",
              color:"var(--accent-ink)",fontSize:11,fontWeight:600,
              fontFamily:"'DM Mono',ui-monospace,monospace",letterSpacing:".08em"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",
                animation:"pulse 1.4s infinite"}}/> LIVE
            </span>
          </div>
          <div>
            {calls.length===0 && <div style={{padding:40, textAlign:"center", color:"var(--ink-3)"}}>{t("noCalls")}</div>}
            {calls.map(c => (
              <div key={c.id} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:14,
                padding:"16px 22px",borderBottom:"1px solid var(--line)",alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:14,
                  background: c.mins===0?"var(--accent-soft)":"var(--paper-2)",
                  color: c.mins===0?"var(--accent-ink)":"var(--ink-3)",
                  display:"grid",placeItems:"center"}}>
                  <Icon name="bell" size={22} style={{animation: c.mins===0?"bell 1.2s infinite":""}}/>
                </div>
                <div>
                  <div style={{fontSize:18,fontWeight:600,letterSpacing:"-0.015em",
                    fontFamily:"var(--font-display,'Fraunces')"}}>
                    {lang==="tr"?"Masa":"Table"} <span style={{fontFamily:"'DM Mono',ui-monospace,monospace"}}>{String(c.table).padStart(2,"0")}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--ink-3)",marginTop:2}}>
                    {c.reason[lang]} · {c.mins===0?t("justNow"):`${c.mins} ${t("minute")}`}
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Button variant="soft" size="sm" onClick={()=>setCalls(calls.filter(x=>x.id!==c.id))}>{t("resolve")}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const Settings = ({t, lang}) => (
  <div style={{display:"grid", gap:22}}>
    <SectionHead
      eyebrow={t("nav_settings")}
      title={t("nav_business")}
      sub={lang==="tr"?"İşletme bilgileri, fatura adresi, çalışma saatleri ve yerel ayarlar.":"Business info, billing, hours and locale settings."}
      actions={<Button variant="primary" icon="check">{t("save")}</Button>}
    />
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
      <Card>
        <div style={{display:"grid", gap:14}}>
          <div style={{fontSize:12, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".12em",
            textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>{lang==="tr"?"İşletme":"Business"}</div>
          <Field label={lang==="tr"?"İşletme adı":"Business name"}>
            <Input defaultValue="Aleg Coffee Roasters"/>
          </Field>
          <Field label="URL">
            <div style={{display:"flex",alignItems:"center",gap:0}}>
              <div style={{padding:"0 14px",height:42,display:"grid",placeItems:"center",
                fontSize:13,color:"var(--ink-3)",background:"var(--paper-2)",
                border:"1px solid var(--line)",borderRight:"none",borderRadius:"10px 0 0 10px",
                fontFamily:"'DM Mono',ui-monospace,monospace"}}>menu.aleg.cafe/</div>
              <Input defaultValue="karakoy" style={{borderRadius:"0 10px 10px 0",flex:1}}/>
            </div>
          </Field>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <Field label={lang==="tr"?"Para birimi":"Currency"}><Select defaultValue="TRY"><option>TRY</option><option>USD</option><option>EUR</option></Select></Field>
            <Field label={lang==="tr"?"Saat dilimi":"Timezone"}><Select><option>Europe/Istanbul</option></Select></Field>
          </div>
          <Field label={lang==="tr"?"Birincil dil":"Primary language"}>
            <Select defaultValue={lang}><option value="tr">Türkçe</option><option value="en">English</option></Select>
          </Field>
        </div>
      </Card>
      <Card>
        <div style={{display:"grid", gap:14}}>
          <div style={{fontSize:12, fontFamily:"'DM Mono',ui-monospace,monospace", letterSpacing:".12em",
            textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>{lang==="tr"?"İletişim & Adres":"Contact & address"}</div>
          <Field label={lang==="tr"?"Adres":"Address"}>
            <Input defaultValue="Kemankeş Mah., Karaköy, İstanbul"/>
          </Field>
          <Field label={lang==="tr"?"Telefon":"Phone"}>
            <Input defaultValue="+90 212 244 10 01"/>
          </Field>
          <Field label="E-mail">
            <Input defaultValue="hello@aleg.cafe"/>
          </Field>
          <Field label={lang==="tr"?"Vergi No":"Tax ID"}>
            <Input defaultValue="1234567890" style={{fontFamily:"'DM Mono',ui-monospace,monospace"}}/>
          </Field>
          <div style={{padding:"14px 16px",borderRadius:10,background:"var(--paper-2)",
            border:"1px solid var(--line)",fontSize:12,color:"var(--ink-2)",lineHeight:1.5}}>
            {lang==="tr"
              ? "Modüller ayrı bir sayfada. Sol panelde 'Modüller' sekmesinden yönetebilirsin."
              : "Modules live on their own page. Open \"Modules\" in the sidebar to manage them."}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// Branches moved to screens-extras.jsx with full CRUD + hours.
const _LegacyBranches = ({t, lang, branches}) => (
  <div style={{display:"grid", gap:22}}>
    <SectionHead
      eyebrow={t("nav_settings")}
      title={t("nav_branches")}
      sub={lang==="tr"?"Aleg'in tüm şubeleri. Her şubenin kendi menüsü, masa düzeni ve ekibi olabilir.":"All Aleg branches. Each can have its own menu, floor plan and team."}
      actions={<Button variant="primary" icon="plus">{t("addNew")}</Button>}
    />
    <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
      {branches.map(b => (
        <Card key={b.id} pad={0} style={{overflow:"hidden"}}>
          <div style={{height:110, background:"linear-gradient(135deg,var(--paper-3),var(--paper-2))",
            position:"relative", borderBottom:"1px solid var(--line)"}}>
            <div style={{position:"absolute",top:12,left:14,display:"inline-flex",alignItems:"center",gap:6}}>
              <span style={{width:8,height:8,borderRadius:"50%",
                background: b.online?"var(--ok)":"var(--ink-3)"}}/>
              <span style={{fontSize:10.5,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-2)",
                letterSpacing:".1em",textTransform:"uppercase"}}>
                {b.online?(lang==="tr"?"Çevrimiçi":"Online"):(lang==="tr"?"Çevrimdışı":"Offline")}
              </span>
            </div>
            <div style={{position:"absolute",bottom:10,right:14,opacity:.15}}>
              <Icon name="building" size={56} stroke="var(--ink)"/>
            </div>
          </div>
          <div style={{padding:"16px 18px 18px"}}>
            <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.02em",
              fontFamily:"var(--font-display,'Fraunces')"}}>{b.name}</div>
            <div style={{fontSize:12, color:"var(--ink-3)", marginTop:4, display:"flex",gap:5,alignItems:"center"}}>
              <Icon name="pin" size={12}/> {b.address}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14,
              padding:"10px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)"}}>
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".1em",textTransform:"uppercase"}}>{lang==="tr"?"Masa":"Tables"}</div>
                <div style={{fontSize:20,fontWeight:500,fontFamily:"var(--font-display,'Fraunces')"}}>{b.tables}</div>
              </div>
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',ui-monospace,monospace",color:"var(--ink-3)",
                  letterSpacing:".1em",textTransform:"uppercase"}}>{lang==="tr"?"Yönetici":"Manager"}</div>
                <div style={{fontSize:13,fontWeight:500,marginTop:4}}>{b.manager}</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
              <Pill tone={b.status==="active"?"ok":"warn"}>
                {b.status==="active"?t("active"):(lang==="tr"?"Sezonluk":"Seasonal")}
              </Pill>
              <Button variant="ghost" size="sm" icon="chev-right">{t("edit")}</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/* Avatar colored background derived from the member's name — stable per-user. */
const _teamColors = ["#C4553A","#6B7A4B","#B08A3E","#2E5B7A","#7E3A6B","#8E5BA8","#3A6B5B","#A84E3E"];
const _colorFor = (name="") => _teamColors[Math.abs([...name].reduce((a,c)=>a+c.charCodeAt(0),0)) % _teamColors.length];

/* Photo picker — click or drag. Used in invite & edit modals. */
const TeamPhotoPicker = ({name="", photo, onChange, lang, t}) => {
  const ref = React.useRef();
  const handle = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => onChange(e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div
        onClick={()=>ref.current?.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault(); handle(e.dataTransfer.files[0]);}}
        style={{width:72,height:72,borderRadius:"50%",cursor:"pointer",position:"relative",
          overflow:"hidden",background: photo?`url(${photo}) center/cover`:_colorFor(name),
          color:"#FFF8EC",display:"grid",placeItems:"center",fontSize:22,fontWeight:600,
          border:"2px solid var(--line)"}}>
        {!photo && (name.split(" ").map(n=>n[0]).join("").slice(0,2) || "?")}
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",opacity:0,
          display:"grid",placeItems:"center",transition:"opacity .15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=1}
          onMouseLeave={e=>e.currentTarget.style.opacity=0}>
              <Icon name="camera" size={20} stroke="#FFF8EC"/>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <Button variant="soft" icon="image" onClick={()=>ref.current?.click()}>
          {photo ? (lang==="tr"?"Fotoğrafı değiştir":"Replace photo") : t("uploadPhoto")}
        </Button>
        {photo && (
          <button onClick={()=>onChange(null)}
            style={{fontSize:11.5,color:"var(--ink-3)",background:"none",border:"none",
              cursor:"pointer",textAlign:"left",padding:0,fontFamily:"'DM Mono',ui-monospace,monospace",
              letterSpacing:".06em",textTransform:"uppercase"}}>
            {lang==="tr"?"Kaldır":"Remove"}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>handle(e.target.files[0])}/>
      </div>
    </div>
  );
};

const Team = ({t, lang, team, setTeam, branches}) => {
  const roleLabel = (r) => ({
    owner:{tr:"Sahip",en:"Owner"},
    admin:{tr:"Yönetici",en:"Admin"},
    manager:{tr:"Müdür",en:"Manager"},
    operator:{tr:"Operatör",en:"Operator"},
  }[r][lang]);
  const emptyDraft = {name:"", email:"", role:"manager", branches:[], photo:null};
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState(emptyDraft);
  const branchList = (branches||[]).map(b=>b.name);

  const openInvite = () => { setEditingId(null); setDraft({...emptyDraft, branches: branchList[0]?[branchList[0]]:[]}); setOpen(true); };
  const openEdit = (u) => { setEditingId(u.id); setDraft({name:u.name, email:u.email, role:u.role, branches:u.branches||[], photo:u.photo||null}); setOpen(true); };

  const save = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    if (editingId) {
      setTeam(team.map(u => u.id===editingId ? {...u,
        name: draft.name.trim(), email: draft.email.trim(),
        role: draft.role, branches: draft.branches, photo: draft.photo} : u));
    } else {
      setTeam([...team, {
        id: "u" + Date.now(),
        name: draft.name.trim(), email: draft.email.trim(), role: draft.role,
        branches: draft.branches.length? draft.branches : (branchList[0]?[branchList[0]]:[]),
        photo: draft.photo, status: "invited",
      }]);
    }
    setOpen(false);
  };
  const remove = (id) => setTeam(team.filter(u => u.id !== id));
  const toggleBranch = (b) => setDraft(d =>
    ({...d, branches: d.branches.includes(b) ? d.branches.filter(x=>x!==b) : [...d.branches, b]}));

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("nav_team")}
        sub={lang==="tr"?"Ekip üyelerini davet et, rollerini ve şube erişimlerini yönet.":"Invite team members, assign roles and branch access."}
        actions={<Button variant="primary" icon="plus" onClick={openInvite}>{t("inviteMember")}</Button>}
      />
      <Card pad={0}>
        <div style={{padding:"14px 22px", display:"grid",
          gridTemplateColumns:"56px 1.5fr 1fr 1.2fr 100px 120px",gap:14,
          borderBottom:"1px solid var(--line)",fontSize:11,fontWeight:600,
          color:"var(--ink-3)",textTransform:"uppercase",letterSpacing:".08em",
          fontFamily:"'DM Mono',ui-monospace,monospace"}}>
          <span/><span>{lang==="tr"?"Üye":"Member"}</span><span>{lang==="tr"?"Rol":"Role"}</span>
          <span>{t("nav_branches")}</span><span>{t("status")}</span><span style={{textAlign:"right"}}>{t("actions")}</span>
        </div>
        {team.map((u,i)=>(
          <div key={u.id} style={{padding:"14px 22px",display:"grid",
            gridTemplateColumns:"56px 1.5fr 1fr 1.2fr 100px 120px",gap:14,
            borderBottom: i<team.length-1?"1px solid var(--line)":"none",alignItems:"center"}}>
            <Avatar name={u.name} photo={u.photo} color={_colorFor(u.name)} size={44}/>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{u.name}</div>
              <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:1,fontFamily:"'DM Mono',ui-monospace,monospace"}}>{u.email}</div>
            </div>
            <Pill tone={u.role==="owner"?"accent":"muted"}>{roleLabel(u.role)}</Pill>
            <div style={{fontSize:12,color:"var(--ink-2)",display:"flex",gap:4,flexWrap:"wrap"}}>
              {u.branches.slice(0,2).map(b=>(
                <span key={b} style={{padding:"2px 8px",background:"var(--paper-2)",
                  border:"1px solid var(--line)",borderRadius:999,fontSize:11}}>{b}</span>
              ))}
              {u.branches.length>2 && <span style={{fontSize:11,color:"var(--ink-3)"}}>+{u.branches.length-2}</span>}
            </div>
            {u.status==="active" ? <Pill tone="ok" icon="dot">{t("active")}</Pill>
              : <Pill tone="warn">{lang==="tr"?"Davetli":"Invited"}</Pill>}
            <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
              <button onClick={()=>openEdit(u)} title={lang==="tr"?"Düzenle":"Edit"}
                style={{width:30,height:30,borderRadius:8,border:"1px solid var(--line)",
                  background:"var(--card-2)",color:"var(--ink-2)",cursor:"pointer",
                  display:"grid",placeItems:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--paper-3)";e.currentTarget.style.color="var(--ink)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="var(--card-2)";e.currentTarget.style.color="var(--ink-2)";}}>
                <Icon name="pencil" size={13}/>
              </button>
              {u.role !== "owner" && (
                <button onClick={()=>remove(u.id)} title={t("removeStaff")}
                  style={{width:30,height:30,borderRadius:8,border:"1px solid var(--line)",
                    background:"var(--card-2)",color:"var(--ink-3)",cursor:"pointer",
                    display:"grid",placeItems:"center"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(184,74,58,.1)";e.currentTarget.style.color="var(--danger)";e.currentTarget.style.borderColor="rgba(184,74,58,.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--card-2)";e.currentTarget.style.color="var(--ink-3)";e.currentTarget.style.borderColor="var(--line)";}}>
                  <Icon name="trash" size={13}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Modal open={open} onClose={()=>setOpen(false)} width={540}
        title={editingId ? (lang==="tr"?"Üyeyi düzenle":"Edit member") : t("inviteMember")}
        subtitle={editingId
          ? (lang==="tr"?"Üyenin bilgilerini, fotoğrafını ve şube erişimini güncelle.":"Update member info, photo and branch access.")
          : (lang==="tr"?"Yeni bir ekip üyesi davet et. Davet e-postası gönderilir.":"Send an invite to a new teammate by email.")}>
        <div style={{display:"grid",gap:16}}>
          <Field label={t("photo")} hint={lang==="tr"?"Kare görsel en iyisi. JPG veya PNG.":"Square image works best. JPG or PNG."}>
            <TeamPhotoPicker name={draft.name} photo={draft.photo}
              onChange={p=>setDraft({...draft, photo:p})} lang={lang} t={t}/>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label={t("fullName")} required>
              <Input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}
                placeholder={lang==="tr"?"örn. Ada Yılmaz":"e.g. Ada Smith"} autoFocus={!editingId}/>
            </Field>
            <Field label={t("emailAddr")} required>
              <Input type="email" value={draft.email}
                onChange={e=>setDraft({...draft,email:e.target.value})}
                placeholder="ada@aleg.cafe" disabled={editingId && draft.role==="owner"}/>
            </Field>
          </div>
          <Field label={t("role")}>
            <Select value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value})}
              disabled={draft.role==="owner"}>
              {draft.role==="owner" && <option value="owner">{roleLabel("owner")}</option>}
              <option value="admin">{roleLabel("admin")}</option>
              <option value="manager">{roleLabel("manager")}</option>
              <option value="operator">{roleLabel("operator")}</option>
            </Select>
          </Field>
          <Field label={t("nav_branches")} hint={lang==="tr"?"Erişim verilecek şubeleri seç.":"Select branches this member can access."}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {branchList.map(b => {
                const on = draft.branches.includes(b);
                return (
                  <button key={b} onClick={()=>toggleBranch(b)}
                    style={{padding:"6px 12px",borderRadius:999,fontSize:12,cursor:"pointer",
                      background: on?"var(--accent)":"var(--paper-2)",
                      color: on?"#FFF8EC":"var(--ink-2)",
                      border:`1px solid ${on?"var(--accent)":"var(--line)"}`}}>
                    {b}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end",
          paddingTop:18,borderTop:"1px solid var(--line)"}}>
          <Button variant="ghost" onClick={()=>setOpen(false)}>{t("cancel")}</Button>
          <Button variant="primary" icon="check" onClick={save}>
            {editingId ? (lang==="tr"?"Kaydet":"Save") : t("inviteMember")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Waiter, Settings, Team });
