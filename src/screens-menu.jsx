// Products + Menu Appearance + QR screens

const Products = ({t, lang, products, setProducts, categories, onAddNew}) => {
  const [filterCat, setFilterCat] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const filtered = products.filter(p =>
    (filterCat==="all" || p.cat===filterCat) &&
    (query==="" || p.name[lang].toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_menu")}
        title={t("nav_products")}
        sub={lang==="tr"?"Tüm ürünler, fiyatlar, trendler ve menü durumları tek ekranda.":"Every product with pricing, trend and live menu status."}
        actions={<>
          <Button variant="soft" icon="sparkle" size="md">{t("aiWrite")}</Button>
          <Button variant="primary" icon="plus" size="md" onClick={onAddNew}>{t("addNew")}</Button>
        </>}
      />
      <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
        <div style={{position:"relative", flex:"1 1 280px"}}>
          <Icon name="search" size={16} style={{position:"absolute", left:14, top:13, color:"var(--ink-3)"}}/>
          <Input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder={lang==="tr"?"Ürün ara…":"Search products…"}
            style={{paddingLeft:40, width:"100%"}}/>
        </div>
        <Select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="all">{lang==="tr"?"Tüm kategoriler":"All categories"}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
        </Select>
        <div style={{marginLeft:"auto", fontSize:12, color:"var(--ink-3)", fontFamily:"var(--font-mono)"}}>
          {filtered.length} / {products.length}
        </div>
      </div>

      <Card pad={0}>
        <div style={{padding:"14px 22px", display:"grid",
          gridTemplateColumns:"24px 64px 1.5fr 120px 100px 110px 100px 100px 110px", gap:14,
          borderBottom:"1px solid var(--line)", fontSize:11, fontWeight:600,
          color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:".08em",
          fontFamily:"var(--font-mono)"}}>
          <span/><span/><span>{t("name")}</span><span>{t("category")}</span>
          <span style={{textAlign:"right"}}>{t("price")}</span><span>{lang==="tr"?"Trend":"Trend"}</span>
          <span>{t("printTarget")}</span>
          <span>{t("status")}</span><span style={{textAlign:"right"}}>{t("actions")}</span>
        </div>
        {filtered.map((p,i)=>{
          const togglePrint = () => setProducts(products.map(x =>
            x.id===p.id ? {...x, print: x.print==="bar"?"kitchen":"bar"} : x));
          const printOn = p.print || "kitchen";
          return (
          <div key={p.id} style={{padding:"12px 22px", display:"grid",
            gridTemplateColumns:"24px 64px 1.5fr 120px 100px 110px 100px 100px 110px", gap:14,
            borderBottom: i<filtered.length-1?"1px solid var(--line)":"none",
            alignItems:"center"}}>
            <button style={{color:"var(--ink-3)",cursor:"grab"}}><Icon name="drag" size={16}/></button>
            <FoodTile kind={p.hero} w={64} h={48}/>
            <div>
              <div style={{fontSize:14, fontWeight:600, display:"flex",alignItems:"center",gap:6}}>
                {p.name[lang]}
                {p.badge==="new" && <Pill tone="accent">NEW</Pill>}
                {p.badge==="hot" && <Pill tone="warn">HOT</Pill>}
              </div>
              <div style={{fontSize:11.5, color:"var(--ink-3)", marginTop:2, lineHeight:1.4,
                overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box",
                WebkitLineClamp:1, WebkitBoxOrient:"vertical"}}>{p.desc[lang]}</div>
            </div>
            <div style={{fontSize:12.5, color:"var(--ink-2)"}}>{categories.find(c=>c.id===p.cat)?.name[lang] || "—"}</div>
            <div style={{fontSize:14, fontWeight:600, fontFamily:"var(--font-mono)", textAlign:"right"}}>₺{p.price}</div>
            <Sparkline data={p.trend} width={90} height={22}/>
            <button onClick={togglePrint} title={lang==="tr"?"Değiştirmek için tıkla":"Click to toggle"} style={{
              padding:"5px 8px", borderRadius:7, fontSize:11, fontWeight:600,
              display:"inline-flex", alignItems:"center", gap:5, cursor:"pointer",
              background: printOn==="kitchen"?"rgba(176,138,62,.12)":"rgba(46,91,122,.12)",
              color: printOn==="kitchen"?"#8B6A2E":"#2E5B7A",
              border:`1px solid ${printOn==="kitchen"?"rgba(176,138,62,.3)":"rgba(46,91,122,.3)"}`
            }}>
              <Icon name={printOn==="kitchen"?"chef":"glass"} size={11}/>
              {printOn==="kitchen"?t("kitchen"):t("bar")}
            </button>
            {p.status==="active" && <Pill tone="ok" icon="dot">{t("active")}</Pill>}
            {p.status==="soldout" && <Pill tone="danger">{t("soldout")}</Pill>}
            {p.status==="draft" && <Pill tone="muted">{t("draft")}</Pill>}
            <div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
              <Button variant="ghost" size="sm" icon="edit">{t("edit")}</Button>
            </div>
          </div>
          );
        })}
      </Card>
    </div>
  );
};

const AddProductModal = ({open, onClose, categories, lang, t, onSave}) => {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [cat, setCat] = React.useState(categories[0]?.id || "");
  const [print, setPrint] = React.useState("kitchen");
  const [aiRunning, setAiRunning] = React.useState(false);
  const aiWrite = () => {
    if (!name) return;
    setAiRunning(true);
    setTimeout(()=>{
      const samples = {
        tr: `${name} — özenle hazırlanmış, taze malzemelerle, Aleg imzasıyla. İpeksi doku, dengeli tat profili.`,
        en: `${name} — carefully crafted with fresh ingredients, signed off by Aleg. Silky texture, balanced flavor.`
      };
      setDesc(samples[lang]);
      setAiRunning(false);
    }, 900);
  };
  return (
    <Modal open={open} onClose={onClose} width={720}
      title={lang==="tr"?"Yeni ürün":"New product"}
      subtitle={lang==="tr"?"Menüye yeni bir ürün ekle. Açıklama için yapay zekayı kullanabilirsin.":"Add a new product. You can use AI to draft the description."}>
      <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:20}}>
        <div style={{display:"grid", gap:14}}>
          <Field label={t("name")} required>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder={lang==="tr"?"örn. Iced Matcha Latte":"e.g. Iced Matcha Latte"}/>
          </Field>
          <Field label={t("description")}>
            <div style={{position:"relative"}}>
              <Textarea value={desc} onChange={e=>setDesc(e.target.value)}
                placeholder={lang==="tr"?"Müşterinin menüde göreceği kısa açıklama…":"Short description customers see on the menu…"}/>
              <button onClick={aiWrite} disabled={!name||aiRunning} style={{
                position:"absolute", bottom:10, right:10, padding:"6px 10px",
                borderRadius:8, fontSize:11, fontWeight:600,
                background: aiRunning?"var(--paper-3)":"var(--accent-soft)",
                color:"var(--accent-ink)", border:"1px solid var(--accent-soft)",
                display:"inline-flex", alignItems:"center", gap:5,
                opacity: !name?.5:1, cursor: !name?"not-allowed":"pointer"
              }}>
                <Icon name="sparkle" size={11}/> {aiRunning?(lang==="tr"?"Yazıyor…":"Writing…"):t("aiWrite")}
              </button>
            </div>
          </Field>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <Field label={t("category")}>
              <Select value={cat} onChange={e=>setCat(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
              </Select>
            </Field>
            <Field label={`${t("price")} (₺)`}>
              <Input value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" type="number"/>
            </Field>
          </div>
          <Field label={lang==="tr"?"Görünürlük":"Visibility"}>
            <div style={{display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
              background:"var(--paper-2)", borderRadius:10, border:"1px solid var(--line)"}}>
              <Toggle on={true} onChange={()=>{}}/>
              <div style={{fontSize:13}}>{lang==="tr"?"Menüde göster":"Show on menu"}</div>
            </div>
          </Field>
          <Field label={t("printTarget")} hint={lang==="tr"?"Sipariş bu noktaya yazdırılır.":"Order tickets print here."}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              {[
                {id:"kitchen", label:t("kitchen"), icon:"📋"},
                {id:"bar",     label:t("bar"),     icon:"🍸"},
              ].map(o => (
                <button key={o.id} onClick={()=>setPrint(o.id)} style={{
                  padding:"12px 14px", borderRadius:10, textAlign:"left",
                  background: print===o.id?"var(--accent-soft)":"var(--paper-2)",
                  border:`1.5px solid ${print===o.id?"var(--accent)":"var(--line)"}`,
                  cursor:"pointer", display:"flex", alignItems:"center", gap:10
                }}>
                  <div style={{width:28,height:28,borderRadius:8,
                    background: print===o.id?"var(--accent)":"var(--card-2)",
                    color: print===o.id?"#FFF8EC":"var(--ink-2)",
                    display:"grid",placeItems:"center",fontSize:14}}>
                    <Icon name={o.id==="kitchen"?"chef":"glass"} size={14}/>
                  </div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600}}>{o.label}</div>
                    <div style={{fontSize:10.5, color:"var(--ink-3)", fontFamily:"var(--font-mono)",
                      letterSpacing:".08em", textTransform:"uppercase"}}>
                      {o.id==="kitchen"?"KDS-01":"BAR-01"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div style={{display:"grid", gap:14}}>
          <Field label={t("image")}>
            <div style={{aspectRatio:"1/1", borderRadius:14, border:"2px dashed var(--line-2)",
              background:"var(--paper-2)", display:"grid", placeItems:"center", gap:10,
              color:"var(--ink-3)"}}>
              <Icon name="image" size={32}/>
              <div style={{fontSize:12, textAlign:"center", padding:"0 20px"}}>
                {lang==="tr"?"Sürükleyip bırak ya da yükle\n1:1, en az 800×800":"Drop or upload\n1:1, min 800×800"}
              </div>
              <Button variant="soft" size="sm" icon="plus">{lang==="tr"?"Seç":"Browse"}</Button>
            </div>
          </Field>
          <div style={{padding:"12px 14px", background:"var(--accent-soft)", borderRadius:10,
            fontSize:12, color:"var(--accent-ink)", display:"flex", gap:8, alignItems:"start"}}>
            <Icon name="sparkle" size={14} style={{marginTop:1, flexShrink:0}}/>
            <div>
              <div style={{fontWeight:600, marginBottom:2}}>{lang==="tr"?"8 dile otomatik çeviri":"Auto-translate to 8 languages"}</div>
              {lang==="tr"?"Menü yayınlandığında EN, DE, FR, ES, AR, RU, IT ve NL için çeviriler otomatik hazırlanacak.":"Translations into EN, DE, FR, ES, AR, RU, IT, NL generate automatically."}
            </div>
          </div>
        </div>
      </div>
      <div style={{display:"flex", gap:10, marginTop:22, justifyContent:"flex-end",
        paddingTop:18, borderTop:"1px solid var(--line)"}}>
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" icon="check" onClick={()=>{onSave({name,desc,price,cat,print});onClose();}}>{t("save")}</Button>
      </div>
    </Modal>
  );
};

const Appearance = ({t, lang, theme, setTheme, accent, setAccent, density, setDensity, categories, products}) => {
  const themes = [
    {id:"warm",      name:t("themeWarm"),      colors:["#F4EEE2","#2A1F18","#C4553A"], preview:"cream"},
    {id:"espresso",  name:t("themeEspresso"),  colors:["#1A1410","#F2E9DA","#E08060"], preview:"dark"},
    {id:"swiss",     name:t("themeSwiss"),     colors:["#FAFAF7","#0B0B0A","#E33E1C"], preview:"swiss"},
    {id:"editorial", name:t("themeEditorial"), colors:["#F2EEE8","#181412","#7E5B3A"], preview:"editorial"},
  ];
  const accents = ["#C4553A","#6B7A4B","#B08A3E","#2E5B7A","#7E3A6B","#1E1E1E"];
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("nav_appearance")}
        sub={lang==="tr"?"Müşterinin göreceği menünün tipografisini ve renklerini ayarla. Önizleme sağda canlı güncellenir.":"Tune the typography and colors of the customer-facing menu. The preview on the right updates live."}
      />
      <div style={{display:"grid", gap:14}}>
        <div style={{fontSize:12, fontFamily:"var(--font-mono)", letterSpacing:".12em",
          textTransform:"uppercase", color:"var(--ink-3)", fontWeight:500}}>
          {lang==="tr"?"Tema":"Theme"}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
          {themes.map(th => {
            const selected = theme===th.id;
            return (
              <button key={th.id} onClick={()=>setTheme(th.id)} style={{
                padding:16, borderRadius:14, textAlign:"left",
                background:"var(--card)", border:`1.5px solid ${selected?"var(--accent)":"var(--line)"}`,
                boxShadow: selected?`0 0 0 4px var(--accent-soft)`:"none",
                transition:"all .15s ease", cursor:"pointer"
              }}>
                <div style={{display:"grid", placeItems:"center", marginBottom:12}}>
                  <MiniPhone theme={th.preview} w={100} h={170}>
                    <div style={{padding:10, height:"100%", display:"flex", flexDirection:"column", gap:6,
                      background: th.colors[0], color: th.colors[1]}}>
                      <div style={{fontSize:9, opacity:.5, fontFamily:"var(--font-mono)"}}>9:41</div>
                      <div style={{fontSize:11, fontWeight:600, fontStyle:"italic",
                        fontFamily: th.id==="editorial"?"'Fraunces',serif":"'Fraunces',sans-serif"}}>Aleg</div>
                      <div style={{height:2, background:th.colors[2], width:20, marginTop:-2}}/>
                      <div style={{display:"flex", gap:3, marginTop:2}}>
                        {[0,1,2].map(i=>(
                          <div key={i} style={{height:4, width:i===0?14:10, borderRadius:2,
                            background: i===0? th.colors[1]:`${th.colors[1]}33`}}/>
                        ))}
                      </div>
                      {[1,2,3].map(i=>(
                        <div key={i} style={{display:"flex",gap:4,padding:3,borderRadius:4,
                          background:`${th.colors[1]}08`,border:`1px solid ${th.colors[1]}14`}}>
                          <div style={{width:14,height:14,borderRadius:3,background:`${th.colors[2]}60`}}/>
                          <div style={{flex:1,display:"grid",gap:2}}>
                            <div style={{height:3,background:`${th.colors[1]}66`,borderRadius:1,width:"80%"}}/>
                            <div style={{height:2,background:`${th.colors[1]}33`,borderRadius:1,width:"50%"}}/>
                          </div>
                          <div style={{fontSize:6,fontWeight:600,fontFamily:"var(--font-mono)"}}>₺95</div>
                        </div>
                      ))}
                    </div>
                  </MiniPhone>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div style={{fontSize:13, fontWeight:600}}>{th.name}</div>
                  {selected && <div style={{width:18, height:18, borderRadius:"50%",
                    background:"var(--accent)", display:"grid", placeItems:"center"}}>
                    <Icon name="check" size={12} stroke="#FFF8EC"/></div>}
                </div>
                <div style={{display:"flex", gap:3, marginTop:8}}>
                  {th.colors.map((c,i)=>(
                    <div key={i} style={{width:16, height:16, borderRadius:4, background:c,
                      border:"1px solid rgba(0,0,0,.1)"}}/>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <Card>
          <Field label={lang==="tr"?"Vurgu rengi":"Accent color"}>
            <div style={{display:"flex", gap:8}}>
              {accents.map(c=>(
                <button key={c} onClick={()=>setAccent(c)} style={{
                  width:40, height:40, borderRadius:10, background:c,
                  border: accent===c?"3px solid var(--ink)":"1px solid var(--line)",
                  cursor:"pointer", transition:"all .15s"
                }}/>
              ))}
            </div>
          </Field>
        </Card>
        <Card>
          <Field label={t("density")}>
            <Tabs
              tabs={[{id:"comfortable",label:t("comfortable")},{id:"compact",label:t("compact")}]}
              active={density} onChange={setDensity}/>
          </Field>
        </Card>
      </div>
    </div>
  );
};

// QRCode moved to screens-extras.jsx with a real QR encoder. Stub kept for shape.
const _LegacyQRCode = ({t, lang, branches}) => {
  const [branch, setBranch] = React.useState(branches[0]?.id);
  const [design, setDesign] = React.useState("v1");
  const [size, setSize] = React.useState(11);
  const designs = [
    {id:"v1", name:lang==="tr"?"Minimal":"Minimal"},
    {id:"v2", name:lang==="tr"?"Klasik":"Classic"},
    {id:"v3", name:lang==="tr"?"Poster":"Poster"},
    {id:"v4", name:lang==="tr"?"Yatay":"Horizontal"},
  ];
  const Qr = ({bg="#FFF",fg="#1A1410",accent="#C4553A",size=160,showLogo=true}) => {
    const cells = Array.from({length:size*size},(_,i)=>{
      const x=i%size, y=Math.floor(i/size);
      return ((x*13+y*17+x*y)%5 < 2) || (x<2 && y<2) || (x>size-4 && y<2) || (x<2 && y>size-4);
    });
    return <div style={{width:"100%", aspectRatio:"1/1", padding:10, background:bg, borderRadius:10,
      display:"grid", gridTemplateColumns:`repeat(${size},1fr)`, gap:1, position:"relative"}}>
      {cells.map((f,i)=> <span key={i} style={{background: f?fg:"transparent", borderRadius:1}}/>)}
      {showLogo && <div style={{position:"absolute", inset:0, display:"grid", placeItems:"center"}}>
        <div style={{width:"22%", aspectRatio:"1/1", background:bg, borderRadius:8,
          display:"grid",placeItems:"center", border:`2px solid ${bg}`}}>
          <div style={{fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:16, fontWeight:600,
            color:accent}}>A</div>
        </div>
      </div>}
    </div>;
  };
  return (
    <div style={{display:"grid", gap:22}}>
      <SectionHead
        eyebrow={t("nav_settings")}
        title={t("nav_qr")}
        sub={lang==="tr"?"Her masa için imzalı, güvenli QR kodları. Tasarımını seç, yazdır, masaya yerleştir.":"Signed, secure QR codes per table. Pick a design, print, place on the table."}
        actions={<>
          <Button variant="soft" icon="download">PNG</Button>
          <Button variant="primary" icon="printer">{lang==="tr"?"Yazdır":"Print"}</Button>
        </>}/>
      <div style={{display:"grid", gridTemplateColumns:"280px 1fr", gap:14}}>
        <Card>
          <div style={{display:"grid", gap:14}}>
            <Field label={t("nav_branches")}>
              <Select value={branch} onChange={e=>setBranch(e.target.value)}>
                {branches.map(b=>(<option key={b.id} value={b.id}>{b.name}</option>))}
              </Select>
            </Field>
            <Field label={lang==="tr"?"Masa aralığı":"Table range"}>
              <div style={{display:"flex", gap:8}}>
                <Input placeholder="1" style={{flex:1}}/>
                <Input placeholder={branches.find(b=>b.id===branch)?.tables||24} style={{flex:1}}/>
              </div>
            </Field>
            <Field label={lang==="tr"?"Doğrulama":"Verification"}>
              <Select><option>{lang==="tr"?"Açık":"Open"}</option><option>{lang==="tr"?"Masa kodu":"Table code"}</option><option>{lang==="tr"?"Personel onayı":"Staff approval"}</option></Select>
            </Field>
            <Field label={lang==="tr"?"Boyut":"Size"}>
              <input type="range" min="8" max="16" value={size} onChange={e=>setSize(+e.target.value)}
                style={{width:"100%", accentColor:"var(--accent)"}}/>
            </Field>
          </div>
        </Card>
        <div>
          <div style={{display:"flex", gap:8, marginBottom:14}}>
            {designs.map(d=>(
              <button key={d.id} onClick={()=>setDesign(d.id)} style={{
                padding:"8px 14px", borderRadius:8, fontSize:12.5, fontWeight:600,
                background: design===d.id?"var(--ink)":"var(--card)",
                color: design===d.id?"var(--paper)":"var(--ink-2)",
                border:`1px solid ${design===d.id?"var(--ink)":"var(--line)"}`
              }}>{d.name}</button>
            ))}
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
            {[1,2,3].map(n => (
              <Card key={n} pad={16}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
                  <div style={{fontSize:10, fontFamily:"var(--font-mono)", letterSpacing:".14em",
                    color:"var(--ink-3)", textTransform:"uppercase"}}>MASA {String(n).padStart(2,"0")}</div>
                  <Icon name="copy" size={12} stroke="var(--ink-3)"/>
                </div>
                {design==="v1" && <Qr/>}
                {design==="v2" && (
                  <div style={{background:"var(--ink)", padding:14, borderRadius:10}}>
                    <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--paper)",
                      fontSize:18,textAlign:"center",marginBottom:8}}>Aleg</div>
                    <Qr/>
                    <div style={{fontSize:9,color:"var(--paper)",textAlign:"center",marginTop:8,
                      fontFamily:"var(--font-mono)",letterSpacing:".1em"}}>TABLE {n} · KARAKÖY</div>
                  </div>
                )}
                {design==="v3" && (
                  <div style={{background:"var(--accent)", padding:16, borderRadius:10, color:"#FFF8EC"}}>
                    <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:22,textAlign:"center"}}>Scan.</div>
                    <div style={{fontSize:9,textAlign:"center",marginBottom:8,marginTop:-2,opacity:.8}}>Sip. Savor.</div>
                    <Qr accent="#C4553A"/>
                  </div>
                )}
                {design==="v4" && (
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:10,
                    background:"var(--card-2)", border:"1px solid var(--line)", borderRadius:10}}>
                    <div style={{display:"grid",alignContent:"center",gap:4}}>
                      <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:16}}>Aleg</div>
                      <div style={{fontSize:9,color:"var(--ink-3)",fontFamily:"var(--font-mono)"}}>T-{String(n).padStart(2,"0")}</div>
                    </div>
                    <Qr/>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Products, AddProductModal, Appearance });
