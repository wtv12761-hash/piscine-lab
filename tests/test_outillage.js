/* Outillage du rendu : git, norminette, cc.
 *
 * Ces trois commandes ne servent pas à manipuler des fichiers, elles servent à
 * rendre. Chacune a un mode d'échec qui coûte des rendus entiers chaque
 * piscine, et la salle de révision existe pour les faire vivre plutôt que les
 * décrire :
 *
 *   git      un fichier écrit n'est pas ajouté, ajouté n'est pas commité,
 *            commité n'est pas poussé. Trois marches, trois façons de croire
 *            qu'on a rendu.
 *   norminette  un en-tête absent fait refuser un fichier au code parfait.
 *   cc       une fonction de projet seule ne peut pas se lier : il n'y a pas
 *            de main, et c'est normal. Confondre ça avec une erreur de code
 *            est le premier mur du C 00.
 *
 * Le moteur est extrait des pages livrées par tests/extract.js, donc ce qui est
 * testé ici est ce qui tourne réellement dans le navigateur.
 */
const E = require('./_shell.js');
const { newShell, run, fFile, readTarget } = E;

let pass = 0, fail = 0;
function t(name, fn) {
  try {
    const r = fn();
    if (r === true) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + '  -> ' + r); }
  } catch (e) { fail++; console.log('  ERR  ' + name + '  -> ' + e.message); }
}

const HEADER = '/* ' + '*'.repeat(74) + ' */';

/* Un fichier conforme : en-tête, tabulations, aucune ligne trop longue. */
const PROPRE = HEADER + '\n#include <unistd.h>\n\nvoid\tft_bip(char c)\n{\n\twrite(1, &c, 1);\n}\n';

function shell(fichiers) {
  return newShell(s => {
    for (const [nom, contenu] of Object.entries(fichiers || {})) {
      s.root.children[nom] = fFile(contenu);
    }
  });
}
const texte = r => ((r && r.out) || '') + ((r && r.err) || '');
const joue = (sh, ...cmds) => cmds.map(c => texte(run(sh, c))).join('');

// ----------------------------------------------------------------- git

console.log('git : les trois marches du rendu');

t('un fichier écrit apparaît comme non suivi', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  return /non suivis/i.test(joue(sh, 'git status')) || 'status ne signale pas le fichier non suivi';
});

t('commiter sans avoir ajouté est refusé', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git commit -m "essai"');
  return /rien à valider/i.test(out) || 'commit sans add aurait dû être refusé : ' + out.trim();
});

t('commiter sans message est refusé', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git add ft_bip.c', 'git commit');
  return /message/i.test(out) || 'commit sans -m aurait dû être refusé : ' + out.trim();
});

t('add puis commit passe', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git add ft_bip.c', 'git commit -m "ex00"');
  return /master/.test(out) && /ex00/.test(out) || 'le commit n a pas abouti : ' + out.trim();
});

t('ajouter un fichier qui n existe pas échoue', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git add ft_absent.c');
  return /ne correspond à aucun fichier/i.test(out) || 'add fantôme accepté : ' + out.trim();
});

t('git add . ajoute tout ce qui traîne', () => {
  const sh = shell({ 'a.c': PROPRE, 'b.c': PROPRE });
  const out = joue(sh, 'git add .', 'git commit -m "deux"');
  return /2 fichier/.test(out) || 'add . n a pas tout pris : ' + out.trim();
});

t('pousser sans commit ne prétend pas avoir poussé', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git push');
  return /up-to-date/i.test(out) || 'push à vide mal signalé : ' + out.trim();
});

t('ajouté mais pas commité : push le dit explicitement', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'git add ft_bip.c', 'git push');
  return /pas commités|pas commites/i.test(out) || "push n explique pas qu'il manque le commit : " + out.trim();
});

t('le cycle complet finit poussé', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  joue(sh, 'git add ft_bip.c', 'git commit -m "ex00"', 'git push');
  const out = joue(sh, 'git status');
  return /propre/i.test(out) || 'après push le dépôt devrait être propre : ' + out.trim();
});

