const E=require('./_shell.js');
const {newShell,run,lookup,fDir,fFile,fLink,newShellFrom,T0}=E;
let pass=0,fail=0;
function t(name,fn){
  try{ const r=fn(); if(r===true){pass++;console.log('  ok   '+name);}
       else {fail++;console.log('  FAIL '+name+'  -> '+r);} }
  catch(e){ fail++; console.log('  ERR  '+name+'  -> '+e.message); }
}
function sess(setup,cmds){
  const sh=newShell(setup); const hist=[]; const outs=[];
  for(const c of cmds){ hist.push(c); outs.push(run(sh,c)); }
  return {sh,hist,outs};
}
const O=r=>r&&r.out!==undefined?r.out:('ERR:'+(r&&r.err));

console.log('\n--- salle 1 : redirection ---');
t('echo Z > z donne Z\\n',()=>{
  const {sh}=sess(null,['echo Z > z']);
  const n=lookup(sh,'z'); return (n&&n.content==='Z\n')||JSON.stringify(n);
});
t('cat -e z affiche Z$',()=>{
  const {sh}=sess(null,['echo Z > z']);
  return O(run(sh,'cat -e z'))==='Z$\n'||JSON.stringify(O(run(sh,'cat -e z')));
});
t('wc -c z = 2',()=>{
  const {sh}=sess(null,['echo Z > z']);
  return O(run(sh,'wc -c z')).trim()==='2 z'||O(run(sh,'wc -c z'));
});
t('> sur un dossier echoue',()=>{
  const {sh}=sess(s=>{s.root.children['d']=fDir();},[]);
  const r=run(sh,'echo hi > d'); return !!r.err||'pas d\'erreur';
});
t('rmdir puis echo marche',()=>{
  const {sh}=sess(s=>{s.root.children['notes.txt']=fDir();},['rmdir notes.txt','echo hello > notes.txt']);
  const n=lookup(sh,'notes.txt'); return (n&&n.type==='file'&&n.content==='hello\n')||JSON.stringify(n);
});
t('>> ajoute',()=>{
  const {sh}=sess(null,['echo a > f','echo b >> f']);
  return lookup(sh,'f').content==='a\nb\n'||JSON.stringify(lookup(sh,'f').content);
});

console.log('\n--- salle 2/3 : ls -l et chmod ---');
t('ls -l montre le type d',()=>{
  const {sh}=sess(s=>{s.root.children['dir']=fDir();},[]);
  return /^drwxr-xr-x/m.test(O(run(sh,'ls -l')))||O(run(sh,'ls -l'));
});
t('chmod 455 -> -r--r-xr-x',()=>{
  const {sh}=sess(s=>{s.root.children['f']=fFile('x'.repeat(40));},['chmod 455 f']);
  return /^-r--r-xr-x/m.test(O(run(sh,'ls -l')))||O(run(sh,'ls -l'));
});
t('chmod 641 -> mode 0o641',()=>{
  const {sh}=sess(s=>{s.root.children['rapport']=fFile('donnees\n',0o644);},['chmod 641 rapport']);
  return lookup(sh,'rapport').mode===0o641||lookup(sh,'rapport').mode.toString(8);
});
t('chmod invalide rejete',()=>{
  const {sh}=sess(s=>{s.root.children['f']=fFile('a');},[]);
  return !!run(sh,'chmod u+x f').err||'accepte a tort';
});
t('cd refuse sans x',()=>{
  const {sh}=sess(s=>{const d=fDir(0o644); d.children['note']=fFile('secret\n'); s.root.children['coffre']=d;},[]);
  return !!run(sh,'cd coffre').err||'entree autorisee a tort';
});
t('chmod 744 puis cd + cat',()=>{
  const {sh,hist}=sess(s=>{const d=fDir(0o644); d.children['note']=fFile('secret\n'); s.root.children['coffre']=d;},
    ['chmod 744 coffre','cd coffre','cat note']);
  const d=lookup(sh,'/coffre');
  return ((d.mode>>6)&1)===1 && hist.some(h=>/^cat\s+.*note/.test(h))||'echec';
});

