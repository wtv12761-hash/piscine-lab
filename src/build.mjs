/* Construit les pages livrées à partir des sources.

   Une source, plusieurs pages. La couche applicative et le thème n'existent
   qu'en un exemplaire ; c'est la construction qui les recopie dans chaque
   page. La duplication reste dans le produit fini, où elle est nécessaire
   pour que chaque page s'ouvre seule hors ligne, mais elle disparaît du code
   qu'on maintient, qui est là où elle faisait des dégâts : la salle
   d'auto-évaluation écrivait un identifiant erroné sur trois pages sur quatre
   parce qu'il fallait penser à changer une ligne dans quatre fichiers.

   Usage :  node src/build.mjs           construit
            node src/build.mjs --verifie ne réécrit rien, signale les écarts
*/
import fs from 'node:fs';
import path from 'node:path';

const src = import.meta.dirname;
const racine = path.join(src, '..');
const lis = f => fs.readFileSync(path.join(src, f), 'utf8');

const MODULES = [
  { page:'shell00.html', contenu:'contenu-shell00.js', moteur:'moteur-shell.js',
    h1:"SHELL 00", pied:"Le simulateur exécute réellement tes commandes sur un système de fichiers en mémoire." },
  { page:'shell01.html', contenu:'contenu-shell01.js', moteur:'moteur-shell.js',
    h1:"SHELL 01", pied:"Le simulateur exécute réellement tes commandes sur un système de fichiers en mémoire." },
  { page:'c00.html', contenu:'contenu-c00.js', moteur:'moteur-c.js',
    h1:"C 00", pied:"L'interpréteur exécute réellement ton code. Ce n'est ni cc -Wall -Wextra -Werror, ni la norminette." },
  { page:'c01.html', contenu:'contenu-c01.js', moteur:'moteur-c.js',
    h1:"C 01", pied:"L'interpréteur exécute réellement ton code. Ce n'est ni cc -Wall -Wextra -Werror, ni la norminette." },
];

const gabarit = lis('gabarit.html');
const theme = lis('theme.css');
const app = lis('app.js');
const widgets = lis('widgets.js');

/* Remplacement par fonction et non par chaîne : dans une chaîne de
   remplacement, `$&` désigne le texte trouvé, et les moteurs en contiennent.
   Une page silencieusement corrompue en était sortie au premier essai.
   Le remplacement porte aussi sur TOUTES les occurrences : le marqueur de
   l'invite apparaît deux fois dans le gabarit, et un replace simple n'en
   traitait qu'une. */
const pose = (s, marque, valeur) => s.split('{{'+marque+'}}').join(valeur);

const verifieSeulement = process.argv.includes('--verifie');
let ecarts = 0;

for(const m of MODULES){
  const contenu = lis(m.contenu);
  const titre = /const MODULE=\{[^}]*titre:"((?:[^"\\]|\\.)*)"/.exec(contenu);
  const invite = /const MODULE=\{[^}]*invite:"((?:[^"\\]|\\.)*)"/.exec(contenu);
  if(!titre || !invite) throw new Error('MODULE incomplet dans src/'+m.contenu);

  let page = gabarit;
  page = pose(page,'TITRE', JSON.parse('"'+titre[1]+'"'));
  page = pose(page,'INVITE', JSON.parse('"'+invite[1]+'"'));
  page = pose(page,'H1', m.h1);
  page = pose(page,'PIED', m.pied);
  page = pose(page,'THEME', theme.trimEnd());
  page = pose(page,'MOTEUR', lis(m.moteur).trimEnd());
  page = pose(page,'WIDGETS', widgets.trimEnd());
  page = pose(page,'CONTENU', contenu.trimEnd());
  page = pose(page,'APP', app.trimEnd());

  if(page.includes('{{')) throw new Error('marqueur non remplacé dans '+m.page);

  /* La page produite doit s'exécuter. Sans ce contrôle, une construction
     cassée ne se découvre qu'en ouvrant le fichier, ce qui est exactement le
     travail manuel qu'on essaie de supprimer. */
  const js = page.slice(page.indexOf('<script>')+8, page.lastIndexOf('</script>'));
  try { new Function('window','document','navigator','history', js); }
  catch(e){ throw new Error('syntaxe invalide dans '+m.page+' : '+e.message); }

  if(/<script[^>]+src=|<link[^>]+href="http/i.test(page))
    throw new Error(m.page+' référence une ressource externe');

  const cible = path.join(racine, m.page);
  const actuelle = fs.existsSync(cible) ? fs.readFileSync(cible,'utf8') : null;
  if(verifieSeulement){
    if(actuelle !== page){ ecarts++; console.log('  ÉCART  '+m.page+' diffère de ses sources'); }
    else console.log('  ok     '+m.page);
  } else {
    if(actuelle === page) console.log('  inchangé  '+m.page);
    else { fs.writeFileSync(cible, page); console.log('  écrit     '+m.page+'  ('+page.length+' octets)'); }
  }
}

/* Le hub. Il ne partage pas la couche applicative des modules (il n'a ni
   salle ni moteur) mais il partage le thème, ce qui est l'essentiel : c'est
   là que la duplication faisait diverger l'apparence entre l'accueil et les
   pages de module. */
{
  let hub = lis('gabarit-hub.html');
  hub = pose(hub, 'THEME', theme.trimEnd());
  hub = pose(hub, 'HUB', lis('hub.js').trimEnd());
  if(hub.includes('{{')) throw new Error('marqueur non remplacé dans index.html');
  const js = hub.slice(hub.indexOf('<script>')+8, hub.lastIndexOf('</script>'));
  try { new Function('window','document','navigator', js); }
  catch(e){ throw new Error('syntaxe invalide dans index.html : '+e.message); }
  if(/<script[^>]+src=|<link[^>]+href="http/i.test(hub))
    throw new Error('index.html référence une ressource externe');
  const cible = path.join(racine, 'index.html');
  const actuelle = fs.existsSync(cible) ? fs.readFileSync(cible,'utf8') : null;
  if(verifieSeulement){
    if(actuelle !== hub){ ecarts++; console.log('  ÉCART  index.html diffère de ses sources'); }
    else console.log('  ok     index.html');
  } else {
    if(actuelle === hub) console.log('  inchangé  index.html');
    else { fs.writeFileSync(cible, hub); console.log('  écrit     index.html  ('+hub.length+' octets)'); }
  }
}

if(verifieSeulement && ecarts){
  console.log('\n'+ecarts+' page(s) ne correspondent plus à src/. Lance : node src/build.mjs');
  process.exit(1);
}
