/* Le hub : une entrée par module, et surtout un point de reprise.

   Il lit la progression de chaque module en lecture seule, dans le stockage du
   navigateur. Il n'écrit jamais : chaque module reste seul maître de son état.

   Le bouton « reprendre » existe parce que la racine du site servait
   auparavant directement Shell 00. Le raccourci du téléphone tombait donc dans
   les salles sans détour. Maintenant qu'il tombe sur le hub, il faut une tape
   de plus ; ce bouton la rend plus courte qu'avant dès qu'il y a plusieurs
   modules en cours, en menant directement là où le travail s'est arrêté. */

const MODULES = [
  { cle:'shell00lab_v1', page:'shell00.html', nom:'Shell 00', salles:10, facultatives:['r8','r9'],
    desc:"Redirection, permissions et octal, liens durs et symboliques, clés SSH, le manuel, git, diff et patch, find." },
  { cle:'shell01lab_v1', page:'shell01.html', nom:'Shell 01', salles:8, facultatives:['s7'],
    desc:"Pipes, filtres de texte, compter, variables d'environnement, guillemets et échappement, tri." },
  { cle:'c00lab_v1', page:'c00.html', nom:'C 00', salles:6, facultatives:['c4','c5'],
    desc:"write et l'adresse, le caractère comme nombre, boucles et conditions, boucles imbriquées, extraction de chiffres." },
  { cle:'c01lab_v1', page:'c01.html', nom:'C 01', salles:6, facultatives:[],
    desc:"Adresse et déréférencement, pointeurs multiples, paramètres de sortie, chaînes et zéro final, tableaux." },
  /* La révision n'est pas un module du cursus : elle couvre l'outillage du
     rendu et reprend les notions de Shell 00 et C 00. Elle est listée en
     dernier pour ne pas se confondre avec la progression. */
  { cle:'revisionlab_v1', page:'revision.html', nom:'Révision', salles:13, facultatives:[],
    desc:"Le jour de l'examen, l'outillage du rendu, les arguments de la ligne de commande, le contrat de sortie, et les familles d'exercices de l'exam 00." },
];

function lire(cle){
  try{ const v = window.localStorage && localStorage.getItem(cle); return v ? JSON.parse(v) : null; }
  catch(e){ return null; }
}
function bitsDe(fraction){
  const n = Math.round(Math.min(1, fraction) * 9);
  let s = '';
  for(let i=0;i<9;i++) s += i<n ? 'rwxrwxrwx'[i] : '-';
  return s;
}
const aujourdhui = () => new Date().toISOString().slice(0,10);

function peindre(){
  const corps = document.getElementById('lsbody');
  corps.innerHTML = '';
  let repriseCible = null, repriseTexte = '', totalDus = 0, totalFinies = 0, totalSalles = 0;

  MODULES.forEach(m => {
    const S = lire(m.cle);
    /* On ne compte que les salles obligatoires : le sujet lui-même s'arrête
       avant la fin et laisse le choix de continuer. Un module doit donc
       pouvoir être terminé sans les salles en plus. */
    const faites = S && S.rooms ? Object.keys(S.rooms).filter(k => S.rooms[k] && S.rooms[k].cleared) : [];
    const oblig = m.salles - m.facultatives.length;
    const finies = faites.filter(k => !m.facultatives.includes(k)).length;
    const extras = faites.filter(k => m.facultatives.includes(k)).length;
    const dus = S && S.srs
      ? Object.values(S.srs).filter(e => !e.due || e.due <= aujourdhui()).length : 0;
    totalDus += dus; totalFinies += Math.min(finies, oblig); totalSalles += oblig;

    const a = document.createElement('a');
    a.className = 'lsrow' + (finies >= oblig ? ' done' : (finies ? ' part' : ''));
    a.href = m.page;
    const etat = !S ? 'jamais ouvert ici'
      : finies >= oblig ? (extras ? 'terminé · ' + extras + ' en plus' : 'terminé')
      : finies + '/' + oblig + ' salles';
    a.innerHTML =
      '<span class="mode">' + (finies >= oblig ? '-rwxrwxrwx' : '-' + bitsDe(finies/oblig)) + '</span>' +
      '<span class="nm"><b>' + m.nom + '</b><span>' + m.desc + '</span></span>' +
      '<span class="badge">' + (finies >= oblig ? '✓' : etat.split(' ')[0]) + '</span>';
    a.setAttribute('aria-label', m.nom + ', ' + etat + (dus ? ', ' + dus + ' à revoir' : ''));
    corps.appendChild(a);

    // On reprend là où il reste du travail : le premier module entamé mais non
    // terminé, sinon le premier module non terminé.
    if(!repriseCible && S && finies > 0 && finies < oblig){
      repriseCible = m; repriseTexte = m.nom + ', ' + etat;
    }
  });
  if(!repriseCible){
    for(const m of MODULES){
      const S = lire(m.cle);
      const oblig = m.salles - m.facultatives.length;
      const finies = S && S.rooms ? Object.keys(S.rooms).filter(k => S.rooms[k] && S.rooms[k].cleared && !m.facultatives.includes(k)).length : 0;
      if(finies < oblig){ repriseCible = m; repriseTexte = m.nom + (finies ? ', ' + finies + '/' + oblig + ' salles' : ', pas encore commencé'); break; }
    }
  }

  const barre = document.getElementById('bitsTotal');
  barre.innerHTML = '';
  bitsDe(totalFinies/totalSalles).split('').forEach(c => {
    const s = document.createElement('span'); s.textContent = c;
    if(c !== '-') s.className = 'on'; barre.appendChild(s);
  });
  barre.setAttribute('aria-label', totalFinies + ' salles validées sur ' + totalSalles + ', tous modules confondus');
  document.getElementById('compteTotal').textContent = totalFinies + ' / ' + totalSalles + ' salles';

  const bouton = document.getElementById('reprendre');
  const soustitre = document.getElementById('reprendreS');
  if(repriseCible){
    bouton.href = repriseCible.page;
    bouton.textContent = 'reprendre';
    soustitre.textContent = repriseTexte + (totalDus ? ' · ' + totalDus + ' question' + (totalDus>1?'s':'') + ' à revoir' : '');
  } else {
    bouton.classList.add('hidden');
    soustitre.textContent = 'Tous les modules sont terminés. chmod 777.';
  }
  document.getElementById('reprendreT').textContent =
    repriseCible ? 'Reprendre où tu en étais' : 'Rien en cours';
}

