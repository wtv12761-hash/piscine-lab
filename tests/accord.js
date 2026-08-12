/* L'application valide une mission sur son descripteur `verif`, qui est aussi
   ce qu'affiche le panneau « attendu contre obtenu ». Les tests, eux, valident
   sur `check`. Si les deux divergeaient, le panneau pourrait annoncer une
   réussite que la salle refuse, ou l'inverse, sans que rien ne le signale.

   Ce module rejoue la logique du panneau exactement comme src/app.js la
   calcule, pour pouvoir comparer les deux verdicts sur chaque scénario déjà
   écrit dans les suites de missions. */

function panneauOk(E, st, sh, hist){
  const v = st.verif;
  if(!v) return null;                       // mission sans descripteur
  if(v.type === 'permissions'){
    const n = E.lookup(sh, v.cible);
    return !!n && n.mode === v.mode;
  }
  if(v.type === 'contenu'){
    const n = E.lookup(sh, v.fichier);
    return (n && n.type === 'file' ? n.content : '') === v.attendu;
  }
  if(v.type === 'sortie'){
    const derniere = [...hist].reverse().find(h => v.filtre ? v.filtre.test(h) : true);
    if(!derniere) return '' === v.attendu;
    const r = E.run(E.newShellFrom(sh), derniere);
    return (r.out !== undefined ? r.out : '') === v.attendu;
  }
  return v.criteres.every(c => c.interdit ? !c.test(sh, hist) : !!c.test(sh, hist));
}

/* Renvoie {ok, detail}. `ok` est vrai si le contrôle et le panneau sont
   d'accord ET que leur verdict commun est celui attendu par le scénario. */
function verifieAccord(E, st, cmds, attendu){
  const sh = E.newShell(st.setup);
  const hist = [];
  for(const c of cmds){ hist.push(c); E.run(sh, c); }
  const parCheck = !!st.check(sh, hist);
  const parPanneau = panneauOk(E, st, sh, hist);
  if(parPanneau === null) return { ok:false, detail:'mission sans descripteur verif' };
  if(parCheck !== parPanneau)
    return { ok:false, detail:'désaccord : check='+parCheck+' panneau='+parPanneau+'  cmds='+JSON.stringify(cmds) };
  if(parCheck !== attendu)
    return { ok:false, detail:'verdict '+parCheck+' au lieu de '+attendu+'  cmds='+JSON.stringify(cmds) };
  return { ok:true };
}

/* Passe tous les scénarios d'un module : solution, rien fait, fausses pistes. */
function accordSurTousLesScenarios(E, ROOMS, SOL, WRONG, t){
  ROOMS.forEach(r => r.steps.forEach((st, i) => {
    if(st.k !== 'term') return;
    const id = r.id + '.' + i;
    if(SOL[id]){ const v = verifieAccord(E, st, SOL[id], true);
      t(id + ' (solution) : panneau et contrôle d\'accord', v.ok || v.detail); }
    const rien = verifieAccord(E, st, [], false);
    t(id + ' (rien fait) : panneau et contrôle d\'accord', rien.ok || rien.detail);
  }));
  Object.keys(WRONG).forEach(id => {
    const [rid, idx] = id.split('.');
    const st = ROOMS.find(r => r.id === rid).steps[+idx];
    WRONG[id].forEach((cmds, n) => {
      const v = verifieAccord(E, st, cmds, false);
      t(id + ' #' + (n+1) + ' (fausse piste) : panneau et contrôle d\'accord', v.ok || v.detail);
    });
  });
}

module.exports = { panneauOk, verifieAccord, accordSurTousLesScenarios };
