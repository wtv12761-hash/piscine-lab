# HANDOFF — lab de révision Piscine 42

Ce fichier est écrit pour **une session Claude Code qui reprend ce dépôt sans rien connaître
de l'historique**. Lis-le en entier avant de toucher au code. Tout le contenu, les commentaires
et l'interface sont en **français** : garde cette langue.

## Les trois documents

| Fichier | Contenu | Quand le lire |
|---|---|---|
| `CONTEXT.md` | qui est l'utilisateur, pourquoi le projet existe, les décisions et leurs raisons, les erreurs déjà commises | **en premier**, avant toute décision de conception |
| `HANDOFF.md` | ce fichier : règles, architecture, comment ajouter du contenu, comment vérifier | avant de toucher au code |
| `INFORMATIONS-UTILES.md` | référence exhaustive : commandes du simulateur, grammaire C, chiffres réels, correspondance sujets ↔ lab, dépannage | en consultation, quand tu as besoin d'un détail |

## Démarrage rapide

```sh
sh tests/run_all.sh        # doit afficher 0 échec partout, avant et après ton travail
```

Puis ouvre `index.html` dans un navigateur. Aucune installation, aucune dépendance,
aucun serveur : c'est un site statique et il doit le rester.

Si tu ne fais qu'une chose avant de coder : lis le **§3 Règles non négociables**
ci-dessous et le **§9 Les tests**. Le reste s'apprend en lisant le code.

---

## 1. Ce qu'est ce projet

Un site statique de révision, fait pour un étudiant qui passe la **Piscine C de 42 Lausanne**.
Un fichier HTML par module, aucun build, aucune dépendance, aucun serveur.
Hébergé sur **GitHub Pages**, consulté principalement **depuis un téléphone**.

Ce n'est pas un site de solutions. C'est un lab d'entraînement : on y apprend les
**mécanismes** des exercices, jamais leurs réponses.

---

## 2. Le contexte humain (important pour les décisions)

- L'étudiant est **débutant complet**. Il faut expliquer, pas seulement livrer.
- L'école interdit explicitement de demander les réponses à une IA. Le sujet contient
  un chapitre entier là-dessus. La notation passe par une **soutenance orale** :
  un camarade demande d'expliquer chaque rendu. Un exercice qu'on ne sait pas défendre vaut zéro.
- Conséquence directe et **structurante pour ce dépôt** : le lab doit rendre l'étudiant
  capable d'expliquer, pas capable de rendre.
- Il travaille sur des machines d'école sous **Ubuntu 22.04**, sans droits root,
  et consulte le lab depuis son téléphone entre deux exercices.

---

## 3. Règles non négociables

### 3.1 Pédagogie

1. **Aucune mission ne doit résoudre un exercice du sujet.**
   On enseigne le mécanisme avec **d'autres valeurs, d'autres noms, d'autres cas**.
   Le test décisif : *la commande ou la fonction que l'étudiant produit doit être
   différente de celle qu'il doit rendre*. Changer les noms de fichiers ne suffit pas
   si la réponse tapée reste la même.
   Exemples de ce qui a été fait :
   - le sujet demande une fonction qui affiche un caractère → la salle en demande une
     qui en affiche deux
   - le sujet demande neuf niveaux de pointeurs → la salle en demande trois, avec une
     autre valeur
   - le sujet demande d'inverser un tableau → la salle demande de tester une symétrie
     (mêmes deux indices qui se croisent, même `size / 2`)
   - la salle `manpage` a longtemps échoué à ce test : elle demandait la combinaison
     d'options exacte du rendu, sur d'autres fichiers. Elle exige maintenant en plus
     les entrées cachées, ce qui change la commande produite et fait travailler au
     passage le fait que `.` et `..` sont des entrées cachées comme les autres.
     L'arbitrage entre les deux options qui ajoutent un slash, qui est la vraie
     valeur de cette salle, est porté par la question et n'a pas bougé.

   **Cette règle vaut pour tout le dépôt, pas seulement pour les pages.** Le dossier
   `tests/` a contenu pendant des mois les neuf fonctions demandées par C 01, écrites
   et fonctionnelles, dans un dépôt public. Elles y étaient parce qu'on testait un
   interpréteur avec les fonctions qu'on avait sous la main, sans voir qu'on écrivait
   un corrigé. `tests/test_regle1.js` le vérifie maintenant automatiquement, sur le
   contenu des salles **et** sur le dossier `tests/`.

   Si tu ajoutes du contenu, applique cette règle sans exception.

2. **Les indices vont du vague au précis.** Le dernier ne doit jamais être la réponse
   copiable. Ils ne coûtent plus de points : les xp ont été supprimés, parce qu'un total
   qui ne sert qu'à payer des indices ressemble à un score sans en être un. Le coût est
   maintenant réel : une tâche résolue avec un indice **retombe en boîte 0** de la
   révision espacée et repasse dans la session du jour, et elle est comptée « avec aide »
   à la fin de la salle. Un marquage qui n'agirait sur rien serait un faux signal.

