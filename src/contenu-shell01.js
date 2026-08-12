/* Contenu pédagogique du module shell01.
   Les salles et les questions d'auto-évaluation, rien d'autre : ni moteur,
   ni rendu, ni style. */

const MODULE={cle:'shell01lab_v1', titre:"shell01.lab — salles d'entraînement", invite:"~/shell01.lab"};

const ROOMS=[
{
id:'s1', file:'pipe', tag:'concept', title:'Le pipe',
sub:'Brancher la sortie d\'une commande sur l\'entrée de la suivante.',
steps:[
 {k:'lesson',h:'Deux tuyaux à ne pas confondre',b:`
  <p>Une commande produit du texte sur sa <b>sortie standard</b>. Par défaut ce texte va à l'écran, mais on peut le détourner.</p>
  <p><code>&gt;</code> l'envoie dans un <b>fichier</b>. C'est ce que tu faisais dans Shell 00.</p>
  <p><code>|</code> l'envoie dans <b>une autre commande</b>, qui le reçoit sur son entrée standard. Rien n'est écrit sur le disque, tout transite en mémoire.</p>
  <p>C'est le mécanisme central de Shell 01 : au lieu de chercher la commande magique qui fait tout, tu enchaînes des outils simples qui font chacun une chose.</p>`},
 {k:'term',h:'Mission : compte sans ouvrir',
  goal:'afficher le nombre de lignes de notes.txt',
  brief:"Le fichier <code>notes.txt</code> est là. Affiche <b>uniquement</b> son nombre de lignes, en enchaînant deux commandes avec un pipe. (Oui, une seule commande suffirait ; ici on s'entraîne au tuyau.)",
  setup:sh=>{ sh.root.children['notes.txt']=fFile('lundi\nmardi\nmercredi\njeudi\nvendredi\n'); },
  terminal:'MISSION · COMPTER SANS OUVRIR', dossier:'notes', raccourcis:['cat notes.txt','man wc'],
  verif:{type:'sortie', filtre:/\|/, attendu:'5\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='5\n'; },
  hints:["La commande qui affiche un fichier, tu la connais depuis Shell 00. Celle qui compte s'appelle wc.",
         "man wc : cherche l'option qui compte les lignes.",
         "Structure : cat FICHIER | wc -OPTION"]},
 {k:'mcq',h:'',q:"Quelle est la différence entre <code>cmd &gt; f</code> et <code>cmd | f</code> ?",
  opts:["Aucune, deux écritures du même truc",
        "&gt; écrit dans un fichier, | envoie le texte à une autre commande",
        "| est plus rapide",
        "&gt; ne marche que sur les fichiers texte"],a:1,
  why:"Le premier crée ou écrase un fichier sur le disque. Le second ne touche à rien : le texte passe directement d'un programme à l'autre."},
 {k:'term',h:'Mission : mesurer une sortie',
  goal:'compter les caractères produits par une commande',
  brief:"Sans créer aucun fichier, affiche combien d'octets produit la commande qui écrit le mot <code>bonjour</code>. Le résultat doit te rappeler un piège de Shell 00.",
  setup:sh=>{},
  terminal:'MISSION · MESURER UNE SORTIE', dossier:'bac', raccourcis:['man wc'],
  verif:{type:'sortie', filtre:/\|/, attendu:'8\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='8\n'; },
  hints:["La commande qui écrit du texte, c'est echo. Celle qui compte les octets, c'est wc avec une option.",
         "echo bonjour | wc -c",
         "Et si tu obtiens 8 au lieu de 7 : echo ajoute toujours un saut de ligne, qui compte."],
  post:"7 lettres, 8 octets. Le saut de ligne ajouté par <code>echo</code> compte, exactement comme dans l'ex00 de Shell 00."},
 {k:'mcq',h:'',q:"Dans <code>a | b | c</code>, où va la sortie de <code>b</code> ?",
  opts:["À l'écran","Dans un fichier temporaire","Sur l'entrée de c","Elle est perdue"],a:2,
  why:"Chaque maillon reçoit la sortie du précédent. Seule la sortie du dernier arrive à l'écran."}
]},

{
id:'s2', file:'filtres', tag:'concept', title:'Transformer et découper',
sub:'tr remplace des caractères, cut extrait des colonnes.',
steps:[
 {k:'lesson',h:'Deux outils, deux logiques',b:`
  <p><code>tr SET1 SET2</code> travaille <b>caractère par caractère</b> : chaque caractère de SET1 rencontré est remplacé par celui de même rang dans SET2. <code>tr -d SET</code> supprime au lieu de remplacer.</p>
  <p>Point important : <code>tr</code> ne lit que <b>l'entrée standard</b>. On ne lui passe pas de nom de fichier, on le branche avec un pipe.</p>
  <p><code>cut</code> travaille <b>par colonnes</b> : <code>-d</code> choisit le séparateur, <code>-f</code> choisit les champs à garder. C'est l'outil des lignes structurées, comme celles de <code>/etc/passwd</code>.</p>`},
 {k:'term',h:'Mission : changer les séparateurs',
  goal:'produire a;b;c',
  brief:"Fais afficher exactement <code>a;b;c</code>, en partant d'une commande qui écrit <code>a b c</code>. Autrement dit : transforme les espaces en points-virgules.",
  setup:sh=>{},
  terminal:'MISSION · CHANGER LES SÉPARATEURS', dossier:'bac', raccourcis:['man tr'],
  verif:{type:'sortie', filtre:/\|/, attendu:'a;b;c\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='a;b;c\n'; },
  hints:["Deux commandes reliées par un pipe : une qui produit le texte, une qui le transforme.",
         "man tr : la forme de base prend deux ensembles de caractères.",
         "Les deux ensembles se mettent entre guillemets, un caractère de chaque côté."]},
 {k:'mcq',h:'',q:"<code>echo bonjour | tr 'on' 'ON'</code> affiche quoi ?",
  opts:['bONjour','bONjOur','BONJOUR','bonjour'],a:1,
  why:"tr remplace caractère par caractère, partout : chaque o devient O et chaque n devient N. Le deuxième o de « jour » est touché aussi. Ce n'est pas un remplacement de mot."},
 {k:'term',h:'Mission : extraire une colonne',
  goal:'afficher uniquement le troisième champ',
  brief:"Le fichier <code>ligne.txt</code> contient une ligne au format de <code>/etc/passwd</code>, avec des champs séparés par des deux-points. Affiche <b>uniquement le troisième champ</b>.",
  setup:sh=>{ sh.root.children['ligne.txt']=fFile('www-data:x:33:33:www-data:/var/www\n'); },
  terminal:'MISSION · EXTRAIRE UNE COLONNE', dossier:'comptes', raccourcis:['cat ligne.txt','man cut'],
  verif:{type:'sortie', filtre:/^(cut|cat)/, attendu:'33\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>/^(cut|cat)/.test(h));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='33\n'; },
  hints:["man cut : il te faut l'option qui définit le séparateur, et celle qui choisit les champs.",
         "Le séparateur ici est le caractère deux-points.",
         "cut accepte un nom de fichier directement, pas besoin de pipe pour celui-là."]},
 {k:'input',h:'',q:"Quelle commande supprime tous les tirets d'un flux de texte ? (juste la commande et son option, sans le pipe)",
  a:['tr -d "-"',"tr -d '-'",'tr -d -'],accept:v=>/^tr\s+-d\s*['"]?-['"]?$/.test(v),
  why:"-d supprime les caractères de l'ensemble au lieu de les remplacer."}
]},

{
id:'s3', file:'compter', tag:'concept', title:'Compter des choses',
sub:'wc, et le piège de ce qu\'on croit compter.',
steps:[
 {k:'lesson',h:'wc, trois compteurs',b:`
  <p><code>wc -l</code> compte les <b>lignes</b>, <code>-w</code> les <b>mots</b>, <code>-c</code> les <b>octets</b>.</p>
  <p>Combiné à un pipe, il compte n'importe quoi : il suffit de produire une ligne par élément à compter. C'est le motif <code>quelque chose | wc -l</code>, que tu vas réutiliser souvent.</p>
  <p>Le vrai piège n'est pas <code>wc</code>, c'est ce que tu lui envoies. <code>ls | wc -l</code> ne compte ni les fichiers cachés, ni ce qui se trouve dans les sous-dossiers.</p>`},
 {k:'mcq',h:'',q:"Un fichier contient une seule ligne : <code>salut tout le monde</code>. Que donne <code>wc -w</code> dessus ?",
  opts:['1','4','19','20'],a:1,
  why:"-w compte les mots, séparés par des espaces. -l donnerait 1, et -c compterait les octets, saut de ligne compris."},
 {k:'term',h:'Mission : compter en profondeur',
  goal:'nombre de fichiers .conf, sous-dossiers compris',
  brief:"Compte <b>tous</b> les fichiers dont le nom se termine par <code>.conf</code>, y compris ceux cachés dans les sous-dossiers. Affiche uniquement le nombre.",
  setup:sh=>{ sh.root.children['app.conf']=fFile('x');
              sh.root.children['lisezmoi.txt']=fFile('x');
              const d=fDir(); d.children['db.conf']=fFile('x'); d.children['log.txt']=fFile('x');
              const e=fDir(); e.children['deep.conf']=fFile('x'); d.children['sous']=e;
              sh.root.children['etc']=d; },
  terminal:'MISSION · COMPTER EN PROFONDEUR', dossier:'config', raccourcis:['ls','man find'],
  verif:{type:'sortie', filtre:/\|/, attendu:'3\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='3\n'; },
  hints:["ls ne descend pas dans les sous-dossiers. Tu connais depuis Shell 00 la commande qui parcourt une arborescence entière.",
         "find produit une ligne par résultat. Il ne te reste qu'à compter ces lignes.",
         "find . -name \"MOTIF\" | wc -l"]},
 {k:'mcq',h:'',q:"Ton dossier contient 4 fichiers visibles, 2 fichiers cachés et un sous-dossier avec 3 fichiers. Que renvoie <code>ls | wc -l</code> ?",
  opts:['5','6','9','10'],a:0,
  why:"ls affiche les 4 visibles plus le sous-dossier lui-même, soit 5 lignes. Il ignore les cachés et ne descend pas dedans. Compter n'est jamais le problème : bien choisir ce qu'on compte, si."}
]},

{
id:'s4', file:'grep', tag:'concept', title:'Filtrer des lignes',
sub:'Garder ce qui correspond, ou justement ce qui ne correspond pas.',
steps:[
 {k:'lesson',h:'grep garde ou jette',b:`
  <p><code>grep MOTIF</code> conserve les lignes qui contiennent le motif et jette les autres. Il lit un fichier passé en argument, ou l'entrée standard s'il est branché sur un pipe.</p>
  <p>Trois options qui reviennent tout le temps : <code>-v</code> inverse le filtre (garde ce qui ne correspond pas), <code>-i</code> ignore la casse, <code>-c</code> affiche seulement le compte au lieu des lignes.</p>
  <p><code>-v</code> est celle qu'on oublie, et c'est souvent la bonne : « enlever les commentaires » est un filtre inversé.</p>`},
 {k:'term',h:'Mission : isoler les erreurs',
  goal:'afficher seulement les lignes contenant ERROR',
  brief:"Le fichier <code>journal.log</code> mélange des lignes de plusieurs niveaux. Affiche uniquement celles qui contiennent <code>ERROR</code>.",
  setup:sh=>{ sh.root.children['journal.log']=fFile(
    'INFO demarrage\nERROR disque plein\nINFO connexion\nERROR permission refusee\nWARN memoire basse\n'); },
  terminal:'MISSION · ISOLER LES ERREURS', dossier:'journaux', raccourcis:['cat journal.log','man grep'],
  verif:{type:'sortie', filtre:/^grep/, attendu:'ERROR disque plein\nERROR permission refusee\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.startsWith('grep'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='ERROR disque plein\nERROR permission refusee\n'; },
  hints:["grep prend le motif d'abord, le fichier ensuite.","grep MOTIF FICHIER"]},
 {k:'term',h:'Mission : le filtre inversé',
  goal:'enlever les lignes de commentaire',
  brief:"Le fichier <code>reglages.conf</code> contient des lignes de commentaire qui commencent par <code>#</code>. Affiche le fichier <b>sans</b> ces lignes.",
  setup:sh=>{ sh.root.children['reglages.conf']=fFile(
    '# fichier de reglages\nport=8080\n# ne pas toucher\nhote=localhost\ndebug=false\n'); },
  terminal:'MISSION · LE FILTRE INVERSÉ', dossier:'config', raccourcis:['cat reglages.conf','man grep'],
  verif:{type:'sortie', filtre:/grep/, attendu:'port=8080\nhote=localhost\ndebug=false\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('grep'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='port=8080\nhote=localhost\ndebug=false\n'; },
  hints:["Il ne s'agit pas de garder ce qui correspond, mais de jeter ce qui correspond.",
         "man grep : cherche l'option qui inverse la sélection.",
         "grep -v MOTIF FICHIER"]},
 {k:'mcq',h:'',q:"Tu veux seulement <b>le nombre</b> de lignes contenant un motif. Deux façons de faire ?",
  opts:["Seulement grep -c","Seulement grep | wc -l",
        "grep -c, ou bien grep suivi de wc -l : les deux marchent",
        "Aucune, il faut compter à la main"],a:2,
  why:"Savoir qu'un même résultat s'obtient par plusieurs chemins fait partie du métier. -c est plus direct, le pipe est plus général."}
]},

{
id:'s5', file:'variables', tag:'concept', title:'Variables d\'environnement',
sub:'Du texte rangé sous un nom, et le moment où le shell le remplace.',
steps:[
 {k:'lesson',h:'Le shell remplace avant d\'exécuter',b:`
  <p>Une variable d'environnement est un nom associé à du texte. On la définit avec <code>export NOM=valeur</code> et on lit sa valeur avec <code>$NOM</code>.</p>
  <p>Le point clé : <b>le shell remplace <code>$NOM</code> par sa valeur avant de lancer la commande</b>. La commande, elle, ne voit jamais le <code>$</code>, elle reçoit déjà le texte final.</p>
  <p>Conséquence directe sur les guillemets : <code>"..."</code> laisse le remplacement se faire, <code>'...'</code> le bloque et garde le texte tel quel. Cette distinction va te servir tout de suite après.</p>`},
 {k:'term',h:'Mission : définir puis utiliser',
  goal:'utiliser une variable comme argument',
  brief:"Range le texte <code>daemon</code> dans une variable nommée <code>CIBLE</code>, puis affiche les groupes de cet utilisateur en passant <b>la variable</b> à la commande, pas le mot écrit en dur. (<code>man id</code> est disponible.)",
  setup:sh=>{},
  terminal:'MISSION · DÉFINIR PUIS UTILISER', dossier:'bac', raccourcis:['env','man id'],
  verif:{type:'criteres', criteres:[
    {label:"la variable CIBLE contient daemon", test:sh=>sh.env.CIBLE==='daemon'},
    {label:"tu passes la variable à la commande, pas le mot en dur",
     test:(sh,h)=>h.some(c=>/\$CIBLE/.test(c)&&/^id\b/.test(c))}]},
  check:(sh,hist)=>sh.env.CIBLE==='daemon' && hist.some(h=>/\$CIBLE/.test(h)&&/^id\b/.test(h)),
  hints:["Pour définir : export NOM=valeur, sans espace autour du signe égal.",
         "man id : il te faut l'option qui n'affiche que les groupes, et celle qui affiche des noms.",
         "id -Gn $CIBLE"]},
 {k:'mcq',h:'',q:"<code>V</code> vaut <code>42</code>. Qu'affiche <code>echo '$V'</code> avec des guillemets <b>simples</b> ?",
  opts:['42','$V','V','rien'],a:1,
  why:"Les guillemets simples bloquent le remplacement. Avec des guillemets doubles tu obtiendrais 42."},
 {k:'input',h:'',q:"La variable <code>CIBLE</code> existe. Écris la commande qui affiche simplement sa valeur.",
  a:['echo $CIBLE'],accept:v=>/^echo\s+"?\$CIBLE"?$/.test(v),
  why:"Sans le $, tu affiches le texte « CIBLE » au lieu de son contenu. Le $ est ce qui dit au shell « remplace ceci par la valeur »."},
 {k:'mcq',h:'',q:"Une variable qui n'a jamais été définie est remplacée par quoi ?",
  opts:['Une erreur','Son nom','Rien du tout, une chaîne vide','Zéro'],a:2,
  why:"Le shell la remplace silencieusement par du vide. C'est une source d'erreurs classique : ta commande tourne, mais avec un argument manquant."}
]},

{
id:'s6', file:'quoting', tag:'concept', title:'Protéger les caractères spéciaux',
sub:'Espaces, $, guillemets : dire au shell de ne pas y toucher.',
steps:[
 {k:'lesson',h:'Le shell lit avant tout le monde',b:`
  <p>Avant de lancer quoi que ce soit, le shell découpe ta ligne sur les <b>espaces</b>, remplace les <b>$variables</b>, développe les <b>*</b>. Les caractères qui déclenchent ces traitements sont dits spéciaux.</p>
  <p>Trois façons de les neutraliser :</p>
  <ul>
   <li><code>'texte'</code> : tout est littéral, rien n'est interprété. La protection la plus forte.</li>
   <li><code>"texte"</code> : les espaces sont protégés, mais les <code>$</code> sont encore remplacés.</li>
   <li><code>\\c</code> : protège le caractère qui suit, un seul.</li>
  </ul>
  <p>C'est tout l'objet d'un exercice de ce module : fabriquer un nom de fichier bourré de caractères hostiles. Le savoir-faire n'est pas de retenir la réponse, c'est de savoir quel type de guillemets choisit-on selon ce qu'on veut protéger.</p>`},
 {k:'term',h:'Mission : un nom hostile',
  goal:'créer le fichier nommé  a b$c',
  brief:"Crée un fichier dont le nom est exactement <code>a b$c</code> (un espace au milieu, un dollar avant le c) et qui contient le texte <code>ok</code>. Vérifie ensuite avec <code>ls</code> que tu n'as pas créé deux fichiers.",
  setup:sh=>{},
  terminal:'MISSION · UN NOM HOSTILE', dossier:'bac', raccourcis:['ls'],
  verif:{type:'criteres', criteres:[
    {label:"le fichier « a b$c » existe et contient ok", test:sh=>{const n=lookup(sh,'a b$c'); return !!n&&n.type==='file'&&n.content==='ok\n';}},
    {label:"tu n'en as pas créé deux au passage", test:sh=>Object.keys(sh.root.children).length===1}]},
  check:sh=>{ const n=lookup(sh,'a b$c');
    return !!n&&n.type==='file'&&n.content==='ok\n'&&Object.keys(sh.root.children).length===1; },
  hints:["Sans protection, le shell voit deux arguments à cause de l'espace, et remplace $c par du vide.",
         "Il te faut la protection la plus forte, celle qui rend tout littéral.",
         "Entoure le nom entier de guillemets simples."],
  post:"Avec des guillemets doubles, le <code>$c</code> aurait disparu. C'est exactement la différence entre les deux."},
 {k:'mcq',h:'',q:"Tu veux un fichier nommé <code>rapport final.txt</code>. Que se passe-t-il si tu oublies les guillemets ?",
  opts:["Une erreur de syntaxe","Le shell crée deux fichiers, rapport et final.txt",
        "Le fichier est créé avec un underscore","Rien, le shell devine"],a:1,
  why:"L'espace est un séparateur d'arguments. La commande reçoit deux noms au lieu d'un."},
 {k:'mcq',h:'',q:"Quelle est la différence entre <code>'</code> et <code>\"</code> ?",
  opts:["Aucune","Les simples bloquent tout, les doubles laissent passer le remplacement des variables",
        "Les doubles bloquent tout","Les simples ne marchent que sur les noms de fichiers"],a:1,
  why:"D'où la règle pratique : doubles quand tu veux encore une variable dedans, simples quand tu veux du littéral pur."}
]},

{
id:'s7', file:'tri', tag:'concept', title:'Trier, trancher, retourner',
sub:'sort, head, tail, rev : et le piège qui les sépare.',
steps:[
 {k:'lesson',h:'Quatre outils voisins',b:`
  <p><code>sort</code> trie les lignes par ordre alphabétique, <code>sort -r</code> dans l'ordre inverse.</p>
  <p><code>head -n N</code> garde les N premières lignes, <code>tail -n N</code> les N dernières.</p>
  <p><code>rev</code> retourne <b>chaque ligne</b> caractère par caractère. C'est le piège : il ne retourne pas l'ordre des lignes, seulement leur contenu.</p>
  <p>Enchaînés, ils découpent n'importe quel flux : trier puis garder le début, ou garder une tranche du milieu en combinant head et tail.</p>`},
 {k:'term',h:'Mission : le podium inversé',
  goal:'les deux premières lignes du tri décroissant',
  brief:"Le fichier <code>noms.txt</code> contient des prénoms en désordre. Affiche les <b>deux premières lignes</b> du classement alphabétique <b>inversé</b>.",
  setup:sh=>{ sh.root.children['noms.txt']=fFile('camille\nadrien\nzoe\nmarine\nbastien\n'); },
  terminal:'MISSION · LE PODIUM INVERSÉ', dossier:'noms', raccourcis:['cat noms.txt','man sort','man head'],
  verif:{type:'sortie', filtre:/\|/, attendu:'zoe\nmarine\n'},
  check:(sh,hist)=>{ const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    const r=run(newShellFrom(sh),last);
    return r.out==='zoe\nmarine\n'; },
  hints:["Deux commandes reliées par un pipe : d'abord trier, ensuite tronquer.",
         "man sort pour l'ordre inverse, man head pour le nombre de lignes.",
         "sort -r FICHIER | head -n 2"]},
 {k:'mcq',h:'',q:"Un fichier contient <code>abc</code> puis <code>def</code>, dans cet ordre. Que donne <code>rev</code> dessus ?",
  opts:['def puis abc','cba puis fed','fed puis cba','abc puis def'],a:1,
  why:"rev retourne le contenu de chaque ligne, sans changer l'ordre des lignes. Pour inverser l'ordre des lignes, c'est tac ou sort -r selon ce que tu veux."},
 {k:'input',h:'',q:"Écris la commande qui affiche les 3 dernières lignes du fichier <code>journal.log</code>.",
  a:['tail -n 3 journal.log'],accept:v=>/^tail\s+(-n\s*3|-3)\s+journal\.log$/.test(v),
  why:"head et tail prennent le même -n. Sans option, ils en donnent 10."},
 {k:'mcq',h:'',q:"Pourquoi enchaîner <code>sort</code> puis <code>head</code> plutôt que l'inverse ?",
  opts:["C'est pareil","head prendrait les premières lignes du désordre, avant tout tri",
        "sort ne marche pas après head","Question de vitesse uniquement"],a:1,
  why:"Dans un pipeline, l'ordre est la logique. Chaque maillon ne voit que ce que le précédent lui a laissé."}
]},

{
id:'s8', file:'autoeval', tag:'boss', title:'Auto-évaluation', boss:true,
sub:'Dix questions de concept, à voix haute, sans lire.',
steps:[
 {k:'lesson',h:'Règle du jeu',b:`
  <p>Ces questions ne portent pas sur les réponses des exercices, mais sur les mécanismes qui les sous-tendent. Si tu les maîtrises, tu construis tes propres commandes ; sinon, tu recopies celles des autres.</p>
  <p>Réponds <b>à voix haute et en entier</b> avant de révéler. Sois honnête : si tu as dû lire, coche « pas encore ».</p>`},
 {k:'viva'}
]}
];

const VIVA=[
 {q:"Explique la différence entre > et | à quelqu'un qui débute.",
  a:"Les deux détournent la sortie d'une commande. Le chevron l'écrit dans un fichier sur le disque, en écrasant ce qu'il contenait. Le pipe l'envoie à une autre commande, qui la reçoit sur son entrée standard : rien n'est écrit, tout transite en mémoire."},
 {q:"Pourquoi tr n'accepte-t-il pas de nom de fichier, et comment fait-on alors ?",
  a:"tr ne lit que l'entrée standard. On le branche donc avec un pipe : une commande produit le texte, tr le transforme. C'est aussi ce qui explique qu'il travaille caractère par caractère sans notion de fichier ni de ligne."},
 {q:"Quelle est la différence entre tr et cut ?",
  a:"tr remplace ou supprime des caractères, un par un, partout où ils apparaissent. cut découpe chaque ligne en champs séparés par un délimiteur et en garde certains. L'un pense en caractères, l'autre en colonnes."},
 {q:"Ton dossier a 4 fichiers visibles, 2 cachés, et un sous-dossier contenant 3 fichiers. Pourquoi ls | wc -l ne donne pas 9 ?",
  a:"Parce que ls masque les fichiers cachés et ne descend pas dans les sous-dossiers. Il liste 4 fichiers plus le sous-dossier, donc 5 lignes. Pour compter en profondeur il faut find, qui parcourt toute l'arborescence."},
 {q:"À quoi sert grep -v, et donne un cas où c'est la bonne option.",
  a:"Il inverse le filtre : il garde les lignes qui ne contiennent pas le motif. C'est la bonne option dès qu'on veut retirer quelque chose, typiquement enlever les lignes de commentaire d'un fichier de configuration."},
 {q:"Que fait le shell avec $VAR avant de lancer la commande ?",
  a:"Il remplace $VAR par sa valeur avant même de lancer le programme. La commande reçoit donc déjà le texte final et ne voit jamais le dollar. Si la variable n'existe pas, le remplacement se fait quand même, par une chaîne vide."},
 {q:"Guillemets simples ou doubles : comment choisis-tu ?",
  a:"Les simples rendent tout littéral, rien n'est interprété. Les doubles protègent les espaces mais laissent le shell remplacer les variables. Donc simples pour du texte pur, doubles quand j'ai besoin qu'une variable soit encore développée à l'intérieur."},
 {q:"Tu dois créer un fichier dont le nom contient un espace et un dollar. Quel est le risque et comment tu t'en protèges ?",
  a:"Sans protection, le shell découpe sur l'espace et crée deux arguments, et il remplace le dollar suivi d'un nom par une variable, souvent vide. J'entoure le nom entier de guillemets simples, qui neutralisent les deux traitements."},
 {q:"Quelle est la différence entre rev et sort -r ?",
  a:"rev retourne le contenu de chaque ligne, caractère par caractère, sans toucher à l'ordre des lignes. sort -r ne touche pas au contenu mais range les lignes dans l'ordre alphabétique inverse. On les confond souvent parce que les deux évoquent l'inversion."},
 {q:"Dans un pipeline de trois commandes, pourquoi l'ordre compte-t-il ?",
  a:"Chaque maillon ne voit que ce que le précédent lui a laissé. Trier puis garder les deux premières lignes donne le sommet du classement ; garder deux lignes puis trier ne trie que ces deux lignes-là. La logique du résultat est portée par l'ordre."}
];

/* ==========================================================================
   3. ÉTAT + PERSISTANCE
   ========================================================================== */
