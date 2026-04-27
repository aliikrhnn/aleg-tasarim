// Loyalty: Campaigns center + Config + top-level screen with tabs.

/* ───────────── CAMPAIGNS CENTER ───────────── */
const LoyaltyCampaigns = ({t, lang, loyaltyCampaigns, setLoyaltyCampaigns,
    notifications, setNotifications, members, config}) => {
  const [selected, setSelected] = React.useState(loyaltyCampaigns[0]?.id);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2400); };

  const sel = loyaltyCampaigns.find(c=>c.id===selected) || loyaltyCampaigns[0];

  const recipientsFor = (c) => {
    if (c.segment==="all") return members.filter(m => m.channels?.push || m.channels?.email);
    if (c.segment==="birthday") {
      return members.filter(m => {
        const bd = new Date(m.birthday);
        return bd.getMonth() === new Date().getMonth();
      });
    }
    if (c.segment==="near-reward") {
      return members.filter(m => {
        const r = (config.rewardAt||500) - m.points;
        return r > 0 && r <= (c.triggerAt ? config.rewardAt - c.triggerAt : 100);
      });
    }
    if (c.segment==="vip") return members.filter(m=>m.visits >= 50);
    if (c.segment==="dormant") return members.filter(m=>daysSince(m.lastVisit) > 14);
    return [];
  };

  const sendCampaign = (c) => {
    const recips = recipientsFor(c);
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    const newLogs = recips.slice(0,12).map((m,i) => ({
      id: `n_${Date.now()}_${i}`,
      campaignId: c.id,
      memberId: m.id,
      channel: c.channels[0] || "push",
      status: i<3 ? "opened" : "sent",
      at: now
    }));
    setNotifications([...newLogs, ...notifications]);
    setLoyaltyCampaigns(loyaltyCampaigns.map(x => x.id===c.id
      ? {...x, status:"sent", sentAt: now, recipients: recips.length, opens: newLogs.filter(n=>n.status==="opened").length, claims: 0}
      : x));
    showToast(lang==="tr" ? `${recips.length} üyeye gönderildi` : `Sent to ${recips.length} members`);
  };

  const saveNew = (draft) => {
    const id = "lc_"+Date.now();
    const nc = {id, status:"draft", ...draft,
      recipients:null, opens:null, claims:null};
    setLoyaltyCampaigns([nc, ...loyaltyCampaigns]);
    setSelected(id);
    setComposeOpen(false);
  };

  const deleteCampaign = (c) => {
    if (!confirm(lang==="tr"?"Bu kampanyayı sil?":"Delete this campaign?")) return;
    const next = loyaltyCampaigns.filter(x=>x.id!==c.id);
    setLoyaltyCampaigns(next);
    setSelected(next[0]?.id);
  };

  const typeMeta = {
    announcement:{tr:"Duyuru",en:"Announcement",icon:"megaphone",color:"#2E5B7A"},
    offer:       {tr:"Kampanya",en:"Offer",icon:"gift",color:"var(--accent)"},
    birthday:    {tr:"Doğum Günü",en:"Birthday",icon:"sparkle",color:"#B08A3E"},
    milestone:   {tr:"Milestone",en:"Milestone",icon:"flag",color:"#6B7A4B"},
  };
  const statusMeta = {
    draft:  {tr:"Taslak", en:"Draft",   tone:"muted"},
    sent:   {tr:"Gönderildi",en:"Sent", tone:"ok"},
    active: {tr:"Otomatik",en:"Auto-active", tone:"ok"},
    scheduled: {tr:"Planlı",en:"Scheduled", tone:"warn"},
  };

  return (
    <div style={{display:"grid", gap:18}}>
      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
        {[
          {label:lang==="tr"?"Kampanya":"Campaigns", value:loyaltyCampaigns.length},
          {label:lang==="tr"?"Aktif otomatik":"Active auto", value:loyaltyCampaigns.filter(c=>c.status==="active").length, accent:true},
          {label:lang==="tr"?"Toplam erişim":"Total reach", value:loyaltyCampaigns.reduce((s,c)=>s+(c.recipients||0),0)},
          {label:lang==="tr"?"Ort. açılma":"Avg open rate", value: (()=>{
            const sent = loyaltyCampaigns.filter(c=>c.recipients);
            if (!sent.length) return "—";
            const r = sent.reduce((s,c)=>s+(c.opens/c.recipients),0)/sent.length;
            return Math.round(r*100)+"%";
          })()},
        ].map((k,i)=>(
          <Card key={i} pad={18}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", letterSpacing:".12em",
              textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>{k.label}</div>
            <div style={{fontSize:32, fontWeight:500, letterSpacing:"-0.03em",
              color:k.accent?"var(--accent)":"var(--ink)", marginTop:10, lineHeight:1,
              fontFamily:"var(--font-display)"}}>{k.value}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontSize:13, color:"var(--ink-2)", fontStyle:"italic"}}>
          {lang==="tr"?"Push ve e-posta üzerinden üyelere duyuru ve kampanya gönder."
                     :"Broadcast offers and announcements to members via push and email."}
        </div>
        <Button variant="primary" icon="plus" onClick={()=>setComposeOpen(true)}>
          {lang==="tr"?"Yeni kampanya":"New campaign"}
        </Button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.1fr 1.3fr", gap:14}}>
        {/* List */}
        <Card pad={0}>
          {loyaltyCampaigns.length===0 && (
            <div style={{padding:48, textAlign:"center", color:"var(--ink-3)", fontSize:13}}>
              {lang==="tr"?"Henüz kampanya yok.":"No campaigns yet."}
            </div>
          )}
          {loyaltyCampaigns.map((c,i) => {
            const tm = typeMeta[c.type] || typeMeta.announcement;
            const sm = statusMeta[c.status] || statusMeta.draft;
            const active = selected===c.id;
            return (
              <div key={c.id} onClick={()=>setSelected(c.id)} style={{
                display:"grid", gridTemplateColumns:"auto 1fr auto", gap:12,
                padding:"14px 18px",
                borderBottom: i<loyaltyCampaigns.length-1?"1px solid var(--line)":"none",
                borderLeft: active?`3px solid ${tm.color}`:"3px solid transparent",
                background: active?"var(--paper-2)":"transparent",
                cursor:"pointer", alignItems:"center"
              }}>
                <div style={{width:40, height:40, borderRadius:10,
                  background: `${tm.color}1A`, color: tm.color,
                  display:"grid", placeItems:"center"}}>
                  <Icon name={tm.icon} size={18} stroke={tm.color}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:600, letterSpacing:"-0.005em",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {c.title[lang]}
                  </div>
                  <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
                    letterSpacing:".04em", marginTop:3}}>
                    {tm[lang]} · {c.segment} · {(c.channels||[]).join("/")}
                  </div>
                </div>
                <Pill tone={sm.tone} size="sm">{sm[lang]}</Pill>
              </div>
            );
          })}
        </Card>

        {/* Detail */}
        {sel && <CampaignDetail campaign={sel} lang={lang} t={t}
          recipients={recipientsFor(sel)}
          notifications={notifications.filter(n=>n.campaignId===sel.id)}
          members={members}
          onSend={()=>sendCampaign(sel)}
          onDelete={()=>deleteCampaign(sel)}
          onUpdate={(patch)=>{
            setLoyaltyCampaigns(loyaltyCampaigns.map(x => x.id===sel.id ? {...x, ...patch} : x));
          }}/>}
      </div>

      {composeOpen && <ComposeCampaignModal onClose={()=>setComposeOpen(false)}
        onSave={saveNew} lang={lang} members={members} config={config}/>}

      {toast && <div style={{
        position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
        background:"var(--ok)", color:"#FFF", padding:"12px 20px", borderRadius:10,
        fontSize:13, fontWeight:500, boxShadow:"var(--shadow-lg)", zIndex:200,
        display:"flex", alignItems:"center", gap:10
      }}><Icon name="check" size={14} stroke="#FFF"/> {toast}</div>}
    </div>
  );
};

