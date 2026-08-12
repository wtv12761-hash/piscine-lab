/* Interpréteur C : lexer, parseur récursif descendant, évaluateur sur une
   mémoire plate. Extrait de c00.html lors de la bascule vers les sources. */

/* ============================================================
   Mini-C : lexer + parser + interpréteur, sous-ensemble du C
   suffisant pour la Piscine (write, boucles, pointeurs, tableaux).
   ============================================================ */

/* ---------------- lexer ---------------- */
const KW = new Set(['int','char','void','if','else','while','for','return','unsigned','long','short','const','break','continue']);
function lex(src){
  const t=[]; let i=0;
  const push=(k,v)=>t.push({k,v,pos:i});
  while(i<src.length){
    const c=src[i];
    if(c==='/'&&src[i+1]==='/'){ while(i<src.length&&src[i]!=='\n') i++; continue; }
    if(c==='/'&&src[i+1]==='*'){ i+=2; while(i<src.length&&!(src[i]==='*'&&src[i+1]==='/')) i++; i+=2; continue; }
    if(/\s/.test(c)){ i++; continue; }
    if(/[0-9]/.test(c)){ let s=''; while(i<src.length&&/[0-9]/.test(src[i])) s+=src[i++];
      t.push({k:'num',v:parseInt(s,10)}); continue; }
    if(/[A-Za-z_]/.test(c)){ let s=''; while(i<src.length&&/[A-Za-z0-9_]/.test(src[i])) s+=src[i++];
      t.push({k:KW.has(s)?s:'id',v:s}); continue; }
    if(c==="'"){ i++; let v;
      if(src[i]==='\\'){ i++; const e=src[i++]; v={n:10,t:9,r:13,'0':0,'\\':92,"'":39,'"':34}[e];
        if(v===undefined) v=e.charCodeAt(0); }
      else v=src.charCodeAt(i++);
      if(src[i]!=="'") throw new Error("littéral caractère mal fermé");
      i++; t.push({k:'num',v}); continue; }
    if(c==='"'){ i++; let s='';
      while(i<src.length&&src[i]!=='"'){
        if(src[i]==='\\'){ i++; const e=src[i++];
          s+= ({n:'\n',t:'\t',r:'\r','0':'\0','\\':'\\','"':'"'})[e] ?? e; }
        else s+=src[i++]; }
      if(src[i]!=='"') throw new Error('chaîne non fermée');
      i++; t.push({k:'str',v:s}); continue; }
    const three=src.substr(i,3), two=src.substr(i,2);
    if(['<<=','>>='].includes(three)){ t.push({k:three}); i+=3; continue; }
    if(['==','!=','<=','>=','&&','||','++','--','+=','-=','*=','/=','%='].includes(two)){
      t.push({k:two}); i+=2; continue; }
    if('+-*/%=<>!&|(){}[];,?:'.includes(c)){ t.push({k:c}); i++; continue; }
    throw new Error('caractère inattendu : '+c);
  }
  t.push({k:'eof'});
  return t;
}

