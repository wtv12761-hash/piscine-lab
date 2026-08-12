/* Aucune donnée personnelle dans le dépôt.

   Ce test remplace l'ancien contrôle, qui n'inspectait qu'une liste de
   fichiers écrite à la main. Le dossier tests/ n'y figurait pas, et un login
   réel y est resté dans une fixture sans que rien ne le signale.
   Ici on parcourt TOUS les fichiers versionnés, sans liste à tenir à jour. */
const fs = require('fs'), path = require('path');
const { scanne, fichiersDuDepot, EMPREINTES_PRIVEES } = require('./confidentialite.js');
process.chdir(path.join(__dirname, '..'));

let pass = 0, fail = 0;
const t = (nom, cond) => {
  if (cond === true) { pass++; console.log('  ok   ' + nom); }
  else { fail++; console.log('  FAIL ' + nom + ' -> ' + cond); }
};

console.log('\n--- aucun fichier du dépôt ne contient de donnée personnelle ---');
const fichiers = fichiersDuDepot('.');
for (const f of fichiers) {
  const problemes = scanne(fs.readFileSync(f, 'utf8'));
  t(f, problemes.length === 0 || problemes.join(', '));
}

console.log('\n--- le scanner détecte bien ce qu\'il prétend détecter ---');
// Sans ces contrôles, une faute de frappe dans une empreinte rendrait le test
// vert en permanence tout en ne détectant plus rien. Un garde-fou muet est
// pire que pas de garde-fou : on lui fait confiance.
// Toutes les sondes sont assemblées à l'exécution. Écrites d'un seul tenant,
// elles seraient détectées dans ce fichier même, qui fait partie des fichiers
// scannés : le test qui vérifie la détection la déclencherait sur lui-même.
const CANARI  = 'canari' + 'detection' + 'confidentialite';
const SERVEUR = 'vogs' + 'phere';
const MACHINE = 'c1r' + '13';
const COURRIEL = 'moi@' + 'exemple' + '.com';

t('détecte un identifiant surveillé (via le jeton canari)',
  scanne('login: ' + CANARI).length > 0 || 'non détecté');
t('détecte le serveur de rendu',
  scanne('git clone ' + SERVEUR + '://x').length > 0 || 'non détecté');
t('détecte un nom de machine du cluster',
  scanne('depuis ' + MACHINE + ' hier').length > 0 || 'non détecté');
t('détecte une adresse de courriel',
  scanne('ecris a ' + COURRIEL).length > 0 || 'non détecté');
t('laisse passer student@campus',
  scanne('student@campus:~/shell00.lab %').length === 0 || 'faux positif');
t('laisse passer un texte anodin',
  scanne('echo OK > marque && cat -e marque').length === 0 || 'faux positif');
t('la liste d\'empreintes n\'est pas vide', EMPREINTES_PRIVEES.size > 0 || 'vide');
t('le dépôt a bien été parcouru', fichiers.length > 5 || fichiers.length);

console.log('\n=========================');
console.log(' pass ' + pass + '   fail ' + fail);
console.log('=========================');
process.exit(fail ? 1 : 0);
