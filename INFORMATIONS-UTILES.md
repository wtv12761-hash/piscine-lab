# INFORMATIONS UTILES — référence technique complète

Tout ce dont on peut avoir besoin sans relire le code.
Voir aussi `CONTEXT.md` (le pourquoi) et `HANDOFF.md` (comment travailler sur le dépôt).

---

## 1. Inventaire exact du dépôt

| Fichier | Rôle | Salles | Clé de stockage |
|---|---|---|---|
| `index.html` | hub, une carte par module | — | lecture seule des autres clés |
| `shell00.html` | Shell 00 | 10 | `shell00lab_v1` |
| `shell01.html` | Shell 01 | 8 | `shell01lab_v1` |
| `c00.html` | C 00 | 6 | `c00lab_v1` |
| `c01.html` | C 01 | 6 | `c01lab_v1` |
| `CONTEXT.md` | contexte du projet | — | — |
| `HANDOFF.md` | guide de travail | — | — |
| `INFORMATIONS-UTILES.md` | ce fichier | — | — |
| `tests/` | vérification | — | — |
| `.gitignore` | ignore `tests/_*.js` (générés) et les supports de cours | — | — |
| `.gitattributes` | interdit la conversion des fins de ligne, sans quoi un clone diffèrerait de la construction | — | — |

Hors dépôt, à côté : `shell00/`, `shell01/`, `C00/`, `C01/` contiennent les sujets PDF et
les ressources fournies par l'école. Ils servent à vérifier la règle 1 et ne sont pas
versionnés : le dépôt est public et ces documents ne sont pas notre travail.

**Composition du contenu, comptée sur les pages livrées :**

| Module | leçons | missions | QCM | saisies | oral libre | widgets | questions d'auto-éval |
|---|---|---|---|---|---|---|---|
| Shell 00 | 10 | 10 `term` | 16 | 6 | 3 | bits, inode | 10 |
| Shell 01 | 8 | 10 `term` | 12 | 3 | 0 | — | 10 |
| C 00 | 6 | 6 `code` | 8 | 1 | 0 | ascii | 8 |
| C 01 | 6 | 7 `code` | 7 | 1 | 0 | mem | 8 |

Les missions C exécutent **18 cas de test** en C 00 et **24** en C 01.

**Suite de vérification, 610 assertions :**

| Fichier | Assertions | Couvre |
|---|---|---|
| `tests/test_shell_engine.js` | 47 | commandes de base du simulateur |
| `tests/test_shell_pipes.js` | 32 | pipes, filtres, variables, non-régression |
| `tests/test_rooms_shell00.js` | 85 | missions Shell 00 |
| `tests/test_rooms_shell01.js` | 54 | missions Shell 01 |
| `tests/test_c_engine.js` | 37 | langage C interprété, dont la portée lexicale |
| `tests/test_rooms_c.js` | 78 | missions C 00 et C 01 |
| `tests/test_confidentialite.js` | 33 | aucune donnée personnelle dans aucun fichier |
| `tests/test_regle1.js` | 145 | aucune mission ne reproduit un exercice du sujet |
| `tests/test_sources.js` | 11 | les pages livrées sont bien celles que produisent les sources |

En complément, `tests/verify_docs.js` exécute **139 contrôles d'audit** : cohérence entre
la documentation et le code, invariants de contenu, non-régression de la salle
d'auto-évaluation, autonomie des pages, liens du hub. Il est lancé automatiquement par
`run_all.sh`, qui **échoue désormais réellement** quand une de ces vérifications échoue.

---

## 2. Le simulateur shell — référence des commandes

Système de fichiers en mémoire. Trois types de nœuds :

```js
fDir(mode)            // dossier, mode octal, défaut 0o755
fFile(contenu, mode)  // fichier, défaut 0o644
fLink(cible)          // lien symbolique, taille = cible.length
```

Un **lien dur** n'est pas un type : c'est le **même objet JavaScript** placé sous deux
noms. Le compteur de liens et la propagation d'un `chmod` en découlent naturellement.

### Commandes disponibles

