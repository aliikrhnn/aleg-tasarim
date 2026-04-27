// PDF export via browser print dialog. We render a hidden document,
// call window.print() on an iframe, letting the user save as PDF.
// Style is intentionally paper-like: serif title, mono data, cream background.

const openPrintable = (title, bodyHTML, opts={}) => {
  const accent = opts.accent || "#C4553A";
  const w = window.open("", "_blank", "width=1100,height=1400");
  if (!w) { alert("Please allow popups to export PDF."); return; }
  const css = `
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing:border-box; }
    html,body { margin:0; padding:0; background:#F4EEE2; color:#2A1F18;
      font-family: ui-sans-serif, system-ui, sans-serif; }
    .sheet { max-width: 820px; margin:0 auto; padding:28px 30px; background:#FAF5EA;
      border:1px solid #D6C9B2; }
    .eyebrow { font-family: ui-monospace, Menlo, monospace; font-size:10px; letter-spacing:.22em;
      text-transform:uppercase; color:${accent}; font-weight:600; }
    h1 { font-family: 'Bricolage Grotesque', Georgia, serif; font-style:italic; font-weight:500;
      font-size:34px; letter-spacing:-.02em; margin:4px 0 2px; }
    .sub { color:#8C7A69; font-size:13px; margin-bottom:22px; }
    table { width:100%; border-collapse: collapse; font-size:12px; }
    th, td { padding:9px 10px; text-align:left; border-bottom:1px solid #E5D9C1; }
    th { font-family: ui-monospace, Menlo, monospace; font-size:10px; letter-spacing:.1em;
      text-transform:uppercase; color:#8C7A69; font-weight:600; }
    .mono { font-family: ui-monospace, Menlo, monospace; }
    .pill { display:inline-block; padding:2px 7px; border-radius:999px;
      font-size:10px; font-family: ui-monospace, Menlo, monospace; letter-spacing:.06em;
      text-transform:uppercase; font-weight:600; }
    .pill.ok { background:rgba(79,124,76,.15); color:#4F7C4C; }
    .pill.warn { background:rgba(176,122,46,.15); color:#B07A2E; }
    .pill.danger { background:rgba(184,74,58,.15); color:#B84A3A; }
    .shift-grid { display:grid; grid-template-columns: 160px repeat(7, 1fr); gap:1px;
      background:#E5D9C1; border:1px solid #E5D9C1; }
    .shift-cell { background:#FAF5EA; padding:10px 8px; font-size:11px; min-height:42px; }
    .shift-hd { background:#EDE4D3; font-family: ui-monospace, Menlo, monospace; font-size:10px;
      letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:#8C7A69; }
    .tag { display:inline-block; padding:3px 8px; border-radius:6px; font-size:10.5px;
      font-weight:600; color:#FFF8EC; font-family: ui-monospace, Menlo, monospace; letter-spacing:.04em; }
    .footer { margin-top:28px; padding-top:14px; border-top:1px solid #D6C9B2;
      font-size:10.5px; color:#8C7A69; font-family: ui-monospace, Menlo, monospace;
      display:flex; justify-content:space-between; }
    .row { display:flex; gap:10px; justify-content:space-between; align-items:baseline; }
  `;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap" rel="stylesheet">
    <style>${css}</style></head>
    <body><div class="sheet">${bodyHTML}</div>
    <script>setTimeout(()=>window.print(), 400);</script>
    </body></html>`);
  w.document.close();
};

Object.assign(window, { openPrintable });
