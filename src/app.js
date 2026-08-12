/* Couche applicative du lab : état, progression, révision espacée, rendu.

   Écrite une seule fois pour les quatre modules. Elle attend que la page lui
   fournisse `MODULE`, `ROOMS` et `VIVA`, plus le moteur correspondant :
   le simulateur shell (newShell, run, lookup…) ou l'interpréteur C (runC).
   Elle détecte lequel est présent et n'active que les étapes qui vont avec.

   Ce qui a disparu par rapport à la version précédente : les xp et le compteur
   de jours consécutifs. Un total de points qui ne sert qu'à payer des indices
   ressemble à un score sans en être un, et une série entretenue pour la série
   n'apprend rien. Ce qui reste est ce qui veut dire quelque chose : les salles
   validées, les bits de permission qui s'allument, et la file de révision. */

const MODE_SHELL = typeof newShell === 'function';
const MODE_C = typeof runC === 'function';

/* ==========================================================================
   1. ÉTAT ET PERSISTANCE
   ========================================================================== */
const KEY = MODULE.cle;
let S = { rooms:{}, srs:{}, aide:{}, premier:{}, last:null, viva:{} };

const store = {
  async get(){
    try{ if(window.storage){ const r=await window.storage.get(KEY); return r&&r.value?JSON.parse(r.value):null; } }catch(e){}
    try{ const v=window.localStorage&&localStorage.getItem(KEY); return v?JSON.parse(v):null; }catch(e){}
    return null;
  },
  async set(v){
    const s=JSON.stringify(v);
    try{ if(window.storage){ await window.storage.set(KEY,s); return; } }catch(e){}
    try{ if(window.localStorage) localStorage.setItem(KEY,s); }catch(e){}
  }
};
const aujourdhui = () => new Date().toISOString().slice(0,10);
const save = () => store.set(S);

/* --- révision espacée : boîtes de Leitner --- */
const BOITES = [0,1,3,7,16];
/* `avecAide` n'est pas cosmétique : une tâche résolue avec un indice retombe
   en boîte 0, donc elle revient dès demain, même si la réponse était juste.
   C'est ce qui remplace le coût en points. Un marquage qui n'agirait sur rien
   serait exactement le faux signal qu'on a voulu supprimer. */
function srsAdd(id, juste, avecAide){
  /* Le verdict du tout premier essai, enregistré une seule fois. C'est le seul
     chiffre honnête sur ce qu'on savait vraiment : refaire une salle jusqu'à
     ce que tout soit vert ne dit rien, et un compteur qui monte à force de
     réessayer serait exactement le faux signal qu'on a supprimé avec les xp. */
  if(S.premier[id] === undefined) S.premier[id] = !!juste && !avecAide;
  const e = S.srs[id] || {box:0};
  e.box = (juste && !avecAide) ? Math.min(4, e.box+1) : 0;
  const d = new Date(); d.setDate(d.getDate() + BOITES[e.box]);
  e.due = d.toISOString().slice(0,10);
  if(avecAide) S.aide[id] = true; else delete S.aide[id];
  S.srs[id] = e; save();
}
function srsDues(){
  const t = aujourdhui();
  return Object.keys(S.srs).filter(k => !S.srs[k].due || S.srs[k].due <= t);
}
/* Les questions rejouables en révision : QCM, saisies, et les questions orales.
   Les orales n'y entraient pas, alors que la note vient d'une soutenance :
   ce qu'on n'a pas su dire ne revenait jamais. C'était l'inversion la plus
   coûteuse du lab. */
function questionsRejouables(){
  const out = [];
  ROOMS.forEach(r => r.steps.forEach((s,i) => {
    if(['mcq','input','answer','predict','bug','term','code'].includes(s.k))
      out.push({ id: r.id+'.'+i, room: r, step: s });
  }));
  return out;
}

/* ==========================================================================
   2. OUTILS DE RENDU
   ========================================================================== */
const $ = s => document.querySelector(s);
/* Un emoji rendu par la police du système n'est pas une icône : il change de
   dessin d'un appareil à l'autre et s'aligne mal. Tracé à la main, il est
   stable partout. */
const CADENAS = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">'+
  '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M4.4 7V4.8a3.6 3.6 0 0 1 7.2 0V7"/>'+
  '<rect x="2.9" y="7" width="10.2" height="6.6" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

function separateurFacultatif(){
  const d = document.createElement('div');
  d.className = 'coupure';
  d.innerHTML = "<span>à partir d'ici, c'est facultatif</span>" +
    "<p>Le sujet s'arrête aux exercices obligatoires et te laisse le choix : " +
    'continuer pour aller plus loin, ou passer au module suivant. Le module est ' +
    'validé sans ces salles, et rien ne reste verrouillé derrière elles.</p>';
  return d;
}
const echappe = x => String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
/* Une pastille, et seulement quand elle apprend quelque chose que le contenu
   ne dit pas déjà. L'ancienne étiquette en capitales suivie d'un filet
   horizontal apparaissait sur chaque bloc, y compris là où le contenu était
   évident : c'était de la décoration répétée, pas de la signalisation. */
const pastille = (txt, gris) => '<span class="tag'+(gris?' gris':'')+'">'+txt+'</span>';
const elVerdict = () => { const d=document.createElement('div'); d.className='verdict'; return d; };

/* `ton` vaut 'note' pour une question, 'devine' pour une prédiction. Se
   tromper en devinant avant l'explication est le mécanisme même, pas un
   échec : « raté » y serait un contresens et découragerait de tenter. */
function poseVerdict(el, ok, attendu, obtenu, why, ton){
  el.classList.add('show');
  const mot = ton==='devine'
    ? (ok ? '✓ bien vu' : '→ pas tout à fait, et c\'est sans importance')
    : (ok ? '✓ juste' : '✗ raté');
  let h = '<div class="vline '+(ok?'good':'bad')+'" role="status">'+mot+'</div>';
  if(!ok && attendu!==undefined)
    h += '<div class="vs"><span class="k">ATTENDU</span><span class="v good">'+echappe(attendu)+'</span>'+
         '<span class="k">OBTENU</span><span class="v bad">'+(obtenu?echappe(obtenu):'<i>rien</i>')+'</span></div>';
  if(why) h += '<div class="why">'+why+'</div>';
  el.innerHTML = h;
}

function nTaches(r){
  return r.steps.filter(s => !['lesson','bits','inode','ascii','mem'].includes(s.k)).length || 1;
}
function etatSalle(r){ return S.rooms[r.id] || {done:0, cleared:false}; }

