# CONTEXT — d'où vient ce projet et pourquoi il est fait comme ça

Ce fichier raconte le **contexte**. Il ne décrit pas le code (voir `HANDOFF.md`)
ni les références techniques (voir `INFORMATIONS-UTILES.md`).
Il existe pour qu'une session qui reprend le projet comprenne **les décisions**,
et surtout pourquoi certaines choses qui semblent inutilement compliquées le sont exprès.

---

## 1. Qui est l'utilisateur

Un étudiant en cours de **Piscine C à 42 Lausanne**, la sélection d'entrée de l'école :
quatre semaines intensives, des projets quotidiens, un examen chaque vendredi.

Éléments à garder en tête pour toute décision :

- **Débutant complet.** Au premier jour du projet Shell 00, il ne savait pas ce que
  faisait `cat`, ni lire une ligne de `ls -l`. Il a appris très vite, mais il ne faut
  jamais supposer un acquis non vérifié.
- Il travaille sur les **iMac Intel du cluster sous Ubuntu 22.04**, **sans droits root**.
- Il consulte le lab **depuis son téléphone** (iPhone, navigateur Brave, parfois Safari),
  entre deux exercices ou dans les transports. Le poste de l'école ne peut pas
  ouvrir d'IA, d'où le passage par le téléphone.
- Il travaille avec des camarades, et il **corrige leurs rendus** en soutenance :
  le lab lui sert aussi à savoir quoi vérifier chez les autres.

## 2. Le cadre imposé par l'école, et ce qu'il change

Chaque sujet de la Piscine contient un chapitre entier sur l'IA. En substance :

- l'objectif de la phase est de **construire des fondations sans raccourcis** ;
- il ne faut **pas demander les réponses à une IA** ;
- **aux examens, aucune IA n'est disponible** : ni internet, ni téléphone ;
- l'évaluation passe d'abord par le **peer-learning** et par une **soutenance orale**
  où un camarade demande d'expliquer chaque rendu.

Ce n'est pas un détail de politesse. C'est la contrainte qui **détermine toute
l'architecture pédagogique du lab** :

> Un exercice rendu mais non expliqué vaut **zéro**.
> Donc le lab ne doit pas produire des rendus, il doit produire de la compréhension.

D'où la règle qui structure tout le contenu : **aucune mission du lab ne résout
un exercice du sujet**. On enseigne le mécanisme avec d'autres valeurs, d'autres noms,
d'autres cas limites. Si tu ajoutes du contenu et que tu es tenté de reprendre l'énoncé
du sujet tel quel, c'est le signal que tu es en train de casser le projet.

Autre contrainte structurante du même chapitre : **le lab doit être utilisable
sans internet et sans IA**, puisque c'est la situation de l'examen. D'où le choix
d'un site statique autonome, avec `man` intégré au simulateur pour que l'étudiant
s'entraîne à chercher dans le manuel plutôt qu'à demander.

## 3. Comment le projet est né

Il n'a pas été conçu d'un bloc. Il s'est construit dans cet ordre, et ça explique
certaines formes du code :

1. **Session de tutorat sur Shell 00.** Explications à la demande, sans donner les
   réponses au début. L'étudiant a réellement compris les premiers exercices,
   et beaucoup moins bien les derniers, où il a demandé les commandes directement.
   C'est ce déséquilibre qui a motivé le lab.
2. **Un script de vérification** (`check_shell00.sh`, hors de ce dépôt) pour contrôler
   un rendu avant de le pousser. Première apparition de l'idée « vérifier plutôt qu'affirmer ».
3. **Un premier site de quiz**, purement QCM. Insuffisant : on peut réussir un QCM
   sans savoir taper une commande.
4. **Le lab Shell 00 avec simulateur**, pour que l'étudiant tape de vraies commandes.
5. **Refonte du thème et de tout le contenu** : la première version reprenait les
   valeurs exactes du sujet, ce qui entraînait la mémoire et pas la compréhension.
   Corrigé sur demande explicite de l'étudiant, et c'est devenu la règle du projet.
6. **Mise en ligne sur GitHub Pages**, parce que le stockage local ne survivait pas
   d'un appareil à l'autre.
7. **Shell 01** : le moteur a dû apprendre les pipes, les variables d'environnement
   et les filtres de texte.
8. **C 00 et C 01** : il a fallu écrire un interpréteur C, puisqu'un simulateur de shell
   ne sert à rien pour du C.

## 4. Les décisions structurantes, et leur raison

**Un fichier HTML autonome par module, aucun build, aucune dépendance.**
Parce que le site doit s'ouvrir depuis un téléphone, en local si besoin, sans serveur
ni outillage. Le coût est réel : une correction de moteur doit être reportée dans
chaque page concernée. C'est un compromis assumé.

**Un simulateur plutôt qu'un tutoriel.** On ne retient pas une commande en la lisant.
Le simulateur exécute vraiment : un lien dur est réellement le même objet en mémoire,
donc le compteur de liens et la propagation d'un `chmod` tombent juste sans être codés
en dur. C'est ce qui rend la démonstration convaincante.

