const E=require('./_shell.js'); const {newShell,run,lookup,fDir,fFile,newShellFrom}=E;
let pass=0,fail=0;
function t(n,f){ try{ const r=f(); if(r===true){pass++;console.log('  ok   '+n);}
  else{fail++;console.log('  FAIL '+n+' -> '+JSON.stringify(r));} }
  catch(e){fail++;console.log('  ERR  '+n+' -> '+e.message);} }
const O=r=>r&&r.out!==undefined?r.out:('ERR:'+(r&&r.err));
function sh(setup,cmds){ const s=newShell(setup); let last;
  for(const c of cmds) last=run(s,c); return {s,last}; }

console.log('\n--- pipes ---');
t('echo | wc -c',()=>O(sh(null,[]).s&&run(newShell(),'echo salut | wc -c'))==='6\n'||O(run(newShell(),'echo salut | wc -c')));
t('cat f | wc -l',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('a\nb\nc\n');},['cat f | wc -l']);return O(last)==='3\n'||O(last);});
t('trois etages de pipe',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('c\na\nb\n');},['cat f | sort | head -n 2']);return O(last)==='a\nb\n'||O(last);});
t('pipe vide = erreur',()=>!!run(newShell(),'ls | | wc -l').err||'accepte');
t('redirection apres pipe',()=>{const {s,last}=sh(null,['echo un deux | tr " " "\\n" > out']);
  return lookup(s,'out').content==='un\ndeux\n'||JSON.stringify(lookup(s,'out').content);});

console.log('\n--- filtres ---');
t('tr remplace',()=>O(run(newShell(),'echo a b c | tr " " ";"'))==='a;b;c\n'||O(run(newShell(),'echo a b c | tr " " ";"')));
t('tr -d supprime',()=>O(run(newShell(),'echo a-b-c | tr -d "-"'))==='abc\n'||O(run(newShell(),'echo a-b-c | tr -d "-"')));
t('tr avec intervalle',()=>O(run(newShell(),'echo abc | tr "a-z" "A-Z"'))==='ABC\n'||O(run(newShell(),'echo abc | tr "a-z" "A-Z"')));
t('tr sans pipe = erreur pedagogique',()=>!!run(newShell(),'tr " " ","').err||'pas d erreur');
t('cut -d -f',()=>{const {last}=sh(s=>{s.root.children['l']=fFile('root:x:0:0\n');},['cut -d: -f1 l']);return O(last)==='root\n'||O(last);});
t('cut deux champs',()=>{const {last}=sh(s=>{s.root.children['l']=fFile('a,b,c\n');},['cut -d, -f1,3 l']);return O(last)==='a,c\n'||O(last);});
t('grep filtre',()=>{const {last}=sh(s=>{s.root.children['g']=fFile('erreur 1\nok\nerreur 2\n');},['grep erreur g']);return O(last)==='erreur 1\nerreur 2\n'||O(last);});
t('grep -v inverse',()=>{const {last}=sh(s=>{s.root.children['g']=fFile('erreur 1\nok\n');},['grep -v erreur g']);return O(last)==='ok\n'||O(last);});
t('grep -c compte',()=>{const {last}=sh(s=>{s.root.children['g']=fFile('a\nb\na\n');},['grep -c a g']);return O(last)==='2\n'||O(last);});
t('sort -r',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('b\na\nc\n');},['sort -r f']);return O(last)==='c\nb\na\n'||O(last);});
t('head -n 2',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('1\n2\n3\n4\n');},['head -n 2 f']);return O(last)==='1\n2\n'||O(last);});
t('tail -n 1',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('1\n2\n3\n');},['tail -n 1 f']);return O(last)==='3\n'||O(last);});
t('rev inverse les caracteres pas les lignes',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('abc\ndef\n');},['rev f']);return O(last)==='cba\nfed\n'||O(last);});
t('uniq',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('a\na\nb\n');},['uniq f']);return O(last)==='a\nb\n'||O(last);});
t('wc -l sur fichier',()=>{const {last}=sh(s=>{s.root.children['f']=fFile('a\nb\n');},['wc -l f']);return O(last)==='2 f\n'||O(last);});
t('find | wc -l',()=>{const {last}=sh(s=>{s.root.children['a.txt']=fFile('x');s.root.children['b.txt']=fFile('x');
  const d=fDir(); d.children['c.txt']=fFile('x'); s.root.children['sub']=d;},['find . -name "*.txt" | wc -l']);
  return O(last)==='3\n'||O(last);});

console.log('\n--- variables ---');
t('export puis echo',()=>{const {last}=sh(null,['export NOM=marvin','echo $NOM']);return O(last)==='marvin\n'||O(last);});
t('guillemets doubles : expansion',()=>{const {last}=sh(null,['export V=x','echo "val=$V"']);return O(last)==='val=x\n'||O(last);});
t('guillemets simples : pas d expansion',()=>{const {last}=sh(null,['export V=x',"echo 'val=$V'"]);return O(last)==='val=$V\n'||O(last);});
t('variable inexistante = vide',()=>O(run(newShell(),'echo [$RIEN]'))==='[]\n'||O(run(newShell(),'echo [$RIEN]')));
t('variable comme argument',()=>{const {last}=sh(null,['export U=daemon','id -Gn $U']);return O(last)==='daemon bin\n'||O(last);});

console.log('\n--- id ---');
t('id -Gn',()=>O(run(newShell(),'id -Gn student'))==='student adm sudo\n'||O(run(newShell(),'id -Gn student')));
t('id -G numerique',()=>/^\d+ \d+/.test(O(run(newShell(),'id -G student')))||O(run(newShell(),'id -G student')));
t('id utilisateur inconnu',()=>!!run(newShell(),'id -Gn personne').err||'pas d erreur');
t('id -Gn | tr en virgules',()=>O(run(newShell(),'id -Gn daemon | tr " " ","'))==='daemon,bin\n'||O(run(newShell(),'id -Gn daemon | tr " " ","')));

console.log('\n--- non-regression shell00 ---');
// Motifs et combinaisons volontairement différents de ceux du sujet et des
// salles : on vérifie que le moteur n'a pas régressé, pas qu'une réponse marche.
t('find garde le ET implicite et le -type f',()=>{const {s}=sh(x=>{x.root.children['a.old']=fFile('1');x.root.children['g.txt']=fFile('1');
  x.root.children['d.old']=fDir();},['find . -type f \\( -name "*.old" -o -name "cache_*" \\) -print -delete']);
  return (!lookup(s,'a.old')&&!!lookup(s,'g.txt')&&!!lookup(s,'d.old'))||'regression';});
t('les options de ls se combinent toujours',()=>{const s2=newShell(x=>{
  x.root.children['v']=Object.assign(fFile('a'),{mtime:E.T0-500000});
  x.root.children['d']=Object.assign(fDir(),{mtime:E.T0-300000});
  x.root.children['r']=Object.assign(fFile('a'),{mtime:E.T0-100000});});
  return O(run(s2,'ls -tm'))==='r, d, v\n'||O(run(s2,'ls -tm'));});
console.log('\n========================='); console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
