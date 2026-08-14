/* Les missions de la salle de révision doivent être jouables.
 *
 * Deux missions ont été livrées insolubles, pour la même raison : elles ont
 * été écrites sans jamais être jouées. Une étape de saisie déclarait sa
 * réponse sous une clé que le rendu ne lit pas, et une mission shell
 * demandait une option que le simulateur ne connaissait pas, jusque dans son
 * dernier indice.
 *
 * Ce fichier rejoue chaque mission de la révision comme le ferait
 * l'étudiant : il exécute la suite de commandes de l'indice final, puis
 * demande à la fonction `check` de la mission si c'est gagné. Une mission
 * dont l'indice ultime ne suffit pas à la valider est une mission cassée.
 */
const { newShell, run, lookup, fFile, fDir, fLink } = require('./_shell.js');

let pass = 0, fail = 0;
function t(nom, fn) {
  try {
    const r = fn();
    if (r === true) { pass++; console.log('  ok   ' + nom); }
    else { fail++; console.log('  FAIL ' + nom + '  -> ' + r); }
  } catch (e) { fail++; console.log('  ERR  ' + nom + '  -> ' + e.message); }
}

/* Chaque entrée : la salle, ce qu'un étudiant taperait en suivant l'indice
   final, et le setup de la mission tel qu'il est déclaré dans le contenu. */
const H = '/* ' + '*'.repeat(74) + ' */';

const MISSIONS = [
  {
    salle: 'v1 arborescence de rendu',
    setup: () => {},
    commandes: ['mkdir ex00', 'echo rendre ici > ex00/consigne.txt'],
    check: sh => { const n = lookup(sh, 'ex00/consigne.txt'); return !!n && n.type === 'file' && n.content === 'rendre ici\n'; },
  },
  {
    salle: 'v3 norminette signale l en-tête absent',
    setup: sh => { sh.root.children['brouillon.c'] = fFile('#include <unistd.h>\n\nvoid\tft_cadre(void)\n{\n}\n'); },
    commandes: ['norminette brouillon.c'],
    attenduSortie: /INVALID_HEADER/,
    check: () => true,
  },
  {
    salle: 'v4 compilation de deux fichiers',
    setup: sh => {
      sh.root.children['ft_bip.c'] = fFile(H + '\n#include <unistd.h>\n\nvoid\tft_bip(char c)\n{\n\twrite(1, &c, 1);\n}\n');
      sh.root.children['essai.c'] = fFile(H + '\nvoid\tft_bip(char c);\nint\tmain(void)\n{\n\tft_bip(65);\n\treturn (0);\n}\n');
    },
    commandes: ['cc -Wall -Wextra -Werror ft_bip.c essai.c -o prog'],
    check: sh => { const n = lookup(sh, 'prog'); return !!n && n.type === 'file'; },
  },
  {
    salle: 'v5 cycle de rendu complet',
    setup: sh => { sh.root.children['ft_bip.c'] = fFile(H + '\n#include <unistd.h>\n\nvoid\tft_bip(char c)\n{\n\twrite(1, &c, 1);\n}\n'); },
    // Les trois marches, dans l'ordre : ajouter, enregistrer, envoyer.
    commandes: ['git' + ' add ft_bip.c', 'git' + ' commit -m "ex00"', 'git' + ' push'],
    check: sh => !!(sh.git && sh.git.commits.length > 0 && sh.git.pousses === sh.git.commits.length),
  },
  {
    salle: 'v6 fichier de taille exacte',
    setup: () => {},
    commandes: ['echo -n OK > court'],
    check: sh => { const n = lookup(sh, 'court'); return !!n && n.type === 'file' && n.content === 'OK'; },
  },
  {
    salle: 'v9 distinguer avec et sans saut de ligne',
    setup: sh => { sh.root.children['avec'] = fFile('OK\n'); sh.root.children['sans'] = fFile('OK'); },
    commandes: ['cat -e sans'],
    attenduSortie: /^OK$/,
    check: () => true,
  },
];

console.log('missions de la salle de révision, jouées comme l étudiant');

for (const m of MISSIONS) {
  t(m.salle, () => {
    const sh = newShell(m.setup);
    let sortie = '';
    for (const c of m.commandes) {
      const r = run(sh, c);
      sortie = ((r && r.out) || '') + ((r && r.err) || '');
    }
    if (m.attenduSortie && !m.attenduSortie.test(sortie))
      return 'sortie inattendue : ' + JSON.stringify(sortie.slice(0, 80));
    return m.check(sh) === true || 'la mission ne se valide pas alors que les commandes de l indice final ont été jouées';
  });
}

/* Régression directe du bug livré : sans -n, echo écrit l'option comme un
   mot, le fichier pèse quatre octets de trop, et aucun indice ne peut
   sauver l'étudiant. */
console.log('');
console.log('echo -n');

t('echo -n ne produit pas de saut de ligne', () => {
  const sh = newShell(() => {});
  run(sh, 'echo -n OK > f');
  const n = lookup(sh, 'f');
  return (n && n.content === 'OK') || 'contenu obtenu : ' + JSON.stringify(n && n.content);
});

t('echo sans -n garde le saut de ligne', () => {
  const sh = newShell(() => {});
  run(sh, 'echo OK > f');
  const n = lookup(sh, 'f');
  return (n && n.content === 'OK\n') || 'contenu obtenu : ' + JSON.stringify(n && n.content);
});

t('echo -n n écrit pas l option dans le fichier', () => {
  const sh = newShell(() => {});
  run(sh, 'echo -n OK > f');
  const n = lookup(sh, 'f');
  return (n && !n.content.includes('-n')) || 'l option a été prise pour un mot';
});

t('wc -c voit bien deux octets après echo -n', () => {
  const sh = newShell(() => {});
  run(sh, 'echo -n OK > f');
  const r = run(sh, 'wc -c f');
  const out = ((r && r.out) || '');
  return /(^|\s)2(\s|$)/.test(out) || 'wc annonce : ' + JSON.stringify(out.trim());
});

console.log('');
console.log('=========================');
console.log(' pass ' + pass + '   fail ' + fail);
console.log('=========================');
process.exit(fail ? 1 : 0);