**Un interpréteur C plutôt qu'un QCM sur le C.** Même raison. L'étudiant écrit une
fonction, elle est exécutée contre une batterie de cas, il voit attendu et obtenu.

**Des tests qui visent l'erreur, pas la réussite.** C'est le point qui donne sa valeur
au lab, et le plus facile à perdre de vue. Un cas de test qui vérifie seulement le
comportement nominal ne sert presque à rien. Ceux qui comptent sont ceux qui attrapent
la faute qu'on va commettre : la borne `<` au lieu de `<=`, le zéro non traité,
l'oubli de la variable temporaire, la boucle intérieure qui part de zéro.

**Des indices payants et progressifs.** Trois indices par mission, du vague au précis,
à 3 xp pièce. Le dernier ne doit jamais être la réponse copiable. Objectif : rendre
l'aide disponible mais légèrement coûteuse, pour qu'on essaie d'abord.

**Une salle finale d'auto-évaluation orale par module.** C'est la répétition générale
de la soutenance. C'est aussi le seul endroit où l'on reprend les vraies valeurs du
sujet, puisque c'est exactement ce qu'un correcteur ouvrira.

**Le thème sombre ardoise et rouge**, inspiré de TryHackMe. Une version précédente
avait une texture de rayures en fond : retirée, jugée fatigante à l'usage.

## 5. Ce que j'ai fait et qui s'est révélé faux

À conserver, pour ne pas refaire les mêmes erreurs.

- **Prédire un résultat au lieu de le vérifier.** J'ai annoncé qu'après un `reset --soft`
  la commande `git ls-files` n'afficherait plus rien. Faux : elle lit l'index local,
  qui contenait justement les fichiers préparés. La manipulation était bonne, ma
  prédiction était fausse. **Vérifier, puis parler.**
- **Affirmer sans savoir.** J'ai affirmé que VS Code ne serait pas disponible à
  l'examen. L'étudiant a demandé sur place : il l'est. Sur tout ce qui relève de
  l'organisation locale de l'école, dire qu'on ne sait pas et renvoyer vers les
  humains sur place.
- **Compliquer une vérification simple.** Pour contrôler un rendu, j'ai proposé de
  fabriquer un dossier temporaire là où lire le fichier suffisait. Un camarade de
  l'étudiant avait la méthode plus directe. Chercher d'abord la vérification la plus
  simple qui distingue vraiment le juste du faux.
- **Faire un test dans un décor qui ne prouve rien.** Vérifier une commande de listage
  dans un dossier contenant un seul fichier donne le même résultat quelles que soient
  les options. Un test doit être construit pour **séparer** les cas.

## 6. La ligne à tenir sur l'aide

L'étudiant a demandé plusieurs fois les réponses directes, sous pression de temps.
La position tenue, et à tenir :

- **Expliquer les mécanismes, oui, autant qu'il veut.**
- **Donner une commande toute faite quand il insiste, en disant clairement le coût** :
  un exercice non compris ne passera pas la soutenance et ne servira pas à l'examen.
- **Ne pas optimiser pour l'indétectabilité.** Il a demandé si son rendu pouvait être
  identifié comme assisté. Réponse donnée : les fichiers sont des commandes d'une ligne
  sans rien de stylistique, mais ce n'est pas un objectif que je poursuis, et le vrai
  contrôle est la soutenance, où aucune discrétion ne sauve.
- **Renvoyer vers les humains.** Le sujet répète de demander au voisin. C'est souvent
  le meilleur conseil, et c'est parfois plus fiable que moi sur les usages locaux.

Ce lab est la traduction de cette position en outil : il aide beaucoup, et il n'aide
jamais à contourner la compréhension.

## 7. L'état au moment de la passation

- Shell 00 : les neuf exercices étaient faits et fonctionnels, vérifiés un par un.
- L'étudiant avait choisi de **committer en local sans pousser**, tant qu'il ne savait
  pas expliquer, avec l'intention de pousser avant l'échéance. Si le sujet revient :
  lui rappeler que le dépôt distant est le seul rendu qui existe, et qu'un travail
  non poussé à l'échéance vaut zéro.
- Shell 01, C 00 et C 01 : sujets récupérés, modules du lab construits, exercices
  pas encore faits par lui.
- Le lab est en ligne sur GitHub Pages, dépôt public séparé du rendu.

## 8. Le ton attendu

L'étudiant a demandé explicitement : pas de flatterie, du direct, un vrai avis même
quand il ne fait pas plaisir, et de la contradiction quand il se trompe.
Il l'a confirmé en pratique en corrigeant lui-même deux de mes erreurs.

Concrètement, dans ce projet : quand une demande est mauvaise pour son apprentissage,
le dire, proposer mieux, et faire quand même ce qu'il décide s'il maintient — en ayant
dit le coût une fois, clairement, sans y revenir dix fois.