t('git log distingue commité de poussé', () => {
  const sh = shell({ 'a.c': PROPRE, 'b.c': PROPRE });
  joue(sh, 'git add a.c', 'git commit -m "premier"', 'git push');
  joue(sh, 'git add b.c', 'git commit -m "second"');
  const out = joue(sh, 'git log');
  return /PAS ENCORE POUSSÉ/.test(out) && /\(poussé\)/.test(out)
    || 'log ne distingue pas les deux états : ' + out.trim();
});

t('git status annonce l avance sur origin', () => {
  const sh = shell({ 'a.c': PROPRE });
  joue(sh, 'git add a.c', 'git commit -m "x"');
  return /en avance/i.test(joue(sh, 'git status')) || 'status ne signale pas le commit non poussé';
});

t('le push ne nomme aucune infrastructure interne', () => {
  const sh = shell({ 'a.c': PROPRE });
  const out = joue(sh, 'git add a.c', 'git commit -m "x"', 'git push');
  /* Vérification positive : la seule destination citée doit être "origin".
     Écrire ici les noms interdits pour les chercher les publierait, puisque
     ce fichier fait partie du dépôt. C'est exactement le piège que
     test_confidentialite.js empêche, et il l'a attrapé au premier essai. */
  return (/To origin/.test(out) && !/[a-z0-9-]+\.(fr|ch|com)\b/i.test(out))
    || 'le push cite une destination autre que origin : ' + out.trim();
});

// ---------------------------------------------------------- norminette

console.log('');
console.log('norminette : ce qui fait refuser un fichier');

t('un fichier conforme passe', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  return /OK!/.test(joue(sh, 'norminette ft_bip.c')) || 'un fichier propre est refusé';
});

t('en-tête 42 manquant : refusé', () => {
  const sh = shell({ 'sans.c': '#include <unistd.h>\n\nvoid\tf(void)\n{\n}\n' });
  return /INVALID_HEADER/.test(joue(sh, 'norminette sans.c')) || "l'absence d'en-tête n'est pas détectée";
});

t('ligne de plus de 80 colonnes : refusée', () => {
  const sh = shell({ 'longue.c': HEADER + '\n' + '/* ' + 'x'.repeat(90) + ' */\n' });
  return /LINE_TOO_LONG/.test(joue(sh, 'norminette longue.c')) || 'ligne trop longue non détectée';
});

t('indentation aux espaces : refusée', () => {
  const sh = shell({ 'esp.c': HEADER + '\nvoid\tf(void)\n{\n    return ;\n}\n' });
  return /SPACE_REPLACE_TAB/.test(joue(sh, 'norminette esp.c')) || 'indentation aux espaces non détectée';
});

t('fins de ligne Windows : signalées', () => {
  const sh = shell({ 'crlf.c': HEADER + '\r\n#include <unistd.h>\r\n' });
  return /CRLF|chariot/i.test(joue(sh, 'norminette crlf.c')) || 'CRLF non détecté';
});

t('fichier absent : erreur claire', () => {
  const sh = shell({});
  return /No such file/.test(joue(sh, 'norminette absent.c')) || 'fichier absent mal signalé';
});

// ------------------------------------------------------------------ cc

console.log('');
console.log('cc : compiler pour tester');

t('une fonction de projet seule ne se lie pas', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'cc -Wall -Wextra -Werror ft_bip.c -o prog');
  return /undefined reference/.test(out) && /main/.test(out)
    || 'le défaut de main devrait être expliqué : ' + out.trim();
});

t('avec un main de test, la compilation aboutit', () => {
  const sh = shell({
    'ft_bip.c': PROPRE,
    'main.c': HEADER + '\nvoid\tft_bip(char c);\nint\tmain(void)\n{\n\tft_bip(65);\n\treturn (0);\n}\n',
  });
  const out = joue(sh, 'cc -Wall -Wextra -Werror ft_bip.c main.c -o prog');
  return !/undefined reference/.test(out) || 'la compilation aurait dû aboutir : ' + out.trim();
});