3. **Chaque salle se termine par une question de concept**, pas par une manipulation.
   La salle finale de chaque module (`boss: true`) est une auto-évaluation orale.

3 bis. **Les exercices facultatifs du sujet le restent dans le lab.** Les sujets
   s'arrêtent avant la fin et disent explicitement qu'on peut continuer ou passer au
   projet suivant. Une salle qui correspond à un exercice situé après ce jalon porte
   `optionnel:true`. Conséquences, toutes dans `src/app.js` :
   - elle ne compte pas dans l'avancement du module ;
   - elle ne verrouille rien derrière elle, **soutenance blanche comprise** ;
   - la liste affiche une coupure explicite avant la première d'entre elles.

   Les jalons, relevés dans les PDF :

   | Module | Obligatoires | Facultatifs | Salles marquées |
   |---|---|---|---|
   | Shell 00 | ex00 à ex05 | ex06 à ex09 | `diffpatch`, `find` |
   | Shell 01 | ex01 à ex05 | ex06 à ex08 | `tri` |
   | C 00 | ex00 à ex04 | ex05 à ex08 | `imbrique`, `nombres` |
   | C 01 | tous | **aucun** | — |

   C 01 n'a pas de jalon : ses neuf exercices sont tous obligatoires. Ne pas en
   inventer un par symétrie avec les autres modules.

4. **Les tests doivent attraper l'erreur classique**, pas seulement valider le cas nominal.
   Voir §9.

### 3.1 bis Les quatre mécanismes d'apprentissage, et comment ils cohabitent

Ils ont été ajoutés ensemble, en veillant à ce qu'aucun n'allonge une salle sans
raison. Le principe : **au plus une étape en plus par module**, le reste vit à
l'intérieur de ce qui existait déjà.

1. **`bug` : trouver l'erreur.** Une étape par module, pas une par salle. On montre un
   travail plausible mais faux et on demande le diagnostic. Les fautes viennent de
   celles que la suite de tests attrape déjà, donc de fautes réellement commises.
   C'est la compétence exacte de la correction par les pairs, dans les deux sens :
   défendre son code et corriger celui d'un camarade.

2. **Lire un message du compilateur.** Fusionné dans le même type d'étape plutôt que
   d'en créer un nouveau : le `bug` de C 00 montre une sortie de `cc` et demande
   combien de problèmes distincts elle contient réellement. Une salle entière aurait
   été du remplissage ; une étape au bon endroit suffit.

3. **Prédire avant d'exécuter.** Un champ dans la mission de code, facultatif, au-dessus
   du bouton. On écrit ce qu'on croit que le premier cas va afficher, et la confrontation
   se fait toute seule. **Ce n'est pas une étape de plus** : c'est ce qui la rend
   supportable sur les treize missions C.

4. **Le décompte du premier coup.** Une phrase sur l'accueil du module : combien de
   questions ont été sues au premier essai, sur combien de tentées, sur combien au
   total. `S.premier[id]` n'est écrit qu'une fois et n'est jamais écrasé : refaire une
   salle jusqu'à ce que tout soit vert ne doit pas faire monter le chiffre, sans quoi
   il redevient un score déguisé.

**La révision ne se déclenche jamais toute seule.** Deux boutons : une session courte de
sept questions, et tout. Une file de trente questions qui tombe d'un bloc se repousse au
lieu de se faire.

### 3.2 Vie privée

**Aucune donnée personnelle nulle part dans le dépôt.** Pas de login, pas de nom de campus,
pas de nom de machine, pas d'URL de dépôt de rendu, pas de clé.
Les pages utilisent `student@campus` et `/home/student`.

`tests/test_confidentialite.js` parcourt **tous** les fichiers versionnés et fait échouer
la suite si quoi que ce soit de surveillé réapparaît. Il n'y a pas de liste de fichiers à
tenir à jour, et c'est délibéré : la version précédente n'inspectait qu'une liste écrite à
la main, `tests/` n'y figurait pas, et un login réel y a séjourné dans une fixture sans que
rien ne le signale. Un garde-fou avec un trou dedans est pire que pas de garde-fou, parce
qu'on lui fait confiance.

Les motifs vivent dans `tests/confidentialite.js`, en deux catégories :

- les **motifs génériques** (serveur de rendu, nom de machine du cluster) sont écrits en
  clair : ils ne désignent personne ;
- les **identifiants personnels** ne sont stockés que par leur empreinte SHA-256. Les écrire
  en clair pour les interdire reviendrait à les publier, ce qui est précisément le défaut
  corrigé. Le scanner découpe chaque fichier en jetons, les hache, et compare.

Pour surveiller un identifiant de plus, ajouter son empreinte :
```sh
node -e "console.log(require('crypto').createHash('sha256').update('LEJETON').digest('hex'))"
```
Cette liste ne se réduit jamais, elle ne fait que s'allonger.

**Les supports de cours de l'école ne sont pas versionnés.** Sujets PDF, archives de
ressources et listes de vidéos sont exclus par `.gitignore` : le dépôt est public et ces
documents ne sont pas notre travail.

