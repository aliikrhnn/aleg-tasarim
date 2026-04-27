// Mock data — realistic Turkish cafe names, cities, people
const businesses = [
  { id: "b_001", name: "Karaköy Kahve Evi",       owner: "Ayşe Demir",       city: "İstanbul", district: "Beyoğlu",    plan: "Pro",        status: "active",    mrr: 2499, orders30d: 4820, branches: 3, lastLogin: "12 dk önce",  joined: "2024-03-14", logo: "KK", tint: "#C4553A" },
  { id: "b_002", name: "Moda Sahil Kafe",         owner: "Mehmet Yılmaz",    city: "İstanbul", district: "Kadıköy",    plan: "Growth",     status: "active",    mrr: 999,  orders30d: 1240, branches: 1, lastLogin: "2 saat önce", joined: "2024-05-02", logo: "MS", tint: "#6B7A4B" },
  { id: "b_003", name: "Alsancak Kitap & Kahve",  owner: "Zeynep Kaya",      city: "İzmir",    district: "Konak",      plan: "Pro",        status: "grace",     mrr: 2499, orders30d: 2190, branches: 2, lastLogin: "Bugün 09:14",joined: "2023-11-28", logo: "AK", tint: "#B08A3E" },
  { id: "b_004", name: "Alaçatı Pastane",         owner: "Emre Öztürk",      city: "İzmir",    district: "Çeşme",      plan: "Starter",    status: "pending",   mrr: 0,    orders30d: 0,    branches: 1, lastLogin: "—",           joined: "2026-04-17", logo: "AP", tint: "#8C7A69" },
  { id: "b_005", name: "Kızılay Roastery",        owner: "Burak Arslan",     city: "Ankara",   district: "Çankaya",    plan: "Enterprise", status: "active",    mrr: 7499, orders30d: 8340, branches: 7, lastLogin: "34 sn önce",  joined: "2023-08-11", logo: "KR", tint: "#2A1F18" },
  { id: "b_006", name: "Çukurambar Brunch House", owner: "Selin Aydın",      city: "Ankara",   district: "Çankaya",    plan: "Growth",     status: "active",    mrr: 999,  orders30d: 1590, branches: 1, lastLogin: "5 dk önce",   joined: "2024-09-22", logo: "ÇB", tint: "#C4553A" },
  { id: "b_007", name: "Konyaaltı Kahvecisi",     owner: "Deniz Çelik",      city: "Antalya",  district: "Muratpaşa",  plan: "Pro",        status: "suspended", mrr: 0,    orders30d: 420,  branches: 2, lastLogin: "3 gün önce",  joined: "2023-06-03", logo: "KK", tint: "#B84A3A" },
  { id: "b_008", name: "Bodrum Yalı Kahvesi",     owner: "Onur Kara",        city: "Muğla",    district: "Bodrum",     plan: "Growth",     status: "active",    mrr: 999,  orders30d: 980,  branches: 1, lastLogin: "1 saat önce", joined: "2025-02-18", logo: "BY", tint: "#6B7A4B" },
  { id: "b_009", name: "Nişantaşı Espresso Bar",  owner: "Ceren Yıldız",     city: "İstanbul", district: "Şişli",      plan: "Pro",        status: "active",    mrr: 2499, orders30d: 3120, branches: 2, lastLogin: "8 dk önce",   joined: "2024-07-30", logo: "NE", tint: "#B08A3E" },
  { id: "b_010", name: "Eskişehir Odunpazarı Kahve",owner: "Tolga Şahin",    city: "Eskişehir",district: "Odunpazarı", plan: "Starter",    status: "active",    mrr: 399,  orders30d: 540,  branches: 1, lastLogin: "45 dk önce",  joined: "2025-11-09", logo: "EO", tint: "#8C7A69" },
  { id: "b_011", name: "Bursa Cumalıkızık Kahve", owner: "Pınar Erdoğan",    city: "Bursa",    district: "Yıldırım",   plan: "Starter",    status: "pending",   mrr: 0,    orders30d: 0,    branches: 1, lastLogin: "—",           joined: "2026-04-18", logo: "BC", tint: "#6B7A4B" },
  { id: "b_012", name: "Trabzon Karadeniz Çay",   owner: "Fatih Ünal",       city: "Trabzon",  district: "Ortahisar",  plan: "Growth",     status: "active",    mrr: 999,  orders30d: 1820, branches: 2, lastLogin: "22 dk önce",  joined: "2024-02-14", logo: "TK", tint: "#C4553A" },
];