/* Le sujet arrête les exercices obligatoires avant la fin : après un certain
   point, l'école dit explicitement qu'on peut continuer OU passer au projet
   suivant. Le lab doit dire la même chose, sinon il enferme là où le sujet
   libère. Les salles marquées `optionnel` ne bloquent donc rien : elles ne
   comptent pas dans l'avancement du module, et surtout elles ne verrouillent
   pas ce qui vient après, y compris la soutenance blanche. */
const obligatoires = () => ROOMS.filter(r => !r.optionnel);
const finiesObligatoires = () => obligatoires().filter(r => etatSalle(r).cleared).length;
const moduleTermine = () => finiesObligatoires() === obligatoires().length;

/* Une salle s'ouvre quand toutes les salles OBLIGATOIRES qui la précèdent sont
   validées. Sauter les facultatives ne ferme donc aucune porte. */
function salleOuverte(i){
  for(let k=0;k<i;k++) if(!ROOMS[k].optionnel && !etatSalle(ROOMS[k]).cleared) return false;
  return true;
}
function bitsDe(fraction){
  const n = Math.round(Math.min(1,fraction)*9);
  let s='';
  for(let i=0;i<9;i++) s += i<n ? 'rwxrwxrwx'[i] : '-';
  return s;
}

/* ==========================================================================
   3. ACCUEIL DU MODULE
   ========================================================================== */
const vueAccueil = $('#accueil'), vueSalle = $('#salle');
const teteSalle = $('#teteSalle'), corpsSalle = $('#corpsSalle');

function peindreAccueil(){
  const oblig = obligatoires().length, finies = finiesObligatoires();
  const extras = ROOMS.filter(r => r.optionnel && etatSalle(r).cleared).length;
  const nExtras = ROOMS.filter(r => r.optionnel).length;
  $('#compteSalles').textContent = finies + ' / ' + oblig + ' obligatoires'
    + (nExtras ? '  ·  ' + extras + ' / ' + nExtras + ' en plus' : '');
  const barre = $('#bitsModule');
  barre.innerHTML='';
  bitsDe(finies/oblig).split('').forEach(c => {
    const s=document.createElement('span'); s.textContent=c;
    if(c!=='-') s.className='on'; barre.appendChild(s);
  });
  barre.setAttribute('aria-label', finies+' salles obligatoires validées sur '+oblig);

  const corps = $('#lsbody'); corps.innerHTML='';
  const courante = ROOMS.findIndex((r,i) => !r.optionnel && !etatSalle(r).cleared);
  const courante_ = courante < 0 ? ROOMS.length : courante;
  /* Sur un écran de téléphone, dix lignes dont neuf inertes remplissent tout
     l'espace sans rien apprendre. On montre ce qui est ouvert, plus la salle
     suivante pour savoir où l'on va, et on replie le reste derrière un bouton.
     Rien n'est caché définitivement : le repli est un pli, pas une porte. */
  const limite = Math.min(ROOMS.length, Math.max(courante_ + 2, 3));
  const ligne = (r,i) => {
    const st = etatSalle(r), ouverte = salleOuverte(i);
    const b = document.createElement('button');
    b.className = 'lsrow' + (st.cleared?' done':(st.done?' part':''));
    b.disabled = !ouverte;
    b.innerHTML =
      '<span class="mode">'+ (st.cleared ? '-rwxrwxrwx' : '-'+bitsDe(st.done/nTaches(r))) +'</span>'+
      '<span class="nm"><b>'+r.file+'</b><span>'+r.title+'</span></span>'+
      '<span class="badge">'+(st.cleared ? '✓' : ouverte ? (st.done ? st.done+'/'+nTaches(r) : r.tag) : CADENAS)+'</span>';
    if(r.optionnel) b.classList.add('extra');
    if(!ouverte) b.setAttribute('aria-label', r.file+' : verrouillée, termine la salle obligatoire précédente');
    b.onclick = () => ouvrirSalle(i);
    return b;
  };
  ROOMS.slice(0, limite).forEach((r,i) => {
    if(r.optionnel && (i===0 || !ROOMS[i-1].optionnel)) corps.appendChild(separateurFacultatif());
    corps.appendChild(ligne(r,i));
  });
  const reste = ROOMS.length - limite;
  if(reste > 0){
    const plus = document.createElement('button');
    plus.className = 'voirplus'; plus.type = 'button';
    plus.setAttribute('aria-expanded','false');
    plus.textContent = 'voir les ' + reste + ' salle' + (reste>1?'s':'') + ' suivante' + (reste>1?'s':'');
    plus.onclick = () => {
      plus.remove();
      ROOMS.slice(limite).forEach((r,k) => {
        const i = limite+k;
        if(r.optionnel && (i===0 || !ROOMS[i-1].optionnel)) corps.appendChild(separateurFacultatif());
        corps.appendChild(ligne(r, i));
      });
    };
    corps.appendChild(plus);
  }
  $('#totalLigne').textContent = moduleTermine()
    ? (extras === nExtras
        ? 'Module validé, salles en plus comprises. chmod 777.'
        : 'Module validé. Les salles en plus restent ouvertes si tu veux les faire.')
    : oblig + ' salles obligatoires' + (nExtras ? ', puis ' + nExtras + ' en plus si tu veux' : '')
      + '. Les suivantes s\'ouvrent au fur et à mesure.';

  const dues = srsDues().length, connues = Object.keys(S.srs).length;
  const avecAide = Object.keys(S.aide).length;
  $('#srsT').textContent = dues ? dues+' question'+(dues>1?'s':'')+' à revoir aujourd\'hui'
                                : 'Rien à revoir pour le moment';
  $('#srsS').textContent = connues
    ? connues+' questions en mémoire' + (avecAide ? ', dont '+avecAide+' résolue'+(avecAide>1?'s':'')+' avec aide qui revien'+(avecAide>1?'nent':'t')+' plus vite' : '')
      + '. Les ratées reviennent demain, les acquises s\'espacent (1, 3, 7, 16 jours).'
    : 'Réponds aux questions des salles : elles entrent dans la file de révision.';
  const tentees = Object.keys(S.premier).length;
  const sues = Object.values(S.premier).filter(Boolean).length;
  const total = questionsRejouables().length + VIVA.length;
  $('#maitrise').textContent = tentees
    ? sues + ' sur ' + tentees + ' su' + (sues>1?'es':'') + ' du premier coup, sur ' + total + ' questions au total.'
      + (tentees < total ? " Il en reste " + (total - tentees) + " que tu n'as pas encore vues." : '')
    : "Aucune question tentée pour l'instant. Ce compteur dira ce que tu savais du premier coup, pas ce que tu as fini par trouver.";

  const bref = $('#srsBref'), tout = $('#srsBtn');
  tout.disabled = dues === 0;
  tout.textContent = dues ? 'tout revoir (' + dues + ')' : 'réviser';
  // Une session courte est proposée dès qu'il y a de quoi en faire une : c'est
  // ce qui rend la révision faisable entre deux exercices, sur le téléphone.
  bref.classList.toggle('hidden', dues < 8);
  bref.textContent = '5 minutes (7)';
}

