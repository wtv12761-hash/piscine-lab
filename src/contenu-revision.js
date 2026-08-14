/* Contenu pédagogique du module revision.
   Cible : la machine de l'école, sous Ubuntu, la veille de l'exam 00.

   Ce module ne rejoue pas les exercices du sujet : il couvre ce qui les
   entoure et qui fait échouer des rendus corrects. L'outillage d'abord
   (en-tête, norme, compilation, rendu), puis une reprise des notions de
   Shell 00 et C 00 jusqu'à l'exercice 05.

   Rien ici ne suppose une machine personnelle : pas de WSL, pas
   d'installation. Sur les postes de l'école tout est déjà là. */

const MODULE={cle:'revisionlab_v1', titre:"revision.lab — prêt pour l'exam", invite:"~/revision.lab"};

const ROOMS=[

/* ------------------------------------------------------------------ v0
   Placée en premier volontairement : le jour de l'examen, la procédure fait
   plus de dégâts que le code. */
{
id:'v0', file:'examen', tag:'base', title:'Le jour de l\'examen',
sub:"La procédure d'entrée, l'arborescence de rendu, et ce qui n'est pas noté.",
steps:[
 {k:'lesson',h:'Ce n\'est pas une session normale',b:`
  <p>Le jour de l'examen, les machines du cluster sont redémarrées en <b>mode examen</b>. Tu ne te connectes pas avec ton compte habituel.</p>
  <ol>
   <li>Connexion à la machine avec l'identifiant <code>exam</code> et le mot de passe <code>exam</code>.</li>
   <li>Dans un terminal : <code>kinit tonlogin</code>, puis ton mot de passe d'intranet.</li>
   <li>Lancement de <code>examshell</code>, et là tu t'identifies avec tes vrais identifiants.</li>
  </ol>
  <p><b>Le point qui coûte le plus cher :</b> plusieurs campus n'accordent qu'une dizaine de minutes après l'heure officielle pour être entré dans <code>examshell</code>. Passé ce délai, l'examen se termine tout seul. Des témoignages font état de cohortes entières perdues là-dessus, sans avoir écrit une ligne de code.</p>
  <p>Sois devant la machine <b>avant</b> l'heure, et fais la séquence d'entrée en premier, avant même de lire le sujet.</p>`},

 {k:'lesson',h:'Quatre dossiers, et un que tu dois créer toi-même',b:`
  <p>Ton dossier personnel dans l'examen contient :</p>
  <ul>
   <li><code>subjects</code> — l'énoncé de l'exercice en cours.</li>
   <li><code>rendu</code> — l'endroit où ta réponse doit atterrir.</li>
   <li><code>traces</code> — le retour détaillé quand un rendu échoue. C'est là qu'on va comprendre pourquoi.</li>
   <li>un dossier de documentation, avec la ligne de compilation exacte.</li>
  </ul>
  <p><b>Aucun dossier d'exercice n'est créé pour toi.</b> Tu crées toi-même <code>rendu/nom_de_l_exercice/</code>, orthographié <b>exactement</b> comme l'énoncé le nomme. Un programme parfait dans un chemin mal écrit compte pour zéro, sans point partiel.</p>
  <p>Recopie le nom caractère par caractère depuis le sujet avant d'écrire la moindre ligne.</p>`},

 {k:'lesson',h:'Rendre : quatre commandes, puis grademe',b:`
  <p>Le rendu passe par git, comme pour les projets, avec une étape en plus :</p>
  <ol>
   <li><code>git add</code> ton fichier</li>
   <li><code>git commit -m "un message"</code></li>
   <li><code>git push</code></li>
   <li>dans <code>examshell</code>, taper <code>grademe</code> et confirmer par <code>y</code></li>
  </ol>
  <p>Pousser ne suffit pas : sans <code>grademe</code>, rien n'est corrigé. Et <code>grademe</code> ne voit que ce qui a été poussé : un fichier écrit mais non commité n'existe pas pour lui.</p>
  <p>Avant de lancer <code>grademe</code>, <code>git ls-files</code> te dit exactement ce que tu as envoyé. C'est le moyen de vérifier que tu n'as pas poussé ton main de test par accident quand l'énoncé ne demandait qu'une fonction.</p>
  <p>La réponse est binaire : réussi ou échoué. En cas d'échec, <code>traces</code> contient le détail.</p>`},

 {k:'lesson',h:'Ce qui n\'est PAS vérifié à l\'examen',b:`
  <p>Deux choses que tu appliques religieusement dans les projets ne sont pas contrôlées à l'examen, et le savoir te rend des minutes :</p>
  <ul>
   <li><b>La norme n'est pas vérifiée.</b> norminette ne tourne pas sur les rendus d'examen. Ne perds pas de temps à découper une fonction pour tenir en 25 lignes ou à renommer des variables.</li>
   <li><b>L'en-tête 42 n'est pas exigé.</b> Inutile de le poser sur chaque fichier.</li>
  </ul>
  <p>Ce qui est vérifié, en revanche : que ça <b>compile</b> avec <code>-Wall -Wextra -Werror</code>, que tu n'utilises que les fonctions autorisées, et que la sortie soit <b>exactement</b> celle attendue, octet pour octet.</p>
  <p>Lis l'énoncé pour savoir s'il demande une fonction ou un programme complet : la présence d'un <code>main</code> dépend de ça, et de rien d'autre.</p>`},

 {k:'mcq',h:'',q:"Tu as écrit ton fichier, fait <code>git add</code>, <code>git commit</code> et <code>git push</code>. Es-tu noté ?",
  opts:["Oui, le push déclenche la correction","Non, il faut encore lancer grademe et confirmer","Oui après quelques minutes","Seulement si le fichier passe norminette"],a:1,
  why:"Le push envoie, grademe demande la correction. Ce sont deux gestes distincts, et oublier le second rend un exercice invisible."},

 {k:'mcq',h:'',q:"Faut-il poser l'en-tête 42 sur tes fichiers d'examen ?",
  opts:["Oui, comme pour les projets","Non, il n'est pas exigé à l'examen","Seulement sur le premier fichier","Seulement si l'énoncé le demande"],a:1,
  why:"L'examen contrôle la compilation, les fonctions autorisées et la sortie exacte. Ni la norme ni l'en-tête n'y sont vérifiés."},

 {k:'mcq',h:'',q:"L'énoncé nomme l'exercice <code>aff_a</code>. Où mets-tu ton fichier ?",
  opts:["Dans rendu/, à la racine","Dans un dossier rendu/aff_a/ que tu crées","Dans subjects/aff_a/","Le dossier est créé automatiquement"],a:1,
  why:"Rien n'est créé pour toi. Le dossier porte le nom exact de l'exercice, et une faute de frappe vaut zéro."}
]},

/* ------------------------------------------------------------------ v1 */
{
id:'v1', file:'poste', tag:'base', title:'Le poste de l\'école',
sub:"Se repérer dans un terminal Ubuntu, et créer l'arborescence qu'un rendu exige.",
steps:[
 {k:'lesson',h:'Où tu es, et pourquoi ça compte',b:`
  <p>Un terminal est toujours <b>quelque part</b>. Cet endroit s'appelle le répertoire courant, et toute commande que tu tapes s'y applique par défaut. Rendre un exercice dans le mauvais dossier est un rendu vide : la Moulinette regarde un chemin précis, pas « quelque part sur ta session ».</p>
  <p>Trois commandes suffisent à ne jamais être perdu :</p>
  <ul>
   <li><code>pwd</code> répond « où suis-je », en chemin absolu depuis la racine.</li>
   <li><code>ls</code> répond « qu'y a-t-il ici ».</li>
   <li><code>cd</code> déplace. <code>cd ..</code> remonte d'un cran, <code>cd</code> seul ramène à ta maison.</li>
  </ul>
  <p>Un chemin qui commence par <code>/</code> part de la racine du système : il est absolu, il veut dire la même chose d'où que tu le tapes. Un chemin sans <code>/</code> devant part de là où tu es : il est relatif, et il change de sens selon ta position.</p>`},

 {k:'lesson',h:'Un dossier par exercice, et rien de plus',b:`
  <p>Chaque exercice du sujet indique un <b>dossier de rendu</b> : <code>ex00/</code>, <code>ex01/</code>, et ainsi de suite. Le sujet ajoute une phrase que peu de gens lisent jusqu'au bout :</p>
  <p><i>« You cannot leave any additional file in your directory beyond those specified in the assignment. »</i></p>
  <p>Un fichier en trop dans un dossier d'exercice, même inoffensif, même un binaire compilé oublié, peut faire refuser le rendu. Compile ailleurs, ou supprime le binaire avant de rendre.</p>`},

 {k:'term',h:'Mission : fabriquer l\'arborescence de rendu',
  goal:'un dossier ex00 contenant uniquement un fichier consigne.txt',
  brief:"Tu arrives sur un dossier vide. Crée un dossier <code>ex00</code>, puis dedans un fichier <code>consigne.txt</code> qui contient exactement <code>rendre ici</code>.",
  setup:sh=>{},
  terminal:'MISSION · ARBORESCENCE', dossier:'bac', raccourcis:['pwd','ls -l','ls ex00'],
  verif:{type:'contenu', fichier:'ex00/consigne.txt', attendu:'rendre ici\n'},
  check:sh=>{ const n=lookup(sh,'ex00/consigne.txt'); return !!n&&n.type==='file'&&n.content==='rendre ici\n'; },
  hints:["Le dossier se crée avec mkdir. Ensuite il faut écrire dedans.",
         "echo écrit du texte, > le détourne vers un fichier. Le chemin peut contenir un slash.",
         "mkdir ex00 puis echo rendre ici > ex00/consigne.txt"]},

 {k:'mcq',h:'',q:"Tu es dans <code>~/exam</code> et tu tapes <code>cd ex00</code> puis <code>cd ..</code>. Où es-tu ?",
  opts:["Dans ~/exam/ex00","Dans ~/exam","À la racine /","Dans ta maison ~"],a:1,
  why:"<code>..</code> désigne le dossier parent. Tu descends d'un cran puis tu remontes du même cran, donc tu reviens à ton point de départ."},

 {k:'mcq',h:'',q:"Quelle commande te dit avec certitude dans quel dossier tu es sur le point de rendre ?",
  opts:["ls","pwd","cd","whoami"],a:1,
  why:"<code>pwd</code> affiche le chemin absolu. C'est le seul moyen d'être sûr, parce que le nom affiché dans l'invite peut être raccourci ou personnalisé."}
]},

/* ------------------------------------------------------------------ v2 */
{
id:'v2', file:'header', tag:'base', title:'L\'en-tête 42 sous vim',
sub:"Sans lui, norminette refuse le fichier avant même de regarder le code.",
steps:[
 {k:'lesson',h:'Ce que c\'est, et pourquoi il est obligatoire',b:`
  <p>Tout fichier <code>.c</code> et <code>.h</code> rendu à 42 commence par un bloc de commentaire de onze lignes, avec un dessin en art ASCII. Ce n'est pas décoratif : le sujet le dit, <i>« Norminette checks for its presence anyway! »</i></p>
  <p>Un fichier sans en-tête est refusé, quel que soit le code en dessous. C'est le premier contrôle, et c'est celui qui coûte le plus cher pour la raison la plus bête.</p>
  <p>Chaque ligne de l'en-tête fait <b>exactement 80 colonnes</b>. Le nom du fichier et ton login y sont insérés avec un remplissage calculé pour que les motifs de droite restent alignés. C'est pourquoi le modifier à la main casse tout : changer un login plus long décale la fin de ligne, la ligne dépasse 80 colonnes, et norminette rend <code>LINE_TOO_LONG</code> sur un en-tête que tu croyais cosmétique.</p>`},

 {k:'lesson',h:'La bonne manière : le plugin, pas le clavier',b:`
  <p>Sur les machines de l'école, vim est déjà configuré avec le plugin d'en-tête. Tu n'installes rien. La Norme le dit elle-même : l'en-tête « est naturellement disponible sur les machines des clusters ».</p>
  <ul>
   <li>Ouvre ton fichier : <code>vim ft_exemple.c</code></li>
   <li>En mode normal, appuie sur <b>F1</b>. L'en-tête s'insère, aligné, daté, à ta place.</li>
   <li>La commande <code>:Stdheader</code> fait exactement la même chose, et marche toujours.</li>
  </ul>
  <p><b>Attention à une confusion répandue.</b> Beaucoup de monde dira « Ctrl + H ». C'est vrai, mais dans <b>Emacs</b>, où le raccourci est <code>C-c C-h</code>. Le plugin vim officiel de 42 ne contient aucune liaison Ctrl + H. Dans un terminal, Ctrl + H et la touche Retour arrière envoient de toute façon le même octet, ce qui en ferait un mauvais raccourci. Trois éditeurs, trois touches : <b>vim F1</b>, <b>Emacs C-c C-h</b>, <b>VS Code Ctrl + Alt + H</b>.</p>
  <p>Le plugin lit ton identité dans l'environnement du terminal. S'il écrit <code>marvin</code>, c'est que la variable n'est pas définie dans ta session. Tu la poses toi-même :</p>
  <p><code>export USER=tonlogin</code></p>
  <p>Attention à une chose : <code>vim stdheader</code> n'est pas une commande. Ça ouvre un fichier vide nommé « stdheader ». Le plugin s'utilise <b>depuis l'intérieur</b> de vim, sur un fichier déjà ouvert.</p>`},

 {k:'lesson',h:'Sortir de vim, puisqu\'il faut bien en parler',b:`
  <p>vim a deux états. À l'ouverture tu es en mode <b>normal</b> : les touches sont des commandes, pas du texte. Tu tapes <code>i</code> pour passer en mode <b>insertion</b> et écrire. Tu appuies sur <b>Échap</b> pour revenir au mode normal.</p>
  <p>Depuis le mode normal :</p>
  <ul>
   <li><code>:w</code> enregistre</li>
   <li><code>:q</code> quitte</li>
   <li><code>:wq</code> enregistre et quitte</li>
   <li><code>:q!</code> quitte en jetant les modifications</li>
  </ul>
  <p>Si tu tapes du texte et qu'il ne s'affiche pas, c'est que tu es en mode normal. Échap, puis <code>i</code>.</p>`},

 {k:'mcq',h:'',q:"Ton fichier compile et fait exactement la bonne sortie, mais norminette rend <code>INVALID_HEADER</code>. Que se passe-t-il ?",
  opts:["Le code est faux","L'en-tête 42 manque ou est déformé","Le fichier est mal nommé","Il manque un include"],a:1,
  why:"norminette contrôle l'en-tête avant le code. Un fichier parfait sans en-tête est refusé, et le message ne parle pas du tout du code."},

 {k:'mcq',h:'',q:"Tu as changé ton login à la main dans l'en-tête et norminette rend maintenant <code>LINE_TOO_LONG</code>. Pourquoi ?",
  opts:["Le login est interdit","La ligne dépasse 80 colonnes car le remplissage n'a pas été recalculé","norminette n'aime pas les majuscules","Il faut recompiler"],a:1,
  why:"Chaque ligne de l'en-tête fait exactement 80 colonnes. Un login plus long pousse la fin de ligne au-delà. Le plugin recalcule le remplissage ; le clavier, non."},

 {k:'input',h:'',q:"Dans vim, quelle commande insère l'en-tête 42 ? Écris la commande, deux-points compris.",
  attendu:[':stdheader','stdheader',':stdheader<cr>'],
  why:"<code>:Stdheader</code>, ou la touche F1 en mode normal. Ce n'est pas Ctrl + H : celui-là appartient à Emacs."}
]},

/* ------------------------------------------------------------------ v3 */
{
id:'v3', file:'norme', tag:'base', title:'norminette : lire le refus',
sub:"Quatre erreurs font l'essentiel des refus, et chacune se corrige en une ligne.",
steps:[
 {k:'lesson',h:'À quoi elle sert vraiment',b:`
  <p>La Norme est un ensemble de règles d'écriture communes à toute l'école : indentation, longueur des lignes, nommage, structure des fonctions. <code>norminette</code> est le programme qui les vérifie.</p>
  <p>Le sujet est direct là-dessus : <i>« Submitting work that doesn't pass norminette's check makes no sense. »</i> La Moulinette lance norminette en premier. Si ça ne passe pas, elle ne lit pas ton code.</p>
  <p>Sur les postes de l'école, elle est déjà installée. Tu tapes simplement :</p>
  <p><code>norminette ft_exemple.c</code></p>
  <p>Elle répond <code>OK!</code>, ou elle liste les erreurs avec leur numéro de ligne.</p>`},

 {k:'lesson',h:'Les quatre refus que tu verras',b:`
  <ul>
   <li><code>INVALID_HEADER</code> — l'en-tête 42 manque ou est déformé. Ctrl + H dans vim.</li>
   <li><code>LINE_TOO_LONG</code> — une ligne dépasse 80 colonnes. Coupe-la.</li>
   <li><code>SPACE_REPLACE_TAB</code> — tu as indenté avec des espaces. À 42 l'indentation se fait à la <b>tabulation</b>.</li>
   <li><code>SPC_BEFORE_NL</code> — un espace traîne en fin de ligne. Invisible à l'œil, fatal pour la norme.</li>
  </ul>
  <p>Une cinquième cause n'est pas une erreur de norme mais tue tout autant : les fins de ligne Windows. Un fichier écrit sous Windows contient un caractère invisible en plus à chaque ligne. Sur les machines de l'école, écrites sous Linux, le problème ne se pose pas. Il apparaît dès que tu transportes un fichier depuis une machine personnelle.</p>`},

 {k:'term',h:'Mission : faire parler norminette',
  goal:'norminette doit répondre OK! sur le fichier',
  brief:"Le dossier contient <code>brouillon.c</code>, qui n'a pas d'en-tête. Lance norminette dessus pour voir le refus, puis regarde ce qu'elle reproche exactement.",
  setup:sh=>{ sh.root.children['brouillon.c']=fFile('#include <unistd.h>\n\nvoid\tft_cadre(void)\n{\n}\n'); },
  terminal:'MISSION · NORME', dossier:'bac', raccourcis:['norminette brouillon.c','cat brouillon.c'],
  verif:{type:'sortie', filtre:/^norminette/, attendu:'brouillon.c: Error!\nError: INVALID_HEADER      (line   1): en-tête 42 manquant ou mal formé\n'},
  check:sh=>true,
  hints:["La commande prend le nom du fichier en argument.",
         "norminette brouillon.c"]},

 {k:'mcq',h:'',q:"norminette rend <code>SPACE_REPLACE_TAB</code>. Qu'est-ce que tu corriges ?",
  opts:["Tu remplaces les tabulations par des espaces","Tu remplaces les espaces d'indentation par des tabulations","Tu supprimes les lignes vides","Tu renommes le fichier"],a:1,
  why:"À 42 l'indentation se fait à la tabulation. Le nom de l'erreur se lit « space, replace [by] tab » : c'est l'espace qui doit céder la place."},

 {k:'mcq',h:'',q:"Ton fichier passe norminette. Est-il rendu ?",
  opts:["Oui, norminette valide le rendu","Non, elle ne vérifie que l'écriture, pas le comportement ni le rendu","Oui si le fichier est dans le bon dossier","Non, il faut aussi lancer la Moulinette soi-même"],a:1,
  why:"norminette ne contrôle que la forme. Un fichier peut être impeccable au sens de la norme, ne rien afficher de juste, et n'avoir jamais été poussé."}
]},

/* ------------------------------------------------------------------ v4 */
{
id:'v4', file:'compiler', tag:'base', title:'Compiler pour tester',
sub:"Les trois flags de la Moulinette, et pourquoi une fonction seule ne se lie pas.",
steps:[
 {k:'lesson',h:'La commande, et rien d\'autre à retenir',b:`
  <p>Le sujet fixe les conditions : <i>« Moulinette compiles with the following flags: -Wall -Wextra -Werror, using cc. »</i> Et juste après : <i>« If your program does not compile, you will receive a grade of 0. »</i></p>
  <p>Donc tu compiles exactement comme elle :</p>
  <p><code>cc -Wall -Wextra -Werror fichier.c -o prog</code></p>
  <ul>
   <li><code>-Wall</code> et <code>-Wextra</code> activent les avertissements, y compris ceux qu'on ignore d'habitude.</li>
   <li><code>-Werror</code> transforme chaque avertissement en erreur. Rien ne passe.</li>
   <li><code>-o prog</code> nomme le programme produit. Sans lui, tu obtiens <code>a.out</code>.</li>
  </ul>
  <p>Puis tu le lances avec <code>./prog</code>. Le <code>./</code> n'est pas décoratif : il dit « le programme est ici, dans ce dossier ».</p>`},

 {k:'lesson',h:'Pourquoi ta fonction seule refuse de compiler',b:`
  <p>Tu écris <code>ft_exemple.c</code>, il contient une seule fonction, tu compiles, et tu obtiens :</p>
  <p><code>undefined reference to 'main'</code></p>
  <p>Ce n'est pas une erreur dans ton code. Un programme a besoin d'un point de départ, et ce point s'appelle <code>main</code>. Ta fonction seule n'en a pas, donc il n'y a rien à lancer.</p>
  <p>C'est même exigé : le sujet interdit de rendre un <code>main</code> quand il demande une fonction. <i>« You only need to submit a main() function if we specifically ask for a program. »</i></p>
  <p>Deux façons de tester quand même :</p>
  <ul>
   <li>Écrire un <code>main</code> dans un <b>fichier à part</b>, et compiler les deux ensemble. Ce fichier ne se rend pas.</li>
   <li>Compiler avec <code>-c</code>, qui vérifie la compilation sans essayer de lier. Utile pour la norme et les avertissements, mais ne produit pas de programme à lancer.</li>
  </ul>
  <p>Retiens la différence, elle change à l'examen : dans un <b>projet</b> on rend une fonction sans main, à l'<b>examen</b> on demande souvent un programme, et là le main est obligatoire.</p>`},

 {k:'term',h:'Mission : compiler et lancer',
  goal:'produire un programme nommé prog et le lancer',
  brief:"Le dossier contient <code>ft_bip.c</code> (une fonction) et <code>essai.c</code> (un main de test). Compile les deux ensemble avec les flags de la Moulinette, en nommant le résultat <code>prog</code>.",
  setup:sh=>{
    const H='/* '+'*'.repeat(74)+' */';
    sh.root.children['ft_bip.c']=fFile(H+'\n#include <unistd.h>\n\nvoid\tft_bip(char c)\n{\n\twrite(1, &c, 1);\n}\n');
    sh.root.children['essai.c']=fFile(H+'\nvoid\tft_bip(char c);\nint\tmain(void)\n{\n\tft_bip(65);\n\treturn (0);\n}\n');
  },
  terminal:'MISSION · COMPILATION', dossier:'bac', raccourcis:['ls','cc -Wall -Wextra -Werror ft_bip.c essai.c -o prog'],
  verif:{type:'contenu', fichier:'prog', attendu:''},
  check:sh=>{ const n=lookup(sh,'prog'); return !!n&&n.type==='file'; },
  hints:["La forme est : cc puis les trois flags, puis les fichiers .c, puis -o et le nom voulu.",
         "Les deux fichiers se mettent à la suite, séparés par une espace.",
         "cc -Wall -Wextra -Werror ft_bip.c essai.c -o prog"]},

 {k:'mcq',h:'',q:"Tu compiles une fonction de projet seule et tu obtiens <code>undefined reference to 'main'</code>. Que fais-tu ?",
  opts:["Tu ajoutes un main dans le fichier à rendre","Tu écris un main dans un fichier séparé, non rendu","Tu ignores, ça compilera chez le correcteur","Tu renommes ta fonction en main"],a:1,
  why:"Ajouter un main au fichier rendu le fait refuser : le sujet l'interdit quand il demande une fonction. Le main de test vit dans un fichier à part qui ne part pas au rendu."},

 {k:'mcq',h:'',q:"À quoi sert <code>-Werror</code> ?",
  opts:["À afficher plus d'erreurs","À transformer les avertissements en erreurs","À ignorer les avertissements","À produire un exécutable plus rapide"],a:1,
  why:"Sans lui un avertissement laisse quand même passer la compilation. Avec lui, le moindre avertissement arrête tout. C'est la raison pour laquelle du code qui « marche » chez toi échoue à la Moulinette."}
]},

/* ------------------------------------------------------------------ v5 */
{
id:'v5', file:'git', tag:'base', title:'git : les trois marches du rendu',
sub:"Écrit n'est pas ajouté. Ajouté n'est pas commité. Commité n'est pas poussé.",
steps:[
 {k:'lesson',h:'Trois endroits, pas un',b:`
  <p>La plupart des rendus perdus ne sont pas perdus : ils sont restés coincés sur une marche. Il y en a trois, et chacune se franchit par une commande différente.</p>
  <ul>
   <li><b>Ton dossier.</b> Tu écris le fichier. git le voit mais ne le suit pas encore : il apparaît en « non suivi ».</li>
   <li><b>L'index.</b> <code>git add fichier.c</code> annonce que ce fichier fera partie du prochain enregistrement. Rien n'est encore enregistré.</li>
   <li><b>Le dépôt local.</b> <code>git commit -m "message"</code> enregistre pour de bon, mais <b>sur ta machine</b>. Personne d'autre ne le voit.</li>
   <li><b>Le dépôt distant.</b> <code>git push</code> envoie tes enregistrements au serveur de l'école. C'est seulement là que ton travail est rendu.</li>
  </ul>
  <p>Tant que <code>git push</code> n'a pas tourné, ton travail n'existe que pour toi.</p>`},

 {k:'lesson',h:'Vérifier, plutôt que croire',b:`
  <p>Deux commandes te disent où tu en es, et elles ne mentent pas :</p>
  <ul>
   <li><code>git status</code> montre ce qui est non suivi, ce qui est ajouté mais pas commité, et si tu es « en avance » sur le serveur, c'est-à-dire si tu as des commits non poussés.</li>
   <li><code>git log</code> liste les enregistrements. Un commit qui n'est pas encore parti n'est pas rendu.</li>
  </ul>
  <p>La phrase à guetter dans <code>git status</code> après un push réussi : <b>rien à valider, la copie de travail est propre</b>, et plus aucune mention d'avance sur le serveur.</p>
  <p>Quand rendre ? À chaque exercice qui passe. Pas à la fin. Un exercice validé et poussé ne peut plus être perdu, ni par une fausse manipulation, ni par une machine qui redémarre.</p>`},

 {k:'term',h:'Mission : le cycle complet',
  goal:'le fichier doit être poussé, pas seulement commité',
  brief:"Le dossier contient <code>ft_bip.c</code>, tout juste écrit. Fais-le arriver jusqu'au serveur : ajoute-le, enregistre-le avec le message <code>ex00</code>, puis envoie-le. Contrôle avec <code>git status</code> que rien ne traîne.",
  setup:sh=>{
    const H='/* '+'*'.repeat(74)+' */';
    sh.root.children['ft_bip.c']=fFile(H+'\n#include <unistd.h>\n\nvoid\tft_bip(char c)\n{\n\twrite(1, &c, 1);\n}\n');
  },
  terminal:'MISSION · RENDU', dossier:'bac', raccourcis:['git status','git add ft_bip.c','git commit -m "ex00"','git push'],
  verif:{type:'sortie', filtre:/^git status/, attendu:'Sur la branche master\nrien à valider, la copie de travail est propre\n'},
  check:sh=>!!(sh.git&&sh.git.commits.length>0&&sh.git.pousses===sh.git.commits.length),
  hints:["Trois commandes dans l'ordre : ajouter, enregistrer, envoyer.",
         "L'enregistrement réclame un message avec -m entre guillemets.",
         "git add ft_bip.c, puis git commit -m \"ex00\", puis git push"]},

 {k:'mcq',h:'',q:"Tu as fait <code>git add</code> et <code>git commit</code>, mais pas <code>git push</code>. Ton correcteur voit-il ton travail ?",
  opts:["Oui, le commit suffit","Non, le commit reste sur ta machine","Oui si tu es connecté à l'intranet","Seulement les fichiers ajoutés"],a:1,
  why:"Un commit est local. Le serveur ne reçoit rien tant que push n'a pas tourné. C'est la marche qui coûte le plus de rendus."},

 {k:'mcq',h:'',q:"<code>git status</code> affiche « Votre branche est en avance sur origin/master de 2 commits ». Que faut-il faire ?",
  opts:["Rien, c'est normal","git push, ces deux enregistrements ne sont pas partis","git add .","Recommencer le commit"],a:1,
  why:"« En avance » veut dire que tu as des enregistrements que le serveur n'a pas. Tant qu'ils ne sont pas poussés, ils ne sont pas rendus."},

 {k:'input',h:'',q:"Quelle commande, seule, te dit s'il te reste quelque chose à rendre ?",
  attendu:['git status','status'],
  why:"git status résume les trois marches d'un coup : non suivi, ajouté, et en avance sur le serveur."}
]},

/* ------------------------------------------------------------------ v6 */
{
id:'v6', file:'shell', tag:'shell00', title:'Reprise Shell 00',
sub:"Redirection, droits en octal, liens : les notions qui reviennent, sans refaire les exercices.",
steps:[
 {k:'lesson',h:'Rediriger, c\'est détourner',b:`
  <p>Par défaut une commande écrit à l'écran. <code>&gt;</code> détourne cette sortie vers un fichier, en <b>écrasant</b> ce qu'il contenait. <code>&gt;&gt;</code> ajoute à la fin sans effacer.</p>
  <p>Le piège classique : <code>echo</code> ajoute un saut de ligne invisible à la fin. Un fichier qui doit peser un nombre d'octets précis en pèse donc un de plus que tu ne crois. <code>echo -n</code> supprime ce saut de ligne, et <code>cat -e</code> te le montre en affichant un <code>$</code> en fin de ligne.</p>
  <p>Pour vérifier une taille exacte : <code>wc -c fichier</code>.</p>`},

 {k:'lesson',h:'Les droits, en trois chiffres',b:`
  <p>Un fichier a trois groupes de droits : le propriétaire, le groupe, les autres. Chaque groupe se lit en trois lettres, <code>rwx</code> : lecture, écriture, exécution.</p>
  <p>En octal chaque droit vaut un nombre, et on les additionne par groupe : <b>r vaut 4</b>, <b>w vaut 2</b>, <b>x vaut 1</b>.</p>
  <ul>
   <li><code>rwx</code> = 4+2+1 = <b>7</b></li>
   <li><code>r-x</code> = 4+0+1 = <b>5</b></li>
   <li><code>r--</code> = 4 = <b>4</b></li>
  </ul>
  <p>Donc <code>chmod 755 fichier</code> donne tous les droits au propriétaire, lecture et exécution aux deux autres groupes. Et <code>ls -l</code> te montre le résultat sous la forme <code>-rwxr-xr-x</code>, où le premier caractère indique le type : <code>-</code> pour un fichier, <code>d</code> pour un dossier, <code>l</code> pour un lien symbolique.</p>`},

 {k:'lesson',h:'Deux sortes de liens',b:`
  <p><code>ln cible nom</code> crée un <b>lien dur</b> : un deuxième nom pour le même contenu, au même endroit sur le disque. Supprimer l'un ne détruit pas l'autre.</p>
  <p><code>ln -s cible nom</code> crée un <b>lien symbolique</b> : un panneau indicateur qui contient un chemin. Si la cible disparaît, le panneau pointe dans le vide.</p>
  <p>La différence se voit avec <code>ls -l</code> : le lien symbolique s'affiche avec une flèche vers sa cible, le lien dur est indiscernable d'un fichier ordinaire.</p>`},

 {k:'term',h:'Mission : la taille exacte',
  goal:'un fichier de 2 octets, sans saut de ligne',
  brief:"Crée un fichier <code>court</code> qui contient exactement <code>OK</code> et <b>rien d'autre</b> : pas de saut de ligne. Vérifie avec <code>wc -c court</code>, qui doit annoncer 2.",
  setup:sh=>{},
  terminal:'MISSION · OCTETS', dossier:'bac', raccourcis:['wc -c court','cat -e court'],
  verif:{type:'contenu', fichier:'court', attendu:'OK'},
  check:sh=>{ const n=lookup(sh,'court'); return !!n&&n.type==='file'&&n.content==='OK'; },
  hints:["echo ajoute un saut de ligne. Il existe une option pour l'en empêcher.",
         "L'option est -n.",
         "echo -n OK > court"]},

 {k:'mcq',h:'',q:"<code>ls -l</code> affiche <code>-rw-r--r--</code>. Quel est l'équivalent en octal ?",
  opts:["755","644","664","744"],a:1,
  why:"rw- vaut 4+2 = 6, puis r-- vaut 4, puis r-- vaut 4. Donc 644, le mode par défaut d'un fichier ordinaire."},

 {k:'mcq',h:'',q:"Tu supprimes la cible d'un lien symbolique. Que devient le lien ?",
  opts:["Il est supprimé aussi","Il existe encore mais pointe dans le vide","Il garde une copie du contenu","Il se transforme en lien dur"],a:1,
  why:"Un lien symbolique ne contient qu'un chemin. Le chemin reste écrit même quand plus rien ne se trouve au bout."}
]},

/* ------------------------------------------------------------------ v7 */
{
id:'v7', file:'c', tag:'c00', title:'Reprise C 00',
sub:"write et l'adresse, le caractère comme nombre, la boucle qui compte.",
steps:[
 {k:'lesson',h:'Une seule sortie possible',b:`
  <p>En C 00 tu n'as le droit qu'à <code>write</code>. Elle prend trois choses :</p>
  <p><code>write(1, &amp;c, 1);</code> se lit : écris sur la sortie <b>1</b> (l'écran), à partir de <b>l'adresse de c</b>, exactement <b>1</b> octet.</p>
  <p>Le <code>&amp;</code> veut dire « adresse de ». write ne veut pas la valeur du caractère, elle veut savoir <b>où</b> il est rangé en mémoire pour aller le lire elle-même.</p>
  <p>Erreur classique : confondre le premier et le dernier argument. Le premier est la destination, le dernier est le nombre d'octets. Les deux valent souvent 1, ce qui masque la confusion jusqu'au jour où il faut en écrire plusieurs.</p>`},

 {k:'lesson',h:'Un caractère est un nombre',b:`
  <p>Un <code>char</code> est un petit entier. <code>'a'</code> vaut 97, <code>'z'</code> vaut 122, <code>'0'</code> vaut 48, <code>'9'</code> vaut 57. Les lettres se suivent dans l'ordre, et les chiffres aussi.</p>
  <p>Conséquences directes :</p>
  <ul>
   <li><code>c++</code> passe à la lettre suivante, <code>c--</code> à la précédente.</li>
   <li>Comparer deux caractères, c'est comparer deux nombres : <code>c &lt;= 'z'</code> a un sens.</li>
   <li>Pour transformer un chiffre en son caractère, on ajoute <code>'0'</code>. Le nombre 7 devient le caractère <code>'7'</code> avec <code>7 + '0'</code>.</li>
  </ul>`},

 {k:'lesson',h:'Le sens de la comparaison suit le sens du parcours',b:`
  <p>Une boucle qui monte et une boucle qui descend n'ont pas la même condition, et c'est l'erreur qui coûte le plus de temps au début.</p>
  <ul>
   <li>Tu montes vers une borne haute : tu continues <b>tant que tu ne l'as pas dépassée</b>, donc <code>&lt;=</code>.</li>
   <li>Tu descends vers une borne basse : tu continues <b>tant que tu n'es pas passé dessous</b>, donc <code>&gt;=</code>.</li>
  </ul>
  <p>Vérifie toujours ta condition sur le tout premier tour, avec les nombres. Si elle est fausse d'entrée, la boucle ne s'exécute pas une seule fois et le programme n'affiche rien, sans erreur ni avertissement.</p>`},

 {k:'code',h:'',
  brief:"Écris <code>ft_trio</code>, qui affiche trois fois le caractère reçu. Rien d'autre : pas d'espace, pas de saut de ligne.",
  sig:'void ft_trio(char c);',
  start:'void\tft_trio(char c)\n{\n\t\n}\n',
  tests:[
   {label:"ft_trio('a')", harness:"int main(void){ ft_trio('a'); return 0; }", expect:'aaa'},
   {label:"ft_trio('7')", harness:"int main(void){ ft_trio('7'); return 0; }", expect:'777'},
   {label:'deux appels', harness:"int main(void){ ft_trio('x'); ft_trio('y'); return 0; }", expect:'xxxyyy'}],
  hints:["write écrit un octet à la fois, à partir de l'adresse du caractère.",
         "Trois appels identiques suffisent, ou une boucle qui tourne trois fois.",
         "write(1, &c, 1); répété trois fois."]},

 {k:'code',h:'',
  brief:"Écris <code>ft_deux_chiffres</code>, qui reçoit un entier entre 0 et 9 et affiche ce chiffre, puis le chiffre suivant. Pour 7, la sortie est <code>78</code>. Pour 9, elle est <code>9:</code> : ne traite pas ce cas à part, contente-toi d'ajouter 1.",
  sig:'void ft_deux_chiffres(int n);',
  start:'void\tft_deux_chiffres(int n)\n{\n\t\n}\n',
  tests:[
   {label:'ft_deux_chiffres(7)', harness:'int main(void){ ft_deux_chiffres(7); return 0; }', expect:'78'},
   {label:'ft_deux_chiffres(0)', harness:'int main(void){ ft_deux_chiffres(0); return 0; }', expect:'01'},
   {label:'ft_deux_chiffres(3)', harness:'int main(void){ ft_deux_chiffres(3); return 0; }', expect:'34'}],
  hints:["Un entier n'est pas un caractère. Pour afficher le nombre 7, il faut le caractère '7'.",
         "On passe du nombre au caractère en ajoutant '0'.",
         "char d = n + '0'; puis write, puis d + 1 pour le suivant."]},

 {k:'mcq',h:'',q:"Que vaut <code>'7' - '0'</code> ?",
  opts:["Le caractère '7'","Le nombre 7","Le nombre 55","Rien, l'opération est interdite"],a:1,
  why:"'7' vaut 55 et '0' vaut 48. La différence donne 7, le nombre. C'est la conversion inverse de l'addition de '0'."},

 {k:'mcq',h:'',q:"Une boucle part de <code>'z'</code> et descend. Quelle condition la fait tourner jusqu'à <code>'a'</code> inclus ?",
  opts:["c <= 'a'","c >= 'a'","c < 'z'","c != 'a'"],a:1,
  why:"'z' vaut 122 et 'a' vaut 97. Avec <code>c &lt;= 'a'</code> la condition est fausse dès le premier tour et rien ne s'affiche. Il faut continuer tant que c n'est pas passé sous 'a'."},

 {k:'bug',h:'',
  brief:"Cette fonction devrait afficher le caractère reçu, mais elle n'affiche rien de correct. Trouve l'erreur.",
  code:'void\tft_montre(char c)\n{\n\twrite(1, c, 1);\n}\n',
  q:"Qu'est-ce qui cloche ?",
  opts:["Il manque un point-virgule","write attend l'adresse de c, pas sa valeur","Le 1 final devrait être 0","La fonction devrait renvoyer un int"],a:1,
  why:"Sans le <code>&amp;</code>, la valeur du caractère est interprétée comme une adresse mémoire. write va lire n'importe où, et au mieux n'affiche rien."}
]}

,

/* ------------------------------------------------------------------ v8
   La compétence qui manque : ni C 00 ni C 01 ne parlent des arguments de la
   ligne de commande, et une bonne moitié du pool de l'exam 00 en dépend. */
{
id:'v8', file:'arguments', tag:'exam', title:'Lire les arguments',
sub:"La moitié des exercices d'examen reçoivent leur donnée par la ligne de commande.",
steps:[
 {k:'lesson',h:'main peut recevoir des choses',b:`
  <p>Jusqu'ici tu as écrit <code>int main(void)</code>. La vraie signature complète est :</p>
  <p><code>int main(int argc, char **argv)</code></p>
  <ul>
   <li><code>argc</code> est le <b>nombre</b> d'éléments sur la ligne de commande.</li>
   <li><code>argv</code> est le <b>tableau</b> de ces éléments, chacun étant une chaîne.</li>
  </ul>
  <p>Le piège de départ : <b><code>argv[0]</code> est le nom du programme lui-même</b>. Le premier argument que l'utilisateur tape est donc <code>argv[1]</code>.</p>
  <p>Si tu lances <code>./prog bonjour</code> :</p>
  <ul>
   <li><code>argc</code> vaut <b>2</b></li>
   <li><code>argv[0]</code> vaut <code>"./prog"</code></li>
   <li><code>argv[1]</code> vaut <code>"bonjour"</code></li>
  </ul>
  <p>Donc « le programme reçoit un argument » se teste par <code>argc == 2</code>, pas <code>argc == 1</code>.</p>`},

 {k:'lesson',h:'Une chaîne est une adresse, et elle finit par zéro',b:`
  <p><code>argv[1]</code> est un <code>char *</code> : l'adresse du premier caractère. Tu l'avais vu en C 01.</p>
  <p>Pour la parcourir, tu avances tant que le caractère lu n'est pas le zéro final :</p>
  <p><code>while (str[i] != '\\0')</code></p>
  <p>Ce zéro n'est pas le caractère <code>'0'</code>. C'est la valeur 0, celle qui marque la fin. Confondre les deux fait boucler à l'infini ou s'arrêter au premier chiffre zéro rencontré.</p>`},

 {k:'lesson',h:'Le mauvais nombre d\'arguments a une sortie IMPOSÉE',b:`
  <p>C'est l'erreur mécanique la plus coûteuse de l'examen, et elle n'a rien à voir avec ton algorithme.</p>
  <p>Quand le nombre d'arguments ne correspond pas, le sujet dit toujours quoi afficher. Ce n'est <b>jamais</b> le silence, et <b>jamais</b> un message d'erreur que tu inventes.</p>
  <ul>
   <li><b>Cas le plus courant :</b> afficher <b>un simple saut de ligne</b>, et rien d'autre.</li>
   <li><b>Cas particulier</b> de certains exercices : afficher une lettre précise suivie d'un saut de ligne.</li>
  </ul>
  <p>Les deux façons de se tromper : ne rien afficher du tout, ou écrire quelque chose comme <code>Usage: ./prog</code>. Les deux échouent, parce que le correcteur compare ta sortie à un fichier attendu qui contient exactement un saut de ligne.</p>
  <p>Lis cette phrase du sujet <b>avant</b> d'écrire l'algorithme, et traite-la en premier dans le code.</p>`},

 {k:'mcq',h:'',q:"Tu lances <code>./prog salut</code>. Que vaut <code>argc</code> ?",
  opts:["0","1","2","3"],a:2,
  why:"argv[0] est le nom du programme, argv[1] est « salut ». Il y a donc deux éléments, et argc vaut 2."},

 {k:'mcq',h:'',q:"Le sujet dit : « si le nombre d'arguments n'est pas 1, afficher un saut de ligne ». Quelle condition écris-tu ?",
  opts:["if (argc != 1)","if (argc != 2)","if (argv[1] == 0)","if (argc == 0)"],a:1,
  why:"« Un argument » du point de vue de l'utilisateur veut dire argc == 2, puisque argv[0] est le nom du programme. Donc le cas d'échec est argc != 2."},

 {k:'bug',h:'',
  brief:"Ce programme doit afficher son argument, ou un simple saut de ligne s'il n'en reçoit pas exactement un. Il échoue à l'examen. Pourquoi ?",
  code:'int\tmain(int argc, char **argv)\n{\n\tint\ti;\n\n\ti = 0;\n\tif (argc != 2)\n\t\treturn (0);\n\twhile (argv[1][i])\n\t\twrite(1, &argv[1][i++], 1);\n\twrite(1, "\\n", 1);\n\treturn (0);\n}\n',
  q:"Qu'est-ce qui cloche ?",
  opts:["La boucle est fausse","Sans argument il n'affiche rien, alors qu'un saut de ligne est exigé","argv[1] devrait être argv[0]","Il manque le zéro final"],a:1,
  why:"L'algorithme est bon. Le <code>return (0)</code> sec ne produit aucune sortie, alors que le fichier attendu contient un saut de ligne. Le correcteur voit une différence et refuse."}
]},

/* ------------------------------------------------------------------ v9 */
{
id:'v9', file:'contrat', tag:'exam', title:'Le contrat de sortie',
sub:"Un saut de ligne en trop est un échec sec. Voici comment savoir, à coup sûr.",
steps:[
 {k:'lesson',h:'Une phrase du sujet décide de tout',b:`
  <p>Le correcteur compare ta sortie au fichier attendu <b>octet par octet</b>, avec <code>diff</code>. Un saut de ligne en trop ou en moins est donc un échec aussi net qu'un mauvais résultat.</p>
  <p>La règle est mécanique, et elle tient dans une phrase à repérer dans l'énoncé :</p>
  <p><b>« followed by a newline »</b> (suivi d'un saut de ligne).</p>
  <ul>
   <li>Cette phrase est <b>présente</b> → ta sortie doit finir par <code>\\n</code>.</li>
   <li>Cette phrase est <b>absente</b> → ta sortie ne doit <b>pas</b> finir par <code>\\n</code>.</li>
  </ul>
  <p>Deuxième indice, encore plus fiable : le bloc <b>Examples</b> de l'énoncé. Quand il est affiché avec <code>cat -e</code>, un <code>$</code> en fin de ligne signale le saut de ligne. Pas de <code>$</code>, pas de saut de ligne.</p>
  <p>Deux exercices du pool illustrent le piège : l'un affiche les chiffres dans un sens <b>avec</b> saut de ligne final, l'autre dans l'autre sens <b>sans</b>. Même forme, contrat inverse. Ne déduis jamais le contrat de l'exercice voisin.</p>`},

 {k:'lesson',h:'Vérifier, en deux commandes',b:`
  <p>Après avoir compilé, tu contrôles ta sortie avant de rendre :</p>
  <ul>
   <li><code>./prog | cat -e</code> affiche un <code>$</code> à chaque fin de ligne. Tu vois immédiatement s'il y en a un de trop, ou aucun.</li>
   <li><code>./prog | wc -c</code> donne le nombre exact d'octets. C'est le contrôle qui ne ment pas.</li>
  </ul>
  <p>Prends l'habitude de faire les deux systématiquement. Ça coûte cinq secondes et ça attrape l'erreur la plus fréquente de l'examen.</p>`},

 {k:'term',h:'Mission : voir le saut de ligne',
  goal:'distinguer deux fichiers qui se ressemblent',
  brief:"Le dossier contient <code>avec</code> et <code>sans</code>. Ils affichent la même chose, mais un seul finit par un saut de ligne. Trouve lequel, avec <code>cat -e</code> puis <code>wc -c</code>.",
  setup:sh=>{ sh.root.children['avec']=fFile('OK\n'); sh.root.children['sans']=fFile('OK'); },
  terminal:'MISSION · CONTRAT', dossier:'bac', raccourcis:['cat -e avec','cat -e sans','wc -c avec','wc -c sans'],
  verif:{type:'sortie', filtre:/^cat -e sans/, attendu:'OK'},
  check:sh=>true,
  hints:["cat -e marque la fin de ligne par un dollar.",
         "wc -c compte les octets : 3 contre 2.",
         "cat -e sans"]},

 {k:'mcq',h:'',q:"L'énoncé décrit la sortie sans jamais écrire « followed by a newline », et son bloc Examples n'a aucun <code>$</code>. Que fais-tu ?",
  opts:["Tu ajoutes un \\n par sécurité","Tu n'ajoutes pas de \\n","Tu ajoutes un espace","Ça n'a pas d'importance"],a:1,
  why:"Le correcteur compare octet par octet. Un \\n « par sécurité » crée une différence avec le fichier attendu, et l'exercice est refusé alors que la logique était juste."},

 {k:'mcq',h:'',q:"Quelle commande te donne le nombre exact d'octets produits par ton programme ?",
  opts:["./prog | wc -l","./prog | wc -c","./prog | cat","ls -l prog"],a:1,
  why:"<code>wc -c</code> compte les octets. <code>wc -l</code> compte les lignes, et <code>ls -l</code> donne la taille du programme, pas de sa sortie."}
]},

/* ------------------------------------------------------------------ v10 */
{
id:'v10', file:'pool', tag:'exam', title:'Ce qui peut tomber',
sub:"Le pool réel de l'exam 00, ses familles de forme, et de l'entraînement sur les mêmes formes.",
steps:[
 {k:'lesson',h:'Comment lire cette liste',b:`
  <p>Les exercices de l'exam 00 sont tirés au hasard dans une banque publique et stable, documentée par des dizaines de dépôts d'entraînement. Les connaître ne remplace pas savoir les écrire : tu passeras quatre heures sans réseau, et l'exercice tiré ne sera pas celui que tu auras appris par cœur.</p>
  <p>Ce qui sert vraiment, c'est de reconnaître la <b>famille</b> à laquelle appartient l'exercice tiré, parce que la famille décide de la structure du code et du contrat de sortie.</p>
  <p>Les noms ci-dessous sont ceux que <code>examshell</code> utilise. Le dossier de rendu porte exactement ce nom.</p>`},

 {k:'lesson',h:'Famille 1 : afficher quelque chose de fixe',b:`
  <p>Aucun argument, sortie constante. Un <code>main</code>, un ou deux <code>write</code>, parfois une boucle.</p>
  <ul>
   <li><code>only_a</code>, <code>only_z</code> — un seul caractère, <b>sans</b> saut de ligne.</li>
   <li><code>hello</code> — <code>Hello World!</code> <b>avec</b> saut de ligne.</li>
   <li><code>ft_countdown</code> — les chiffres en ordre décroissant, <b>avec</b> saut de ligne. Attention : le préfixe <code>ft_</code> ne veut pas dire fonction, l'énoncé demande un programme.</li>
   <li><code>maff_alpha</code>, <code>maff_revalpha</code> — l'alphabet en alternant minuscules et majuscules, <b>avec</b> saut de ligne.</li>
   <li><code>fizzbuzz</code> — de 1 à 100, un par ligne, avec fizz, buzz et fizzbuzz.</li>
  </ul>
  <p>C'est la famille la plus proche de ce que tu sais déjà faire. Le seul vrai risque y est le contrat de saut de ligne.</p>`},

 {k:'lesson',h:'Famille 2 : traiter une chaîne reçue en argument',b:`
  <p>Un argument, une boucle sur ses caractères, une sortie transformée, <b>avec</b> saut de ligne. Et toujours le cas du mauvais nombre d'arguments à traiter en premier.</p>
  <ul>
   <li><code>rev_print</code> — la chaîne à l'envers.</li>
   <li><code>ulstr</code> — inverse la casse de chaque lettre.</li>
   <li><code>rot_13</code>, <code>rotone</code> — décale chaque lettre de 13 places, ou d'une seule, en bouclant de z à a.</li>
   <li><code>repeat_alpha</code> — répète chaque lettre autant de fois que son rang dans l'alphabet.</li>
   <li><code>first_word</code> — le premier mot, les mots étant séparés par des espaces ou des tabulations.</li>
   <li><code>aff_a</code>, <code>aff_z</code> — le premier caractère cherché dans la chaîne. Ces deux-là ont un cas d'échec particulier, lis-le attentivement.</li>
   <li><code>search_and_replace</code> — trois arguments : la chaîne, la lettre cherchée, la lettre de remplacement.</li>
   <li><code>aff_first_param</code>, <code>aff_last_param</code> — affiche le premier, ou le dernier, des arguments reçus.</li>
  </ul>
  <p>Toute cette famille repose sur la salle précédente : <code>argc</code>, <code>argv</code>, et le parcours d'une chaîne jusqu'au zéro final.</p>`},

 {k:'lesson',h:'Famille 3 : écrire une fonction sur des pointeurs',b:`
  <p>Pas de <code>main</code> à rendre : l'énoncé donne un prototype et tu écris la fonction seule. C'est du C 01 : adresses, chaînes, zéro final.</p>
  <p>Plusieurs d'entre elles portent le nom d'exercices que tu dois rendre dans tes projets. Ce lab ne les résout pas, par principe : ce sont tes rendus. Elles apparaissent ici pour que tu saches qu'elles peuvent tomber, et pour que tu reconnaisses leur forme.</p>
  <ul>
   <li>Mesurer la longueur d'une chaîne, et renvoyer un nombre.</li>
   <li>Afficher une chaîne reçue par son adresse.</li>
   <li>Copier une chaîne dans une autre, zéro final compris, et renvoyer la destination.</li>
   <li>Échanger le contenu de deux entiers dont on reçoit les adresses.</li>
   <li>Inverser une chaîne <b>sur place</b> et renvoyer son paramètre.</li>
   <li>Comparer deux chaînes et renvoyer un entier signé.</li>
   <li>Convertir une chaîne en entier.</li>
  </ul>
  <p>Point commun de la famille : plusieurs de ces énoncés n'autorisent <b>aucune</b> fonction externe, pas même <code>write</code>. Vérifie ce champ avant d'écrire.</p>`},

 {k:'code',h:'',
  brief:"Même forme que la famille 3, sur une autre fonction. Écris <code>ft_compte_lettre</code>, qui renvoie combien de fois le caractère <code>c</code> apparaît dans la chaîne <code>str</code>. Aucun affichage.",
  sig:'int ft_compte_lettre(char *str, char c);',
  start:'int\tft_compte_lettre(char *str, char c)\n{\n\t\n}\n',
  tests:[
   {label:'"banane", \'a\'', harness:'int main(void){ char s[] = "banane"; return ft_compte_lettre(s, \'a\'); }', expect:'3'},
   {label:'"xyz", \'a\'', harness:'int main(void){ char s[] = "xyz"; return ft_compte_lettre(s, \'a\'); }', expect:'0'},
   {label:'"aaa", \'a\'', harness:'int main(void){ char s[] = "aaa"; return ft_compte_lettre(s, \'a\'); }', expect:'3'}],
  hints:["Un compteur à zéro, une boucle qui avance tant que le caractère lu n'est pas le zéro final.",
         "La condition d'arrêt s'écrit str[i] != '\\\\0', ou simplement str[i].",
         "À chaque tour, si str[i] vaut c, on incrémente le compteur. On renvoie le compteur à la fin."]},

 {k:'code',h:'',
  brief:"Même forme que la famille 2, sans les arguments de ligne de commande. Écris <code>ft_decale_un</code>, qui affiche la chaîne reçue en décalant chaque lettre minuscule d'une place, <code>z</code> revenant à <code>a</code>. Les autres caractères ne changent pas. Pas de saut de ligne final.",
  sig:'void ft_decale_un(char *str);',
  start:'void\tft_decale_un(char *str)\n{\n\t\n}\n',
  tests:[
   {label:'"abc"', harness:'int main(void){ char s[] = "abc"; ft_decale_un(s); return 0; }', expect:'bcd'},
   {label:'"xyz"', harness:'int main(void){ char s[] = "xyz"; ft_decale_un(s); return 0; }', expect:'yza'},
   {label:'"a-z!"', harness:'int main(void){ char s[] = "a-z!"; ft_decale_un(s); return 0; }', expect:'b-a!'}],
  hints:["Parcours la chaîne jusqu'au zéro final, et traite chaque caractère séparément.",
         "Une lettre minuscule est entre 'a' et 'z'. Seules celles-là bougent.",
         "Le cas de 'z' se traite à part : au lieu d'ajouter 1, on repart à 'a'."]},

 {k:'mcq',h:'',q:"L'énoncé s'appelle <code>ft_countdown</code> et son en-tête dit « Expected files: ft_countdown.c » sans donner de prototype. Que rends-tu ?",
  opts:["Une fonction sans main","Un programme avec un main","Les deux, pour être sûr","Une fonction et un main dans deux fichiers"],a:1,
  why:"Le préfixe ft_ ne décide de rien. C'est l'énoncé qui dit s'il attend une fonction, en donnant un prototype, ou un programme. Sans prototype, c'est un programme, et il lui faut un main."},

 {k:'mcq',h:'',q:"Où places-tu ton fichier pour un exercice nommé <code>rev_print</code> ?",
  opts:["rendu/rev_print.c","rendu/rev_print/rev_print.c","rendu/exam00/rev_print.c","subjects/rev_print/"],a:1,
  why:"Le dossier porte le nom de l'exercice, et le fichier celui donné par le champ « Expected files » de l'énoncé. Les deux doivent correspondre exactement, sinon le correcteur ne trouve rien à compiler."}
]}

];