// Platform metrics
const platformMetrics = {
  totalBusinesses: 247,
  activeSubscriptions: 201,
  monthlyRevenue: 484720,
  newToday: 3,
  trend: {
    businesses: [180,185,188,194,201,208,215,222,228,234,240,247],
    subscriptions: [142,148,152,158,164,170,176,182,188,194,198,201],
    revenue: [320,345,360,378,402,418,432,446,458,468,478,484],
    newSignups: [2,4,3,6,2,5,4,3,5,7,4,3]
  }
};

// Pending payments — critical
const pendingPayments = [
  { business: "Alsancak Kitap & Kahve", amount: 2499, days: 3, invoice: "INV-2604-0312", logo: "AK" },
  { business: "Konyaaltı Kahvecisi",    amount: 2499, days: 12, invoice: "INV-2604-0287", logo: "KK" },
  { business: "Moda Sahil Kafe",        amount: 999,  days: 1,  invoice: "INV-2604-0334", logo: "MS" },
  { business: "Bursa Cumalıkızık Kahve",amount: 399,  days: 5,  invoice: "INV-2604-0301", logo: "BC" }
];

const activityFeed = [
  { t: "34sn", kind: "order",    who: "Kızılay Roastery",        what: "42 siparişlik akşam zirvesi — ₺3.280 ciro",   tone: "ok" },
  { t: "2dk",  kind: "plan",     who: "Karaköy Kahve Evi",        what: "Growth → Pro plan yükseltmesi",               tone: "super" },
  { t: "8dk",  kind: "signup",   who: "Alaçatı Pastane",          what: "Yeni işletme kaydı — onay bekliyor",         tone: "warn" },
  { t: "14dk", kind: "payment",  who: "Moda Sahil Kafe",          what: "Aylık fatura ödendi — ₺999",                  tone: "ok" },
  { t: "32dk", kind: "support",  who: "Trabzon Karadeniz Çay",    what: "Destek talebi açtı: 'QR menü yüklenmiyor'",   tone: "warn" },
  { t: "1sa",  kind: "suspend",  who: "Konyaaltı Kahvecisi",      what: "Ödeme başarısız — plan askıya alındı",       tone: "danger" },
  { t: "2sa",  kind: "module",   who: "Nişantaşı Espresso Bar",   what: "Sadakat Programı modülü açıldı",              tone: "muted" },
  { t: "3sa",  kind: "order",    who: "Çukurambar Brunch House",  what: "Brunch servisi sona erdi — 84 sipariş",      tone: "muted" },
];

const plans = [
  { id: "starter", name: "Starter",    monthly: 399,  yearly: 3990,  users: 48,  modules: 4,  maxBranches: 1, maxProducts: 50,  maxTeam: 3,  tone: "muted" },
  { id: "growth",  name: "Growth",     monthly: 999,  yearly: 9990,  users: 82,  modules: 8,  maxBranches: 2, maxProducts: 200, maxTeam: 8,  tone: "super" },
  { id: "pro",     name: "Pro",        monthly: 2499, yearly: 24990, users: 53,  modules: 14, maxBranches: 5, maxProducts: 999, maxTeam: 25, tone: "gold",     featured: true },
  { id: "ent",     name: "Enterprise", monthly: 7499, yearly: 74990, users: 18,  modules: 22, maxBranches: 99,maxProducts: 9999,maxTeam: 99, tone: "danger" }
];