/* ==========================================================================
   4. OUVERTURE ET PROGRESSION D'UNE SALLE
   ========================================================================== */
let COURANTE = null;

function ouvrirSalle(idx){
  const r = ROOMS[idx];
  COURANTE = { r, idx, faites:0, total:nTaches(r), aides:0 };
  vueAccueil.classList.add('hidden'); vueSalle.classList.remove('hidden');
  window.scrollTo(0,0);
  teteSalle.innerHTML =
    '<div class="l1"><button class="back" id="retour" aria-label="Retour à la liste des salles">&larr; ls ..</button>'+
    '<h1>'+r.title+'</h1></div>'+
    '<div class="l2"><div class="bits" id="bitsSalle" role="img"></div>'+
    '<span class="count" id="compteSalle"></span></div>';
  $('#retour').onclick = retourAccueil;
  corpsSalle.innerHTML = '';
  r.steps.forEach((s,i) => { const el = construireEtape(r,s,i); if(el) corpsSalle.appendChild(el); });
  peindreTeteSalle();
}
function peindreTeteSalle(){
  const b = $('#bitsSalle'); if(!b) return;
  b.innerHTML='';
  bitsDe(COURANTE.faites/COURANTE.total).split('').forEach(c => {
    const s=document.createElement('span'); s.textContent=c; if(c!=='-') s.className='on'; b.appendChild(s);
  });
  b.setAttribute('aria-label','progression : '+COURANTE.faites+' tâches sur '+COURANTE.total);
  $('#compteSalle').textContent = COURANTE.faites+' / '+COURANTE.total +
    (COURANTE.aides ? ' · '+COURANTE.aides+' avec aide' : '');
}
function tacheFinie(avecAide){
  COURANTE.faites++;
  if(avecAide) COURANTE.aides++;
  peindreTeteSalle();
  if(COURANTE.r.id === '__revision'){
    if(COURANTE.faites >= COURANTE.total) corpsSalle.appendChild(finRevision());
    return;
  }
  const st = S.rooms[COURANTE.r.id] || {done:0, cleared:false};
  st.done = Math.max(st.done, COURANTE.faites);
  if(COURANTE.faites >= COURANTE.total) st.cleared = true;
  S.rooms[COURANTE.r.id] = st;
  save();
  if(COURANTE.faites >= COURANTE.total) corpsSalle.appendChild(finSalle());
}
function finSalle(){
  const d = document.createElement('div'); d.className='end';
  const suivante = COURANTE.idx+1 < ROOMS.length ? ROOMS[COURANTE.idx+1] : null;
  d.innerHTML = '<div class="t">salle validée — '+COURANTE.r.file+'</div>'+
    '<div class="s">'+(COURANTE.aides
      ? COURANTE.aides+' tâche'+(COURANTE.aides>1?'s':'')+' avec aide : '+
        (COURANTE.aides>1?'elles retournent':'elle retourne')+' en boîte 0, donc '+
        (COURANTE.aides>1?'elles reviennent':'elle revient')+' dès la prochaine révision.'
      : 'Sans aucun indice. Ces questions reviendront plus tard, quand tu risqueras de les avoir oubliées.')+
    '</div><div class="s" style="margin-top:8px">Tu sais la faire. Saurais-tu l\'expliquer sans écran ?</div>'+
    '<div class="row"></div>';
  const row = d.querySelector('.row');
  const refaire = document.createElement('button');
  refaire.className='btn ghost'; refaire.textContent='refaire';
  refaire.onclick = () => ouvrirSalle(COURANTE.idx);
  row.appendChild(refaire);
  const suite = document.createElement('button'); suite.className='btn';
  if(suivante){ suite.textContent='suivante : '+suivante.file; suite.onclick=()=>ouvrirSalle(COURANTE.idx+1); }
  else { suite.textContent='retour au menu'; suite.onclick=retourAccueil; }
  row.appendChild(suite);
  peindreAccueil();
  setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'center'}),60);
  return d;
}
function finRevision(){
  const d=document.createElement('div'); d.className='end';
  d.innerHTML='<div class="t">révision terminée</div>'+
    '<div class="s">Les ratées reviennent demain, les autres s\'espacent.</div><div class="row"></div>';
  const b=document.createElement('button'); b.className='btn'; b.textContent='retour au menu';
  b.onclick=retourAccueil; d.querySelector('.row').appendChild(b);
  peindreAccueil();
  setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'center'}),60);
  return d;
}
function retourAccueil(){
  vueSalle.classList.add('hidden'); vueAccueil.classList.remove('hidden');
  peindreAccueil(); window.scrollTo(0,0);
}

/* ==========================================================================
   5. CONSTRUCTION DES ÉTAPES
   ========================================================================== */
function construireEtape(r, s, i){
  const id = r.id+'.'+i;
  switch(s.k){
    case 'lesson':  return blocLecon(s);
    case 'predict': return blocChoix(s, id, 'DEVINE, PUIS VÉRIFIE', 'devine');
    case 'mcq':     return blocChoix(s, id, 'QUESTION', 'note');
    case 'bug':     return blocDiagnostic(s, id);
    case 'input':   return blocSaisie(s, id);
    case 'answer':  return blocOral(s, id);
    case 'term':    return MODE_SHELL ? blocMission(s, id) : null;
    case 'code':    return MODE_C ? blocCode(s, id) : null;
    case 'bits':    return MODE_SHELL ? blocWidget(s, widgetBits) : null;
    case 'inode':   return MODE_SHELL ? blocWidget(s, widgetInode) : null;
    case 'ascii':   return MODE_C ? blocWidget(s, widgetAscii) : null;
    case 'mem':     return MODE_C ? blocWidget(s, widgetMemoire) : null;
    case 'viva':    return blocViva();
    default:        return null;
  }
}

