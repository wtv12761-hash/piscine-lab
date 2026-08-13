/* La liste des pages, dérivée de la seule source qui fasse foi.
 *
 * Elle était recopiée à la main dans six endroits différents. Ajouter un
 * module obligeait donc à modifier six listes, et en oublier une faisait
 * passer la nouvelle page à travers un contrôle sans que rien ne le signale :
 * le test continuait de réussir, sur les quatre pages qu'il connaissait.
 *
 * build.mjs déclare les modules ; tout le reste en découle. */

const fs = require('fs');
const path = require('path');

const build = fs.readFileSync(path.join(__dirname, '..', 'src', 'build.mjs'), 'utf8');

/* On lit uniquement le tableau MODULES, pour ne pas ramasser un 'page:' qui
   traînerait ailleurs dans le fichier. */
const bloc = /const MODULES\s*=\s*\[([\s\S]*?)\n\];/.exec(build);
if (!bloc) throw new Error('pages.js : tableau MODULES introuvable dans src/build.mjs');

const MODULES = [...bloc[1].matchAll(/page:\s*'([^']+)'/g)].map(m => m[1]);
if (MODULES.length === 0) throw new Error('pages.js : aucun module déclaré dans src/build.mjs');

/* index.html est construit à part, à partir de gabarit-hub.html. */
const TOUTES = ['index.html', ...MODULES];

module.exports = { MODULES, TOUTES };
