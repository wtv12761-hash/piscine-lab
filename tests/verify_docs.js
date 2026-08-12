/* Contrôle final : la documentation dit-elle la vérité ? */
const fs=require('fs'), path=require('path');
process.chdir(path.join(__dirname,'..'));
const R=m=>require(path.join(__dirname,m));
let ok=0, ko=0;
const T=(n,c)=>{ if(c===true){ok++;console.log('  ok   '+n);} else {ko++;console.log('  KO   '+n+'  → '+c);} };

const H=fs.readFileSync('HANDOFF.md','utf8');
const C=fs.readFileSync('CONTEXT.md','utf8');
const I=fs.readFileSync('INFORMATIONS-UTILES.md','utf8');
const docs={HANDOFF:H, CONTEXT:C, INFOS:I};

console.log('\n=== 1. fichiers annoncés vs présents ===');
const attendus=['index.html','shell00.html','shell01.html','c00.html','c01.html',
 'CONTEXT.md','HANDOFF.md','INFORMATIONS-UTILES.md','.gitignore',
 'tests/extract.js','tests/run_all.sh','tests/test_shell_engine.js','tests/test_shell_pipes.js',
 'tests/test_rooms_shell00.js','tests/test_rooms_shell01.js','tests/test_c_engine.js','tests/test_rooms_c.js',
 'tests/confidentialite.js','tests/test_confidentialite.js'];
attendus.forEach(f=>T('présent : '+f, fs.existsSync(f)||'MANQUANT'));

console.log('\n=== 2. tout fichier cité dans la doc existe ===');
for(const [nom,txt] of Object.entries(docs)){
  const cites=new Set([...txt.matchAll(/`(tests\/[a-z_]+\.(?:js|sh)|[a-z0-9]+\.html|[A-Z-]+\.md|\.gitignore)`/g)].map(m=>m[1]));
  cites.forEach(f=>{ if(f.includes('_*')) return;
    T(nom+' cite '+f, fs.existsSync(f)||'CITÉ MAIS ABSENT'); });
}

console.log('\n=== 3. chiffres annoncés vs réels ===');
const inv={};
for(const [f,m] of [['shell00','_rooms_shell00'],['shell01','_rooms_shell01'],['c00','_rooms_c00'],['c01','_rooms_c01']]){
  const {ROOMS,VIVA,MODULE}=R(m+'.js');
  const k={}; ROOMS.forEach(r=>r.steps.forEach(s=>k[s.k]=(k[s.k]||0)+1));
  inv[f]={salles:ROOMS.length, k, key:MODULE.cle, viva:VIVA.length,
          src:fs.readFileSync(f+'.html','utf8')};
}
T('shell00 : 10 salles annoncées', inv.shell00.salles===10||inv.shell00.salles);
T('shell01 : 8 salles annoncées',  inv.shell01.salles===8 ||inv.shell01.salles);
T('c00 : 6 salles annoncées',      inv.c00.salles===6     ||inv.c00.salles);
T('c01 : 6 salles annoncées',      inv.c01.salles===6     ||inv.c01.salles);
// Le compteur de l'en-tête était écrit en dur dans le HTML et pouvait donc
// mentir ; il est maintenant calculé depuis ROOMS. On vérifie qu'aucune page
// ne réintroduit un total en dur, ce qui rouvrirait la possibilité d'un écart.
for(const f of Object.keys(inv))
  T(f+' : aucun total de salles écrit en dur dans la page',
    !/>\s*0\s*\/\s*\d+\s*(salles)?\s*</.test(inv[f].src)||'total figé trouvé');
