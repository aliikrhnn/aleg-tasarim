// Loyalty: earn-rule configuration + top-level screen with tabs.

/* ───────────── CONFIG ───────────── */
const LoyaltyConfig = ({t, lang, config, setConfig, members}) => {
  const [d, setD] = React.useState(config);
  const [savedTick, setSavedTick] = React.useState(false);
  React.useEffect(()=>{ setD(config); }, [config]);

  const save = () => {
    setConfig(d);
    setSavedTick(true);
    setTimeout(()=>setSavedTick(false), 1600);
  };

  // Simulate earn on a sample bill
  const sampleBill = 250;
  const earnedOnSample = (() => {
    if (d.mode==="currency") return Math.floor(sampleBill / (d.currencyPerPoint||10));
    if (d.mode==="percent") return Math.floor(sampleBill * (d.percentBack||5) / 100);
    if (d.mode==="stamp") return 1;
    return 0;
  })();
  const redeemValueTL = d.redeemValue * 100;

  return (
    <div style={{display:"grid", gap:18}}>
      <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18}}>
        <Card pad={22}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"start"}}>
            <div>
              <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
                letterSpacing:".12em", textTransform:"uppercase", fontWeight:500}}>
                {lang==="tr"?"Kazanım Kuralı":"Earn rule"}
              </div>
              <div style={{fontSize:22, fontWeight:500, letterSpacing:"-0.02em", marginTop:4,
                fontFamily:"var(--font-display)"}}>
                {lang==="tr"?"Üyeler nasıl puan kazanır?":"How do members earn points?"}
              </div>
            </div>
            {savedTick && <Pill tone="ok" icon="check">{lang==="tr"?"Kaydedildi":"Saved"}</Pill>}
          </div>

          {/* Mode switcher */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:18}}>
            {[
              {id:"currency", tr:"Harcamaya göre puan", en:"Points per ₺ spent",
                eg: {tr:"10₺ = 1 puan", en:"₺10 = 1 pt"}, icon:"cash"},
              {id:"percent",  tr:"Yüzdelik iade", en:"Percent back",
                eg: {tr:"Hesabın %5'i", en:"5% of bill"}, icon:"sparkle"},
              {id:"stamp",    tr:"Damga sistemi", en:"Stamp card",
                eg: {tr:"10 damga = ödül", en:"10 stamps = reward"}, icon:"check"},
            ].map(opt => {
              const active = d.mode===opt.id;
              return <button key={opt.id} onClick={()=>setD({...d, mode:opt.id})} style={{
                padding:"18px 14px", borderRadius:12,
                background: active?"var(--accent-soft)":"var(--card-2)",
                border: `1.5px solid ${active?"var(--accent)":"var(--line)"}`,
                textAlign:"left", cursor:"pointer", transition:"all .14s"
              }}>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                  <Icon name={opt.icon} size={18} stroke={active?"var(--accent)":"var(--ink-2)"}/>
                  {active && <Icon name="check" size={14} stroke="var(--accent)"/>}
                </div>
                <div style={{fontSize:13, fontWeight:600, marginTop:10,
                  color: active?"var(--accent-ink)":"var(--ink)"}}>{opt[lang]}</div>
                <div style={{fontSize:11, color:"var(--ink-3)", marginTop:4,
                  fontFamily:"var(--font-mono)"}}>{opt.eg[lang]}</div>
              </button>;
            })}
          </div>

          {/* Mode-specific settings */}
          <div style={{marginTop:22, padding:18, background:"var(--paper-2)",
            borderRadius:12, border:"1px solid var(--line)"}}>
            {d.mode==="currency" && (
              <div style={{display:"grid", gap:14}}>
                <Field label={lang==="tr"?"1 puan için harcama miktarı (₺)":"₺ spent per 1 point"}>
                  <Input type="number" value={d.currencyPerPoint}
                    onChange={e=>setD({...d, currencyPerPoint: +e.target.value || 1})}/>
                </Field>
                <div style={{fontSize:12.5, color:"var(--ink-2)", fontStyle:"italic"}}>
                  {lang==="tr"
                    ? `Müşteri ${d.currencyPerPoint}₺ harcadığında 1 puan kazanır.`
                    : `A member earns 1 point for every ₺${d.currencyPerPoint} spent.`}
                </div>
              </div>
            )}
            {d.mode==="percent" && (
              <div style={{display:"grid", gap:14}}>
                <Field label={lang==="tr"?"Hesap başına iade yüzdesi (%)":"Percent of bill returned (%)"}>
                  <Input type="number" value={d.percentBack}
                    onChange={e=>setD({...d, percentBack: +e.target.value || 1})}/>
                </Field>
                <div style={{fontSize:12.5, color:"var(--ink-2)", fontStyle:"italic"}}>
                  {lang==="tr"
                    ? `Hesabın %${d.percentBack}'i puan olarak yansır. 1 puan = 1₺ değer.`
                    : `${d.percentBack}% of the bill is returned as points. 1 pt = ₺1 value.`}
                </div>
              </div>
            )}
            {d.mode==="stamp" && (
              <div style={{display:"grid", gap:14}}>
                <Field label={lang==="tr"?"Ödül için damga sayısı":"Stamps to reward"}>
                  <Input type="number" value={d.stampGoal}
                    onChange={e=>setD({...d, stampGoal: +e.target.value || 1})}/>
                </Field>
                <div style={{display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap",
                  padding:12, background:"var(--card)", borderRadius:10, border:"1px dashed var(--line-2)"}}>
                  {Array.from({length: d.stampGoal}, (_,i) => (
                    <div key={i} style={{width:28, height:28, borderRadius:"50%",
                      border: i===0?"1.5px solid var(--accent)":"1.5px dashed var(--line-2)",
                      background: i===0?"var(--accent)":"transparent",
                      color: i===0?"#FFF8EC":"var(--ink-3)",
                      display:"grid", placeItems:"center"}}>
                      {i===0 && <Icon name="check" size={12} stroke="#FFF8EC"/>}
                      {i===d.stampGoal-1 && i!==0 && <Icon name="gift" size={12} stroke="var(--ink-3)"/>}
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12.5, color:"var(--ink-2)", fontStyle:"italic"}}>
                  {lang==="tr"
                    ? `Her ziyarette 1 damga. ${d.stampGoal} damga tamamlandığında ödül kazanılır.`
                    : `1 stamp per visit. Complete ${d.stampGoal} to unlock the reward.`}
                </div>
              </div>
            )}
          </div>

          {/* Shared settings */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:18}}>
            <Field label={lang==="tr"?"Hoşgeldin bonusu (puan)":"Welcome bonus (pts)"}>
              <Input type="number" value={d.welcomeBonus}
                onChange={e=>setD({...d, welcomeBonus: +e.target.value || 0})}/>
            </Field>
            <Field label={lang==="tr"?"Doğum günü bonusu":"Birthday bonus"}>
              <Input type="number" value={d.birthdayBonus}
                onChange={e=>setD({...d, birthdayBonus: +e.target.value || 0})}/>
            </Field>
          </div>

          {/* Reward settings */}
          <div style={{marginTop:18, padding:18, background:"var(--card-2)", borderRadius:12,
            border:"1px solid var(--line)"}}>
            <div style={{fontSize:11, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".1em", textTransform:"uppercase", fontWeight:500, marginBottom:12}}>
              {lang==="tr"?"Ödül":"Reward"}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:10}}>
              <Field label={lang==="tr"?"Gereken puan":"Points needed"}>
                <Input type="number" value={d.rewardAt}
                  onChange={e=>setD({...d, rewardAt: +e.target.value || 100})}/>
              </Field>
              <Field label={lang==="tr"?"Ödül adı":"Reward name"}>
                <Input value={d.rewardName[lang]}
                  onChange={e=>setD({...d, rewardName:{...d.rewardName, [lang]:e.target.value}})}/>
              </Field>
            </div>
          </div>

          <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:20}}>
            <Button variant="ghost" onClick={()=>setD(config)}>{lang==="tr"?"Sıfırla":"Reset"}</Button>
            <Button variant="primary" icon="check" onClick={save}>{lang==="tr"?"Kaydet":"Save"}</Button>
          </div>
        </Card>

        {/* Live example */}
        <div style={{display:"grid", gap:14, alignContent:"start"}}>
          <Card pad={20}>
            <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".12em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Örnek Hesap":"Example bill"}
            </div>
            <div style={{fontSize:40, fontWeight:500, letterSpacing:"-0.03em",
              fontFamily:"var(--font-display)", marginTop:10, lineHeight:1}}>
              ₺{sampleBill}
            </div>
            <div style={{display:"flex", alignItems:"center", gap:6, marginTop:12,
              color:"var(--accent)"}}>
              <Icon name="sparkle" size={14} stroke="var(--accent)"/>
              <span style={{fontSize:13, fontWeight:600}}>
                +{earnedOnSample} {d.mode==="stamp"?(lang==="tr"?"damga":"stamp"):(lang==="tr"?"puan":"pts")}
              </span>
            </div>
            <div style={{fontSize:11, color:"var(--ink-3)", marginTop:8, lineHeight:1.5}}>
              {d.mode==="currency" && (lang==="tr"
                ? `${sampleBill}₺ / ${d.currencyPerPoint}₺ = ${earnedOnSample} puan`
                : `₺${sampleBill} / ₺${d.currencyPerPoint} = ${earnedOnSample} pts`)}
              {d.mode==="percent" && (lang==="tr"
                ? `${sampleBill}₺ × %${d.percentBack} = ${earnedOnSample} puan`
                : `₺${sampleBill} × ${d.percentBack}% = ${earnedOnSample} pts`)}
              {d.mode==="stamp" && (lang==="tr"
                ? `Ziyaret başına 1 damga. ${d.stampGoal} damgada ödül.`
                : `1 stamp per visit. Reward at ${d.stampGoal}.`)}
            </div>
          </Card>

          <Card pad={20}>
            <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".12em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Etkili Değer":"Effective value"}
            </div>
            <div style={{fontSize:28, fontWeight:500, letterSpacing:"-0.02em",
              fontFamily:"var(--font-display)", marginTop:8, color:"var(--olive)"}}>
              {d.mode==="currency" && `%${Math.round(100/d.currencyPerPoint*d.redeemValue)}`}
              {d.mode==="percent" && `%${d.percentBack}`}
              {d.mode==="stamp" && `1/${d.stampGoal}`}
            </div>
            <div style={{fontSize:12, color:"var(--ink-2)", marginTop:6, lineHeight:1.5}}>
              {lang==="tr"
                ? "Müşteriye geri dönen ortalama fayda. Tipik kafeler %3-7 aralığını kullanır."
                : "Average value returned to the guest. Cafes typically run 3-7%."}
            </div>
          </Card>

          <Card pad={20}>
            <div style={{fontSize:10.5, fontFamily:"var(--font-mono)", color:"var(--ink-3)",
              letterSpacing:".12em", textTransform:"uppercase", fontWeight:500}}>
              {lang==="tr"?"Aktif Üye":"Active members"}
            </div>
            <div style={{fontSize:28, fontWeight:500, letterSpacing:"-0.02em",
              fontFamily:"var(--font-display)", marginTop:8}}>
              {members.length}
            </div>
            <div style={{fontSize:12, color:"var(--ink-2)", marginTop:6}}>
              {lang==="tr"
                ? `Bu ayar değişikliğinden ${members.length} üye etkilenir.`
                : `${members.length} members are affected by this change.`}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ───────────── TOP-LEVEL SCREEN ───────────── */
