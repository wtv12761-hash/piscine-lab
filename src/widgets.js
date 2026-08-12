/* Les objets manipulables. Chacun sert à faire sentir un mécanisme avant de
   l'expliquer : on bouge quelque chose, on voit la conséquence.
   Ils ne comptent pas comme tâches ; c'est la question de prédiction qui les
   précède qui compte. */

const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(nom, attrs){
  const e = document.createElementNS(SVGNS, nom);
  for(const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function svgTexte(x, y, txt, taille, couleur, ancre){
  const t = svgEl('text', {x, y, 'text-anchor':ancre||'middle',
    'font-family':'ui-monospace,monospace', 'font-size':taille||11, fill:couleur||'#8f9cad'});
  t.textContent = txt;
  return t;
}
function boutonSchema(zone, libelle, action, redessine){
  const b=document.createElement('button'); b.className='btn ghost'; b.type='button'; b.textContent=libelle;
  b.onclick=()=>{ action(); redessine(); };
  zone.appendChild(b);
  return b;
}

/* ---------- les bits de permission ---------- */
function widgetBits(){
  const w=document.createElement('div');
  const etat=[[1,1,0],[1,0,0],[1,0,0]];
  const noms=['propriétaire','groupe','autres'];
  const rangee=document.createElement('div'); rangee.className='bwrow';
  const sortie=document.createElement('div'); sortie.className='bwout';
  const valeurs=[];
  noms.forEach((nom,g)=>{
    const col=document.createElement('div'); col.className='bwg';
    col.innerHTML='<div class="t">'+nom+'</div>';
    const trio=document.createElement('div'); trio.className='bwb';
    ['r','w','x'].forEach((L,b)=>{
      const btn=document.createElement('button'); btn.className='bit'; btn.type='button'; btn.textContent=L;
      btn.setAttribute('aria-label',L+' pour '+nom);
      btn.onclick=()=>{ etat[g][b]=etat[g][b]?0:1; maj(); };
      trio.appendChild(btn);
    });
    const v=document.createElement('div'); v.className='v'; valeurs.push(v);
    col.appendChild(trio); col.appendChild(v); rangee.appendChild(col);
  });
  function maj(){
    let lettres='', oct='';
    noms.forEach((_,g)=>{
      const [r,wr,x]=etat[g];
      const n=r*4+wr*2+x;
      valeurs[g].textContent=n; oct+=n;
      lettres+=(r?'r':'-')+(wr?'w':'-')+(x?'x':'-');
      const trio=rangee.children[g].querySelector('.bwb');
      [r,wr,x].forEach((on,b)=>trio.children[b].setAttribute('aria-pressed',on?'true':'false'));
    });
    sortie.innerHTML='-'+lettres+' &nbsp;=&nbsp; chmod <b>'+oct+'</b>';
  }
  w.appendChild(rangee); w.appendChild(sortie); maj();
  return w;
}

/* ---------- lien dur contre lien symbolique ---------- */
function widgetInode(){
  const w=document.createElement('div'); w.className='schema';
  const svg=svgEl('svg',{viewBox:'0 0 660 210'}); w.appendChild(svg);
  const msg=document.createElement('div'); msg.className='schemamsg';
  const ctl=document.createElement('div'); ctl.className='schemactl';
  let vivant={durA:true, durB:true, cibleSym:true, sym:true};

  function boite(x,y,l,h,titre,sous,actif,tirets){
    const g=svgEl('g');
    const r=svgEl('rect',{x,y,width:l,height:h,rx:5,
      fill:actif?'#26303c':'#1a212a', stroke:actif?'#e5533d':'#2f3a47'});
    if(tirets) r.setAttribute('stroke-dasharray','5 4');
    g.appendChild(r);
    g.appendChild(svgTexte(x+l/2, y+h/2+(sous?-4:5), titre, 13, actif?'#ff7d68':'#7a8697'));
    if(sous) g.appendChild(svgTexte(x+l/2, y+h/2+14, sous, 10, actif?'#8f9cad':'#3e4b5a'));
    svg.appendChild(g);
  }
  function fleche(x1,y1,x2,y2,actif,tirets){
    const l=svgEl('line',{x1,y1,x2,y2, stroke:actif?'#e5533d':'#2f3a47','stroke-width':1.5});
    if(tirets) l.setAttribute('stroke-dasharray','4 4');
    svg.appendChild(l);
    svg.appendChild(svgEl('circle',{cx:x2,cy:y2,r:3.5, fill:actif?'#e5533d':'#2f3a47'}));
  }
  function dessine(){
    svg.innerHTML='';
    svg.appendChild(svgTexte(165,16,'LIEN DUR   ln a b',11,'#8f9cad'));
    svg.appendChild(svgTexte(495,16,'LIEN SYMBOLIQUE   ln -s a b',11,'#8f9cad'));
    boite(20,38,110,38,'nom : a', vivant.durA?'':'supprimé', vivant.durA);
    boite(20,103,110,38,'nom : b', vivant.durB?'':'supprimé', vivant.durB);
    const inodeVivant = vivant.durA||vivant.durB;
    boite(190,68,130,48,'inode #4211', inodeVivant?'contenu vivant':'contenu détruit', inodeVivant);
    if(vivant.durA) fleche(130,57,190,84,true);
    if(vivant.durB) fleche(130,122,190,100,true);
    boite(350,38,110,38,'nom : a', vivant.cibleSym?'':'supprimé', vivant.cibleSym);
    boite(350,103,130,38,'lien : b', vivant.sym?'contient « a »':'', vivant.sym);
    boite(540,68,100,48,'inode #7702', vivant.cibleSym?'contenu':'détruit', vivant.cibleSym);
    if(vivant.cibleSym) fleche(460,57,540,84,true);
    if(vivant.sym) fleche(480,122,540,100,vivant.cibleSym,true);
    if(vivant.sym && !vivant.cibleSym)
      svg.appendChild(svgTexte(510,160,'lien mort',11,'#ff5f56'));
    svg.setAttribute('aria-label','à gauche, deux noms vers un même inode'+
      (vivant.durA?'':' dont un supprimé')+' ; à droite, un lien symbolique'+
      (vivant.cibleSym?'':' devenu mort'));
  }
  svg.setAttribute('role','img');
  boutonSchema(ctl,'rm a  (côté dur)',()=>{ vivant.durA=false;
    msg.innerHTML = vivant.durB
      ? 'Le nom <b>a</b> disparaît, mais <b>b</b> pointe toujours sur l\'inode : le contenu vit. Le compteur de liens passe de 2 à 1.'
      : 'Plus aucun nom : le contenu est détruit.'; }, dessine);
  boutonSchema(ctl,'rm a  (côté symbolique)',()=>{ vivant.cibleSym=false;
    msg.innerHTML='Le lien <b>b</b> existe encore et pèse toujours autant, mais son texte « a » ne mène plus nulle part : <b>lien mort</b>.'; }, dessine);
  boutonSchema(ctl,'remettre à zéro',()=>{ vivant={durA:true,durB:true,cibleSym:true,sym:true}; msg.textContent=''; }, dessine);
  dessine();
  w.appendChild(ctl); w.appendChild(msg);
  return w;
}

/* ---------- un caractère est un nombre ---------- */
function widgetAscii(){
  const w=document.createElement('div');
  const boite=document.createElement('div'); boite.className='asciibox';
  const gros=document.createElement('div'); gros.className='big';
  const sous=document.createElement('div'); sous.className='sub';
  const curseur=document.createElement('input');
  curseur.type='range'; curseur.min='32'; curseur.max='126'; curseur.value='97';
  curseur.setAttribute('aria-label','code du caractère');
  const rangee=document.createElement('div'); rangee.className='asciirow';
  function maj(){
    const n=+curseur.value, ch=String.fromCharCode(n);
    gros.textContent="'"+ch+"'  =  "+n;
    const ecart=n-97;
    sous.innerHTML="en C, <code>'"+ch+"'</code> <b>est</b> le nombre "+n+
      ". Donc <code>'a' "+(ecart<0?'- '+(-ecart):'+ '+ecart)+"</code> vaut "+n+
      ", c'est-à-dire <code>'"+ch+"'</code>.";
    curseur.setAttribute('aria-valuetext',ch+', code '+n);
  }
  [["'a'",97],["'z'",122],["'A'",65],["'0'",48],["'9'",57],['espace',32]].forEach(([lib,v])=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=lib;
    b.onclick=()=>{ curseur.value=v; maj(); }; rangee.appendChild(b);
  });
  curseur.oninput=maj;
  boite.appendChild(gros); boite.appendChild(sous); boite.appendChild(curseur);
  w.appendChild(boite); w.appendChild(rangee); maj();
  return w;
}

/* ---------- variable, pointeur, pointeur de pointeur ---------- */
function widgetMemoire(){
  const w=document.createElement('div'); w.className='schema';
  const svg=svgEl('svg',{viewBox:'0 0 640 180', role:'img'}); w.appendChild(svg);
  const msg=document.createElement('div'); msg.className='schemamsg';
  const ctl=document.createElement('div'); ctl.className='schemactl';
  let x=5;
  function boite(bx,by,bl,bh,titre,valeur){
    const g=svgEl('g');
    g.appendChild(svgEl('rect',{x:bx,y:by,width:bl,height:bh,rx:5,fill:'#26303c',stroke:'#e5533d'}));
    g.appendChild(svgTexte(bx+bl/2, by+19, titre, 11, '#8f9cad'));
    g.appendChild(svgTexte(bx+bl/2, by+42, valeur, 15, '#ff7d68'));
    svg.appendChild(g);
  }
  function fleche(x1,y1,x2,y2){
    svg.appendChild(svgEl('line',{x1,y1,x2,y2,stroke:'#e5533d','stroke-width':1.5}));
    svg.appendChild(svgEl('circle',{cx:x2,cy:y2,r:3.5,fill:'#e5533d'}));
  }
  function dessine(){
    svg.innerHTML='';
    svg.appendChild(svgTexte(320,16,'une seule case contient la valeur ; les autres contiennent une adresse',11));
    boite(30,40,160,58,'int x   (adresse 1000)', String(x));
    boite(240,40,150,58,'int *p', '1000');
    boite(440,40,170,58,'int **q', 'adresse de p');
    fleche(240,69,192,69);
    fleche(440,69,392,69);
    svg.appendChild(svgTexte(216,112,'*p',11,'#8f9cad'));
    svg.appendChild(svgTexte(416,112,'*q',11,'#8f9cad'));
    svg.appendChild(svgTexte(320,148,'*p vaut '+x+'   ·   **q vaut '+x, 12, '#8f9cad'));
    svg.setAttribute('aria-label','x vaut '+x+' ; p contient l\'adresse de x ; q contient l\'adresse de p');
  }
  boutonSchema(ctl,'x = 9',()=>{ x=9;
    msg.innerHTML='On écrit dans la variable directement. <b>*p</b> et <b>**q</b> changent aussi : ils désignent la même case.'; }, dessine);
  boutonSchema(ctl,'*p = 42',()=>{ x=42;
    msg.innerHTML='On écrit <b>à travers</b> le pointeur. Résultat identique : p contient l\'adresse de x, donc *p EST x.'; }, dessine);
  boutonSchema(ctl,'**q = 7',()=>{ x=7;
    msg.innerHTML='Deux sauts : q donne p, p donne x. Chaque étoile suit une flèche de plus.'; }, dessine);
  boutonSchema(ctl,'remettre à zéro',()=>{ x=5; msg.textContent=''; }, dessine);
  dessine();
  w.appendChild(ctl); w.appendChild(msg);
  return w;
}
