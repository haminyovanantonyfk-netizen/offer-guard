'use strict';
/* OfferGuard — fake job offer checker for Indian job seekers.
   Everything runs locally on this device. Offers you paste are never uploaded. */

/* Extra strings merged into the i18n dictionary */
const EXTRA = {
  en: { act_check_emigrate: '🛂 Verify the agent on eMigrate before anything else',
        dom_official: 'matches the official domain', dom_free: 'free email service — genuine companies rarely recruit from these',
        dom_look: 'LOOK-ALIKE of the official domain', dom_found_none: 'No emails or websites found in the text.' },
  hi: { act_check_emigrate: '🛂 सबसे पहले eMigrate पर एजेंट सत्यापित करें',
        dom_official: 'आधिकारिक डोमेन से मेल खाता है', dom_free: 'मुफ़्त ईमेल सेवा — असली कंपनियाँ इनसे शायद ही भर्ती करती हैं',
        dom_look: 'आधिकारिक डोमेन का मिलता-जुलता नकली', dom_found_none: 'पाठ में कोई ईमेल या वेबसाइट नहीं मिली।' },
  ml: { act_check_emigrate: '🛂 മറ്റെന്തിനും മുമ്പ് eMigrate-ൽ ഏജന്റിനെ ഉറപ്പാക്കൂ',
        dom_official: 'ഔദ്യോഗിക ഡൊമെയ്‌നുമായി പൊരുത്തപ്പെടുന്നു', dom_free: 'സൗജന്യ ഇമെയിൽ സേവനം — യഥാർത്ഥ കമ്പനികൾ ഇവയിൽ നിന്ന് അപൂർവ്വമായി മാത്രമേ നിയമിക്കൂ',
        dom_look: 'ഔദ്യോഗിക ഡൊമെയ്‌ന്റെ വ്യാജ സമാനരൂപം', dom_found_none: 'വാചകത്തിൽ ഇമെയിലുകളോ വെബ്‌സൈറ്റുകളോ കണ്ടെത്തിയില്ല.' }
};
if (typeof I18N !== 'undefined'){ for (const l in EXTRA){ if (I18N[l]) Object.assign(I18N[l], EXTRA[l]); } }