function blocLecon(s){
  const w=document.createElement('div'); w.className='step notion';
  w.innerHTML='<h2>'+s.h+'</h2>'+s.b;
  return w;
}
function blocWidget(s, fabrique){
  const w=document.createElement('div'); w.className='step acte';
  w.innerHTML='<h2>'+s.h+'</h2><p class="intro">'+s.b+'</p>';
  w.appendChild(fabrique());
  return w;
}

function blocChoix(s, id, titre, ton){
  const w=document.createElement('div'); w.className='step acte';
  const c=w;
  // La pastille ne subsiste que pour la prédiction, où elle change la consigne :
  // on devine avant de savoir. Une question ordinaire n'a pas besoin qu'on lui
  // écrive « question » au-dessus.
  c.insertAdjacentHTML('beforeend',
    (ton==='devine' ? pastille('DEVINE AVANT DE SAVOIR') : '') + '<div class="q">'+s.q+'</div>');
  const o=document.createElement('div'); o.className='opts'; o.setAttribute('role','group');
  const v=elVerdict();
  s.opts.forEach((t,oi)=>{
    const b=document.createElement('button'); b.className='opt'; b.type='button';
    b.innerHTML='<span class="k" aria-hidden="true">'+'ABCDEF'[oi]+'</span><span>'+t+'</span>';
    b.onclick=()=>{
      o.querySelectorAll('.opt').forEach(x=>x.disabled=true);
      const ok = oi===s.a;
      b.classList.add(ok?'right':'wrong');
      if(!ok) o.children[s.a].classList.add('right');
      poseVerdict(v, ok, undefined, undefined, s.why, ton);
      w.dataset.etat = ok ? 'fait' : 'rate';
      // Une réponse fausse n'est pas « avec aide » : seul un indice demandé
      // compte comme de l'aide. Se tromper fait partie du travail.
      srsAdd(id, ok, false);
      tacheFinie(false);
    };
    o.appendChild(b);
  });
  c.appendChild(o); c.appendChild(v); return w;
}

/* « Trouve l'erreur » : on montre un travail plausible mais faux et on demande
   le diagnostic. C'est la compétence que la soutenance exige réellement, dans
   les deux sens : défendre son propre code, et corriger celui d'un camarade.
   Les erreurs viennent de celles que la suite de tests attrape déjà, donc de
   fautes réellement commises et non inventées pour l'exercice. */
function blocDiagnostic(s, id){
  const w=document.createElement('div'); w.className='step acte';
  const c=w;
  c.insertAdjacentHTML('beforeend', pastille("TROUVE L'ERREUR") +
    '<div class="q">'+s.contexte+'</div>'+
    '<pre class="faute" aria-label="le travail à diagnostiquer">'+echappe(s.code)+'</pre>'+
    '<div class="q" style="margin-top:12px">'+s.q+'</div>');
  const o=document.createElement('div'); o.className='opts'; o.setAttribute('role','group');
  const v=elVerdict();
  s.opts.forEach((t,oi)=>{
    const b=document.createElement('button'); b.className='opt'; b.type='button';
    b.innerHTML='<span class="k" aria-hidden="true">'+'ABCDEF'[oi]+'</span><span>'+t+'</span>';
    b.onclick=()=>{
      o.querySelectorAll('.opt').forEach(x=>x.disabled=true);
      const ok=oi===s.a;
      b.classList.add(ok?'right':'wrong');
      if(!ok) o.children[s.a].classList.add('right');
      poseVerdict(v, ok, undefined, undefined, s.why, 'note');
      w.dataset.etat = ok ? 'fait' : 'rate';
      srsAdd(id, ok, false);
      tacheFinie(false);
    };
    o.appendChild(b);
  });
  c.appendChild(o); c.appendChild(v); return w;
}

function blocSaisie(s, id){
  const w=document.createElement('div'); w.className='step acte';
  const c=w;
  c.insertAdjacentHTML('beforeend','<div class="q">'+s.q+'</div>');
  const row=document.createElement('div'); row.className='answer';
  const inp=document.createElement('input');
  inp.spellcheck=false; inp.autocomplete='off'; inp.autocapitalize='off';
  inp.setAttribute('aria-label','ta réponse');
  const go=document.createElement('button'); go.className='btn'; go.type='button'; go.textContent='valider';
  const v=elVerdict();
  const valider=()=>{
    if(go.disabled) return;
    const val=inp.value.trim().replace(/\s+/g,' ');
    go.disabled=true; inp.disabled=true;
    const ok = s.accept ? s.accept(val) : s.a.some(x=>x.toLowerCase()===val.toLowerCase());
    poseVerdict(v, ok, s.a[0], val, s.why, 'note');
    w.dataset.etat = ok ? 'fait' : 'rate';
    srsAdd(id, ok, false);
    tacheFinie(false);
  };
  go.onclick=valider;
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') valider(); });
  row.appendChild(inp); row.appendChild(go);
  c.appendChild(row); c.appendChild(v); return w;
}

/* Question orale. Elle entre désormais dans la file de révision : la note
   vient d'une soutenance, et ce qu'on n'a pas su dire doit revenir. */
function blocOral(s, id){
  const w=document.createElement('div'); w.className='step acte';
  const c=w;
  // Ici la pastille informe vraiment : elle change ce qu'on attend de toi,
  // répondre à voix haute et non dans sa tête.
  c.insertAdjacentHTML('beforeend', pastille('À VOIX HAUTE')+'<div class="q">'+s.q+'</div>');
  const btn=document.createElement('button'); btn.className='btn ghost'; btn.type='button';
  btn.textContent='j\'ai répondu, montrer le modèle';
  const boite=document.createElement('div'); boite.className='answerbox hidden';
  boite.innerHTML='<div class="lab2">RÉPONSE MODÈLE</div>'+s.a;
  const row=document.createElement('div');
  row.style.cssText='display:flex;gap:8px;margin-top:10px;flex-wrap:wrap';
  btn.onclick=()=>{
    boite.classList.remove('hidden'); btn.classList.add('hidden');
    const oui=document.createElement('button'); oui.className='btn'; oui.type='button'; oui.textContent='je l\'ai dit';
    const non=document.createElement('button'); non.className='btn ghost'; non.type='button'; non.textContent='pas encore';
    oui.onclick=()=>{ row.innerHTML='<span style="color:var(--ok);font-size:.83rem">✓ acquis</span>';
      w.dataset.etat='fait'; srsAdd(id,true,false); tacheFinie(false); };
    non.onclick=()=>{ row.innerHTML='<span style="color:var(--amber2);font-size:.83rem">à retravailler, ça repasse aujourd\'hui</span>';
      w.dataset.etat='rate'; srsAdd(id,false,false); tacheFinie(false); };
    row.appendChild(oui); row.appendChild(non);
  };
  c.appendChild(btn); c.appendChild(boite); c.appendChild(row);
  return w;
}

