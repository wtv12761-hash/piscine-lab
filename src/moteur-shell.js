/* Simulateur shell : système de fichiers en mémoire avec de vrais inodes.
   Extrait de shell00.html lors de la bascule vers les sources ; à partir
   d'ici c'est ce fichier qui fait foi, et les pages sont générées. */

let INODE = 1000;
const T0 = Date.UTC(2026,7,10,9,0,0);   // horloge virtuelle

function fDir(mode){ return {type:'dir', mode:mode??0o755, mtime:T0, ino:++INODE, children:{}}; }
function fFile(content,mode){ return {type:'file', mode:mode??0o644, mtime:T0, ino:++INODE, content:content??''}; }
function fLink(target){ return {type:'link', mode:0o777, mtime:T0, ino:++INODE, target}; }

function modeStr(n){
  const t = n.type==='dir'?'d':n.type==='link'?'l':'-';
  const m = n.type==='link'?0o777:n.mode;
  let s='';
  for(let i=2;i>=0;i--){ const v=(m>>(i*3))&7;
    s+=(v&4?'r':'-')+(v&2?'w':'-')+(v&1?'x':'-'); }
  return t+s;
}
function sizeOf(n){
  if(n.type==='link') return n.target.length;
  if(n.type==='dir')  return Object.keys(n.children).length?4096:6;
  return n.content.length;
}
function countRefs(root,obj){
  let c=0;
  (function walk(d){ for(const k in d.children){ const ch=d.children[k];
    if(ch===obj) c++; if(ch.type==='dir') walk(ch); } })(root);
  return c;
}
function nlink(root,n){
  if(n.type==='dir'){ let s=2; for(const k in n.children) if(n.children[k].type==='dir') s++; return s; }
  if(n.type==='link') return 1;
  return Math.max(1,countRefs(root,n));
}
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtTime(ms){
  const d=new Date(ms);
  const p=x=>String(x).padStart(2,'0');
  return MONTHS[d.getUTCMonth()]+' '+String(d.getUTCDate()).padStart(2,' ')+' '+p(d.getUTCHours())+':'+p(d.getUTCMinutes());
}
function globRe(p){
  return new RegExp('^'+p.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$');
}

/* --------- tokenizer : quotes, \( \), | et $VAR --------- */
function readVar(line,i,env){
  const m=/^\$([A-Za-z_][A-Za-z0-9_]*)/.exec(line.slice(i));
  if(!m) return null;
  return {v:(env&&env[m[1]]!==undefined)?env[m[1]]:'', i:i+m[0].length-1};
}
function tokenize(line,env){
  const out=[]; let cur=''; let q=null; let has=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(q==="'"){ if(c==="'"){q=null;} else cur+=c; continue; }
    if(q==='"'){
      if(c==='"'){q=null;}
      else if(c==='$'){ const r=readVar(line,i,env); if(r){cur+=r.v;i=r.i;} else cur+=c; }
      else cur+=c;
      continue; }
    if(c==='"'||c==="'"){ q=c; has=true; continue; }
    if(c==='\\'){ if(i+1<line.length){ cur+='\\'+line[++i]; has=true; } continue; }
    if(c==='$'){ const r=readVar(line,i,env); if(r){ cur+=r.v; i=r.i; has=true; continue; } }
    if(/\s/.test(c)){ if(cur||has){out.push(cur);cur='';has=false;} continue; }
    if(c==='>'){ if(cur||has){out.push(cur);cur='';has=false;}
      if(line[i+1]==='>'){out.push('>>');i++;} else out.push('>'); continue; }
    if(c==='|'){ if(cur||has){out.push(cur);cur='';has=false;} out.push('|'); continue; }
    cur+=c;
  }
  if(cur||has) out.push(cur);
  return out;
}
function expandSet(str){
  const esc={n:'\n', t:'\t', r:'\r', '\\':'\\'};
  let src='';
  for(let i=0;i<str.length;i++){
    if(str[i]==='\\'&&str[i+1]!==undefined){ src+= esc[str[i+1]]!==undefined?esc[str[i+1]]:str[i+1]; i++; }
    else src+=str[i];
  }
  str=src;
  const out=[];
  for(let i=0;i<str.length;i++){
    if(str[i+1]==='-'&&str[i+2]!==undefined){
      for(let c=str.charCodeAt(i);c<=str.charCodeAt(i+2);c++) out.push(String.fromCharCode(c));
      i+=2;
    } else out.push(str[i]);
  }
  return out;
}

/* --------- machine --------- */
/* État git simulé.
   Trois listes plutôt qu'un booléen par fichier : c'est exactement la
   distinction que les étudiants ratent au rendu. Un fichier peut être écrit
   sans être ajouté, ajouté sans être commité, et commité sans être poussé.
   Chacune de ces trois marches perd des rendus chaque piscine. */