t('le binaire demandé est réellement créé', () => {
  const sh = shell({
    'ft_bip.c': PROPRE,
    'main.c': HEADER + '\nint\tmain(void)\n{\n\treturn (0);\n}\n',
  });
  joue(sh, 'cc -Wall -Wextra -Werror ft_bip.c main.c -o prog');
  return !!readTarget(sh, 'prog') || 'le fichier de sortie n a pas été créé';
});

t('les flags de la Moulinette manquants sont signalés', () => {
  const sh = shell({ 'main.c': HEADER + '\nint\tmain(void)\n{\n\treturn (0);\n}\n' });
  const out = joue(sh, 'cc main.c -o prog');
  return /-Wall/.test(out) && /-Werror/.test(out) || 'les flags manquants ne sont pas rappelés : ' + out.trim();
});

t('-c compile sans lier, donc sans main', () => {
  const sh = shell({ 'ft_bip.c': PROPRE });
  const out = joue(sh, 'cc -Wall -Wextra -Werror -c ft_bip.c');
  return !/undefined reference/.test(out) || '-c ne devrait pas exiger de main : ' + out.trim();
});

t('fichier source absent : erreur claire', () => {
  const sh = shell({});
  return /No such file/.test(joue(sh, 'cc -Wall -Wextra -Werror absent.c -o p')) || 'source absente mal signalée';
});

t('sans fichier source du tout : usage rappelé', () => {
  const sh = shell({});
  const out = joue(sh, 'cc -o prog');
  return /no input files/.test(out) || 'appel sans source mal signalé : ' + out.trim();
});

// ------------------------------------------- cohabitation des deux moteurs

console.log('');
console.log('deux moteurs dans une même page');

t('les moteurs shell et C ne partagent aucun symbole de premier niveau', () => {
  /* La page de révision charge les deux moteurs à la suite. Un nom déclaré
     des deux côtés se redéclarerait au même niveau et casserait la page
     silencieusement, sans que rien d'autre dans la suite ne le voie. */
  const fs = require('fs');
  const path = require('path');
  const racine = path.join(__dirname, '..', 'src');
  const sommet = f => {
    const s = fs.readFileSync(path.join(racine, f), 'utf8');
    const noms = new Set();
    for (const m of s.matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) noms.add(m[1]);
    return noms;
  };
  const a = sommet('moteur-shell.js'), b = sommet('moteur-c.js');
  const collisions = [...a].filter(n => b.has(n));
  return collisions.length === 0 || 'symboles déclarés dans les deux moteurs : ' + collisions.join(', ');
});

// ------------------------------------------ le hub compte juste ses salles

console.log('');
console.log('cohérence hub / contenu');

t('chaque module annonce dans le hub le nombre de salles qu il contient', () => {
  /* Le hub a déjà compté une salle fantôme : un identifiant déclaré d un côté
     et absent de l autre. Le nombre est écrit à la main dans hub.js, donc il
     dérive dès qu on ajoute ou retire une salle sans y penser. */
  const fs = require('fs');
  const path = require('path');
  const src = path.join(__dirname, '..', 'src');
  const hub = fs.readFileSync(path.join(src, 'hub.js'), 'utf8');
  const build = fs.readFileSync(path.join(src, 'build.mjs'), 'utf8');

  const declares = [...hub.matchAll(/page:'([^']+)'[^}]*?salles:(\d+)/g)].map(m => [m[1], +m[2]]);
  if (declares.length === 0) return 'aucun module lisible dans hub.js';
  const modules = [...build.matchAll(/page:'([^']+)',\s*contenu:'([^']+)'/g)];

  const ecarts = [];
  for (const [page, annonce] of declares) {
    const mod = modules.find(m => m[1] === page);
    if (!mod) { ecarts.push(page + ' absent de build.mjs'); continue; }
    const contenu = fs.readFileSync(path.join(src, mod[2]), 'utf8');
    const reel = (contenu.match(/^id:'[a-z0-9]+',/gm) || []).length;
    if (reel !== annonce) ecarts.push(`${page} : hub annonce ${annonce}, contenu en a ${reel}`);
  }
  return ecarts.length === 0 || ecarts.join(' ; ');
});