### 3.3 Ne jamais mélanger avec le dépôt de rendu

Ce dépôt est **personnel**. Le rendu 42 vit dans un dépôt **séparé** sur le serveur de l'école, un par projet,
qui ne doit contenir **que** les fichiers demandés par le sujet. Ne jamais y copier quoi que ce soit d'ici.

---

## 4. Structure du dépôt

**Les pages livrées sont générées. On ne les édite pas : on édite `src/`.**

```
src/                      LA SOURCE, c'est ici qu'on travaille
  gabarit.html            squelette commun des quatre pages
  theme.css               le thème, écrit une fois
  app.js                  état, progression, révision, rendu : écrit une fois
  widgets.js              les objets manipulables
  moteur-shell.js         simulateur shell
  moteur-c.js             interpréteur C
  contenu-shell00.js      salles et questions du module, rien d'autre
  contenu-shell01.js
  contenu-c00.js
  contenu-c01.js
  build.mjs               assemble les pages ; --verifie signale les écarts

index.html                hub, écrit à la main (il ne partage rien avec les modules)
shell00.html              GÉNÉRÉ — 10 salles
shell01.html              GÉNÉRÉ — 8 salles
c00.html                  GÉNÉRÉ — 6 salles
c01.html                  GÉNÉRÉ — 6 salles
CONTEXT.md HANDOFF.md INFORMATIONS-UTILES.md
.gitignore                ignore tests/_*.js (générés) et les supports de cours
tests/                    voir §9
```

Hors dépôt, à côté : `shell00/`, `shell01/`, `C00/`, `C01/` contiennent les sujets PDF et
les ressources fournies par l'école. Ils servent à vérifier la règle 1 et ne sont **pas**
versionnés : le dépôt est public et ces documents ne sont pas notre travail.

### Pourquoi une construction, alors que le projet refusait tout build

Parce que le coût de la duplication s'est matérialisé. La couche de rendu était recopiée
dans quatre fichiers, identique à une ligne près : celle qui devait changer d'un module à
l'autre. Cette ligne a été oubliée, et la salle d'auto-évaluation a écrit sa progression au
mauvais endroit sur trois pages sur quatre pendant des mois, sans qu'aucun des 298 tests
d'alors ne le voie.

Les trois contraintes qui avaient motivé le refus du build sont intégralement préservées,
et elles ont été **mesurées, pas supposées** :

| Contrainte | État |
|---|---|
| GitHub Pages sans configuration | oui : les pages générées sont des fichiers statiques à la racine |
| Ouvrable depuis un téléphone, hors ligne | oui : chaque page reste autonome, aucune ressource externe |
| Déploiement par un simple `git push` | oui |

Le détail qui impose cette forme : en `file://`, un vrai Chrome bloque les modules ES et
`fetch`, et n'autorise que les `<script>` classiques. Une architecture moderne servie en
fichiers séparés casserait l'usage hors ligne. D'où le choix d'intégrer les sources dans
chaque page à la construction, plutôt que de les référencer.

```sh
node src/build.mjs             # régénère les quatre pages
node src/build.mjs --verifie   # ne réécrit rien, signale les écarts
```

`build.mjs` refuse d'écrire une page dont le JavaScript ne s'exécute pas, et refuse une
page qui référencerait une ressource externe. Ces deux gardes ont déjà servi.

## 5. Anatomie d'une page module

Ordre dans le `<script>` :

1. **le moteur** — simulateur shell (pages shell) ou interpréteur C (pages C)
2. `const ROOMS = [ ... ]` — le contenu pédagogique
3. `const VIVA = [ ... ]` — les questions d'auto-évaluation orale
4. **état et persistance** — `const KEY='<module>lab_v1'`, xp, salles validées, file de révision
5. **rendu** — hub, salles, widgets

Clés de stockage, une par module, à ne jamais collisionner :
`shell00lab_v1`, `shell01lab_v1`, `c00lab_v1`, `c01lab_v1`.
Le hub `index.html` lit ces clés en lecture seule pour afficher la progression.

Persistance : `window.storage` si disponible, sinon `localStorage`, sinon mémoire volatile.
Un bloc « Sauvegarde manuelle » sur chaque page exporte l'état en base64 pour passer
d'un appareil à l'autre. **Ne casse pas le format** sans prévoir une migration.

Révision espacée : boîtes de Leitner, intervalles `[0,1,3,7,16]` jours.
Chaque QCM et chaque question à saisie y entre automatiquement, indexé par `roomId.stepIndex`.

---

## 6. Schéma d'une salle

```js
{
  id:'s1',                 // unique dans le module, sert d'index de révision
  file:'pipe',             // nom affiché en style ls -l dans le menu
  tag:'concept',           // petite étiquette
  title:'Le pipe',
  sub:'une phrase qui dit ce qu\'on va comprendre',
  boss:true,               // optionnel, pour la salle d'auto-évaluation
  steps:[ ... ]
}
```