const VIVA=[
 {q:"Ton fichier passe norminette et compile sans avertissement. Est-il rendu ? Explique.",
  points:["norminette ne vérifie que la forme","la compilation ne dit rien du rendu","il faut git add, git commit puis git push","git status confirme qu'il ne reste rien"]},
 {q:"Pourquoi une fonction de projet seule ne peut-elle pas produire un programme ?",
  points:["il n'y a pas de main, donc pas de point de départ","le sujet interdit de rendre un main quand il demande une fonction","on écrit un main de test dans un fichier séparé","ou on compile avec -c pour ne pas lier"]},
 {q:"À quoi sert l'en-tête 42, et pourquoi ne se modifie-t-il pas à la main ?",
  points:["norminette le réclame avant de lire le code","chaque ligne fait exactement 80 colonnes","changer un login décale la fin de ligne","le plugin recalcule le remplissage, Ctrl + H dans vim"]},
 {q:"Explique les trois flags de compilation qu'utilise la Moulinette.",
  points:["-Wall et -Wextra activent les avertissements","-Werror les transforme en erreurs","du code qui marche sans eux peut échouer avec","si ça ne compile pas, la note est 0"]},
 {q:"Un fichier doit peser exactement 2 octets et en pèse 3. Que s'est-il passé ?",
  points:["echo ajoute un saut de ligne","echo -n l'empêche","cat -e montre la fin de ligne","wc -c donne la taille exacte"]},
 {q:"Une boucle qui descend ne s'exécute jamais. Quelle est la cause la plus probable ?",
  points:["la condition est fausse dès le premier tour","le sens de la comparaison n'a pas été inversé","on descend, donc >= et non <=","il faut vérifier la condition avec les nombres"]}
];
