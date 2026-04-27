// Main app — wires super admin panel.
const { useState: aS, useEffect: aE } = React;

function App() {
  const [screen, setScreen] = aS(() => localStorage.getItem("aleg-admin:screen") || "dashboard");
  const [theme, setTheme] = aS("warm");
  const [radius, setRadius] = aS("14");
  const [density, setDensity] = aS("comfortable");
  const [collapsed, setCollapsed] = aS(false);
  const [cmdOpen, setCmdOpen] = aS(false);
  const [tweaksOpen, setTweaksOpen] = aS(false);
  const [detailBiz, setDetailBiz] = aS(null);

  aE(() => { localStorage.setItem("aleg-admin:screen", screen); }, [screen]);
  aE(() => {
    document.body.setAttribute("data-theme", theme);
    document.body.setAttribute("data-radius", radius);
    document.body.setAttribute("data-density", density);
  }, [theme, radius, density]);

  // ⌘K
  aE(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === "Escape") { setCmdOpen(false); setTweaksOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Edit-mode protocol (Tweaks toolbar toggle)
  aE(() => {
    const h = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", h);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (_) {}
    return () => window.removeEventListener("message", h);
  }, []);

  const titleMap = {
    dashboard:      { t: "Gösterge Paneli",            b: ["GENEL"] },
    stats:          { t: "Platform İstatistikleri",   b: ["GENEL"] },
    businesses:     { t: "Tüm İşletmeler",             b: ["İŞLETMELER"] },
    "business-detail": { t: "İşletme Detayı",          b: ["İŞLETMELER", "DETAY"] },
    "new-business": { t: "Yeni İşletme Oluştur",       b: ["İŞLETMELER"] },
    pending:        { t: "Onay Bekleyenler",           b: ["İŞLETMELER"] },
    suspended:      { t: "Askıya Alınanlar",           b: ["İŞLETMELER"] },
    plans:          { t: "Abonelik Planları",          b: ["ABONELİK"] },
    invoices:       { t: "Faturalar",                   b: ["ABONELİK"] },
    payments:       { t: "Ödemeler",                    b: ["ABONELİK"] },
    "pending-pay":  { t: "Bekleyen Ödemeler",          b: ["ABONELİK"] },
    tickets:        { t: "Destek Talepleri",            b: ["DESTEK"] },
    notifications:  { t: "Bildirimler",                 b: ["DESTEK"] },
    users:          { t: "Platform Kullanıcıları",     b: ["SİSTEM"] },
    audit:          { t: "Audit Log",                   b: ["SİSTEM"] },
    status:         { t: "Sistem Durumu",               b: ["SİSTEM"] },
    settings:       { t: "Ayarlar",                     b: ["SİSTEM"] }
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":       return <DashboardScreen onNavigate={setScreen} />;
      case "stats":           return <StatsScreen />;
      case "businesses":      return <BusinessesScreen onNavigate={setScreen} setDetailBiz={setDetailBiz} />;
      case "business-detail": return <BusinessDetailScreen biz={detailBiz} onNavigate={setScreen} />;
      case "new-business":    return <NewBusinessScreen onNavigate={setScreen} />;
      case "pending":         return <PendingBusinessesScreen />;
      case "suspended":       return <SuspendedBusinessesScreen />;
      case "plans":           return <PlansScreen />;
      case "invoices":        return <InvoicesScreen />;
      case "payments":        return <PaymentsScreen />;
      case "pending-pay":     return <PendingPaymentsScreen />;
      case "tickets":         return <TicketsScreen />;
      case "notifications":   return <NotificationsScreen />;
      case "users":           return <PlatformUsersScreen />;
      case "audit":           return <AuditLogScreen />;
      case "status":          return <SystemStatusScreen />;
      case "settings":        return <SettingsScreen />;
      default:                return <DashboardScreen onNavigate={setScreen} />;
    }
  };

  const meta = titleMap[screen] || titleMap.dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <Sidebar activeScreen={screen} onNavigate={setScreen}
        collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title={meta.t} breadcrumbs={meta.b}
          onOpenCmd={() => setCmdOpen(true)}
          onOpenTheme={() => setTweaksOpen(t => !t)}
          onOpenNotif={() => setScreen("notifications")}
          notifCount={5} />
        <main style={{ flex: 1, overflowY: "auto" }} data-screen-label={meta.t}>
          {renderScreen()}
          <div style={{ height: 40 }} />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={setScreen} />
      <TweaksPanel visible={tweaksOpen} onClose={() => setTweaksOpen(false)}
        theme={theme} setTheme={setTheme}
        radius={radius} setRadius={setRadius}
        density={density} setDensity={setDensity} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
