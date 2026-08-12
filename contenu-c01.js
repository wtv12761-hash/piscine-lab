/* Contenu pédagogique du module c01.
   Les salles et les questions d'auto-évaluation, rien d'autre : ni moteur,
   ni rendu, ni style. */

const MODULE={cle:'c01lab_v1', titre:"c01.lab — pointeurs", invite:"~/c01.lab"};

const ROOMS=[
{
id:'p1', file:'adresses', tag:'concept', title:'Adresse et déréférencement',
sub:'& donne l\'adresse, * suit la flèche.',
steps:[
 {k:'lesson',h:'Deux opérateurs, deux sens',b:`
  <p>Une variable occupe une case en mémoire. Cette case a une <b>adresse</b>.</p>
  <p><code>&amp;x</code> donne l'adresse de x. Un <b>pointeur</b> est une variable qui contient une adresse : <code>int *p = &amp;x;</code>.</p>
  <p><code>*p</code> fait l'inverse : il va voir <b>ce qu'il y a à cette adresse</b>. Et c'est utilisable des deux côtés du signe égal. En lecture, <code>int v = *p;</code> récupère la valeur. En écriture, <code>*p = 42;</code> modifie x, alors qu'on n'a jamais écrit le nom x.</p>
  <p>C'est tout l'intérêt : une fonction qui reçoit une adresse peut modifier une variable qui vit ailleurs. Sans ça, une fonction C ne peut rien changer chez son appelant, puisque les arguments sont copiés.</p>`},
 {k:'mem',h:'Suis les flèches',
  b:"Trois cases : une valeur, un pointeur vers elle, un pointeur vers le pointeur. Clique sur les opérations et observe : elles modifient toutes la même case."},
 {k:'code',h:'',
  brief:"Écris <code>ft_mettre</code>, qui range la valeur <code>v</code> dans l'entier pointé par <code>p</code>. Le but est de constater que la modification se voit chez l'appelant.",
  sig:'void ft_mettre(int *p, int v);',
  start:'void\tft_mettre(int *p, int v)\n{\n\t\n}\n',
  tests:[{label:'x devient 7', harness:'int main(void){ int x=0; ft_mettre(&x,7); __putnbr(x); return 0; }', expect:'7'},
         {label:'x devient -3', harness:'int main(void){ int x=100; ft_mettre(&x,-3); __putnbr(x); return 0; }', expect:'-3'},
         {label:'deux variables distinctes', harness:'int main(void){ int a=1,b=2; ft_mettre(&a,9); ft_mettre(&b,8); __putnbr(a); __putnbr(b); return 0; }', expect:'98'}],
  hints:["Tu ne dois pas modifier p, mais ce vers quoi il pointe.",
         "L'étoile devant p, à gauche du signe égal, désigne la case visée.",
         "Une seule ligne suffit."]},
 {k:'mcq',h:'',q:"Une fonction reçoit <code>int n</code> et fait <code>n = 42;</code>. Que vaut la variable de l'appelant après ?",
  opts:["42","Sa valeur d'origine, inchangée","Zéro","Ça ne compile pas"],a:1,
  why:"Les arguments sont copiés. La fonction modifie sa copie locale. Pour toucher l'original il faut recevoir son adresse : c'est toute la raison d'être des pointeurs ici."},
 {k:'mcq',h:'',q:"<code>*p = 5;</code> modifie quoi ?",
  opts:["Le pointeur p lui-même","La case mémoire dont p contient l'adresse","Une copie temporaire","Rien tant qu'on ne fait pas de return"],a:1,
  why:"L'étoile suit la flèche puis écrit à l'arrivée. Écrire p = 5 au lieu de *p = 5 changerait l'adresse stockée, ce qui est une tout autre opération, et généralement une catastrophe."}
]},

{
id:'p2', file:'multi', tag:'concept', title:'Pointeurs de pointeurs',
sub:'Chaque étoile est un saut de plus.',
steps:[
 {k:'lesson',h:'Compter les sauts',b:`
  <p>Un pointeur est une variable comme une autre : elle a donc elle aussi une adresse. On peut donc pointer dessus, et recommencer autant de fois qu'on veut.</p>
  <p>La règle est mécanique : <b>le nombre d'étoiles dans le type dit combien de sauts séparent la variable de la valeur finale</b>.</p>
  <ul>
   <li><code>int *p</code> : un saut. <code>*p</code> est la valeur.</li>
   <li><code>int **q</code> : deux sauts. <code>**q</code> est la valeur, <code>*q</code> est encore un pointeur.</li>
   <li><code>int *********n</code> : neuf sauts, même principe, rien de plus difficile.</li>
  </ul>
  <p>Un exercice qui empile les étoiles n'est pas plus dur, il vérifie juste que tu as compris qu'il n'y a pas de cas particulier.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_triple</code>, qui met la valeur 7 dans l'entier situé au bout de trois niveaux de pointeurs.",
  sig:'void ft_triple(int ***n);',
  start:'void\tft_triple(int ***n)\n{\n\t\n}\n',
  tests:[{label:'la valeur finale devient 7',
    harness:'int main(void){ int x=0; int *a=&x; int **b=&a; int ***c=&b; ft_triple(c); __putnbr(x); return 0; }', expect:'7'},
   {label:'on n\'a pas cassé les pointeurs intermédiaires',
    harness:'int main(void){ int x=1; int *a=&x; int **b=&a; int ***c=&b; ft_triple(c); __putnbr(**b); __putnbr(*a); return 0; }', expect:'77'}],
  hints:["Compte les étoiles du type : il en faut autant pour arriver à l'entier.",
         "Trois niveaux dans le type, donc trois étoiles devant n dans l'affectation.",
         "***n = 7;"]},
 {k:'input',h:'',q:"Avec <code>int *****p</code>, combien d'étoiles faut-il écrire pour atteindre l'entier final ? (juste le nombre)",
  a:['5'],why:"Autant que dans le type. Il n'y a aucune subtilité : la déclaration te donne directement le compte."},
 {k:'mcq',h:'',q:"Avec <code>int **q</code>, que désigne <code>*q</code> ?",
  opts:["L'entier final","Un pointeur vers l'entier","L'adresse de q","Rien de valide"],a:1,
  why:"Une étoile sur deux : il reste un saut à faire. C'est en enlevant les étoiles une par une qu'on suit le chemin."}
]},

{
id:'p3', file:'sorties', tag:'concept', title:'Renvoyer plusieurs résultats',
sub:'Une fonction ne renvoie qu\'une valeur. Les pointeurs contournent la limite.',
steps:[
 {k:'lesson',h:'Le paramètre de sortie',b:`
  <p><code>return</code> ne rend qu'<b>une seule</b> valeur. Quand une fonction doit produire deux résultats, on lui passe des adresses où déposer chacun d'eux. On appelle ça des paramètres de sortie.</p>
  <p>Le motif est toujours le même : la fonction est <code>void</code>, elle reçoit des pointeurs, et elle écrit à travers eux.</p>
  <p>Un piège classique quand les deux valeurs se calculent à partir des mêmes données : si tu écris dans la première avant d'avoir lu la seconde, tu calcules la suite avec une valeur déjà modifiée. La parade est de <b>lire les entrées dans des variables locales avant d'écrire quoi que ce soit</b>.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_min_max</code>, qui range le plus petit des deux nombres dans <code>min</code> et le plus grand dans <code>max</code>. Si les deux sont égaux, les deux reçoivent la même valeur.",
  sig:'void ft_min_max(int a, int b, int *min, int *max);',
  start:'void\tft_min_max(int a, int b, int *min, int *max)\n{\n\t\n}\n',
  tests:[{label:'ft_min_max(3, 9, ...)', harness:'int main(void){ int m,M; ft_min_max(3,9,&m,&M); __putnbr(m); __putnbr(M); return 0; }', expect:'39'},
   {label:'ft_min_max(9, 3, ...)', harness:'int main(void){ int m,M; ft_min_max(9,3,&m,&M); __putnbr(m); __putnbr(M); return 0; }', expect:'39'},
   {label:'valeurs égales', harness:'int main(void){ int m,M; ft_min_max(5,5,&m,&M); __putnbr(m); __putnbr(M); return 0; }', expect:'55'},
   {label:'négatifs', harness:'int main(void){ int m,M; ft_min_max(-7,-2,&m,&M); __putnbr(m); __putnbr(M); return 0; }', expect:'-7-2'}],
  hints:["Un if pour comparer a et b, et deux écritures à travers les pointeurs.",
         "N'oublie pas l'étoile devant min et max quand tu écris dedans.",
         "Le cas des valeurs égales est couvert automatiquement si ta condition utilise < ou >."]},
 {k:'code',h:'',
  brief:"Écris <code>ft_echange_somme</code>, qui remplace la valeur pointée par <code>a</code> par la somme des deux, et celle pointée par <code>b</code> par leur différence (a moins b, calculée avec les valeurs <b>d'origine</b>).",
  sig:'void ft_echange_somme(int *a, int *b);',
  start:'void\tft_echange_somme(int *a, int *b)\n{\n\t\n}\n',
  tests:[{label:'a=10, b=4 → 14 et 6', harness:'int main(void){ int a=10,b=4; ft_echange_somme(&a,&b); __putnbr(a); __putnbr(b); return 0; }', expect:'146'},
   {label:'a=1, b=1 → 2 et 0', harness:'int main(void){ int a=1,b=1; ft_echange_somme(&a,&b); __putnbr(a); __putnbr(b); return 0; }', expect:'20'},
   {label:'a=0, b=5 → 5 et -5', harness:'int main(void){ int a=0,b=5; ft_echange_somme(&a,&b); __putnbr(a); __putnbr(b); return 0; }', expect:'5-5'}],
  hints:["Si tu écris dans *a en premier, la valeur d'origine de a est perdue pour le calcul suivant.",
         "Copie les deux valeurs dans des variables locales avant d'écrire.",
         "int x = *a; int y = *b; puis *a = x + y; *b = x - y;"],
  post:"C'est exactement le piège de l'échange de deux variables : sans copie temporaire, la première écriture détruit ce dont la seconde a besoin."},
 {k:'bug',
  contexte:"Un camarade a écrit un échange de deux entiers. Il compile sans un seul avertissement, et pourtant le résultat est faux :",
  code:"void ft_echange(int *a, int *b)\n{\n    *a = *b;\n    *b = *a;\n}\n\n// avec a = 3 et b = 9, on obtient a = 9 et b = 9",
  q:"Que s\'est-il passé exactement ?",
  opts:["Les deux étoiles sont en trop","La première ligne écrase la valeur de a, que la seconde ligne relit ensuite au lieu de l\'ancienne","Il faut échanger les pointeurs et non les valeurs","Le compilateur a optimisé la seconde ligne"],
  a:1,
  why:"Rien n\'est illégal ici, et c\'est pour ça que le compilateur se tait : le code fait exactement ce qui est écrit. Après <code>*a = *b</code>, l\'ancienne valeur de a n\'existe plus nulle part. La seconde ligne relit donc la nouvelle. Il faut mettre la valeur de côté <b>avant</b> la première écriture. C\'est le même piège que dans la mission de cette salle, et il revient dès qu\'une écriture détruit une donnée dont une autre a encore besoin."},
 {k:'mcq',h:'',q:"Pourquoi une fonction d'échange a-t-elle besoin d'une variable temporaire ?",
  opts:["Pour la lisibilité uniquement",
        "Parce que la première affectation écrase une valeur dont la seconde a encore besoin",
        "Parce que C interdit deux affectations de suite","Elle n'en a pas besoin"],a:1,
  why:"Dès qu'on écrit dans la première case, l'ancienne valeur disparaît. Il faut l'avoir mise de côté avant."}
]},

{
id:'p4', file:'chaines', tag:'concept', title:'Chaînes et zéro final',
sub:'Une chaîne est une adresse, et sa fin est un octet nul.',
steps:[
 {k:'lesson',h:'Où s\'arrête une chaîne ?',b:`
  <p>En C, une chaîne n'est pas un type : c'est un <code>char *</code>, c'est-à-dire <b>l'adresse du premier caractère</b>. Rien ne dit sa longueur.</p>
  <p>La fin est marquée par un octet valant <b>zéro</b>, écrit <code>'\\0'</code>. Il est ajouté automatiquement aux chaînes littérales, et il n'est pas compté dans la longueur.</p>
  <p>Parcourir une chaîne, c'est donc avancer tant que le caractère courant n'est pas nul. Et comme zéro est faux en C, <code>while (str[i])</code> suffit : c'est la même chose que <code>while (str[i] != 0)</code>, en plus court.</p>
  <p><code>str[i]</code> et <code>*(str + i)</code> sont deux écritures du même accès. La première est plus lisible, la seconde montre ce qui se passe vraiment.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_compte</code>, qui renvoie le nombre de fois que le caractère <code>c</code> apparaît dans la chaîne. Zéro si la chaîne est vide.",
  sig:'int ft_compte(char *str, char c);',
  start:'int\tft_compte(char *str, char c)\n{\n\t\n}\n',
  tests:[{label:'compter les a de "banana"', harness:"int main(void){ __putnbr(ft_compte(\"banana\",'a')); return 0; }", expect:'3'},
   {label:'caractère absent', harness:"int main(void){ __putnbr(ft_compte(\"banana\",'z')); return 0; }", expect:'0'},
   {label:'chaîne vide', harness:"int main(void){ __putnbr(ft_compte(\"\",'a')); return 0; }", expect:'0'},
   {label:'tous identiques', harness:"int main(void){ __putnbr(ft_compte(\"aaaa\",'a')); return 0; }", expect:'4'}],
  hints:["Il te faut un indice qui avance, et un compteur qui n'avance que si le caractère correspond.",
         "La boucle s'arrête sur le zéro final : while (str[i]) suffit.",
         "N'oublie pas de renvoyer le compteur à la fin."]},
 {k:'mcq',h:'',q:"La chaîne <code>\"abc\"</code> occupe combien d'octets en mémoire ?",
  opts:['3','4','5','ça dépend'],a:1,
  why:"Trois caractères plus l'octet nul de fin. Ce zéro n'est pas compté dans la longueur, mais il occupe bien une place, et l'oublier fait déborder toutes les boucles."},
 {k:'mcq',h:'',q:"Que se passe-t-il si le zéro final est absent de la mémoire ?",
  opts:["La boucle s'arrête quand même","La boucle continue au-delà et lit n'importe quoi",
        "Le compilateur refuse","La chaîne est vide"],a:1,
  why:"Rien n'indique la fin. La boucle poursuit dans la mémoire voisine jusqu'à tomber sur un zéro par hasard, ou jusqu'au plantage. C'est la source d'erreur numéro un sur les chaînes."}
]},

{
id:'p5', file:'tableaux', tag:'concept', title:'Tableaux et indices croisés',
sub:'Modifier sur place, et faire se rencontrer deux indices.',
steps:[
 {k:'lesson',h:'Un tableau se passe par son adresse',b:`
  <p>Un tableau d'entiers se transmet par l'adresse de sa première case, plus sa taille : la fonction ne peut pas la deviner, il n'y a pas de zéro final ici.</p>
  <p>Comme la fonction reçoit une adresse, elle travaille sur <b>le tableau d'origine</b>. Toute modification est donc visible chez l'appelant : c'est du travail « sur place ».</p>
  <p>Le motif à retenir pour inverser ou vérifier une symétrie, c'est <b>deux indices qui se rapprochent</b> : un qui part du début, un de la fin, et on avance jusqu'à ce qu'ils se croisent. Le nombre d'échanges est donc <code>taille / 2</code>, et faire toute la longueur remettrait le tableau dans son état initial.</p>`},
 {k:'code',h:'',
  brief:"Écris <code>ft_doubler</code>, qui multiplie par deux chaque élément du tableau, sur place.",
  sig:'void ft_doubler(int *tab, int size);',
  start:'void\tft_doubler(int *tab, int size)\n{\n\t\n}\n',
  tests:[{label:'{1,2,3}', harness:'int main(void){ int t[3]={1,2,3}; ft_doubler(t,3); int i=0; while(i<3){ __putnbr(t[i]); i++; } return 0; }', expect:'246'},
   {label:'négatifs et zéro', harness:'int main(void){ int t[3]={-2,0,5}; ft_doubler(t,3); int i=0; while(i<3){ __putnbr(t[i]); i++; } return 0; }', expect:'-4010'},
   {label:'taille 1', harness:'int main(void){ int t[1]={7}; ft_doubler(t,1); __putnbr(t[0]); return 0; }', expect:'14'}],
  hints:["Une boucle de 0 à size - 1, et une écriture dans tab[i].",
         "tab[i] = tab[i] * 2;",
         "Attention à la condition d'arrêt : i < size, pas i <= size."]},
 {k:'code',h:'',
  brief:"Écris <code>ft_symetrique</code>, qui renvoie 1 si le tableau se lit pareil dans les deux sens, et 0 sinon.",
  sig:'int ft_symetrique(int *tab, int size);',
  start:'int\tft_symetrique(int *tab, int size)\n{\n\t\n}\n',
  tests:[{label:'{1,2,1} → 1', harness:'int main(void){ int t[3]={1,2,1}; __putnbr(ft_symetrique(t,3)); return 0; }', expect:'1'},
   {label:'{1,2,3} → 0', harness:'int main(void){ int t[3]={1,2,3}; __putnbr(ft_symetrique(t,3)); return 0; }', expect:'0'},
   {label:'{4,7,7,4} → 1', harness:'int main(void){ int t[4]={4,7,7,4}; __putnbr(ft_symetrique(t,4)); return 0; }', expect:'1'},
   {label:'{4,7,8,4} → 0', harness:'int main(void){ int t[4]={4,7,8,4}; __putnbr(ft_symetrique(t,4)); return 0; }', expect:'0'},
   {label:'un seul élément → 1', harness:'int main(void){ int t[1]={9}; __putnbr(ft_symetrique(t,1)); return 0; }', expect:'1'}],
  hints:["Deux indices : un à 0, un à size - 1, qui se rapprochent.",
         "Dès qu'une paire diffère, tu peux renvoyer 0 immédiatement.",
         "Si la boucle se termine sans différence, renvoie 1. L'élément du milieu, en taille impaire, n'a pas besoin d'être comparé."],
  post:"C'est exactement le squelette d'une inversion de tableau : mêmes deux indices, mêmes size / 2 tours. Seule l'action au centre change."},
 {k:'mcq',h:'',q:"Pourquoi une inversion de tableau ne boucle-t-elle que jusqu'à <code>size / 2</code> ?",
  opts:["Par optimisation, ça marcherait quand même",
        "Parce qu'aller jusqu'au bout échangerait une deuxième fois chaque paire et remettrait tout en place",
        "Parce que la deuxième moitié n'existe pas","C'est arbitraire"],a:1,
  why:"Chaque tour traite une paire. Continuer au-delà du milieu refait les mêmes échanges à l'envers : le tableau revient à son état de départ."}
]},

{
id:'p6', file:'autoeval', tag:'boss', title:'Auto-évaluation', boss:true,
sub:'Huit questions de concept, à voix haute, sans lire.',
steps:[
 {k:'lesson',h:'Règle du jeu',b:`
  <p>Les pointeurs sont le sujet où l'on peut le plus facilement faire tourner du code sans rien comprendre. Ces questions vérifient l'inverse.</p>
  <p>Réponds <b>à voix haute et en entier</b> avant de révéler.</p>`},
 {k:'viva'}
]}
];

const VIVA=[
 {q:"Pourquoi une fonction a-t-elle besoin d'un pointeur pour modifier une variable de l'appelant ?",
  a:"Parce que les arguments sont copiés à l'appel : la fonction travaille sur sa propre copie, et la modifier ne change rien chez l'appelant. En recevant l'adresse, elle peut aller écrire directement dans la case d'origine."},
 {q:"Quelle est la différence entre p = 5 et *p = 5 ?",
  a:"La première change le pointeur lui-même : il se met à désigner l'adresse 5, ce qui n'a aucun sens et fera planter la suite. La seconde suit le pointeur et écrit 5 dans la case visée. L'étoile fait la différence entre changer la flèche et changer la cible."},
 {q:"Avec int **q, que valent *q et **q ?",
  a:"*q est encore un pointeur, il reste un saut à faire. **q est l'entier final. Le nombre d'étoiles du type dit combien de sauts séparent la variable de la valeur, et on les enlève une par une pour suivre le chemin."},
 {q:"Comment fait-on pour qu'une fonction produise deux résultats ?",
  a:"On lui passe deux adresses où déposer les résultats, et elle écrit à travers ces pointeurs. Elle reste void, puisque return ne peut rendre qu'une seule valeur. On appelle ça des paramètres de sortie."},
 {q:"Pourquoi un échange de deux valeurs a-t-il besoin d'une variable temporaire ?",
  a:"Parce que la première affectation écrase une valeur dont la seconde a encore besoin. Il faut mettre l'ancienne valeur de côté avant d'écrire, sinon on se retrouve avec deux fois la même."},
 {q:"Comment sait-on où s'arrête une chaîne de caractères ?",
  a:"Un octet nul est placé après le dernier caractère. Rien d'autre n'indique la longueur, puisqu'une chaîne n'est que l'adresse de son premier caractère. On parcourt donc tant que le caractère courant n'est pas nul, ce qui s'écrit simplement while sur le caractère puisque zéro est faux."},
 {q:"La chaîne \"abc\" occupe combien d'octets, et pourquoi cette question compte ?",
  a:"Quatre : les trois caractères plus l'octet nul. Il n'est pas compté dans la longueur mais il occupe une place réelle. L'oublier fait déborder les boucles et écraser la mémoire voisine."},
 {q:"Pourquoi une inversion de tableau ne boucle-t-elle que jusqu'à la moitié ?",
  a:"Parce que chaque tour traite une paire, une case du début avec une case de la fin. Aller au-delà du milieu referait les mêmes échanges en sens inverse et remettrait le tableau dans son état de départ. En taille impaire, l'élément central reste en place, ce qui est correct."}
];

/* ==========================================================================
   3. ÉTAT + PERSISTANCE
   ========================================================================== */