console.log('\n--- salle 4 : liens ---');
t('ln cree un lien dur (meme objet)',()=>{
  const {sh}=sess(s=>{s.root.children['test3']=fFile('\n');},['ln test3 test5']);
  return lookup(sh,'test3')===lookup(sh,'test5')||'objets differents';
});
t('nlink passe a 2',()=>{
  const {sh}=sess(s=>{s.root.children['test3']=fFile('\n');},['ln test3 test5']);
  const l=O(run(sh,'ls -l')); return /^-rw-r--r-- 2 .*test3$/m.test(l)||l;
});
t('chmod sur test3 affecte test5',()=>{
  const {sh}=sess(s=>{s.root.children['test3']=fFile('\n');},['ln test3 test5','chmod 404 test3']);
  return lookup(sh,'test5').mode===0o404||lookup(sh,'test5').mode.toString(8);
});
t('ln -s : taille = longueur cible',()=>{
  const {sh}=sess(s=>{s.root.children['test0']=fDir();},['ln -s test0 test6']);
  return E.sizeOf(lookup(sh,'test6'))===5||E.sizeOf(lookup(sh,'test6'));
});
t('symlink affiche lrwxrwxrwx et -> cible',()=>{
  const {sh}=sess(s=>{s.root.children['test0']=fDir();},['ln -s test0 test6']);
  const l=O(run(sh,'ls -l')); return /lrwxrwxrwx 1 .* 5 .*test6 -> test0/.test(l)||l;
});
t('chmod ignore sur symlink',()=>{
  const {sh}=sess(s=>{s.root.children['a']=fFile('x');},['ln -s a s','chmod 700 s']);
  return E.modeStr(lookup(sh,'s'))==='lrwxrwxrwx'||E.modeStr(lookup(sh,'s'));
});
t('rm src : lien dur survit, symlink meurt',()=>{
  const {sh}=sess(s=>{const f=fFile('contenu\n'); s.root.children['src']=f; s.root.children['dur']=f;
    s.root.children['sym']=fLink('src');},['rm src']);
  const dur=O(run(sh,'cat dur'));
  const sym=run(sh,'cat sym');
  return (dur==='contenu\n'&&!!sym.err)||('dur='+dur+' sym='+JSON.stringify(sym));
});
t('ln -s vers inexistant autorise',()=>{
  const {sh}=sess(null,['ln -s nulpart lnk']);
  return lookup(sh,'lnk').type==='link'||'refuse';
});
t('ls -i : meme inode pour lien dur',()=>{
  const {sh}=sess(s=>{s.root.children['a']=fFile('x');},['ln a b']);
  return lookup(sh,'a').ino===lookup(sh,'b').ino||'inodes differents';
});

console.log('\n--- salle 5 : ssh ---');
function sshSetup(s){
  const d=fDir(0o700);
  d.children['id_ed25519']=fFile('-----BEGIN OPENSSH PRIVATE KEY-----\n',0o600);
  d.children['id_ed25519.pub']=fFile('ssh-ed25519 AAAA... student@campus\n',0o644);
  s.root.children['.ssh']=d;
}
t('ls cache le .ssh, ls -a le montre',()=>{
  const {sh}=sess(sshSetup,[]);
  const a=O(run(sh,'ls')), b=O(run(sh,'ls -a'));
  return (!a.includes('.ssh')&&b.includes('.ssh'))||('ls='+a+' ls -a='+b);
});
t('cat de la cle publique',()=>{
  const {sh}=sess(sshSetup,[]);
  return O(run(sh,'cat .ssh/id_ed25519.pub')).startsWith('ssh-ed25519')||O(run(sh,'cat .ssh/id_ed25519.pub'));
});
t('check ssh : pub ok, prive non lu',()=>{
  const hist=['ls -a','cd .ssh','cat id_ed25519.pub'];
  const ok=hist.some(h=>/cat\s+.*id_ed25519\.pub/.test(h)) && !hist.some(h=>/cat\s+[^|]*id_ed25519(\s|$)/.test(h));
  return ok||'faux negatif';
});
t('check ssh : detecte lecture de la privee',()=>{
  const hist=['cat .ssh/id_ed25519'];
  const ok=hist.some(h=>/cat\s+.*id_ed25519\.pub/.test(h)) && !hist.some(h=>/cat\s+[^|]*id_ed25519(\s|$)/.test(h));
  return ok===false||'aurait du echouer';
});

console.log('\n--- salle 6 : les options de listage, une par une ---');
function midSetup(s){
  s.root.children['ancien.txt']=Object.assign(fFile('a'),{mtime:T0-500000});
  s.root.children['dossier']=Object.assign(fDir(),{mtime:T0-300000});
  s.root.children['prog']=Object.assign(fFile('x',0o755),{mtime:T0-100000});
  s.root.children['.cache']=fFile('x');
}
/* Ces tests portent sur le MOTEUR, pas sur la mission : ils vérifient chaque
   option isolément et par paires, sans jamais composer la combinaison qui est
   la réponse d'un exercice ou d'une salle. La réponse de la mission vit dans
   tests/test_rooms_shell00.js, à un seul endroit, où elle a une raison d'être. */
