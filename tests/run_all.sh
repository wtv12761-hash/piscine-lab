#!/bin/sh
# Lance toute la vérification. À faire tourner AVANT chaque commit.
# Depuis la racine du dépôt :  sh tests/run_all.sh
#
# Ce script ne doit JAMAIS renvoyer 0 quand quelque chose échoue.
# La version précédente le faisait : « node fichier | tail -4 » renvoie le code
# de sortie de tail, qui réussit toujours, et set -e ne voyait donc rien passer.
# On capture la sortie dans une variable, ce qui préserve le code de sortie,
# et on cumule les échecs pour tout exécuter avant de conclure.

echec=0

signale() {           # signale <nom> <code>
  if [ "$2" -ne 0 ]; then
    echo "  ÉCHEC : $1"
    echec=1
  fi
}

echo "### extraction depuis les pages livrées"
sortie=$(node tests/extract.js 2>&1); code=$?
echo "$sortie" | tail -2
signale "tests/extract.js" $code
if [ $code -ne 0 ]; then
  echo ""
  echo "L'extraction a échoué : les tests suivants porteraient sur des fichiers"
  echo "périmés ou absents. On s'arrête ici."
  exit 1
fi

total_assertions=0
for f in tests/test_*.js; do
  echo ""
  echo "### $f"
  sortie=$(node "$f" 2>&1); code=$?
  echo "$sortie" | tail -4
  signale "$f" $code
  n=$(echo "$sortie" | sed -n 's/^ pass \([0-9]*\).*/\1/p' | tail -1)
  total_assertions=$((total_assertions + ${n:-0}))
done

echo ""
echo "### la doc annonce le bon nombre d'assertions"
# La doc annonçait 298 assertions et personne ne le recomptait jamais.
# Un document qui se trompe sur son propre contenu jette le doute sur tous
# ses autres chiffres, donc on le vérifie au lieu de le croire.
annonce=$(sed -n 's/.*\*\*\([0-9]*\) assertions de test.*/\1/p' HANDOFF.md | head -1)
echo "  réel : $total_assertions   annoncé dans HANDOFF.md : ${annonce:-aucun}"
if [ "$total_assertions" != "$annonce" ]; then
  signale "le nombre d'assertions annoncé ne correspond pas au nombre réel" 1
fi

echo ""
echo "### syntaxe des pages"
for p in index.html shell00.html shell01.html c00.html c01.html; do
  sortie=$(node -e "
    const fs=require('fs');const s=fs.readFileSync('$p','utf8');
    const js=s.slice(s.indexOf('<script>')+8,s.lastIndexOf('</script>'));
    new Function('window','document','navigator',js);
    console.log('  $p : syntaxe ok');" 2>&1); code=$?
  echo "$sortie" | tail -2
  signale "syntaxe de $p" $code
done

echo ""
echo "### cohérence documentation / code"
sortie=$(node tests/verify_docs.js 2>&1); code=$?
echo "$sortie" | tail -3
signale "tests/verify_docs.js" $code

echo ""
if [ $echec -ne 0 ]; then
  echo "========================================="
  echo "  VÉRIFICATION EN ÉCHEC — ne pas commiter"
  echo "========================================="
  exit 1
fi
echo "========================================="
echo "  tout est vert"
echo "========================================="
exit 0