// tableau des infos utiles
const lignes=[['Shell 00',10,10,16,6,3],['Shell 01',8,10,12,3,0],['C 00',6,6,8,1,0],['C 01',6,7,7,1,0]];
const map={'Shell 00':'shell00','Shell 01':'shell01','C 00':'c00','C 01':'c01'};
lignes.forEach(([nom,lec,mis,mcq,inp,ans])=>{
  const v=inv[map[nom]].k;
  const reelMis=(v.term||0)+(v.code||0);
  T(nom+' : leçons '+lec, (v.lesson||0)===lec||v.lesson);
  T(nom+' : missions '+mis, reelMis===mis||reelMis);
  T(nom+' : QCM '+mcq, (v.mcq||0)===mcq||v.mcq);
  T(nom+' : saisies '+inp, (v.input||0)===inp||v.input);
  T(nom+' : oral libre '+ans, (v.answer||0)===ans||(v.answer||0));
});
T('C 00 : 18 cas de test annoncés', (()=>{const {ROOMS}=R('_rooms_c00.js');
  let n=0;ROOMS.forEach(r=>r.steps.forEach(s=>{if(s.k==='code')n+=s.tests.length;}));return n===18||n;})());
T('C 01 : 24 cas de test annoncés', (()=>{const {ROOMS}=R('_rooms_c01.js');
  let n=0;ROOMS.forEach(r=>r.steps.forEach(s=>{if(s.k==='code')n+=s.tests.length;}));return n===24||n;})());

console.log('\n=== 4. clés de stockage ===');
const cles=Object.values(inv).map(x=>x.key);
T('quatre clés distinctes', new Set(cles).size===4||cles.join(','));
cles.forEach(k=>T('hub lit '+k, fs.readFileSync('index.html','utf8').includes("'"+k+"'")||'ABSENT DU HUB'));
Object.entries(inv).forEach(([f,v])=>T(f+' : clé documentée', I.includes('`'+v.key+'`')||'non documentée'));

console.log('\n=== 5. invariants du contenu ===');
for(const [f,m] of [['shell00','_rooms_shell00'],['shell01','_rooms_shell01'],['c00','_rooms_c00'],['c01','_rooms_c01']]){
  const {ROOMS}=R(m+'.js');
  const ids=ROOMS.map(r=>r.id);
  T(f+' : identifiants de salle uniques', new Set(ids).size===ids.length||ids.join(','));
  T(f+' : une seule salle boss', ROOMS.filter(r=>r.boss).length===1||ROOMS.filter(r=>r.boss).length);
  T(f+' : la salle boss est la dernière', !!ROOMS[ROOMS.length-1].boss||'non');
  let pbs=[];
  ROOMS.forEach(r=>r.steps.forEach((s,i)=>{
    const id=r.id+'.'+i;
    if(s.k==='mcq'&&!s.why) pbs.push(id+' sans why');
    if(s.k==='mcq'&&(s.a>=s.opts.length)) pbs.push(id+' index hors bornes');
    if(s.k==='input'&&!(s.accept?s.accept(s.a[0]):s.a.includes(s.a[0]))) pbs.push(id+' rejette sa réponse');
    if((s.k==='term'||s.k==='code')&&(!s.hints||s.hints.length<2)) pbs.push(id+' indices insuffisants');
    if(s.k==='code'&&!s.sig) pbs.push(id+' sans signature');
    if(s.k==='code'&&(!s.tests||!s.tests.length)) pbs.push(id+' sans test');
  }));
  T(f+' : toutes les étapes bien formées', pbs.length===0||pbs.join(' | '));
}

console.log('\n=== 6. confidentialité et autonomie ===');
// La confidentialité elle-même est vérifiée par tests/test_confidentialite.js,
// qui parcourt TOUS les fichiers du dépôt. Ici on se contente de vérifier que
// ce contrôle existe et qu'il est bien branché : un audit qui prétend couvrir
// la confidentialité sans le faire est exactement le défaut qu'on corrige.
T('le contrôle de confidentialité existe', fs.existsSync('tests/test_confidentialite.js')||'ABSENT');
T('il est lancé par run_all.sh',
  /tests\/test_\*\.js/.test(fs.readFileSync('tests/run_all.sh','utf8'))||'non lancé');
