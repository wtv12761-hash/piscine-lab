const E=require('./_rooms_shell00.js'); const {newShell,run,ROOMS}=E;
const SOL={
 'r1.1':['echo OK > marque'],
 'r1.3':['ls -l','rmdir journal','echo debut > journal'],
 'r2.1':['ls -l'],
 'r3.4':['chmod 471 budget.csv'],
 'r3.5':['chmod 700 archives','cd archives','cat inventaire'],
 'r4.2':['ln source copie_dure','ln -s dossier pointeur'],
 'r4.5':['rm data','cat jumeau','cat alias'],
 'r5.1':['ls -a','cd .ssh','ls','cat id_ed25519.pub'],
 'r6.1':['man ls','ls -atmp'],
 'r9.1':['find . -type f \\( -name "*.bak" -o -name "tmp_*" \\) -print -delete'],
};
/* Erreurs plausibles qui DOIVENT être refusées. Une mission peut en avoir
   plusieurs : chaque entrée est une liste de scénarios, et chaque scénario est
   une suite de commandes. C'est ce contrôle qui donne sa valeur au lab, bien
   plus que celui de la solution : une mission dont la fausse piste passe ne
   teste rien d'utile. */
const WRONG={
 'r3.4':[['chmod 741 budget.csv']],                       // groupe du milieu faux
 'r5.1':[['cat .ssh/id_ed25519','cat .ssh/id_ed25519.pub']],  // la privée a été affichée
 // L'oubli de -a est aussi une erreur classique, mais la commande qui en
 // résulte est mot pour mot le rendu attendu par l'ex04 : on ne l'écrit donc
 // pas ici. Le contrôle de la mission exige la sortie exacte, entrées cachées
 // comprises, donc cet oubli est refusé de toute façon.
 'r6.1':[['ls -atmF'],                                    // -F décore aussi exécutables et liens
         ['ls -atm']],                                    // oubli du slash sur les dossiers
 'r9.1':[['find . \\( -name "*.bak" -o -name "tmp_*" \\) -print -delete']],  // sans -type f
 'r4.2':[['ln -s source copie_dure','ln -s dossier pointeur']],  // lien symbolique au lieu de dur
};
let pass=0,fail=0;
function t(n,c){ if(c===true){pass++;console.log('  ok   '+n);} else {fail++;console.log('  FAIL '+n+' -> '+c);} }
function check(id,step,cmds,want){
  const sh=newShell(step.setup); const hist=[];
  for(const c of cmds){ hist.push(c); run(sh,c); }
  const got=!!step.check(sh,hist);
  if(got===want){pass++;console.log('  ok   '+id+(want?' (solution)':' (mauvaise voie rejetée)'));}
  else{fail++;console.log('  FAIL '+id+' attendu '+want+' obtenu '+got+'  cmds='+JSON.stringify(cmds));}
}
console.log('\n--- missions terminal : la solution valide ---');
ROOMS.forEach(r=>r.steps.forEach((st,i)=>{
  if(st.k!=='term') return;
  const id=r.id+'.'+i;
  if(!SOL[id]){fail++;console.log('  FAIL pas de solution de test pour '+id);return;}
  check(id,st,[],false);              // rien fait => non validé
  check(id,st,SOL[id],true);          // solution => validé
}));
console.log('\n--- les fausses pistes sont bien refusées ---');
Object.keys(WRONG).forEach(id=>{
  const [rid,idx]=id.split('.');
  const st=ROOMS.find(r=>r.id===rid).steps[+idx];
  WRONG[id].forEach((cmds,n)=>check(id+' #'+(n+1),st,cmds,false));
});
console.log('\n--- le panneau et le contrôle disent la même chose ---');
require('./accord.js').accordSurTousLesScenarios(E, ROOMS, SOL, WRONG, t);

console.log('\n--- structure du contenu ---');
t('10 salles',ROOMS.length===10||ROOMS.length);
ROOMS.forEach(r=>{
  r.steps.forEach((st,i)=>{
    const id=r.id+'.'+i;
    if(st.k==='mcq'){
      t(id+' mcq bien formé', (Array.isArray(st.opts)&&st.opts.length>=3&&typeof st.a==='number'&&st.a<st.opts.length&&!!st.why)||JSON.stringify(st).slice(0,80));
    }
    if(st.k==='input'){
      t(id+' input : sa propre réponse passe', (st.accept?st.accept(st.a[0]):st.a.includes(st.a[0]))===true||'refusée');
    }
    if(st.k==='term'){ t(id+' a des indices', (st.hints&&st.hints.length>=2)||'trop peu'); }
  });
});
console.log('\n=========================');
console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