/* ==========================================================================
   6. PANNEAUX « ATTENDU CONTRE OBTENU »
   ==========================================================================
   Chaque type de mission a son propre attendu : un mode de permissions, un
   contenu de fichier, une sortie de commande, ou une liste de conditions.
   Le panneau montre la CIBLE dès le départ, parce qu'elle est déjà dans
   l'énoncé, mais ne compare qu'après la première commande : sinon on peut
   tâtonner en regardant l'écart et arriver au résultat sans jamais faire le
   raisonnement, qui est toute la leçon. */

function modeLettres(m){
  let s='';
  for(let g=2;g>=0;g--){ const v=(m>>(g*3))&7;
    s += (v&4?'r':'-')+(v&2?'w':'-')+(v&1?'x':'-'); }
  return s;
}
const octalDe = m => [0,1,2].map(g=>(m>>((2-g)*3))&7).join('');
const ATTENTE = '<p class="attente">La comparaison s\'affichera après ta première commande. '+
                'Fais le raisonnement d\'abord.</p>';
const montre = t => t==='' ? '<span class="vide">(vide)</span>' : echappe(t);

function panneauPermissions(v, sh, aTente){
  const n = lookup(sh, v.cible);
  const veut = modeLettres(v.mode), a = n ? modeLettres(n.mode) : '---------';
  const ok = !!n && n.mode === v.mode;
  let h = '<div class="mgrid" role="img" aria-label="cible '+veut+', soit '+octalDe(v.mode)+
          ' en octal'+(aTente?' ; actuellement '+a+', soit '+(n?octalDe(n.mode):'inconnu'):'')+'">';
  h += '<span class="rl">CIBLE</span>';
  for(let g=0;g<3;g++){ h+='<span class="grp">';
    for(let i=0;i<3;i++) h+='<span class="cell want">'+veut[g*3+i]+'</span>';
    h+='</span>'; }
  h += '<span class="oct want">'+octalDe(v.mode)+'</span>';
  if(aTente){
    h += '<span class="rl">ACTUEL</span>';
    for(let g=0;g<3;g++){ h+='<span class="grp">';
      for(let i=0;i<3;i++){ const k=g*3+i;
        h+='<span class="cell '+(a[k]===veut[k]?'hit':'miss')+'">'+a[k]+'</span>'; }
      h+='</span>'; }
    h += '<span class="oct now'+(ok?' hit':'')+'">'+(n?octalDe(n.mode):'???')+'</span>';
  }
  h += '</div>' + (aTente?'':ATTENTE);
  const ecarts = [...a].filter((c,i)=>c!==veut[i]).length;
  return { html:h, ok, resume: aTente ? (ok?'conforme':'écart sur '+ecarts+' position(s)') : 'en attente' };
}

function panneauTexte(v, obtenu, aTente, libelle){
  const ok = obtenu === v.attendu;
  let h = '<div class="txtcmp"><span class="k">'+libelle+'</span>'+
          '<pre class="want">'+montre(v.attendu)+'</pre>';
  if(aTente) h += '<span class="k">OBTENU</span><pre class="'+(ok?'hit':'miss')+'">'+montre(obtenu)+'</pre>';
  h += '</div>' + (aTente?'':ATTENTE);
  return { html:h, ok, resume: aTente ? (ok?'conforme':'différent') : 'en attente' };
}

function panneauCriteres(v, sh, hist, aTente){
  const res = v.criteres.map(c => ({ label:c.label, interdit:!!c.interdit, ok:!!c.test(sh,hist) }));
  const remplis = res.filter(c => c.interdit ? !c.ok : c.ok).length;
  const h = '<ul class="crit">' + res.map(c => {
    // Un critère « interdit » est rempli tant qu'il n'est PAS déclenché :
    // c'est ainsi qu'on vérifie qu'une clé privée n'a jamais été affichée.
    const bon = c.interdit ? !c.ok : c.ok;
    const classe = !aTente ? 'todo' : (bon ? 'done' : (c.interdit ? 'rate' : 'todo'));
    const marque = !aTente ? '·' : (bon ? '✓' : (c.interdit ? '✗' : '·'));
    return '<li class="'+classe+'"><span class="m" aria-hidden="true">'+marque+'</span><span>'+c.label+'</span></li>';
  }).join('') + '</ul>' + (aTente?'':ATTENTE);
  return { html:h, ok: remplis===res.length,
           resume: aTente ? remplis+' / '+res.length : 'en attente' };
}

/* ==========================================================================
   7. MISSION DANS LE TERMINAL
   ========================================================================== */
