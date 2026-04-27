// Map component — REAL Earth photo + real Turkey silhouette overlay
const { useState: useMS, useEffect: useME, useRef: useMR } = React;

// ---------------------------------------------------------------
// TURKEY MAP — uses real silhouette image + pinned cities
// ---------------------------------------------------------------
// The reference image (refs/turkey-map.png) is 1804×982
// Turkey spans roughly lon 26°–45°, lat 36°–42°
// We pinpoint the PIXEL positions of major cities on the REAL image
// (measured from the paintmaps.com reference image — tuned by eye)

function TurkeyMap({ animateIn = false }) {
  // Cities with pixel positions on the 1804×982 reference (as % for scaling)
  const cities = [
    // main pilot — ISPARTA (center of province, near label)
    { id: 'isparta',   name: 'ISPARTA',    x: 24.0, y: 54.0, main: true,  count: 3, tag: 'PİLOT · YAZ 2026', msg: '🚀 Aleg ilk buradan başlıyor · 3 pilot işletme' },
    // beta cities (active)
    { id: 'istanbul',  name: 'İstanbul',   x: 13.0, y: 8.5,  count: 2, tag: 'BETA · Q3 2026' },
    { id: 'ankara',    name: 'Ankara',     x: 33.5, y: 28.0, count: 1, tag: 'BETA · Q3 2026' },
    { id: 'izmir',     name: 'İzmir',      x: 5.0,  y: 44.0, count: 1, tag: 'BETA · Q3 2026' },
    { id: 'antalya',   name: 'Antalya',    x: 25.0, y: 64.0, count: 1, tag: 'BETA · Q3 2026' },
    // waiting
    { id: 'bursa',     name: 'Bursa',      x: 13.5, y: 17.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'eskisehir', name: 'Eskişehir',  x: 23.0, y: 30.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'konya',     name: 'Konya',      x: 32.5, y: 47.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'adana',     name: 'Adana',      x: 44.0, y: 55.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'gaziantep', name: 'Gaziantep',  x: 55.0, y: 65.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'trabzon',   name: 'Trabzon',    x: 63.0, y: 10.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'diyarbakir',name: 'Diyarbakır', x: 65.0, y: 52.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'samsun',    name: 'Samsun',     x: 47.0, y: 9.0,  count: 0, tag: 'Talep bekliyor' },
    { id: 'kayseri',   name: 'Kayseri',    x: 48.5, y: 44.0, count: 0, tag: 'Talep bekliyor' },
    { id: 'van',       name: 'Van',        x: 83.0, y: 43.0, count: 0, tag: 'Talep bekliyor' },
  ];

  return (
    <div className={`tr-map-wrap ${animateIn ? 'animate-in' : ''}`}>
      {/* Backdrop — subtle paper texture / dot grid */}
      <div className="tr-map-bg"></div>

      {/* Image + pins live in the same sized box so % positioning lines up */}
      <div className="tr-map-stage">
        {/* Radar sweep from pilot Isparta */}
        <div className="tr-radar">
          <div className="tr-radar-sweep"></div>
        </div>

        {/* Real Turkey silhouette */}
        <img src="refs/turkey-map-clean.png" alt="Türkiye" className="tr-map-img"/>

        {/* Animated trade-route arcs from Isparta pilot → every active city */}
        <svg className="tr-arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0"/>
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.85"/>
              <stop offset="100%"stopColor="var(--accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {(() => {
            const ispX = 24.0, ispY = 54.0;
            // curve arcs above the straight line
            return cities.filter(c => !c.main).map((c, i) => {
              const mx = (ispX + c.x) / 2;
              const my = (ispY + c.y) / 2;
              // lift mid-point upward (less for nearby, more for far cities)
              const dx = c.x - ispX, dy = c.y - ispY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const lift = Math.min(dist * 0.28, 14);
              const cy = my - lift;
              const d = `M ${ispX} ${ispY} Q ${mx} ${cy} ${c.x} ${c.y}`;
              const active = c.count > 0;
              const delay = (i * 0.45) % 3.5;
              return (
                <g key={c.id}>
                  {/* dashed static trail */}
                  <path d={d} fill="none"
                    stroke={active ? 'var(--accent)' : 'rgba(140,122,105,0.35)'}
                    strokeWidth={active ? 0.25 : 0.18}
                    strokeDasharray={active ? '0.8 1.2' : '0.5 1.5'}
                    opacity={active ? 0.55 : 0.35}
                    className="tr-arc-path"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                  {/* traveling signal dot */}
                  {active && (
                    <circle r="0.55" fill="var(--accent)" className="tr-arc-dot">
                      <animateMotion dur="3.2s" repeatCount="indefinite"
                        path={d}
                        begin={`${delay}s`}
                        keyPoints="0;1" keyTimes="0;1" />
                      <animate attributeName="opacity"
                        values="0;1;1;0" keyTimes="0;0.1;0.9;1"
                        dur="3.2s" repeatCount="indefinite"
                        begin={`${delay}s`} />
                    </circle>
                  )}
                </g>
              );
            });
          })()}
        </svg>

        {/* City pins positioned as % of the stage (and therefore the image) */}
        {cities.map((c, idx) => {
          const active = c.count > 0;
          return (
            <div
              key={c.id}
              className={`pin ${c.main ? '' : (active ? 'active' : 'small')}`}
              style={{ left: c.x + '%', top: c.y + '%', animationDelay: `${idx * 70}ms` }}
            >
              <div className="pin-dot"></div>
              {c.main && <div className="pin-ring"></div>}
              {c.main && <div className="pin-ring delay"></div>}
              {(c.main || active) && <div className="pin-label">{c.name}{c.count > 0 && <span className="count"> · {c.count}</span>}</div>}
              <div className="pin-popover">
                <div className="city">{c.name}</div>
                <div className="msg">{c.msg || (c.count > 0 ? `${c.count} işletme Aleg kullanıyor` : 'Sen ilk ol — demo talep et')}</div>
                <span className="mono">{c.tag}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="tr-legend">
        <div className="tr-legend-row"><span className="tr-legend-dot main"></span> Pilot · Isparta · 3 işletme</div>
        <div className="tr-legend-row"><span className="tr-legend-dot active"></span> Beta · 5 işletme</div>
        <div className="tr-legend-row"><span className="tr-legend-dot waiting"></span> Talep bekliyor</div>
      </div>

      {/* Back to world */}
      <div className="tr-back-hint mono">← Dünyayı göster</div>
    </div>
  );
}

// ---------------------------------------------------------------
// WORLD — photoreal Earth globe (uses the reference photo) with
// Turkey hotspot + slow rotation
// ---------------------------------------------------------------
function WorldMap({ onTurkeyClick }) {
  return (
    <div className="world-wrap" onClick={onTurkeyClick}>
      {/* Starfield background */}
      <div className="world-stars">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 73) % 100}%`,
              opacity: 0.3 + ((i * 13) % 70) / 100,
              animationDelay: `${(i % 8) * 0.4}s`,
            }}
          ></span>
        ))}
      </div>

      {/* The actual Earth photo — rotates slowly */}
      <div className="world-globe">
        <img src="refs/earth.jpg" alt="Earth" className="world-earth"/>
        {/* Atmospheric glow */}
        <div className="world-atm"></div>
      </div>

      {/* Turkey hotspot — fixed position over Asia Minor */}
      <div className="world-hotspot">
        <div className="world-hot-ring"></div>
        <div className="world-hot-ring delay"></div>
        <div className="world-hot-dot"></div>
        <div className="world-hot-label">
          <div className="mono">TÜRKİYE</div>
          <div className="sub">Tıkla · Detay</div>
        </div>
      </div>

      {/* Corner telemetry */}
      <div className="world-telemetry">
        <div className="wt-row"><span className="mono">ORIGIN</span> <b>ISPARTA · 37.76°N · 30.55°E</b></div>
        <div className="wt-row"><span className="mono">HORIZON</span> <b>2026 TR · 2027 EU</b></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// MAP SECTION — world-first, click Turkey to drill down
// ---------------------------------------------------------------
function MapSection() {
  const [view, setView] = useMS('world');
  const [animating, setAnimating] = useMS(false);

  const goToTurkey = () => {
    if (view === 'turkey' || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setView('turkey');
      setTimeout(() => setAnimating(false), 50);
    }, 500);
  };

  const goToWorld = () => {
    if (view === 'world') return;
    setView('world');
  };

  return (
    <section className="map-section" id="map">
      <div className="container">
        <div className="reveal">
          <div className="section-label"><span className="mono">Yayılma — Live Map</span></div>
          <div className="map-header">
            <h2>
              Aleg burada <span className="serif">büyüyor.</span>
            </h2>
            <p>Dünyadan Isparta'ya, oradan senin şehrine. Türkiye üzerine tıkla, detayı gör.</p>
          </div>

          <div className="map-toggle">
            <button className={view === 'world' ? 'active' : ''} onClick={goToWorld}>Dünya</button>
            <button className={view === 'turkey' ? 'active' : ''} onClick={goToTurkey}>Türkiye</button>
          </div>

          <div className={`map-canvas ${view === 'turkey' ? 'is-turkey' : 'is-world'} ${animating ? 'zoom-in' : ''}`}>
            {view === 'world' ? (
              <WorldMap onTurkeyClick={goToTurkey} />
            ) : (
              <TurkeyMap animateIn={animating} />
            )}
          </div>

          <div className="map-stats">
            <div className="map-stat">
              <div className="lab">🗓 Başlangıç</div>
              <div className="val">Yaz 2026 · Isparta'dan başlıyoruz</div>
            </div>
            <div className="map-stat">
              <div className="lab">📍 Aktif Şehir</div>
              <div className="val">5 şehir · 8 işletme</div>
            </div>
            <div className="map-stat">
              <div className="lab">🌍 Ufuk</div>
              <div className="val">2027 · Avrupa'ya genişleme planlı</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.MapSection = MapSection;
