/* Ajoute à chaque mission de Shell 01 son descripteur « attendu contre obtenu ».

   Shell 01 tourne autour des pipes : la plupart des missions se jugent sur la
   SORTIE produite, pas sur l'état du disque. Le panneau montre donc la sortie
   attendue face à celle obtenue. Deux exceptions gardent une liste de
   critères, parce que ce qu'elles vérifient n'est pas une sortie : définir une
   variable puis s'en servir, et créer un fichier au nom hostile sans en créer
   deux par accident.

   Le `filtre` reprend exactement la façon dont le `check` de la mission
   retrouve la commande à rejouer. S'ils divergeaient, le panneau et la
   validation ne parleraient pas de la même commande ; tests/test_rooms_shell01.js
   vérifie leur accord sur tous les scénarios.

   Script d'amorçage : node src/descripteurs-shell01.mjs
*/
import fs from 'node:fs';
import path from 'node:path';

const cible = path.join(import.meta.dirname, 'contenu-shell01.js');
let s = fs.readFileSync(cible, 'utf8');

const AJOUTS = [
  { repere: "goal:'afficher le nombre de lignes de notes.txt'",
    bloc: `terminal:'MISSION · COMPTER SANS OUVRIR', dossier:'notes', raccourcis:['cat notes.txt','man wc'],
  verif:{type:'sortie', filtre:/\\|/, attendu:'5\\n'},` },

  { repere: "goal:'compter les caractères produits par une commande'",
    bloc: `terminal:'MISSION · MESURER UNE SORTIE', dossier:'bac', raccourcis:['man wc'],
  verif:{type:'sortie', filtre:/\\|/, attendu:'8\\n'},` },

  { repere: "goal:'produire a;b;c'",
    bloc: `terminal:'MISSION · CHANGER LES SÉPARATEURS', dossier:'bac', raccourcis:['man tr'],
  verif:{type:'sortie', filtre:/\\|/, attendu:'a;b;c\\n'},` },

  { repere: "goal:'afficher uniquement le troisième champ'",
    bloc: `terminal:'MISSION · EXTRAIRE UNE COLONNE', dossier:'comptes', raccourcis:['cat ligne.txt','man cut'],
  verif:{type:'sortie', filtre:/^(cut|cat)/, attendu:'33\\n'},` },

  { repere: "goal:'nombre de fichiers .conf, sous-dossiers compris'",
    bloc: `terminal:'MISSION · COMPTER EN PROFONDEUR', dossier:'config', raccourcis:['ls','man find'],
  verif:{type:'sortie', filtre:/\\|/, attendu:'3\\n'},` },

  { repere: "goal:'afficher seulement les lignes contenant ERROR'",
    bloc: `terminal:'MISSION · ISOLER LES ERREURS', dossier:'journaux', raccourcis:['cat journal.log','man grep'],
  verif:{type:'sortie', filtre:/^grep/, attendu:'ERROR disque plein\\nERROR permission refusee\\n'},` },

  { repere: "goal:'enlever les lignes de commentaire'",
    bloc: `terminal:'MISSION · LE FILTRE INVERSÉ', dossier:'config', raccourcis:['cat reglages.conf','man grep'],
  verif:{type:'sortie', filtre:/grep/, attendu:'port=8080\\nhote=localhost\\ndebug=false\\n'},` },

  { repere: "goal:'utiliser une variable comme argument'",
    bloc: `terminal:'MISSION · DÉFINIR PUIS UTILISER', dossier:'bac', raccourcis:['env','man id'],
  verif:{type:'criteres', criteres:[
    {label:"la variable CIBLE contient daemon", test:sh=>sh.env.CIBLE==='daemon'},
    {label:"tu passes la variable à la commande, pas le mot en dur",
     test:(sh,h)=>h.some(c=>/\\$CIBLE/.test(c)&&/^id\\b/.test(c))}]},` },

  { repere: "goal:'créer le fichier nommé  a b$c'",
    bloc: `terminal:'MISSION · UN NOM HOSTILE', dossier:'bac', raccourcis:['ls'],
  verif:{type:'criteres', criteres:[
    {label:"le fichier « a b$c » existe et contient ok", test:sh=>{const n=lookup(sh,'a b$c'); return !!n&&n.type==='file'&&n.content==='ok\\n';}},
    {label:"tu n'en as pas créé deux au passage", test:sh=>Object.keys(sh.root.children).length===1}]},` },

  { repere: "goal:'les deux premières lignes du tri décroissant'",
    bloc: `terminal:'MISSION · LE PODIUM INVERSÉ', dossier:'noms', raccourcis:['cat noms.txt','man sort','man head'],
  verif:{type:'sortie', filtre:/\\|/, attendu:'zoe\\nmarine\\n'},` },
];

let poses = 0;
for(const a of AJOUTS){
  const i = s.indexOf(a.repere);
  if(i < 0) throw new Error('repère introuvable : ' + a.repere);
  if(s.slice(i, i+900).includes('verif:{')) { console.log('  déjà posé : '+a.repere.slice(0,44)); continue; }
  const j = s.indexOf('\n  check:', i);
  if(j < 0) throw new Error('check introuvable après : ' + a.repere);
  s = s.slice(0, j) + '\n  ' + a.bloc + s.slice(j);
  poses++;
}
fs.writeFileSync(cible, s);
console.log(poses + ' descripteur(s) posé(s) dans src/contenu-shell01.js');