function blocMission(s, id){
  const w=document.createElement('div'); w.className='step acte mission';
  const c=w;
  c.insertAdjacentHTML('beforeend', pastille('MISSION') +
    '<div class="goal">'+(s.goalHtml || s.goal)+'</div><div class="brief">'+s.brief+'</div>');

  const sh = newShell(s.setup);
  const hist = [];
  let resolu=false, iIndice=0, aTente=false;

  const diff=document.createElement('div'); diff.className='diff';
  const dh=document.createElement('div'); dh.className='dh';
  dh.innerHTML='<span>ATTENDU CONTRE OBTENU</span><span class="etat">—</span>';
  const db=document.createElement('div'); db.className='db';
  diff.appendChild(dh); diff.appendChild(db);

  function rafraichir(){
    /* Repli : une mission sans descripteur `verif` retombe sur un critère
       unique adossé à son `check`. Ça reste un vrai retour, pas un booléen
       muet, et ça permet d'écrire les descripteurs module par module sans
       casser ceux qui n'en ont pas encore. */
    const v = s.verif || { type:'criteres',
      criteres:[{ label: s.goal || 'objectif atteint', test:(sh,h)=>!!s.check(sh,h) }] };
    let p;
    if(v.type==='permissions') p = panneauPermissions(v, sh, aTente);
    else if(v.type==='contenu'){
      const n = lookup(sh, v.fichier);
      p = panneauTexte(v, n && n.type==='file' ? n.content : '', aTente, 'CONTENU ATTENDU');
    }
    else if(v.type==='sortie'){
      const derniere = [...hist].reverse().find(h => v.filtre ? v.filtre.test(h) : true);
      let obtenu='';
      if(derniere){ const r = run(newShellFrom(sh), derniere); obtenu = r.out !== undefined ? r.out : ''; }
      p = panneauTexte(v, obtenu, aTente, 'SORTIE ATTENDUE');
    }
    else p = panneauCriteres(v, sh, hist, aTente);
    db.innerHTML = p.html;
    const et = dh.querySelector('.etat');
    et.textContent = p.resume;
    et.style.color = (aTente && p.ok) ? 'var(--ok)' : 'var(--mute)';
    return p.ok;
  }

  const term=document.createElement('div'); term.className='term';
  /* Chaque mission garde SON terminal : chacune a son propre setup, donc son
     propre système de fichiers de départ. Un terminal partagé devrait se
     réinitialiser entre les missions ou mélanger les états, ce qui serait
     plus déroutant que répétitif. L'en-tête sert à les distinguer. */
  // La barre du terminal affiche ce qu'affiche un vrai terminal : où l'on est.
  // Elle répétait « MISSION », déjà écrit juste au-dessus.
  const titre=document.createElement('div'); titre.className='termtitre';
  titre.innerHTML='<span class="pwd">student@campus:~/'+(s.dossier||'travail')+'</span>'+
                  '<span>simulateur</span>';
  const out=document.createElement('div'); out.className='termout';
  out.setAttribute('role','log'); out.setAttribute('aria-live','polite');
  const ligne=document.createElement('div'); ligne.className='termline';
  ligne.innerHTML='<span class="p" aria-hidden="true">%&gt;</span>';
  const inp=document.createElement('input');
  inp.spellcheck=false; inp.autocomplete='off'; inp.autocapitalize='off'; inp.autocorrect='off';
  inp.setAttribute('aria-label','commande à exécuter');
  ligne.appendChild(inp);
  const barre=document.createElement('div'); barre.className='termbar';
  const zoneIndices=document.createElement('div');

  const ecris=(html,cls)=>{ const d=document.createElement('div'); if(cls) d.className=cls;
    d.innerHTML=html; out.appendChild(d); out.scrollTop=out.scrollHeight; };

  let curseur=-1;
  function lance(cmd){
    if(!cmd || resolu) return;
    ecris('<span class="cmd"><span class="p">%&gt;</span> '+echappe(cmd)+'</span>');
    hist.push(cmd); curseur=hist.length; aTente=true;
    const r=run(sh,cmd);
    if(r && r.err) ecris(echappe(r.err),'err');
    else if(r && r.out) ecris(echappe(r.out).replace(/\n$/,''));
    if(rafraichir()){
      resolu=true; inp.disabled=true; bIndice.disabled=true;
      ecris('<span class="sys">✓ objectif atteint.</span>');
      if(s.post){ const p=document.createElement('div'); p.className='hint'; p.innerHTML=s.post; zoneIndices.appendChild(p); }
      // La mission entre dans la file de révision comme les questions. Résolue
      // avec un indice, elle retombe en boîte 0 et revient dès demain : c'est
      // ce qui donne un sens réel au marquage « avec aide », au lieu d'un
      // simple affichage qui n'agirait sur rien.
      if(id) srsAdd(id, true, iIndice>0);
      w.dataset.etat='fait';
      tacheFinie(iIndice>0);
    }
  }
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ const v=inp.value.trim(); inp.value=''; lance(v); return; }
    if(e.key==='ArrowUp'){ e.preventDefault(); if(curseur>0){ curseur--; inp.value=hist[curseur]; } return; }
    if(e.key==='ArrowDown'){ e.preventDefault();
      if(curseur<hist.length-1){ curseur++; inp.value=hist[curseur]; } else { curseur=hist.length; inp.value=''; } }
  });
  (s.raccourcis || ['ls -l','help']).forEach(cmd => {
    const b=document.createElement('button'); b.className='chip'; b.type='button'; b.textContent=cmd;
    b.onclick=()=>lance(cmd); barre.appendChild(b);
  });
  const bIndice=document.createElement('button'); bIndice.className='chip'; bIndice.type='button';
  bIndice.textContent='indice';
  bIndice.onclick=()=>{
    if(iIndice>=s.hints.length) return;
    const h=document.createElement('div'); h.className='hint';
    h.innerHTML='<span class="n">INDICE '+(iIndice+1)+' SUR '+s.hints.length+'</span>'+s.hints[iIndice];
    zoneIndices.appendChild(h); iIndice++;
    if(iIndice>=s.hints.length){ bIndice.disabled=true; bIndice.textContent='plus d\'indice'; }
  };
  barre.appendChild(bIndice);

  term.appendChild(titre); term.appendChild(out); term.appendChild(ligne); term.appendChild(barre);
  c.appendChild(diff); c.appendChild(term); c.appendChild(zoneIndices);
  ecris('<span class="sys">Système de fichiers simulé. Tes commandes ont de vrais effets.</span>');
  rafraichir();
  return w;
}

/* ==========================================================================
   8. MISSION DE CODE C
   ==========================================================================
   Le retour cas par cas existait déjà et il est bon : on ne change que son
   apparence pour l'aligner sur le reste, pas ce qu'il fait. */