T('il couvre tout le dépôt, pas une liste écrite à la main',
  require('./confidentialite.js').fichiersDuDepot('.').includes('tests/test_shell_engine.js')||'couverture partielle');
['index.html','shell00.html','shell01.html','c00.html','c01.html'].forEach(f=>{
  const t=fs.readFileSync(f,'utf8');
  T(f+' : autonome (aucun src/href externe)', !/<script[^>]+src=|<link[^>]+href="http/i.test(t)||'DÉPENDANCE EXTERNE');
});

console.log('\n=== 6 bis. non-régression : la salle d\'auto-évaluation ===');
// Trois pages sur quatre écrivaient leur progression finale dans S.rooms['r10'],
// un identifiant qui n'existe que dans shell00. Résultat : la salle finale ne se
// validait jamais ailleurs, et le hub comptait une salle fantôme. Un identifiant
// de salle écrit en dur dans la couche de rendu est donc désormais une erreur.
['shell00.html','shell01.html','c00.html','c01.html'].forEach(f=>{
  const s=fs.readFileSync(f,'utf8');
  T(f+' : le viva déduit l\'identifiant de la dernière salle',
    /ROOMS\[ROOMS\.length-1\]\.id/.test(s)||'identifiant non déduit');
  // On cherche dans la page ENTIÈRE, et non dans une tranche autour d'un nom
  // de fonction : la tranche devenait un faux négatif dès que le code bougeait,
  // et une garde qui passe sans rien vérifier est le défaut qu'on corrige.
  T(f+' : aucun identifiant de salle écrit en dur',
    !/S\.rooms\['[a-z0-9]+'\]/.test(s)||'identifiant en dur : '+(/S\.rooms\['[a-z0-9]+'\]/.exec(s)||[])[0]);
  T(f+' : un seul seuil pour le message et la validation',
    (s.match(/bons>=seuil/g)||[]).length===2||'seuils divergents');
});

console.log('\n=== 7. liens du hub ===');
const hub=fs.readFileSync('index.html','utf8');
// Le hub construit ses lignes en JavaScript depuis sa liste de modules : on
// vérifie donc que chaque page y est déclarée, et non qu'un href littéral
// figure dans le HTML, ce qui n'a plus de sens depuis la refonte.
['shell00.html','shell01.html','c00.html','c01.html'].forEach(f=>
  T('hub déclare '+f, hub.includes("'"+f+"'")||hub.includes('href="'+f+'"')||'module absent du hub'));
T('hub : un point de reprise existe', /id="reprendre"/.test(hub)||'bouton de reprise absent');
['shell00.html','shell01.html','c00.html','c01.html'].forEach(f=>
  T(f+' : retour vers le hub', fs.readFileSync(f,'utf8').includes('href="index.html"')||'pas de retour'));

console.log('\n=== 8. la doc annonce le bon nombre de contrôles ===');
// Le chiffre annoncé dans la doc dérivait sans que rien ne le remarque : elle
// disait 116 pour 117 contrôles réels. Un document qui ment sur son propre
// contenu décrédibilise tous ses autres chiffres, donc on le fait vérifier.
// Ce contrôle-ci est compté dans le total qu'il vérifie, d'où le +1.
{
  const attendu = ok + ko + 1;
  const lu = t => { const m = /(\d+)\s+contrôles d'audit/.exec(t); return m ? +m[1] : null; };
  const bons = [['HANDOFF.md', lu(H)], ['INFORMATIONS-UTILES.md', lu(I)]]
    .filter(([, v]) => v !== attendu);
  T('les deux documents annoncent ' + attendu + ' contrôles',
    bons.length === 0 || bons.map(([f, v]) => f + ' annonce ' + v).join(', '));
}

console.log('\n=========================================');
console.log('  contrôles réussis : '+ok+'   échecs : '+ko);
console.log('=========================================');
process.exit(ko?1:0);