| Commande | Options gérées | Notes |
|---|---|---|
| `ls` | `-l -a -t -m -p -F -i` | combinables, `-p` et `-F` distincts (point pédagogique) |
| `cd` | — | refuse d'entrer sans bit `x`, gère `..` et `~` |
| `pwd` | — | renvoie `/home/student…` |
| `cat` | `-e` | sans fichier, lit l'entrée standard |
| `echo` | — | ajoute toujours le saut de ligne final |
| `touch` | `-t AAAAMMJJhhmm`, `-h` | date invalide rejetée |
| `mkdir` | `-p` | |
| `rm` | `-r -f` | refuse un dossier sans `-r` |
| `rmdir` | — | refuse si non vide |
| `chmod` | mode octal 3 ou 4 chiffres | refuse `u+x` exprès, ignore les liens symboliques |
| `ln` | `-s` | lien dur interdit sur un dossier |
| `wc` | `-l -w -c` | sur fichier ou entrée standard |
| `find` | voir plus bas | mini-parseur complet |
| `man` | — | pages fournies, voir plus bas |
| `export` `unset` `env` | — | variables d'environnement |
| `tr` | `-d`, intervalles `a-z`, `\n` `\t` `\\` | **entrée standard uniquement**, exprès |
| `cut` | `-d` `-f` (`1` ou `1,3`) | fichier ou entrée standard |
| `grep` | `-v -i -c` | motif en expression régulière |
| `head` `tail` | `-n N`, `-N` | 10 lignes par défaut |
| `sort` | `-r` | ordre alphabétique |
| `uniq` | — | doublons **consécutifs** seulement, comme le vrai |
| `rev` | — | inverse chaque ligne, pas l'ordre des lignes |
| `id` | `-G -n` | base fictive : `student`, `daemon`, `marvin`, `bocal` |
| `clear` `help` | — | |

**Aussi géré :** pipes `|` en chaîne, redirections `>` et `>>`, expansion `$VAR`
(y compris dans les guillemets doubles, bloquée dans les simples), `\(` `\)` échappés.

**Détail fidèle et pédagogiquement important :** la redirection est mise en place
**avant** l'exécution. Une commande qui échoue vide quand même le fichier cible.
C'est le comportement du vrai shell, et l'étudiant s'est fait avoir en vrai avec ça.

### `find`

Mini-parseur récursif : `-type f|d|l`, `-name MOTIF` (jokers `*` et `?`),
`-o` (OU), groupes parenthésés, `-print`, `-delete`, `-maxdepth` (accepté, ignoré).
ET implicite entre éléments successifs, évalué de gauche à droite avec arrêt au premier faux.
Sans action explicite, un `-print` est ajouté.

### Pages `man` fournies

`ls`, `chmod`, `ln`, `find`, `cat`, `tr`, `cut`, `grep`, `wc`, `sort`, `head`, `tail`, `rev`, `id`.

Elles sont **volontairement incomplètes** : elles contiennent l'option nécessaire mais
ne disent pas laquelle choisir. Plusieurs missions demandent explicitement d'aller y
chercher. **Toute nouvelle commande doit venir avec sa page.**

### Utilitaires pour écrire une vérification

```js
lookup(sh, 'chemin')        // nœud ou null ; chemin absolu si commence par /
readTarget(sh, 'chemin')    // suit un lien symbolique sur un niveau
modeStr(n)                  // '-rw-r--r--'
sizeOf(n)                   // taille en octets
newShellFrom(sh)            // clone complet, pour rejouer sans effet de bord
run(sh, 'commande')         // { out } ou { err }
```

---

## 3. L'interpréteur C — référence du langage

Chaîne complète : lexer → parseur récursif descendant → évaluateur sur `Int32Array`.
Les adresses sont des indices dans ce tableau, ce qui rend les pointeurs de pointeurs
naturels à n'importe quelle profondeur.

### Supporté

- **Types** : `int`, `char`, `void`, `unsigned`, `long`, `short`, `const`
  (ces trois derniers acceptés et ignorés), pointeurs à profondeur quelconque
- **Déclarations** : locales et globales, multiples sur une ligne, initialisation,
  tableaux `int t[3] = {1,2,3}`, un tableau vaut l'adresse de sa première case