t('-m sépare par virgule et espace',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls -m'));
  return o==='ancien.txt, dossier, prog\n'||JSON.stringify(o);
});
t('-t trie du plus récent au plus ancien',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls -t'));
  return o==='prog  dossier  ancien.txt\n'||JSON.stringify(o);
});
t('-p ajoute un slash aux dossiers, et rien d\'autre',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls -p'));
  return o==='ancien.txt  dossier/  prog\n'||JSON.stringify(o);
});
t('-F décore aussi les exécutables, contrairement à -p',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls -F'));
  return o==='ancien.txt  dossier/  prog*\n'||JSON.stringify(o);
});
t('-a fait apparaître les cachées, le point et le double point',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls -a'));
  return o==='.  ..  .cache  ancien.txt  dossier  prog\n'||JSON.stringify(o);
});
t('sans -a, les entrées cachées sont absentes',()=>{
  const o=O(run(sess(midSetup,[]).sh,'ls'));
  return !o.includes('.cache')||JSON.stringify(o);
});
t('le rejeu d\'une commande ne modifie pas le shell d\'origine',()=>{
  const {sh,hist}=sess(midSetup,['ls','ls -l','ls -p']);
  const last=[...hist].reverse().find(h=>h.startsWith('ls'));
  const avant=Object.keys(sh.root.children).sort().join(',');
  const r=run(newShellFrom(sh),last);
  const apres=Object.keys(sh.root.children).sort().join(',');
  return (r.out==='ancien.txt  dossier/  prog\n'&&avant===apres)||JSON.stringify({out:r.out,avant,apres});
});
t('man ls contient -p et -F',()=>{
  const {sh}=sess(null,[]);
  const o=O(run(sh,'man ls'));
  return (o.includes('-p')&&o.includes('-F')&&o.includes('-t'))||o;
});

console.log('\n--- salle 9 : find ---');
/* Motifs neutres, choisis pour n'être ni ceux du sujet ni ceux de la salle r9 :
   on teste le parseur de find, pas la réponse d'un exercice. */
function findSetup(s){
  s.root.children['garde.txt']=fFile('a');
  s.root.children['rapport.old']=fFile('a');
  s.root.children['cache_1']=fFile('a');
  s.root.children['archives.old']=fDir();
  const sub=fDir(); sub.children['note.old']=fFile('a'); sub.children['ok.c']=fFile('a');
  s.root.children['sub']=sub;
}
t('find complet : affiche et supprime',()=>{
  const {sh,outs}=sess(findSetup,['find . -type f \\( -name "*.old" -o -name "cache_*" \\) -print -delete']);
  const printed=O(outs[0]);
  const gone=!lookup(sh,'rapport.old')&&!lookup(sh,'cache_1')&&!lookup(sh,'sub/note.old');
  const kept=!!lookup(sh,'garde.txt')&&lookup(sh,'archives.old').type==='dir'&&!!lookup(sh,'sub/ok.c');
  const has3=['rapport.old','cache_1','note.old'].every(x=>printed.includes(x));
  return (gone&&kept&&has3)||('printed='+JSON.stringify(printed)+' gone='+gone+' kept='+kept);
});
t('sans -type f, le dossier archives.old est supprime',()=>{
  const {sh}=sess(findSetup,['find . \\( -name "*.old" -o -name "cache_*" \\) -print -delete']);
  return !lookup(sh,'archives.old')||'dossier conserve';
});
t('find recursif atteint sub/',()=>{
  const {sh,outs}=sess(findSetup,['find . -name "*.old" -print']);
  return O(outs[0]).includes('./sub/note.old')||JSON.stringify(O(outs[0]));
});
t('find sans action affiche quand meme',()=>{
  const {sh,outs}=sess(findSetup,['find . -name "cache_*"']);
  return O(outs[0]).trim()==='./cache_1'||JSON.stringify(O(outs[0]));
});
t('find -type d',()=>{
  const {sh,outs}=sess(findSetup,['find . -type d -print']);
  const o=O(outs[0]);
  return (o.includes('./archives.old')&&o.includes('./sub')&&!o.includes('garde'))||JSON.stringify(o);
});

console.log('\n--- divers ---');
t('commande inconnue',()=>!!run(newShell(),'foobar').err||'pas d\'erreur');
t('pwd',()=>O(run(newShell(),'pwd')).trim()==='/home/student'||O(run(newShell(),'pwd')));
t('mkdir -p imbrique',()=>{
  const {sh}=sess(null,['mkdir -p a/b/c']);
  return lookup(sh,'a/b/c')&&lookup(sh,'a/b/c').type==='dir'||'echec';
});
t('rm -rf sur dossier',()=>{
  const {sh}=sess(null,['mkdir d','echo x > d/f','rm -rf d']);
  return !lookup(sh,'d')||'toujours la';
});
t('touch -t change la date',()=>{
  const {sh}=sess(null,['touch f','touch -t 202606012342 f']);
  return /Jun  1 23:42/.test(O(run(sh,'ls -l')))||O(run(sh,'ls -l'));
});
t('touch -t format invalide',()=>!!run(newShell(),'touch -t 99 f').err||'accepte');
t('cd .. remonte',()=>{
  const {sh}=sess(null,['mkdir a','cd a','cd ..']);
  return sh.cwd.length===0||JSON.stringify(sh.cwd);
});
t('cat sur dossier echoue',()=>{
  const {sh}=sess(s=>{s.root.children['d']=fDir();},[]);
  return !!run(sh,'cat d').err||'pas d\'erreur';
});
t('newShellFrom ne modifie pas l\'original',()=>{
  const {sh}=sess(s=>{s.root.children['f']=fFile('a');},[]);
  const c=newShellFrom(sh); run(c,'rm f');
  return !!lookup(sh,'f')||'original modifie';
});

console.log('\n=========================');
console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