/* ==========================================================================
   Sauvegarde de tous les modules en un seul code

   Chaque module sait déjà exporter le sien. Les transporter un par un veut
   dire quatre ou cinq codes à recopier sans en oublier un, et c'est la
   sauvegarde qu'on ne fait pas.

   Le hub lit la progression des modules et n'y touche pas, sauf ici : une
   restauration écrit, par définition. C'est la seule écriture du fichier, et
   elle n'a lieu que sur un clic explicite.

   Format : {v:2, t:{cle_du_module: état, ...}}. Le marqueur de version
   permet de reconnaître un code de module isolé, qui n'a pas de champ `t`,
   et de le refuser avec un message utile plutôt qu'une erreur d'analyse.
   ========================================================================== */
const ecrire = (cle, valeur) => {
  try { if (window.localStorage) localStorage.setItem(cle, JSON.stringify(valeur)); return true; }
  catch (e) { return false; }
};

function encoderTout(){
  const tout = {};
  for (const m of MODULES) {
    const etat = lire(m.cle);
    if (etat) tout[m.cle] = etat;
  }
  const json = JSON.stringify({ v: 2, t: tout });
  return btoa(unescape(encodeURIComponent(json))).replace(/=+$/, '');
}

function decoderTout(code){
  const c = code.trim().replace(/\s+/g, '');
  if (!c) throw new Error('code vide');
  const pad = '='.repeat((4 - c.length % 4) % 4);
  let o;
  try { o = JSON.parse(decodeURIComponent(escape(atob(c + pad)))); }
  catch (e) { throw new Error('ce n’est pas un code de sauvegarde'); }
  if (o && o.r && !o.t)
    throw new Error('ceci est le code d’un seul module. Colle-le dans la page de ce module, pas ici');
  if (!o || typeof o.t !== 'object' || o.t === null)
    throw new Error('structure inattendue');
  return o.t;
}

function brancherSauvegarde(){
  const zone = document.getElementById('ioZone');
  const texte = document.getElementById('ioTexte');
  const msg = document.getElementById('ioMsg');
  if (!zone || !texte || !msg) return;

  const ouvrir = mode => {
    zone.classList.remove('hidden');
    msg.textContent = ''; msg.style.color = 'var(--dim)';
    document.getElementById('ioGo').classList.toggle('hidden', mode === 'export');
    if (mode === 'export') {
      const connus = MODULES.filter(m => lire(m.cle)).length;
      if (connus === 0) {
        texte.value = '';
        msg.textContent = 'rien à sauvegarder pour le moment';
        return;
      }
      texte.value = encoderTout(); texte.select();
      const combien = connus + (connus > 1 ? ' modules' : ' module');
      if (navigator.clipboard) navigator.clipboard.writeText(texte.value)
        .then(() => { msg.textContent = 'copié, ' + combien + ' dedans'; })
        .catch(() => { msg.textContent = combien + ' dedans, sélectionne tout et copie à la main'; });
      else msg.textContent = combien + ' dedans, sélectionne tout et copie à la main';
    } else {
      texte.value = ''; texte.placeholder = 'colle ici le code de sauvegarde de tous les modules'; texte.focus();
    }
    zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  document.getElementById('expTout').onclick = () => ouvrir('export');
  document.getElementById('impTout').onclick = () => ouvrir('import');
  document.getElementById('ioFermer').onclick = () => zone.classList.add('hidden');
  document.getElementById('ioGo').onclick = () => {
    try {
      const tout = decoderTout(texte.value);
      const connus = new Set(MODULES.map(m => m.cle));
      let ecrits = 0, ignores = 0;
      for (const [cle, etat] of Object.entries(tout)) {
        // Un code peut venir d'une version qui avait d'autres modules. On
        // n'écrit que des clés qu'on connaît, plutôt que de déverser
        // n'importe quoi dans le stockage du navigateur.
        if (!connus.has(cle)) { ignores++; continue; }
        if (etat && typeof etat === 'object' && ecrire(cle, etat)) ecrits++;
      }
      if (ecrits === 0) throw new Error('aucun module reconnu dans ce code');
      peindre();
      msg.textContent = ecrits + (ecrits > 1 ? ' modules restaurés' : ' module restauré')
        + (ignores ? ', ' + ignores + ' inconnu(s) ignoré(s)' : '');
      msg.style.color = 'var(--ok)';
    } catch (e) {
      msg.textContent = e.message || String(e);
      msg.style.color = 'var(--ko)';
    }
  };
}

peindre();
brancherSauvegarde();