/* ---------------- parser ---------------- */
function parse(src){
  const t=lex(src); let p=0;
  const peek=(o=0)=>t[p+o];
  const at=k=>t[p].k===k;
  const eat=k=>{ if(t[p].k!==k) throw new Error("attendu '"+k+"' mais trouvé '"+(t[p].v??t[p].k)+"'"); return t[p++]; };
  const isType=()=>['int','char','void','unsigned','long','short','const'].includes(t[p].k);

  function type(){
    let base='int';
    while(isType()){ const k=eat(t[p].k).k; if(k==='int'||k==='char'||k==='void') base=k; }
    let stars=0; while(at('*')){ eat('*'); stars++; }
    return {base,stars};
  }
  function program(){
    const fns={}, globals=[];
    while(!at('eof')){
      const ty=type();
      const name=eat('id').v;
      if(at('(')){
        eat('('); const params=[];
        if(at('void')&&peek(1).k===')') eat('void');
        else if(!at(')')){
          do{ const pt=type(); const pn=eat('id').v;
              if(at('[')){ eat('['); if(!at(']')) expr(); eat(']'); pt.stars++; }
              params.push({name:pn,type:pt}); } while(at(',')&&eat(','));
        }
        eat(')');
        if(at(';')){ eat(';'); continue; }          // prototype
        fns[name]={name,ret:ty,params,body:block()};
      } else {
        globals.push(...declTail(ty,name)); eat(';');
      }
    }
    return {fns,globals};
  }
  function declTail(ty,name){
    const out=[];
    for(;;){
      let size=null, init=null;
      if(at('[')){ eat('['); size = at(']')?null:expr(); eat(']'); }
      if(at('=')){ eat('=');
        if(at('{')){ eat('{'); const items=[]; if(!at('}')) do{ items.push(expr()); } while(at(',')&&eat(',')); eat('}');
          init={kind:'initlist',items}; }
        else init=expr(); }
      out.push({kind:'decl',type:ty,name,size,init});
      if(at(',')){ eat(','); let s2=0; while(at('*')){eat('*');s2++;}
        name=eat('id').v; ty={base:ty.base,stars:s2}; continue; }
      break;
    }
    return out;
  }
  function block(){ eat('{'); const body=[]; while(!at('}')) body.push(stmt()); eat('}'); return {kind:'block',body}; }
  function stmt(){
    if(at('{')) return block();
    if(at(';')){ eat(';'); return {kind:'empty'}; }
    if(at('if')){ eat('if'); eat('('); const c=expr(); eat(')'); const a=stmt();
      let b=null; if(at('else')){ eat('else'); b=stmt(); } return {kind:'if',c,a,b}; }
    if(at('while')){ eat('while'); eat('('); const c=expr(); eat(')'); return {kind:'while',c,body:stmt()}; }
    if(at('for')){ eat('for'); eat('(');
      let init=null;
      if(!at(';')){ if(isType()){ const ty=type(); const nm=eat('id').v; init={kind:'decls',body:declTail(ty,nm)}; }
                    else init={kind:'expr',e:expr()}; }
      eat(';');
      const c = at(';')?null:expr(); eat(';');
      const step = at(')')?null:expr(); eat(')');
      return {kind:'for',init,c,step,body:stmt()}; }
    if(at('return')){ eat('return'); const e= at(';')?null:expr(); eat(';'); return {kind:'return',e}; }
    if(at('break')){ eat('break'); eat(';'); return {kind:'break'}; }
    if(at('continue')){ eat('continue'); eat(';'); return {kind:'continue'}; }
    if(isType()){ const ty=type(); const nm=eat('id').v; const d=declTail(ty,nm); eat(';');
      return {kind:'decls',body:d}; }
    const e=expr(); eat(';'); return {kind:'expr',e};
  }

  // expressions
  function expr(){ return assign(); }
  function assign(){
    const left=ternary();
    if(at('=')){ eat('='); return {kind:'assign',t:left,v:assign()}; }
    for(const op of ['+=','-=','*=','/=','%=']){
      if(at(op)){ eat(op); return {kind:'assign',t:left,v:{kind:'bin',op:op[0],l:left,r:assign()}}; }
    }
    return left;
  }
  function ternary(){
    const c=logor();
    if(at('?')){ eat('?'); const a=assign(); eat(':'); const b=assign(); return {kind:'ter',c,a,b}; }
    return c;
  }
  function bin(next,ops){
    return function(){ let l=next();
      for(;;){ const op=ops.find(o=>at(o)); if(!op) return l; eat(op); l={kind:'bin',op,l,r:next()}; } };
  }
  const equality = bin(()=>rel(), ['==','!=']);
  const logand   = bin(()=>equality(), ['&&']);
  const logor    = bin(()=>logand(), ['||']);
  function rel(){ let l=add();
    for(;;){ const op=['<','>','<=','>='].find(o=>at(o)); if(!op) return l; eat(op); l={kind:'bin',op,l,r:add()}; } }
  function add(){ let l=mul();
    for(;;){ const op=['+','-'].find(o=>at(o)); if(!op) return l; eat(op); l={kind:'bin',op,l,r:mul()}; } }
  function mul(){ let l=unary();
    for(;;){ const op=['*','/','%'].find(o=>at(o)); if(!op) return l; eat(op); l={kind:'bin',op,l,r:unary()}; } }
  function unary(){
    if(at('-')){ eat('-'); return {kind:'neg',e:unary()}; }
    if(at('+')){ eat('+'); return unary(); }
    if(at('!')){ eat('!'); return {kind:'not',e:unary()}; }
    if(at('*')){ eat('*'); return {kind:'deref',e:unary()}; }
    if(at('&')){ eat('&'); return {kind:'addr',e:unary()}; }
    if(at('++')||at('--')){ const op=t[p++].k; return {kind:'pre',op,e:unary()}; }
    if(at('(')&&['int','char','void','unsigned','long','short'].includes(peek(1).k)){
      eat('('); type(); eat(')'); return unary(); }   // cast ignoré
    return postfix();
  }
  function postfix(){
    let e=prim();
    for(;;){
      if(at('[')){ eat('['); const idx=expr(); eat(']'); e={kind:'index',a:e,i:idx}; continue; }
      if(at('(')){ eat('('); const args=[]; if(!at(')')) do{ args.push(assign()); } while(at(',')&&eat(','));
        eat(')'); e={kind:'call',name:e.name,args}; continue; }
      if(at('++')||at('--')){ const op=t[p++].k; e={kind:'post',op,e}; continue; }
      return e;
    }
  }
  function prim(){
    if(at('num')) return {kind:'num',v:eat('num').v};
    if(at('str')) return {kind:'str',v:eat('str').v};
    if(at('id'))  return {kind:'var',name:eat('id').v};
    if(at('(')){ eat('('); const e=expr(); eat(')'); return e; }
    throw new Error("expression inattendue près de '"+(t[p].v??t[p].k)+"'");
  }
  return program();
}

