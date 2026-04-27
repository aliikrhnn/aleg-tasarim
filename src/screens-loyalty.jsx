// Loyalty: Members, Campaigns, Configuration
// Three sibling tabs under one nav entry.

const MemberAvatar = ({name, size=40}) => {
  const hue = (name.charCodeAt(0)*9) % 360;
  const initials = name.split(" ").filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase();
  return <div style={{
    width:size, height:size, borderRadius:"50%",
    background:`hsl(${hue},32%,62%)`, color:"#FFF8EC",
    display:"grid", placeItems:"center",
    fontSize:size*0.36, fontWeight:600, letterSpacing:".02em", flexShrink:0
  }}>{initials}</div>;
};

/* Segment helpers */
const daysSince = (iso) => {
  const d = new Date(iso); const now = new Date("2026-04-18");
  return Math.floor((now - d) / (1000*60*60*24));
};
const segmentOf = (m, cfg) => {
  const tags = [];
  if (m.visits >= 50) tags.push("vip");
  if (m.lifetimeSpent >= 10000) tags.push("big-spender");
  if (daysSince(m.lastVisit) > 14) tags.push("dormant");
  if (daysSince(m.since) < 30) tags.push("new");
  const remaining = (cfg.rewardAt||500) - m.points;
  if (remaining > 0 && remaining <= 100) tags.push("near-reward");
  const bd = new Date(m.birthday);
  if (bd.getMonth() === 3 /* Apr */) tags.push("birthday");
  return tags;
};

const SegChip = ({tag, lang}) => {
  const map = {
    vip:         {tr:"VIP",        en:"VIP",        tone:"accent"},
    "big-spender":{tr:"Büyük Harcayan", en:"Big Spender", tone:"warn"},
    dormant:     {tr:"Uyuyan",     en:"Dormant",    tone:"muted"},
    new:         {tr:"Yeni",       en:"New",        tone:"ok"},
    "near-reward":{tr:"Ödüle Yakın", en:"Near Reward", tone:"warn"},
    birthday:    {tr:"Doğum Günü", en:"Birthday",   tone:"accent"},
  };
  const m = map[tag]; if (!m) return null;
  return <Pill tone={m.tone} size="sm">{m[lang]}</Pill>;
};

