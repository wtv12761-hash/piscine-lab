/* Tests du langage C interprété.

   RÈGLE 1, APPLIQUÉE ICI AUSSI : aucune fonction de ce fichier ne doit être la
   réponse d'un exercice du sujet, ni celle d'une mission du lab.
   Ce fichier a longtemps contenu les neuf fonctions demandées par C 01, plus
   celle de l'ex00 de C 00, recopiées telles quelles et publiées dans un dépôt
   public. Elles y étaient parce que l'auteur testait un interpréteur et a pris
   les fonctions qu'il avait sous la main, sans voir qu'il écrivait un corrigé.
   (Les nommer ici les republierait : tests/test_regle1.js les surveille.)
   Les fonctions ci-dessous couvrent exactement les mêmes mécanismes du langage
   avec des tâches qui ne sont demandées nulle part. */
const {runC}=require('./_c.js');
let pass=0,fail=0;
function t(name,user,harness,expect,opts){
  const r=runC(user,harness,opts||{});
  const got = r.ok? r.out : 'ERR:'+r.err;
  if(got===expect){pass++;console.log('  ok   '+name);}
  else{fail++;console.log('  FAIL '+name+'\n         attendu '+JSON.stringify(expect)+'\n         obtenu  '+JSON.stringify(got));}
}
function terr(name,user,harness){
  const r=runC(user,harness||'int main(void){return 0;}');
  if(!r.ok){pass++;console.log('  ok   '+name+' (erreur: '+r.err.slice(0,40)+')');}
  else{fail++;console.log('  FAIL '+name+' aurait du echouer');}
}

console.log('\n--- bases : write, char, boucles ---');
t('write dans une boucle, parametres multiples',
 'void repete(char c, int n){ int i=0; while(i<n){ write(1,&c,1); i++; } }',
 "int main(void){ repete('A',2); repete('B',1); return 0; }",'AAB');
t('arithmetique sur char avec un pas',
 "void un_sur_deux(char a, char b){ char c=a; while(c<=b){ write(1,&c,1); c=c+2; } }",
 "int main(void){ un_sur_deux('a','i'); return 0; }",'acegi');
t('boucle for descendante',
 "void a_rebours(int n){ for(; n>0; n--){ char c=n+'0'; write(1,&c,1); } }",
 'int main(void){ a_rebours(5); return 0; }','54321');
t('conversion chiffre vers caractere',
 "void triples(void){ int i=0; while(i<=9){ char c=i+'0'; write(1,&c,1); i+=3; } }",
 'int main(void){ triples(); return 0; }','0369');
t('if / else if / else et modulo',
 "void pair_impair(int n){ char c; if(n%2==0) c='P'; else c='I'; write(1,&c,1); }",
 'int main(void){ pair_impair(4); pair_impair(7); pair_impair(0); return 0; }','PIP');
t('boucles imbriquees',
 "void grille(void){ int a=1; while(a<=2){ int b=1; while(b<=3){ char x=a+'0'; char y=b+'0'; write(1,&x,1); write(1,&y,1); b++; } a++; } }",
 'int main(void){ grille(); return 0; }','111213212223');
t('retour de fonction',
 'int carre(int n){ return n*n; }',
 'int main(void){ __putnbr(carre(7)); return 0; }','49');

console.log('\n--- pointeurs ---');
t('lire ET ecrire a travers un pointeur',
 'void ajoute(int *p, int v){ *p = *p + v; }',
 'int main(void){ int x = 5; ajoute(&x,3); __putnbr(x); return 0; }','8');
t('lecture a trois niveaux de pointeurs',
 'int lit_trois(int ***n){ return ***n; }',
 'int main(void){ int x=9; int *a=&x; int **b=&a; int ***c=&b; __putnbr(lit_trois(c)); return 0; }','9');
t('neuf niveaux de pointeurs, en lecture et en ecriture',
 'void incr_neuf(int *********p){ *********p = *********p + 5; }',
 `int main(void){ int x=1; int *p1=&x; int **p2=&p1; int ***p3=&p2; int ****p4=&p3;
   int *****p5=&p4; int ******p6=&p5; int *******p7=&p6; int ********p8=&p7; int *********p9=&p8;
   incr_neuf(p9); __putnbr(x); return 0; }`,'6');
t('permutation circulaire de trois adresses',
 'void rotation3(int *a, int *b, int *c){ int t=*a; *a=*b; *b=*c; *c=t; }',
 'int main(void){ int a=1,b=2,c=3; rotation3(&a,&b,&c); __putnbr(a); __putnbr(b); __putnbr(c); return 0; }','231');
t('deux resultats par parametres de sortie',
 'void somme_diff(int a,int b,int *s,int *d){ *s=a+b; *d=a-b; }',
 'int main(void){ int s,d; somme_diff(9,4,&s,&d); __putnbr(s); __putnbr(d); return 0; }','135');
t('modifier les deux entrees apres les avoir lues',
 'void double_triple(int *a,int *b){ int x=*a; int y=*b; *a=x*2; *b=y*3; }',
 'int main(void){ int a=4,b=5; double_triple(&a,&b); __putnbr(a); __putnbr(b); return 0; }','815');