const invoices = [
  { id: "INV-2604-0334", business: "Moda Sahil Kafe",          period: "Nis 2026", amount: 999,  status: "pending", method: "iyzico",     date: "17 Nis" },
  { id: "INV-2604-0333", business: "Karaköy Kahve Evi",         period: "Nis 2026", amount: 2499, status: "paid",    method: "iyzico",     date: "17 Nis" },
  { id: "INV-2604-0332", business: "Çukurambar Brunch House",   period: "Nis 2026", amount: 999,  status: "paid",    method: "havale",     date: "17 Nis" },
  { id: "INV-2604-0331", business: "Nişantaşı Espresso Bar",    period: "Nis 2026", amount: 2499, status: "paid",    method: "iyzico",     date: "17 Nis" },
  { id: "INV-2604-0330", business: "Kızılay Roastery",          period: "Nis 2026", amount: 7499, status: "paid",    method: "havale",     date: "16 Nis" },
  { id: "INV-2604-0329", business: "Bodrum Yalı Kahvesi",       period: "Nis 2026", amount: 999,  status: "paid",    method: "iyzico",     date: "16 Nis" },
  { id: "INV-2604-0312", business: "Alsancak Kitap & Kahve",   period: "Nis 2026", amount: 2499, status: "pending", method: "iyzico",     date: "15 Nis" },
  { id: "INV-2604-0301", business: "Bursa Cumalıkızık Kahve",  period: "Nis 2026", amount: 399,  status: "failed",  method: "iyzico",     date: "13 Nis" },
  { id: "INV-2604-0287", business: "Konyaaltı Kahvecisi",      period: "Mar 2026", amount: 2499, status: "failed",  method: "iyzico",     date: "06 Nis" },
  { id: "INV-2604-0276", business: "Eskişehir Odunpazarı Kahve",period:"Nis 2026", amount: 399,  status: "paid",    method: "iyzico",     date: "04 Nis" },
  { id: "INV-2604-0264", business: "Trabzon Karadeniz Çay",    period: "Nis 2026", amount: 999,  status: "paid",    method: "havale",     date: "02 Nis" },
];

const tickets = {
  new: [
    { id: "T-0294", business: "Trabzon Karadeniz Çay",  subject: "QR menü sayfası yüklenmiyor",              priority: "high",   last: "12 dk",  owner: null,       msgs: 1 },
    { id: "T-0293", business: "Moda Sahil Kafe",         subject: "Yazıcı entegrasyonu bağlantı hatası",     priority: "medium", last: "1 sa",   owner: null,       msgs: 2 },
    { id: "T-0292", business: "Alaçatı Pastane",         subject: "Yeni kayıt — onay süreci soru",            priority: "low",    last: "2 sa",   owner: null,       msgs: 1 },
  ],
  in_progress: [
    { id: "T-0289", business: "Kızılay Roastery",        subject: "Çoklu şube raporlama sayısı hatalı",       priority: "high",   last: "45 dk",  owner: "Emir B.",  msgs: 7 },
    { id: "T-0285", business: "Karaköy Kahve Evi",       subject: "İyzico havale eşleşmesi gecikmesi",        priority: "medium", last: "3 sa",   owner: "Nil A.",   msgs: 4 },
  ],
  waiting: [
    { id: "T-0281", business: "Bodrum Yalı Kahvesi",     subject: "Menü görselleri büyük dosya uyarısı",     priority: "low",    last: "1 gün", owner: "Emir B.",  msgs: 5 },
    { id: "T-0278", business: "Nişantaşı Espresso Bar",  subject: "Personel rolü özelleştirme isteği",        priority: "medium", last: "2 gün", owner: "Ceren Y.", msgs: 3 },
  ],
  resolved: [
    { id: "T-0275", business: "Çukurambar Brunch House", subject: "Sipariş ekranı gecikmesi",                 priority: "medium", last: "Bugün",  owner: "Nil A.",   msgs: 9 },
    { id: "T-0272", business: "Eskişehir Odunpazarı Kahve",subject: "Fatura PDF indirilmiyor",                priority: "low",    last: "Dün",    owner: "Emir B.",  msgs: 4 },
    { id: "T-0268", business: "Konyaaltı Kahvecisi",     subject: "Askıya alma itiraz süreci",                priority: "high",   last: "3 gün",  owner: "Platform",msgs: 6 },
  ]
};