/* ───────────── MEMBERS ───────────── */
const LoyaltyMembers = ({t, lang, members, setMembers, config, campaigns}) => {
  const [selected, setSelected] = React.useState(members[0]?.id);
  const [search, setSearch] = React.useState("");
  const [segFilter, setSegFilter] = React.useState("all");
  const [sort, setSort] = React.useState("recent");
  const [addOpen, setAddOpen] = React.useState(false);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 2200);
  };

  const filtered = members
    .filter(m => {
      if (search) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q)
          && !m.phone.replace(/\D/g,"").includes(search.replace(/\D/g,""))
          && !(m.email||"").toLowerCase().includes(q)) return false;
      }
      if (segFilter==="all") return true;
      return segmentOf(m, config).includes(segFilter);
    })
    .sort((a,b)=>{
      if (sort==="recent") return (a.lastVisit < b.lastVisit ? 1 : -1);
      if (sort==="points") return b.points - a.points;
      if (sort==="spent")  return b.lifetimeSpent - a.lifetimeSpent;
      if (sort==="visits") return b.visits - a.visits;
      if (sort==="new")    return (a.since < b.since ? 1 : -1);
      return 0;
    });

  const sel = members.find(m=>m.id===selected) || filtered[0];

  const totalPoints = members.reduce((s,m)=>s+m.points, 0);
  const totalSpent = members.reduce((s,m)=>s+m.lifetimeSpent, 0);
  const active30 = members.filter(m=>daysSince(m.lastVisit) <= 30).length;
  const avgVisits = Math.round(members.reduce((s,m)=>s+m.visits,0) / Math.max(1,members.length));

  const adjustPoints = (delta, reason) => {
    if (!sel) return;
    setMembers(members.map(m => m.id===sel.id
      ? {...m, points: Math.max(0, m.points + delta)}
      : m));
    showToast(`${delta>0?"+":""}${delta} ${lang==="tr"?"puan · ":"pts · "}${reason}`);
    setAdjustOpen(false);
  };

  const saveNew = (draft) => {
    const id = "l_"+Date.now();
    const newMember = {
      id, name: draft.name, phone: draft.phone, email: draft.email,
      points: config.welcomeBonus || 0,
      since: new Date().toISOString().slice(0,10),
      birthday: draft.birthday || "",
      visits: 0, lifetimeSpent: 0,
      lastVisit: new Date().toISOString().slice(0,10),
      channels: {push:true, email:!!draft.email}
    };
    setMembers([newMember, ...members]);
    setSelected(id);
    setAddOpen(false);
    showToast(lang==="tr"?`${draft.name} eklendi · +${config.welcomeBonus} hoşgeldin puanı`:`${draft.name} added · +${config.welcomeBonus} welcome pts`);
  };

  const segCounts = {
    all: members.length,
    vip: members.filter(m=>segmentOf(m,config).includes("vip")).length,
    "big-spender": members.filter(m=>segmentOf(m,config).includes("big-spender")).length,
    "near-reward": members.filter(m=>segmentOf(m,config).includes("near-reward")).length,
    dormant: members.filter(m=>segmentOf(m,config).includes("dormant")).length,
    new: members.filter(m=>segmentOf(m,config).includes("new")).length,
    birthday: members.filter(m=>segmentOf(m,config).includes("birthday")).length,
  };

  return (
    <div style={{display:"grid", gap:18}}>
      {/* Summary strip */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14}}>
        {[
          {label: lang==="tr"?"Toplam üye":"Total members", value: members.length, sub: `+${members.filter(m=>daysSince(m.since)<30).length} ${lang==="tr"?"bu ay":"this month"}`, accent:true},
          {label: lang==="tr"?"Aktif (30g)":"Active (30d)", value: active30, sub: `${Math.round(active30/members.length*100)}%`},
          {label: lang==="tr"?"Toplam puan":"Total points", value: totalPoints.toLocaleString(), sub: lang==="tr"?"havuzda":"in circulation"},
          {label: lang==="tr"?"Ömürlük değer":"Lifetime value", value: `₺${Math.round(totalSpent/1000)}K`, sub: `₺${Math.round(totalSpent/members.length)} ${lang==="tr"?"ort":"avg"}`},
        ].map((k,i)=>(
          <Card key={i} pad={18}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", letterSpacing:".12em",
              textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>{k.label}</div>
            <div style={{fontSize:32, fontWeight:500, letterSpacing:"-0.03em",
              color: k.accent?"var(--accent)":"var(--ink)", marginTop:10, lineHeight:1,
              fontFamily:"var(--font-display)"}}>{k.value}</div>
            <div style={{fontSize:11, color:"var(--ink-3)", marginTop:8}}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Segment chips */}
      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
        {[
          {id:"all",          tr:"Tümü",          en:"All"},
          {id:"vip",          tr:"VIP",           en:"VIP"},
          {id:"big-spender",  tr:"Büyük Harcayan",en:"Big Spender"},
          {id:"near-reward",  tr:"Ödüle Yakın",   en:"Near Reward"},
          {id:"dormant",      tr:"Uyuyan",        en:"Dormant"},
          {id:"new",          tr:"Yeni",          en:"New"},
          {id:"birthday",     tr:"Nisan D.Günü",  en:"Apr Birthday"},
        ].map(s => {
          const active = segFilter===s.id;
          return <button key={s.id} onClick={()=>setSegFilter(s.id)} style={{
            display:"inline-flex",alignItems:"center",gap:6,padding:"7px 12px",
            borderRadius:999,fontSize:12,fontWeight:500,cursor:"pointer",
            background: active?"var(--ink)":"var(--card-2)",
            color: active?"#FFF8EC":"var(--ink-2)",
            border:`1px solid ${active?"var(--ink)":"var(--line)"}`
          }}>
            {s[lang]}
            <span style={{fontSize:10,opacity:.7,fontFamily:"var(--font-mono)"}}>{segCounts[s.id]}</span>
          </button>;
        })}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex", gap:10, alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",
          border:"1px solid var(--line)",borderRadius:10,background:"var(--card-2)",
          flex:1, height:38}}>
          <Icon name="search" size={14} stroke="var(--ink-3)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={lang==="tr"?"İsim, telefon veya e-posta":"Name, phone or email"}
            style={{border:"none",outline:"none",background:"transparent",fontSize:13,flex:1,color:"var(--ink)"}}/>
        </div>
        <Select value={sort} onChange={e=>setSort(e.target.value)} style={{height:38, fontSize:12, minWidth:160}}>
          <option value="recent">{lang==="tr"?"Son ziyaret":"Recent visit"}</option>
          <option value="points">{lang==="tr"?"Puana göre":"By points"}</option>
          <option value="spent">{lang==="tr"?"Harcamaya göre":"By spend"}</option>
          <option value="visits">{lang==="tr"?"Ziyaret sayısı":"By visits"}</option>
          <option value="new">{lang==="tr"?"Yeni üyeler":"Newest"}</option>
        </Select>
        <Button variant="primary" icon="plus" onClick={()=>setAddOpen(true)}>
          {lang==="tr"?"Üye ekle":"Add member"}
        </Button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.2fr 1.3fr", gap:14, minHeight:520}}>
        {/* List */}
        <Card pad={0} style={{maxHeight:700, overflow:"auto"}}>
          {filtered.length===0 && (
            <div style={{padding:48, textAlign:"center", color:"var(--ink-3)", fontSize:13}}>
              {lang==="tr"?"Üye bulunamadı.":"No members match."}
            </div>
          )}
          {filtered.map((m,i)=>{
            const tags = segmentOf(m, config);
            const active = selected===m.id;
            const ds = daysSince(m.lastVisit);
            return (
              <div key={m.id} onClick={()=>setSelected(m.id)} style={{
                display:"grid", gridTemplateColumns:"auto 1fr auto", gap:12,
                padding:"14px 18px",
                borderBottom: i<filtered.length-1?"1px solid var(--line)":"none",
                borderLeft: active?"3px solid var(--accent)":"3px solid transparent",
                background: active?"var(--paper-2)":"transparent",
                cursor:"pointer", alignItems:"center"
              }}>
                <MemberAvatar name={m.name}/>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                    <span style={{fontSize:14, fontWeight:600}}>{m.name}</span>
                    {tags.slice(0,2).map(tg => <SegChip key={tg} tag={tg} lang={lang}/>)}
                  </div>
                  <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
                    letterSpacing:".04em", marginTop:3}}>
                    {m.phone} · {m.visits} {lang==="tr"?"ziyaret":"visits"} · {ds===0?(lang==="tr"?"bugün":"today"):`${ds}${lang==="tr"?"g":"d"} ${lang==="tr"?"önce":"ago"}`}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18, fontWeight:500, letterSpacing:"-0.01em",
                    fontFamily:"var(--font-display)", color:"var(--accent)", lineHeight:1}}>
                    {m.points.toLocaleString()}
                  </div>
                  <div style={{fontSize:10, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
                    letterSpacing:".08em", textTransform:"uppercase", marginTop:3}}>
                    {lang==="tr"?"puan":"pts"}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Detail */}
        {sel && <MemberDetail member={sel} config={config} campaigns={campaigns}
          lang={lang} t={t} onAdjust={()=>setAdjustOpen(true)}
          onToggleChannel={(ch, val)=>{
            setMembers(members.map(m => m.id===sel.id
              ? {...m, channels:{...m.channels, [ch]:val}} : m));
          }}
          onRedeem={(cost, label)=>{
            if (sel.points < cost) return showToast(lang==="tr"?"Yetersiz puan":"Not enough points");
            setMembers(members.map(m => m.id===sel.id
              ? {...m, points: m.points - cost} : m));
            showToast(`−${cost} ${lang==="tr"?"puan · ":"pts · "}${label}`);
          }}
        />}
      </div>

      {addOpen && <AddMemberModal onClose={()=>setAddOpen(false)} onSave={saveNew} lang={lang} config={config}/>}
      {adjustOpen && <AdjustPointsModal member={sel} onClose={()=>setAdjustOpen(false)} onApply={adjustPoints} lang={lang}/>}

      {toast && <div style={{
        position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
        background:"var(--ink)", color:"var(--paper)",
        padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:500,
        boxShadow:"var(--shadow-lg)", zIndex:200,
        display:"flex", alignItems:"center", gap:10,
        animation:"slideUp .24s ease"
      }}>
        <Icon name="check" size={14} stroke="#FFF8EC"/> {toast}
      </div>}
    </div>
  );
};