const gitNeuf=()=>({indexes:[], commits:[], pousses:0});

function newShell(setup){
  const root=fDir();
  const sh={root, cwd:[], clock:T0, out:[], env:{}, git:gitNeuf()};
  sh.cwdNode=()=>{ let n=root; for(const p of sh.cwd) n=n.children[p]; return n; };
  if(setup) setup(sh);
  return sh;
}
function resolveDir(sh,parts){          // renvoie {dir,name} pour un chemin
  let n=sh.cwdNode(); let stack=sh.cwd.slice();
  if(parts[0]===''){ n=sh.root; stack=[]; parts=parts.slice(1); }
  for(let i=0;i<parts.length-1;i++){
    const p=parts[i];
    if(p===''||p==='.') continue;
    if(p==='..'){ stack.pop(); n=sh.root; for(const q of stack) n=n.children[q]; continue; }
    if(!n.children[p]||n.children[p].type!=='dir') return null;
    n=n.children[p]; stack.push(p);
  }
  return {dir:n, name:parts[parts.length-1], stack};
}
function lookup(sh,path){
  const r=resolveDir(sh,path.split('/'));
  if(!r) return null;
  if(r.name===''||r.name==='.') return r.dir;
  if(r.name==='..'){ const s=r.stack.slice(0,-1); let n=sh.root; for(const q of s) n=n.children[q]; return n; }
  return r.dir.children[r.name]||null;
}
function readTarget(sh,path){           // suit un symlink (1 niveau)
  let n=lookup(sh,path);
  if(n&&n.type==='link'){ const b=path.split('/').slice(0,-1).concat(n.target).join('/'); n=lookup(sh,b); }
  return n;
}

function run(sh,line){
  sh.clock+=60000;
  const raw=line.trim();
  if(!raw) return '';
  let toks=tokenize(raw,sh.env);
  // redirection
  let redir=null, rmode=null;
  const gi=toks.findIndex(t=>t==='>'||t==='>>');
  if(gi>=0){ rmode=toks[gi]; redir=toks[gi+1]; toks=toks.slice(0,gi); }
  // pipeline
  const segs=[[]];
  for(const t of toks){ if(t==='|') segs.push([]); else segs[segs.length-1].push(t); }
  let input=null, res={out:''};
  for(const seg of segs){
    if(!seg.length) return {err:"zsh: parse error near `|'"};
    try{ res=exec(sh,seg[0],seg.slice(1),input); }
    catch(e){ res={err:String(e.message||e)}; }
    if(res.err) return {err:res.err};
    input=res.out??'';
  }
  const text=res.out??'';
  if(redir){
    const r=resolveDir(sh,redir.split('/'));
    if(!r) return {err:redir+': No such file or directory'};
    const ex=r.dir.children[r.name];
    if(ex&&ex.type==='dir') return {err:'zsh: is a directory: '+redir};
    if(ex&&rmode==='>>') ex.content+=text;
    else if(ex){ ex.content=text; ex.mtime=sh.clock; }
    else r.dir.children[r.name]=Object.assign(fFile(text),{mtime:sh.clock});
    return {out:''};
  }
  return res;
}