const auditLog = [
  { ts: "2026-04-18 14:32:08", actor: "admin@alegstudio.com", action: "business.suspend",       target: "b_007 · Konyaaltı Kahvecisi",      ip: "95.14.22.8",  meta: "reason=payment_failed, days=12" },
  { ts: "2026-04-18 14:28:44", actor: "emir@alegstudio.com",  action: "support.assign",          target: "T-0289",                            ip: "95.14.22.8",  meta: "assignee=emir@alegstudio.com" },
  { ts: "2026-04-18 14:12:01", actor: "system",                action: "invoice.generate",        target: "INV-2604-0334 · Moda Sahil Kafe",   ip: "—",           meta: "amount=999.00, plan=growth" },
  { ts: "2026-04-18 13:58:22", actor: "admin@alegstudio.com", action: "business.plan.upgrade",  target: "b_001 · Karaköy Kahve Evi",         ip: "95.14.22.8",  meta: "from=growth, to=pro" },
  { ts: "2026-04-18 13:44:17", actor: "nil@alegstudio.com",   action: "ticket.reply",            target: "T-0285",                            ip: "88.244.9.12", meta: "visibility=public" },
  { ts: "2026-04-18 13:20:09", actor: "admin@alegstudio.com", action: "business.approve",       target: "b_010 · Eskişehir Odunpazarı",     ip: "95.14.22.8",  meta: "onboarding_email_sent=true" },
  { ts: "2026-04-18 12:58:40", actor: "system",                action: "payment.retry",           target: "INV-2604-0287",                     ip: "—",           meta: "attempt=3, result=failed" },
  { ts: "2026-04-18 12:04:12", actor: "ceren@alegstudio.com", action: "plan.edit",               target: "plan:pro",                          ip: "78.188.41.3", meta: "maxProducts: 500 → 999" },
  { ts: "2026-04-18 11:48:33", actor: "admin@alegstudio.com", action: "auth.login",              target: "admin@alegstudio.com",              ip: "95.14.22.8",  meta: "mfa=totp, session=new" },
  { ts: "2026-04-18 11:22:05", actor: "system",                action: "business.signup",         target: "b_011 · Bursa Cumalıkızık",        ip: "94.54.18.229",meta: "plan=starter, referral=organic" },
  { ts: "2026-04-18 10:40:18", actor: "emir@alegstudio.com",  action: "module.toggle",          target: "b_009 · Nişantaşı Espresso",       ip: "88.244.9.12", meta: "module=loyalty, state=enabled" },
];

const platformUsers = [
  { name: "Mert Baştuğ",   email: "admin@alegstudio.com", role: "Super Admin", status: "active", lastActive: "12 dk önce", avatar: "MB" },
  { name: "Nil Akın",       email: "nil@alegstudio.com",   role: "Support Lead", status: "active", lastActive: "5 dk önce",  avatar: "NA" },
  { name: "Emir Balcı",     email: "emir@alegstudio.com",  role: "Support",      status: "active", lastActive: "Şu an",      avatar: "EB" },
  { name: "Ceren Yenilmez", email: "ceren@alegstudio.com", role: "Finance",      status: "active", lastActive: "2 sa önce",  avatar: "CY" },
  { name: "Sarp Doğan",     email: "sarp@alegstudio.com",  role: "Developer",    status: "idle",   lastActive: "1 gün önce", avatar: "SD" },
];

