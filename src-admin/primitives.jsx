const { useState, useEffect, useRef, useMemo } = React;

// ====== Sparkline ========================================================
function Sparkline({ data, stroke = "var(--super)", fill = "none", width = 120, height = 36, showArea = true }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {showArea && <path d={area} fill={stroke} opacity="0.1" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={stroke} />
    </svg>
  );
}

// ====== Bar chart (thin) =================================================
function BarChart({ data, color = "var(--olive)", width = 260, height = 80, labels }) {
  const max = Math.max(...data);
  const barW = width / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 18);
        return (
          <g key={i}>
            <rect x={i * barW + 2} y={height - h - 14} width={barW - 4} height={h} fill={color} rx="2" opacity={i === data.length - 1 ? 1 : 0.7} />
            {labels && <text x={i * barW + barW / 2} y={height - 2} fontSize="9" fontFamily="Space Mono" fill="var(--ink-3)" textAnchor="middle">{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ====== Logo tile ========================================================
function LogoTile({ logo, tint = "var(--super)", size = 36 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: "var(--r-sm)",
      background: tint,
      color: "#FAF5EA",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--f-serif)", fontSize: size * 0.42, fontWeight: 500,
      fontStyle: "italic", letterSpacing: "-0.02em"
    }}>{logo}</div>
  );
}

// ====== Avatar ===========================================================
function Avatar({ text, tint = "var(--paper-3)", size = 28 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: tint, color: "var(--ink)" }}>{text}</div>
  );
}

// ====== Status dot =======================================================
function StatusDot({ tone = "ok", pulse = false }) {
  const color = tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : tone === "danger" ? "var(--danger)" : "var(--ink-3)";
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color }} />
      {pulse && <span style={{ position: "absolute", inset: -4, borderRadius: 999, border: `1.5px solid ${color}`, opacity: 0.5, animation: "pulse 1.6s ease-out infinite" }} />}
      <style>{`@keyframes pulse { 0% {transform:scale(.8); opacity:.6;} 100% {transform:scale(1.6); opacity:0;} }`}</style>
    </span>
  );
}

// ====== Pill =============================================================
function Pill({ tone = "muted", children, icon }) {
  const cls = `pill pill-${tone}`;
  return <span className={cls}>{icon && <span style={{ marginRight: 2 }}>{icon}</span>}{children}</span>;
}

// ====== Money (Instrument Serif italic big) ==============================
function Money({ amount, size = 42, currency = "₺", tone = "var(--ink)" }) {
  const formatted = amount.toLocaleString("tr-TR");
  return (
    <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", color: tone, fontWeight: 400 }}>
      <span style={{ fontSize: size * 0.6, verticalAlign: "0.15em", marginRight: 2, opacity: 0.55 }}>{currency}</span>{formatted}
    </span>
  );
}

// ====== Number (serif italic) ============================================
function SerifNum({ children, size = 42, tone = "var(--ink)" }) {
  return <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", color: tone, fontWeight: 400 }}>{children}</span>;
}

// ====== Live tick counter ================================================
function Tick({ value, suffix = "", ms = true }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (!ms) return;
    const id = setInterval(() => setV(x => x + Math.floor(Math.random() * 3)), 2200);
    return () => clearInterval(id);
  }, [ms]);
  return <span className="tick">{v.toLocaleString("tr-TR")}{suffix}</span>;
}

// ====== Section header (eyebrow + title) =================================
function SectionHead({ eyebrow, title, italic, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        {title && (
          italic ? (
            <h1 style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{title}</h1>
          ) : (
            <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{title}</h1>
          )
        )}
      </div>
      {children && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>}
    </div>
  );
}

