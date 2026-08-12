/* Contenu pédagogique du module c00.
   Les salles et les questions d'auto-évaluation, rien d'autre : ni moteur,
   ni rendu, ni style. */

const MODULE={cle:'c00lab_v1', titre:"c00.lab — premiers pas en C", invite:"~/c00.lab"};

const ROOMS=[
{
id:'c1', file:'write', tag:'concept', title:'Afficher un caractère',
sub:'Une seule fonction autorisée, et un caractère qui est en fait un nombre.',
steps:[
 {k:'lesson',h:'write, et rien d\'autre',b:`
  <p>En C, aucune fonction d'affichage n'est fournie d'office. Tu n'as le droit qu'à <code>write</code>, qui est un appel système brut :</p>
  <p><code>write(1, &amp;c, 1);</code> se lit : écris sur la sortie <b>1</b> (l'écran), en partant de <b>l'adresse de c</b>, exactement <b>1</b> octet.</p>
  <p>Le <code>&amp;</code> veut dire « adresse de ». write ne veut pas la valeur, il veut savoir <b>où</b> se trouve l'octet à envoyer. C'est ton premier contact avec les pointeurs, et tout le module C 01 part de là.</p>
  <p>Une fonction <code>void</code> ne renvoie rien : elle agit, c'est tout.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_deux</code>, qui affiche les deux caractères reçus, dans l'ordre. Rien d'autre : pas de saut de ligne, pas d'espace.",
  sig:'void ft_deux(char a, char b);',
  start:'void\tft_deux(char a, char b)\n{\n\t\n}\n',
  tests:[
   {label:'ft_deux(\'O\', \'K\')', harness:"int main(void){ ft_deux('O','K'); return 0; }", expect:'OK'},
   {label:'ft_deux(\'4\', \'2\')', harness:"int main(void){ ft_deux('4','2'); return 0; }", expect:'42'},
   {label:'deux appels de suite',  harness:"int main(void){ ft_deux('a','b'); ft_deux('c','d'); return 0; }", expect:'abcd'}],
  hints:["write prend trois arguments : la sortie 1, l'adresse du caractère, et le nombre d'octets.",
         "L'adresse d'une variable s'écrit avec une esperluette devant son nom.",
         "Deux appels à write, un par paramètre, dans l'ordre."]},
 {k:'mcq',h:'',q:"Pourquoi <code>write(1, c, 1)</code> ne marche pas, alors que <code>write(1, &amp;c, 1)</code> marche ?",
  opts:["C'est pareil, question de style","write attend une adresse, pas une valeur","Il manque un point-virgule","c doit être un int"],a:1,
  why:"Le deuxième argument est un emplacement mémoire. Sans le &, tu passes le contenu de c, que write interprète comme une adresse : au mieux ça plante, au pire ça affiche n'importe quoi."},
 {k:'mcq',h:'',q:"Que représente le <b>1</b> tout à la fin de <code>write(1, &amp;c, 1)</code> ?",
  opts:["La sortie standard","Le nombre d'octets à écrire","Le code de retour","Le premier caractère"],a:1,
  why:"Le premier 1 est la destination (l'écran), le dernier est la longueur. Les confondre est l'erreur classique du premier jour."}
]},

{
id:'c2', file:'ascii', tag:'concept', title:'Un caractère est un nombre',
sub:'\'a\' + 1 vaut \'b\'. Tout le module tient là-dedans.',
steps:[
 {k:'ascii',h:'Manipule la correspondance',
  b:"Fais glisser le curseur, ou saute directement aux caractères repères. Regarde la valeur numérique bouger."},
 {k:'lesson',h:'Ce que ça permet',b:`
  <p>Un <code>char</code> n'est pas un type à part : c'est un petit entier. <code>'a'</code> vaut 97, <code>'b'</code> vaut 98, et les lettres se suivent dans l'ordre.</p>
  <p>Deux conséquences que tu vas utiliser sans arrêt :</p>
  <ul>
   <li>on peut <b>incrémenter</b> un caractère : <code>c++</code> passe de <code>'a'</code> à <code>'b'</code></li>
   <li>on peut <b>convertir un chiffre en caractère</b> : le chiffre 7 devient le caractère <code>'7'</code> en ajoutant <code>'0'</code>, parce que les dix chiffres se suivent aussi</li>
  </ul>
  <p>Écrire <code>c + 48</code> marche, mais <code>c + '0'</code> dit ce que tu veux faire. Préfère la seconde forme, on te le demandera en soutenance.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_de_a_a</code>, qui affiche toutes les lettres minuscules de <code>debut</code> à <code>fin</code> inclus. Si <code>debut</code> est après <code>fin</code>, n'affiche rien.",
  sig:'void ft_de_a_a(char debut, char fin);',
  start:'void\tft_de_a_a(char debut, char fin)\n{\n\t\n}\n',
  tests:[
   {label:"ft_de_a_a('c','g')", harness:"int main(void){ ft_de_a_a('c','g'); return 0; }", expect:'cdefg'},
   {label:"ft_de_a_a('a','a')", harness:"int main(void){ ft_de_a_a('a','a'); return 0; }", expect:'a'},
   {label:"ft_de_a_a('x','t') n'affiche rien", harness:"int main(void){ ft_de_a_a('x','t'); return 0; }", expect:''},
   {label:"ft_de_a_a('a','z')", harness:"int main(void){ ft_de_a_a('a','z'); return 0; }", expect:'abcdefghijklmnopqrstuvwxyz'}],
  hints:["Il te faut une variable qui part de debut et qu'on incrémente tant qu'elle n'a pas dépassé fin.",
         "Une boucle while avec la condition c <= fin. Si debut > fin, la boucle ne tourne simplement jamais.",
         "À chaque tour : write le caractère courant, puis c++."]},
 {k:'input',h:'',q:"Quelle expression transforme le chiffre stocké dans <code>i</code> (entre 0 et 9) en caractère affichable ? Écris juste l'expression.",
  a:["i + '0'"],accept:v=>/^i\s*\+\s*'0'$/.test(v.replace(/\s+/g,' ').trim()),
  why:"Les caractères des chiffres se suivent à partir de '0' qui vaut 48. Ajouter '0' plutôt que 48 rend l'intention lisible."},
 {k:'mcq',h:'',q:"<code>char c = 'a' + 25;</code> contient quoi ?",
  opts:["'z'","le nombre 25","une erreur de compilation","'A'"],a:0,
  why:"97 + 25 = 122, le code de 'z'. C'est ce calcul qui permet de parcourir l'alphabet sans écrire les 26 lettres."}
]},

{
id:'c3', file:'boucles', tag:'concept', title:'Boucles et conditions',
sub:'while, for, if : répéter et choisir.',
steps:[
 {k:'lesson',h:'Trois formes, une seule idée',b:`
  <p><code>while (condition) { ... }</code> répète tant que la condition est vraie. Si elle est fausse dès le départ, le bloc n'est jamais exécuté.</p>
  <p><code>for (init ; condition ; pas)</code> est la même chose, en regroupant sur une ligne les trois éléments d'un compteur. Utile quand tu comptes ; un while suffit toujours.</p>
  <p><code>if (condition) ... else ...</code> choisit. En C il n'y a pas de booléen : <b>zéro est faux, tout le reste est vrai</b>. C'est pour ça que <code>while (c)</code> s'arrête quand c vaut 0, ce qui servira beaucoup en C 01.</p>
  <p>Le piège permanent : une condition qui ne devient jamais fausse. Oublier d'incrémenter, et la boucle tourne pour toujours.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_pairs</code>, qui affiche les chiffres pairs de 0 à 8 inclus, sans séparateur. Attendu : <code>02468</code>.",
  sig:'void ft_pairs(void);',
  start:'void\tft_pairs(void)\n{\n\t\n}\n',
  tests:[{label:'ft_pairs()', harness:'int main(void){ ft_pairs(); return 0; }', expect:'02468'},
         {label:'deux appels', harness:'int main(void){ ft_pairs(); ft_pairs(); return 0; }', expect:'0246802468'}],
  hints:["Un compteur entier de 0 à 8, qui avance de 2 à chaque tour.",
         "Pour afficher un chiffre, il faut d'abord le transformer en caractère.",
         "char c = i + '0'; puis write(1, &c, 1);"]},
 {k:'code',h:'',
  brief:"Écris <code>ft_signe</code>, qui affiche <code>N</code> si le nombre est strictement négatif, <code>Z</code> s'il vaut zéro, et <code>P</code> s'il est strictement positif.",
  sig:'void ft_signe(int n);',
  start:'void\tft_signe(int n)\n{\n\t\n}\n',
  tests:[{label:'ft_signe(-5)', harness:'int main(void){ ft_signe(-5); return 0; }', expect:'N'},
         {label:'ft_signe(0)',  harness:'int main(void){ ft_signe(0); return 0; }',  expect:'Z'},
         {label:'ft_signe(7)',  harness:'int main(void){ ft_signe(7); return 0; }',  expect:'P'},
         {label:'les trois à la suite', harness:'int main(void){ ft_signe(-1); ft_signe(0); ft_signe(1); return 0; }', expect:'NZP'}],
  hints:["Trois cas : un if, un else if, un else.",
         "Attention à zéro : il n'est ni négatif ni positif, c'est un cas à part entière.",
         "Pour afficher une lettre fixe, tu peux la stocker : char c = 'N'; puis write."]},
 {k:'bug',
  contexte:"Le lab exécute ton code, mais il n\'est pas un compilateur. À l\'école, c\'est <code>cc</code> qui parle, et il faut savoir le lire. Un camarade te montre ceci :",
  code:"$ cc -Wall -Wextra -Werror ft_boucle.c\nft_boucle.c:5:9: error: use of undeclared identifier 'i'\n    while (i < 10)\n           ^\nft_boucle.c:7:3: error: use of undeclared identifier 'i'\n        i++;\n        ^\n2 errors generated.",
  q:"Combien de problèmes distincts y a-t-il réellement, et où ?",
  opts:["Deux problèmes, aux lignes 5 et 7","Un seul : la variable i n\'a jamais été déclarée, et les deux messages en découlent","Un problème de parenthèses à la ligne 5","Le compilateur refuse les boucles while avec -Werror"],
  a:1,
  why:"Le compilateur signale chaque <b>endroit</b> où il bute, pas chaque <b>cause</b>. Ici une seule déclaration manquante produit deux messages. Le réflexe qui fait gagner le plus de temps : corriger la <b>première</b> erreur, recompiler, et ne surtout pas essayer de traiter la liste entière. La colonne et le chapeau <code>^</code> pointent le caractère exact."},
 {k:'mcq',h:'',q:"En C, <code>while (c)</code> s'arrête quand ?",
  opts:["Quand c vaut 0","Quand c est faux au sens booléen","Jamais","Quand c est négatif"],a:0,
  why:"Il n'y a pas de type booléen : zéro est faux, tout le reste est vrai. Cette règle est exactement ce qui permet de parcourir une chaîne jusqu'à son zéro final."}
]},

{
id:'c4', file:'imbrique', optionnel:true, tag:'concept', title:'Boucles imbriquées',
sub:'Deux compteurs, et la condition qui évite les doublons.',
steps:[
 {k:'lesson',h:'Un compteur dans un compteur',b:`
  <p>Quand tu veux toutes les <b>paires</b> d'éléments, il te faut deux boucles : une extérieure pour le premier, une intérieure pour le second. L'intérieure tourne entièrement à chaque tour de l'extérieure.</p>
  <p>Le vrai sujet n'est pas d'écrire deux boucles, c'est de choisir le <b>point de départ de la boucle intérieure</b>.</p>
  <ul>
   <li>partir de 0 : tu obtiens toutes les paires, doublons compris (01 et 10, et même 00)</li>
   <li>partir de <code>a + 1</code> : chaque paire n'apparaît qu'une fois, et jamais avec deux fois le même élément</li>
  </ul>
  <p>Cette seule ligne fait la différence entre un exercice juste et un exercice qui affiche trois fois trop de choses.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_paires</code>, qui affiche toutes les paires de chiffres strictement croissantes en dessous de 4, collées. Attendu exactement : <code>010203121323</code> (soit 01, 02, 03, 12, 13, 23).",
  sig:'void ft_paires(void);',
  start:'void\tft_paires(void)\n{\n\t\n}\n',
  tests:[{label:'ft_paires()', harness:'int main(void){ ft_paires(); return 0; }', expect:'010203121323'}],
  hints:["Deux boucles : a de 0 à 3, et b à l'intérieur.",
         "Pour que 10 n'apparaisse pas alors que 01 est déjà sorti, b doit démarrer après a.",
         "b commence à a + 1 et va jusqu'à 3. À chaque tour, affiche le caractère de a puis celui de b."],
  post:"Si tu avais fait partir b de 0, tu obtenais 16 paires au lieu de 6, avec 00 et les miroirs. Le point de départ de la boucle intérieure est toute la logique de l'exercice."},
 {k:'mcq',h:'',q:"Avec deux boucles de 0 à 9 et la condition intérieure partant de 0, combien de paires obtiens-tu ?",
  opts:['45','90','100','10'],a:2,
  why:"10 × 10 = 100, doublons et paires identiques comprises. En partant de a+1, on tombe à 45 : chaque paire une seule fois, jamais deux fois le même chiffre."},
 {k:'mcq',h:'',q:"Où faut-il afficher le séparateur pour qu'il n'apparaisse pas après le dernier élément ?",
  opts:["Toujours après chaque élément",
        "Il faut tester si on est sur le dernier cas, et ne rien afficher alors",
        "Avant chaque élément","Le séparateur n'est jamais un problème"],a:1,
  why:"C'est le détail qui fait échouer beaucoup de rendus : la virgule finale en trop. Il faut une condition explicite sur le dernier élément."}
]},

{
id:'c5', file:'nombres', optionnel:true, tag:'concept', title:'Afficher un nombre',
sub:'Extraire les chiffres avec / et %, et le piège de l\'ordre.',
steps:[
 {k:'lesson',h:'Deux opérateurs, un problème d\'ordre',b:`
  <p>Tu ne peux afficher que des caractères. Pour montrer un nombre, il faut donc en extraire les chiffres un par un.</p>
  <p><code>n % 10</code> donne le chiffre des unités, <code>n / 10</code> enlève ce chiffre (la division entière tronque). En répétant, tu obtiens tous les chiffres, mais <b>du dernier vers le premier</b>.</p>
  <p>D'où le vrai problème : les afficher dans le bon ordre. Deux stratégies, et il faut savoir défendre la sienne :</p>
  <ul>
   <li>traiter d'abord <code>n / 10</code>, puis afficher <code>n % 10</code> : les chiffres de gauche sortent avant</li>
   <li>stocker les chiffres puis les relire à l'envers</li>
  </ul>
  <p>Et un cas limite à ne jamais oublier : le nombre négatif. Le signe s'affiche d'abord, et le reste doit devenir positif.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_deux_chiffres</code>, qui affiche un nombre compris entre 10 et 99, dans le bon ordre. Tu ne gères que cette plage, c'est volontaire : concentre-toi sur l'extraction.",
  sig:'void ft_deux_chiffres(int n);',
  start:'void\tft_deux_chiffres(int n)\n{\n\t\n}\n',
  tests:[{label:'ft_deux_chiffres(42)', harness:'int main(void){ ft_deux_chiffres(42); return 0; }', expect:'42'},
         {label:'ft_deux_chiffres(10)', harness:'int main(void){ ft_deux_chiffres(10); return 0; }', expect:'10'},
         {label:'ft_deux_chiffres(99)', harness:'int main(void){ ft_deux_chiffres(99); return 0; }', expect:'99'},
         {label:'ft_deux_chiffres(70)', harness:'int main(void){ ft_deux_chiffres(70); return 0; }', expect:'70'}],
  hints:["Le chiffre des dizaines s'obtient par une division, celui des unités par un modulo.",
         "n / 10 donne les dizaines, n % 10 donne les unités.",
         "Affiche les dizaines d'abord, puis les unités, chacune convertie en caractère avec + '0'."]},
 {k:'mcq',h:'',q:"Pour un nombre à trois chiffres, pourquoi <code>n % 10</code> répété ne suffit-il pas ?",
  opts:["Ça donne les bons chiffres mais dans l'ordre inverse",
        "Le modulo ne marche pas sur trois chiffres",
        "Il faut un tableau obligatoirement","Ça donne toujours le même chiffre"],a:0,
  why:"Le modulo attaque toujours par les unités. Sans inversion ou sans traiter n/10 en premier, 123 s'affiche 321."},
 {k:'mcq',h:'',q:"Quel cas limite fait échouer la plupart des rendus sur l'affichage d'un entier ?",
  opts:["Le nombre zéro","Le plus petit entier négatif possible","Les nombres pairs","Les nombres à un chiffre"],a:1,
  why:"Son opposé n'existe pas dans la plage des entiers : le rendre positif le fait déborder. C'est LA question qu'un correcteur pose sur cet exercice, et il faut avoir prévu le cas."}
]},

{
id:'c6', file:'autoeval', tag:'boss', title:'Auto-évaluation', boss:true,
sub:'Huit questions de concept, à voix haute, sans lire.',
steps:[
 {k:'lesson',h:'Règle du jeu',b:`
  <p>Ces questions ne portent pas sur les réponses des exercices mais sur les mécanismes. Réponds <b>à voix haute et en entier</b> avant de révéler, et sois honnête avec toi-même.</p>`},
 {k:'viva'}
]}
];

const VIVA=[
 {q:"Explique chacun des trois arguments de write(1, &c, 1).",
  a:"Le premier est la destination : 1 désigne la sortie standard, c'est-à-dire l'écran. Le deuxième est l'adresse à partir de laquelle lire les octets, d'où l'esperluette qui donne l'adresse de la variable. Le troisième est le nombre d'octets à écrire, ici un seul caractère."},
 {q:"Pourquoi peut-on écrire 'a' + 1, et qu'est-ce que ça vaut ?",
  a:"Parce qu'un char est un petit entier : 'a' est le nombre 97. Ajouter 1 donne 98, qui est le code de 'b'. Les lettres et les chiffres se suivent dans la table des codes, ce qui permet de les parcourir avec une simple incrémentation."},
 {q:"Comment transforme-t-on le chiffre 7 en caractère affichable, et pourquoi ?",
  a:"En ajoutant le caractère '0', qui vaut 48. Les dix chiffres se suivent, donc 7 + '0' donne le code de '7'. On écrit + '0' plutôt que + 48 parce que ça dit l'intention au lieu de cacher un nombre magique."},
 {q:"En C, qu'est-ce qui est vrai et qu'est-ce qui est faux ?",
  a:"Il n'y a pas de type booléen. Zéro est faux, toute autre valeur est vraie. C'est ce qui permet d'écrire while suivi d'une variable pour dire « tant qu'elle n'est pas nulle », et c'est le mécanisme d'arrêt sur le zéro final d'une chaîne."},
 {q:"Dans deux boucles imbriquées qui produisent des paires, pourquoi la boucle intérieure part-elle de a + 1 ?",
  a:"Pour que chaque paire n'apparaisse qu'une fois et jamais avec deux fois le même élément. En partant de zéro on obtient aussi bien 01 que 10, plus les paires identiques comme 00. Le point de départ porte toute la logique de l'exercice."},
 {q:"Comment extrait-on les chiffres d'un nombre, et quel problème ça pose ?",
  a:"Le modulo 10 donne le chiffre des unités, la division entière par 10 retire ce chiffre. En répétant on obtient tous les chiffres, mais du dernier vers le premier. Il faut donc soit traiter la division avant l'affichage, soit stocker et relire à l'envers."},
 {q:"Quel cas limite pose problème quand on affiche un entier, et pourquoi ?",
  a:"Le plus petit entier négatif. Son opposé ne rentre pas dans la plage des entiers, donc le rendre positif le fait déborder. Il faut traiter ce cas à part au lieu de simplement changer le signe."},
 {q:"Qu'est-ce que le & devant une variable, et pourquoi write en a besoin ?",
  a:"C'est l'opérateur qui donne l'adresse mémoire de la variable, pas sa valeur. write ne reçoit pas le caractère lui-même : il reçoit l'endroit où aller le chercher, plus le nombre d'octets à lire à partir de là. C'est la première apparition des pointeurs."}
];

/* ==========================================================================
   3. ÉTAT + PERSISTANCE
   ========================================================================== */