/* ---------------- Offer checker ---------------- */
const PATTERNS = [
 { id:'fee', w:30, label:{en:'Demands a fee / deposit / charge (registration, training, laptop, "refundable"…)', hi:'फ़ीस / जमा / शुल्क माँगता है (पंजीकरण, प्रशिक्षण, लैपटॉप, "रिफ़ंडेबल"…)', ml:'ഫീസ് / നിക്ഷേപം / ചാർജ് ആവശ്യപ്പെടുന്നു (രജിസ്ട്രേഷൻ, പരിശീലനം, ലാപ്‌ടോപ്പ്, "തിരികെ കിട്ടുന്നത്"…)'},
   re:/(pay|send|transfer|deposit|remit).{0,30}(fee|fees|charge|charges|deposit)|(registration|training|laptop|uniform|documentation|processing|security|verification|joining|medical|visa|ticket) (fee|fees|charge|charges|deposit).{0,15}(₹|rs\.?|inr|of|to confirm)|refundable (deposit|fee|amount|security)|deposit of (₹|rs\.?|inr)/i },
 { id:'task', w:28, label:{en:'Task / recharge scam (like videos, rate hotels, prepaid tasks)', hi:'टास्क / रिचार्ज स्कैम (वीडियो लाइक, होटल रेटिंग, प्रीपेड टास्क)', ml:'ടാസ്ക് / റീചാർജ് തട്ടിപ്പ് (വീഡിയോ ലൈക്ക്, ഹോട്ടൽ റേറ്റിംഗ്, പ്രീപെയ്ഡ് ടാസ്കുകൾ)'},
   re:/(like|subscribe|follow)(ing)? (videos|posts|reels|channels?).{0,30}(earn|income|₹|task)|complete (the )?tasks?.{0,25}(earn|income|withdraw|₹)|recharge.{0,25}(task|earn|withdraw|unlock)|rate (hotels|products|movies).{0,25}(earn|commission|income)|telegram tasks?|prepaid tasks?|task[- ]based (job|income|earning)/i },
 { id:'docs', w:26, label:{en:'Wants Aadhaar / PAN / bank details / OTP before a real offer', hi:'असली ऑफ़र से पहले आधार / PAN / बैंक विवरण / OTP चाहता है', ml:'യഥാർത്ഥ ഓഫറിന് മുമ്പ് ആധാർ / PAN / ബാങ്ക് വിവരങ്ങൾ / OTP ആവശ്യപ്പെടുന്നു'},
   re:/(send|share|upload|submit|provide).{0,35}(aadhaar|aadhar|pan card|bank (details|passbook|statement|account)|otp|passport|documents)/i },
 { id:'overseas', w:26, label:{en:'Overseas job via agent (visa fees, tourist visa, passport surrender)', hi:'एजेंट के माध्यम से विदेशी नौकरी (वीज़ा शुल्क, पर्यटक वीज़ा, पासपोर्ट जमा)', ml:'ഏജന്റ് വഴി വിദേശ ജോലി (വിസ ഫീസ്, ടൂറിസ്റ്റ് വിസ, പാസ്‌പോർട്ട് കൈമാറ്റം)'},
   re:/tourist visa|visa (fee|fees|charge|charges|processing).{0,20}(₹|rs\.?|inr|lakh)|submit your passport|passport (to|with) (the|our) agent|(job|work|data entry).{0,30}(thailand|dubai|cambodia|myanmar|laos|malaysia).{0,40}(₹|salary|lakh|per month)|direct (joining|visa).{0,25}(thailand|dubai|abroad)/i },
 { id:'govt', w:24, label:{en:'Government-job impersonation with a fee (SSC / UPSC / India Post / Railways…)', hi:'शुल्क के साथ सरकारी नौकरी का प्रतिरूपण (SSC / UPSC / India Post / रेलवे…)', ml:'ഫീസോടെ സർക്കാർ ജോലി വേഷംകെട്ടൽ (SSC / UPSC / India Post / റെയിൽവേ…)'},
   re:/(selection|appointment|joining) (letter|confirmed|list).{0,45}(fee|charge|charges|pay|₹)|(india post|indian railways|\bssc\b|\bupsc\b|govt\.? job|government job).{0,45}(fee|charge|charges|pay|deposit|₹\s?\d)/i },
 { id:'crypto_pay', w:20, label:{en:'Salary / payment in crypto or USDT', hi:'क्रिप्टो या USDT में वेतन / भुगतान', ml:'ക്രിപ്റ്റോയിലോ USDT-യിലോ ശമ്പളം / പേയ്‌മെന്റ്'},
   re:/salary in (usdt|crypto|bitcoin)|paid in (usdt|crypto)|payment (in|via) (usdt|crypto)|wallet address/i },
 { id:'harvest', w:18, label:{en:'Directs you to a form collecting bank / ID details', hi:'बैंक / ID विवरण इकट्ठा करने वाले फ़ॉर्म की ओर भेजता है', ml:'ബാങ്ക് / ID വിവരങ്ങൾ ശേഖരിക്കുന്ന ഫോമിലേക്ക് നയിക്കുന്നു'},
   re:/fill (this|the|out the) (google )?form.{0,45}(bank|aadhaar|pan|account|document)|google form.{0,35}(bank|aadhaar|pan|details)/i },
 { id:'guaranteed', w:18, label:{en:'Guaranteed selection / direct joining / no interview', hi:'गारंटीड चयन / सीधी जॉइनिंग / बिना साक्षात्कार', ml:'ഉറപ്പുള്ള സെലക്ഷൻ / നേരിട്ടുള്ള ജോയിനിംഗ് / അഭിമുഖമില്ല'},
   re:/guaranteed (selection|placement|job|income)|100% (placement|selection|job guarantee)|direct joining|no interview (needed|required|necessary)|selection (is )?confirmed|confirmed selection/i },
 { id:'messaging_only', w:16, label:{en:'Hiring only through WhatsApp / Telegram chat', hi:'सिर्फ़ WhatsApp / Telegram चैट से भर्ती', ml:'WhatsApp / Telegram ചാറ്റ് വഴി മാത്രം നിയമനം'},
   re:/(interview|hr|hiring|selection|apply).{0,30}(whatsapp|telegram)|(whatsapp|telegram).{0,30}(interview|contact (us|me)|join|apply|only)|join (our )?(telegram|whatsapp) (channel|group)/i },
 { id:'mlm', w:14, label:{en:'Team-building / referral income scheme (MLM pattern)', hi:'टीम बनाने / रेफ़रल आय योजना (MLM पैटर्न)', ml:'ടീം നിർമ്മാണ / റെഫറൽ വരുമാന പദ്ധതി (MLM രീതി)'},
   re:/(join|build|make) (your|a|our) team.{0,30}(income|earn|₹)|referral income|binary (plan|income)|downline|network marketing/i },
 { id:'urgency', w:12, label:{en:'Urgency — limited seats, join today, offer expiring', hi:'जल्दबाज़ी — सीमित सीटें, आज ही जॉइन करें, ऑफ़र समाप्त', ml:'തിരക്ക് — പരിമിതമായ സീറ്റുകൾ, ഇന്ന് തന്നെ ചേരൂ, ഓഫർ അവസാനിക്കുന്നു'},
   re:/(limited|only \d+|few) (seats|openings|vacancies|positions)|join (today|immediately|now)|offer (expires|expiring|valid).{0,20}(today|tonight|\d+ hours)|immediate joining|hurry,? (limited|seats)/i },
 { id:'link_short', w:10, label:{en:'Shortened / chat-only links instead of an official site', hi:'आधिकारिक साइट के बजाय छोटे / चैट-केवल लिंक', ml:'ഔദ്യോഗിക സൈറ്റിന് പകരം ചുരുക്കിയ / ചാറ്റ്-മാത്രം ലിങ്കുകൾ'},
   re:/bit\.ly|tinyurl|tiny\.cc|cutt\.ly|https?:\/\/[^\s]+\.(xyz|top|click|site|online|live)\b/i },
 { id:'secrecy', w:10, label:{en:'Secrecy / "confidential hiring" pressure', hi:'गोपनीयता / "गोपनीय भर्ती" दबाव', ml:'രഹസ്യ / "രഹസ്യ നിയമനം" സമ്മർദ്ദം'},
   re:/don'?t tell (anyone|anybody)|keep (this|it) confidential|secret (hiring|openings|recruitment)/i }
];
const FREEMAIL = ['gmail.com','yahoo.com','yahoo.in','yahoo.co.in','hotmail.com','outlook.com','rediffmail.com','proton.me','protonmail.com','icloud.com','aol.com','zoho.com','yandex.com','mail.com','gmx.com','live.com'];
const BRANDS = [
 ['infosys','infosys.com'],['tcs','tcs.com'],['tata consultancy','tcs.com'],['wipro','wipro.com'],['hcl','hcltech.com'],
 ['techmahindra','techmahindra.com'],['tech mahindra','techmahindra.com'],['accenture','accenture.com'],['cognizant','cognizant.com'],
 ['capgemini','capgemini.com'],['amazon','amazon.com'],['google','google.com'],['microsoft','microsoft.com'],['ibm','ibm.com'],
 ['deloitte','deloitte.com'],['flipkart','flipkart.com'],['hyundai','hyundai.com'],['india post','indiapost.gov.in'],
 ['indiapost','indiapost.gov.in'],['ssc','ssc.gov.in'],['upsc','upsc.gov.in'],['railways','indianrailways.gov.in'],
 ['sbi','sbi.co.in'],['hdfc','hdfcbank.com'],['icici','icicibank.com'],['reliance','ril.com'],['mahindra','mahindra.com']
];
function extractDomains(text){
  const found = new Set();
  const emails = text.match(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g) || [];
  emails.forEach(e => found.add(e.split('@')[1].toLowerCase()));
  const urls = text.match(/https?:\/\/([^\s/'")]+)/g) || [];
  urls.forEach(u => found.add(u.replace(/^https?:\/\//,'').toLowerCase()));
  const bare = text.match(/\b(?:www\.)?([a-z0-9-]+\.(?:com|in|co\.in|org|net|gov\.in|io|xyz|top|site|online|live|info|biz))\b/gi) || [];
  bare.forEach(d => found.add(d.replace(/^www\./,'').toLowerCase()));
  return [...found];
}
function analyzeOffer(text){
  const hits = []; let score = 0;
  for (const p of PATTERNS){ if (p.re.test(text)){ hits.push(p); score += p.w; } }
  const low = text.toLowerCase();
  /* Unrealistic pay for low-skill/fresher work */
  const bigPay = /(₹|rs\.?|inr)\s?([5-9]\d,\d{3}|\d{2,3},\d{3}|[1-9]\s?lakh)/i.test(text) || /salary.{0,15}([5-9]\d,\d{3}|\d{2,3},\d{3})/i.test(text);
  const lowSkill = /(fresher|no experience|data entry|typing job|10th pass|12th pass|simple (work|task)|work from home)/i.test(text);
  if (bigPay && lowSkill){
    hits.push({ id:'pay_unreal', w:16, label:{en:'Unrealistic pay for fresher / low-skill work', hi:'फ़्रेशर / कम-कौशल काम के लिए अवास्तविक वेतन', ml:'ഫ്രഷർ / കുറഞ്ഞ-കഴിവ് ജോലിക്ക് അവാസ്തവമായ ശമ്പളം'} });
    score += 16;
  }
  /* Domain analysis */
  const domains = extractDomains(text).map(d => {
    let kind = 'other', brand = null;
    if (FREEMAIL.includes(d)) kind = 'freemail';
    for (const [b, off] of BRANDS){
      if (d === off || d.endsWith('.' + off)){ kind = 'official'; brand = b; break; }
    }
    if (kind === 'other'){
      for (const [b, off] of BRANDS){
        const token = b.replace(/[^a-z]/g,'');
        if (token.length >= 3 && d.replace(/[^a-z]/g,'').includes(token) && low.includes(b)){ kind = 'lookalike'; brand = b; break; }
      }
    }
    return { domain: d, kind, brand };
  });
  if (domains.some(d => d.kind === 'freemail')){
    hits.push({ id:'freemail', w:18, label:{en:'Recruiter uses a free email (Gmail/Yahoo…) instead of a company domain', hi:'भर्तीकर्ता कंपनी डोमेन के बजाय मुफ़्त ईमेल (Gmail/Yahoo…) का उपयोग करता है', ml:'റിക്രൂട്ടർ കമ്പനി ഡൊമെയ്‌ന് പകരം സൗജന്യ ഇമെയിൽ (Gmail/Yahoo…) ഉപയോഗിക്കുന്നു'} });
    score += 18;
  }
  if (domains.some(d => d.kind === 'lookalike')){
    hits.push({ id:'lookalike', w:30, label:{en:'Look-alike website/email domain imitating a real company', hi:'असली कंपनी की नकल करता मिलता-जुलता वेबसाइट/ईमेल डोमेन', ml:'യഥാർത്ഥ കമ്പനിയെ അനുകരിക്കുന്ന സമാനമായ വെബ്‌സൈറ്റ്/ഇമെയിൽ ഡൊമെയ്ൻ'} });
    score += 30;
  }
  score = Math.min(100, score);
  const ids = new Set(hits.map(h => h.id));
  let level = 'low';
  if (score >= 70) level = 'crit'; else if (score >= 35) level = 'high'; else if (score >= 20) level = 'mid';
  if ((ids.has('fee') && ids.has('docs')) || (ids.has('task') && (ids.has('fee') || ids.has('crypto_pay'))) || (ids.has('overseas') && ids.has('fee'))) level = 'crit';
  return { score, level, hits, domains };
}

/* ---------------- State ---------------- */
const KEY = 'offerguard_v1';
let S = { v:1, checks:[false,false,false,false,false,false,false,false], apps:[], evidence:[], best:{}, settings:{ lang:'en', theme:'light' } };
if (typeof localStorage !== 'undefined'){ try { const raw = localStorage.getItem(KEY); if (raw){ const p = JSON.parse(raw); if (p && p.v === 1) S = Object.assign(S, p); } } catch(e){} }
function save(){ if (typeof localStorage === 'undefined') return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
if (typeof window !== 'undefined') window.__lang = S.settings.lang || 'en';

const $view = () => document.getElementById('view');
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function lang(){ return (typeof window !== 'undefined' && window.__lang) || 'en'; }
function L(obj){ return (obj && (obj[lang()] || obj.en)) || ''; }

/* ---------------- Navigation ---------------- */
let currentView = 'home';
function go(view){ currentView = view; document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === view)); render(); window.scrollTo(0,0); }
function render(){
  const v = $view(); if (!v) return;
  if (currentView === 'home') v.innerHTML = viewHome();
  else if (currentView === 'check') v.innerHTML = viewCheck();
  else if (currentView === 'verify') v.innerHTML = viewVerify();
  else if (currentView === 'drill') v.innerHTML = viewDrillList();
  else if (currentView === 'track') v.innerHTML = viewTrack();
  else if (currentView === 'help') v.innerHTML = viewHelp();
  bindView();
}
function applyStatic(){ document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); }); document.documentElement.lang = lang(); }
function setLang(l){ window.__lang = l; S.settings.lang = l; save(); const sel = document.getElementById('langSel'); if (sel) sel.value = l; applyStatic(); render(); }
function setTheme(th){ S.settings.theme = th; save(); document.documentElement.setAttribute('data-theme', th === 'dark' ? 'dark' : 'light'); document.getElementById('themeBtn').textContent = th === 'dark' ? '☀️' : '🌙'; }

/* ---------------- Views ---------------- */
function overseasCard(){
  return '<div class="card"><h3>' + esc(t('ov_title')) + '</h3><p>' + esc(t('ov_text')) + '</p><ol class="steps"><li>' + esc(t('ov_1')) + '</li><li>' + esc(t('ov_2')) + '</li><li>' + esc(t('ov_3')) + '</li><li>' + esc(t('ov_4')) + '</li><li>' + esc(t('ov_5')) + '</li></ol>' +
    '<p><a class="btn" href="https://emigrate.gov.in" target="_blank" rel="noopener">' + esc(t('emigrate_btn')) + '</a> <a class="btn ghost" href="tel:1800113090">' + esc(t('mea_call')) + '</a></p></div>';
}
function viewHome(){
  const bestTxt = Object.keys(S.best).length ? '<p class="muted">' + esc(t('best_score')) + ': ' + Object.values(S.best).join('% · ') + '%</p>' : '';
  return '<div class="card"><h2>' + esc(t('welcome_title')) + '</h2><p class="big">' + esc(t('welcome_text')) + '</p>' +
    '<button class="btn big-btn" data-act="go" data-to="check">' + esc(t('check_cta')) + '</button></div>' +
    '<div class="card"><h3>🚫 ' + esc(t('never_title')) + '</h3><ul><li>' + esc(t('never_1')) + '</li><li>' + esc(t('never_2')) + '</li><li>' + esc(t('never_3')) + '</li><li>' + esc(t('never_4')) + '</li></ul></div>' +
    '<div class="card"><h3>' + esc(t('how_title')) + '</h3><ol class="steps"><li>' + esc(t('how_1')) + '</li><li>' + esc(t('how_2')) + '</li><li>' + esc(t('how_3')) + '</li></ol></div>' +
    overseasCard() +
    '<div class="card"><h3>' + esc(t('drill_home_title')) + '</h3><p>' + esc(t('drill_home_text')) + '</p>' + bestTxt + '<button class="btn" data-act="go" data-to="drill">' + esc(t('start_drill')) + '</button></div>' +
    '<div class="card"><h3>' + esc(t('track_home_title')) + '</h3><p>' + esc(t('track_home_text')) + '</p><button class="btn ghost" data-act="go" data-to="track">' + esc(t('go_track')) + '</button></div>' +
    '<div class="card"><h3>📖 ' + esc(t('learn_title')) + '</h3><h3>' + esc(t('how_scam_title')) + '</h3><p>' + esc(t('how_scam_text')) + '</p><h3>' + esc(t('govt_title')) + '</h3><p>' + esc(t('govt_text')) + '</p></div>';
}
function viewCheck(){
  return '<div class="card"><h2>' + esc(t('check_title')) + '</h2><p>' + esc(t('check_intro')) + '</p>' +
    '<textarea id="chkText" placeholder="' + esc(t('paste_ph')) + '"></textarea>' +
    '<button class="btn big-btn" data-act="analyze">' + esc(t('analyze')) + '</button><div id="chkResult"></div></div>';
}
function renderCheckResult(r){
  const verdictTxt = { low:t('v_low'), mid:t('v_mid'), high:t('v_high'), crit:t('v_crit') }[r.level];
  const flags = r.hits.length ? r.hits.map(h => '<div class="flag">🚩 ' + esc(L(h.label)) + '</div>').join('') : '<p>' + esc(t('no_flags')) + '</p>';
  let doms = '';
  if (r.domains.length){
    doms = '<h3>' + esc(t('domains_title')) + '</h3>' + r.domains.map(d => {
      if (d.kind === 'official') return '<div class="flag">✅ <span class="kbd">' + esc(d.domain) + '</span> — ' + esc(t('dom_official')) + '</div>';
      if (d.kind === 'freemail') return '<div class="flag">⚠️ <span class="kbd">' + esc(d.domain) + '</span> — ' + esc(t('dom_free')) + '</div>';
      if (d.kind === 'lookalike') return '<div class="flag">🚨 <span class="kbd">' + esc(d.domain) + '</span> — ' + esc(t('dom_look')) + ' (' + esc(d.brand) + ')</div>';
      return '<div class="flag">• <span class="kbd">' + esc(d.domain) + '</span></div>';
    }).join('');
  } else doms = '<h3>' + esc(t('domains_title')) + '</h3><p class="muted">' + esc(t('dom_found_none')) + '</p>';
  return '<div class="verdict ' + (r.level === 'low' ? 'low' : r.level === 'mid' ? 'mid' : 'high') + '"><div>' + esc(t('score_label')) + ': <strong>' + r.score + ' / 100</strong></div><p style="margin:6px 0 0">' + esc(verdictTxt) + '</p></div>' +
    '<h3>' + esc(t('flags_found')) + '</h3>' + flags + doms +
    '<h3>' + esc(t('do_now')) + '</h3><ol class="steps"><li>' + esc(t('do_1')) + '</li><li>' + esc(t('do_2')) + '</li><li>' + esc(t('do_3')) + '</li><li>' + esc(t('do_4')) + '</li></ol>' +
    '<button class="btn" data-act="go" data-to="verify">' + esc(t('nav_verify')) + ' →</button>';
}
function viewVerify(){
  const boxes = S.checks.map((c,i) => '<label style="font-weight:400;display:flex;gap:10px;align-items:flex-start;margin:10px 0"><input type="checkbox" data-check="' + i + '" ' + (c ? 'checked' : '') + ' style="width:22px;height:22px;flex:0 0 auto;margin-top:2px"><span>' + esc(t('vc_' + (i+1))) + '</span></label>').join('');
  const done = S.checks.filter(Boolean).length;
  return '<div class="card"><h2>' + esc(t('verify_title')) + '</h2><p>' + esc(t('verify_intro')) + '</p>' +
    '<div class="progress"><i style="width:' + (done/8*100) + '%"></i></div><p class="muted">' + done + ' / 8</p>' + boxes +
    '<label>' + esc(t('f_company')) + '</label><input type="text" id="vcCompany" placeholder="TCS, Infosys, …">' +
    '<p><button class="btn" data-act="careers">' + esc(t('careers_btn')) + '</button> <a class="btn ghost" href="https://www.mca.gov.in" target="_blank" rel="noopener">' + esc(t('mca_btn')) + '</a> <button class="btn ghost" data-act="reset-checks">' + esc(t('reset_checks')) + '</button></p></div>' +
    overseasCard() +
    '<div class="card no-print"><h3>' + esc(t('card_btn')) + '</h3><button class="btn ghost" data-act="print">' + esc(t('print_btn')) + '</button></div>' +
    '<div class="print-card"><h2>🛡️ ' + esc(t('card_title')) + '</h2><p>' + esc(t('card_rule')) + '</p></div>';
}
function viewTrack(){
  const opts = ['applied','interview','offer','verified','rejected','scam'].map(s => '<option value="' + s + '">' + esc(t('st_' + s)) + '</option>').join('');
  const rows = S.apps.length ? S.apps.map((a,i) => '<div class="member-row"><div style="flex:1"><strong>' + esc(a.company) + '</strong> — ' + esc(a.role) + '<div class="muted">' + esc(a.source) + ' · ' + esc(a.date) + '</div></div><span class="chip">' + esc(t('st_' + a.status)) + '</span><button class="del" data-act="app-del" data-i="' + i + '" aria-label="' + esc(t('del')) + '">✕</button></div>').join('') : '<p class="muted">' + esc(t('empty_track')) + '</p>';
  return '<div class="card"><h2>' + esc(t('track_title')) + '</h2><p>' + esc(t('track_intro')) + '</p>' +
    '<label>' + esc(t('f_company')) + '</label><input type="text" id="apCompany">' +
    '<label>' + esc(t('f_role')) + '</label><input type="text" id="apRole">' +
    '<label>' + esc(t('f_source')) + '</label><input type="text" id="apSource">' +
    '<label>' + esc(t('f_status')) + '</label><select id="apStatus">' + opts + '</select>' +
    '<button class="btn big-btn" data-act="app-add">' + esc(t('add_btn')) + '</button></div>' +
    '<div class="card">' + rows + '</div>';
}
function viewHelp(){
  const evs = S.evidence.length ? S.evidence.map((e,i) => '<div class="member-row"><div style="flex:1"><div class="muted">' + esc(e.at) + '</div>' + esc(e.text) + '</div><button class="del" data-act="ev-del" data-i="' + i + '" aria-label="' + esc(t('del')) + '">✕</button></div>').join('') : '<p class="muted">' + esc(t('ev_empty')) + '</p>';
  return '<div class="card"><h2>🆘 ' + esc(t('help_title')) + '</h2><ol class="steps"><li>' + esc(t('help_1')) + '</li><li>' + esc(t('help_2')) + '</li><li>' + esc(t('help_3')) + '</li><li>' + esc(t('help_4')) + '</li></ol>' +
    '<p><a class="btn bad" href="tel:1930">' + esc(t('call_1930')) + '</a> <a class="btn ghost" href="https://cybercrime.gov.in" target="_blank" rel="noopener">' + esc(t('visit_portal')) + '</a> <a class="btn ghost" href="tel:1800113090">' + esc(t('mea_call')) + '</a></p></div>' +
    '<div class="card"><h3>' + esc(t('ev_title')) + '</h3><p>' + esc(t('ev_intro')) + '</p>' +
    '<textarea id="evText" placeholder="' + esc(t('ev_ph')) + '"></textarea>' +
    '<button class="btn" data-act="ev-add">' + esc(t('ev_save')) + '</button> <button class="btn ghost" data-act="ev-export">' + esc(t('ev_export')) + '</button>' +
    '<p id="evMsg" class="muted"></p><div>' + evs + '</div></div>';
}

/* ---------------- Practice drills ---------------- */
const SCENARIOS = [
{ id:'whatsapp_fresher',
  title:{en:'The WhatsApp “TCS HR” offer', hi:'WhatsApp वाला “TCS HR” ऑफ़र', ml:'WhatsApp "TCS HR" ഓഫർ'},
  caller:{en:'WhatsApp message from “HR Priya”', hi:'“HR Priya” का WhatsApp संदेश', ml:'"HR Priya"-യുടെ WhatsApp സന്ദേശം'},
  steps:[
   { msg:{en:'Hello! I am Priya from TCS HR. You are selected for a Data Entry job, work from home, salary ₹45,000/month. No interview needed. Confirm today!',
          hi:'नमस्ते! मैं TCS HR से प्रिया हूँ। आप डेटा एंट्री नौकरी के लिए चयनित हैं, घर से काम, सैलरी ₹45,000/माह। कोई साक्षात्कार नहीं चाहिए। आज ही कन्फ़र्म करें!',
          ml:'ഹലോ! ഞാൻ TCS HR-ൽ നിന്ന് പ്രിയ. നിങ്ങളെ ഡാറ്റാ എൻട്രി ജോലിക്ക് തിരഞ്ഞെടുത്തു, വീട്ടിൽ നിന്ന് ജോലി, ശമ്പളം ₹45,000/മാസം. അഭിമുഖം ആവശ്യമില്ല. ഇന്ന് തന്നെ ഉറപ്പാക്കൂ!'},
     choices:['act_check_careers','act_pay','act_rush'], best:'act_check_careers',
     why:{en:'TCS hires through its official careers portal and @tcs.com email — never by WhatsApp selection with no interview. ₹45,000 for no-skill data entry is bait. Verify first, always.',
          hi:'TCS अपने आधिकारिक करियर पोर्टल और @tcs.com ईमेल से भर्ती करता है — कभी WhatsApp पर बिना साक्षात्कार चयन नहीं करता। बिना कौशल डेटा एंट्री के लिए ₹45,000 झाँसा है। हमेशा पहले सत्यापित करें।',
          ml:'TCS അതിന്റെ ഔദ്യോഗിക കരിയർ പോർട്ടലിലൂടെയും @tcs.com ഇമെയിലിലൂടെയുമാണ് നിയമിക്കുന്നത് — ഒരിക്കലും അഭിമുഖമില്ലാതെ WhatsApp സെലക്ഷനിലൂടെയല്ല. കഴിവില്ലാത്ത ഡാറ്റാ എൻട്രിക്ക് ₹45,000 എന്നത് കെണിയാണ്. എപ്പോഴും ആദ്യം ഉറപ്പാക്കൂ.'} },
   { msg:{en:'Good. To confirm your seat, pay the laptop + training fee of ₹3,999. It is fully refundable with your first salary.',
          hi:'अच्छा। अपनी सीट पक्की करने के लिए ₹3,999 की लैपटॉप + प्रशिक्षण फ़ीस दें। यह आपकी पहली सैलरी के साथ पूरी तरह वापस होगी।',
          ml:'നല്ലത്. നിങ്ങളുടെ സീറ്റ് ഉറപ്പാക്കാൻ ₹3,999 ലാപ്‌ടോപ്പ് + പരിശീലന ഫീസ് അടയ്ക്കൂ. ആദ്യ ശമ്പളത്തോടൊപ്പം അത് പൂർണ്ണമായും തിരികെ ലഭിക്കും.'},
     choices:['act_pay','act_ask_email','act_send_docs'], best:'act_ask_email',
     why:{en:'“Refundable fee” is the single most common job-scam demand in India. Real employers issue laptops; they don\'t sell them to new hires. A written offer on an official domain comes before any money talk — always.',
          hi:'“रिफ़ंडेबल फ़ीस” भारत में नौकरी-स्कैम की सबसे आम माँग है। असली नियोक्ता लैपटॉप देते हैं; नए कर्मचारियों को बेचते नहीं। किसी भी पैसे की बात से पहले आधिकारिक डोमेन पर लिखित ऑफ़र आता है — हमेशा।',
          ml:'"തിരികെ കിട്ടുന്ന ഫീസ്" ഇന്ത്യയിലെ ജോലി തട്ടിപ്പിലെ ഏറ്റവും സാധാരണമായ ആവശ്യമാണ്. യഥാർത്ഥ തൊഴിലുടമകൾ ലാപ്‌ടോപ്പ് നൽകുന്നു; പുതിയ ജീവനക്കാർക്ക് വിൽക്കില്ല. പണത്തെക്കുറിച്ചുള്ള ഏത് സംസാരത്തിനും മുമ്പ് ഔദ്യോഗിക ഡൊമെയ്‌നിൽ എഴുതിയ ഓഫർ വരും — എപ്പോഴും.'} },
   { msg:{en:'Also send your Aadhaar, PAN and bank passbook photo here on WhatsApp for verification. Offer expires today, hurry!',
          hi:'साथ ही सत्यापन के लिए अपना आधार, PAN और बैंक पासबुक की फ़ोटो यहाँ WhatsApp पर भेजें। ऑफ़र आज समाप्त हो रहा है, जल्दी करें!',
          ml:'പരിശോധനയ്ക്കായി നിങ്ങളുടെ ആധാർ, PAN, ബാങ്ക് പാസ്‌ബുക്ക് ഫോട്ടോ ഇവിടെ WhatsApp-ൽ അയക്കൂ. ഓഫർ ഇന്ന് അവസാനിക്കുന്നു, വേഗം!'},
     choices:['act_send_docs','act_call_official','act_rush'], best:'act_call_official',
     why:{en:'Documents demanded on WhatsApp + expiry pressure = identity theft in progress. Your Aadhaar and bank details can open loans and SIMs in your name. Call the company on its official number and ask if this person and job exist.',
          hi:'WhatsApp पर दस्तावेज़ों की माँग + समाप्ति का दबाव = पहचान चोरी चल रही है। आपके आधार और बैंक विवरण से आपके नाम पर ऋण और SIM खुल सकते हैं। कंपनी को उसके आधिकारिक नंबर पर कॉल करके पूछें कि यह व्यक्ति और नौकरी सच में है या नहीं।',
          ml:'WhatsApp-ൽ രേഖകൾ ആവശ്യപ്പെടുന്നതും അവസാനിക്കൽ സമ്മർദ്ദവും = തിരിച്ചറിയൽ മോഷണം നടക്കുന്നു. നിങ്ങളുടെ ആധാറും ബാങ്ക് വിവരങ്ങളും നിങ്ങളുടെ പേരിൽ വായ്പകളും SIM-കളും തുറക്കാൻ കഴിയും. കമ്പനിയെ അതിന്റെ ഔദ്യോഗിക നമ്പറിൽ വിളിച്ച് ഈ വ്യക്തിയും ജോലിയും നിലവിലുണ്ടോ എന്ന് ചോദിക്കൂ.'} }
  ]},
{ id:'govt_letter',
  title:{en:'The fake India Post selection letter', hi:'नकली India Post चयन पत्र', ml:'വ്യാജ India Post സെലക്ഷൻ ലെറ്റർ'},
  caller:{en:'An email with a professional “selection letter” PDF', hi:'पेशेवर “चयन पत्र” PDF वाला ईमेल', ml:'പ്രൊഫഷണൽ "സെലക്ഷൻ ലെറ്റർ" PDF ഉള്ള ഒരു ഇമെയിൽ'},
  steps:[
   { msg:{en:'Dear Candidate, you have been selected for the post of Gramin Dak Sevak, India Post. Your selection letter is attached. (Sent from indiapost.recruitment@gmail.com)',
          hi:'प्रिय उम्मीदवार, आप India Post में ग्रामीण डाक सेवक पद के लिए चयनित हुए हैं। आपका चयन पत्र संलग्न है। (indiapost.recruitment@gmail.com से भेजा गया)',
          ml:'പ്രിയ ഉദ്യോഗാർത്ഥി, India Post-ൽ ഗ്രാമീൺ ഡാക് സേവക് തസ്തികയിലേക്ക് നിങ്ങളെ തിരഞ്ഞെടുത്തു. നിങ്ങളുടെ സെലക്ഷൻ ലെറ്റർ അറ്റാച്ച് ചെയ്തിട്ടുണ്ട്. (indiapost.recruitment@gmail.com-ൽ നിന്ന് അയച്ചത്)'},
     choices:['act_check_careers','act_pay','act_rush'], best:'act_check_careers',
     why:{en:'India Post communicates from indiapost.gov.in and publishes results on its official website — never from a Gmail address. A Gmail “government” sender is an instant fail.',
          hi:'India Post indiapost.gov.in से संवाद करता है और परिणाम अपनी आधिकारिक वेबसाइट पर प्रकाशित करता है — कभी Gmail पते से नहीं। Gmail वाला “सरकारी” प्रेषक तुरंत विफल है।',
          ml:'India Post indiapost.gov.in-ൽ നിന്നാണ് ആശയവിനിമയം നടത്തുന്നത്, ഫലങ്ങൾ അതിന്റെ ഔദ്യോഗിക വെബ്‌സൈറ്റിൽ പ്രസിദ്ധീകരിക്കുന്നു — ഒരിക്കലും Gmail വിലാസത്തിൽ നിന്നല്ല. Gmail "സർക്കാർ" അയക്കുന്നയാൾ ഉടൻ പരാജയമാണ്.'} },
   { msg:{en:'To release your appointment, pay documentation charges of ₹1,999 at this link today. Only 14 seats remain in your district.',
          hi:'अपनी नियुक्ति जारी करने के लिए आज इस लिंक पर ₹1,999 दस्तावेज़ीकरण शुल्क दें। आपके ज़िले में केवल 14 सीटें बची हैं।',
          ml:'നിങ്ങളുടെ നിയമനം പുറത്തിറക്കാൻ ഇന്ന് ഈ ലിങ്കിൽ ₹1,999 ഡോക്യുമെന്റേഷൻ ചാർജ് അടയ്ക്കൂ. നിങ്ങളുടെ ജില്ലയിൽ 14 സീറ്റുകൾ മാത്രമേ ബാക്കിയുള്ളൂ.'},
     choices:['act_pay','act_call_official','act_rush'], best:'act_call_official',
     why:{en:'Government fees are paid through official treasuries and portals, never through a link in a message, and never against a “seats left” countdown. Verify at your local post office or the official helpline.',
          hi:'सरकारी शुल्क आधिकारिक ख़ज़ानों और पोर्टलों से दिए जाते हैं, कभी संदेश के लिंक से नहीं, और कभी “सीटें बची हैं” वाली उलटी गिनती के सामने नहीं। अपने स्थानीय डाकघर या आधिकारिक हेल्पलाइन पर सत्यापित करें।',
          ml:'സർക്കാർ ഫീസുകൾ ഔദ്യോഗിക ട്രഷറികളിലൂടെയും പോർട്ടലുകളിലൂടെയുമാണ് അടയ്ക്കുന്നത്, ഒരിക്കലും സന്ദേശത്തിലെ ലിങ്കിലൂടെയല്ല, "സീറ്റുകൾ ബാക്കി" കൗണ്ട്‌ഡൗണിന് മുന്നിലുമല്ല. നിങ്ങളുടെ അടുത്തുള്ള പോസ്റ്റ് ഓഫീസിലോ ഔദ്യോഗിക ഹെൽപ്‌ലൈനിലോ ഉറപ്പാക്കൂ.'} },
   { msg:{en:'After payment, report to Delhi for training and bring your original certificates. Do not discuss this selection with anyone yet.',
          hi:'भुगतान के बाद, प्रशिक्षण के लिए दिल्ली रिपोर्ट करें और अपने मूल प्रमाणपत्र लाएँ। इस चयन पर अभी किसी से चर्चा न करें।',
          ml:'പേയ്‌മെന്റിന് ശേഷം, പരിശീലനത്തിനായി ഡൽഹിയിൽ റിപ്പോർട്ട് ചെയ്യൂ, നിങ്ങളുടെ യഥാർത്ഥ സർട്ടിഫിക്കറ്റുകൾ കൊണ്ടുവരൂ. ഈ സെലക്ഷനെക്കുറിച്ച് ഇതുവരെ ആരോടും ചർച്ച ചെയ്യരുത്.'},
     choices:['act_check_careers','act_send_docs','act_rush'], best:'act_check_careers',
     why:{en:'Real merit lists are public documents on official websites — secrecy is demanded only by scammers. If your name is not on the official list, there is no selection, whatever the PDF says.',
          hi:'असली मेरिट सूचियाँ आधिकारिक वेबसाइटों पर सार्वजनिक दस्तावेज़ होती हैं — गोपनीयता सिर्फ़ स्कैमर माँगते हैं। अगर आपका नाम आधिकारिक सूची में नहीं है, तो कोई चयन नहीं है, PDF कुछ भी कहे।',
          ml:'യഥാർത്ഥ മെറിറ്റ് ലിസ്റ്റുകൾ ഔദ്യോഗിക വെബ്‌സൈറ്റുകളിലെ പൊതു രേഖകളാണ് — രഹസ്യം ആവശ്യപ്പെടുന്നത് തട്ടിപ്പുകാർ മാത്രമാണ്. നിങ്ങളുടെ പേര് ഔദ്യോഗിക ലിസ്റ്റിൽ ഇല്ലെങ്കിൽ, PDF എന്ത് പറഞ്ഞാലും സെലക്ഷൻ ഇല്ല.'} }
  ]},
{ id:'overseas_funnel',
  title:{en:'The “Thailand IT job” agent', hi:'“थाईलैंड IT नौकरी” वाला एजेंट', ml:'"തായ്‌ലൻഡ് IT ജോലി" ഏജന്റ്'},
  caller:{en:'A local agent with a glossy offer', hi:'चमकदार ऑफ़र वाला एक स्थानीय एजेंट', ml:'തിളങ്ങുന്ന ഓഫറുമായി ഒരു പ്രാദേശിക ഏജന്റ്'},
  steps:[
   { msg:{en:'Brother, IT company in Thailand, data entry work, ₹1,20,000 salary per month. No interview, direct joining. I will arrange everything.',
          hi:'भाई, थाईलैंड में IT कंपनी, डेटा एंट्री काम, ₹1,20,000 सैलरी प्रति माह। कोई साक्षात्कार नहीं, सीधी जॉइनिंग। मैं सब व्यवस्था कर दूँगा।',
          ml:'സഹോദരാ, തായ്‌ലൻഡിൽ IT കമ്പനി, ഡാറ്റാ എൻട്രി ജോലി, മാസം ₹1,20,000 ശമ്പളം. അഭിമുഖമില്ല, നേരിട്ടുള്ള ജോയിനിംഗ്. ഞാൻ എല്ലാം ഏർപ്പാടാക്കാം.'},
     choices:['act_rush','act_check_emigrate','act_pay'], best:'act_check_emigrate',
     why:{en:'₹1.2 lakh/month for data entry with no interview is the exact funnel that trafficked thousands of Indians to scam compounds in Myanmar and Cambodia. First question for ANY overseas agent: are you registered on eMigrate?',
          hi:'बिना साक्षात्कार डेटा एंट्री के लिए ₹1.2 लाख/माह वही झाँसा है जिसने हज़ारों भारतीयों को म्यांमार और कंबोडिया के स्कैम परिसरों में तस्करी का शिकार बनाया। किसी भी विदेशी एजेंट से पहला सवाल: क्या आप eMigrate पर पंजीकृत हैं?',
          ml:'അഭിമുഖമില്ലാതെ ഡാറ്റാ എൻട്രിക്ക് മാസം ₹1.2 ലക്ഷം എന്നത് ആയിരക്കണക്കിന് ഇന്ത്യക്കാരെ മ്യാൻമറിലെയും കംബോഡിയയിലെയും തട്ടിപ്പ് കേന്ദ്രങ്ങളിലേക്ക് കടത്തിയ അതേ കെണിയാണ്. ഏത് വിദേശ ഏജന്റിനോടും ആദ്യ ചോദ്യം: നിങ്ങൾ eMigrate-ൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ടോ?'} },
   { msg:{en:'You go on a tourist visa first, company will convert it to work visa there. Just pay ₹60,000 for visa and ticket advance.',
          hi:'आप पहले पर्यटक वीज़ा पर जाएँ, कंपनी वहाँ उसे वर्क वीज़ा में बदल देगी। बस वीज़ा और टिकट अग्रिम के लिए ₹60,000 दें।',
          ml:'നിങ്ങൾ ആദ്യം ടൂറിസ്റ്റ് വിസയിൽ പോകൂ, കമ്പനി അവിടെ അത് വർക്ക് വിസയാക്കി മാറ്റും. വിസയ്ക്കും ടിക്കറ്റ് അഡ്വാൻസിനുമായി ₹60,000 മാത്രം കൊടുക്കൂ.'},
     choices:['act_pay','act_check_emigrate','act_rush'], best:'act_check_emigrate',
     why:{en:'Two crimes in one line: legal agent charges are capped at ₹30,000 + GST total, and working on a tourist visa is illegal — it is how victims end up trapped with no legal status. A real job starts with a work visa, stamped before you fly.',
          hi:'एक पंक्ति में दो अपराध: कानूनी एजेंट शुल्क कुल ₹30,000 + GST पर सीमित है, और पर्यटक वीज़ा पर काम करना अवैध है — इसी तरह पीड़ित बिना कानूनी स्थिति के फँस जाते हैं। असली नौकरी वर्क वीज़ा से शुरू होती है, उड़ान से पहले मुहर लगी हुई।',
          ml:'ഒരു വരിയിൽ രണ്ട് കുറ്റകൃത്യങ്ങൾ: നിയമപരമായ ഏജന്റ് ചാർജുകൾ ആകെ ₹30,000 + GST ആയി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു, ടൂറിസ്റ്റ് വിസയിൽ ജോലി ചെയ്യുന്നത് നിയമവിരുദ്ധമാണ് — ഇങ്ങനെയാണ് ഇരകൾ നിയമപരമായ പദവിയില്ലാതെ കുടുങ്ങുന്നത്. യഥാർത്ഥ ജോലി വർക്ക് വിസയോടെ ആരംഭിക്കുന്നു, പറക്കുന്നതിന് മുമ്പ് സ്റ്റാമ്പ് ചെയ്തത്.'} },
   { msg:{en:'Give me your passport today for processing, and do not tell your family about the tourist visa part — they will worry for nothing.',
          hi:'प्रोसेसिंग के लिए आज अपना पासपोर्ट मुझे दे दें, और पर्यटक वीज़ा वाली बात अपने परिवार को न बताएँ — वे बेवजह चिंता करेंगे।',
          ml:'പ്രോസസ്സിംഗിനായി ഇന്ന് നിങ്ങളുടെ പാസ്‌പോർട്ട് എനിക്ക് തരൂ, ടൂറിസ്റ്റ് വിസ ഭാഗത്തെക്കുറിച്ച് കുടുംബത്തോട് പറയരുത് — അവർ വെറുതെ വിഷമിക്കും.'},
     choices:['act_send_docs','act_check_emigrate','act_rush'], best:'act_check_emigrate',
     why:{en:'Surrendering your passport + secrecy from family is the final step of trafficking: without a passport you cannot leave, and without family knowing, nobody can rescue you. Never hand over your passport. Report such agents — MEA helpline 1800-11-3090.',
          hi:'पासपोर्ट सौंपना + परिवार से गोपनीयता तस्करी का अंतिम चरण है: पासपोर्ट के बिना आप निकल नहीं सकते, और परिवार को पता न हो तो कोई बचा नहीं सकता। अपना पासपोर्ट कभी न सौंपें। ऐसे एजेंटों की रिपोर्ट करें — MEA हेल्पलाइन 1800-11-3090।',
          ml:'പാസ്‌പോർട്ട് കൈമാറുന്നതും കുടുംബത്തിൽ നിന്നുള്ള രഹസ്യവും കടത്തിന്റെ അവസാന ഘട്ടമാണ്: പാസ്‌പോർട്ട് ഇല്ലാതെ നിങ്ങൾക്ക് പോകാനാവില്ല, കുടുംബത്തിന് അറിയാതെ ആർക്കും രക്ഷിക്കാനുമാവില്ല. ഒരിക്കലും പാസ്‌പോർട്ട് കൈമാറരുത്. അത്തരം ഏജന്റുമാരെ റിപ്പോർട്ട് ചെയ്യൂ — MEA ഹെൽപ്‌ലൈൻ 1800-11-3090.'} }
  ]}
];
let drill = null;
function viewDrillList(){
  const cards = SCENARIOS.map((s,i) => '<div class="card"><h3>🎭 ' + esc(L(s.title)) + '</h3><p class="muted">' + esc(L(s.caller)) + '</p>' + (S.best[s.id] != null ? '<p class="muted">' + esc(t('best_score')) + ': ' + S.best[s.id] + '%</p>' : '') + '<button class="btn" data-act="drill-start" data-i="' + i + '">' + esc(t('start_drill')) + '</button></div>').join('');
  return '<div class="card"><h2>' + esc(t('drill_title')) + '</h2><p>' + esc(t('drill_intro')) + '</p></div>' + cards;
}
function renderDrill(){
  const v = $view(); const s = SCENARIOS[drill.i]; const step = s.steps[drill.step];
  const history = drill.log.map(x => '<div class="bubble scam"><div class="who">' + esc(L(s.caller)) + '</div>' + esc(L(x.msg)) + '</div><div class="bubble me">' + esc(t(x.choice)) + '</div><div class="teach">' + (x.ok ? esc(t('correct')) : esc(t('wrong'))) + ' ' + esc(L(x.why)) + '</div>').join('');
  if (!step){
    const pct = Math.round(drill.good / s.steps.length * 100);
    if (S.best[s.id] == null || pct > S.best[s.id]){ S.best[s.id] = pct; save(); }
    v.innerHTML = '<div class="card"><h2>🎉 ' + esc(t('drill_done')) + '</h2><div class="stat"><div class="num">' + pct + '%</div><p>' + esc(t('your_score')) + '</p></div><div class="chat">' + history + '</div>' +
      '<button class="btn" data-act="go" data-to="drill">' + esc(t('play_again')) + '</button> <button class="btn ghost" data-act="go" data-to="home">' + esc(t('back_home')) + '</button></div>';
    bindView(); return;
  }
  const btns = step.choices.map(c => '<button class="btn big-btn ghost" data-act="drill-choose" data-c="' + c + '">' + esc(t(c)) + '</button>').join('');
  v.innerHTML = '<div class="card"><h2>🎭 ' + esc(L(s.title)) + '</h2><p class="muted">' + esc(L(s.caller)) + ' · ' + (drill.step+1) + ' / ' + s.steps.length + '</p>' +
    '<div class="chat">' + history + '<div class="bubble scam"><div class="who">' + esc(L(s.caller)) + '</div>' + esc(L(step.msg)) + '</div></div>' + btns + '</div>';
  bindView();
}

/* ---------------- Events ---------------- */
function bindView(){
  $view().querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', onAction));
  $view().querySelectorAll('[data-check]').forEach(inp => inp.addEventListener('change', () => { S.checks[+inp.dataset.check] = inp.checked; save(); render(); }));
}
function onAction(e){
  const el = e.currentTarget; const act = el.dataset.act;
  if (act === 'go') go(el.dataset.to);
  else if (act === 'analyze'){
    const txt = document.getElementById('chkText').value || '';
    document.getElementById('chkResult').innerHTML = renderCheckResult(analyzeOffer(txt));
  }
  else if (act === 'print') window.print();
  else if (act === 'reset-checks'){ S.checks = [false,false,false,false,false,false,false,false]; save(); render(); }
  else if (act === 'careers'){
    const c = (document.getElementById('vcCompany').value || '').trim();
    const q = encodeURIComponent(c ? c + ' official careers' : 'official careers page');
    window.open('https://www.google.com/search?q=' + q, '_blank', 'noopener');
  }
  else if (act === 'drill-start'){ drill = { i:+el.dataset.i, step:0, good:0, log:[] }; renderDrill(); window.scrollTo(0,0); }
  else if (act === 'drill-choose'){
    const s = SCENARIOS[drill.i]; const step = s.steps[drill.step]; const c = el.dataset.c;
    const ok = c === step.best; if (ok) drill.good++;
    drill.log.push({ msg: step.msg, choice: c, ok, why: step.why });
    drill.step++; renderDrill(); window.scrollTo(0,0);
  }
  else if (act === 'app-add'){
    const company = document.getElementById('apCompany').value.trim();
    const role = document.getElementById('apRole').value.trim();
    if (!company && !role) return;
    S.apps.unshift({ company, role, source: document.getElementById('apSource').value.trim(), status: document.getElementById('apStatus').value, date: new Date().toISOString().slice(0,10) });
    save(); render();
  }
  else if (act === 'app-del'){ S.apps.splice(+el.dataset.i, 1); save(); render(); }
  else if (act === 'ev-add'){
    const txt = document.getElementById('evText').value.trim(); if (!txt) return;
    S.evidence.unshift({ at: new Date().toISOString().slice(0,10), text: txt }); save(); render();
    const m = document.getElementById('evMsg'); if (m) m.textContent = t('ev_saved');
  }
  else if (act === 'ev-del'){ S.evidence.splice(+el.dataset.i, 1); save(); render(); }
  else if (act === 'ev-export'){
    const body = S.evidence.map(e2 => e2.at + ' — ' + e2.text).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type:'text/plain' }));
    a.download = 'offerguard-evidence.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
}

/* ---------------- Boot ---------------- */
if (typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', S.settings.theme === 'dark' ? 'dark' : 'light');
    document.getElementById('themeBtn').textContent = S.settings.theme === 'dark' ? '☀️' : '🌙';
    const sel = document.getElementById('langSel'); sel.value = lang();
    sel.addEventListener('change', () => setLang(sel.value));
    document.getElementById('themeBtn').addEventListener('click', () => setTheme(S.settings.theme === 'dark' ? 'light' : 'dark'));
    document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));
    applyStatic(); render();
  });
}
if (typeof module !== 'undefined' && module.exports){ module.exports = { analyzeOffer, extractDomains, PATTERNS, BRANDS }; }