/* ─── Campaign detail ─── */
const CampaignDetail = ({campaign, lang, t, recipients, notifications, members, onSend, onDelete, onUpdate}) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(campaign);
  React.useEffect(()=>{ setDraft(campaign); setEditing(false); }, [campaign.id]);

  const openRate = campaign.recipients ? Math.round(campaign.opens/campaign.recipients*100) : null;
  const claimRate = campaign.recipients ? Math.round((campaign.claims||0)/campaign.recipients*100) : null;

  return (
    <Card pad={0} style={{overflow:"hidden", alignSelf:"start"}}>
      <div style={{padding:"22px 24px 18px", background:"var(--paper-2)", borderBottom:"1px solid var(--line)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"start", gap:12}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".14em", textTransform:"uppercase", fontWeight:500}}>
              {campaign.type} · {campaign.segment}
            </div>
            {editing ? (
              <Input value={draft.title[lang]} onChange={e=>setDraft({...draft, title:{...draft.title, [lang]:e.target.value}})}
                style={{marginTop:6, fontSize:20, fontWeight:600, fontFamily:"var(--font-display)"}}/>
            ) : (
              <div style={{fontSize:22, fontWeight:600, letterSpacing:"-0.01em", marginTop:4,
                fontFamily:"var(--font-display)"}}>{campaign.title[lang]}</div>
            )}
          </div>
          <div style={{display:"flex", gap:6}}>
            {!editing && <Button variant="ghost" size="sm" icon="edit" onClick={()=>setEditing(true)}/>}
            {!editing && <Button variant="ghost" size="sm" icon="trash" onClick={onDelete}/>}
          </div>
        </div>
      </div>

      <div style={{padding:"18px 22px"}}>
        {/* Body / editable */}
        {editing ? (
          <Field label={lang==="tr"?"İçerik":"Message body"}>
            <Textarea value={draft.body[lang]}
              onChange={e=>setDraft({...draft, body:{...draft.body, [lang]:e.target.value}})}/>
          </Field>
        ) : (
          <div style={{padding:16, background:"var(--card-2)", borderRadius:10,
            border:"1px solid var(--line)", fontSize:14, lineHeight:1.6, color:"var(--ink-2)"}}>
            {campaign.body[lang]}
          </div>
        )}

        {editing && (
          <div style={{display:"flex", gap:8, marginTop:12, justifyContent:"flex-end"}}>
            <Button variant="ghost" size="sm" onClick={()=>{setEditing(false); setDraft(campaign);}}>
              {lang==="tr"?"Vazgeç":"Cancel"}
            </Button>
            <Button variant="primary" size="sm" icon="check"
              onClick={()=>{onUpdate(draft); setEditing(false);}}>
              {lang==="tr"?"Kaydet":"Save"}
            </Button>
          </div>
        )}

        {/* Metadata */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:18}}>
          <div>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Kanal":"Channel"}
            </div>
            <div style={{fontSize:13, fontWeight:500, marginTop:4, display:"flex", gap:4}}>
              {(campaign.channels||[]).map(ch => (
                <Pill key={ch} tone="muted" size="sm" icon={ch==="push"?"bell":"mail"}>{ch}</Pill>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Hedef":"Target"}
            </div>
            <div style={{fontSize:13, fontWeight:500, marginTop:4, fontFamily:"var(--font-mono)"}}>
              {recipients.length} {lang==="tr"?"üye":"members"}
            </div>
          </div>
          <div>
            <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Tarih":"When"}
            </div>
            <div style={{fontSize:12, marginTop:4, fontFamily:"var(--font-mono)", color:"var(--ink-2)"}}>
              {campaign.sentAt || (campaign.auto?(lang==="tr"?"Otomatik":"Automatic"):(lang==="tr"?"Hazır":"Ready"))}
            </div>
          </div>
        </div>

        {/* Results */}
        {campaign.recipients !== null && campaign.recipients !== undefined && (
          <div style={{marginTop:18, padding:16, background:"var(--paper-2)",
            borderRadius:10, border:"1px solid var(--line)"}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500, marginBottom:10}}>
              {lang==="tr"?"Performans":"Performance"}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
              <div>
                <div style={{fontSize:24, fontWeight:500, letterSpacing:"-0.02em",
                  fontFamily:"var(--font-display)", lineHeight:1}}>{campaign.recipients}</div>
                <div style={{fontSize:10, color:"var(--ink-3)", marginTop:4,
                  fontFamily:"var(--font-mono)", letterSpacing:".08em", textTransform:"uppercase"}}>
                  {lang==="tr"?"Gönderim":"Sent"}
                </div>
              </div>
              <div>
                <div style={{fontSize:24, fontWeight:500, letterSpacing:"-0.02em",
                  fontFamily:"var(--font-display)", lineHeight:1, color:"var(--olive)"}}>
                  {campaign.opens || 0}
                </div>
                <div style={{fontSize:10, color:"var(--ink-3)", marginTop:4,
                  fontFamily:"var(--font-mono)", letterSpacing:".08em", textTransform:"uppercase"}}>
                  {lang==="tr"?"Açılma":"Opens"} {openRate!==null && `(${openRate}%)`}
                </div>
              </div>
              <div>
                <div style={{fontSize:24, fontWeight:500, letterSpacing:"-0.02em",
                  fontFamily:"var(--font-display)", lineHeight:1, color:"var(--accent)"}}>
                  {campaign.claims || 0}
                </div>
                <div style={{fontSize:10, color:"var(--ink-3)", marginTop:4,
                  fontFamily:"var(--font-mono)", letterSpacing:".08em", textTransform:"uppercase"}}>
                  {lang==="tr"?"Kullanım":"Claims"} {claimRate!==null && `(${claimRate}%)`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery log */}
        {notifications.length > 0 && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500, marginBottom:10}}>
              {lang==="tr"?"Dağıtım günlüğü":"Delivery log"}
            </div>
            <div style={{maxHeight:240, overflow:"auto",
              border:"1px solid var(--line)", borderRadius:10}}>
              {notifications.map((n,i)=>{
                const mem = members.find(x=>x.id===n.memberId);
                const toneMap = {sent:"muted", opened:"ok", claimed:"accent"};
                return <div key={n.id} style={{display:"grid", gridTemplateColumns:"auto 1fr auto auto",
                  gap:10, padding:"10px 12px",
                  borderBottom: i<notifications.length-1?"1px solid var(--line)":"none",
                  alignItems:"center"}}>
                  <Icon name={n.channel==="push"?"bell":"mail"} size={12} stroke="var(--ink-3)"/>
                  <div style={{fontSize:12.5, fontWeight:500}}>{mem?.name || "—"}</div>
                  <Pill tone={toneMap[n.status]||"muted"} size="sm">{n.status}</Pill>
                  <div style={{fontSize:10, fontFamily:"var(--font-mono)", color:"var(--ink-3)"}}>
                    {n.at.slice(11)}
                  </div>
                </div>;
              })}
            </div>
          </div>
        )}

        {/* Send action */}
        {campaign.status !== "active" && (
          <div style={{marginTop:18, display:"flex", justifyContent:"flex-end", gap:8}}>
            <Button variant="soft" icon="eye">
              {lang==="tr"?"Önizle":"Preview"}
            </Button>
            <Button variant="primary" icon="send" onClick={onSend}>
              {campaign.status==="sent"
                ? (lang==="tr"?`Tekrar gönder (${recipients.length})`:`Resend (${recipients.length})`)
                : (lang==="tr"?`Gönder (${recipients.length})`:`Send (${recipients.length})`)}
            </Button>
          </div>
        )}
        {campaign.status === "active" && (
          <div style={{marginTop:18, padding:14, background:"rgba(79,124,76,.08)",
            borderRadius:10, border:"1px dashed rgba(79,124,76,.35)",
            display:"flex", alignItems:"center", gap:10}}>
            <Icon name="bolt" size={14} stroke="var(--ok)"/>
            <div style={{fontSize:12.5, color:"var(--ink-2)"}}>
              {lang==="tr"
                ? "Otomatik — tetiklenince ilgili üyelere gönderilir."
                : "Automatic — sends to matching members when triggered."}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

/* ─── Compose new campaign ─── */
const ComposeCampaignModal = ({onClose, onSave, lang, members, config}) => {
  const [d, setD] = React.useState({
    type:"offer",
    title:{tr:"", en:""},
    body:{tr:"", en:""},
    segment:"all",
    channels:["push"],
  });

  const segmentCount = (s) => {
    if (s==="all") return members.length;
    if (s==="vip") return members.filter(m=>m.visits>=50).length;
    if (s==="big-spender") return members.filter(m=>m.lifetimeSpent>=10000).length;
    if (s==="near-reward") return members.filter(m=>{
      const r = config.rewardAt - m.points; return r>0 && r<=100;
    }).length;
    if (s==="dormant") return members.filter(m=>daysSince(m.lastVisit)>14).length;
    if (s==="birthday") return members.filter(m=>{
      return new Date(m.birthday).getMonth() === new Date().getMonth();
    }).length;
    return 0;
  };

  return (
    <Modal open onClose={onClose} width={640}
      title={lang==="tr"?"Yeni kampanya":"New campaign"}
      subtitle={lang==="tr"?"Üyelere push bildirimi veya e-posta gönder":"Send push or email to members"}>
      <div style={{display:"grid", gap:14}}>
        <Field label={lang==="tr"?"Tür":"Type"}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6}}>
            {[
              {id:"offer",        tr:"Kampanya",  en:"Offer",        icon:"gift"},
              {id:"announcement", tr:"Duyuru",    en:"Announcement", icon:"megaphone"},
              {id:"birthday",     tr:"Doğum Günü",en:"Birthday",     icon:"sparkle"},
              {id:"milestone",    tr:"Milestone", en:"Milestone",    icon:"flag"},
            ].map(o => {
              const active = d.type===o.id;
              return <button key={o.id} onClick={()=>setD({...d, type:o.id})} style={{
                padding:"12px 8px", borderRadius:10,
                background: active?"var(--accent-soft)":"var(--card-2)",
                border:`1.5px solid ${active?"var(--accent)":"var(--line)"}`,
                display:"grid", placeItems:"center", gap:4, cursor:"pointer"
              }}>
                <Icon name={o.icon} size={18} stroke={active?"var(--accent)":"var(--ink-2)"}/>
                <div style={{fontSize:11.5, fontWeight:600, color: active?"var(--accent-ink)":"var(--ink-2)"}}>
                  {o[lang]}
                </div>
              </button>;
            })}
          </div>
        </Field>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <Field label={lang==="tr"?"Başlık (TR)":"Title (TR)"}>
            <Input value={d.title.tr} onChange={e=>setD({...d, title:{...d.title, tr:e.target.value}})}
              placeholder={lang==="tr"?"Pazartesi indirimi":"Monday deal"}/>
          </Field>
          <Field label={lang==="tr"?"Başlık (EN)":"Title (EN)"}>
            <Input value={d.title.en} onChange={e=>setD({...d, title:{...d.title, en:e.target.value}})}
              placeholder="Monday deal"/>
          </Field>
        </div>

        <Field label={lang==="tr"?"Mesaj (TR)":"Body (TR)"}>
          <Textarea value={d.body.tr} onChange={e=>setD({...d, body:{...d.body, tr:e.target.value}})}/>
        </Field>
        <Field label={lang==="tr"?"Mesaj (EN)":"Body (EN)"}>
          <Textarea value={d.body.en} onChange={e=>setD({...d, body:{...d.body, en:e.target.value}})}/>
        </Field>

        <Field label={lang==="tr"?"Hedef kitle":"Audience"}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6}}>
            {[
              {id:"all",         tr:"Tüm üyeler",    en:"All members"},
              {id:"vip",         tr:"VIP",           en:"VIP"},
              {id:"big-spender", tr:"Büyük Harcayan",en:"Big Spender"},
              {id:"near-reward", tr:"Ödüle Yakın",   en:"Near Reward"},
              {id:"dormant",     tr:"Uyuyan",        en:"Dormant"},
              {id:"birthday",    tr:"Doğum Günü",    en:"Birthday"},
            ].map(s => {
              const active = d.segment===s.id;
              const n = segmentCount(s.id);
              return <button key={s.id} onClick={()=>setD({...d, segment:s.id})} style={{
                padding:"10px 12px", borderRadius:10,
                background: active?"var(--paper-2)":"var(--card-2)",
                border:`1.5px solid ${active?"var(--ink)":"var(--line)"}`,
                textAlign:"left", cursor:"pointer"
              }}>
                <div style={{fontSize:12, fontWeight:600}}>{s[lang]}</div>
                <div style={{fontSize:11, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
                  marginTop:3}}>{n} {lang==="tr"?"üye":"members"}</div>
              </button>;
            })}
          </div>
        </Field>

        <Field label={lang==="tr"?"Kanal":"Channels"}>
          <div style={{display:"flex", gap:8}}>
            {["push","email"].map(ch => {
              const active = d.channels.includes(ch);
              return <button key={ch} onClick={()=>{
                setD({...d, channels: active
                  ? d.channels.filter(x=>x!==ch)
                  : [...d.channels, ch]});
              }} style={{
                flex:1, padding:"10px 14px", borderRadius:10,
                background: active?"var(--accent-soft)":"var(--card-2)",
                border:`1.5px solid ${active?"var(--accent)":"var(--line)"}`,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                fontSize:13, fontWeight:500, cursor:"pointer",
                color: active?"var(--accent-ink)":"var(--ink-2)"
              }}>
                <Icon name={ch==="push"?"bell":"mail"} size={14}/>
                {ch==="push"?"Push":"Email"}
              </button>;
            })}
          </div>
        </Field>
      </div>

      <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:18}}>
        <Button variant="ghost" onClick={onClose}>{lang==="tr"?"Vazgeç":"Cancel"}</Button>
        <Button variant="primary" icon="check" onClick={()=>{
          if (!d.title.tr && !d.title.en) return;
          if (!d.channels.length) return;
          onSave(d);
        }}>{lang==="tr"?"Taslak oluştur":"Create draft"}</Button>
      </div>
    </Modal>
  );
};

Object.assign(window, { LoyaltyCampaigns, CampaignDetail, ComposeCampaignModal });