const systemHealth = {
  version: "v2.14.3",
  lastDeploy: "2026-04-18 09:14 UTC+3",
  uptime: "99.983%",
  uptime30d: "99.97%",
  errorRate: "0.014%",
  services: [
    { name: "API Gateway",       status: "ok",   latency: "42ms",  region: "fra1" },
    { name: "Supabase Postgres", status: "ok",   latency: "12ms",  region: "fra1" },
    { name: "Realtime WS",       status: "ok",   latency: "8ms",   region: "fra1" },
    { name: "Auth Service",      status: "ok",   latency: "31ms",  region: "fra1" },
    { name: "Payment · iyzico",  status: "warn", latency: "180ms", region: "tr1"  },
    { name: "Storage (S3)",      status: "ok",   latency: "55ms",  region: "fra1" },
    { name: "Email (Resend)",    status: "ok",   latency: "96ms",  region: "eu"   },
    { name: "SMS (NetGSM)",      status: "ok",   latency: "420ms", region: "tr1"  },
  ]
};

// City dots for the Türkiye map widget
const cityDots = [
  { city: "İstanbul",  x: 28, y: 22, count: 87 },
  { city: "Ankara",    x: 50, y: 38, count: 42 },
  { city: "İzmir",     x: 22, y: 46, count: 31 },
  { city: "Antalya",   x: 42, y: 62, count: 22 },
  { city: "Bursa",     x: 28, y: 30, count: 18 },
  { city: "Eskişehir", x: 38, y: 34, count: 14 },
  { city: "Muğla",     x: 30, y: 60, count: 12 },
  { city: "Trabzon",   x: 74, y: 22, count: 9 },
  { city: "Konya",     x: 46, y: 50, count: 8 },
  { city: "Gaziantep", x: 72, y: 56, count: 4 },
];

// Navigation structure
const NAV = [
  { group: "Genel", items: [
    { id: "dashboard",     label: "Gösterge Paneli",    icon: "◈" },
    { id: "stats",         label: "Platform İstatistikleri", icon: "◇" }
  ]},
  { group: "İşletmeler", items: [
    { id: "businesses",    label: "Tüm İşletmeler",     icon: "▤", badge: 247 },
    { id: "new-business",  label: "Yeni İşletme Oluştur", icon: "+" },
    { id: "pending",       label: "Onay Bekleyenler",   icon: "◔", badgeTone: "warn", badge: 3 },
    { id: "suspended",     label: "Askıya Alınanlar",   icon: "◬", badgeTone: "danger", badge: 2 }
  ]},
  { group: "Abonelik", items: [
    { id: "plans",         label: "Planlar",            icon: "◫" },
    { id: "invoices",      label: "Faturalar",          icon: "₺" },
    { id: "payments",      label: "Ödemeler",           icon: "✓" },
    { id: "pending-pay",   label: "Bekleyen Ödemeler",  icon: "!", badgeTone: "danger", badge: 4 }
  ]},
  { group: "Destek", items: [
    { id: "tickets",       label: "Destek Talepleri",   icon: "☎", badge: 3 },
    { id: "notifications", label: "Bildirimler",        icon: "◐" }
  ]},
  { group: "Sistem", items: [
    { id: "users",         label: "Kullanıcılar",       icon: "◉" },
    { id: "audit",         label: "Audit Log",          icon: "⟐" },
    { id: "status",        label: "Sistem Durumu",      icon: "●" },
    { id: "settings",      label: "Ayarlar",            icon: "⚙" }
  ]}
];

Object.assign(window, {
  DATA: {
    businesses, platformMetrics, pendingPayments, activityFeed,
    plans, invoices, tickets, auditLog, platformUsers, systemHealth,
    cityDots, NAV
  }
});