// ====== Metric card ======================================================
function MetricCard({ label, value, currency, trend, trendLabel, sparkline, sparkColor, accent }) {
  return (
    <div className="card" style={{ padding: 20, display: "grid", gap: 14, minHeight: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="eyebrow">{label}</div>
        {trend !== undefined && (
          <span className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: trend >= 0 ? "var(--ok)" : "var(--danger)", letterSpacing: "0.04em" }}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        {currency ? <Money amount={value} size={40} tone={accent || "var(--ink)"} /> : <SerifNum size={40} tone={accent || "var(--ink)"}>{value.toLocaleString("tr-TR")}</SerifNum>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <span className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{trendLabel}</span>
        {sparkline && <Sparkline data={sparkline} stroke={sparkColor || "var(--super)"} width={110} height={34} />}
      </div>
    </div>
  );
}

// ====== Search input =====================================================
function SearchInput({ value, onChange, placeholder = "Ara...", width = 260 }) {
  return (
    <div style={{ position: "relative", width }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 12 }}>⌕</span>
      <input
        className="input"
        style={{ width: "100%", paddingLeft: 30 }}
        value={value || ""}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ====== Stepper ==========================================================
function Stepper({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: done || active ? 1 : 0.5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 999,
                border: `1.5px solid ${done ? "var(--super)" : active ? "var(--super)" : "var(--line-2)"}`,
                background: done ? "var(--super)" : active ? "color-mix(in oklab, var(--super) 16%, transparent)" : "transparent",
                color: done ? "var(--card)" : active ? "var(--super)" : "var(--ink-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 700
              }}>{done ? "✓" : i + 1}</div>
              <div style={{ display: "grid" }}>
                <span className="eyebrow" style={{ fontSize: 9.5 }}>Adım {i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "var(--ink)" : "var(--ink-2)" }}>{s}</span>
              </div>
            </div>
            {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: "var(--line)", margin: "0 14px" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ====== Turkey map widget (stylized) =====================================
function TurkiyeMap({ dots, accent = "var(--super)" }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "2 / 1", background: "var(--paper-2)", borderRadius: "var(--r)", border: "1px solid var(--line)", overflow: "hidden" }}>
      {/* very loose Türkiye silhouette */}
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M 4 30 C 4 22, 8 18, 16 18 L 24 14 L 38 12 L 54 14 L 70 12 L 84 16 L 94 22 L 96 32 L 90 40 L 78 42 L 64 40 L 50 42 L 36 44 L 22 42 L 10 38 Z"
          fill="var(--paper-3)" stroke="var(--line-2)" strokeWidth="0.3" />
      </svg>
      {/* city dots */}
      {dots.map((d, i) => {
        const r = 3 + Math.sqrt(d.count) * 0.8;
        return (
          <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%, -50%)" }}>
            <div style={{ width: r * 2, height: r * 2, borderRadius: 999, background: accent, opacity: 0.18, position: "absolute", inset: 0, transform: `scale(2)` }} />
            <div style={{ width: r * 2, height: r * 2, borderRadius: 999, background: accent, boxShadow: `0 0 0 1.5px var(--card)`, position: "relative" }} />
            <div style={{ position: "absolute", top: r * 2 + 4, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
              {d.city} <span style={{ color: accent }}>{d.count}</span>
            </div>
          </div>
        );
      })}
      {/* watermark */}
      <div style={{ position: "absolute", bottom: 8, right: 12, fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>TR · 10 şehir</div>
    </div>
  );
}

// ====== Image placeholder ================================================
function Placeholder({ label, width, height, ratio }) {
  const st = { width: width || "100%", height: height, aspectRatio: ratio, border: "1px dashed var(--line-2)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase" };
  return <div className="placeholder" style={st}>{label}</div>;
}

// ====== Filter chip ======================================================
function FilterChip({ label, value, onClear, active }) {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px",
      borderRadius: "var(--r-sm)",
      border: `1px solid ${active ? "var(--super)" : "var(--line-2)"}`,
      background: active ? "color-mix(in oklab, var(--super) 12%, transparent)" : "var(--card)",
      color: active ? "var(--super)" : "var(--ink-2)",
      fontSize: 12, fontWeight: 600, cursor: "pointer"
    }}>
      <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</span>
      <span>{value}</span>
      {active && onClear && <span onClick={e => { e.stopPropagation(); onClear(); }} style={{ color: "var(--ink-3)", marginLeft: 2 }}>×</span>}
    </button>
  );
}

Object.assign(window, {
  Sparkline, BarChart, LogoTile, Avatar, StatusDot, Pill, Money, SerifNum, Tick,
  SectionHead, MetricCard, SearchInput, Stepper, TurkiyeMap, Placeholder, FilterChip
});