t('chaque module du build est listé dans le hub', () => {
  const fs = require('fs');
  const path = require('path');
  const src = path.join(__dirname, '..', 'src');
  const hub = fs.readFileSync(path.join(src, 'hub.js'), 'utf8');
  const manquants = require('./pages.js').MODULES.filter(p => !hub.includes("'" + p + "'"));
  return manquants.length === 0 || 'pages construites mais absentes du hub : ' + manquants.join(', ');
});

// ------------------------- chaque étape porte les champs que son rendu lit

console.log('');
console.log('contrat des étapes');

/* Une étape input écrite avec `attendu:` au lieu de `a:` a été livrée en
   production. Rien ne l'a vue : la page se construit, la syntaxe est valide,
   la suite reste verte, et l'étape casse seulement quand quelqu'un clique sur
   « valider », parce que le rendu fait `s.a.some(...)` sur un undefined.
   Ce contrôle relit chaque étape et vérifie qu'elle a de quoi être rendue. */
const CONTRAT = {
  lesson: ['b'],
  mcq: ['q', 'opts', 'a', 'why'],
  input: ['q', 'why'],       // plus `a` ou `accept`, vérifié à part
  answer: ['q'],
  bug: ['q', 'opts', 'a'],
  code: ['brief', 'sig', 'start', 'tests'],
  term: ['brief', 'check', 'verif'],
  viva: [],
  /* Widgets visuels rendus par widgets.js : ils portent leurs propres champs
     et n'ont pas de contrat commun avec les étapes interactives. */
  bits: [],
  inode: [],
  ascii: [],
  mem: [],
};

function chargeRooms(fichier) {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', fichier), 'utf8');
  // Les fonctions setup/check référencent des helpers du moteur ; elles ne
  // sont pas appelées ici, seulement déclarées, donc des souches suffisent.
  const f = new Function(
    'lookup', 'fFile', 'fDir', 'fLink', 'newShell', 'runC',
    src + '\nreturn {MODULE: typeof MODULE!=="undefined"?MODULE:null, ROOMS: typeof ROOMS!=="undefined"?ROOMS:[]};'
  );
  const stub = () => undefined;
  return f(stub, stub, stub, stub, stub, stub);
}

const CONTENUS = ['contenu-shell00.js', 'contenu-shell01.js', 'contenu-c00.js', 'contenu-c01.js', 'contenu-revision.js'];

for (const fichier of CONTENUS) {
  t(fichier + ' : chaque étape a les champs de son type', () => {
    let mod;
    try { mod = chargeRooms(fichier); }
    catch (e) { return 'illisible : ' + e.message; }

    const manques = [];
    for (const salle of mod.ROOMS) {
      for (const [i, s] of (salle.steps || []).entries()) {
        const requis = CONTRAT[s.k];
        if (requis === undefined) { manques.push(`${salle.id}[${i}] type inconnu « ${s.k} »`); continue; }
        for (const champ of requis) {
          if (s[champ] === undefined) manques.push(`${salle.id}[${i}] ${s.k} : champ « ${champ} » manquant`);
        }
        if (s.k === 'input' && s.a === undefined && typeof s.accept !== 'function') {
          manques.push(`${salle.id}[${i}] input : ni « a » ni « accept »`);
        }
        if (s.k === 'input' && s.a !== undefined && (!Array.isArray(s.a) || s.a.length === 0)) {
          manques.push(`${salle.id}[${i}] input : « a » doit être un tableau non vide`);
        }
        if (s.k === 'mcq' || s.k === 'bug') {
          if (!Array.isArray(s.opts) || s.opts.length < 2) manques.push(`${salle.id}[${i}] ${s.k} : moins de deux options`);
          else if (typeof s.a !== 'number' || s.a < 0 || s.a >= s.opts.length) manques.push(`${salle.id}[${i}] ${s.k} : index de réponse hors des options`);
        }
        if (s.k === 'code' && (!Array.isArray(s.tests) || s.tests.length === 0)) {
          manques.push(`${salle.id}[${i}] code : aucun test`);
        }
      }
    }
    return manques.length === 0 || manques.slice(0, 6).join(' ; ');
  });
}