- **Littéraux** : entiers, caractères avec échappements `\n \t \r \0 \\ \' \"`,
  chaînes terminées par un octet nul automatique
- **Contrôle** : `if` / `else`, `while`, `for` (déclaration interne comprise),
  `return`, `break`, `continue`, blocs imbriqués avec portée correcte
- **Opérateurs** : `+ - * / %`, `< > <= >= == !=`, `&& ||` court-circuités, `!`,
  ternaire `? :`, `++` `--` préfixes et suffixes, `= += -= *= /= %=`,
  `&` (adresse), `*` (déréférencement), `[]`, moins unaire
- **Fonctions** : définitions, prototypes (tolérés et ignorés), appels, récursion,
  arguments passés par copie
- **Commentaires** `//` et `/* */`, **casts** reconnus et ignorés

### Fonctions disponibles

| Fonction | Usage |
|---|---|
| `write(fd, ptr, len)` | **la seule autorisée à l'étudiant**, comme dans le sujet |
| `__putnbr(n)` | harnesses de test uniquement, affiche un entier |
| `__putstr(ptr)` | harnesses de test uniquement |
| `__putchar(c)` | harnesses de test uniquement |

Les fonctions à double underscore ne doivent **jamais** apparaître dans un énoncé
ni dans un squelette : elles servent à observer le résultat depuis le harness.

### Erreurs détectées

Division et modulo par zéro · déréférencement et écriture via pointeur nul ·
index menant hors mémoire · fonction inconnue · variable inconnue · mauvais nombre
d'arguments · mémoire épuisée · erreurs de syntaxe avec le jeton fautif ·
**limite de 3 000 000 d'opérations** qui coupe les boucles infinies.

Cette dernière est indispensable : sans elle, une boucle sans incrément fige le
téléphone de l'étudiant.

### Portée

Une fonction ne voit que **sa propre portée et les variables globales**, comme en C.
La pile de portées était unique auparavant : une fonction lisait les locales de son
appelant, donc un paramètre oublié passait ici alors que `cc` le refuse. Corrigé, avec
cinq cas de non-régression dans `tests/test_c_engine.js`.

### Limites, à dire honnêtement

- `int` et `char` occupent la même case : **pas de débordement à 8 bits**,
  donc les questions sur le dépassement d'un `char` ne sont pas simulables