`nTasks()` compte les étapes **hors** `lesson`, `ascii`, `mem`, `bits`, `inode` :
ce sont les seules qui ne comptent pas dans la progression.

### Types d'étapes

**`lesson`** — explication. `{k:'lesson', h:'titre', b:'<p>html…</p>'}`
Trois à quatre paragraphes maximum. Le HTML est injecté tel quel.

**`mcq`** — question à choix.
```js
{k:'mcq', h:'', q:'question en html', opts:['a','b','c','d'], a:1,
 why:'explication affichée après la réponse, juste ou fausse'}
```
`a` est l'index de la bonne réponse. `why` est obligatoire.

**`input`** — réponse à taper.
```js
{k:'input', h:'', q:'question', a:['réponse canonique','variante'],
 accept:v=>/^regex$/.test(v),   // optionnel, prioritaire sur a
 why:'explication'}
```
`a[0]` est affiché comme réponse attendue en cas d'échec.
**Invariant testé** : `accept(a[0])` doit être vrai.

**`answer`** — question orale à réponse libre, avec modèle révélable et auto-notation.
```js
{k:'answer', h:'À dire à voix haute', q:'question', a:'réponse modèle en html'}
```

**`term`** — mission dans le simulateur shell (**pages shell uniquement**).
```js
{k:'term', h:'Mission : …', goal:'objectif court affiché dans la barre',
 brief:'énoncé en html',
 setup: sh => { sh.root.children['f'] = fFile('contenu\n'); },
 check: (sh, hist) => booléen,
 hints:['vague','plus précis','presque la réponse'],
 post:'remarque affichée après réussite'   // optionnel
}
```
`check` reçoit le shell après exécution et l'historique des commandes tapées.
Pour vérifier une **sortie**, rejoue la dernière commande sur une copie :
```js
check:(sh,hist)=>{
  const last=[...hist].reverse().find(h=>h.includes('|'));
  if(!last) return false;
  return run(newShellFrom(sh), last).out === 'attendu\n';
}
```
`newShellFrom` clone le système de fichiers : le rejeu ne modifie rien.

**`code`** — mission de code C (**pages C uniquement**).
```js
{k:'code', h:'',
 brief:'énoncé en html',
 sig:'void ft_deux(char a, char b);',      // signature imposée, affichée à part
 start:'void\tft_deux(char a, char b)\n{\n\t\n}\n',   // squelette
 tests:[{label:'ce qui est testé',
         harness:'int main(void){ ft_deux(\'O\',\'K\'); return 0; }',
         expect:'OK'}],
 hints:[...], post:'…'}
```
Le code de l'étudiant et le harness sont concaténés puis interprétés, point d'entrée `main`.

**Widgets** (ne comptent pas comme tâches) :
`{k:'bits'}` calculateur de permissions, `{k:'inode'}` schéma lien dur / lien symbolique
(pages shell), `{k:'ascii'}` curseur caractère ↔ code, `{k:'mem'}` schéma variable /
pointeur / pointeur de pointeur (pages C).

**`viva`** — `{k:'viva'}` déroule le tableau `VIVA`. Une seule par module, dans la salle `boss`.

---

## 7. Le simulateur shell

Système de fichiers en mémoire, avec **vrais inodes**. Un lien dur, c'est **le même objet
JavaScript** référencé deux fois : le compteur de liens et la propagation d'un `chmod`
tombent donc juste naturellement.

Nœuds : `fDir(mode)`, `fFile(contenu, mode)`, `fLink(cible)`.
Taille d'un lien symbolique = longueur de la chaîne cible (c'est le point pédagogique).

**Commandes** : `ls` (`-l -a -t -m -p -F -i`), `cd`, `pwd`, `cat` (`-e`, lit stdin),
`echo`, `touch` (`-t`, `-h`), `mkdir` (`-p`), `rm` (`-rf`), `rmdir`, `chmod` (octal),
`ln` (`-s`), `wc` (`-l -w -c`), `find`, `man`, `clear`, `help`,
`export`, `unset`, `env`, `tr` (`-d`, intervalles, échappements), `cut` (`-d -f`),
`grep` (`-v -i -c`), `head`/`tail` (`-n`), `sort` (`-r`), `uniq`, `rev`, `id` (`-G -n`).

Aussi : **pipes** `|`, redirections `>` et `>>`, expansion `$VAR`,
guillemets simples (littéral) contre doubles (expansion), `\(` `\)` échappés pour `find`.

`find` a un vrai mini-parseur : `-type f|d|l`, `-name MOTIF`, `-o`, groupes parenthésés,
`-print`, `-delete`, avec ET implicite court-circuité. C'est ce qui permet la mission
de ménage.

**Pour ajouter une commande** : un `case` dans `exec()`. Utilise les helpers déjà
présents dans la fonction : `inText(files)` (fichiers ou stdin), `splitLines`, `joinLines`, `O(texte)`.
Ajoute aussi une entrée dans la page `man` correspondante — les missions demandent
explicitement de chercher dans le manuel.

---

## 8. L'interpréteur C