/* ---------------- interpréteur ---------------- */
const MEMSIZE=8192;
class Ret { constructor(v){ this.v=v; } }
const BRK={brk:1}, CNT={cnt:1};

function interpret(ast, entry, args, limit){
  const mem=new Int32Array(MEMSIZE);
  let hp=16;                                   // 0..15 réservés (NULL)
  const alloc=n=>{ if(hp+n>=MEMSIZE) throw new Error('mémoire épuisée'); const a=hp; hp+=n; return a; };
  let out='';
  let steps=0; const MAX=limit||3000000;
  const tick=()=>{ if(++steps>MAX) throw new Error('trop d\'opérations : boucle infinie ?'); };

  const scopes=[new Map()];
  const findVar=n=>{ for(let i=scopes.length-1;i>=0;i--) if(scopes[i].has(n)) return scopes[i].get(n);
    throw new Error("variable inconnue : '"+n+"'"); };

  function declare(d){
    if(d.size!==null&&d.size!==undefined){
      const n=ev(d.size);
      const base=alloc(n);
      const slot=alloc(1); mem[slot]=base;
      scopes[scopes.length-1].set(d.name,{addr:slot,arr:true});
      if(d.init&&d.init.kind==='initlist') d.init.items.forEach((it,i)=>{ mem[base+i]=ev(it); });
      return;
    }
    const slot=alloc(1);
    scopes[scopes.length-1].set(d.name,{addr:slot});
    if(d.init){
      if(d.init.kind==='initlist'){
        const base=alloc(d.init.items.length); mem[slot]=base;
        d.init.items.forEach((it,i)=>{ mem[base+i]=ev(it); });
      } else mem[slot]=ev(d.init);
    } else mem[slot]=0;
  }
  function lval(e){
    if(e.kind==='var'){ const v=findVar(e.name); return v.addr; }
    if(e.kind==='deref'){ const a=ev(e.e);
      if(a<=0) throw new Error('écriture via un pointeur nul'); return a; }
    if(e.kind==='index'){ const a=ev(e.a)+ev(e.i);
      if(a<=0) throw new Error('accès hors mémoire (index invalide)'); return a; }
    throw new Error('cible d\'affectation invalide');
  }
  function ev(e){
    tick();
    switch(e.kind){
      case 'num': return e.v|0;
      case 'str': { const b=alloc(e.v.length+1);
        for(let i=0;i<e.v.length;i++) mem[b+i]=e.v.charCodeAt(i);
        mem[b+e.v.length]=0; return b; }
      case 'var': { const v=findVar(e.name); return mem[v.addr]|0; }
      case 'index': return mem[ev(e.a)+ev(e.i)]|0;
      case 'deref': { const a=ev(e.e); if(a<=0) throw new Error('déréférencement d\'un pointeur nul'); return mem[a]|0; }
      case 'addr': return lval(e.e);
      case 'neg': return (-ev(e.e))|0;
      case 'not': return ev(e.e)?0:1;
      case 'ter': return ev(e.c)?ev(e.a):ev(e.b);
      case 'assign': { const a=lval(e.t); const v=ev(e.v)|0; mem[a]=v; return v; }
      case 'pre': { const a=lval(e.e); mem[a]=(mem[a]+(e.op==='++'?1:-1))|0; return mem[a]|0; }
      case 'post': { const a=lval(e.e); const old=mem[a]|0; mem[a]=(old+(e.op==='++'?1:-1))|0; return old; }
      case 'bin': {
        if(e.op==='&&') return ev(e.l)? (ev(e.r)?1:0) : 0;
        if(e.op==='||') return ev(e.l)?1:(ev(e.r)?1:0);
        const l=ev(e.l), r=ev(e.r);
        switch(e.op){
          case '+': return (l+r)|0; case '-': return (l-r)|0; case '*': return Math.imul(l,r);
          case '/': if(r===0) throw new Error('division par zéro'); return (l/r)|0;
          case '%': if(r===0) throw new Error('modulo par zéro'); return (l%r)|0;
          case '<': return l<r?1:0; case '>': return l>r?1:0;
          case '<=': return l<=r?1:0; case '>=': return l>=r?1:0;
          case '==': return l===r?1:0; case '!=': return l!==r?1:0;
        }
        throw new Error('opérateur inconnu '+e.op);
      }
      case 'call': return call(e.name, e.args.map(ev));
    }
    throw new Error('expression non supportée');
  }
  function call(name,vals){
    tick();
    if(name==='write'){
      const [fd,ptr,len]=vals;
      let s=''; for(let i=0;i<len;i++) s+=String.fromCharCode(mem[ptr+i]&255);
      out+=s; return len;
    }
    if(name==='__putnbr'){ out+=String(vals[0]|0); return 0; }
    if(name==='__putstr'){ let a=vals[0]; while(mem[a]!==0){ out+=String.fromCharCode(mem[a]&255); a++; } return 0; }
    if(name==='__putchar'){ out+=String.fromCharCode(vals[0]&255); return 0; }
    const fn=ast.fns[name];
    if(!fn) throw new Error("fonction inconnue : '"+name+"'");
    if(fn.params.length!==vals.length)
      throw new Error(name+' attend '+fn.params.length+' argument(s), '+vals.length+' fourni(s)');
    const sc=new Map();
    /* Portée lexicale, comme en C. Pendant l'exécution d'une fonction, seules
       sa propre portée et la portée globale sont visibles.
       Sans cette mise de côté, scopes restait la pile de l'appelant : une
       fonction pouvait lire les variables locales de qui l'appelait, et un
       oubli de paramètre passait sans bruit ici alors que le compilateur le
       refuse. Un code qui marche dans le lab et casse à la compilation est
       pire qu'une fonctionnalité absente. */
    const pileAppelant=scopes.splice(1);
    const restaure=()=>{ scopes.length=1; for(const s of pileAppelant) scopes.push(s); };
    scopes.push(sc);
    fn.params.forEach((pa,i)=>{ const a=alloc(1); mem[a]=vals[i]|0; sc.set(pa.name,{addr:a}); });
    let r=0;
    try{ run(fn.body); }
    catch(x){ if(x instanceof Ret) r=x.v|0; else { restaure(); throw x; } }
    restaure();
    return r;
  }
  function run(s){
    tick();
    switch(s.kind){
      case 'block': { scopes.push(new Map()); try{ for(const st of s.body) run(st); } finally{ scopes.pop(); } return; }
      case 'decls': { for(const d of s.body) declare(d); return; }
      case 'decl': return declare(s);
      case 'expr': ev(s.e); return;
      case 'empty': return;
      case 'if': if(ev(s.c)) run(s.a); else if(s.b) run(s.b); return;
      case 'while': while(ev(s.c)){ try{ run(s.body); }catch(x){ if(x===BRK) break; if(x!==CNT) throw x; } } return;
      case 'for': {
        scopes.push(new Map());
        try{
          if(s.init) run(s.init);
          while(s.c===null||ev(s.c)){
            try{ run(s.body); }catch(x){ if(x===BRK) break; if(x!==CNT) throw x; }
            if(s.step) ev(s.step);
          }
        } finally{ scopes.pop(); }
        return; }
      case 'return': throw new Ret(s.e?ev(s.e):0);
      case 'break': throw BRK;
      case 'continue': throw CNT;
    }
    throw new Error('instruction non supportée');
  }

  for(const g of ast.globals) declare(g);
  let ret=0;
  try{ ret=call(entry, args||[]); }
  catch(x){ if(x instanceof Ret) ret=x.v; else throw x; }
  return {out, ret, mem};
}

/* ---------------- API ---------------- */
function runC(userSrc, harnessSrc, opts){
  opts=opts||{};
  try{
    const ast=parse(userSrc+'\n'+(harnessSrc||''));
    const r=interpret(ast, opts.entry||'main', opts.args, opts.limit);
    return {ok:true, out:r.out, ret:r.ret};
  }catch(e){
    return {ok:false, err:String(e.message||e)};
  }
}