const LoyaltyScreen = ({t, lang, members, setMembers, loyaltyCampaigns, setLoyaltyCampaigns,
    notifications, setNotifications, config, setConfig}) => {
  const [tab, setTab] = React.useState(()=> localStorage.getItem("aleg:loyaltyTab") || "members");
  React.useEffect(()=>{ localStorage.setItem("aleg:loyaltyTab", tab); }, [tab]);

  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_loyalty")}
        title={lang==="tr"?"Sadakat Programı":"Loyalty Program"}
        sub={lang==="tr"
          ? "Müşterilerini üyeye dönüştür, puan kazandır, kampanyayla geri getir. Dijital fişten sorunsuz çalışır."
          : "Turn guests into members, reward their spend, and bring them back with campaigns. Runs off the digital receipt."}
        actions={
          <Tabs tabs={[
            {id:"members",   label: lang==="tr"?"Üyeler":"Members"},
            {id:"campaigns", label: lang==="tr"?"Kampanyalar":"Campaigns"},
            {id:"config",    label: lang==="tr"?"Kural":"Rule"},
          ]} active={tab} onChange={setTab}/>
        }
      />

      {tab==="members" && <LoyaltyMembers t={t} lang={lang} members={members} setMembers={setMembers}
        config={config} campaigns={loyaltyCampaigns}/>}
      {tab==="campaigns" && <LoyaltyCampaigns t={t} lang={lang}
        loyaltyCampaigns={loyaltyCampaigns} setLoyaltyCampaigns={setLoyaltyCampaigns}
        notifications={notifications} setNotifications={setNotifications}
        members={members} config={config}/>}
      {tab==="config" && <LoyaltyConfig t={t} lang={lang} config={config} setConfig={setConfig} members={members}/>}
    </div>
  );
};

Object.assign(window, { LoyaltyConfig, LoyaltyScreen });
