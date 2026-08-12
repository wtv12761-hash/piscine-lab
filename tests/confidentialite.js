/* Contrôle de confidentialité du dépôt.

   Ce dépôt est public. Aucune donnée personnelle ne doit y figurer :
   ni login 42, ni nom de campus, ni adresse de dépôt de rendu.

   Deux catégories de motifs, traitées différemment pour une raison précise :

   - MOTIFS_GENERIQUES : des noms d'infrastructure de l'école. Ils ne
     désignent personne, on peut donc les écrire en clair ici.

   - EMPREINTES_PRIVEES : les identifiants qui désignent réellement une
     personne. Les écrire en clair dans ce fichier reviendrait à les publier
     pour les interdire, ce qui est exactement le défaut que ce contrôle
     existe pour corriger. On stocke donc leur empreinte SHA-256. Le scanner
     découpe chaque fichier en jetons, hache chaque jeton, et compare.
     La détection reste exacte, et rien de lisible n'est publié.

   Pour surveiller un nouvel identifiant, ajouter son empreinte :
       node -e "console.log(require('crypto').createHash('sha256').update('LEJETON').digest('hex'))"
   Cette liste ne se réduit jamais, elle ne fait que s'allonger. */

const crypto = require('crypto');

const MOTIFS_GENERIQUES = [
  { nom: 'serveur de rendu', re: /vogsphere/i },
  { nom: 'identifiant intra', re: /intra-uuid/i },
  { nom: 'nom de machine du cluster', re: /\bc1r1[0-9]\b/i },
];

const EMPREINTES_PRIVEES = new Set([
  'cf904f80508780309ccdb0229710d97e43c329ffa55c136014739020db39d1a0',
  'c4c338e555d7c79c2d140825e974a5124af5714118858f724a8e71fb137af46e',
  '7500122a88f07ffb4a071456cecf8f51f972f57035e0fa205236c3d1b2df557b',
  // Jeton canari : sans valeur, il n'existe que pour que le test puisse
  // vérifier que la détection par empreinte fonctionne réellement, sans avoir
  // à écrire un vrai identifiant en clair pour s'en assurer.
  empreinteDe('canaridetectionconfidentialite'),
]);

function empreinteDe(jeton) {
  return crypto.createHash('sha256').update(jeton).digest('hex');
}

// Une adresse courante ne doit pas non plus traîner. `student@campus`, employé
// partout dans les pages, ne correspond pas : il n'a pas de domaine pointé.
const RE_COURRIEL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

const empreinte = empreinteDe;

/* Renvoie la liste des problèmes trouvés dans un texte. Liste vide = propre. */
function scanne(texte) {
  const trouves = [];
  for (const m of MOTIFS_GENERIQUES)
    if (m.re.test(texte)) trouves.push(m.nom);

  for (const jeton of new Set(texte.toLowerCase().match(/[a-z0-9]{4,}/g) || []))
    if (EMPREINTES_PRIVEES.has(empreinte(jeton)))
      trouves.push('identifiant personnel surveillé');

  const c = RE_COURRIEL.exec(texte);
  if (c) trouves.push('adresse de courriel : ' + c[0]);

  return [...new Set(trouves)];
}

/* Ce fichier-ci contient les motifs génériques en clair, par nécessité :
   il est celui qui les définit. C'est la seule exemption, et elle porte sur
   un fichier dont on peut vérifier le contenu à l'œil en trente secondes.
   Les identifiants réellement personnels n'y figurent pas, seulement leurs
   empreintes, donc l'exemption ne cache rien de sensible. */
const FICHIER_EXEMPTE = 'tests/confidentialite.js';

/* Tous les fichiers versionnables du dépôt, quel que soit leur type.
   C'est le point important : l'ancienne version n'inspectait qu'une liste
   écrite à la main, et le dossier tests/ n'y figurait pas. */
function fichiersDuDepot(racine) {
  const fs = require('fs'), path = require('path');
  const IGNORES = new Set(['.git', 'node_modules', 'shell00', 'shell01', 'C00', 'C01']);
  const out = [];
  (function marche(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORES.has(e.name)) continue;
      const abs = path.join(dir, e.name);
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) marche(abs, r);
      // les fichiers générés par extract.js ne sont pas versionnés
      else if (!/^_.*\.js$/.test(e.name) && r !== FICHIER_EXEMPTE) out.push(r);
    }
  })(racine, '');
  return out.sort();
}

module.exports = { scanne, fichiersDuDepot, FICHIER_EXEMPTE, MOTIFS_GENERIQUES, EMPREINTES_PRIVEES };
