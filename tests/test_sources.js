/* Les pages livrées sont-elles bien celles que produisent les sources ?

   C'est le contrôle qui rend la bascule vers src/ sûre. Sans lui, une
   correction faite directement dans une page serait perdue à la construction
   suivante, ou pire, une page publiée pourrait ne plus correspondre au code
   qu'on relit. Les tests portent sur src/ ; ce test relie src/ aux pages.

   Il applique aussi le raisonnement du canari : il vérifie qu'il détecterait
   réellement un écart, au lieu de se contenter de passer. */
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const racine = path.join(__dirname, '..');
process.chdir(racine);

let pass = 0, fail = 0;
const t = (nom, cond) => {
  if (cond === true) { pass++; console.log('  ok   ' + nom); }
  else { fail++; console.log('  FAIL ' + nom + ' -> ' + cond); }
};
const construit = args => {
  try { return { code: 0, out: execFileSync(process.execPath, ['src/build.mjs', ...args], { encoding: 'utf8' }) }; }
  catch (e) { return { code: e.status || 1, out: (e.stdout || '') + (e.stderr || '') }; }
};

console.log('\n--- les pages livrées correspondent à src/ ---');
const r = construit(['--verifie']);
t('node src/build.mjs --verifie ne signale aucun écart', r.code === 0 || r.out.trim().split('\n').slice(-3).join(' | '));
['shell00.html', 'shell01.html', 'c00.html', 'c01.html'].forEach(p =>
  t(p + ' est présente à la racine', fs.existsSync(path.join(racine, p)) || 'absente'));

console.log('\n--- la construction refuserait une page cassée ---');
// On abîme temporairement une source et on vérifie que la construction échoue
// au lieu d'écrire une page qui ne s'exécuterait pas. Une garde qui ne garde
// rien est pire qu'une garde absente : on lui fait confiance.
const chemin = path.join(racine, 'src', 'app.js');
const original = fs.readFileSync(chemin, 'utf8');
try {
  fs.writeFileSync(chemin, original + '\nfunction ( { syntaxe invalide\n');
  const casse = construit([]);
  t('une source non exécutable fait échouer la construction', casse.code !== 0 || 'construction acceptée');
  t('le message nomme le problème', /syntaxe invalide dans/.test(casse.out) || casse.out.slice(0, 120));
} finally {
  fs.writeFileSync(chemin, original);
}
// On reconstruit proprement pour ne pas laisser le dépôt dans un état douteux.
const remis = construit([]);
t('la reconstruction propre réussit', remis.code === 0 || remis.out.slice(0, 200));
t('et les pages correspondent de nouveau à src/', construit(['--verifie']).code === 0 || 'écart résiduel');

console.log('\n--- une page modifiée à la main est détectée ---');
const page = path.join(racine, 'shell00.html');
const avant = fs.readFileSync(page, 'utf8');
try {
  fs.writeFileSync(page, avant.replace('</body>', '<!-- retouche manuelle -->\n</body>'));
  t('une retouche directe dans une page est signalée', construit(['--verifie']).code !== 0 || 'non détectée');
} finally {
  fs.writeFileSync(page, avant);
}
t('le dépôt est laissé propre', construit(['--verifie']).code === 0 || 'écart laissé derrière');

console.log('\n=========================');
console.log(' pass ' + pass + '   fail ' + fail);
console.log('=========================');
process.exit(fail ? 1 : 0);
