const {runC}=require('./_c.js');
// solutions de référence, écrites comme un étudiant les écrirait
const SOL={
 'c1.1':"void ft_deux(char a, char b){ write(1,&a,1); write(1,&b,1); }",
 'c2.2':"void ft_de_a_a(char debut, char fin){ char c = debut; while (c <= fin){ write(1,&c,1); c++; } }",
 'c3.1':"void ft_pairs(void){ int i = 0; while (i <= 8){ char c = i + '0'; write(1,&c,1); i += 2; } }",
 'c3.2':"void ft_signe(int n){ char c; if (n < 0) c='N'; else if (n == 0) c='Z'; else c='P'; write(1,&c,1); }",
 'c4.1':"void ft_paires(void){ int a=0; while(a<4){ int b=a+1; while(b<4){ char x=a+'0'; char y=b+'0'; write(1,&x,1); write(1,&y,1); b++; } a++; } }",
 'c5.1':"void ft_deux_chiffres(int n){ char d = n/10 + '0'; char u = n%10 + '0'; write(1,&d,1); write(1,&u,1); }",
 'p1.2':"void ft_mettre(int *p, int v){ *p = v; }",
 'p2.1':"void ft_triple(int ***n){ ***n = 7; }",
 'p3.1':"void ft_min_max(int a,int b,int *min,int *max){ if(a<b){ *min=a; *max=b; } else { *min=b; *max=a; } }",
 'p3.2':"void ft_echange_somme(int *a,int *b){ int x=*a; int y=*b; *a=x+y; *b=x-y; }",
 'p4.1':"int ft_compte(char *str, char c){ int i=0; int n=0; while(str[i]){ if(str[i]==c) n++; i++; } return n; }",
 'p5.1':"void ft_doubler(int *tab,int size){ int i=0; while(i<size){ tab[i]=tab[i]*2; i++; } }",
 'p5.2':"int ft_symetrique(int *tab,int size){ int i=0; int j=size-1; while(i<j){ if(tab[i]!=tab[j]) return 0; i++; j--; } return 1; }",
};
// erreurs plausibles qui DOIVENT être rattrapées par au moins un test
const BAD={
 'c2.2':"void ft_de_a_a(char debut, char fin){ char c=debut; while(c<fin){ write(1,&c,1); c++; } }",   // < au lieu de <=
 'c3.1':"void ft_pairs(void){ int i=0; while(i<=8){ write(1,&i,1); i+=2; } }",                          // oubli du + '0'
 'c3.2':"void ft_signe(int n){ char c; if(n<0) c='N'; else c='P'; write(1,&c,1); }",                    // zéro non traité
 'c4.1':"void ft_paires(void){ int a=0; while(a<4){ int b=0; while(b<4){ char x=a+'0'; char y=b+'0'; write(1,&x,1); write(1,&y,1); b++; } a++; } }", // b part de 0
 'c5.1':"void ft_deux_chiffres(int n){ char u=n%10+'0'; char d=n/10+'0'; write(1,&u,1); write(1,&d,1); }", // ordre inversé
 'p1.2':"void ft_mettre(int *p,int v){ p = v; }",                                                      // oubli de l'étoile
 'p3.2':"void ft_echange_somme(int *a,int *b){ *a = *a + *b; *b = *a - *b; }",                          // pas de temporaire
 'p4.1':"int ft_compte(char *str,char c){ int i=0; int n=0; while(i<6){ if(str[i]==c) n++; i++; } return n; }", // longueur en dur
 'p5.2':"int ft_symetrique(int *tab,int size){ if(tab[0]==tab[size-1]) return 1; return 0; }", // ne teste que les extremites
};
let pass=0,fail=0;
function runRooms(file,label){
  const {ROOMS}=require(file);
  console.log('\n=== '+label+' ===');
  ROOMS.forEach(r=>r.steps.forEach((st,i)=>{
    const id=r.id+'.'+i;
    if(st.k==='code'){
      const sol=SOL[id];
      if(!sol){fail++;console.log('  FAIL pas de solution de reference pour '+id);return;}
      // 1. la solution passe tous les tests
      let allOk=true, detail='';
      for(const tc of st.tests){
        const res=runC(sol,tc.harness,{entry:'main'});
        if(!res.ok||res.out!==tc.expect){ allOk=false; detail=tc.label+' → '+(res.ok?JSON.stringify(res.out):res.err); break; }
      }
      if(allOk){pass++;console.log('  ok   '+id+' solution valide ('+st.tests.length+' tests)');}
      else{fail++;console.log('  FAIL '+id+' solution refusee : '+detail);}
      // 2. le squelette de depart NE passe PAS
      const startOk=st.tests.every(tc=>{const res=runC(st.start,tc.harness,{entry:'main'});return res.ok&&res.out===tc.expect;});
      if(!startOk){pass++;console.log('  ok   '+id+' squelette vide rejete');}
      else{fail++;console.log('  FAIL '+id+' le squelette vide passe les tests');}
      // 3. l'erreur plausible est attrapee
      if(BAD[id]){
        const bad=BAD[id];
        const caught=!st.tests.every(tc=>{const res=runC(bad,tc.harness,{entry:'main'});return res.ok&&res.out===tc.expect;});
        if(caught){pass++;console.log('  ok   '+id+' erreur classique detectee');}
        else{fail++;console.log('  FAIL '+id+' erreur classique NON detectee');}
      }
      if(!st.hints||st.hints.length<2){fail++;console.log('  FAIL '+id+' pas assez d indices');}
      else{pass++;console.log('  ok   '+id+' indices');}
      if(!st.sig){fail++;console.log('  FAIL '+id+' pas de signature');} else pass++;
    }
    if(st.k==='mcq'){
      const ok=Array.isArray(st.opts)&&st.opts.length>=3&&typeof st.a==='number'&&st.a<st.opts.length&&!!st.why;
      if(ok){pass++;console.log('  ok   '+id+' mcq');}else{fail++;console.log('  FAIL '+id+' mcq malforme');}
    }
    if(st.k==='input'){
      const ok=(st.accept?st.accept(st.a[0]):st.a.includes(st.a[0]))===true;
      if(ok){pass++;console.log('  ok   '+id+' input');}else{fail++;console.log('  FAIL '+id+' input refuse sa propre reponse');}
    }
  }));
}
runRooms('./_rooms_c00.js','C 00');
runRooms('./_rooms_c01.js','C 01');
console.log('\n=========================');
console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
