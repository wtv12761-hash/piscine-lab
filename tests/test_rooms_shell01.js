const E=require('./_rooms_shell01.js'); const {newShell,run,ROOMS}=E;
const SOL={
 's1.1':['cat notes.txt | wc -l'],
 's1.3':['echo bonjour | wc -c'],
 's2.1':['echo a b c | tr " " ";"'],
 's2.3':['cut -d: -f3 ligne.txt'],
 's3.2':['find . -name "*.conf" | wc -l'],
 's4.1':['grep ERROR journal.log'],
 's4.2':['grep -v "#" reglages.conf'],
 's5.1':['export CIBLE=daemon','id -Gn $CIBLE'],
 's6.1':["echo ok > 'a b$c'"],
 's7.1':['sort -r noms.txt | head -n 2'],
};
const WRONG={
 's1.1':[['wc -l notes.txt']],
 's2.1':[['echo a b c | tr " " ":"']],
 's2.3':[['cut -d: -f1 ligne.txt']],
 's3.2':[['ls | wc -l']],
 's4.2':[['grep "#" reglages.conf']],
 's5.1':[['id -Gn daemon']],
 's6.1':[['echo ok > "a b$c"']],
 's7.1':[['sort noms.txt | head -n 2']],
};
let pass=0,fail=0;
function check(id,step,cmds,want){
  const sh=newShell(step.setup); const hist=[];
  for(const c of cmds){ hist.push(c); run(sh,c); }
  const got=!!step.check(sh,hist);
  if(got===want){pass++;console.log('  ok   '+id+(want?' (solution)':' (rejet)'));}
  else{fail++;console.log('  FAIL '+id+' attendu '+want+' obtenu '+got+' cmds='+JSON.stringify(cmds));}
}
console.log('\n--- missions : la solution valide ---');
ROOMS.forEach(r=>r.steps.forEach((st,i)=>{
  if(st.k!=='term') return;
  const id=r.id+'.'+i;
  if(!SOL[id]){fail++;console.log('  FAIL pas de solution de test pour '+id);return;}
  check(id,st,[],false);
  check(id,st,SOL[id],true);
}));
console.log('\n--- fausses pistes rejetees ---');
Object.keys(WRONG).forEach(id=>{
  const [rid,idx]=id.split('.');
  const st=ROOMS.find(r=>r.id===rid).steps[+idx];
  WRONG[id].forEach((cmds,n)=>check(id+' #'+(n+1),st,cmds,false));
});
function t(n,c){ if(c===true){pass++;console.log('  ok   '+n);} else {fail++;console.log('  FAIL '+n+' -> '+c);} }

console.log('\n--- le panneau et le controle disent la meme chose ---');
require('./accord.js').accordSurTousLesScenarios(E, ROOMS, SOL, WRONG, t);

console.log('\n--- structure ---');
t('8 salles',ROOMS.length===8||ROOMS.length);
ROOMS.forEach(r=>r.steps.forEach((st,i)=>{
  const id=r.id+'.'+i;
  if(st.k==='mcq') t(id+' mcq',(Array.isArray(st.opts)&&st.opts.length>=3&&typeof st.a==='number'&&st.a<st.opts.length&&!!st.why)||'malforme');
  if(st.k==='input') t(id+' input accepte sa reponse',(st.accept?st.accept(st.a[0]):st.a.includes(st.a[0]))===true||'refusee');
  if(st.k==='term') t(id+' indices',(st.hints&&st.hints.length>=2)||'trop peu');
}));
console.log('\n========================='); console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