Lexer → parseur récursif descendant → évaluateur, dans une mémoire plate `Int32Array`.
Les adresses sont des indices dans ce tableau, ce qui rend les pointeurs de pointeurs
naturels à n'importe quelle profondeur.

**Supporté** : `int`, `char`, `void`, pointeurs à profondeur quelconque, tableaux
(`int t[3]={1,2,3}`, un tableau vaut l'adresse de sa première case), chaînes littérales
terminées par zéro, fonctions et prototypes, `if/else`, `while`, `for` (déclaration
interne comprise), `return`, `break`, `continue`, opérateurs arithmétiques, de comparaison,
logiques court-circuités, ternaire, `++`/`--` préfixes et suffixes, `+=` et compagnie,
`&` et `*`, indexation, commentaires, casts (ignorés).

**Fonctions disponibles** : `write(fd, ptr, len)` — la seule autorisée à l'étudiant.
Pour les harnesses de test uniquement : `__putnbr(n)`, `__putstr(ptr)`, `__putchar(c)`.

**Garde-fous** : division et modulo par zéro, écriture via pointeur nul, index négatif,
fonction inconnue, mauvais nombre d'arguments, mémoire épuisée, et une limite de
3 000 000 d'opérations qui coupe les boucles infinies au lieu de figer le téléphone.

**Portée lexicale** : une fonction ne voit que sa propre portée et les globales.
Ça n'a pas toujours été le cas : la pile de portées était unique, donc une fonction lisait
les locales de son appelant, et un paramètre oublié passait sans bruit alors que `cc` le
refuse. Corrigé, et couvert par cinq cas dans `tests/test_c_engine.js`. Un code qui marche
dans le lab et casse à la compilation est pire qu'une fonctionnalité absente : c'est la
confiance dans l'outil qui se perd.

**Limites à connaître et à dire honnêtement à l'étudiant** :
- `int` et `char` occupent la même case : pas de débordement à 8 bits, donc les
  questions sur le dépassement de `char` ne sont pas simulables
- pas de `struct`, pas d'allocation dynamique, pas de bibliothèque standard
- pas de vérification de type : `int *p = 5;` passe
- l'arithmétique de pointeur avance d'une **case**, pas de `sizeof` octets
- **ce n'est pas un compilateur** : il ne remplace ni `cc -Wall -Wextra -Werror`
  ni la norminette. Le dire dans l'interface, c'est déjà fait dans le pied de page.

---

## 9. Les tests

```sh
sh tests/run_all.sh        # depuis la racine du dépôt
```

`extract.js` relit les **pages livrées** et en extrait les moteurs et les salles.
Les tests ne peuvent donc pas tester une copie périmée : ils testent ce qui est en ligne.

**Règle des trois tests, à respecter pour toute nouvelle mission :**

1. la **solution de référence** passe tous les cas
2. le **squelette de départ** (ou l'absence d'action) ne passe pas
3. l'**erreur classique** est attrapée par au moins un cas

Le point 3 est celui qui donne sa valeur au lab. Exemples en place :
`<` au lieu de `<=`, `-F` au lieu de `-p`, `%h` au lieu de `%H`, zéro non traité dans
un test de signe, boucle intérieure partant de 0, oubli de la variable temporaire dans
un échange, oubli de l'étoile dans `*p = v`, `ls | wc -l` au lieu de `find | wc -l`,
guillemets doubles au lieu de simples, longueur codée en dur au lieu du zéro final.

Quand tu ajoutes une mission, ajoute sa solution de référence et son erreur classique
dans la suite correspondante (`SOL` et `BAD` / `WRONG`).

Le script vérifie aussi la syntaxe JavaScript de chaque page et l'absence de données
personnelles. **Il doit passer intégralement avant chaque commit.**

`run_all.sh` **renvoie un code de sortie non nul dès qu'un test échoue.** Ça n'a l'air de
rien, mais ce n'était pas le cas : il écrivait `node "$f" | tail -4`, or dans un tube le
code de sortie est celui de `tail`, qui réussit toujours. `set -e` ne voyait donc jamais
rien passer, et la protection principale du dépôt ne protégeait de rien. La sortie est
maintenant capturée dans une variable, ce qui préserve le code de sortie. Si tu ajoutes
une étape, ne la fais pas transiter par un tube sans vérifier son code.

### `verify_docs.js` : l'audit de cohérence

Lancé automatiquement par `run_all.sh`. Il vérifie que **la documentation ne ment pas** :

- chaque fichier cité dans les trois documents existe réellement
- la salle d'auto-évaluation déduit son identifiant de la dernière salle du module, et
  n'écrit aucun identifiant en dur (voir §14)
- les nombres annoncés (salles, leçons, missions, QCM, saisies, cas de test)
  correspondent au contenu réel des pages
- le compteur affiché dans l'en-tête d'un module égale son nombre de salles
- les quatre clés de stockage sont distinctes, lues par le hub, et documentées
- invariants de contenu : identifiants de salle uniques, une seule salle `boss` et
  en dernière position, tout QCM a un `why` et un index valide, toute question à
  saisie accepte sa propre réponse, toute mission a au moins deux indices,
  toute mission C a une signature et des cas de test
- le contrôle de confidentialité existe, est lancé, et couvre tout le dépôt
- aucune dépendance externe dans les pages (le site doit rester autonome et hors ligne)
- le hub pointe vers les quatre modules, et chaque module a un lien de retour

**Si tu changes une structure, la doc doit suivre, sinon cet audit échoue.** C'est
volontaire : trois documents qui divergent du code sont pires que pas de documentation.

État actuel : **627 assertions de test + 139 contrôles d'audit**, tous verts.
Ces deux chiffres sont vérifiés par la machine : `verify_docs.js` compare le nombre de
contrôles annoncé au nombre réel, et `run_all.sh` fait la même chose pour les assertions.
La version précédente annonçait 116 contrôles pour 117 réels, sans que rien ne le voie.

---

## 10. Ajouter un module

1. Copier la page la plus proche (`shell01.html` pour du shell, `c01.html` pour du C).
2. Remplacer le bloc `const ROOMS=[…]` et `const VIVA=[…]`.
3. Changer `const KEY=` pour une clé neuve.
4. Changer le `<title>`, le `<h1>`, le chemin affiché dans l'en-tête, le compteur `0/N`.
5. Ajouter une carte dans `index.html` et un appel `paint('<clé>', N, ['mX','bX','sX'])`.
6. Ajouter une suite de tests, ou étendre la suite existante avec les nouvelles salles.
7. `sh tests/run_all.sh`, puis commit.

Conserver le rythme d'une salle : **leçon courte → manipulation → question de concept**.
Cinq à huit salles par module, jamais plus : au-delà l'étudiant ne finit pas.

---

## 11. Design

Palette ardoise bleutée, accent rouge. Tout en `ui-monospace`. Le thème est dans
`src/theme.css`, écrit une fois. Ne pas réintroduire de texture de fond : la version
d'avant avait des rayures de scanline, jugées fatigantes.

**Trois poids visuels, pas un de plus.** C'est la règle qui tient tout le reste :

1. une **notion** est du texte : aucun cadre, aucune étiquette ;
2. ce qui **demande une action** porte un filet vertical à gauche, dont la couleur dit
   l'état (neutre, vert, rouge) ;
3. la **mission** est le seul élément accentué de la salle.

Une version précédente coiffait chaque bloc d'une étiquette en capitales suivie d'un
filet horizontal traversant la carte : `QUESTION ————————`. Répétée huit fois par
salle, elle n'apportait aucune information et fabriquait l'essentiel du bruit. Les
pastilles qui subsistent (`MISSION`, `À VOIX HAUTE`, `DEVINE AVANT DE SAVOIR`,
`TROUVE L'ERREUR`) ne restent que là où elles changent ce qu'on attend du lecteur.
**Ne pas réintroduire d'étiquette décorative.**

**Pas d'emoji en guise d'icône.** Un emoji est rendu par la police du système : son
dessin change d'un appareil à l'autre et son alignement est imprévisible. Le cadenas
des salles verrouillées est un SVG tracé à la main.

La progression du menu est une sortie de `ls -l` dont les bits de permission s'allument
au fur et à mesure : le clin d'œil est aussi un rappel du cours.

Le téléphone est la cible principale. Les mesures sont faites sur un cadre de 375 px
réels, pas estimées : aucun débordement horizontal, aucune zone tactile sous 44 px,
contrastes au-dessus de 4,5 pour tout texte.

---

## 12. Déploiement

GitHub Pages, dépôt public, branche `main`, dossier racine.
Un push suffit, le déploiement prend une minute. `index.html` doit rester à la racine.

Depuis un poste où git est configuré :
```sh
git add -A
git commit -m "message"
git push
```

---

## 13. Les sujets 42 (documents de référence)

L'étudiant joindra les PDF à la nouvelle session. Résumé de ce qu'ils contiennent,
pour que tu saches ce qu'il ne faut **pas** résoudre :

**Shell 00** — création de fichier et redirection ; permissions et octal ; liens durs et
symboliques ; clés SSH ed25519 ; `ls` avec tri par date, séparation par virgules et slash
sur les dossiers ; les cinq derniers identifiants de commits ; fichiers ignorés par git ;
reconstruction d'un fichier depuis un diff ; `find` qui affiche et supprime sans chaînage ;
fichier magic.

**Shell 01** — groupes d'un utilisateur depuis une variable d'environnement ; recherche
récursive de `.sh` sans l'extension ; comptage récursif ; adresses MAC ; création d'un
fichier au nom truffé de caractères spéciaux ; une ligne sur deux de `ls -l` ; chaîne de
sept transformations sur `/etc/passwd` ; addition dans des bases inventées.

**C 00** — `ft_putchar`, alphabet à l'endroit et à l'envers, chiffres, signe d'un entier,
combinaisons de trois chiffres distincts, combinaisons de deux nombres à deux chiffres,
affichage d'un entier quelconque, combinaisons de n chiffres.

**C 01** — mettre 42 dans un `int` via pointeur, la même chose à neuf niveaux de pointeurs,
échange de deux entiers, division et modulo en paramètres de sortie, la même chose en
écrasant les entrées, affichage d'une chaîne, longueur d'une chaîne, inversion d'un tableau,
tri d'un tableau.

Les sujets imposent aussi : aucun fichier en trop dans les dossiers de rendu, la norminette
pour le C, compilation avec `-Wall -Wextra -Werror`, et un exercice difficile n'est pas
compté si un exercice plus simple ne fonctionne pas parfaitement.

---

## 14. Pièges rencontrés, à ne pas refaire

- **Une déclaration locale ne doit pas ouvrir un scope** dans l'interpréteur C, sinon
  la variable disparaît à la ligne suivante. D'où le nœud `decls` distinct de `block`.
- **`tr` doit interpréter `\n` et `\t`** dans ses ensembles, sinon les missions de
  remplacement de séparateur donnent un résultat faux.
- **Un tiret seul est un opérande, pas une option** : `tr -d "-"` cassait.
- **Le contrôle d'une mission qui fait `cd`** doit résoudre le chemin depuis la racine
  (`lookup(sh,'/archives')`), sinon il cherche depuis le nouveau dossier courant.
- **Les pages shell intercalent `newShellFrom` entre `ROOMS` et `VIVA`** : l'extracteur
  de tests doit s'arrêter avant, sinon double déclaration.
- **Une redirection `>` est mise en place avant l'exécution** : une commande qui échoue
  vide quand même le fichier cible. Vrai dans le vrai shell, reproduit ici, et c'est
  arrivé pour de vrai à l'étudiant (il a vidé un fichier de ressources du sujet).
- **Un identifiant de salle écrit en dur dans la couche de rendu finit par mentir.**
  `vivaBlock()` écrivait `S.rooms['r10']` sur les quatre pages, alors que cet identifiant
  n'existe que dans shell00. Sur Shell 01, C 00 et C 01, la salle finale ne se validait
  donc jamais, le hub comptait une salle fantôme et annonçait `chmod 777` pendant que la
  page du module affichait 7/8. Cinq cent quarante lignes recopiées quatre fois, dont une
  seule devait changer : c'est le mode de défaillance normal de cette duplication, pas de
  la malchance. Tout ce qui dépend du module se déduit maintenant de `ROOMS`.
- **Un tube masque le code de sortie.** `node "$f" | tail -4` renvoie celui de `tail`.
  `run_all.sh` renvoyait donc 0 même avec un test en échec, pendant des mois.
- **Le contrôle de confidentialité contenait lui-même les identifiants qu'il interdisait**,
  et n'inspectait pas `tests/`. Voir §3.2 pour le mécanisme qui remplace ça.

---

## 15. Historique

- Shell 00 : dix salles, simulateur de système de fichiers avec inodes.
- Shell 01 : moteur étendu aux pipes, aux variables d'environnement et aux filtres de texte ;
  huit salles.
- C 00 et C 01 : interpréteur C écrit de zéro ; six salles chacun, missions exécutées
  réellement contre des batteries de tests.
- Hub, sauvegarde manuelle par code, révision espacée, suite de 298 tests.

Ce qui reste ouvert : les modules suivants de la Piscine, et une éventuelle salle sur
la norminette et les avertissements du compilateur, qui demanderait un vérificateur
séparé (l'interpréteur ne les couvre pas).

---

## 16. Exemple complet : ajouter une salle de bout en bout

Cas concret, à copier. On ajoute une salle shell sur `uniq` et les doublons.

### a. Écrire la salle

Dans `shell01.html`, insérer dans `const ROOMS=[…]` **avant** la salle `boss` :

```js
{
id:'s8', file:'doublons', tag:'concept', title:'Éliminer les doublons',
sub:'uniq ne voit que les répétitions consécutives.',
steps:[
 {k:'lesson',h:'Le piège de uniq',b:`
  <p><code>uniq</code> supprime les lignes identiques <b>qui se suivent</b>. Deux lignes
  identiques séparées par une autre ne sont pas détectées.</p>
  <p>D'où le motif habituel : trier d'abord, pour rassembler les identiques,
  puis dédoublonner.</p>`},
 {k:'term',h:'Mission : la liste unique',
  goal:'chaque prénom une seule fois, trié',
  brief:"Le fichier <code>presents.txt</code> contient des prénoms en désordre, certains "+
        "en double. Affiche chaque prénom une seule fois, par ordre alphabétique.",
  setup:sh=>{ sh.root.children['presents.txt']=fFile('zoe\nadrien\nzoe\nmarine\nadrien\n'); },
  check:(sh,hist)=>{
    const last=[...hist].reverse().find(h=>h.includes('|'));
    if(!last) return false;
    return run(newShellFrom(sh),last).out==='adrien\nmarine\nzoe\n';
  },
  hints:["uniq ne compare que des lignes voisines : il faut d'abord les rapprocher.",
         "Deux commandes reliées par un pipe.",
         "Trie, puis passe le résultat à uniq."]},
 {k:'mcq',h:'',q:"Pourquoi <code>uniq</code> seul ne suffit-il pas sur une liste en désordre ?",
  opts:["Il ne gère que les nombres",
        "Il ne compare que des lignes consécutives, donc il rate les doublons éloignés",
        "Il faut toujours une option","Il trie déjà tout seul"],a:1,
  why:"C'est une décision de conception : uniq lit en flux, sans tout garder en mémoire. D'où le tri préalable."}
]},
```

### b. Déclarer la solution et la fausse piste dans les tests

Dans `tests/test_rooms_shell01.js` :

```js
const SOL  = { …, 's8.1':['sort presents.txt | uniq'] };
const WRONG= { …, 's8.1':['uniq presents.txt'] };   // sans tri : rate les doublons éloignés
```

### c. Mettre à jour le compteur du module

Dans `shell01.html`, le compteur de l'en-tête : `0/8` devient `0/9`.
Dans `index.html`, l'appel `paint('shell01lab_v1', 8, …)` devient `9`.
Dans `INFORMATIONS-UTILES.md`, le tableau d'inventaire.

### d. Vérifier

```sh
sh tests/run_all.sh
```
Trois lignes doivent apparaître pour `s8.1` : la solution valide, la mission non
validée sans action, la fausse piste rejetée. Si la fausse piste passe, **le cas de
test est mal choisi** : c'est le signal que la mission ne teste rien d'utile.

---

## 17. Checklist avant chaque commit

- [ ] `sh tests/run_all.sh` passe intégralement, zéro échec
- [ ] toute nouvelle mission a sa solution de référence **et** son erreur classique dans les tests
- [ ] aucune mission ne reproduit un exercice du sujet (voir la table de correspondance
      dans `INFORMATIONS-UTILES.md` §5)
- [ ] le dernier indice n'est pas la réponse copiable
- [ ] chaque QCM a un champ `why` qui explique, y compris en cas de bonne réponse
- [ ] pour une question à saisie : `accept(a[0])` est vrai
- [ ] compteurs de salles cohérents entre la page module et `index.html`
- [ ] clé de stockage inchangée, ou migration prévue
- [ ] aucune donnée personnelle (le script le vérifie, mais relire quand même)
- [ ] rendu correct sous 380 px de large
- [ ] les trois documents restent d'accord entre eux si tu as changé une structure

---

## 18. Ce qu'il ne faut pas faire

À lire une fois, ça évite de refaire des erreurs déjà commises.

**Ne pas transformer le lab en corrigé.** C'est la seule façon de rendre le projet
nuisible : l'étudiant rendrait des exercices qu'il ne saurait pas défendre, et
échouerait en soutenance avec un faux sentiment de sécurité.

**Ne pas introduire de dépendance ni d'étape de build.** Le site doit s'ouvrir depuis
un téléphone, en local, hors ligne. Pas de npm, pas de bundler, pas de CDN.

**Ne pas mutualiser le code entre les pages.** C'est tentant, et ça casse l'autonomie
de chaque fichier. La duplication est un choix, pas un oubli.

**Ne pas écrire un cas de test qui ne sépare rien.** Vérifier une commande de listage
dans un dossier d'un seul fichier donne le même résultat quelles que soient les options :
ce test ne prouve rien. Chaque cas doit distinguer le juste du faux.

**Ne pas laisser croire que l'interpréteur C est un compilateur.** Il ne vérifie ni les
types, ni les avertissements, ni la norminette. Le pied de page le dit ; ne pas l'enlever.

**Ne pas toucher au format du code de sauvegarde** sans migration : l'étudiant conserve
ses codes en dehors de l'application.

**Ne pas supposer d'acquis.** L'utilisateur est débutant. Une explication qui saute une
étape est une explication perdue.

---

## 19. Pistes pour la suite

Par ordre d'utilité estimée, à valider avec l'étudiant plutôt qu'à décider seul :

1. **Les modules suivants de la Piscine** (C 02 et au-delà), même méthode : il apporte
   le sujet et surtout **ce qui l'a réellement bloqué**, ce qui rend les salles beaucoup
   plus utiles que si on part du seul PDF.
2. **Une salle sur la lecture des erreurs du compilateur.** Point faible classique en
   Piscine, et l'interpréteur produit déjà des messages exploitables.
3. **Un mode révision par module**, aujourd'hui la révision mélange tout — ce qui est
   volontaire, mais un mode ciblé avant une soutenance précise se défend.
4. **Un vérificateur de norme** en complément de l'interpréteur : indentation, longueur
   des fonctions, déclarations en tête. Chantier plus lourd, à évaluer.
5. **Export du code de sauvegarde en lien partageable**, pour que les camarades puissent
   utiliser le lab sans repartir de zéro.

Ce qui a été volontairement écarté : un compte en ligne (complexité et données
personnelles), un classement entre camarades (contraire à l'esprit du peer-learning),
et toute forme de correction automatique des rendus réels.
