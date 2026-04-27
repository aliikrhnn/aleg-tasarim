// SVG icon set — hand-picked strokes, 1.5 weight, 20px box.
const Icon = ({name, size=18, stroke="currentColor", fill="none", style}) => {
  const s = {width:size, height:size, display:"inline-block", flexShrink:0, ...style};
  const p = {fill:"none", stroke, strokeWidth:1.5, strokeLinecap:"round", strokeLinejoin:"round"};
  switch(name){
    case "dashboard": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 13V5a1 1 0 011-1h5v9H4zm0 2v4a1 1 0 001 1h5v-5H4zm8 0v5h7a1 1 0 001-1v-4h-8zm0-11v9h8V5a1 1 0 00-1-1h-7z"/></svg>;
    case "menu": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 4h9a3 3 0 013 3v13H9a3 3 0 01-3-3V4zm0 0h.01M9 9h6M9 13h6M9 17h3"/></svg>;
    case "grid": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/></svg>;
    case "box": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3l9 4v10l-9 4-9-4V7l9-4zm0 0v18M3 7l9 4 9-4"/></svg>;
    case "palette": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3a9 9 0 00-9 9 5 5 0 005 5h2a2 2 0 010 4 2 2 0 002 2 9 9 0 009-9c0-6-4-11-9-11z"/><circle cx="7.5" cy="10.5" r="1" fill={stroke}/><circle cx="12" cy="7.5" r="1" fill={stroke}/><circle cx="16.5" cy="10.5" r="1" fill={stroke}/></svg>;
    case "qr": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 3h3m0-3h3v3M14 20h3"/></svg>;
    case "bell": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9zm3 13a3 3 0 006 0"/></svg>;
    case "settings": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h0a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case "building": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 21V7l9-4 9 4v14M3 21h18M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6v4H9z"/></svg>;
    case "pin": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle {...p} cx="12" cy="9" r="2.5"/></svg>;
    case "users": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg>;
    case "plus": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12h14"/></svg>;
    case "search": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="M21 21l-4-4"/></svg>;
    case "chev-right": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M9 6l6 6-6 6"/></svg>;
    case "chev-down": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 9l6 6 6-6"/></svg>;
    case "chev-up": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 15l6-6 6 6"/></svg>;
    case "check": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M20 6L9 17l-5-5"/></svg>;
    case "close": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M18 6L6 18M6 6l12 12"/></svg>;
    case "drag": return <svg viewBox="0 0 24 24" style={s}><circle cx="9" cy="6" r="1.3" fill={stroke}/><circle cx="9" cy="12" r="1.3" fill={stroke}/><circle cx="9" cy="18" r="1.3" fill={stroke}/><circle cx="15" cy="6" r="1.3" fill={stroke}/><circle cx="15" cy="12" r="1.3" fill={stroke}/><circle cx="15" cy="18" r="1.3" fill={stroke}/></svg>;
    case "edit": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case "pencil": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case "camera": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 7h4l2-3h6l2 3h4v13H3V7zm9 3a4 4 0 100 8 4 4 0 000-8z"/></svg>;
    case "trash": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>;
    case "sparkle": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z"/></svg>;
    case "globe": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    case "eye": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle {...p} cx="12" cy="12" r="3"/></svg>;
    case "eye-off": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M17.9 17.9A11 11 0 0112 20c-7 0-11-8-11-8a20 20 0 015.2-6M9.9 5.1A11 11 0 0112 4c7 0 11 8 11 8a20 20 0 01-3.3 4.8M1 1l22 22M9.9 9.9A3 3 0 0014 14"/></svg>;
    case "coffee": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 8h14v6a5 5 0 01-5 5H8a5 5 0 01-5-5V8zm14 2h2a3 3 0 010 6h-2M6 2v2M10 2v2M14 2v2"/></svg>;
    case "star": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 2l3 7 7 .6-5.3 4.6 1.7 7L12 17l-6.4 4.2 1.7-7L2 9.6 9 9z"/></svg>;
    case "heart": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>;
    case "bolt": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
    case "circle": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/></svg>;
    case "dot": return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="4" fill={stroke}/></svg>;
    case "arrow-up": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case "arrow-down": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12l7 7 7-7"/></svg>;
    case "tag": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M20 12l-8 8-9-9V3h8l9 9zM7 7h.01"/></svg>;
    case "image": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 4h16v16H4z"/><circle {...p} cx="9" cy="9" r="2"/><path {...p} d="M21 15l-5-5L4 20"/></svg>;
    case "play": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 4l14 8-14 8V4z"/></svg>;
    case "download": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5M12 15V3"/></svg>;
    case "printer": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z"/></svg>;
    case "copy": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="9" y="9" width="13" height="13" rx="2"/><path {...p} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
    case "sort": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 6h18M6 12h12M10 18h4"/></svg>;
    case "mic": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="9" y="2" width="6" height="13" rx="3"/><path {...p} d="M5 11a7 7 0 0014 0M12 18v4M8 22h8"/></svg>;
    case "bag": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 8h14l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8zm3 0V5a4 4 0 018 0v3"/></svg>;
    case "arrow-right": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "clock": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 7v5l3 2"/></svg>;
    case "calendar": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="5" width="18" height="16" rx="2"/><path {...p} d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case "megaphone": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 10v4a2 2 0 002 2h3l9 5V3L8 8H5a2 2 0 00-2 2zm14-6v16"/></svg>;
    case "check-circle": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M8 12l3 3 5-6"/></svg>;
    case "pause": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M7 4v16M17 4v16"/></svg>;
    case "filter": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 5h18l-7 9v5l-4 2v-7L3 5z"/></svg>;
    case "chef": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 13a4 4 0 11-1-7.9A5 5 0 0112 3a5 5 0 017 2.1A4 4 0 1118 13v7a1 1 0 01-1 1H7a1 1 0 01-1-1v-7zm0 4h12"/></svg>;
    case "glass": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 3h14l-1 7a6 6 0 11-12 0L5 3zm7 13v5M8 21h8"/></svg>;
    case "user-plus": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M17 11h6"/></svg>;
    case "flag": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 21V4h14l-3 5 3 5H4"/></svg>;
    case "reply": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M9 17l-5-5 5-5M4 12h11a5 5 0 015 5v3"/></svg>;
    case "send": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case "mail": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="2" y="5" width="20" height="14" rx="2"/><path {...p} d="M3 7l9 6 9-6"/></svg>;
    case "refresh": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M21 4v6h-6M3 20v-6h6M3 10a9 9 0 0115-3.5L21 10M21 14a9 9 0 01-15 3.5L3 14"/></svg>;
    case "message": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>;
    case "warning": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3L2 21h20L12 3zm0 7v5m0 3v.01"/></svg>;
    case "external": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M14 3h7v7M10 14L21 3M19 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5"/></svg>;
    case "link": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1m-2 10a5 5 0 01-7 0 5 5 0 010-7l3-3a5 5 0 017 0"/></svg>;
    case "maximize": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 9V4h5M21 9V4h-5M3 15v5h5M21 15v5h-5"/></svg>;
    case "minimize": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg>;
    case "cookie": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3a9 9 0 109 9 4 4 0 01-4-4 4 4 0 01-4-4 1 1 0 01-1-1z"/><path {...p} d="M8 11h.01M12 15h.01M16 13h.01M7 16h.01"/></svg>;
    case "shield": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3l8 3v6c0 4.4-3.4 8.3-8 9-4.6-.7-8-4.6-8-9V6l8-3z"/><path {...p} d="M9 12l2 2 4-4"/></svg>;
    case "smile": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>;
    case "frown": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"/></svg>;
    case "trending-up": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>;
    case "cash": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="2" y="6" width="20" height="12" rx="2"/><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M6 10v.01M18 14v.01"/></svg>;
    case "credit-card": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="2" y="5" width="20" height="14" rx="2"/><path {...p} d="M2 10h20M6 15h4"/></svg>;
    case "gift": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7a3 3 0 01-3-3 2 2 0 012-2c2 0 4 3 4 5M12 7a3 3 0 003-3 2 2 0 00-2-2c-2 0-4 3-4 5"/></svg>;
    case "percent": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M19 5L5 19"/><circle {...p} cx="6.5" cy="6.5" r="2.5"/><circle {...p} cx="17.5" cy="17.5" r="2.5"/></svg>;
    case "leaf": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M11 20A7 7 0 014 13V4h9a7 7 0 010 14h-2M4 4c4 0 11 4 11 13"/></svg>;
    case "layout": return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="3" width="18" height="18" rx="2"/><path {...p} d="M3 9h18M9 21V9"/></svg>;
    case "home": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>;
    case "sun": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="4"/><path {...p} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>;
    case "arrow-left": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M19 12H5M11 5l-7 7 7 7"/></svg>;
    case "phone": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>;
    case "phone-call": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M15.1 5a5 5 0 014 4M15.1 1a9 9 0 018 8M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>;
    case "scooter": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="5.5" cy="17.5" r="3"/><circle {...p} cx="18.5" cy="17.5" r="3"/><path {...p} d="M15.5 17.5h-7M8.5 17.5l2-10h3M13.5 7.5h2l3 5v5M5.5 14.5v-3h4"/></svg>;
    case "bicycle": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="5.5" cy="17.5" r="3.5"/><circle {...p} cx="18.5" cy="17.5" r="3.5"/><path {...p} d="M15 17.5L12 8h3M8 17.5l3-9L7 7M12 8l3 9.5"/></svg>;
    case "route": return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="6" cy="19" r="3"/><circle {...p} cx="18" cy="5" r="3"/><path {...p} d="M9 19h6a3 3 0 003-3v-2M15 5H9a3 3 0 00-3 3v2"/></svg>;
    default: return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/></svg>;
  }
};

