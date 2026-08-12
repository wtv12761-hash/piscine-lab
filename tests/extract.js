/* Prépare les moteurs et le contenu pour les tests, depuis src/.

   Avant la bascule, ce script découpait les pages livrées, pour que les tests
   portent sur ce qui était réellement en ligne et jamais sur une copie
   périmée. Cette garantie est conservée, mais elle passe maintenant par un
   autre chemin : `tests/test_sources.js` vérifie que chaque page livrée est
   exactement ce que produit `node src/build.mjs`. Tester les sources revient
   donc à tester les pages, et le contenu n'existe plus qu'en un exemplaire.

   Usage : node tests/extract.js   (depuis la racine du dépôt) */
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', 'src');
const ici = __dirname;
const lis = f => fs.readFileSync(path.join(src, f), 'utf8');

fs.writeFileSync(path.join(ici, '_shell.js'),
  lis('moteur-shell.js') +
  '\nmodule.exports={newShell,run,lookup,readTarget,modeStr,sizeOf,nlink,fDir,fFile,fLink,newShellFrom,T0};\n');

fs.writeFileSync(path.join(ici, '_c.js'),
  lis('moteur-c.js') + '\nmodule.exports={runC,parse,lex,interpret};\n');

/* Le contenu shell se sert des constructeurs du moteur (fFile, fDir…) et de
   lookup dans ses vérifications : on les lui rend disponibles. */
const enTeteShell =
  "const E=require('./_shell.js');\n" +
  "const {newShell,run,lookup,readTarget,modeStr,sizeOf,fDir,fFile,fLink,newShellFrom,T0}=E;\n";

for (const [module_, moteur] of [['shell00', true], ['shell01', true], ['c00', false], ['c01', false]]) {
  const corps = lis('contenu-' + module_ + '.js');
  const exports_ = moteur
    ? 'module.exports={MODULE,ROOMS,VIVA,newShell,run,lookup,readTarget,fDir,fFile,fLink,newShellFrom,T0};\n'
    : 'module.exports={MODULE,ROOMS,VIVA};\n';
  fs.writeFileSync(path.join(ici, '_rooms_' + module_ + '.js'),
    (moteur ? enTeteShell : '') + corps + '\n' + exports_);
}

console.log('extraction ok : moteurs et contenu prêts depuis src/');
