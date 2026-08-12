/* Ajoute à chaque mission de Shell 00 son descripteur « attendu contre obtenu ».

   Chaque type de mission a un attendu différent : un mode de permissions, un
   contenu de fichier, une sortie de commande, ou une liste de conditions.
   Recopier le même panneau partout n'apprendrait rien ; c'est l'adaptation à
   chaque mission qui fait la valeur du retour.

   Script d'amorçage, à lancer une fois : node src/descripteurs-shell00.mjs
   Ensuite src/contenu-shell00.js fait foi et se modifie directement.
*/
import fs from 'node:fs';
import path from 'node:path';

const cible = path.join(import.meta.dirname, 'contenu-shell00.js');
let s = fs.readFileSync(cible, 'utf8');

/* Repère unique -> bloc à insérer juste avant la ligne `check:` de la mission. */
const AJOUTS = [
  { repere: "goal:'cat marque doit afficher OK'",
    bloc: `terminal:'MISSION · FABRIQUER UN CONTENU', dossier:'bac', raccourcis:['ls -l','cat -e marque'],
  verif:{type:'contenu', fichier:'marque', attendu:'OK\\n'},` },

  { repere: "goal:'écrire debut dans journal'",
    bloc: `terminal:'MISSION · LA REDIRECTION REFUSÉE', dossier:'bac', raccourcis:['ls -l'],
  verif:{type:'contenu', fichier:'journal', attendu:'debut\\n'},` },

  { repere: "goal:'liste en format long'",
    bloc: `terminal:'MISSION · LIRE LES COLONNES', dossier:'bac', raccourcis:['ls','man ls'],
  verif:{type:'criteres', criteres:[
    {label:"tu as affiché la liste au format long", test:(sh,h)=>h.some(c=>/^ls\\s+.*l/.test(c))}]},` },

  { repere: "goal:'budget.csv en -r--rwx--x'",
    bloc: `terminal:'MISSION · LE MODE EXACT', dossier:'compta', raccourcis:['ls -l','man chmod'],
  verif:{type:'permissions', cible:'budget.csv', mode:0o471},` },

  { repere: "goal:'lire inventaire dans archives'",
    bloc: `terminal:'MISSION · LE DOSSIER VERROUILLÉ', dossier:'depot', raccourcis:['ls -l','man chmod'],
  verif:{type:'criteres', criteres:[
    {label:"le dossier est devenu traversable", test:sh=>{const d=lookup(sh,'/archives'); return !!d&&!!((d.mode>>6)&1);}},
    {label:"tu es entré dedans", test:(sh,h)=>h.some(c=>/^cd\\s+.*archives/.test(c))},
    {label:"le fichier est affiché", test:(sh,h)=>h.some(c=>/^cat\\s+.*inventaire/.test(c))}]},` },

  { repere: "goal:'un lien dur et un lien symbolique'",
    bloc: `terminal:'MISSION · DEUX SORTES DE LIENS', dossier:'atelier', raccourcis:['ls -l','man ln'],
  verif:{type:'criteres', criteres:[
    {label:"copie_dure partage l'inode de source", test:sh=>{const a=lookup(sh,'source'),b=lookup(sh,'copie_dure'); return !!a&&!!b&&a===b;}},
    {label:"pointeur est un lien symbolique vers dossier", test:sh=>{const c=lookup(sh,'pointeur'); return !!c&&c.type==='link'&&c.target==='dossier';}}]},` },

  { repere: "goal:'observer qui survit'",
    bloc: `terminal:'MISSION · CASSER UN LIEN', dossier:'atelier', raccourcis:['ls -l'],
  verif:{type:'criteres', criteres:[
    {label:"data est supprimé", test:sh=>!lookup(sh,'data')},
    {label:"tu as lu jumeau après coup", test:(sh,h)=>h.some(c=>/^cat\\s+.*jumeau/.test(c))},
    {label:"tu as lu alias après coup", test:(sh,h)=>h.some(c=>/^cat\\s+.*alias/.test(c))}]},` },

  { repere: "goal:'afficher la clé publique, pas l\\'autre'",
    bloc: `terminal:'MISSION · LA BONNE MOITIÉ', dossier:'cles', raccourcis:['ls -a'],
  verif:{type:'criteres', criteres:[
    {label:"la clé publique est affichée", test:(sh,h)=>h.some(c=>/cat\\s+.*id_ed25519\\.pub/.test(c))},
    {label:"la clé privée n'a jamais été affichée", interdit:true,
     test:(sh,h)=>h.some(c=>/cat\\s+[^|]*id_ed25519(\\s|$)/.test(c))}]},` },

  { repere: "goal:'une seule ligne, triée, ponctuée, sans extras'",
    bloc: `terminal:'MISSION · COMPOSER LA SORTIE', dossier:'melange', raccourcis:['ls','man ls'],
  verif:{type:'sortie', filtre:/^ls/, attendu:'./, ../, run, .tmp, images/, vieux.log\\n'},` },

  { repere: "goal:'afficher puis supprimer, en une commande'",
    bloc: `terminal:'MISSION · LE MÉNAGE', dossier:'chantier', raccourcis:['ls -l','man find'],
  verif:{type:'criteres', criteres:[
    {label:"rapport.bak a disparu", test:sh=>!lookup(sh,'rapport.bak')},
    {label:"tmp_cache a disparu", test:sh=>!lookup(sh,'tmp_cache')},
    {label:"sub/vieux.bak a disparu aussi", test:sh=>!lookup(sh,'sub/vieux.bak')},
    {label:"garder.txt et sub/ok.c sont intacts", test:sh=>!!lookup(sh,'garder.txt')&&!!lookup(sh,'sub/ok.c')},
    {label:"le dossier sauvegardes.bak a survécu", test:sh=>{const d=lookup(sh,'sauvegardes.bak'); return !!d&&d.type==='dir';}}]},` },
];

let poses = 0;
for(const a of AJOUTS){
  const i = s.indexOf(a.repere);
  if(i < 0) throw new Error('repère introuvable : ' + a.repere);
  if(s.slice(i, i+900).includes('verif:{')) { console.log('  déjà posé : '+a.repere.slice(0,40)); continue; }
  // on insère juste avant le `check:` qui suit ce repère
  const j = s.indexOf('\n  check:', i);
  if(j < 0) throw new Error('check introuvable après : ' + a.repere);
  s = s.slice(0, j) + '\n  ' + a.bloc + s.slice(j);
  poses++;
}
fs.writeFileSync(cible, s);
console.log(poses + ' descripteur(s) posé(s) dans src/contenu-shell00.js');
