/* Extrait des pages livrées ce qui doit devenir une source unique.

   On ne recopie rien à la main : les moteurs et le contenu des salles sont
   prélevés sur les pages actuellement en ligne, ce qui garantit que la
   bascule vers les sources ne change pas une virgule du contenu.

   Usage :  node src/extraire-contenu.mjs
   À lancer une seule fois, pour amorcer src/. Ensuite les sources font foi.
*/
import fs from 'node:fs';
import path from 'node:path';

const racine = path.join(import.meta.dirname, '..');
const lis = f => fs.readFileSync(path.join(racine, f), 'utf8');
const tranche = (s, a, b) => {
  const i = s.indexOf(a);
  const j = b ? s.indexOf(b, i) : s.length;
  if (i < 0 || j < 0 || j <= i) throw new Error('repère introuvable : ' + a);
  return s.slice(i, j).trimEnd();
};

const sortie = {};

// --- moteurs ---
const sh00 = lis('shell00.html');
sortie['moteur-shell.js'] =
  "/* Simulateur shell : système de fichiers en mémoire avec de vrais inodes.\n" +
  "   Extrait de shell00.html lors de la bascule vers les sources ; à partir\n" +
  "   d'ici c'est ce fichier qui fait foi, et les pages sont générées. */\n\n" +
  tranche(sh00, 'let INODE = 1000;', '/* ==========================================================================\n   2. CONTENU DES SALLES') +
  '\n\n' + tranche(sh00, 'function newShellFrom(sh){', 'const VIVA=[');

const c00 = lis('c00.html');
sortie['moteur-c.js'] =
  "/* Interpréteur C : lexer, parseur récursif descendant, évaluateur sur une\n" +
  "   mémoire plate. Extrait de c00.html lors de la bascule vers les sources. */\n\n" +
  tranche(c00, '/* ============================================================\n   Mini-C', 'const ROOMS=[');

// --- contenu par module ---
for (const [fichier, cle] of [['shell00.html', 'shell00'], ['shell01.html', 'shell01'],
                              ['c00.html', 'c00'], ['c01.html', 'c01']]) {
  const s = lis(fichier);
  const rooms = tranche(s, 'const ROOMS=[',
    fichier.startsWith('shell') ? '/* copie superficielle' : 'const VIVA=[');
  const viva = tranche(s, 'const VIVA=[', 'const KEY=');
  const K = /const KEY='([^']+)'/.exec(s)[1];
  const titre = /<title>([^<]*)<\/title>/.exec(s)[1];
  const invite = /<span class="u">student@campus<\/span>:([^%]*)%/.exec(s)[1].trim();
  sortie['contenu-' + cle + '.js'] =
    '/* Contenu pédagogique du module ' + cle + '.\n' +
    "   Les salles et les questions d'auto-évaluation, rien d'autre : ni moteur,\n" +
    '   ni rendu, ni style. */\n\n' +
    "const MODULE={cle:'" + K + "', titre:" + JSON.stringify(titre) +
    ", invite:" + JSON.stringify(invite) + "};\n\n" + rooms + '\n\n' + viva;
}

const dossier = import.meta.dirname;
for (const [nom, contenu] of Object.entries(sortie)) {
  fs.writeFileSync(path.join(dossier, nom), contenu + '\n');
  console.log('écrit src/' + nom.padEnd(20) + contenu.length + ' octets');
}
