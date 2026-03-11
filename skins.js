/* ==============================================
   BEIMAX - SISTEMA DE SKINS SVG
   Arte vectorial detallado para personalización
============================================== */

// Counter for unique SVG gradient IDs (prevents conflicts when same skin appears in multiple robots)
let _skinIdCounter = 0;

/**
 * Inject an SVG skin into a DOM element, ensuring unique gradient/filter IDs
 */
function injectSkin(el, svgString) {
    if (!el) return;
    if (!svgString) { el.innerHTML = ''; return; }
    _skinIdCounter++;
    const s = _skinIdCounter;
    // Make all id="..." and url(#...) references unique
    let svg = svgString.replace(/id="([^"]+)"/g, (_, id) => `id="${id}_${s}"`);
    svg = svg.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}_${s})`);
    svg = svg.replace(/href="#([^"]+)"/g, (_, id) => `href="#${id}_${s}"`);
    el.innerHTML = svg;
}

// ====================================================================
//  SKIN CATALOG - All items with SVG vector art
// ====================================================================
const SKINS = {

// ======================== HATS ========================
hats: {
    top_hat: {
        name: 'Sombrero de Copa',
        rarity: 'rare',
        price: 30,
        svg: `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0%" stop-color="#3a3a52"/><stop offset="100%" stop-color="#16162a"/></linearGradient></defs><ellipse cx="40" cy="54" rx="28" ry="4" fill="rgba(0,0,0,.15)"/><ellipse cx="40" cy="48" rx="36" ry="7" fill="#24243a" stroke="rgba(255,255,255,.1)" stroke-width=".7"/><rect x="18" y="8" width="44" height="41" rx="4" fill="url(#g1)"/><rect x="23" y="10" width="10" height="36" rx="3" fill="rgba(255,255,255,.05)"/><ellipse cx="40" cy="9" rx="21" ry="4" fill="#2a2a42"/><ellipse cx="40" cy="9" rx="14" ry="2" fill="rgba(255,255,255,.04)"/><rect x="18" y="36" width="44" height="7" fill="#b22d3a"/><rect x="31" y="35" width="16" height="9" rx="3" fill="#d94452"/><rect x="35" y="37" width="8" height="5" rx="1.5" fill="#e8a83a" opacity=".65"/></svg>`
    },
    crown: {
        name: 'Corona Real',
        rarity: 'epic',
        price: 80,
        svg: `<svg viewBox="0 0 80 55" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C49000"/></linearGradient></defs><rect x="10" y="32" width="60" height="18" rx="3" fill="url(#g1)"/><polygon points="10,32 15,10 24,24 32,3 40,20 48,3 56,24 65,10 70,32" fill="url(#g1)"/><circle cx="32" cy="7" r="3.5" fill="#ff2244" stroke="#cc1133" stroke-width=".5"/><circle cx="48" cy="7" r="3.5" fill="#2255ee" stroke="#1144cc" stroke-width=".5"/><circle cx="40" cy="22" r="2.5" fill="#22bb55"/><rect x="14" y="37" width="52" height="3" rx="1" fill="#B8860B"/><circle cx="40" cy="43" r="4" fill="#ff2244" stroke="#B8860B" stroke-width="1.5"/><rect x="22" y="33" width="6" height="6" rx="1" fill="rgba(255,255,255,.15)"/><rect x="52" y="33" width="6" height="6" rx="1" fill="rgba(255,255,255,.1)"/><circle cx="18" cy="16" r="1.2" fill="rgba(255,255,255,.4)"/><circle cx="62" cy="16" r="1.2" fill="rgba(255,255,255,.4)"/></svg>`
    },
    cap: {
        name: 'Gorra Deportiva',
        rarity: 'common',
        price: 15,
        svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#1d6fb8"/></linearGradient></defs><path d="M8,36 Q8,10 40,8 Q72,10 72,36 Z" fill="url(#g1)"/><path d="M8,36 Q30,42 72,36 L72,40 Q30,46 8,40 Z" fill="#1a5ea0"/><path d="M56,36 Q68,38 78,32 Q82,38 72,42 Q60,40 56,38 Z" fill="#125090" stroke="rgba(255,255,255,.1)" stroke-width=".5"/><circle cx="40" cy="22" r="8" fill="rgba(255,255,255,.15)" stroke="white" stroke-width="1.5"/><text x="40" y="26" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="Arial">B</text><path d="M15,14 Q40,6 65,14" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1"/><rect x="14" y="12" width="7" height="20" rx="3" fill="rgba(255,255,255,.04)"/></svg>`
    },
    wizard_hat: {
        name: 'Sombrero de Mago',
        rarity: 'epic',
        price: 70,
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1=".3" y1="0" x2=".7" y2="1"><stop offset="0%" stop-color="#5b3e8a"/><stop offset="60%" stop-color="#7B68AA"/><stop offset="100%" stop-color="#6a5599"/></linearGradient></defs><ellipse cx="40" cy="72" rx="36" ry="6" fill="#5a4590" stroke="rgba(255,255,255,.08)" stroke-width=".5"/><polygon points="40,2 72,70 8,70" fill="url(#g1)"/><path d="M38,4 Q50,0 44,14" fill="#8878bb" opacity=".4"/><circle cx="35" cy="38" r="4.5" fill="#FFD700" opacity=".7"/><polygon points="50,50 51.5,54 56,54 52.5,57 53.5,61 50,58.5 46.5,61 47.5,57 44,54 48.5,54" fill="#FFD700" opacity=".8"/><polygon points="28,55 29,57.5 32,57.5 29.5,59 30.5,62 28,60 25.5,62 26.5,59 24,57.5 27,57.5" fill="#FFD700" opacity=".5"/><path d="M22,20 Q20,24 24,26" fill="none" stroke="#FFD700" stroke-width=".8" opacity=".3"/><circle cx="58" cy="45" r="1.5" fill="#FFD700" opacity=".35"/><rect x="18" y="14" width="6" height="34" rx="3" fill="rgba(255,255,255,.03)"/></svg>`
    },
    pirate_hat: {
        name: 'Sombrero Pirata',
        rarity: 'rare',
        price: 50,
        svg: `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a2a3a"/><stop offset="100%" stop-color="#151525"/></linearGradient></defs><path d="M5,48 Q5,20 25,15 Q45,5 65,15 Q85,20 85,48 Q65,55 45,42 Q25,55 5,48 Z" fill="url(#g1)"/><path d="M8,46 Q8,22 27,17 Q45,8 63,17 Q82,22 82,46" fill="none" stroke="#C49000" stroke-width="2"/><circle cx="45" cy="28" r="6" fill="none" stroke="#ddd" stroke-width="1.5"/><ellipse cx="45" cy="28" rx="2.5" ry="3.5" fill="#ddd"/><line x1="41" y1="22" x2="38" y2="18" stroke="#ddd" stroke-width="2" stroke-linecap="round"/><line x1="49" y1="22" x2="52" y2="18" stroke="#ddd" stroke-width="2" stroke-linecap="round"/><line x1="42" y1="34" x2="48" y2="34" stroke="#ddd" stroke-width="1.5" stroke-linecap="round"/><rect x="10" y="10" width="6" height="28" rx="3" fill="rgba(255,255,255,.03)"/></svg>`
    },
    santa_hat: {
        name: 'Gorro de Santa',
        rarity: 'rare',
        price: 40,
        svg: `<svg viewBox="0 0 80 65" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1=".1" y1="0" x2=".5" y2="1"><stop offset="0%" stop-color="#e74856"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs><path d="M10,52 Q14,18 42,5 Q55,18 72,46 Z" fill="url(#g1)"/><rect x="14" y="12" width="8" height="30" rx="3" fill="rgba(255,255,255,.06)"/><circle cx="72" cy="42" r="9" fill="white"/><circle cx="72" cy="42" r="6" fill="#f5f5f5"/><circle cx="73" cy="40" r="2.5" fill="rgba(200,200,200,.3)"/><ellipse cx="36" cy="54" rx="30" ry="8" fill="white"/><ellipse cx="36" cy="54" rx="28" ry="6" fill="#f8f8f8"/><ellipse cx="36" cy="53" rx="24" ry="3" fill="rgba(220,220,220,.4)"/><path d="M16,52 Q20,48 30,50" fill="none" stroke="rgba(200,200,200,.2)" stroke-width="1"/></svg>`
    },
    viking_helmet: {
        name: 'Casco Vikingo',
        rarity: 'legendary',
        price: 120,
        svg: `<svg viewBox="0 0 90 65" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8899aa"/><stop offset="100%" stop-color="#556677"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><ellipse cx="45" cy="58" rx="28" ry="4" fill="rgba(0,0,0,.1)"/><path d="M15,52 Q15,18 45,12 Q75,18 75,52 Z" fill="url(#g1)"/><rect x="25" y="14" width="8" height="30" rx="3" fill="rgba(255,255,255,.06)"/><line x1="45" y1="14" x2="45" y2="52" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/><rect x="15" y="46" width="60" height="8" rx="2" fill="#667788"/><circle cx="22" cy="50" r="2" fill="#aabbcc"/><circle cx="45" cy="50" r="2" fill="#aabbcc"/><circle cx="68" cy="50" r="2" fill="#aabbcc"/><path d="M15,40 Q5,22 2,5" fill="none" stroke="url(#g2)" stroke-width="5" stroke-linecap="round"/><path d="M75,40 Q85,22 88,5" fill="none" stroke="url(#g2)" stroke-width="5" stroke-linecap="round"/><circle cx="2" cy="5" r="3.5" fill="#FFD700"/><circle cx="88" cy="5" r="3.5" fill="#FFD700"/><rect x="42" y="44" width="6" height="14" rx="2" fill="#778899"/></svg>`
    },
    beanie: {
        name: 'Gorro de Lana',
        rarity: 'common',
        price: 12,
        svg: `<svg viewBox="0 0 80 55" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e74856"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs><circle cx="40" cy="8" r="6" fill="#e74856"/><path d="M10,48 Q10,14 40,8 Q70,14 70,48 Z" fill="url(#g1)"/><rect x="10" y="40" width="60" height="10" rx="3" fill="#c0392b"/><rect x="14" y="42" width="52" height="2" rx="1" fill="rgba(255,255,255,.08)"/><rect x="14" y="46" width="52" height="2" rx="1" fill="rgba(255,255,255,.05)"/><rect x="18" y="15" width="6" height="22" rx="3" fill="rgba(255,255,255,.04)"/></svg>`
    },
    halo: {
        name: 'Halo Angelical',
        rarity: 'legendary',
        price: 130,
        svg: `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs><ellipse cx="40" cy="20" rx="32" ry="10" fill="none" stroke="url(#g1)" stroke-width="5" opacity=".8"/><ellipse cx="40" cy="20" rx="32" ry="10" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"/><ellipse cx="25" cy="14" rx="8" ry="3" fill="rgba(255,255,255,.2)"/></svg>`
    },
    chef_hat: {
        name: 'Gorro de Chef',
        rarity: 'rare',
        price: 35,
        svg: `<svg viewBox="0 0 80 65" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e8e8e8"/></linearGradient></defs><ellipse cx="40" cy="14" rx="22" ry="14" fill="url(#g1)"/><ellipse cx="22" cy="20" rx="14" ry="12" fill="url(#g1)"/><ellipse cx="58" cy="20" rx="14" ry="12" fill="url(#g1)"/><rect x="14" y="18" width="52" height="34" rx="4" fill="url(#g1)"/><rect x="14" y="48" width="52" height="8" rx="2" fill="#e0e0e0"/><rect x="18" y="22" width="6" height="20" rx="3" fill="rgba(0,0,0,.02)"/></svg>`
    },
    headband: {
        name: 'Cinta Deportiva',
        rarity: 'common',
        price: 10,
        svg: `<svg viewBox="0 0 80 30" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ff4444"/><stop offset="50%" stop-color="#ff6666"/><stop offset="100%" stop-color="#ff4444"/></linearGradient></defs><rect x="2" y="8" width="76" height="14" rx="7" fill="url(#g1)"/><rect x="6" y="11" width="20" height="3" rx="1.5" fill="rgba(255,255,255,.15)"/><polygon points="69,6 75,15 69,24" fill="#cc3333"/></svg>`
    },
    party_hat: {
        name: 'Gorro de Fiesta',
        rarity: 'common',
        price: 18,
        svg: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff69b4"/><stop offset="33%" stop-color="#4facfe"/><stop offset="66%" stop-color="#43e97b"/><stop offset="100%" stop-color="#ffd700"/></linearGradient></defs><polygon points="40,2 70,62 10,62" fill="url(#g1)"/><rect x="10" y="56" width="60" height="8" rx="3" fill="rgba(255,255,255,.3)"/><circle cx="40" cy="4" r="5" fill="#FFD700"/><circle cx="25" cy="35" r="2" fill="rgba(255,255,255,.4)"/><circle cx="50" cy="28" r="1.5" fill="rgba(255,255,255,.35)"/><circle cx="35" cy="48" r="2.5" fill="rgba(255,255,255,.25)"/><polygon points="55,42 56,44 58,44 56.5,45.5 57,47.5 55,46.5 53,47.5 53.5,45.5 52,44 54,44" fill="rgba(255,255,255,.5)"/></svg>`
    }
},