terr('pointeur nul detecte','void f(int *p){ *p = 1; }','int main(void){ f(0); return 0; }');

console.log('\n--- chaines et tableaux ---');
t('parcourir une chaine jusqu au zero final',
 'void ecrire_double(char *s){ int i=0; while(s[i]){ write(1,&s[i],1); write(1,&s[i],1); i++; } }',
 'int main(void){ ecrire_double("ab"); return 0; }','aabb');
t('return depuis l interieur d une boucle',
 "int position(char *s, char c){ int i=0; while(s[i]){ if(s[i]==c) return i; i++; } return -1; }",
 "int main(void){ __putnbr(position(\"bonjour\",'j')); return 0; }",'3');
t('chaine vide',
 "int position(char *s, char c){ int i=0; while(s[i]){ if(s[i]==c) return i; i++; } return -1; }",
 "int main(void){ __putnbr(position(\"\",'a')); return 0; }",'-1');
t('tableau litteral et index',
 'int somme(int *t,int n){ int i=0,s=0; while(i<n){ s+=t[i]; i++; } return s; }',
 'int main(void){ int t[4]={1,2,3,4}; __putnbr(somme(t,4)); return 0; }','10');
t('decalage sur place d un tableau',
 'void decale_gauche(int *t,int n){ int premier=t[0]; int i=0; while(i<n-1){ t[i]=t[i+1]; i++; } t[n-1]=premier; }',
 'int main(void){ int t[5]={1,2,3,4,5}; decale_gauche(t,5); int i=0; while(i<5){ __putnbr(t[i]); i++; } return 0; }','23451');
t('double boucle sur un tableau',
 'int paires_egales(int *t,int n){ int c=0; int i=0; while(i<n){ int j=i+1; while(j<n){ if(t[i]==t[j]) c++; j++; } i++; } return c; }',
 'int main(void){ int t[5]={1,2,1,3,1}; __putnbr(paires_egales(t,5)); return 0; }','3');
t('arithmetique de pointeur via deref',
 'int deuxieme(int *t){ return *(t+1); }',
 'int main(void){ int t[3]={7,8,9}; __putnbr(deuxieme(t)); return 0; }','8');
t('modifier un tableau via pointeur dans une fonction',
 'void inc(int *t,int n){ int i=0; while(i<n){ t[i]=t[i]+1; i++; } }',
 'int main(void){ int t[3]={1,2,3}; inc(t,3); __putnbr(t[0]); __putnbr(t[2]); return 0; }','24');

console.log('\n--- portee lexicale ---');
// L'interpreteur utilisait une pile de portees unique : une fonction voyait
// les locales de son appelant. Un oubli de parametre passait donc ici alors
// que cc le refuse. C'est le pire cas possible pour un lab : du code qui
// marche dans l'outil et casse a la compilation.
terr('une fonction ne voit pas les locales de son appelant',
 'void fuite(void){ __putnbr(secret); }',
 'int main(void){ int secret; secret=7; fuite(); return 0; }');
t('les variables globales restent visibles',
 'int g;\nvoid f(void){ __putnbr(g); }',
 'int main(void){ g=5; f(); return 0; }','5');
t('la recursion fonctionne toujours',
 'int fact(int n){ if(n<=1) return 1; return n*fact(n-1); }',
 'int main(void){ __putnbr(fact(5)); return 0; }','120');
t('les appels imbriques restaurent la bonne portee',
 'int a(int x){ return x+1; }\nint b(int x){ return a(x)*2; }',
 'int main(void){ __putnbr(b(3)); return 0; }','8');
t('un parametre masque sans ecraser la locale de l appelant',
 'void f(int n){ __putnbr(n); }',
 'int main(void){ int n=1; f(9); __putnbr(n); return 0; }','91');

console.log('\n--- garde-fous ---');
terr('boucle infinie coupee','void f(void){ int i=0; while(1){ i++; } }','int main(void){ f(); return 0; }');
terr('fonction inconnue','','int main(void){ pasla(); return 0; }');
terr('parenthese manquante','void f(void){ write(1,"a",1; }','int main(void){ return 0; }');
terr('division par zero','int f(void){ return 1/0; }','int main(void){ f(); return 0; }');
terr('mauvais nombre d arguments','void f(int a){ }','int main(void){ f(1,2); return 0; }');
t('commentaires ignores',
 '/* bloc */ void f(void){ // ligne\n write(1,"z",1); }',
 'int main(void){ f(); return 0; }','z');
t('prototype tolere',
 'void f(char c);\nvoid f(char c){ write(1,&c,1); }',
 'int main(void){ f(88); return 0; }','X');
t('for avec declaration interne',
 "void f(void){ for(int i=0;i<3;i++){ char c=i+'0'; write(1,&c,1); } }",
 'int main(void){ f(); return 0; }','012');
t('operateurs composes',
 'int f(void){ int x=10; x+=5; x-=3; x*=2; return x; }',
 'int main(void){ __putnbr(f()); return 0; }','24');
t('nombres negatifs',
 'int f(int n){ if(n<0) return -n; return n; }',
 'int main(void){ __putnbr(f(-12)); return 0; }','12');

console.log('\n=========================');
console.log(' pass '+pass+'   fail '+fail);
console.log('=========================');
process.exit(fail?1:0);