function exec(sh,cmd,a,stdin){
  const cwd=sh.cwdNode();
  const O=t=>({out:t});
  const inText=(files)=>{
    if(files&&files.length){
      let t='';
      for(const p of files){
        const nd=readTarget(sh,p);
        if(!nd) return {err:cmd+': '+p+': No such file or directory'};
        if(nd.type==='dir') return {err:cmd+': '+p+': Is a directory'};
        t+=nd.content;
      }
      return {text:t};
    }
    return {text: stdin==null?'':stdin};
  };
  const splitLines=t=>{ const L=t.split('\n'); if(L[L.length-1]==='') L.pop(); return L; };
  const joinLines=L=>L.length?L.join('\n')+'\n':'';
  switch(cmd){

  case 'pwd': return O('/home/student'+(sh.cwd.length?'/'+sh.cwd.join('/'):'')+'\n');

  case 'clear': sh.out.length=0; return O('');

  case 'help': return O(
    'commandes simulées : ls, cd, pwd, cat, echo, touch, mkdir, rm, rmdir,\n'+
    'chmod, ln, wc, find, man, clear, export, env,\n'+
    'tr, cut, grep, head, tail, sort, uniq, rev, id.\n'+
    "outillage de rendu : git, norminette, cc.\n"+
    'redirections > et >> supportées. Tape la commande de la mission.\n');

  /* ---------- outillage du rendu ----------
     git, norminette et cc ne sont pas des commandes shell comme les autres :
     ce sont les trois portes par lesquelles un rendu passe ou échoue. Elles
     sont simulées assez fidèlement pour que les erreurs classiques se
     produisent vraiment, et pas seulement se lisent.
     Ce ne sont pas les vrais outils, et la page le dit. */

  case 'git':{
    const g=sh.git||(sh.git=gitNeuf());
    const nomsFichiers=()=>Object.keys(cwd.children||{})
      .filter(n=>(cwd.children[n]||{}).type==='file').sort();
    const dejaCommites=new Set(g.commits.flatMap(c=>c.fichiers));
    const sub=a[0];

    if(!sub) return {err:"usage: git <commande>\nles commandes utiles ici : status, add, commit, push, log"};

    if(sub==='status'){
      const suivis=new Set([...g.indexes, ...dejaCommites]);
      const nonSuivis=nomsFichiers().filter(n=>!suivis.has(n));
      const enAvance=g.commits.length-g.pousses;
      let t='Sur la branche master\n';
      if(enAvance>0) t+='Votre branche est en avance sur "origin/master" de '+enAvance+' commit(s).\n';
      if(g.indexes.length){
        t+='\nModifications qui seront validées :\n';
        for(const f of [...g.indexes].sort()) t+='\tnouveau fichier : '+f+'\n';
      }
      if(nonSuivis.length){
        t+='\nFichiers non suivis :\n';
        for(const f of nonSuivis) t+='\t'+f+'\n';
        t+='\nutilisez "git add <fichier>" pour inclure dans ce qui sera validé\n';
      }
      if(!g.indexes.length && !nonSuivis.length && enAvance===0)
        t+='rien à valider, la copie de travail est propre\n';
      return O(t);
    }

    if(sub==='add'){
      const cibles=a.slice(1);
      if(!cibles.length) return {err:'Rien de spécifié, rien d’ajouté.\nutilisez "git add ."'};
      const dispo=nomsFichiers();
      const ajoutes=[];
      for(const c of cibles){
        if(c==='.'||c==='-A'||c==='--all'){ for(const f of dispo) if(!g.indexes.includes(f)&&!dejaCommites.has(f)) { g.indexes.push(f); ajoutes.push(f); } }
        else if(dispo.includes(c)){ if(!g.indexes.includes(c)){ g.indexes.push(c); ajoutes.push(c); } }
        else return {err:"fatal: le chemin '"+c+"' ne correspond à aucun fichier"};
      }
      return O('');
    }

    if(sub==='commit'){
      const iM=a.indexOf('-m');
      if(iM<0||!a[iM+1])
        return {err:'Aborting commit due to empty commit message.\nutilisez : git commit -m "un message"'};
      if(!g.indexes.length)
        return {err:'Sur la branche master\nrien à valider (utilisez "git add")'};
      const msg=a[iM+1].replace(/^["']|["']$/g,'');
      const n=g.indexes.length;
      g.commits.push({msg, fichiers:[...g.indexes]});
      g.indexes.length=0;
      return O('[master '+('0000000'+g.commits.length).slice(-7)+'] '+msg+'\n '+
        n+' fichier(s) modifié(s)\n');
    }

    if(sub==='push'){
      const enAvance=g.commits.length-g.pousses;
      if(g.indexes.length&&enAvance===0)
        return {err:'Everything up-to-date\nTes fichiers sont ajoutés mais pas commités : git add ne suffit pas.'};
      if(enAvance===0) return O('Everything up-to-date\n');
      g.pousses=g.commits.length;
      /* Le nom réel du serveur de rendu n’apparaît nulle part : ce dépôt est
         public, et l’infrastructure interne de l’école n’a pas à y figurer.
         "origin" est de toute façon le nom que git affiche. */
      return O('Énumération des objets: '+(enAvance*3)+', fait.\n'+
        'To origin\n   0000000..'+('0000000'+g.commits.length).slice(-7)+'  master -> master\n');
    }

    if(sub==='log'){
      if(!g.commits.length) return {err:"fatal: votre branche actuelle 'master' n’a encore aucun commit"};
      let t='';
      for(let i=g.commits.length-1;i>=0;i--){
        const pousse=(i<g.pousses)?' (poussé)':' (PAS ENCORE POUSSÉ)';
        t+='commit '+('0000000'+(i+1)).slice(-7)+pousse+'\n\n    '+g.commits[i].msg+'\n\n';
      }
      return O(t);
    }

    return {err:"git: '"+sub+"' n’est pas une commande git simulée ici.\ndisponibles : status, add, commit, push, log"};
  }

  case 'norminette':{
    const cible=a.find(x=>!x.startsWith('-'));
    if(!cible) return {err:'usage: norminette <fichier.c>'};
    const nd=readTarget(sh,cible);
    if(!nd) return {err:'norminette: '+cible+': No such file or directory'};
    if(nd.type==='dir') return {err:'norminette: '+cible+': Is a directory'};
    if(!/\.[ch]$/.test(cible)) return {err:'norminette: '+cible+': fichier ignoré, seuls .c et .h sont vérifiés'};

    const lignes=nd.content.split('\n');
    const erreurs=[];
    /* L'en-tête 42 : norminette le réclame avant tout le reste, et un fichier
       sans en-tête est refusé même si le code est parfait. */
    if(!/^\/\* \*{74} \*\/$/.test(lignes[0]||''))
      erreurs.push('Error: INVALID_HEADER      (line   1): en-tête 42 manquant ou mal formé');
    lignes.forEach((l,i)=>{
      if(l.length>80) erreurs.push('Error: LINE_TOO_LONG      (line '+String(i+1).padStart(3)+'): ligne de '+l.length+' colonnes, maximum 80');
      if(/^ +\S/.test(l)) erreurs.push('Error: SPACE_REPLACE_TAB  (line '+String(i+1).padStart(3)+'): indentation avec des espaces, il faut des tabulations');
      if(/ $/.test(l)&&l.trim()) erreurs.push('Error: SPC_BEFORE_NL      (line '+String(i+1).padStart(3)+'): espace en fin de ligne');
    });
    if(nd.content.includes('\r'))
      erreurs.push('Error: (fichier): retours chariot Windows (CRLF), il faut des fins de ligne Unix');

    if(!erreurs.length) return O(cible+': OK!\n');
    return O(cible+': Error!\n'+erreurs.slice(0,8).join('\n')+'\n');
  }

  case 'cc':
  case 'gcc':{
    const sources=a.filter(x=>/\.c$/.test(x));
    if(!sources.length)
      return {err:cmd+': fatal error: no input files\n'+
        'exemple : '+cmd+' -Wall -Wextra -Werror fichier.c -o prog'};
    for(const s of sources){
      const nd=readTarget(sh,s);
      if(!nd) return {err:cmd+': error: '+s+': No such file or directory'};
    }
    const manquants=['-Wall','-Wextra','-Werror'].filter(f=>!a.includes(f));
    let avertissement='';
    if(manquants.length)
      avertissement='note: la Moulinette compile avec -Wall -Wextra -Werror. Il te manque : '+
        manquants.join(' ')+'\n';

    /* Sans main, l’éditeur de liens échoue. C’est LA différence entre un
       exercice de projet (interdit d’avoir un main) et un exercice
       d’examen (il en faut un), et le message est le même dans les deux cas. */
    const aMain=sources.some(s=>{
      const nd=readTarget(sh,s);
      return nd && /^[ \t]*int[ \t]+main[ \t]*\(/m.test(nd.content);
    });
    if(!aMain&&!a.includes('-c'))
      return {err:avertissement+'/usr/bin/ld: dans la fonction « _start » :\n'+
        'undefined reference to `main’\ncollect2: error: ld returned 1 exit status\n'+
        '→ aucun main dans ce qui est compilé. Pour tester une fonction de projet,\n'+
        '  écris un main de test à part, ou compile avec -c pour ne pas lier.'};

    const iO=a.indexOf('-o');
    const sortie=(iO>=0&&a[iO+1])?a[iO+1]:'a.out';
    const r=resolveDir(sh,sortie.split('/'));
    if(r&&r.dir) r.dir.children[r.name]=Object.assign(fFile(''),{mtime:sh.clock,mode:0o755});
    return O(avertissement);
  }

  case 'man':{
    const p=a[0];
    const M={
      ls:'LS(1)\n  -a  n\'ignore pas les entrées commençant par un point\n  -l  format long\n  -t  trie par date de modification, plus récent d\'abord\n  -m  liste séparée par des virgules\n  -p  ajoute / aux répertoires\n  -F  ajoute un indicateur (*/=>@|) aux entrées\n  -i  affiche le numéro d\'inode\n',
      chmod:'CHMOD(1)\n  chmod MODE FICHIER...\n  MODE octal : chiffre par groupe (propriétaire, groupe, autres)\n  r=4  w=2  x=1, on additionne.\n',
      ln:'LN(1)\n  ln CIBLE NOM        crée un lien dur\n  ln -s CIBLE NOM     crée un lien symbolique\n',
      find:'FIND(1)\n  find CHEMIN EXPRESSION\n  -type f|d     restreint au type\n  -name MOTIF   filtre sur le nom\n  -o            OU logique\n  \\( \\)          groupe une expression\n  -print        affiche le chemin\n  -delete       supprime le fichier trouvé\n',
      cat:'CAT(1)\n  -e  affiche $ en fin de ligne (implique -v)\n  sans fichier, cat lit l\'entrée standard\n',
      tr:'TR(1)\n  tr SET1 SET2   remplace chaque caractère de SET1 par celui de SET2\n  tr -d SET      supprime les caractères de SET\n  tr lit toujours l\'entrée standard : branche-le avec un pipe.\n',
      cut:'CUT(1)\n  -d DELIM   caractère séparateur de champs\n  -f LISTE   champs à garder (1, ou 1,3)\n',
      grep:'GREP(1)\n  grep MOTIF [FICHIER]\n  -v  garde les lignes qui NE correspondent PAS\n  -i  ignore la casse\n  -c  affiche seulement le nombre de lignes\n',
      wc:'WC(1)\n  -l  compte les lignes\n  -w  compte les mots\n  -c  compte les octets\n',
      sort:'SORT(1)\n  sort [FICHIER]   trie les lignes par ordre alphabétique\n  -r  ordre inverse\n',
      head:'HEAD(1)\n  -n N   affiche les N premières lignes (10 par défaut)\n',
      tail:'TAIL(1)\n  -n N   affiche les N dernières lignes (10 par défaut)\n',
      rev:'REV(1)\n  rev   inverse l\'ordre des caractères de chaque ligne.\n  Attention : il n\'inverse pas l\'ordre des lignes.\n',
      id:'ID(1)\n  id [UTILISATEUR]\n  -G  affiche uniquement les identifiants de groupe\n  -n  affiche des noms au lieu de nombres\n  Les options se combinent.\n'
    };
    if(!p) return {err:'Quelle page de manuel voulez-vous ?'};
    return M[p]?O(M[p]):{err:'Aucune entrée de manuel pour '+p};
  }

  case 'cd':{
    const t=a[0]||'~';
    if(t==='~'||t==='/'){ sh.cwd=[]; return O(''); }
    const parts=t.split('/');
    let stack=sh.cwd.slice();
    for(const p of parts){
      if(p===''||p==='.') continue;
      if(p==='..'){ stack.pop(); continue; }
      let n=sh.root; for(const q of stack) n=n.children[q];
      const nx=n.children[p];
      if(!nx) return {err:'cd: no such file or directory: '+t};
      if(nx.type!=='dir') return {err:'cd: not a directory: '+t};
      if(!((nx.mode>>6)&1)) return {err:'cd: permission denied: '+t};
      stack.push(p);
    }
    sh.cwd=stack; return O('');
  }

  case 'ls':{
    const fl=new Set(); const paths=[];
    a.forEach(x=>{ if(x.startsWith('-')&&x.length>1) x.slice(1).split('').forEach(c=>fl.add(c)); else paths.push(x); });
    let dir=cwd, prefix='';
    if(paths.length){
      const n=lookup(sh,paths[0]);
      if(!n) return {err:'ls: cannot access \''+paths[0]+'\': No such file or directory'};
      if(n.type==='dir'){ dir=n; prefix=paths[0]+':\n'; if(paths.length===1) prefix=''; }
      else{ return O(fl.has('l')?longLine(sh,paths[0],n,fl)+'\n':paths[0]+'\n'); }
    }
    if(!((dir.mode>>6)&4)) return {err:'ls: Permission denied'};
    let names=Object.keys(dir.children);
    if(!fl.has('a')) names=names.filter(n=>!n.startsWith('.'));
    names.sort();
    if(fl.has('t')) names.sort((x,y)=>dir.children[y].mtime-dir.children[x].mtime);
    if(fl.has('a')) names=['.','..'].concat(names);
    const deco=n=>{
      const nd=n==='.'?dir:n==='..'?dir:dir.children[n];
      let s=n;
      if(fl.has('p')&&nd.type==='dir') s+='/';
      else if(fl.has('F')){
        if(nd.type==='dir') s+='/';
        else if(nd.type==='link') s+='@';
        else if(nd.mode&0o111) s+='*';
      }
      return s;
    };
    if(fl.has('l')){
      let t='total '+names.length*4+'\n';
      for(const n of names){
        if(n==='.'||n==='..'){ t+=longLine(sh,n,dir,fl)+'\n'; continue; }
        t+=longLine(sh,deco(n),dir.children[n],fl)+'\n';
      }
      return O(t);
    }
    if(fl.has('m')) return O(names.map(deco).join(', ')+'\n');
    if(fl.has('i')) return O(names.map(n=>(n==='.'||n==='..'?dir.ino:dir.children[n].ino)+' '+deco(n)).join('  ')+'\n');
    return O(names.map(deco).join('  ')+(names.length?'\n':''));
  }

  case 'cat':{
    const e=a.includes('-e'); const f=a.filter(x=>!x.startsWith('-'));
    if(!f.length){
      if(stdin==null) return {err:'cat: usage: cat [-e] fichier'};
      return O(e ? stdin.replace(/\n/g,'$\n') : stdin);
    }
    let t='';
    for(const p of f){
      const n=readTarget(sh,p);
      if(!n) return {err:'cat: '+p+': No such file or directory'};
      if(n.type==='dir') return {err:'cat: '+p+': Is a directory'};
      if(!((n.mode>>6)&4)) return {err:'cat: '+p+': Permission denied'};
      t+= e ? n.content.replace(/\n/g,'$\n') : n.content;
    }
    return O(t);
  }

  case 'echo':{
    const s=a.join(' ');
    return O(s+'\n');
  }

  case 'wc':{
    const f=a.filter(x=>!x.startsWith('-'));
    const mode = a.includes('-c')?'c' : a.includes('-w')?'w' : a.includes('-l')?'l' : null;
    const count=t=> mode==='c'? t.length
                  : mode==='w'? (t.trim()===''?0:t.trim().split(/\s+/).length)
                  : splitLines(t).length;
    if(!f.length){
      const r=inText([]); if(r.err) return {err:r.err};
      if(!mode) return O('      '+splitLines(r.text).length+'       '+
        (r.text.trim()===''?0:r.text.trim().split(/\s+/).length)+'      '+r.text.length+'\n');
      return O(count(r.text)+'\n');
    }
    let t='';
    for(const p of f){
      const n=readTarget(sh,p);
      if(!n) return {err:'wc: '+p+': No such file or directory'};
      t+=(mode?count(n.content):splitLines(n.content).length)+' '+p+'\n';
    }
    return O(t);
  }

  case 'touch':{
    let time=null; const f=[];
    for(let i=0;i<a.length;i++){
      if(a[i]==='-t'){ const v=a[++i];
        const m=/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(v||'');
        if(!m) return {err:"touch: invalid date format '"+v+"'"};
        time=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]); continue; }
      if(a[i]==='-h') continue;
      if(a[i].startsWith('-')) continue;
      f.push(a[i]);
    }
    if(!f.length) return {err:'touch: missing file operand'};
    for(const p of f){
      const r=resolveDir(sh,p.split('/'));
      if(!r) return {err:'touch: cannot touch \''+p+'\': No such file or directory'};
      const ex=r.dir.children[r.name];
      if(ex) ex.mtime=time??sh.clock;
      else r.dir.children[r.name]=Object.assign(fFile(''),{mtime:time??sh.clock});
    }
    return O('');
  }

  case 'mkdir':{
    const f=a.filter(x=>!x.startsWith('-'));
    const p_=a.includes('-p');
    if(!f.length) return {err:'mkdir: missing operand'};
    for(const p of f){
      const parts=p.split('/');
      let n=cwd;
      for(let i=0;i<parts.length;i++){
        const seg=parts[i];
        if(!seg||seg==='.') continue;
        if(!n.children[seg]){
          if(i<parts.length-1&&!p_) return {err:'mkdir: cannot create directory \''+p+'\': No such file or directory'};
          n.children[seg]=Object.assign(fDir(),{mtime:sh.clock});
        } else if(i===parts.length-1&&!p_) return {err:'mkdir: cannot create directory \''+p+'\': File exists'};
        n=n.children[seg];
      }
    }
    return O('');
  }

  case 'rmdir':{
    for(const p of a){
      const r=resolveDir(sh,p.split('/'));
      const n=r&&r.dir.children[r.name];
      if(!n) return {err:'rmdir: failed to remove \''+p+'\': No such file or directory'};
      if(n.type!=='dir') return {err:'rmdir: failed to remove \''+p+'\': Not a directory'};
      if(Object.keys(n.children).length) return {err:'rmdir: failed to remove \''+p+'\': Directory not empty'};
      delete r.dir.children[r.name];
    }
    return O('');
  }

  case 'rm':{
    const rf=a.some(x=>/^-[rf]+$/.test(x));
    const f=a.filter(x=>!x.startsWith('-'));
    if(!f.length) return {err:'rm: missing operand'};
    for(const p of f){
      const r=resolveDir(sh,p.split('/'));
      const n=r&&r.dir.children[r.name];
      if(!n) return {err:'rm: cannot remove \''+p+'\': No such file or directory'};
      if(n.type==='dir'&&!rf) return {err:'rm: cannot remove \''+p+'\': Is a directory'};
      delete r.dir.children[r.name];
    }
    return O('');
  }

  case 'chmod':{
    const f=a.filter(x=>!x.startsWith('-'));
    if(f.length<2) return {err:'chmod: missing operand'};
    const m=f[0];
    if(!/^[0-7]{3,4}$/.test(m)) return {err:'chmod: invalid mode: \''+m+'\' (utilise 3 chiffres octaux)'};
    for(const p of f.slice(1)){
      const n=lookup(sh,p);
      if(!n) return {err:'chmod: cannot access \''+p+'\': No such file or directory'};
      if(n.type==='link') continue;
      n.mode=parseInt(m.slice(-3),8);
    }
    return O('');
  }

  case 'ln':{
    const s=a.includes('-s');
    const f=a.filter(x=>!x.startsWith('-'));
    if(f.length<2) return {err:'ln: missing file operand'};
    const [target,name]=f;
    const r=resolveDir(sh,name.split('/'));
    if(!r) return {err:'ln: failed to create link \''+name+'\''};
    if(r.dir.children[r.name]) return {err:'ln: failed to create link \''+name+'\': File exists'};
    if(s){ r.dir.children[r.name]=Object.assign(fLink(target),{mtime:sh.clock}); return O(''); }
    const t=lookup(sh,target);
    if(!t) return {err:'ln: failed to access \''+target+'\': No such file or directory'};
    if(t.type==='dir') return {err:'ln: '+target+': hard link not allowed for directory'};
    r.dir.children[r.name]=t;                 // même objet => même inode
    return O('');
  }

  case 'find': return doFind(sh,a);


  case 'export':{
    for(const x of a){ const i=x.indexOf('='); if(i>0) sh.env[x.slice(0,i)]=x.slice(i+1); }
    return O('');
  }
  case 'unset': for(const x of a) delete sh.env[x]; return O('');
  case 'env': {
    const k=Object.keys(sh.env);
    return O(k.length? k.map(x=>x+'='+sh.env[x]).join('\n')+'\n' : '');
  }

  case 'tr':{
    const del=a.includes('-d');
    const f=a.filter(x=>!(x.length>1&&x.startsWith('-')));
    const r=inText([]); if(r.err) return {err:r.err};
    if(stdin==null) return {err:'tr: tr lit l\'entrée standard, branche-le avec un pipe'};
    if(del){
      const set=new Set(expandSet(f[0]||''));
      return O([...r.text].filter(c=>!set.has(c)).join(''));
    }
    if(f.length<2) return {err:'tr: usage: tr SET1 SET2  (ou tr -d SET)'};
    const s1=expandSet(f[0]), s2=expandSet(f[1]);
    return O([...r.text].map(c=>{ const i=s1.indexOf(c);
      return i<0?c:(s2[Math.min(i,s2.length-1)]||c); }).join(''));
  }

  case 'cut':{
    let d='\t', fields=null; const files=[];
    for(let i=0;i<a.length;i++){
      const x=a[i];
      if(x==='-d'){ d=a[++i]; continue; }
      if(x.startsWith('-d')&&x.length>2){ d=x.slice(2); continue; }
      if(x==='-f'){ fields=a[++i]; continue; }
      if(x.startsWith('-f')&&x.length>2){ fields=x.slice(2); continue; }
      if(x.startsWith('-')) continue;
      files.push(x);
    }
    if(!fields) return {err:'cut: précise les champs avec -f'};
    const r=inText(files); if(r.err) return {err:r.err};
    const idx=fields.split(',').map(x=>parseInt(x,10));
    return O(joinLines(splitLines(r.text).map(L=>{
      const parts=L.split(d);
      return idx.map(i=>parts[i-1]===undefined?'':parts[i-1]).join(d);
    })));
  }

  case 'grep':{
    let inv=false,ci=false,cnt=false; const rest=[];
    a.forEach(x=>{ if(x.startsWith('-')&&x.length>1)
        x.slice(1).split('').forEach(c=>{ if(c==='v')inv=true; if(c==='i')ci=true; if(c==='c')cnt=true; });
      else rest.push(x); });
    const pat=rest.shift();
    if(pat===undefined) return {err:'grep: usage: grep MOTIF [fichier]'};
    const r=inText(rest); if(r.err) return {err:r.err};
    let re; try{ re=new RegExp(pat, ci?'i':''); }catch(e){ return {err:'grep: motif invalide'}; }
    const keep=splitLines(r.text).filter(L=>re.test(L)!==inv);
    return cnt? O(keep.length+'\n') : O(joinLines(keep));
  }

  case 'head': case 'tail':{
    let n=10; const files=[];
    for(let i=0;i<a.length;i++){ const x=a[i];
      if(x==='-n'){ n=parseInt(a[++i],10); continue; }
      if(/^-\d+$/.test(x)){ n=parseInt(x.slice(1),10); continue; }
      if(x.startsWith('-')) continue;
      files.push(x); }
    const r=inText(files); if(r.err) return {err:r.err};
    const L=splitLines(r.text);
    return O(joinLines(cmd==='head'? L.slice(0,n) : L.slice(-n)));
  }

  case 'sort':{
    const rv=a.includes('-r'); const files=a.filter(x=>!x.startsWith('-'));
    const r=inText(files); if(r.err) return {err:r.err};
    const L=splitLines(r.text).sort();
    if(rv) L.reverse();
    return O(joinLines(L));
  }

  case 'uniq':{
    const files=a.filter(x=>!x.startsWith('-'));
    const r=inText(files); if(r.err) return {err:r.err};
    const out=[]; let prev=null;
    for(const L of splitLines(r.text)){ if(L!==prev) out.push(L); prev=L; }
    return O(joinLines(out));
  }

  case 'rev':{
    const files=a.filter(x=>!x.startsWith('-'));
    const r=inText(files); if(r.err) return {err:r.err};
    return O(joinLines(splitLines(r.text).map(L=>[...L].reverse().join(''))));
  }

  case 'id':{
    const DB={ student:['student','adm','sudo'], daemon:['daemon','bin'],
               marvin:['marvin','users','games'], bocal:['bocal','adm','cdrom','sudo','dip'] };
    let gOnly=false,names=false; const rest=[];
    a.forEach(x=>{ if(x.startsWith('-')&&x.length>1)
        x.slice(1).split('').forEach(c=>{ if(c==='G')gOnly=true; if(c==='n')names=true; });
      else rest.push(x); });
    const u=rest[0]||'student';
    const g=DB[u];
    if(!g) return {err:'id: \''+u+'\': no such user'};
    if(gOnly&&names) return O(g.join(' ')+'\n');
    if(gOnly) return O(g.map((_,i)=>1000+i).join(' ')+'\n');
    if(names) return O(u+'\n');
    return O('uid=1000('+u+') gid=1000('+g[0]+') groups='+
             g.map((x,i)=>(1000+i)+'('+x+')').join(',')+'\n');
  }

  default: return {err:'zsh: command not found: '+cmd};
  }
}

function longLine(sh,disp,n,fl){
  const nm = n.type==='link' ? disp+' -> '+n.target : disp;
  const ino = fl&&fl.has('i') ? n.ino+' ' : '';
  return ino+modeStr(n)+' '+nlink(sh.root,n)+' student piscine '+
         String(sizeOf(n)).padStart(4,' ')+' '+fmtTime(n.mtime)+' '+nm;
}

function doFind(sh,a){
  let i=0; let start='.';
  if(a[i]&&!a[i].startsWith('-')&&!/^\\?\($/.test(a[i])){ start=a[i]; i++; }
  const toks=a.slice(i).map(t=>t.replace(/^\\/,''));
  if(!toks.length) toks.push('-print');
  let hasAction=toks.some(t=>t==='-print'||t==='-delete');
  const startNode=lookup(sh,start);
  if(!startNode) return {err:'find: \''+start+'\': No such file or directory'};

  const out=[]; const dels=[];
  let pos=0;
  function parseOr(){ const l=[parseAnd()]; while(toks[pos]==='-o'){ pos++; l.push(parseAnd()); } 
    return ctx=>l.some(f=>f(ctx)); }
  function parseAnd(){ const l=[]; 
    while(pos<toks.length&&toks[pos]!=='-o'&&toks[pos]!==')') l.push(parsePrim());
    return ctx=>{ for(const f of l) if(!f(ctx)) return false; return true; }; }
  function parsePrim(){
    const t=toks[pos++];
    if(t==='('){ const e=parseOr(); if(toks[pos]===')') pos++; return e; }
    if(t==='-name'){ const re=globRe(toks[pos++]); return c=>re.test(c.name); }
    if(t==='-type'){ const k=toks[pos++]; return c=>(k==='f'&&c.node.type==='file')||(k==='d'&&c.node.type==='dir')||(k==='l'&&c.node.type==='link'); }
    if(t==='-print'){ return c=>{ out.push(c.path); return true; }; }
    if(t==='-delete'){ return c=>{ dels.push(c); return true; }; }
    if(t==='-maxdepth'){ pos++; return ()=>true; }
    throw new Error('find: unknown predicate `'+t+"'");
  }
  let expr;
  try{ expr=parseOr(); }catch(e){ return {err:String(e.message)}; }
  if(!hasAction){ const inner=expr; expr=c=>{ if(inner(c)){ out.push(c.path); return true; } return false; }; }

  (function walk(node,path,parent,name){
    expr({node,path,name:name??'.',parent});
    if(node.type==='dir') for(const k of Object.keys(node.children).sort())
      walk(node.children[k], path+'/'+k, node, k);
  })(startNode,start,null,start.split('/').pop());

  for(const d of dels) if(d.parent) delete d.parent.children[d.name];
  return {out: out.length? out.join('\n')+'\n' : ''};
}

function newShellFrom(sh){
  const clone=JSON.parse(JSON.stringify({root:sh.root,cwd:sh.cwd,clock:sh.clock,env:sh.env||{},
    git:sh.git||gitNeuf()}));
  const s={root:clone.root,cwd:clone.cwd,clock:clone.clock,out:[],env:clone.env,git:clone.git};
  s.cwdNode=()=>{ let n=s.root; for(const p of s.cwd) n=n.children[p]; return n; };
  return s;
}
