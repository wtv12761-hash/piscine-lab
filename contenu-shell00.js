/* Contenu pédagogique du module shell00.
   Les salles et les questions d'auto-évaluation, rien d'autre : ni moteur,
   ni rendu, ni style. */

const MODULE={cle:'shell00lab_v1', titre:"shell00.lab — salles d'entraînement", invite:"~/shell00.lab"};

const ROOMS=[
{
id:'r1', file:'redirection', tag:'ex00', title:'Écrire dans un fichier',
sub:"cat n'exécute pas, echo ajoute un saut de ligne, > écrase.",
steps:[
 {k:'lesson',h:'Ce que fait vraiment cat',b:`
  <p><code>cat truc</code> <b>affiche</b> le contenu de truc. Il ne l'exécute pas, il ne l'interprète pas. Pour que <code>cat</code> affiche quelque chose, il faut que le fichier contienne littéralement ce quelque chose.</p>
  <p><code>echo</code> écrit du texte sur la sortie, plus un saut de ligne invisible. <code>&gt;</code> détourne cette sortie vers un fichier au lieu de l'écran.</p>
  <p>Et pour voir l'invisible : <code>cat -e</code> affiche un <code>$</code> à chaque fin de ligne.</p>`},
 {k:'term',h:'Mission : fabrique la sortie voulue',
  goal:'cat marque doit afficher OK',
  brief:"Le dossier est vide. Crée un fichier <code>marque</code> tel que <code>cat marque</code> affiche <code>OK</code>. Vérifie ensuite ce que tu as vraiment écrit.",
  setup:sh=>{},
  terminal:'MISSION · FABRIQUER UN CONTENU', dossier:'bac', raccourcis:['ls -l','cat -e marque'],
  verif:{type:'contenu', fichier:'marque', attendu:'OK\n'},
  check:sh=>{ const n=lookup(sh,'marque'); return !!n&&n.type==='file'&&n.content==='OK\n'; },
  hints:["La commande qui écrit du texte s'appelle echo. Le caractère qui détourne vers un fichier est >.",
         "Forme générale : echo TEXTE > NOMDUFICHIER. Puis contrôle avec cat -e.",
         "echo OK > marque — et cat -e marque doit répondre OK$"]},
 {k:'mcq',h:'',q:"Ton <code>cat -e marque</code> affiche <code>OK$</code>. Combien pèse le fichier ?",
  opts:['2 octets','3 octets','4 octets','1 octet'],a:1,
  why:"O et K font 2, le saut de ligne matérialisé par le $ en fait 1 de plus. echo ajoute toujours ce saut, et il compte dans la taille."},
 {k:'term',h:'Mission : quand la redirection refuse',
  goal:'écrire debut dans journal',
  brief:"Écris <code>debut</code> dans <code>journal</code>. Si le shell te repousse, ne t'acharne pas : liste d'abord en format long et regarde le tout premier caractère de la ligne.",
  setup:sh=>{ sh.root.children['journal']=fDir(); },
  terminal:'MISSION · LA REDIRECTION REFUSÉE', dossier:'bac', raccourcis:['ls -l'],
  verif:{type:'contenu', fichier:'journal', attendu:'debut\n'},
  check:sh=>{ const n=lookup(sh,'journal'); return !!n&&n.type==='file'&&n.content==='debut\n'; },
  hints:["Lance ls -l. Le premier caractère annonce le type de l'entrée, avant même les permissions.",
         "Un d en première position signifie directory. On n'écrit pas de texte dans un dossier.",
         "Supprime le dossier vide avec rmdir, puis refais ta redirection."]},
 {k:'mcq',h:'',q:"Un fichier contient déjà trois lignes. Que fait <code>echo fin &gt; f</code> ?",
  opts:['Ajoute fin à la suite','Remplace tout le contenu par fin','Refuse car le fichier existe','Crée un fichier f2'],a:1,
  why:"Une seule chevron écrase. Pour ajouter à la fin sans rien perdre, il en faut deux."}
]},

{
id:'r2', file:'lslong', tag:'ex01', title:'Lire une ligne de ls -l',
sub:'Type, permissions, nombre de liens, taille : décoder les colonnes.',
steps:[
 {k:'lesson',h:'Anatomie de la ligne',b:`
  <p>Une ligne de <code>ls -l</code> se lit de gauche à droite :</p>
  <ul>
   <li><b>1 caractère de type</b> : <code>-</code> fichier ordinaire, <code>d</code> dossier, <code>l</code> lien symbolique</li>
   <li><b>9 caractères de permissions</b> : trois groupes de r, w, x — propriétaire, groupe, autres</li>
   <li><b>un nombre</b> : le compteur de liens durs (salle 4)</li>
   <li>propriétaire, groupe</li>
   <li><b>la taille en octets</b></li>
   <li>date de modification, puis le nom</li>
  </ul>
  <p>Dans chaque groupe l'ordre est toujours r puis w puis x. Un tiret signifie « cette permission est absente ».</p>`},
 {k:'term',h:'Mission : observe avant de répondre',
  goal:'liste en format long',
  brief:"Trois entrées t'attendent, de trois natures différentes. Liste-les en format long et prends le temps de lire chaque colonne. La mission valide dès que tu as affiché le format long.",
  setup:sh=>{ sh.root.children['notes']=Object.assign(fFile('x'.repeat(240),0o644),{mtime:T0-86400000});
              sh.root.children['photos']=Object.assign(fDir(0o755),{mtime:T0-3600000});
              sh.root.children['lancer']=Object.assign(fFile('#!/bin/sh\n',0o755),{mtime:T0}); },
  terminal:'MISSION · LIRE LES COLONNES', dossier:'bac', raccourcis:['ls','man ls'],
  verif:{type:'criteres', criteres:[
    {label:"tu as affiché la liste au format long", test:(sh,h)=>h.some(c=>/^ls\s+.*l/.test(c))}]},
  check:(sh,hist)=>hist.some(h=>/^ls\s+.*l/.test(h)),
  hints:["C'est ls, avec l'option qui déplie une entrée par ligne avec tous ses détails.","ls -l"]},
 {k:'mcq',h:'',q:"Sur la ligne du dossier <code>photos</code>, la colonne des tailles affiche 4096. Ça veut dire quoi ?",
  opts:["4096 fichiers dedans","La taille en octets de l'entrée de dossier elle-même","Le numéro d'inode","Les permissions converties en décimal"],a:1,
  why:"C'est toujours la taille en octets de l'entrée. Pour un dossier elle ne dit rien sur le contenu, d'où le XX du sujet à cet endroit."},
 {k:'input',h:'',q:"Un fichier doit peser un nombre d'octets bien précis. Quelle commande te donne cette taille ?",
  a:['wc -c fichier','wc -c'],accept:v=>/^wc\s+-c(\s|$)/.test(v),
  why:"wc -c compte les octets. Le piège habituel : le saut de ligne ajouté par echo compte dans le total."},
 {k:'mcq',h:'',q:"Tu dois obtenir un fichier en <code>-r-xr-x---</code> contenant du texte. Dans quel ordre travailler ?",
  opts:["chmod puis écrire le contenu","Écrire le contenu puis chmod","Peu importe","chmod deux fois"],a:1,
  why:"Cette cible n'a aucun w, pas même pour toi. Une fois posée, écrire dedans est refusé : tu te bloques dehors."}
]},

{
id:'r3', file:'chmod', tag:'ex01/02', title:'chmod et l\'octal',
sub:'r=4, w=2, x=1. Traduire dans les deux sens, sans hésiter.',
steps:[
 {k:'bits',h:'Manipule les bits',
  b:"Clique les cases pour allumer ou éteindre chaque permission. Regarde le chiffre de chaque groupe suivre. Objectif : sentir pourquoi aucun total n'est ambigu."},
 {k:'lesson',h:'Pourquoi ces valeurs',b:`
  <p>r vaut 4, w vaut 2, x vaut 1. Ce sont des puissances de deux, donc chaque total de 0 à 7 correspond à une seule combinaison. 6 ne peut être que 4+2, jamais autre chose.</p>
  <p>Un chiffre par groupe, dans l'ordre <b>propriétaire, groupe, autres</b>. La syntaxe met le mode avant le fichier.</p>
  <p>Sur un <b>dossier</b>, x ne signifie pas « exécuter » mais « pouvoir entrer dedans ». C'est pour ça qu'on règle les permissions des dossiers en dernier.</p>`},
 {k:'input',h:'',q:"Traduis <code>-rwxr-x---</code> en octal (les trois chiffres).",
  a:['750'],why:"rwx=7, r-x=5, ---=0."},
 {k:'input',h:'',q:"Traduis <code>526</code> en lettres (les 9 caractères, style rwxr-xr--).",
  a:['r-x-w-rw-'],why:"5=r-x, 2=-w-, 6=rw-. Le 2 tout seul est le cas qu'on rate : écriture sans lecture."},
 {k:'term',h:'Mission : atteins la cible exacte',
  goal:'budget.csv en -r--rwx--x',
  brief:"Le fichier <code>budget.csv</code> est en <code>-rw-rw-r--</code>. Amène-le exactement à <code>-r--rwx--x</code>. Calcule d'abord, tape ensuite, vérifie enfin.",
  setup:sh=>{ sh.root.children['budget.csv']=fFile('mois,montant\n',0o664); },
  terminal:'MISSION · LE MODE EXACT', dossier:'compta', raccourcis:['ls -l','man chmod'],
  verif:{type:'permissions', cible:'budget.csv', mode:0o471},
  check:sh=>{ const n=lookup(sh,'budget.csv'); return n&&n.mode===0o471; },
  hints:["Découpe la cible en trois paquets de trois : r-- puis rwx puis --x.",
         "r--=4, rwx=7, --x=1.",
         "Le mode vient avant le nom du fichier dans la commande."]},
 {k:'term',h:'Mission : le dossier verrouillé',
  goal:'lire inventaire dans archives',
  brief:"Le dossier <code>archives</code> contient un fichier <code>inventaire</code>, mais tu ne peux pas y entrer. Débloque l'accès, entre, et affiche le fichier.",
  setup:sh=>{ const d=fDir(0o600); d.children['inventaire']=fFile('12 cartons\n'); sh.root.children['archives']=d; },
  terminal:'MISSION · LE DOSSIER VERROUILLÉ', dossier:'depot', raccourcis:['ls -l','man chmod'],
  verif:{type:'criteres', criteres:[
    {label:"le dossier est devenu traversable", test:sh=>{const d=lookup(sh,'/archives'); return !!d&&!!((d.mode>>6)&1);}},
    {label:"tu es entré dedans", test:(sh,h)=>h.some(c=>/^cd\s+.*archives/.test(c))},
    {label:"le fichier est affiché", test:(sh,h)=>h.some(c=>/^cat\s+.*inventaire/.test(c))}]},
  check:(sh,hist)=>{ const d=lookup(sh,'/archives'); return !!d&&!!((d.mode>>6)&1)&&hist.some(h=>/^cat\s+.*inventaire/.test(h)); },
  hints:["Sans le bit x sur un dossier, cd est refusé. Regarde ce qui manque au groupe propriétaire.",
         "Le propriétaire a rw-, soit 6. Il lui faut aussi le x, ce qui donne 7.",
         "chmod avec le bon mode sur archives, puis cd archives, puis cat inventaire."]}
]},

{
id:'r4', file:'liens', tag:'ex02', title:'Liens durs et symboliques',
sub:'Deux étiquettes sur une boîte, ou un post-it qui note une adresse.',
steps:[
 {k:'lesson',h:'Deux mécanismes très différents',b:`
  <p>Un fichier, c'est deux choses séparées : un <b>contenu</b> stocké quelque part (l'inode, avec ses permissions, sa taille, sa date) et un <b>nom</b> dans un dossier qui pointe dessus.</p>
  <p><b>ln cible nom</b> crée un <b>lien dur</b> : un deuxième nom vers le même inode. Changer les permissions par l'un se voit sur l'autre, puisqu'elles appartiennent au contenu et pas au nom.</p>
  <p><b>ln -s cible nom</b> crée un <b>lien symbolique</b> : un petit fichier à part dont le contenu est le texte du chemin visé. Sa taille est la longueur de ce texte.</p>`},
 {k:'inode',h:'Observe la différence',
  b:"Deux noms pointent vers la même boîte. Supprime un nom et regarde ce qui survit, dans chacun des deux cas."},
 {k:'term',h:'Mission : fabrique les deux sortes',
  goal:'un lien dur et un lien symbolique',
  brief:"Le fichier <code>source</code> et le dossier <code>dossier</code> existent. Crée <code>copie_dure</code> comme lien dur vers <code>source</code>, et <code>pointeur</code> comme lien symbolique vers <code>dossier</code>. Contrôle le résultat en format long.",
  setup:sh=>{ sh.root.children['dossier']=fDir(); sh.root.children['source']=fFile('contenu\n'); },
  terminal:'MISSION · DEUX SORTES DE LIENS', dossier:'atelier', raccourcis:['ls -l','man ln'],
  verif:{type:'criteres', criteres:[
    {label:"copie_dure partage l'inode de source", test:sh=>{const a=lookup(sh,'source'),b=lookup(sh,'copie_dure'); return !!a&&!!b&&a===b;}},
    {label:"pointeur est un lien symbolique vers dossier", test:sh=>{const c=lookup(sh,'pointeur'); return !!c&&c.type==='link'&&c.target==='dossier';}}]},
  check:sh=>{ const a=lookup(sh,'source'),b=lookup(sh,'copie_dure'),c=lookup(sh,'pointeur');
              return a&&b&&a===b&&c&&c.type==='link'&&c.target==='dossier'; },
  hints:["Une seule commande fait les deux, avec ou sans une option d'une lettre. Consulte man ln.",
         "Ordre des arguments : d'abord la cible, ensuite le nouveau nom.",
         "Le lien symbolique, c'est la même commande avec -s."]},
 {k:'mcq',h:'',q:"<code>copie_dure</code> est un lien dur vers <code>source</code>. Tu fais <code>chmod 400 source</code>. Que devient copie_dure ?",
  opts:['Rien ne change','Elle passe aussi en 400','Elle est supprimée','Elle devient un lien mort'],a:1,
  why:"Même inode. Les permissions sont une propriété du contenu, pas du nom qui y mène."},
 {k:'input',h:'',q:"<code>ln -s rapports lien</code> : quelle taille fait <code>lien</code>, en octets ? (juste le nombre)",
  a:['8'],why:"r-a-p-p-o-r-t-s = 8 caractères. Un lien symbolique ne stocke que le texte du chemin, rien d'autre."},
 {k:'term',h:'Mission : casse un lien',
  goal:'observer qui survit',
  brief:"<code>data</code> est un fichier, <code>jumeau</code> un lien dur vers lui, <code>alias</code> un lien symbolique vers lui. Supprime <code>data</code>, puis essaie de lire <code>jumeau</code> et <code>alias</code>. Note lequel répond encore.",
  setup:sh=>{ const f=fFile('mesures 2026\n'); sh.root.children['data']=f; sh.root.children['jumeau']=f;
              sh.root.children['alias']=fLink('data'); },
  terminal:'MISSION · CASSER UN LIEN', dossier:'atelier', raccourcis:['ls -l'],
  verif:{type:'criteres', criteres:[
    {label:"data est supprimé", test:sh=>!lookup(sh,'data')},
    {label:"tu as lu jumeau après coup", test:(sh,h)=>h.some(c=>/^cat\s+.*jumeau/.test(c))},
    {label:"tu as lu alias après coup", test:(sh,h)=>h.some(c=>/^cat\s+.*alias/.test(c))}]},
  check:(sh,hist)=>!lookup(sh,'data') && hist.some(h=>/^cat\s+.*alias/.test(h)) && hist.some(h=>/^cat\s+.*jumeau/.test(h)),
  hints:["Supprime data, puis affiche les deux autres avec cat.",
         "Le lien dur garde le contenu en vie. Le symbolique pointe vers un nom qui n'existe plus."]},
 {k:'mcq',h:'',q:"Pourquoi un lien symbolique s'affiche-t-il toujours <code>lrwxrwxrwx</code> ?",
  opts:['Il est accessible à tous par sécurité','Ses permissions sont figées sous Linux ; ce sont celles de la cible qui décident','Il hérite des permissions du dossier','C\'est un bug d\'affichage'],a:1,
  why:"On ne modifie pas les permissions d'un lien symbolique : l'affichage est constant, et l'accès réel dépend de la cible."}
]},

{
id:'r5', file:'ssh', tag:'ex03', title:'Clés SSH',
sub:'Une paire : une moitié se donne, l\'autre jamais.',
steps:[
 {k:'lesson',h:'Le principe',b:`
  <p>Générer une clé produit deux fichiers dans <code>~/.ssh/</code> : la <b>privée</b> et la <b>publique</b>, cette dernière portant le suffixe <code>.pub</code>.</p>
  <p>Le serveur garde la publique. À la connexion il envoie un défi que seule la privée sait résoudre. Aucun mot de passe ne circule, et la privée ne quitte jamais ta machine.</p>
  <p>Une clé publique tient sur une ligne : le type de l'algorithme, la clé en base64, puis un commentaire sans aucun rôle cryptographique.</p>`},
 {k:'term',h:'Mission : trouve la bonne moitié',
  goal:'afficher la clé publique, pas l\'autre',
  brief:"Le dossier des clés existe mais n'apparaît pas au premier coup d'œil. Trouve-le, puis affiche le contenu de la clé <b>publique</b>. Afficher la privée fait échouer la mission.",
  setup:sh=>{ const d=fDir(0o700);
    d.children['id_ed25519']=fFile('-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAA...\n-----END OPENSSH PRIVATE KEY-----\n',0o600);
    d.children['id_ed25519.pub']=fFile('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExempleDeCleePubliqueFictive student@campus\n',0o644);
    d.children['known_hosts']=fFile('git.exemple.net ssh-ed25519 AAAA...\n',0o600);
    sh.root.children['.ssh']=d; },
  terminal:'MISSION · LA BONNE MOITIÉ', dossier:'cles', raccourcis:['ls -a'],
  verif:{type:'criteres', criteres:[
    {label:"la clé publique est affichée", test:(sh,h)=>h.some(c=>/cat\s+.*id_ed25519\.pub/.test(c))},
    {label:"la clé privée n'a jamais été affichée", interdit:true,
     test:(sh,h)=>h.some(c=>/cat\s+[^|]*id_ed25519(\s|$)/.test(c))}]},
  check:(sh,hist)=>hist.some(h=>/cat\s+.*id_ed25519\.pub/.test(h)) && !hist.some(h=>/cat\s+[^|]*id_ed25519(\s|$)/.test(h)),
  hints:["Un nom qui commence par un point est masqué par ls. Une option d'une lettre montre tout.",
         "ls -a pour repérer le dossier, puis entre dedans et liste son contenu.",
         "Affiche celui dont le nom se termine par .pub, et surtout pas l'autre."]},
 {k:'mcq',h:'',q:"Un champ web te demande ta clé. Le fichier que tu t'apprêtes à coller commence par <code>-----BEGIN OPENSSH PRIVATE KEY-----</code>. Tu fais quoi ?",
  opts:['Je colle, c\'est ce qui est demandé','J\'arrête : c\'est la moitié privée, elle ne se publie jamais','Je colle seulement la première ligne','Je la chiffre avant de coller'],a:1,
  why:"Publier une clé privée permet à n'importe qui d'usurper ton identité. La publique tient sur une ligne et commence par le nom de l'algorithme."},
 {k:'mcq',h:'',q:"Tu viens de remplacer ta clé sur un serveur. Comment sais-tu que ça a marché ?",
  opts:['Un mail de confirmation arrive','Une opération qui passe par SSH fonctionne à nouveau','ls -l sur la clé le montre','Le fichier change de taille'],a:1,
  why:"La preuve par l'usage : si une connexion SSH aboutit, le serveur reconnaît bien ta nouvelle clé."}
]},

{
id:'r6', file:'manpage', tag:'ex04', title:'RTFM : choisir la bonne option',
sub:'Chercher dans le manuel, et prendre l\'option qui fait exactement ce qu\'on demande, ni plus.',
steps:[
 {k:'lesson',h:'Le manuel est l\'outil de l\'examen',b:`
  <p>À l'exam final, pas d'internet : seulement <code>man</code>. Navigation : <code>/mot</code> pour chercher, <code>n</code> pour l'occurrence suivante, <code>q</code> pour quitter.</p>
  <p>Le vrai réflexe à acquérir n'est pas de retenir des options par cœur, c'est de savoir formuler ce qu'on cherche puis de le trouver dans la page. Un sujet qui écrit « RTFM » teste exactement ça.</p>
  <p>Et quand deux options font presque la même chose, celle qui en fait <b>le moins</b> est la bonne dès que l'énoncé dit de ne faire que ce qui est demandé.</p>`},
 {k:'term',h:'Mission : compose la sortie exacte',
  goal:'une seule ligne, triée, ponctuée, sans extras',
  brief:"<code>man ls</code> fonctionne ici. Produis une liste <b>de toutes les entrées, y compris les cachées</b>, <b>triée par date de modification</b> (plus récent d'abord), <b>séparée par une virgule et un espace</b>, avec un <b>slash après les dossiers</b>, et <b>aucun autre symbole ajouté</b>.",
  setup:sh=>{ sh.root.children['vieux.log']=Object.assign(fFile('a'),{mtime:T0-500000});
              sh.root.children['images']=Object.assign(fDir(),{mtime:T0-300000});
              sh.root.children['run']=Object.assign(fFile('x',0o755),{mtime:T0-100000});
              sh.root.children['.tmp']=Object.assign(fFile('x'),{mtime:T0-200000}); },
  terminal:'MISSION · COMPOSER LA SORTIE', dossier:'melange', raccourcis:['ls','man ls'],
  verif:{type:'sortie', filtre:/^ls/, attendu:'./, ../, run, .tmp, images/, vieux.log\n'},
  check:(sh,hist)=>{
    const last=[...hist].reverse().find(h=>h.startsWith('ls'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='./, ../, run, .tmp, images/, vieux.log\n';
  },
  hints:["Quatre options à combiner. Dans man ls, cherche /comma pour la ponctuation, et l'option de tri porte l'initiale du mot anglais pour « temps ».",
         "Il te manque encore les entrées cachées, et le slash sur les dossiers. Pour le slash, deux options se ressemblent et ne font pas la même chose.",
         "L'une ajoute uniquement le slash aux dossiers ; l'autre décore aussi les exécutables et les liens. Prends la discrète.",
         "Montrer les cachées fait aussi apparaître le dossier courant et le dossier parent. C'est normal, ils commencent par un point eux aussi."],
  post:"Remarque ce que <code>-a</code> a fait entrer : <code>./</code> et <code>../</code>. Le point et le double point sont des entrées cachées comme les autres. C'est pour ça qu'un énoncé qui veut les exclure prend la peine de le préciser."},
 {k:'mcq',h:'',q:"Deux options ajoutent un slash aux dossiers. L'une ajoute en plus une étoile aux exécutables et un arobase aux liens. Laquelle prendre quand l'énoncé dit « fais seulement ce qui est demandé » ?",
  opts:["Celle qui décore tout, c'est plus complet","Celle qui ajoute uniquement le slash","Les deux conviennent","Ni l'une ni l'autre, il faut un pipe"],a:1,
  why:"Tout symbole non demandé est une différence avec la sortie attendue, donc une erreur. Le minimum suffisant est la bonne réponse."},
 {k:'mcq',h:'',q:"Un autre énoncé, lui, <b>exclut</b> les fichiers cachés. Que faut-il ajouter à <code>ls</code> pour ça ?",
  opts:["L'option qui montre tout","Rien : ls les masque déjà par défaut","Un filtre avec grep","Une option de tri"],a:1,
  why:"Le comportement par défaut fait déjà le travail. C'est le sens inverse de la mission que tu viens de faire : là tu devais ajouter -a pour les faire apparaître, ici il n'y a rien à ajouter. Et -a fait aussi entrer le point et le double point, ce qui explique qu'un énoncé prenne la peine de les nommer."}
]},

{
id:'r7', file:'git', tag:'rendu', title:'Git : le rendu, pas une sauvegarde',
sub:'Ce qui n\'est pas poussé n\'existe pas.',
steps:[
 {k:'lesson',h:'Le dépôt EST le rendu',b:`
  <p>La correction automatique clone ton dépôt distant. Elle ne voit jamais ton disque. Un projet égale un dépôt, dont l'adresse figure sur la page du projet.</p>
  <p>Trois étapes, jamais deux : <code>git add -A</code> prépare, <code>git commit -m "msg"</code> enregistre <b>localement</b>, <code>git push</code> envoie au serveur.</p>
  <p>Tes trois vérificateurs : <code>git status</code> (propre et à jour), <code>git ls-files</code> (ce que git connaît vraiment, donc ce qui sera corrigé), <code>git remote -v</code> (le bon dépôt ?).</p>`},
 {k:'mcq',h:'',q:"add et commit faits, push oublié. Que voit la correction ?",
  opts:['Tout, le commit suffit','Rien de nouveau : le commit est resté sur ta machine','La moitié','Une version compressée'],a:1,
  why:"commit enregistre en local, push envoie. Sans push, le serveur ignore ton travail."},
 {k:'input',h:'',q:"Quelle commande liste exactement ce que git connaît, donc ce qui sera corrigé ?",
  a:['git ls-files'],why:"Plus fiable que ls, qui montre aussi les fichiers que git ignore ou n'a jamais enregistrés."},
 {k:'mcq',h:'',q:"Un camarade a neuf dossiers d'exercices sur son disque, mais <code>git ls-files</code> n'en affiche qu'un seul. Diagnostic ?",
  opts:['Dépôt corrompu','Le reste n\'a jamais été commité : presque rien ne sera corrigé','Normal, git compresse','Problème de clé SSH'],a:1,
  why:"Les fichiers présents sur le disque ne comptent pas. Seuls les commits poussés existent pour la correction."},
 {k:'mcq',h:'',q:"Pourquoi pousser dès le premier exercice, avant d'avoir fini ?",
  opts:['Ça donne des points bonus','Ça teste le canal (clé, dépôt, droits) tant qu\'il reste du temps pour réparer','La régularité est notée','Pour réserver sa place'],a:1,
  why:"Un push cassé découvert la veille du rendu coûte le module entier. Découvert au premier exercice, il coûte dix minutes."},
 {k:'bug',
  contexte:"Un camarade te dit que sa correction affiche zéro alors qu'il a tout fait. Il te montre son terminal :",
  code:"$ ls\nex00  ex01  ex02  ex03\n$ git status\nOn branch main\nnothing to commit, working tree clean\n$ git log --oneline\n7f3a9c1 tout mes exos\n$ git ls-files\nex00/z",
  q:"Où est le problème ?",
  opts:["Son message de commit est trop vague",
        "Un seul fichier a été enregistré par git : les autres dossiers n'ont jamais été ajoutés",
        "Il lui manque un push, le commit est resté local",
        "git log devrait afficher plus de lignes"],
  a:1,
  why:"<code>git status</code> dit « propre » parce qu'il ne parle que de ce que git suit déjà. <code>git ls-files</code> montre ce que git connaît vraiment, et il n'y a qu'un fichier. Les autres dossiers n'ont jamais été ajoutés : ils sont sur le disque, invisibles pour la correction. C'est pour ça que <code>ls</code> ne prouve rien et que <code>git ls-files</code> est le seul vrai contrôle."},
 {k:'answer',h:'À dire à voix haute',
  q:"Explique en trois phrases pourquoi « tout est sur mon disque, je rendrai à la fin » est une mauvaise idée.",
  a:"Le rendu passe par le dépôt distant : la correction le clone et ne lit jamais mon disque. Sans add, commit et push, mon travail n'existe pas pour l'école. Et attendre la fin, c'est découvrir une clé cassée ou un mauvais dépôt quand il est trop tard pour corriger."}
]},

{
id:'r8', file:'diffpatch', optionnel:true, tag:'ex07', title:'diff et patch',
sub:'Une recette de transformation, et la machine qui l\'applique.',
steps:[
 {k:'lesson',h:'Deux commandes réciproques',b:`
  <p><code>diff v1 v2</code> produit la recette pour passer de v1 à v2. Les lignes préfixées <code>&lt;</code> viennent du premier fichier, celles préfixées <code>&gt;</code> du second. Les codes comme <code>1,2c1,8</code> disent « remplace les lignes 1-2 par les lignes 1-8 ».</p>
  <p><code>patch</code> applique la recette dans l'autre sens. L'option <code>-o</code> écrit le résultat dans un nouveau fichier au lieu de modifier l'original sur place.</p>
  <p>Vérification reine : refaire le diff entre l'original et ton résultat, et le comparer à la recette de départ. Identiques, donc juste par définition.</p>`},
 {k:'mcq',h:'',q:"Dans la sortie de <code>diff v1 v2</code>, les lignes préfixées <code>&gt;</code> appartiennent à…",
  opts:['v1','v2','Aux deux','Au diff lui-même'],a:1,
  why:"Le fichier de gauche dans la commande est marqué <, celui de droite est marqué >."},
 {k:'input',h:'',q:"Tu as <code>v1</code> et <code>changes.diff</code>. Écris la commande qui fabrique <code>v2</code> sans modifier v1.",
  a:['patch -o v2 v1 changes.diff'],accept:v=>/^patch\s+/.test(v)&&/-o\s+v2/.test(v)&&/(^|\s)v1(\s|$)/.test(v)&&/changes\.diff/.test(v),
  why:"Sans -o, patch modifierait v1 sur place et tu perdrais l'original, donc ton moyen de vérification."},
 {k:'mcq',h:'',q:"Ton résultat pèse un octet de moins que celui attendu. Cause la plus probable ?",
  opts:['Mauvaise version de patch','Recopie à la main : un espace en fin de ligne, invisible, perdu au passage','Disque plein','Compression automatique'],a:1,
  why:"Espaces finaux et sauts de ligne ne se voient pas mais comptent. C'est précisément pour ça qu'on applique un patch au lieu de recopier."},
 {k:'bug',
  contexte:"Un camarade doit fabriquer <code>v2</code> à partir de <code>v1</code> et de la recette, puis vérifier son travail. Il a tapé ceci, et il n'arrive plus à vérifier quoi que ce soit :",
  code:"$ patch v1 changes.diff\npatching file v1\n$ diff v1 v2\ndiff: v2: No such file or directory",
  q:"Qu'est-ce qui s'est passé ?",
  opts:["La recette était corrompue",
        "patch a modifié v1 sur place : l'original a disparu, et v2 n'a jamais été créé",
        "Il fallait taper la commande dans l'autre sens",
        "diff ne sait pas comparer deux fichiers différents"],
  a:1,
  why:"Sans option de sortie, <code>patch</code> écrit le résultat <b>dans le fichier d'origine</b>. v1 est devenu le contenu attendu, et v2 n'existe pas. Le plus gênant n'est pas le fichier manquant : c'est que l'original a disparu, donc le moyen de vérification aussi. D'où l'option qui écrit ailleurs, et la sauvegarde avant toute opération destructive."},
 {k:'answer',h:'À dire à voix haute',
  q:"Comment prouves-tu que ton fichier reconstruit est correct ? Donne le raisonnement, puis les commandes.",
  a:"Je refais le diff entre l'original et mon résultat, et je le compare à la recette fournie : s'ils sont identiques octet pour octet, mon fichier est par définition celui qui produit ce diff. En pratique : <code>diff v1 v2 &gt; check.diff</code> puis <code>diff check.diff changes.diff</code>, qui ne doit rien afficher."}
]},

{
id:'r9', file:'find', optionnel:true, tag:'ex08', title:'find : tester puis agir',
sub:'Une seule commande qui filtre et agit, sans aucun chaînage.',
steps:[
 {k:'lesson',h:'Tests et actions',b:`
  <p><code>find</code> parcourt une arborescence et évalue, pour chaque entrée, une expression faite de <b>tests</b> (le type, le nom) et d'<b>actions</b> (afficher, supprimer).</p>
  <p>Les éléments qui se suivent forment un ET implicite, évalué de gauche à droite avec arrêt au premier faux. C'est ce qui permet d'enchaîner deux actions : elles ne s'exécutent que si les tests ont réussi, dans l'ordre. Aucun <code>;</code> ni <code>&amp;&amp;</code> nécessaire.</p>
  <p>Le OU s'écrit <code>-o</code> et doit être groupé par des parenthèses <b>échappées</b> : sans backslash, le shell les interpréterait avant find. Même logique pour les motifs, qu'on met entre guillemets pour que le shell ne développe pas l'étoile.</p>`},
 {k:'term',h:'Mission : le ménage',
  goal:'afficher puis supprimer, en une commande',
  brief:"Trouve tous les <b>fichiers</b> dont le nom se termine par <code>.bak</code> ou commence par <code>tmp_</code>, y compris dans les sous-dossiers. Affiche-les puis supprime-les, en <b>une seule commande find</b>. Le dossier <code>sauvegardes.bak</code> et les autres fichiers doivent survivre.",
  setup:sh=>{ sh.root.children['garder.txt']=fFile('a');
              sh.root.children['rapport.bak']=fFile('a');
              sh.root.children['tmp_cache']=fFile('a');
              sh.root.children['sauvegardes.bak']=fDir();
              const s=fDir(); s.children['vieux.bak']=fFile('a'); s.children['ok.c']=fFile('a');
              sh.root.children['sub']=s; },
  terminal:'MISSION · LE MÉNAGE', dossier:'chantier', raccourcis:['ls -l','man find'],
  verif:{type:'criteres', criteres:[
    {label:"rapport.bak a disparu", test:sh=>!lookup(sh,'rapport.bak')},
    {label:"tmp_cache a disparu", test:sh=>!lookup(sh,'tmp_cache')},
    {label:"sub/vieux.bak a disparu aussi", test:sh=>!lookup(sh,'sub/vieux.bak')},
    {label:"garder.txt et sub/ok.c sont intacts", test:sh=>!!lookup(sh,'garder.txt')&&!!lookup(sh,'sub/ok.c')},
    {label:"le dossier sauvegardes.bak a survécu", test:sh=>{const d=lookup(sh,'sauvegardes.bak'); return !!d&&d.type==='dir';}}]},
  check:sh=>{
    const g=lookup(sh,'garder.txt'), d=lookup(sh,'sauvegardes.bak'), s=lookup(sh,'sub/ok.c');
    const gone=!lookup(sh,'rapport.bak')&&!lookup(sh,'tmp_cache')&&!lookup(sh,'sub/vieux.bak');
    return !!g&&!!d&&d.type==='dir'&&!!s&&gone; },
  hints:["Structure : le point de départ, puis la restriction de type, puis le groupe de noms, puis les deux actions.",
         "Le OU s'écrit -o, et le groupe se délimite par des parenthèses précédées d'un backslash.",
         "Les motifs vont entre guillemets. L'étoile remplace n'importe quelle suite de caractères, avant ou après le texte fixe."],
  post:"Le dossier <code>sauvegardes.bak</code> a survécu grâce à la restriction de type. Sans elle, tu supprimais un dossier entier et tout son contenu."},
 {k:'mcq',h:'',q:"Pourquoi mettre les motifs entre guillemets, comme dans <code>-name \"*.bak\"</code> ?",
  opts:['Pure convention','Pour empêcher le shell de remplacer l\'étoile avant que find reçoive le motif','Pour ignorer la casse','C\'est obligatoire pour toute option'],a:1,
  why:"Sans guillemets, si un fichier correspondant existe dans le dossier courant, le shell substituerait son nom au motif et find chercherait la mauvaise chose."},
 {k:'answer',h:'À dire à voix haute',
  q:"L'énoncé interdit tout chaînage de commandes. Explique comment ta commande arrive quand même à afficher ET supprimer.",
  a:"find accepte plusieurs actions dans une même expression. Pour chaque entrée qui passe les tests, il les exécute dans l'ordre : d'abord l'affichage du chemin, ensuite la suppression. Tout se déroule à l'intérieur de l'unique invocation de find, donc il n'y a ni point-virgule, ni double esperluette, ni pipe."}
]},

{
id:'r10', file:'soutenance', tag:'boss', title:'Soutenance blanche', boss:true,
sub:'Dix questions sur ton rendu réel, à voix haute, sans lire.',
steps:[
 {k:'lesson',h:'Règle du jeu',b:`
  <p>Les salles précédentes t'entraînent sur des cas neufs, exprès, pour que tu apprennes le mécanisme et pas la réponse. Ici c'est l'inverse : ce sont tes vrais fichiers rendus, et les questions qu'un correcteur pose réellement.</p>
  <p>Pour chaque question : réponds <b>à haute voix, en entier</b>, puis révèle. Sois honnête. Si tu as dû lire pour répondre, coche « pas encore ».</p>`},
 {k:'viva'}
]}
];

const VIVA=[
 {q:"Pourquoi test3 et test5 affichent un 2 en deuxième colonne, et que se passe-t-il si on supprime test3 ?",
  a:"Ce sont deux liens durs : deux noms vers le même inode. La colonne compte les noms qui pointent sur ce contenu. Supprimer test3 enlève un nom ; le contenu survit tant qu'il en reste un, donc test5 fonctionne toujours."},
 {q:"Pourquoi test6 fait 5 octets et pourquoi aucun chmod dessus ?",
  a:"C'est un lien symbolique dont le contenu est le texte « test0 », soit 5 caractères. Ses permissions affichées lrwxrwxrwx ne sont pas modifiables sous Linux : ce sont celles de la cible qui s'appliquent."},
 {q:"Calcule chmod 715 en lettres, puis -rw-r----x en octal.",
  a:"715 = rwx--xr-x. Et -rw-r----x = 641. Méthode : r=4, w=2, x=1, on additionne groupe par groupe, dans l'ordre propriétaire, groupe, autres."},
 {q:"Dans midLS, pourquoi -p et pas -F ?",
  a:"Les deux ajoutent un slash aux dossiers, mais -F ajoute aussi une étoile aux exécutables et un arobase aux liens symboliques. Le sujet dit « do only what is asked » : -p fait exactement ce qui est demandé."},
 {q:"Dans git_commit.sh, pourquoi %H et pas %h ?",
  a:"%H donne l'identifiant complet, 40 caractères hexadécimaux, ce que montre l'exemple du sujet. %h donne la forme abrégée. L'identifiant est une empreinte calculée sur le contenu, le parent, l'auteur et la date."},
 {q:"Dans git_ignore.sh, à quoi sert --exclude-standard ?",
  a:"--ignored a besoin de savoir quelles règles appliquer. --exclude-standard active les sources standard : .gitignore, .git/info/exclude et la config globale. Git refuse la combinaison sans lui."},
 {q:"Dans clean, comment afficher puis supprimer sans aucun chaînage ?",
  a:"find évalue une expression par entrée, avec un ET implicite et arrêt au premier faux. -print et -delete sont deux actions successives : elles ne s'exécutent que si les tests passent, dans l'ordre. Tout tient dans une seule invocation."},
 {q:"À quoi sert -o dans patch, et comment vérifies-tu ton résultat ?",
  a:"-o écrit le résultat dans un nouveau fichier au lieu de modifier l'original. Vérification : refaire diff a b et comparer à sw.diff ; s'ils sont identiques, b est correct par définition."},
 {q:"Quelle est la différence entre clé publique et clé privée, et laquelle rends-tu ?",
  a:"La privée reste sur ma machine et résout le défi du serveur ; elle ne se partage jamais. La publique se distribue librement et sert au serveur à vérifier. Je rends la publique, copiée sous le nom id_ed25519_pub."},
 {q:"Un camarade dit : « tout est sur mon disque, je pousserai à la fin ». Que réponds-tu ?",
  a:"Que la correction automatique clone le dépôt distant et ne voit jamais son disque : sans add, commit et push, son travail n'existe pas. Et qu'attendre la fin, c'est découvrir trop tard une clé SSH cassée ou un mauvais dépôt."}
];

/* ==========================================================================
   3. ÉTAT + PERSISTANCE
   ========================================================================== */