- pas de `struct`, pas d'`enum`, pas de `typedef`
- pas d'allocation dynamique, pas de bibliothèque standard
- pas de vérification de type : `int *p = 5;` passe sans broncher
- l'arithmétique de pointeur avance d'une **case**, pas de `sizeof` octets
- pas de `switch`, pas d'opérateurs binaires `& | ^ << >>` en tant qu'opérateurs
  (le `&` est réservé à l'adresse)
- **ce n'est pas un compilateur** : ni `-Wall -Wextra -Werror`, ni la norminette.
  Le pied de page le dit à l'étudiant ; ne pas laisser croire l'inverse.

### API

```js
runC(codeEtudiant, harness, {entry:'main', limit:3000000})
// → { ok:true, out:'sortie', ret:0 }  ou  { ok:false, err:'message' }
```

---

## 4. Persistance et progression

**Stockage** : `window.storage` si présent, sinon `localStorage`, sinon mémoire volatile.
Toujours dans un `try/catch` : sur certains contextes d'affichage, le stockage lève.

**Forme de l'état** :
```js
{ xp:0, rooms:{ 's1':{done:3, cleared:true} }, srs:{ 's1.2':{box:2, due:'2026-08-14'} },
  streak:0, last:'2026-08-11', viva:{} }
```

**Révision espacée** : boîtes de Leitner, intervalles `[0, 1, 3, 7, 16]` jours.
Réponse juste → boîte suivante, réponse fausse → retour à zéro.
Indexée par `roomId.stepIndex`, alimentée automatiquement par les QCM et les saisies.
La session de révision **mélange les modules et les salles**, exprès : réviser un thème
d'affilée donne l'illusion de savoir.

**Sauvegarde manuelle** : bouton sur chaque page, encode l'état en base64
(`{x, r, s, k, l}` pour xp, rooms, srs, streak, last). C'est le seul moyen de passer
d'un appareil ou d'un navigateur à l'autre. **Ne pas casser ce format** sans migration :
l'étudiant garde ses codes dans une note sur son téléphone.

**Progression affichée** : chaque module convertit son avancement en bits de permission
`rwxrwxrwx`, objectif `chmod 777`. Le hub relit les quatre clés en lecture seule.

---

## 5. Correspondance sujets ↔ contenu du lab

Colonne de gauche : ce que demande 42. Colonne de droite : ce que le lab enseigne,
**délibérément différent**. C'est la table à consulter avant d'ajouter du contenu.

### Shell 00

| Exercice du sujet | Le lab entraîne, autrement |
|---|---|
| ex00 : fichier `z` affichant `Z` | créer un fichier affichant `OK`, et le piège du dossier existant |
| ex01 : `testShell00` en `-r--r-xr-x`, 40 octets | lire les colonnes de `ls -l`, ordre contenu puis permissions |
| ex02 : sept fichiers, liens durs et symboliques | `-rwxr-x---` et `526` à traduire, dossier verrouillé sans `x`, lien vers `rapports` |
| ex03 : clé ed25519 à rendre | trouver la moitié publique sans afficher la privée |
| ex04 : `midLS` | **une exigence de plus** : les entrées cachées sont incluses, donc la commande produite diffère de celle du rendu. La question, elle, porte sur l'arbitrage entre les deux options qui ajoutent un slash. Version précédente : mêmes exigences exactement, donc même commande, ce qui violait la règle 1 |
| ex05 : cinq derniers commits | le format court contre le format complet |
| ex06 : fichiers ignorés par git | pourquoi l'option d'exclusion standard est obligatoire |
| ex07 : reconstruire `b` depuis un diff | le rôle de l'option de sortie, la vérification par diff inverse |
| ex08 : `clean` sans chaînage | `.bak` et `tmp_` au lieu de `~` et `#`, expression à construire |
| ex09 : `ft_magic` | non couvert |

### Shell 01

| Exercice du sujet | Le lab entraîne, autrement |
|---|---|
| ex01 : groupes d'un utilisateur | définir une variable et la passer à une commande. Le nom de variable du sujet n'est pas employé : la salle utilise `CIBLE` |
| ex02 : `.sh` sans extension | compter en profondeur, `find` contre `ls` |
| ex03 : compter fichiers et dossiers | le motif « produire une ligne par élément puis compter » |
| ex04 : adresses MAC | filtrer des lignes, et le filtre inversé |
| ex05 : nom de fichier hostile | créer `a b$c`, simples contre doubles guillemets |
| ex06 : une ligne sur deux | trier puis tronquer, et l'ordre du pipeline |
| ex07 : chaîne de transformations | chaque filtre isolément : `tr`, `cut`, `grep`, `sort`, `rev` |
| ex08 : bases inventées | non couvert |

### C 00

| Exercice du sujet | Le lab entraîne, autrement |
|---|---|
| ex00 : `ft_putchar` | `ft_deux(char a, char b)` |
| ex01/02 : alphabet et alphabet inversé | `ft_de_a_a(debut, fin)`, avec le cas vide |
| ex03 : chiffres | `ft_pairs`, chiffres pairs, conversion `+ '0'` |
| ex04 : signe d'un entier | trois cas au lieu de deux, pour forcer le traitement du zéro |
| ex05/06/08 : combinaisons | `ft_paires` sous 4, point de départ de la boucle intérieure |
| ex07 : afficher un entier | nombre à deux chiffres, extraction et ordre |

### C 01

| Exercice du sujet | Le lab entraîne, autrement |
|---|---|
| ex00 : mettre 42 via pointeur | `ft_mettre(p, v)`, valeur libre |
| ex01 : neuf niveaux de pointeurs | trois niveaux, même mécanique |
| ex02 : échange de deux entiers | `ft_echange_somme`, même piège de la temporaire |
| ex03/04 : division et modulo | `ft_min_max`, deux paramètres de sortie |
| ex05/06 : afficher et mesurer une chaîne | `ft_compte(str, c)`, parcours jusqu'au zéro final |
| ex07 : inverser un tableau | `ft_symetrique`, mêmes indices croisés, même `size / 2` |
| ex08 : trier un tableau | `ft_doubler`, modification sur place |

---

## 6. Le circuit de rendu à 42 (contexte, hors de ce dépôt)

Utile pour comprendre les références dans le contenu, et pour aider l'étudiant.

- **Un dépôt par projet**, hébergé sur le serveur git de l'école. L'URL figure sur
  la page intra du projet. Chaque projet a un identifiant différent : cloner le mauvais
  dépôt fait perdre le module entier. Réflexe après tout clonage : vérifier le distant.
- **Le dépôt est le rendu.** La correction automatique clone ; elle ne voit jamais le
  disque local. `add` puis `commit` puis `push`, sans quoi rien n'existe.
- `git ls-files` montre ce que la correction verra réellement. C'est la vérification
  qui compte, plus que `ls`.
- **Aucun fichier en trop** dans les dossiers de rendu : c'est une cause de rejet fréquente.
- Un exercice difficile **n'est pas compté** si un exercice plus simple ne fonctionne
  pas parfaitement. Un rejet inexpliqué vient souvent de là.
- Authentification par **clé SSH publique**, une seule à la fois côté intra.
  La remplacer nécessite de détruire l'ancienne puis de coller la nouvelle.
- La **soutenance** est déclenchée par l'étudiant. Personne ne corrige sans qu'il
  l'ait demandé : il peut donc pousser tôt sans être évalué tôt.

---

## 7. Environnement de l'étudiant

**Poste de l'école** : Ubuntu 22.04 sur iMac Intel, `x86_64`, pas de root,
shell `zsh`, home parfois réinitialisé entre les sessions.

**Ghostty** installé sans root via AppImage dans `~/.local/bin/ghostty`, avec
`~/.local/bin` ajouté au `PATH` dans `~/.zshrc`. Si le home est réinitialisé,
tout est à refaire ; ce n'est pas un problème du lab.

**Invite zsh personnalisée** affichant la branche git, avec `*` pour les modifications
non préparées et `+` pour les modifications préparées mais non commitées. Ces marqueurs
ne disent rien de l'état du serveur : seul `git status` le dit.

**Téléphone** : iPhone, Brave par défaut. Sur iOS, l'ajout à l'écran d'accueil n'existe
que dans Safari ; depuis Brave il faut passer par « Ouvrir dans Safari ». Conséquence à
connaître : la progression stockée dans Safari est distincte de celle de Brave, d'où
l'importance du code de sauvegarde manuelle.

---

## 8. Déploiement et dépannage

**GitHub Pages** : dépôt public, branche `main`, dossier racine, `index.html` à la racine.
Un push déclenche le déploiement, une minute environ.

Depuis un poste avec git configuré :
```sh
git add -A && git commit -m "message" && git push
```

**Problèmes déjà rencontrés :**

| Symptôme | Cause | Correction |
|---|---|---|
| 404 juste après activation | déploiement en cours | attendre une à deux minutes |
| Pages reste désactivé | dépôt privé | Pages gratuit exige un dépôt public |
| URL avec `%20` | espace dans un nom de fichier | renommer sans espace |
| Progression remise à zéro | changement de navigateur ou d'appareil | restaurer par le code de sauvegarde |
| `zsh: bad pattern: ^[[200~` | collage d'un bloc dans le terminal | retaper à la main |
| `command not found: <invite>%` | l'invite du terminal a été copiée avec la commande | ne copier que la commande elle-même |

---

## 9. Vocabulaire du projet

**Module** : un fichier HTML, un projet de la Piscine.
**Salle** : une unité du module, dans le menu façon `ls -l`.
**Étape** : un élément d'une salle (leçon, mission, question, widget).
**Mission** : une étape exécutable, `term` côté shell, `code` côté C.
**Harness** : le `main` de test qui appelle la fonction de l'étudiant.
**Auto-évaluation** : la salle finale, orale, sans validation automatique.
**Le sujet** : le PDF officiel de 42. **La correction automatique** : le programme de l'école.