/* Decorative illustrated food tiles — abstracted, not a real photo. Each is a stylised
   plate/mug composed only of simple shapes. Used as hero imagery. */
const FoodTile = ({kind, w=96, h=72, accent="var(--accent)"}) => {
  const bgGrad = {
    coffee:   ["#6B4226", "#3A2418"],
    pourover: ["#A46B3E", "#5A3A1F"],
    seasonal: ["#A43E46", "#5A1F2A"],
    pastry:   ["#C48B4E", "#7A4E22"],
    brunch:   ["#B58A55", "#6E4A28"],
    cold:     ["#3E7A72", "#1F3E3A"],
    wine:     ["#6E2838", "#3A1422"],
    flatwhite:["#B39472","#7A5938"],
    cortado:  ["#9E6D40","#5E3E22"],
    chemex:   ["#AB7143","#5A3A1F"],
    v60:      ["#C49064","#7A4E2A"],
    lemonade: ["#8E5BA8","#4E2E60"],
    cookie:   ["#B0774A","#6B4526"],
    salad:    ["#C75A6A","#7A2E3E"],
    sourdough:["#A58B58","#6E5A34"],
    matcha:   ["#6E8E4E","#3E5228"],
    kombucha: ["#8E3E4E","#4E1E2A"],
  }[kind] || ["#8B6A45","#4E3924"];
  const label = kind.toUpperCase();
  return (
    <div style={{width:w,height:h,borderRadius:10,overflow:"hidden",position:"relative",
      background:`linear-gradient(135deg, ${bgGrad[0]} 0%, ${bgGrad[1]} 100%)`,
      boxShadow:"inset 0 0 0 1px rgba(255,255,255,.06), inset 0 -20px 40px rgba(0,0,0,.25)",
      flexShrink:0}}>
      {/* decorative rim */}
      <div style={{position:"absolute",inset:"12% 18%",border:"1px solid rgba(255,255,255,.12)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",inset:"22% 28%",border:"1px solid rgba(255,255,255,.08)",borderRadius:"50%",background:"radial-gradient(ellipse at 50% 30%, rgba(255,255,255,.08), transparent 60%)"}}/>
      {/* steam */}
      {(kind==="coffee"||kind==="flatwhite"||kind==="cortado"||kind==="pourover"||kind==="chemex"||kind==="v60") &&
        <>
          <span style={{position:"absolute",top:6,left:"40%",width:2,height:10,background:"rgba(255,255,255,.22)",borderRadius:2,animation:"steam 2.5s ease-in-out infinite"}}/>
          <span style={{position:"absolute",top:4,left:"52%",width:2,height:12,background:"rgba(255,255,255,.18)",borderRadius:2,animation:"steam 2.8s ease-in-out .6s infinite"}}/>
        </>
      }
      <div style={{position:"absolute",bottom:4,left:6,fontSize:8,letterSpacing:".12em",color:"rgba(255,255,255,.55)",fontFamily:"'DM Mono',ui-monospace,monospace",fontWeight:500}}>{label}</div>
    </div>
  );
};

Object.assign(window, { Icon, FoodTile });