// ------------------------------- sauvegarde de tous les modules, depuis le hub

console.log('');
console.log('sauvegarde globale du hub');

function apiSauvegarde(etats, modules) {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'hub.js'), 'utf8');
  const debut = src.indexOf('function encoderTout');
  const fin = src.indexOf('function brancherSauvegarde');
  if (debut < 0 || fin < 0 || fin <= debut) throw new Error('encoderTout/decoderTout introuvables dans hub.js');
  const f = new Function('lire', 'MODULES', 'btoa', 'atob', 'escape', 'unescape',
    src.slice(debut, fin) + '\nreturn {encoderTout, decoderTout};');
  return f(
    k => etats[k] || null, modules,
    s => Buffer.from(s, 'binary').toString('base64'),
    s => Buffer.from(s, 'base64').toString('binary'),
    global.escape, global.unescape
  );
}

const MODS = [{ cle: 'a_v1' }, { cle: 'b_v1' }, { cle: 'c_v1' }];
const ETATS = { a_v1: { rooms: { r1: { cleared: true } }, srs: {} }, b_v1: { rooms: { s1: { cleared: true } } } };

t('un code global se relit à l identique', () => {
  const api = apiSauvegarde(ETATS, MODS);
  const rt = api.decoderTout(api.encoderTout());
  return JSON.stringify(rt) === JSON.stringify(ETATS) || 'aller-retour altéré : ' + JSON.stringify(rt).slice(0, 120);
});

t('il ne contient que les modules qui ont une progression', () => {
  const api = apiSauvegarde(ETATS, MODS);
  const rt = api.decoderTout(api.encoderTout());
  return !('c_v1' in rt) || 'un module sans progression a été embarqué';
});

t('le code d un seul module est refusé avec un message utile', () => {
  /* Le format d'un module est {x,r,s,k,l,h}. Sans champ `t`, il n'y a aucun
     moyen de deviner à quel module il appartient : mieux vaut le dire que
     restaurer au hasard. */
  const api = apiSauvegarde(ETATS, MODS);
  const isole = Buffer.from(JSON.stringify({ x: 0, r: { r1: {} }, s: {} }), 'binary').toString('base64');
  try { api.decoderTout(isole); return 'accepté alors qu il vient d un seul module'; }
  catch (e) { return /un seul module/.test(e.message) || 'message peu clair : ' + e.message; }
});

t('un code illisible est refusé sans planter', () => {
  const api = apiSauvegarde(ETATS, MODS);
  for (const mauvais of ['', '   ', 'nimportequoi!!', 'YWJj']) {
    try { api.decoderTout(mauvais); return 'accepté : ' + JSON.stringify(mauvais); }
    catch (e) { if (!e.message) return 'erreur sans message pour ' + JSON.stringify(mauvais); }
  }
  return true;
});

t('le hub expose les commandes de sauvegarde dans sa page', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const manques = ['expTout', 'impTout', 'ioZone', 'ioTexte', 'ioGo', 'ioFermer', 'ioMsg']
    .filter(id => !html.includes('id="' + id + '"'));
  return manques.length === 0 || 'identifiants absents de index.html : ' + manques.join(', ');
});

console.log('');
console.log('=========================');
console.log(' pass ' + pass + '   fail ' + fail);
console.log('=========================');
process.exit(fail ? 1 : 0);