/* ─── Member detail panel ─── */
const MemberDetail = ({member, config, campaigns, lang, t, onAdjust, onToggleChannel, onRedeem}) => {
  const tags = segmentOf(member, config);
  const remaining = Math.max(0, (config.rewardAt||500) - member.points);
  const progressPct = Math.min(100, member.points / (config.rewardAt||500) * 100);

  // Mock visit history — derive from visits count.
  const history = Array.from({length: Math.min(6, member.visits)}, (_,i) => {
    const d = new Date("2026-04-17"); d.setDate(d.getDate() - i*3 - i);
    return {
      date: d.toISOString().slice(0,10),
      amount: Math.round(120 + Math.random()*280),
      earned: 0,
      items: ["Flat White, Cheesecake","Filtre Kahve","Latte, Croissant","Cappuccino ×2","Americano, Brownie"][i%5]
    };
  }).map(h => ({...h, earned: Math.floor(h.amount / (config.currencyPerPoint||10))}));

  return (
    <Card pad={0} style={{overflow:"hidden", alignSelf:"start"}}>
      {/* Header */}
      <div style={{padding:"22px 24px 18px", background:"var(--paper-2)", borderBottom:"1px solid var(--line)"}}>
        <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
          <MemberAvatar name={member.name} size={56}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:20, fontWeight:600, letterSpacing:"-0.01em",
              fontFamily:"var(--font-display)"}}>{member.name}</div>
            <div style={{fontSize:12, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
              letterSpacing:".06em", marginTop:4}}>
              {member.phone}{member.email && ` · ${member.email}`}
            </div>
            <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
              {tags.map(tg => <SegChip key={tg} tag={tg} lang={lang}/>)}
              {tags.length===0 && <span style={{fontSize:11,color:"var(--ink-3)"}}>{lang==="tr"?"Düzenli üye":"Regular member"}</span>}
            </div>
          </div>
        </div>

        {/* Progress to reward */}
        <div style={{marginTop:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Ödüle ilerleme":"Progress to reward"}
            </div>
            <div style={{fontSize:11, color:"var(--ink-2)", fontFamily:"var(--font-mono)"}}>
              {member.points} / {config.rewardAt}
            </div>
          </div>
          <div style={{height:8, background:"var(--paper-3)", borderRadius:4, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${progressPct}%`,
              background:"linear-gradient(90deg, var(--accent), #E08060)",
              borderRadius:4, transition:"width .4s"}}/>
          </div>
          <div style={{fontSize:12, color:"var(--ink-2)", marginTop:8, fontStyle:"italic"}}>
            {remaining > 0
              ? (lang==="tr" ? `${remaining} puan sonra ${config.rewardName.tr}` : `${remaining} pts until ${config.rewardName.en}`)
              : (lang==="tr" ? `🎁 ${config.rewardName.tr} kullanılabilir` : `🎁 ${config.rewardName.en} available`)}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"1px solid var(--line)"}}>
        {[
          {label: lang==="tr"?"Puan":"Points", value: member.points.toLocaleString(), accent:true},
          {label: lang==="tr"?"Ziyaret":"Visits", value: member.visits},
          {label: lang==="tr"?"Harcama":"Lifetime", value: `₺${member.lifetimeSpent.toLocaleString()}`},
          {label: lang==="tr"?"Ort. sepet":"Avg basket", value: `₺${Math.round(member.lifetimeSpent/Math.max(1,member.visits))}`},
        ].map((s,i)=>(
          <div key={i} style={{padding:"14px 16px",
            borderRight: i<3?"1px solid var(--line)":"none"}}>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>{s.label}</div>
            <div style={{fontSize:20, fontWeight:500, letterSpacing:"-0.01em",
              color: s.accent?"var(--accent)":"var(--ink)", marginTop:6,
              fontFamily:"var(--font-display)", lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{padding:"14px 18px", borderBottom:"1px solid var(--line)",
        display:"flex", gap:8, flexWrap:"wrap"}}>
        <Button variant="soft" size="sm" icon="plus" onClick={onAdjust}>
          {lang==="tr"?"Puan ayarla":"Adjust points"}
        </Button>
        {member.points >= config.rewardAt && (
          <Button variant="primary" size="sm" icon="sparkle"
            onClick={()=>onRedeem(config.rewardAt, config.rewardName[lang])}>
            {lang==="tr"?`Ödülü kullan (${config.rewardAt}p)`:`Redeem (${config.rewardAt}pts)`}
          </Button>
        )}
        {member.points >= 100 && (
          <Button variant="ghost" size="sm" icon="gift"
            onClick={()=>onRedeem(100, lang==="tr"?"₺10 indirim":"₺10 off")}>
            {lang==="tr"?"100p → ₺10":"100pts → ₺10"}
          </Button>
        )}
        <Button variant="ghost" size="sm" icon="send">
          {lang==="tr"?"Mesaj gönder":"Send message"}
        </Button>
      </div>

      {/* Channels */}
      <div style={{padding:"14px 18px", borderBottom:"1px solid var(--line)",
        display:"flex", gap:18, alignItems:"center"}}>
        <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
          letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
          {lang==="tr"?"Bildirimler":"Notifications"}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
          <Toggle on={member.channels?.push} onChange={v=>onToggleChannel("push",v)} size={16}/>
          <Icon name="bell" size={13}/> Push
        </label>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
          <Toggle on={member.channels?.email} onChange={v=>onToggleChannel("email",v)} size={16}/>
          <Icon name="mail" size={13}/> Email
        </label>
      </div>

      {/* History */}
      <div style={{padding:"18px 22px"}}>
        <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
          letterSpacing:".1em", textTransform:"uppercase", fontWeight:500, marginBottom:12}}>
          {lang==="tr"?"Son ziyaretler":"Recent visits"}
        </div>
        {history.length===0 && <div style={{fontSize:12,color:"var(--ink-3)",fontStyle:"italic"}}>
          {lang==="tr"?"Henüz ziyaret yok.":"No visits yet."}
        </div>}
        {history.map((h,i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"auto 1fr auto", gap:12,
            padding:"10px 0", borderBottom: i<history.length-1?"1px solid var(--line)":"none",
            alignItems:"center"}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              width:72}}>{h.date.slice(5)}</div>
            <div style={{fontSize:13, color:"var(--ink-2)", minWidth:0,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{h.items}</div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13, fontWeight:600}}>₺{h.amount}</div>
              <div style={{fontSize:10, color:"var(--accent)", fontFamily:"var(--font-mono)",
                fontWeight:600}}>+{h.earned} {lang==="tr"?"p":"pt"}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* ─── Add member modal ─── */
const AddMemberModal = ({onClose, onSave, lang, config}) => {
  const [d, setD] = React.useState({name:"", phone:"", email:"", birthday:""});
  return (
    <Modal open onClose={onClose} width={480} title={lang==="tr"?"Yeni üye":"New member"}
      subtitle={lang==="tr"?`Hoşgeldin bonusu: +${config.welcomeBonus} puan`:`Welcome bonus: +${config.welcomeBonus} pts`}>
      <div style={{display:"grid", gap:12}}>
        <Field label={lang==="tr"?"Ad soyad":"Full name"} required>
          <Input value={d.name} onChange={e=>setD({...d, name:e.target.value})} autoFocus/>
        </Field>
        <Field label={lang==="tr"?"Telefon":"Phone"} required>
          <Input value={d.phone} onChange={e=>setD({...d, phone:e.target.value})} placeholder="0532 ..."/>
        </Field>
        <Field label="Email" hint={lang==="tr"?"Opsiyonel · e-posta kampanyaları için":"Optional · for email campaigns"}>
          <Input value={d.email} onChange={e=>setD({...d, email:e.target.value})} type="email"/>
        </Field>
        <Field label={lang==="tr"?"Doğum günü":"Birthday"} hint={lang==="tr"?"Doğum günü bonusu için":"For birthday bonus"}>
          <Input value={d.birthday} onChange={e=>setD({...d, birthday:e.target.value})} type="date"/>
        </Field>
      </div>
      <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:18}}>
        <Button variant="ghost" onClick={onClose}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
        <Button variant="primary" icon="check" onClick={()=>{
          if (!d.name || !d.phone) return;
          onSave(d);
        }}>{lang==="tr"?"Üye ekle":"Add member"}</Button>
      </div>
    </Modal>
  );
};

/* ─── Adjust points modal ─── */
const AdjustPointsModal = ({member, onClose, onApply, lang}) => {
  const [amount, setAmount] = React.useState(50);
  const [reason, setReason] = React.useState(lang==="tr"?"Manuel ayarlama":"Manual adjustment");
  return (
    <Modal open onClose={onClose} width={440}
      title={lang==="tr"?"Puan ayarla":"Adjust points"}
      subtitle={`${member.name} · ${lang==="tr"?"mevcut":"current"}: ${member.points}`}>
      <div style={{display:"grid", gap:12}}>
        <Field label={lang==="tr"?"Miktar":"Amount"}>
          <div style={{display:"flex", gap:6}}>
            {[-100,-50,+50,+100,+200].map(n => (
              <button key={n} onClick={()=>setAmount(n)} style={{
                flex:1, height:40, borderRadius:8, fontSize:13, fontWeight:600,
                fontFamily:"var(--font-mono)",
                background: amount===n?(n<0?"rgba(184,74,58,.15)":"var(--accent-soft)"):"var(--card-2)",
                color: amount===n?(n<0?"var(--danger)":"var(--accent-ink)"):"var(--ink-2)",
                border:`1px solid ${amount===n?(n<0?"var(--danger)":"var(--accent)"):"var(--line)"}`,
                cursor:"pointer"
              }}>{n>0?"+":""}{n}</button>
            ))}
          </div>
          <Input type="number" value={amount} onChange={e=>setAmount(+e.target.value)}
            style={{marginTop:8}}/>
        </Field>
        <Field label={lang==="tr"?"Sebep":"Reason"}>
          <Input value={reason} onChange={e=>setReason(e.target.value)}/>
        </Field>
      </div>
      <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:18}}>
        <Button variant="ghost" onClick={onClose}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
        <Button variant="primary" icon="check" onClick={()=>onApply(amount, reason)}>
          {lang==="tr"?"Uygula":"Apply"}
        </Button>
      </div>
    </Modal>
  );
};

Object.assign(window, { LoyaltyMembers, MemberAvatar, MemberDetail, segmentOf, daysSince });