function blocCode(s, id){
  const w=document.createElement('div'); w.className='step acte mission';
  const c=w;
  c.insertAdjacentHTML('beforeend', pastille('MISSION') +
    '<div class="brief">'+s.brief+'</div><div class="sig">signature imposée : <b>'+echappe(s.sig)+'</b></div>');
  const ed=document.createElement('textarea');
  ed.className='code'; ed.spellcheck=false; ed.autocapitalize='off'; ed.autocomplete='off';
  ed.setAttribute('aria-label','ton code C');
  ed.value=s.start||'';
  ed.addEventListener('keydown',e=>{
    if(e.key==='Tab'){ e.preventDefault();
      const a=ed.selectionStart,b=ed.selectionEnd;
      ed.value=ed.value.slice(0,a)+'    '+ed.value.slice(b);
      ed.selectionStart=ed.selectionEnd=a+4; }
  });
  /* Prédire avant d'exécuter. Ce n'est pas une étape de plus : c'est un champ
     dans la mission, facultatif, qui se compare tout seul au premier cas de
     test. Écrire ce qu'on croit puis voir l'écart apprend davantage que
     relancer jusqu'à ce que ça passe. */
  const pred=document.createElement('div'); pred.className='pred';
  pred.innerHTML='<label for="p'+(s.sig||'').replace(/\W/g,'')+'">Avant de lancer, que va afficher <b>'+
    echappe(s.tests[0].label)+'</b> ?</label>';
  const predIn=document.createElement('input');
  predIn.type='text'; predIn.spellcheck=false; predIn.autocapitalize='off';
  predIn.id='p'+(s.sig||'').replace(/\W/g,'');
  predIn.placeholder='facultatif';
  const predOut=document.createElement('div'); predOut.className='predout';
  pred.appendChild(predIn); pred.appendChild(predOut);

  const barre=document.createElement('div'); barre.className='runbar';
  const lancer=document.createElement('button'); lancer.className='btn'; lancer.type='button';
  lancer.textContent='compiler et tester';
  const remettre=document.createElement('button'); remettre.className='btn ghost'; remettre.type='button';
  remettre.textContent='repartir de zéro';
  const bIndice=document.createElement('button'); bIndice.className='chip'; bIndice.type='button';
  bIndice.textContent='indice';
  barre.appendChild(lancer); barre.appendChild(remettre); barre.appendChild(bIndice);
  const res=document.createElement('div'); res.style.marginTop='11px';
  const zoneIndices=document.createElement('div');
  let resolu=false, iIndice=0;

  remettre.onclick=()=>{ if(resolu) return; ed.value=s.start||''; res.innerHTML=''; };
  bIndice.onclick=()=>{
    if(iIndice>=s.hints.length) return;
    const h=document.createElement('div'); h.className='hint';
    h.innerHTML='<span class="n">INDICE '+(iIndice+1)+' SUR '+s.hints.length+'</span>'+s.hints[iIndice];
    zoneIndices.appendChild(h); iIndice++;
    if(iIndice>=s.hints.length){ bIndice.disabled=true; bIndice.textContent='plus d\'indice'; }
  };
  lancer.onclick=()=>{
    if(resolu) return;
    res.innerHTML='';
    // On confronte la prédiction au premier cas, une seule fois.
    if(predIn.value.trim() && !predIn.disabled){
      const attendu=s.tests[0].expect;
      const r0=runC(ed.value, s.tests[0].harness, {entry:'main'});
      const obtenu=r0.ok ? r0.out : null;
      const vu=predIn.value.trim().replace(/^["']|["']$/g,'');
      predIn.disabled=true;
      predOut.className='predout ' + (vu===obtenu ? 'juste' : 'ecart');
      predOut.textContent = obtenu===null
        ? "ton code n'a pas pu tourner, donc rien à comparer pour l'instant."
        : vu===obtenu
          ? 'tu avais vu juste : ' + JSON.stringify(obtenu)
          : 'tu prévoyais ' + JSON.stringify(vu) + ', ton code produit ' + JSON.stringify(obtenu) +
            ". C'est cet écart qui t'apprend quelque chose.";
    }
    let tout=true, arret=false;
    for(const tc of s.tests){
      const r=runC(ed.value, tc.harness, {entry:'main'});
      const d=document.createElement('div');
      if(!r.ok){
        tout=false; arret=true; d.className='tcase ko';
        d.innerHTML='<span class="lbl">✗ '+echappe(tc.label)+'</span><span class="d">erreur : '+echappe(r.err)+'</span>';
      } else if(r.out===tc.expect){
        d.className='tcase ok';
        d.innerHTML='<span class="lbl">✓ '+echappe(tc.label)+'</span><span class="d">sortie : '+echappe(JSON.stringify(r.out))+'</span>';
      } else {
        tout=false; d.className='tcase ko';
        d.innerHTML='<span class="lbl">✗ '+echappe(tc.label)+'</span>'+
          '<span class="d">attendu '+echappe(JSON.stringify(tc.expect))+' · obtenu '+echappe(JSON.stringify(r.out))+'</span>';
      }
      res.appendChild(d);
      if(arret) break;
    }
    if(tout){
      resolu=true; lancer.disabled=true; ed.readOnly=true; bIndice.disabled=true;
      const ok=document.createElement('div');
      ok.style.cssText='color:var(--ok);font-size:.85rem;margin-top:6px;font-weight:700';
      ok.textContent='✓ tous les cas passent.';
      res.appendChild(ok);
      if(s.post){ const p=document.createElement('div'); p.className='hint'; p.innerHTML=s.post; zoneIndices.appendChild(p); }
      if(id) srsAdd(id, true, iIndice>0);
      w.dataset.etat='fait';
      tacheFinie(iIndice>0);
    }
  };
  c.appendChild(ed); c.appendChild(pred); c.appendChild(barre); c.appendChild(res); c.appendChild(zoneIndices);
  return w;
}

/* ==========================================================================
   9. SOUTENANCE BLANCHE
   ========================================================================== */
function blocViva(){
  const w=document.createElement('div'); w.className='step';
  const carte=document.createElement('div'); carte.className='box';
  w.appendChild(carte);
  let i=0, bons=0;
  function montrer(){
    if(i>=VIVA.length){
      // Un seuil unique pour le message et pour la validation : les deux
      // divergeaient (8 annoncé, 7 appliqué) dans la version précédente.
      const seuil=Math.ceil(VIVA.length*0.8);
      carte.innerHTML='<h2>Fin de la soutenance blanche</h2>'+
        '<p style="font-size:.9rem">Score honnête : <b>'+bons+' / '+VIVA.length+'</b>.</p>'+
        '<p style="font-size:.88rem;color:var(--dim);margin-top:8px">'+
        (bons>=seuil ? 'Tu peux aller te faire corriger par un humain. C\'est la seule vraie répétition.'
                     : 'Reprends les salles correspondant à ce que tu n\'as pas su dire, puis reviens.')+'</p>';
      // L'identifiant est déduit de la dernière salle, jamais écrit en dur :
      // la version précédente écrivait 'r10' sur les quatre pages, or il
      // n'existe que dans shell00, et la salle ne se validait donc jamais
      // ailleurs pendant que le hub comptait une salle fantôme.
      const idBoss=ROOMS[ROOMS.length-1].id;
      const st=S.rooms[idBoss]||{done:0,cleared:false};
      st.done=1; st.cleared=bons>=seuil; S.rooms[idBoss]=st; save(); peindreAccueil();
      return;
    }
    const q=VIVA[i];
    carte.innerHTML=pastille('QUESTION '+(i+1)+' / '+VIVA.length, true);
    carte.insertAdjacentHTML('beforeend','<div class="q">'+q.q+'</div>'+
      '<p style="font-size:.8rem;color:var(--mute)">À voix haute, en entier, avant de révéler.</p>');
    const rev=document.createElement('button'); rev.className='btn ghost'; rev.type='button'; rev.textContent='révéler';
    const boite=document.createElement('div'); boite.className='answerbox hidden';
    boite.innerHTML='<div class="lab2">CE QU\'UN CORRECTEUR ATTEND</div>'+q.a;
    const row=document.createElement('div');
    row.style.cssText='display:flex;gap:8px;margin-top:11px;flex-wrap:wrap';
    rev.onclick=()=>{
      boite.classList.remove('hidden'); rev.classList.add('hidden');
      const oui=document.createElement('button'); oui.className='btn'; oui.type='button'; oui.textContent='j\'avais dit ça';
      const non=document.createElement('button'); non.className='btn ghost'; non.type='button'; non.textContent='pas encore';
      // Les réponses orales entrent dans la révision, comme les autres.
      oui.onclick=()=>{ bons++; srsAdd('viva.'+i,true,false); i++; montrer(); };
      non.onclick=()=>{ srsAdd('viva.'+i,false,false); i++; montrer(); };
      row.appendChild(oui); row.appendChild(non);
    };
    carte.appendChild(rev); carte.appendChild(boite); carte.appendChild(row);
  }
  montrer();
  return w;
}

/* ==========================================================================
   10. RÉVISION ESPACÉE
   ========================================================================== */
/* La révision ne se déclenche jamais toute seule et ne déverse jamais tout
   d'un coup : on choisit le moment ET la taille. Une file de trente questions
   qui tombe d'un bloc décourage, et on la repousse au lieu de la faire. */
function lancerRevision(taille){
  const dues=new Set(srsDues());
  const pioche=questionsRejouables().filter(q=>dues.has(q.id));
  // Les questions de soutenance dues, retrouvées par leur index.
  VIVA.forEach((q,i)=>{ if(dues.has('viva.'+i)) pioche.push({id:'viva.'+i, step:{k:'answer',h:'À dire à voix haute',q:q.q,a:q.a}}); });
  if(!pioche.length) return;
  pioche.sort(()=>Math.random()-0.5);
  const total=pioche.length;
  if(taille && taille<total) pioche.length=taille;
  vueAccueil.classList.add('hidden'); vueSalle.classList.remove('hidden'); window.scrollTo(0,0);
  COURANTE={ r:{id:'__revision'}, idx:-1, faites:0, total:pioche.length, aides:0 };
  teteSalle.innerHTML=
    '<div class="l1"><button class="back" id="retour">&larr; ls ..</button><h1>Révision</h1></div>'+
    '<div class="l2"><div class="bits" id="bitsSalle" role="img"></div><span class="count" id="compteSalle"></span></div>';
  $('#retour').onclick=retourAccueil;
  corpsSalle.innerHTML='';
  corpsSalle.insertAdjacentHTML('beforeend',
    '<p style="font-size:.85rem;color:var(--dim);margin-top:12px">Mélangées entre les salles, exprès : '+
    'réviser un thème d\'affilée donne l\'illusion de savoir.</p>');
  pioche.forEach(q=>{
    const el = q.step.k==='answer' ? blocOral(q.step,q.id)
             : q.step.k==='input'  ? blocSaisie(q.step,q.id)
             : q.step.k==='term'   ? blocMission(q.step,q.id)
             : q.step.k==='code'   ? blocCode(q.step,q.id)
             : q.step.k==='bug'    ? blocDiagnostic(q.step,q.id)
             : blocChoix(q.step,q.id,'QUESTION','note');
    corpsSalle.appendChild(el);
  });
  peindreTeteSalle();
}

/* ==========================================================================
   11. SAUVEGARDE MANUELLE
   ==========================================================================
   Format inchangé : {x, r, s, k, l}. Les xp et la série n'existent plus, mais
   les clés restent écrites et relues pour qu'un code enregistré avant ce
   changement reste lisible, et qu'un code produit maintenant reste lisible
   par une version antérieure. L'étudiant garde ses codes hors de l'appli. */
function encoderEtat(){
  const json=JSON.stringify({x:0, r:S.rooms, s:S.srs, k:0, l:S.last, h:S.aide});
  return btoa(unescape(encodeURIComponent(json))).replace(/=+$/,'');
}
function decoderEtat(code){
  const c=code.trim().replace(/\s+/g,'');
  const pad='='.repeat((4-c.length%4)%4);
  const o=JSON.parse(decodeURIComponent(escape(atob(c+pad))));
  if(typeof o.r!=='object' || o.r===null) throw new Error('structure inattendue');
  return { rooms:o.r||{}, srs:o.s||{}, aide:o.h||{}, last:o.l||null, viva:{} };
}

/* ==========================================================================
   12. DÉMARRAGE
   ========================================================================== */
function brancherAccueil(){
  $('#srsBtn').onclick=()=>lancerRevision(0);
  $('#srsBref').onclick=()=>lancerRevision(7);
  const zone=$('#ioZone'), texte=$('#ioTexte'), msg=$('#ioMsg');
  const ouvrir=mode=>{
    zone.classList.remove('hidden'); msg.textContent=''; msg.style.color='var(--dim)';
    $('#ioGo').classList.toggle('hidden', mode==='export');
    if(mode==='export'){
      texte.value=encoderEtat(); texte.select();
      if(navigator.clipboard) navigator.clipboard.writeText(texte.value)
        .then(()=>{ msg.textContent='copié — colle-le dans une note'; })
        .catch(()=>{ msg.textContent='sélectionne tout et copie à la main'; });
      else msg.textContent='sélectionne tout et copie à la main';
    } else { texte.value=''; texte.placeholder='colle ton code de sauvegarde ici'; texte.focus(); }
    zone.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  $('#expBtn').onclick=()=>ouvrir('export');
  $('#impBtn').onclick=()=>ouvrir('import');
  $('#ioFermer').onclick=()=>zone.classList.add('hidden');
  $('#ioGo').onclick=()=>{
    try{
      S=Object.assign(S, decoderEtat(texte.value)); save(); peindreAccueil();
      msg.textContent='progression restaurée'; msg.style.color='var(--ok)';
    }catch(e){
      msg.textContent='code illisible : '+(e.message||e); msg.style.color='var(--ko)';
    }
  };
}
(async function demarrer(){
  const sauve=await store.get();
  if(sauve) S=Object.assign(S, sauve);
  if(!S.aide) S.aide={};
  S.last=aujourdhui();
  brancherAccueil();
  peindreAccueil();
  save();
})();
