/* RÈGLE 1 : aucune mission ne reproduit un exercice du sujet.

   Jusqu'ici cette règle ne reposait que sur la vigilance humaine, et elle a
   raté deux choses : la mission midLS produisait exactement le rendu de
   l'ex04, et tests/test_c_engine.js contenait les neuf exercices de C 01.

   Le périmètre est défini par le RÔLE du contenu, pas par une liste de
   fichiers écrite à la main, parce qu'une telle liste finit toujours par
   oublier un endroit :

   - `ROOMS` (le contenu montré à l'étudiant) et le dossier `tests/` ne
     doivent nommer aucun exercice du sujet, ni contenir sa réponse ;
   - `VIVA` et les trois documents en parlent au contraire ouvertement, et
     c'est voulu : la soutenance blanche porte sur le vrai rendu, et la table
     de correspondance doit nommer ce qu'elle transpose. Ils sont hors
     périmètre par construction, puisque ce test ne lit que ROOMS et tests/. */
const fs = require('fs'), path = require('path');
process.chdir(path.join(__dirname, '..'));

/* Relevé fait à la main dans les quatre PDF officiels. Cette liste ne se
   réduit jamais. Les noms trop courants pour être distinctifs (« z »,
   « clean », « b ») en sont écartés : ils produiraient du bruit sans rien
   attraper d'utile. */
const EXERCICES = [
  // Shell 00
  'testShell00', 'midLS', 'git_commit.sh', 'git_ignore.sh', 'ft_magic', 'id_ed25519_pub',
  // Shell 01
  'print_groups.sh', 'find_sh.sh', 'count_files.sh', 'MAC.sh', 'skip.sh',
  'r_dwssap.sh', 'add_chelou.sh', 'FT_USER', 'FT_LINE1', 'FT_LINE2', 'FT_NBR1', 'FT_NBR2',
  // C 00
  'ft_putchar', 'ft_print_alphabet', 'ft_print_reverse_alphabet', 'ft_print_numbers',
  'ft_is_negative', 'ft_print_comb2', 'ft_print_combn', 'ft_print_comb', 'ft_putnbr',
  // C 01
  'ft_ultimate_div_mod', 'ft_ultimate_ft', 'ft_div_mod', 'ft_swap', 'ft_putstr',
  'ft_strlen', 'ft_rev_int_tab', 'ft_sort_int_tab', 'ft_ft',
];

/* Réponses attendues par le sujet, sous leur forme exacte. Une mission ne doit
   jamais faire produire ça, sinon l'étudiant tape son rendu au lieu
   d'apprendre le mécanisme. */
const REPONSES = [
  { nom: 'la commande du midLS (ex04 de Shell 00)', re: /ls\s+-[tmp]{3}(?![a-z])/ },
  { nom: 'les motifs du clean (ex08 de Shell 00)', re: /\*~|#\*#/ },
  { nom: 'la mise à 42 par pointeur (ex00 de C 01)', re: /\*\s*nbr\s*=\s*42/ },
];

let pass = 0, fail = 0;
const t = (nom, cond) => {
  if (cond === true) { pass++; console.log('  ok   ' + nom); }
  else { fail++; console.log('  FAIL ' + nom + ' -> ' + cond); }
};
const cherche = txt => {
  const trouves = EXERCICES.filter(e => new RegExp('(^|[^A-Za-z0-9_])' + e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z0-9_]|$)').test(txt));
  REPONSES.forEach(r => { if (r.re.test(txt)) trouves.push(r.nom); });
  return trouves;
};

console.log('\n--- le contenu montré à l\'étudiant ne nomme aucun exercice ---');
for (const [nom, mod] of [['Shell 00', '_rooms_shell00'], ['Shell 01', '_rooms_shell01'],
                          ['C 00', '_rooms_c00'], ['C 01', '_rooms_c01']]) {
  const { ROOMS } = require('./' + mod + '.js');
  ROOMS.forEach(r => r.steps.forEach((s, i) => {
    // On sérialise l'étape entière : énoncé, indices, options, signature,
    // harnesses, jusqu'au corps des fonctions de vérification.
    const txt = JSON.stringify(s, (k, v) => typeof v === 'function' ? v.toString() : v);
    t(nom + ' ' + r.id + '.' + i, cherche(txt).length === 0 || cherche(txt).join(', '));
  }));
}

console.log('\n--- le dossier tests/ ne contient aucune réponse d\'exercice ---');
for (const f of fs.readdirSync('tests').filter(f => /\.(js|sh)$/.test(f) && !/^_/.test(f) && f !== 'test_regle1.js')) {
  const trouves = cherche(fs.readFileSync('tests/' + f, 'utf8'));
  t('tests/' + f, trouves.length === 0 || trouves.join(', '));
}

console.log('\n--- le détecteur détecte encore ---');
// Même raisonnement que le canari du contrôle de confidentialité : une garde
// muette est pire qu'une garde absente, parce qu'on lui fait confiance.
t('repère un nom d\'exercice', cherche('void ' + 'ft_' + 'swap(int *a, int *b);').length > 0 || 'non repéré');
t('repère la commande du midLS', cherche('ls ' + '-tmp').length > 0 || 'non repérée');
t('repère les motifs du clean', cherche('-name "*' + '~"').length > 0 || 'non repérés');
t('ne se déclenche pas sur du contenu transposé', cherche('void ft_deux(char a, char b); ls -atmp').length === 0 || 'faux positif');
t('la liste d\'exercices est non vide', EXERCICES.length > 20 || EXERCICES.length);

console.log('\n=========================');
console.log(' pass ' + pass + '   fail ' + fail);
console.log('=========================');
process.exit(fail ? 1 : 0);