// ======================== GLASSES ========================
glasses: {
    round: {
        name: 'Gafas Redondas',
        rarity: 'common',
        price: 15,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gframe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#665544"/><stop offset="100%" stop-color="#3d2e1f"/></linearGradient>
                <radialGradient id="glens" cx=".4" cy=".35" r=".65"><stop offset="0%" stop-color="rgba(220,235,255,.2)"/><stop offset="100%" stop-color="rgba(180,210,255,.06)"/></radialGradient>
            </defs>
            <circle cx="28" cy="22" r="16" fill="url(#glens)" stroke="url(#gframe)" stroke-width="3"/>
            <circle cx="72" cy="22" r="16" fill="url(#glens)" stroke="url(#gframe)" stroke-width="3"/>
            <path d="M44,22 Q50,28 56,22" fill="none" stroke="url(#gframe)" stroke-width="3" stroke-linecap="round"/>
            <line x1="12" y1="20" x2="2" y2="17" stroke="url(#gframe)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="88" y1="20" x2="98" y2="17" stroke="url(#gframe)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="22" cy="16" rx="5" ry="4" fill="rgba(255,255,255,.18)"/>
            <ellipse cx="66" cy="16" rx="5" ry="4" fill="rgba(255,255,255,.18)"/>
        </svg>`
    },
    sunglasses: {
        name: 'Gafas de Sol',
        rarity: 'common',
        price: 20,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="slens" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0a1e"/><stop offset="100%" stop-color="#2a2a3e"/></linearGradient>
                <linearGradient id="sframe" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#555"/><stop offset="100%" stop-color="#333"/></linearGradient>
            </defs>
            <rect x="6" y="8" width="34" height="26" rx="7" fill="url(#slens)" stroke="url(#sframe)" stroke-width="2.5"/>
            <rect x="60" y="8" width="34" height="26" rx="7" fill="url(#slens)" stroke="url(#sframe)" stroke-width="2.5"/>
            <path d="M40,18 Q50,26 60,18" fill="none" stroke="#444" stroke-width="2.8" stroke-linecap="round"/>
            <line x1="6" y1="16" x2="0" y2="13" stroke="#444" stroke-width="3" stroke-linecap="round"/>
            <line x1="94" y1="16" x2="100" y2="13" stroke="#444" stroke-width="3" stroke-linecap="round"/>
            <rect x="10" y="11" width="14" height="8" rx="4" fill="rgba(255,255,255,.06)"/>
            <rect x="64" y="11" width="14" height="8" rx="4" fill="rgba(255,255,255,.06)"/>
            <path d="M8,32 L12,28" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
        </svg>`
    },
    vr_headset: {
        name: 'Visor VR',
        rarity: 'epic',
        price: 60,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="vrg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2e2e42"/><stop offset="100%" stop-color="#1a1a28"/></linearGradient>
                <linearGradient id="vrscreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,180,255,.15)"/><stop offset="100%" stop-color="rgba(0,100,255,.05)"/></linearGradient>
            </defs>
            <rect x="4" y="3" width="92" height="36" rx="10" fill="url(#vrg)" stroke="#444" stroke-width="1.5"/>
            <rect x="10" y="7" width="34" height="26" rx="6" fill="#080818"/>
            <rect x="56" y="7" width="34" height="26" rx="6" fill="#080818"/>
            <rect x="12" y="9" width="30" height="22" rx="5" fill="url(#vrscreen)"/>
            <rect x="58" y="9" width="30" height="22" rx="5" fill="url(#vrscreen)"/>
            <rect x="44" y="15" width="12" height="12" rx="4" fill="#1a1a2a"/>
            <line x1="0" y1="19" x2="4" y2="19" stroke="#666" stroke-width="4" stroke-linecap="round"/>
            <line x1="96" y1="19" x2="100" y2="19" stroke="#666" stroke-width="4" stroke-linecap="round"/>
            <circle cx="88" cy="10" r="2.5" fill="#00aaff" opacity=".7"><animate attributeName="opacity" values=".7;.2;.7" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="92" cy="10" r="1.8" fill="#00ff88" opacity=".5"><animate attributeName="opacity" values=".2;.8;.2" dur="2s" repeatCount="indefinite"/></circle>
            <rect x="6" y="5" width="10" height="32" rx="5" fill="rgba(255,255,255,.03)"/>
        </svg>`
    },
    steampunk: {
        name: 'Goggles Steampunk',
        rarity: 'rare',
        price: 45,
        svg: `<svg viewBox="0 0 100 44" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d49035"/><stop offset="100%" stop-color="#8B6914"/></linearGradient>
                <radialGradient id="splens" cx=".4" cy=".4" r=".6"><stop offset="0%" stop-color="rgba(120,255,120,.12)"/><stop offset="100%" stop-color="rgba(40,80,40,.2)"/></radialGradient>
            </defs>
            <rect x="0" y="17" width="100" height="10" rx="3" fill="#7a5210" opacity=".7"/>
            <circle cx="28" cy="22" r="18" fill="url(#spg)" stroke="#5a3c0a" stroke-width="2.5"/>
            <circle cx="72" cy="22" r="18" fill="url(#spg)" stroke="#5a3c0a" stroke-width="2.5"/>
            <circle cx="28" cy="22" r="13" fill="#1a2e1a" stroke="#8B6914" stroke-width="1.5"/>
            <circle cx="72" cy="22" r="13" fill="#1a2e1a" stroke="#8B6914" stroke-width="1.5"/>
            <circle cx="28" cy="22" r="11" fill="url(#splens)"/>
            <circle cx="72" cy="22" r="11" fill="url(#splens)"/>
            <ellipse cx="22" cy="16" rx="5" ry="3.5" fill="rgba(150,255,150,.12)"/>
            <ellipse cx="66" cy="16" rx="5" ry="3.5" fill="rgba(150,255,150,.12)"/>
            <circle cx="48" cy="12" r="5.5" fill="#cd8532" stroke="#8B6914" stroke-width="1.2"/>
            <circle cx="48" cy="12" r="2.5" fill="#5a3c0a"/>
            <circle cx="56" cy="10" r="3.5" fill="#B87820" stroke="#8B6914" stroke-width="1"/>
            <circle cx="56" cy="10" r="1.8" fill="#5a3c0a"/>
            <circle cx="28" cy="22" r="6" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <circle cx="72" cy="22" r="6" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
        </svg>`
    },
    heart_glasses: {
        name: 'Gafas Corazón',
        rarity: 'rare',
        price: 30,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff69b4"/><stop offset="100%" stop-color="#c0245e"/></linearGradient></defs>
            <path d="M14,22 C14,14 8,10 16,10 C22,10 28,16 28,22 C28,28 21,34 14,38 C7,34 0,28 0,22 C0,10 6,10 14,14 Z" fill="url(#hg)" stroke="#a01050" stroke-width="1.5"/>
            <path d="M86,22 C86,14 80,10 88,10 C94,10 100,16 100,22 C100,28 93,34 86,38 C79,34 72,28 72,22 C72,10 78,10 86,14 Z" fill="url(#hg)" stroke="#a01050" stroke-width="1.5"/>
            <path d="M28,20 Q50,28 72,20" fill="none" stroke="#a01050" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="10" cy="18" rx="4" ry="3" fill="rgba(255,255,255,.2)"/>
            <ellipse cx="82" cy="18" rx="4" ry="3" fill="rgba(255,255,255,.2)"/>
        </svg>`
    },
    monocle: {
        name: 'Monóculo',
        rarity: 'epic',
        price: 55,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs>
            <circle cx="72" cy="20" r="17" fill="none" stroke="url(#mg)" stroke-width="3"/>
            <circle cx="72" cy="20" r="14" fill="rgba(220,235,255,.1)"/>
            <ellipse cx="66" cy="14" rx="5" ry="4" fill="rgba(255,255,255,.15)"/>
            <line x1="72" y1="37" x2="72" y2="42" stroke="url(#mg)" stroke-width="1.5"/>
            <line x1="72" y1="42" x2="65" y2="42" stroke="url(#mg)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="89" y1="18" x2="98" y2="15" stroke="url(#mg)" stroke-width="2" stroke-linecap="round"/>
        </svg>`
    },
    cyber_visor: {
        name: 'Visor Cyber',
        rarity: 'legendary',
        price: 110,
        svg: `<svg viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="cv" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#00ffcc"/><stop offset="50%" stop-color="#0088ff"/><stop offset="100%" stop-color="#cc00ff"/></linearGradient></defs>
            <rect x="4" y="8" width="92" height="26" rx="6" fill="#0a0a1a" stroke="url(#cv)" stroke-width="1.5"/>
            <rect x="8" y="12" width="84" height="18" rx="4" fill="rgba(0,200,255,.06)"/>
            <line x1="10" y1="21" x2="90" y2="21" stroke="url(#cv)" stroke-width=".5" opacity=".5"/>
            <rect x="14" y="15" width="20" height="2" rx="1" fill="#00ffcc" opacity=".4"/>
            <rect x="66" y="15" width="20" height="2" rx="1" fill="#cc00ff" opacity=".4"/>
            <circle cx="50" cy="21" r="3" fill="#0088ff" opacity=".6"><animate attributeName="opacity" values=".3;.8;.3" dur="1.5s" repeatCount="indefinite"/></circle>
            <line x1="0" y1="20" x2="4" y2="20" stroke="#666" stroke-width="3" stroke-linecap="round"/>
            <line x1="96" y1="20" x2="100" y2="20" stroke="#666" stroke-width="3" stroke-linecap="round"/>
        </svg>`
    }
},

// ======================== BOWTIES / NECK ========================
bowties: {
    bowtie: {
        name: 'Moño Clásico',
        rarity: 'common',
        price: 10,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e74856"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs><polygon points="30,14 2,4 2,36 30,26" fill="url(#g1)"/><polygon points="30,14 58,4 58,36 30,26" fill="url(#g1)"/><ellipse cx="30" cy="20" rx="5" ry="7" fill="#d94452"/><polygon points="5,7 12,12 5,17" fill="rgba(255,255,255,.1)"/><polygon points="55,7 48,12 55,17" fill="rgba(255,255,255,.1)"/></svg>`
    },
    tie: {
        name: 'Corbata Elegante',
        rarity: 'common',
        price: 15,
        svg: `<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2c3e50"/><stop offset="100%" stop-color="#1a252f"/></linearGradient></defs><polygon points="15,0 25,0 28,10 20,14 12,10" fill="#34495e"/><polygon points="12,10 20,14 28,10 24,56 20,62 16,56" fill="url(#g1)"/><line x1="20" y1="14" x2="20" y2="58" stroke="rgba(255,255,255,.08)" stroke-width="1"/><polygon points="14,13 18,17 14,21" fill="rgba(255,255,255,.05)"/><rect x="16" y="28" width="8" height="1.5" rx=".5" fill="rgba(200,180,150,.12)" transform="rotate(-18 20 28)"/><rect x="16" y="38" width="8" height="1.5" rx=".5" fill="rgba(200,180,150,.12)" transform="rotate(-18 20 38)"/><rect x="16" y="48" width="8" height="1.5" rx=".5" fill="rgba(200,180,150,.12)" transform="rotate(-18 20 48)"/></svg>`
    },
    chain: {
        name: 'Cadena de Oro',
        rarity: 'rare',
        price: 40,
        svg: `<svg viewBox="0 0 60 55" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><ellipse cx="10" cy="10" rx="5" ry="3" fill="none" stroke="url(#g1)" stroke-width="2.5" transform="rotate(-12 10 10)"/><ellipse cx="20" cy="13" rx="5" ry="3" fill="none" stroke="url(#g1)" stroke-width="2.5" transform="rotate(12 20 13)"/><ellipse cx="30" cy="16" rx="5" ry="3" fill="none" stroke="url(#g1)" stroke-width="2.5"/><ellipse cx="40" cy="13" rx="5" ry="3" fill="none" stroke="url(#g1)" stroke-width="2.5" transform="rotate(-12 40 13)"/><ellipse cx="50" cy="10" rx="5" ry="3" fill="none" stroke="url(#g1)" stroke-width="2.5" transform="rotate(12 50 10)"/><line x1="30" y1="19" x2="30" y2="32" stroke="url(#g1)" stroke-width="2"/><polygon points="30,30 38,40 30,52 22,40" fill="#FFD700" stroke="#B8860B" stroke-width="1"/><polygon points="30,34 34,40 30,48 26,40" fill="rgba(255,255,255,.2)"/></svg>`
    },
    cape: {
        name: 'Capa de Héroe',
        rarity: 'epic',
        price: 75,
        svg: `<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0392b"/><stop offset="100%" stop-color="#8e1d2b"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2c3e80"/><stop offset="100%" stop-color="#1a2550"/></linearGradient></defs><path d="M15,0 Q5,10 2,40 Q0,70 20,78 L35,80 L50,78 Q70,70 68,40 Q65,10 55,0 Z" fill="url(#g1)"/><path d="M20,5 Q12,15 10,40 Q8,65 25,75 L35,78 Q30,60 28,40 Q26,20 30,5 Z" fill="url(#g2)" opacity=".7"/><path d="M15,0 Q25,5 35,4 Q45,5 55,0 Q50,8 35,10 Q20,8 15,0 Z" fill="#d44" stroke="#b33" stroke-width=".5"/><circle cx="35" cy="5" r="3.5" fill="#FFD700" stroke="#B8860B" stroke-width="1"/><path d="M55,2 Q65,12 67,40" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/></svg>`
    },
    scarf: {
        name: 'Bufanda',
        rarity: 'common',
        price: 18,
        svg: `<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e74c3c"/><stop offset="100%" stop-color="#c0392b"/></linearGradient></defs><path d="M10,5 Q15,0 35,0 Q55,0 60,5 L62,15 Q58,20 50,22 L48,55 Q48,60 44,62 L42,64 Q38,66 36,62 L36,28 Q36,24 34,22 Q32,24 32,28 L32,38 Q32,42 28,44 L26,45 Q22,46 20,42 L20,22 Q12,20 8,15 Z" fill="url(#sf)"/><path d="M15,6 L55,6" fill="none" stroke="#d35400" stroke-width="1" opacity=".5"/><path d="M12,12 L58,12" fill="none" stroke="#d35400" stroke-width="1" opacity=".5"/><path d="M36,30 L36,60" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2"/></svg>`
    },
    bandana: {
        name: 'Bandana',
        rarity: 'common',
        price: 14,
        svg: `<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8e44ad"/><stop offset="100%" stop-color="#6c3483"/></linearGradient></defs><path d="M10,4 Q35,-4 60,4 L58,10 Q35,2 12,10 Z" fill="url(#bd)"/><path d="M58,10 L62,28 Q60,34 55,32 L52,22 L50,12 Q54,10 58,10 Z" fill="url(#bd)"/><path d="M12,10 L8,28 Q10,34 15,32 L18,22 L20,12 Q16,10 12,10 Z" fill="url(#bd)"/><circle cx="35" cy="5" r="2.5" fill="#FFD700"/><line x1="20" y1="6" x2="50" y2="6" stroke="rgba(255,255,255,.15)" stroke-width=".5"/></svg>`
    },
    medal: {
        name: 'Medalla de Honor',
        rarity: 'legendary',
        price: 120,
        svg: `<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="md" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient><linearGradient id="rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2980b9"/><stop offset="100%" stop-color="#1a5276"/></linearGradient></defs><path d="M25,0 L20,30 L35,22 L50,30 L45,0 Z" fill="url(#rb)"/><path d="M28,0 L24,25 L35,18" fill="rgba(255,255,255,.1)"/><circle cx="35" cy="45" r="18" fill="url(#md)" stroke="#8B6914" stroke-width="2"/><circle cx="35" cy="45" r="14" fill="none" stroke="#8B6914" stroke-width="1"/><polygon points="35,33 38,40 45,40 39,45 41,52 35,48 29,52 31,45 25,40 32,40" fill="#FFF8DC"/><circle cx="30" cy="40" r="1.5" fill="rgba(255,255,255,.3)"/></svg>`
    }
},

// ======================== EARRINGS ========================
earrings: {
    diamond: {
        name: 'Diamante',
        rarity: 'rare',
        price: 30,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="2" x2="15" y2="12" stroke="#ccc" stroke-width="1.5"/><polygon points="15,12 23,21 15,36 7,21" fill="#b3e5fc" stroke="#4fc3f7" stroke-width=".8"/><polygon points="15,13 19,21 15,33 11,21" fill="rgba(255,255,255,.25)"/><line x1="9" y1="21" x2="21" y2="21" stroke="rgba(255,255,255,.15)" stroke-width=".5"/><circle cx="12" cy="17" r="1.5" fill="rgba(255,255,255,.4)"/></svg>`
    },
    hoop_gold: {
        name: 'Aro de Oro',
        rarity: 'common',
        price: 15,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><circle cx="15" cy="22" r="12" fill="none" stroke="url(#g1)" stroke-width="3.5"/><path d="M15,10 Q23,10 26,18" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/></svg>`
    },
    star: {
        name: 'Estrella',
        rarity: 'common',
        price: 12,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="2" x2="15" y2="10" stroke="#ccc" stroke-width="1.5"/><polygon points="15,10 17.5,18 26,18 19.5,23 22,31 15,26.5 8,31 10.5,23 4,18 12.5,18" fill="#FFD700"/><polygon points="15,12 17,18 21,18 18,21 19,26 15,23" fill="rgba(255,255,255,.2)"/></svg>`
    },
    ruby: {
        name: 'Rubí',
        rarity: 'rare',
        price: 35,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g1" cx=".35" cy=".35" r=".65"><stop offset="0%" stop-color="#ff6677"/><stop offset="100%" stop-color="#aa0022"/></radialGradient></defs><line x1="15" y1="2" x2="15" y2="12" stroke="#C0C0C0" stroke-width="1.5"/><circle cx="15" cy="7" r="2.5" fill="#C0C0C0"/><ellipse cx="15" cy="26" rx="9" ry="12" fill="url(#g1)" stroke="#880015" stroke-width=".8"/><ellipse cx="13" cy="22" rx="3" ry="5" fill="rgba(255,255,255,.15)"/></svg>`
    },
    led_rgb: {
        name: 'LED RGB',
        rarity: 'epic',
        price: 50,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="2" x2="15" y2="10" stroke="#666" stroke-width="1.5"/><circle cx="15" cy="22" r="10" fill="#1a1a2a" stroke="#333" stroke-width="1"/><circle cx="15" cy="22" r="8" fill="#111" stroke="#222" stroke-width=".5"/><circle cx="11" cy="18" r="2.8" fill="#ff3333"><animate attributeName="opacity" values="1;.2;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="19" cy="18" r="2.8" fill="#33ff33"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="15" cy="26" r="2.8" fill="#3366ff"><animate attributeName="opacity" values=".6;1;.6" dur="1s" repeatCount="indefinite"/></circle></svg>`
    },
    lightning: {
        name: 'Rayo',
        rarity: 'rare',
        price: 25,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="2" x2="15" y2="8" stroke="#ccc" stroke-width="1.5"/><circle cx="15" cy="5" r="2" fill="#ccc"/><polygon points="18,8 10,22 15,22 12,38 23,18 18,18" fill="#FFD700"/><polygon points="17,10 13,20 15,20 14,30" fill="rgba(255,255,255,.2)"/></svg>`
    },
    pearl: {
        name: 'Perla',
        rarity: 'common',
        price: 18,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pl" cx=".35" cy=".3" r=".65"><stop offset="0%" stop-color="#fff"/><stop offset="40%" stop-color="#fce4ec"/><stop offset="100%" stop-color="#e0c0c8"/></radialGradient></defs><line x1="15" y1="2" x2="15" y2="12" stroke="#C0C0C0" stroke-width="1.5"/><circle cx="15" cy="5" r="2.2" fill="#C0C0C0"/><circle cx="15" cy="24" r="11" fill="url(#pl)" stroke="#d4a8b0" stroke-width=".5"/><ellipse cx="11" cy="19" rx="4" ry="3" fill="rgba(255,255,255,.4)"/></svg>`
    },
    skull: {
        name: 'Calavera',
        rarity: 'epic',
        price: 60,
        svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="2" x2="15" y2="10" stroke="#888" stroke-width="1.5"/><circle cx="15" cy="5" r="2" fill="#888"/><rect x="6" y="10" width="18" height="20" rx="8" fill="#f0f0f0" stroke="#ccc" stroke-width=".5"/><circle cx="11" cy="18" r="3" fill="#1a1a1a"/><circle cx="19" cy="18" r="3" fill="#1a1a1a"/><path d="M10,26 L12,24 L14,26 L16,24 L18,26 L20,24" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="rgba(255,255,255,.3)"/><circle cx="20" cy="17" r="1" fill="rgba(255,255,255,.3)"/></svg>`
    }
},

// ======================== SHOES ========================
shoes: {
    sneakers: {
        name: 'Zapatillas',
        rarity: 'common',
        price: 20,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#2980b9"/></linearGradient></defs><path d="M8,12 Q6,8 12,5 L42,3 Q54,3 56,14 L56,26 Q56,30 50,30 L8,30 Q4,30 4,26 L4,18 Q4,14 8,12 Z" fill="url(#g1)"/><path d="M4,26 L56,26 Q58,26 58,28 L58,34 Q58,36 56,36 L2,36 Q0,36 0,34 L0,28 Q0,26 2,26 Z" fill="white"/><path d="M4,30 L56,30" fill="none" stroke="#ddd" stroke-width=".5"/><circle cx="16" cy="11" r="2" fill="rgba(255,255,255,.3)"/><line x1="30" y1="9" x2="30" y2="18" stroke="rgba(255,255,255,.2)" stroke-width="1"/><line x1="36" y1="9" x2="36" y2="18" stroke="rgba(255,255,255,.15)" stroke-width="1"/><path d="M48,7 Q52,5 55,10" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/></svg>`
    },
    boots: {
        name: 'Botas de Combate',
        rarity: 'rare',
        price: 35,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a3728"/><stop offset="100%" stop-color="#2d1f15"/></linearGradient></defs><path d="M14,2 Q12,2 12,4 L12,28 Q12,31 9,31 L9,33 Q9,36 12,36 L50,36 Q53,36 53,33 L53,31 Q50,31 50,28 L50,4 Q50,2 48,2 Z" fill="url(#g1)"/><rect x="12" y="2" width="38" height="5" rx="2" fill="#5a4030"/><rect x="12" y="12" width="38" height="3" rx="1" fill="#5a4030" opacity=".8"/><rect x="12" y="21" width="38" height="2.5" rx="1" fill="#5a4030" opacity=".5"/><path d="M9,33 L53,33 Q55,33 55,35 L55,38 Q55,40 53,40 L7,40 Q5,40 5,38 L5,35 Q5,33 7,33 Z" fill="#1a1210"/><rect x="16" y="4" width="6" height="24" rx="3" fill="rgba(255,255,255,.04)"/></svg>`
    },
    rocket: {
        name: 'Botas Cohete',
        rarity: 'legendary',
        price: 100,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ccc"/><stop offset="100%" stop-color="#888"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6b35"/><stop offset="50%" stop-color="#ff4444"/><stop offset="100%" stop-color="rgba(255,68,68,0)"/></linearGradient></defs><path d="M12,2 Q10,2 10,5 L10,22 Q10,25 7,25 L7,27 Q7,30 10,30 L48,30 Q51,30 51,27 L51,25 Q48,25 48,22 L48,5 Q48,2 46,2 Z" fill="url(#g1)"/><rect x="10" y="2" width="38" height="4" rx="2" fill="#aaa"/><circle cx="43" cy="12" r="2.5" fill="#ff4444" opacity=".7"/><circle cx="43" cy="20" r="1.8" fill="#4488ff" opacity=".5"/><rect x="14" y="5" width="5" height="18" rx="2" fill="rgba(255,255,255,.06)"/><path d="M7,27 L51,27 Q53,27 53,29 L53,32 Q53,34 51,34 L5,34 Q3,34 3,32 L3,29 Q3,27 5,27 Z" fill="#666"/><ellipse cx="18" cy="38" rx="4" ry="5" fill="url(#g2)"><animate attributeName="ry" values="4;6;4" dur=".3s" repeatCount="indefinite"/></ellipse><ellipse cx="42" cy="38" rx="4" ry="5" fill="url(#g2)"><animate attributeName="ry" values="5;3;5" dur=".3s" repeatCount="indefinite"/></ellipse><ellipse cx="18" cy="37" rx="2" ry="2" fill="#ffcc00" opacity=".7"/><ellipse cx="42" cy="37" rx="2" ry="2" fill="#ffcc00" opacity=".7"/></svg>`
    },
    roller: {
        name: 'Patines',
        rarity: 'rare',
        price: 40,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f8f8ff"/><stop offset="100%" stop-color="#d0d0e0"/></linearGradient></defs><path d="M10,3 Q8,3 8,6 L8,18 Q8,21 5,21 L55,21 Q52,21 52,18 L52,6 Q52,3 50,3 Z" fill="url(#g1)"/><rect x="8" y="3" width="44" height="3" rx="2" fill="#e0e0f0"/><path d="M5,21 L55,21 Q57,21 57,23 L57,25 Q57,27 55,27 L3,27 Q1,27 1,25 L1,23 Q1,21 3,21 Z" fill="#444"/><circle cx="12" cy="33" r="5" fill="#888" stroke="#666" stroke-width="1.3"/><circle cx="30" cy="33" r="5" fill="#888" stroke="#666" stroke-width="1.3"/><circle cx="48" cy="33" r="5" fill="#888" stroke="#666" stroke-width="1.3"/><circle cx="12" cy="33" r="2.2" fill="#aaa"/><circle cx="30" cy="33" r="2.2" fill="#aaa"/><circle cx="48" cy="33" r="2.2" fill="#aaa"/><line x1="26" y1="8" x2="26" y2="16" stroke="#e74856" stroke-width="1.5"/><line x1="32" y1="8" x2="32" y2="16" stroke="#e74856" stroke-width="1.5"/></svg>`
    },
    wings: {
        name: 'Zapatillas Aladas',
        rarity: 'epic',
        price: 70,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C49000"/></linearGradient></defs><path d="M8,12 Q6,8 12,5 L38,3 Q48,3 50,12 L50,24 Q50,28 44,28 L8,28 Q4,28 4,24 L4,16 Q4,12 8,12 Z" fill="url(#g1)"/><path d="M4,24 L50,24 Q52,24 52,26 L52,30 Q52,32 50,32 L2,32 Q0,32 0,30 L0,26 Q0,24 2,24 Z" fill="#B8860B"/><path d="M44,14 Q50,8 56,5 Q58,8 53,13 Q49,16 44,16 Z" fill="white" stroke="#e0e0e0" stroke-width=".5"/><path d="M44,12 Q49,7 55,6 Q56,9 52,13 Q49,14 44,14 Z" fill="#f5f5f5"/><path d="M46,18 Q52,13 58,12 Q59,15 55,18 Q52,19 46,19 Z" fill="white" stroke="#e0e0e0" stroke-width=".5" opacity=".8"/><line x1="22" y1="10" x2="22" y2="18" stroke="rgba(255,255,255,.2)" stroke-width="1"/></svg>`
    },
    sandals: {
        name: 'Sandalias',
        rarity: 'common',
        price: 12,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d2a06d"/><stop offset="100%" stop-color="#a67c52"/></linearGradient></defs><path d="M6,28 L54,28 Q56,28 56,30 L56,36 Q56,38 54,38 L4,38 Q2,38 2,36 L2,30 Q2,28 4,28 Z" fill="url(#sd)" stroke="#8B6914" stroke-width=".5"/><path d="M15,8 L15,28" stroke="#a67c52" stroke-width="4" stroke-linecap="round"/><path d="M42,8 L42,28" stroke="#a67c52" stroke-width="4" stroke-linecap="round"/><path d="M15,12 Q28,8 42,12" fill="none" stroke="#a67c52" stroke-width="3.5" stroke-linecap="round"/><circle cx="28" cy="10" r="2.5" fill="#c49000" stroke="#8B6914" stroke-width=".8"/></svg>`
    },
    high_tops: {
        name: 'Botines Altos',
        rarity: 'rare',
        price: 38,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ht" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d2d2d"/><stop offset="100%" stop-color="#111"/></linearGradient></defs><path d="M12,2 Q10,2 10,4 L10,26 Q10,30 7,30 L53,30 Q50,30 50,26 L50,4 Q50,2 48,2 Z" fill="url(#ht)"/><path d="M7,28 L53,28 Q55,28 55,30 L55,35 Q55,38 53,38 L5,38 Q3,38 3,35 L3,30 Q3,28 5,28 Z" fill="#e74c3c"/><rect x="10" y="2" width="40" height="4" rx="2" fill="#e74c3c"/><circle cx="18" cy="10" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><circle cx="18" cy="16" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><circle cx="18" cy="22" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><circle cx="42" cy="10" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><circle cx="42" cy="16" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><circle cx="42" cy="22" r="2" fill="none" stroke="#aaa" stroke-width=".8"/><line x1="18" y1="10" x2="42" y2="10" stroke="#aaa" stroke-width=".5"/><line x1="18" y1="16" x2="42" y2="16" stroke="#aaa" stroke-width=".5"/><line x1="18" y1="22" x2="42" y2="22" stroke="#aaa" stroke-width=".5"/><path d="M44" fill="none" stroke="#e74c3c" stroke-width="2"/></svg>`
    },
    slippers: {
        name: 'Pantuflas',
        rarity: 'common',
        price: 15,
        svg: `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9ff3"/><stop offset="100%" stop-color="#f368e0"/></linearGradient></defs><path d="M6,14 Q4,10 10,8 L44,6 Q52,6 54,14 L54,26 Q54,30 48,30 L10,30 Q4,30 4,26 L4,18 Q4,14 6,14 Z" fill="url(#sl)"/><ellipse cx="30" cy="10" rx="18" ry="6" fill="#ffeaa7" opacity=".4"/><circle cx="22" cy="10" r="5" fill="#ffeaa7"/><circle cx="38" cy="10" r="5" fill="#ffeaa7"/><circle cx="30" cy="8" r="4" fill="#ffeaa7"/><path d="M4,28 L54,28 Q56,28 56,30 L56,35 Q56,38 54,38 L2,38 Q0,38 0,35 L0,30 Q0,28 2,28 Z" fill="#e056a0"/></svg>`
    }
},

// ======================== OUTFITS ========================
outfits: {
    tuxedo: {
        name: 'Esmoquin',
        rarity: 'rare',
        price: 50,
        bodyColor: '#1a1a2e',
        autoHat: 'top_hat',
        autoBowtie: 'bowtie',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><polygon points="29,0 19,26 29,22 39,26" fill="rgba(255,255,255,.55)"/><polygon points="4,0 19,26 4,26" fill="rgba(0,0,0,.25)"/><polygon points="54,0 39,26 54,26" fill="rgba(0,0,0,.25)"/><circle cx="29" cy="30" r="1.8" fill="rgba(255,255,255,.5)"/><circle cx="29" cy="37" r="1.8" fill="rgba(255,255,255,.5)"/><circle cx="29" cy="44" r="1.8" fill="rgba(255,255,255,.4)"/><polygon points="44,8 49,4 51,9 47,11" fill="#e74856" opacity=".65"/><line x1="29" y1="22" x2="29" y2="50" stroke="rgba(255,255,255,.1)" stroke-width=".5"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#1a1a2e"/><polygon points="30,8 20,36 30,30 40,36" fill="rgba(255,255,255,.5)"/><polygon points="8,8 20,36 8,36" fill="rgba(0,0,0,.2)"/><polygon points="52,8 40,36 52,36" fill="rgba(0,0,0,.2)"/><circle cx="30" cy="42" r="2" fill="rgba(255,255,255,.45)"/><circle cx="30" cy="50" r="2" fill="rgba(255,255,255,.4)"/><circle cx="30" cy="58" r="2" fill="rgba(255,255,255,.35)"/><polygon points="44,12 48,8 50,13 46,15" fill="#e74856" opacity=".6"/></svg>`
    },
    ninja: {
        name: 'Ninja',
        rarity: 'epic',
        price: 80,
        bodyColor: '#1a1a1a',
        autoHat: 'none',
        autoBowtie: 'none',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="20" width="58" height="6" fill="#6B3A10" rx="1"/><rect x="22" y="18" width="14" height="10" rx="2" fill="#C49000" stroke="#8B6914" stroke-width="1"/><line x1="2" y1="2" x2="56" y2="42" stroke="rgba(80,80,80,.35)" stroke-width="3.5"/><line x1="56" y1="2" x2="2" y2="42" stroke="rgba(80,80,80,.35)" stroke-width="3.5"/><polygon points="48,38 49.2,41 52.5,41 49.8,43 50.8,46.5 48,44.5 45.2,46.5 46.2,43 43.5,41 46.8,41" fill="#999" opacity=".7"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#1a1a1a"/><rect x="4" y="30" width="52" height="6" fill="#6B3A10"/><rect x="22" y="28" width="14" height="10" rx="2" fill="#C49000" stroke="#8B6914" stroke-width="1"/><line x1="8" y1="8" x2="52" y2="52" stroke="rgba(80,80,80,.3)" stroke-width="3"/><line x1="52" y1="8" x2="8" y2="52" stroke="rgba(80,80,80,.3)" stroke-width="3"/><polygon points="44,50 45.5,54 49,54 46,56.5 47.5,60 44,57.5 40.5,60 42,56.5 39,54 42.5,54" fill="#999" opacity=".6"/></svg>`
    },
    astronaut: {
        name: 'Astronauta',
        rarity: 'legendary',
        price: 150,
        bodyColor: '#CCCCDD',
        autoHat: 'none',
        autoGlasses: 'vr_headset',
        autoBowtie: 'none',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><line x1="29" y1="0" x2="29" y2="52" stroke="rgba(100,200,255,.2)" stroke-width="1"/><line x1="0" y1="26" x2="58" y2="26" stroke="rgba(100,200,255,.2)" stroke-width="1"/><rect x="6" y="4" width="16" height="12" rx="2" fill="rgba(100,200,255,.12)" stroke="rgba(100,200,255,.25)" stroke-width="1"/><circle cx="14" cy="10" r="3" fill="rgba(100,200,255,.15)"/><rect x="18" y="32" width="22" height="14" rx="3" fill="rgba(0,0,0,.1)" stroke="rgba(100,200,255,.2)" stroke-width="1"/><circle cx="24" cy="39" r="2" fill="#00aaff" opacity=".6"><animate attributeName="opacity" values=".6;.2;.6" dur="2s" repeatCount="indefinite"/></circle><circle cx="30" cy="39" r="2" fill="#00ff88" opacity=".5"><animate attributeName="opacity" values=".3;.7;.3" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="36" cy="39" r="2" fill="#ff6633" opacity=".4"><animate attributeName="opacity" values=".5;.9;.5" dur="1.8s" repeatCount="indefinite"/></circle></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#CCCCDD"/><line x1="30" y1="6" x2="30" y2="64" stroke="rgba(100,200,255,.15)" stroke-width="1"/><line x1="6" y1="35" x2="54" y2="35" stroke="rgba(100,200,255,.15)" stroke-width="1"/><rect x="8" y="10" width="16" height="12" rx="2" fill="rgba(100,200,255,.1)" stroke="rgba(100,200,255,.2)" stroke-width="1"/><rect x="20" y="40" width="20" height="14" rx="3" fill="rgba(0,0,0,.08)" stroke="rgba(100,200,255,.18)" stroke-width="1"/><circle cx="26" cy="47" r="2" fill="#00aaff" opacity=".5"/><circle cx="32" cy="47" r="2" fill="#00ff88" opacity=".4"/><circle cx="38" cy="47" r="2" fill="#ff6633" opacity=".3"/></svg>`
    },
    wizard: {
        name: 'Mago',
        rarity: 'epic',
        price: 100,
        bodyColor: '#7B68AA',
        autoHat: 'wizard_hat',
        autoBowtie: 'chain',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><polygon points="29,4 30.8,10 37,10 31.8,14 33.8,20 29,16.5 24.2,20 26.2,14 21,10 27.2,10" fill="#FFD700" opacity=".45"/><polygon points="12,30 13,33 16,33 13.5,35 14.5,38 12,36 9.5,38 10.5,35 8,33 11,33" fill="#FFD700" opacity=".3"/><polygon points="46,28 47,31 50,31 47.5,33 48.5,36 46,34 43.5,36 44.5,33 42,31 45,31" fill="#FFD700" opacity=".3"/><rect x="0" y="22" width="58" height="4" fill="rgba(255,215,0,.12)" rx="2"/><circle cx="46" cy="10" r="5" fill="#FFD700" opacity=".2"/><circle cx="48" cy="8" r="4" fill="#7B68AA"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#7B68AA"/><polygon points="30,10 32,17 39,17 33,21.5 35.5,28 30,24 24.5,28 27,21.5 21,17 28,17" fill="#FFD700" opacity=".4"/><polygon points="14,42 15,45 18,45 15.5,47 16.5,50 14,48 11.5,50 12.5,47 10,45 13,45" fill="#FFD700" opacity=".25"/><polygon points="46,38 47,41 50,41 47.5,43 48.5,46 46,44 43.5,46 44.5,43 42,41 45,41" fill="#FFD700" opacity=".25"/><rect x="6" y="32" width="48" height="3" fill="rgba(255,215,0,.1)" rx="1.5"/></svg>`
    },
    pirate: {
        name: 'Pirata',
        rarity: 'rare',
        price: 60,
        bodyColor: '#5a3322',
        autoHat: 'pirate_hat',
        autoBowtie: 'none',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><polygon points="29,0 17,48 29,42 41,48" fill="rgba(255,255,255,.1)"/><polygon points="0,0 17,48 0,52" fill="rgba(100,60,30,.4)"/><polygon points="58,0 41,48 58,52" fill="rgba(100,60,30,.4)"/><rect x="0" y="34" width="58" height="6" fill="#333" rx="1"/><rect x="22" y="32" width="14" height="10" rx="2" fill="#C49000" stroke="#8B6914" stroke-width="1"/><circle cx="14" cy="18" r="2" fill="#B8860B" opacity=".55"/><circle cx="14" cy="28" r="2" fill="#B8860B" opacity=".45"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#5a3322"/><polygon points="30,8 18,56 30,50 42,56" fill="rgba(255,255,255,.08)"/><polygon points="8,8 18,56 8,62" fill="rgba(100,60,30,.35)"/><polygon points="52,8 42,56 52,62" fill="rgba(100,60,30,.35)"/><rect x="6" y="44" width="48" height="6" fill="#333" rx="1"/><rect x="22" y="42" width="14" height="10" rx="2" fill="#C49000" stroke="#8B6914" stroke-width="1"/><circle cx="16" cy="26" r="2" fill="#B8860B" opacity=".5"/><circle cx="16" cy="36" r="2" fill="#B8860B" opacity=".4"/></svg>`
    },
    knight: {
        name: 'Caballero',
        rarity: 'legendary',
        price: 200,
        bodyColor: '#778899',
        autoHat: 'viking_helmet',
        autoBowtie: 'none',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.18)"/><stop offset="100%" stop-color="rgba(255,255,255,.02)"/></linearGradient></defs><rect x="12" y="2" width="34" height="40" rx="6" fill="url(#g1)" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/><rect x="25" y="6" width="8" height="30" rx="2" fill="rgba(231,72,86,.25)"/><rect x="16" y="16" width="26" height="8" rx="2" fill="rgba(231,72,86,.25)"/><circle cx="16" cy="6" r="2.5" fill="rgba(255,255,255,.2)"/><circle cx="42" cy="6" r="2.5" fill="rgba(255,255,255,.2)"/><circle cx="16" cy="40" r="2.5" fill="rgba(255,255,255,.2)"/><circle cx="42" cy="40" r="2.5" fill="rgba(255,255,255,.2)"/><rect x="2" y="42" width="54" height="8" fill="url(#g1)" rx="2"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.15)"/><stop offset="100%" stop-color="rgba(255,255,255,.02)"/></linearGradient></defs><rect x="4" y="4" width="52" height="62" rx="8" fill="#778899"/><rect x="14" y="10" width="32" height="42" rx="6" fill="url(#g1)" stroke="rgba(255,255,255,.15)" stroke-width="1.5"/><rect x="26" y="14" width="8" height="32" rx="2" fill="rgba(231,72,86,.22)"/><rect x="18" y="24" width="24" height="8" rx="2" fill="rgba(231,72,86,.22)"/><circle cx="18" cy="14" r="2" fill="rgba(255,255,255,.18)"/><circle cx="42" cy="14" r="2" fill="rgba(255,255,255,.18)"/><circle cx="18" cy="48" r="2" fill="rgba(255,255,255,.18)"/><circle cx="42" cy="48" r="2" fill="rgba(255,255,255,.18)"/></svg>`
    },
    superhero: {
        name: 'Superhéroe',
        rarity: 'epic',
        price: 90,
        bodyColor: '#1e3a5f',
        autoHat: 'none',
        autoBowtie: 'cape',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><polygon points="29,6 23,18 35,18" fill="#FFD700"/><path d="M29,20 L29,48" stroke="#FFD700" stroke-width="2"/><circle cx="29" cy="12" r="4" fill="#e74c3c" opacity=".6"/><polygon points="29,10 30.5,13 34,13 31,15 32,18 29,16 26,18 27,15 24,13 27.5,13" fill="#FFD700" opacity=".5"/><path d="M4,2 Q20,8 29,6 Q38,8 54,2 L54,6 Q38,12 29,10 Q20,12 4,6 Z" fill="#e74c3c" opacity=".3"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#1e3a5f"/><polygon points="30,10 23,26 37,26" fill="#FFD700" opacity=".5"/><path d="M30,28 L30,60" stroke="#FFD700" stroke-width="2.5" opacity=".4"/><circle cx="30" cy="18" r="5" fill="#e74c3c" opacity=".4"/><polygon points="30,14 32,18 36,18 33,21 34,25 30,22 26,25 27,21 24,18 28,18" fill="#FFD700" opacity=".4"/></svg>`
    },
    scientist: {
        name: 'Científico',
        rarity: 'rare',
        price: 55,
        bodyColor: '#f5f5f5',
        autoHat: 'none',
        autoGlasses: 'round',
        autoBowtie: 'tie',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="36" width="12" height="14" rx="2" fill="rgba(0,180,0,.15)" stroke="rgba(0,180,0,.3)" stroke-width=".8"/><rect x="8" y="38" width="2" height="10" rx="1" fill="rgba(0,200,0,.4)"/><rect x="11" y="40" width="2" height="8" rx="1" fill="rgba(200,200,0,.4)"/><rect x="14" y="42" width="2" height="6" rx="1" fill="rgba(0,100,200,.4)"/><circle cx="44" cy="42" r="6" fill="rgba(0,200,255,.08)" stroke="rgba(0,200,255,.2)" stroke-width=".8"/><path d="M42,44 C43,40 45,40 46,44" fill="none" stroke="rgba(0,200,255,.3)" stroke-width=".8"/><rect x="20" y="4" width="18" height="2" rx="1" fill="rgba(0,0,0,.08)"/><rect x="20" y="16" width="18" height="2" rx="1" fill="rgba(0,0,0,.06)"/><circle cx="48" cy="14" r="4" fill="rgba(0,0,0,.03)" stroke="rgba(0,0,0,.08)" stroke-width=".5"/><path d="M47,11 L49,17" stroke="rgba(0,0,0,.1)" stroke-width=".5"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#f5f5f5"/><rect x="8" y="44" width="14" height="18" rx="2" fill="rgba(0,180,0,.1)" stroke="rgba(0,180,0,.2)" stroke-width="1"/><rect x="10" y="46" width="3" height="14" rx="1" fill="rgba(0,200,0,.3)"/><rect x="14" y="48" width="3" height="12" rx="1" fill="rgba(200,200,0,.3)"/><rect x="18" y="50" width="3" height="10" rx="1" fill="rgba(0,100,200,.3)"/><rect x="22" y="10" width="16" height="2" rx="1" fill="rgba(0,0,0,.06)"/><circle cx="44" cy="52" r="7" fill="rgba(0,200,255,.06)" stroke="rgba(0,200,255,.15)" stroke-width="1"/></svg>`
    },
    samurai: {
        name: 'Samurái',
        rarity: 'legendary',
        price: 180,
        bodyColor: '#8B0000',
        autoHat: 'headband',
        autoBowtie: 'none',
        overlay: `<svg viewBox="0 0 58 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d1f15"/><stop offset="100%" stop-color="#1a1210"/></linearGradient></defs><rect x="18" y="2" width="22" height="48" rx="3" fill="url(#sm)"/><rect x="22" y="4" width="14" height="44" rx="2" fill="rgba(139,0,0,.3)"/><path d="M29,2 L29,50" stroke="rgba(255,215,0,.15)" stroke-width=".5"/><path d="M4,20 L18,20 L18,28 L8,28 Q4,28 4,24 Z" fill="url(#sm)"/><path d="M54,20 L40,20 L40,28 L50,28 Q54,28 54,24 Z" fill="url(#sm)"/><circle cx="29" cy="12" r="3" fill="#FFD700" opacity=".3"/></svg>`,
        svg: `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="62" rx="8" fill="#8B0000"/><rect x="20" y="8" width="20" height="56" rx="3" fill="rgba(45,31,21,.4)"/><rect x="24" y="10" width="12" height="50" rx="2" fill="rgba(139,0,0,.3)"/><path d="M30,8 L30,62" stroke="rgba(255,215,0,.1)" stroke-width=".5"/><circle cx="30" cy="20" r="4" fill="#FFD700" opacity=".2"/><path d="M6,30 L20,30 L20,40 L10,40 Q6,40 6,36 Z" fill="rgba(45,31,21,.3)"/><path d="M54,30 L40,30 L40,40 L50,40 Q54,40 54,36 Z" fill="rgba(45,31,21,.3)"/></svg>`
    }
}

}; // End of SKINS

// ====================================================================
//  OUTFIT DATA (for auto-equip system)
// ====================================================================
function getOutfitData(outfitId) {
    const outfit = SKINS.outfits[outfitId];
    if (!outfit) return { bodyColor: '#E74856', hat: 'none', glasses: 'none', bowtie: 'none' };
    return {
        bodyColor: outfit.bodyColor || '#E74856',
        hat: outfit.autoHat || 'none',
        glasses: outfit.autoGlasses || 'none',
        bowtie: outfit.autoBowtie || 'none'
    };
}

// ====================================================================
//  SHOP GENERATION - Builds shop UI dynamically from SKINS catalog
// ====================================================================
function generateShop() {
    const categories = [
        { key: 'outfits', tabId: 'shopOutfits', type: 'outfit' },
        { key: 'hats', tabId: 'shopHats', type: 'hat' },
        { key: 'glasses', tabId: 'shopGlasses', type: 'glasses' },
        { key: 'bowties', tabId: 'shopAccessories', type: 'bowtie' },
        { key: 'earrings', tabId: 'shopEarrings', type: 'earring' },
        { key: 'shoes', tabId: 'shopShoes', type: 'shoes' }
    ];

    categories.forEach(cat => {
        const grid = document.getElementById(cat.tabId);
        if (!grid) return;
        grid.innerHTML = '';

        // Add "none" option first
        const noneItem = document.createElement('div');
        noneItem.className = 'shop-item';
        noneItem.onclick = () => previewItem(cat.type, 'none', 0);
        noneItem.innerHTML = `
            <div class="shop-item-preview"><span class="no-item-icon">✕</span></div>
            <div class="shop-item-name">Ninguno</div>
            <div class="shop-item-price free">Gratis</div>
        `;
        grid.appendChild(noneItem);

        // Add all skin items
        Object.entries(SKINS[cat.key]).forEach(([id, skin]) => {
            const item = document.createElement('div');
            item.className = `shop-item rarity-${skin.rarity}`;
            item.setAttribute('data-skin-id', id);
            item.setAttribute('data-skin-type', cat.type);
            item.onclick = () => previewItem(cat.type, id, skin.price);

            let previewHTML = '';
            if (cat.key === 'outfits') {
                // Show outfit preview as a colored body with overlay
                previewHTML = `<div class="outfit-thumb" style="background:linear-gradient(180deg, ${skin.bodyColor}, ${darkenColorSimple(skin.bodyColor, 20)})">${skin.svg}</div>`;
            } else {
                previewHTML = `<div class="skin-thumb">${skin.svg}</div>`;
            }

            const rarityLabels = { common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' };

            item.innerHTML = `
                <div class="shop-item-preview">${previewHTML}</div>
                <div class="shop-item-name">${skin.name}</div>
                <div class="shop-item-price">${skin.price} 🪙</div>
                <div class="rarity-badge rarity-${skin.rarity}">${rarityLabels[skin.rarity] || skin.rarity}</div>
            `;
            grid.appendChild(item);
        });
    });
}

// Simple color darkener (no dependency on darkenColor from script.js during init)
function darkenColorSimple(hex, percent) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
