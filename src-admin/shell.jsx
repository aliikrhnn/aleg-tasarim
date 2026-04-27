const { useState: useSt, useEffect: useEf, useRef: useRf } = React;

// ========== SIDEBAR ======================================================
function Sidebar({ activeScreen, onNavigate, collapsed, onToggleCollapse }) {
  const w = collapsed ? 68 : 256;
  return (
    <aside style={{
      width: w, flexShrink: 0,
      background: "var(--paper-2)",
      borderRight: "1px solid var(--line)",
      display: "grid", gridTemplateRows: "auto 1fr auto",
      overflow: "hidden",
      transition: "width .2s ease"
    }}>
      {/* Brand */}
      <div style={{ padding: collapsed ? "18px 14px" : "20px 18px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--r-sm)",
            background: "var(--super)", color: "var(--card)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontFamily: "var(--f-serif)", fontStyle: "italic",
            fontSize: 18, fontWeight: 500, letterSpacing: "-0.04em"
          }}>a</div>
          {!collapsed && (
            <div style={{ display: "grid", gap: 0 }}>
              <strong style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontWeight: 400, fontSize: 18, letterSpacing: "-0.02em", color: "var(--ink)" }}>Aleg</strong>
              <span className="font-mono" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--super)" }}>Platform Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 8px", overflowY: "auto", display: "grid", alignContent: "start", gap: 2 }}>
        {window.DATA.NAV.map((group) => (
          <div key={group.group} style={{ display: "grid", gap: 1, marginTop: 6 }}>
            {!collapsed && (
              <div className="eyebrow" style={{ padding: "10px 10px 6px", fontSize: 9.5 }}>
                {group.group}
              </div>
            )}
            {collapsed && <div style={{ height: 1, background: "var(--line)", margin: "8px 8px" }} />}
            {group.items.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    minHeight: 36, width: "100%",
                    padding: collapsed ? "0 0 0 0" : "0 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "var(--r-sm)",
                    textDecoration: "none",
                    fontSize: 13,
                    fontFamily: "var(--f-sans)",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--ink)" : "var(--ink-2)",
                    background: isActive ? "var(--card)" : "transparent",
                    boxShadow: isActive ? "var(--shadow-sm)" : "none",
                    border: "none",
                    borderLeft: !collapsed && isActive ? `2px solid var(--super)` : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background .12s, color .12s"
                  }}
                >
                  <span style={{ width: 18, textAlign: "center", fontSize: 13, color: isActive ? "var(--super)" : "var(--ink-3)", flexShrink: 0, fontFamily: "var(--f-mono)" }}>{item.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {!collapsed && item.badge !== undefined && (
                    <span className="font-mono" style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 999,
                      color: item.badgeTone === "warn" ? "var(--warn)" : item.badgeTone === "danger" ? "var(--danger)" : "var(--ink-3)",
                      background: item.badgeTone === "warn" ? "color-mix(in oklab, var(--warn) 14%, transparent)"
                                 : item.badgeTone === "danger" ? "color-mix(in oklab, var(--danger) 14%, transparent)"
                                 : "var(--paper-3)"
                    }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — collapse + avatar */}
      <div style={{
        padding: collapsed ? "12px 10px" : "12px 14px",
        borderTop: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "space-between"
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <Avatar text="MB" tint="var(--super)" />
            <div style={{ display: "grid", minWidth: 0 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mert Baştuğ</span>
              <span className="font-mono" style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>SUPER_ADMIN</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Aç" : "Daralt"}
          style={{
            width: 30, height: 30, borderRadius: "var(--r-sm)",
            border: "1px solid var(--line-2)", background: "var(--card)",
            color: "var(--ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)",
            fontSize: 11, fontWeight: 700, flexShrink: 0
          }}
        >{collapsed ? "▶" : "◀"}</button>
      </div>
    </aside>
  );
}

// ========== TOPBAR =======================================================
function Topbar({ title, breadcrumbs, onOpenCmd, onOpenTheme, onOpenNotif, notifCount = 5 }) {
  return (
    <header style={{
      height: 62, flexShrink: 0,
      borderBottom: "1px solid var(--line)",
      background: "var(--card)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", gap: 16
    }}>
      {/* Left — breadcrumb + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{ display: "grid", gap: 2 }}>
          {breadcrumbs && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{b}</span>
                  {i < breadcrumbs.length - 1 && <span style={{ color: "var(--ink-3)" }}>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>{title}</h2>
        </div>
      </div>

      {/* Right — search, status, actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onOpenCmd}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            height: 36, padding: "0 12px 0 14px",
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--line-2)",
            background: "var(--paper)",
            color: "var(--ink-3)",
            fontSize: 12, cursor: "pointer", minWidth: 280,
            justifyContent: "space-between",
            fontFamily: "var(--f-sans)"
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--f-mono)" }}>⌕</span>
            İşletme, fatura, kullanıcı ara…
          </span>
          <kbd style={{ fontFamily: "var(--f-mono)", fontSize: 10, padding: "2px 6px", border: "1px solid var(--line-2)", borderRadius: 4, background: "var(--card)", color: "var(--ink-2)" }}>⌘K</kbd>
        </button>

        <div style={{ width: 1, height: 20, background: "var(--line)" }} />

        {/* live status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 8px" }}>
          <StatusDot tone="ok" pulse />
          <span className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ok)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Canlı</span>
          <span className="tick" style={{ fontSize: 10.5, color: "var(--ink-3)" }}><Tick value={1247} /> aktif</span>
        </div>

        <button
          onClick={onOpenNotif}
          style={{
            position: "relative",
            width: 36, height: 36, borderRadius: "var(--r-sm)",
            border: "1px solid var(--line-2)", background: "var(--paper)",
            color: "var(--ink-2)", cursor: "pointer", fontSize: 15, fontFamily: "var(--f-mono)"
          }}
          title="Bildirimler"
        >
          ◐
          {notifCount > 0 && (
            <span style={{
              position: "absolute", top: -3, right: -3,
              minWidth: 16, height: 16, padding: "0 4px",
              borderRadius: 999, background: "var(--accent)", color: "var(--card)",
              fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid var(--card)"
            }}>{notifCount}</span>
          )}
        </button>

        <button
          onClick={onOpenTheme}
          style={{
            width: 36, height: 36, borderRadius: "var(--r-sm)",
            border: "1px solid var(--line-2)", background: "var(--paper)",
            color: "var(--ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 14
          }}
          title="Tema"
        >◐</button>

        <div style={{ width: 1, height: 20, background: "var(--line)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
          <Avatar text="MB" tint="var(--super)" size={30} />
        </div>
      </div>
    </header>
  );
}

// ========== COMMAND PALETTE (⌘K) =========================================
function CommandPalette({ open, onClose, onNavigate }) {
  const [q, setQ] = useSt("");
  const ref = useRf(null);
  useEf(() => { if (open) setTimeout(() => ref.current?.focus(), 30); }, [open]);
  if (!open) return null;

  const flat = window.DATA.NAV.flatMap(g => g.items.map(i => ({ ...i, group: g.group })));
  const results = q ? flat.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : flat.slice(0, 8);
  const bizResults = q ? window.DATA.businesses.filter(b => b.name.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 620, maxHeight: "70vh", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="font-mono" style={{ color: "var(--ink-3)", fontSize: 14 }}>⌕</span>
          <input
            ref={ref}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="İşletme, fatura, kullanıcı veya sayfa ara…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontFamily: "var(--f-sans)", fontSize: 16 }}
          />
          <kbd style={{ fontFamily: "var(--f-mono)", fontSize: 10, padding: "2px 6px", border: "1px solid var(--line)", borderRadius: 4, color: "var(--ink-3)" }}>ESC</kbd>
        </div>
        <div className="scroll-y" style={{ padding: "8px 10px", minHeight: 0 }}>
          {results.length > 0 && (
            <div style={{ padding: "8px 8px 4px" }}>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Sayfalar</div>
              {results.map(r => (
                <button key={r.id} onClick={() => { onNavigate(r.id); onClose(); }} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 10px",
                  border: "none", background: "transparent", cursor: "pointer", borderRadius: "var(--r-sm)",
                  color: "var(--ink)", fontSize: 13, textAlign: "left", fontFamily: "var(--f-sans)"
                }} onMouseEnter={e => e.currentTarget.style.background = "var(--paper-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span className="font-mono" style={{ width: 18, color: "var(--ink-3)" }}>{r.icon}</span>
                  <span style={{ flex: 1 }}>{r.label}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{r.group}</span>
                </button>
              ))}
            </div>
          )}
          {bizResults.length > 0 && (
            <div style={{ padding: "8px 8px 4px", borderTop: "1px solid var(--line)" }}>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>İşletmeler</div>
              {bizResults.slice(0, 5).map(b => (
                <button key={b.id} onClick={() => { onNavigate("business-detail"); onClose(); }} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px",
                  border: "none", background: "transparent", cursor: "pointer", borderRadius: "var(--r-sm)",
                  color: "var(--ink)", fontSize: 13, textAlign: "left"
                }} onMouseEnter={e => e.currentTarget.style.background = "var(--paper-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <LogoTile logo={b.logo} tint={b.tint} size={26} />
                  <div style={{ display: "grid", flex: 1 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{b.name}</span>
                    <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{b.city} · {b.plan}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.05em" }}>
          <span><kbd style={kbdS}>↑↓</kbd> gez</span>
          <span><kbd style={kbdS}>↵</kbd> aç</span>
          <span><kbd style={kbdS}>ESC</kbd> kapat</span>
          <span style={{ marginLeft: "auto" }}>Aleg Platform · v2.14.3</span>
        </div>
      </div>
    </div>
  );
}
const kbdS = { fontFamily: "var(--f-mono)", fontSize: 10, padding: "1px 5px", border: "1px solid var(--line)", borderRadius: 3, color: "var(--ink-2)", marginRight: 3 };

// ========== TWEAKS PANEL =================================================
function TweaksPanel({ visible, onClose, theme, setTheme, radius, setRadius, density, setDensity }) {
  if (!visible) return null;
  const themes = [
    { id: "warm",      label: "Warm",      sub: "Kağıt · terracotta", colors: ["#F4EEE2", "#C4553A", "#6B7A4B", "#2A1F18"] },
    { id: "espresso",  label: "Espresso",  sub: "Koyu · sıcak",        colors: ["#1A140F", "#D97B5A", "#9CAA7A", "#F2E7D6"] },
    { id: "swiss",     label: "Swiss",     sub: "Minimal · beyaz",     colors: ["#FFFFFF", "#D94A2E", "#111111", "#888"] },
    { id: "editorial", label: "Editorial", sub: "Dergi · zengin",      colors: ["#F7F3EB", "#8B2E1F", "#4E5A32", "#A07830"] }
  ];
  return (
    <div className="tweaks-panel" style={{
      position: "fixed", top: 80, right: 24, zIndex: 40,
      width: 300, padding: 0,
      background: "var(--card)", border: "1px solid var(--line-2)",
      borderRadius: "var(--r)", boxShadow: "var(--shadow-lg)"
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5 }}>TWEAKS</div>
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 18, color: "var(--ink)" }}>Görünüm</div>
        </div>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink-2)", cursor: "pointer" }}>×</button>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Tema</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {themes.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} style={{
                padding: 10, borderRadius: "var(--r-sm)", cursor: "pointer",
                border: theme === t.id ? "1.5px solid var(--super)" : "1px solid var(--line-2)",
                background: theme === t.id ? "color-mix(in oklab, var(--super) 8%, var(--card))" : "var(--paper)",
                display: "grid", gap: 6, textAlign: "left"
              }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {t.colors.map(c => <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: "1px solid rgba(0,0,0,.08)" }} />)}
                </div>
                <div style={{ display: "grid", gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{t.label}</span>
                  <span className="font-mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{t.sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Köşe yuvarlaklığı</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {["8", "14", "22"].map(r => (
              <button key={r} onClick={() => setRadius(r)} style={{
                padding: "10px 0", borderRadius: r + "px", cursor: "pointer",
                border: radius === r ? "1.5px solid var(--super)" : "1px solid var(--line-2)",
                background: radius === r ? "color-mix(in oklab, var(--super) 10%, var(--card))" : "var(--paper)",
                fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 700, color: radius === r ? "var(--super)" : "var(--ink-2)"
              }}>{r}px</button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Tablo yoğunluğu</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[["comfortable", "Rahat"], ["compact", "Sıkı"]].map(([k, l]) => (
              <button key={k} onClick={() => setDensity(k)} style={{
                padding: "10px 0", borderRadius: "var(--r-sm)", cursor: "pointer",
                border: density === k ? "1.5px solid var(--super)" : "1px solid var(--line-2)",
                background: density === k ? "color-mix(in oklab, var(--super) 10%, var(--card))" : "var(--paper)",
                fontSize: 12, fontWeight: 600, color: density === k ? "var(--super)" : "var(--ink-2)"
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, CommandPalette, TweaksPanel });
