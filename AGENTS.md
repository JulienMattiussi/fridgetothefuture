# Fridge to the Future - Agent File

## Description du projet

Page web plein écran qui modélise en **3D cell shading** le **réfrigérateur à
vapeur de Doc Brown** dans _Retour vers le futur III_ (1885, l'écurie de
Hill Valley). La machine doit être **fidèle au film** et **interactive** :
mêmes mécanismes, mêmes leviers et roues à actionner.

Application **100% front-end**, sans backend. Interface **bilingue** français /
anglais : la langue du navigateur, ou le choix du visiteur (sélecteur en haut à
droite, gardé dans le localStorage).

### Références visuelles

- `docs/references/machine-face.webp` : la machine de face (Marty à gauche,
  Doc à droite). Source de vérité pour la disposition.
- `docs/references/iced-tea.webp` : Doc lève son verre de thé glacé.
- `docs/references/video-*.jpg` : images clés de l'extrait vidéo de la scène
  (plan large, conduit froid, roue de vanne de droite, verre de thé).

Ce qu'on y voit : un échafaudage en bois brut sur deux niveaux contre le mur ;
une grosse chaudière cylindrique rouillée au centre, **posée sur l'établi**, la
même table que la bassine, sur deux paires de pieds en planches, légèrement en A, clouées sur deux
traverses carrées sous le plateau (les pieds de gauche juste à droite de la
chaudière) ; les tuyaux suivent trois séries tracées sur le plan
large (voir `machine/pipework/`) : **rouge** (le tuyau de la cuve grise descend en diagonale jusqu'au-dessus de la
chaudière, où un coude le fait plonger dans le dôme ; la grande diagonale du
bloc noir passe devant ce coude, arrive un peu plus bas que la jonction et
remonte vers l'arrière pour le rejoindre sous une bague ; la conduite horizontale part de la descente
vers la droite), **orange** (une descente du haut à droite, derrière la conduite rouge,
qui se divise : vers la bassine, c'est le conduit froid, suspendu à la conduite
rouge par deux ficelles en V nouées autour des deux tuyaux ; l'autre branche
passe derrière la chaudière sans la toucher et devient le tuyau **bleu** qui
va à la bobine), **bleue** encore (du flanc droit de la chaudière, derrière le
conduit froid, jusque sous la conduite rouge) ; deux petits tuyaux à plusieurs coudes partent du bloc noir (l'un de
son devant, l'autre de son dessus) et fusionnent juste avant un manomètre collé à la chaudière, où ils
arrivent juste au-dessus de son unique anneau, un fil fin ; une dizaine de manomètres à
cerclage gris cuivré, jamais deux de la même taille ni avec le même cadran ; à
gauche, sur un bâti en bois **un cran en avant** du reste, pas plus profond que les
blocs (les pieds en fer des deux blocs rivetés par-dessus son bord avant ; à chaque bout, un gros poteau central et une jambe écartée vers l'avant ; une grosse traverse basse : `docs/references/video-support-bobine.jpg`), l'**unité de la bobine**
en trois volumes (`docs/references/video-bobine.jpg`) : un gros bloc noir à
gauche (un manomètre et la **manivelle** devant, le tuyau rouge au-dessus), un
bloc gris plus petit à droite (le tuyau bleu devant), et entre les deux une
**bobine de tube de cuivre**, deux tiges horizontales au-dessus, soudées aux deux blocs (le bloc gris est aussi haut que le manchon), et un
**manchon** qui coulisse de gauche à droite le long des tiges, la bobine
passant dedans ; c'est la manivelle qui le fait coulisser ; deux manomètres
au-dessus (un gros à cadran sombre, un petit blanc) ; trois roues de charrette à rayons, posées dans la
profondeur de la machine (axe gauche-droite) et **immobiles**, les deux de
gauche sur **un même essieu** qui porte les poteaux avant de la structure ; en haut à gauche, sur le plancher, un
grand volant relié par courroie à l'arbre de transmission sous le toit, et un
axe portant un disque de poulie à l'avant, un petit volant et deux
engrenages, relié par une bielle à un petit disque sur son support et
actionnant par manivelle un **soufflet** logé dans une arche en bois derrière (`machine/Drive.tsx`) ; en haut à droite, une **énorme cuve grise** surmontée
d'une **partie rouge** à roue de vanne, où arrivent les tuyaux qui montent,
avec des **barreaux** tout le long du bout droit de la structure, et une **échelle** appuyée contre le flanc droit de la cuve,
parallèle aux barreaux (`docs/references/video-cuve.jpg`) ; à droite, sur une planche de la structure, la **grosse roue de vanne**
cuivrée, de profil (axe gauche-droite), une colonne à engrenages (pignon en haut, couple conique au milieu) et
une petite vanne à volant (`machine/ValveGear.tsx`) ; un établi avec une bassine émaillée, une
pince, deux ballons sur un support en laiton et le grand verre à pied du thé.
Entre les deux étagères, au fond, un **poêle** en fonte dont le gros conduit
monte au toit, rejoint par un coude venu du dessus de la partie rouge de la cuve
(`machine/Stove.tsx`). Le glaçon sort d'un **gros conduit incliné à collerette côtelée**, d'où jaillit
la vapeur froide. Les côtés, l'arrière et le haut ne sont pas visibles : on les
complète de façon plausible. On ignore les personnages et le cheval.

**Inventions assumées** : le tracé exact des tuyaux rouge et orange entre le
haut du cadre et la partie rouge de la cuve, l'emplacement de l'échelle et des
deux montants, et l'appui des poteaux sur l'essieu.

### La séquence du film

1. Doc lance le moteur à vapeur : volant, engrenages et courroies se mettent en
   marche par à-coups (les roues de charrette, elles, ne tournent pas), un panache de vapeur blanche jaillit au sommet.
2. La machine cogne et vibre violemment ; Doc tire la corde du sifflet.
3. Doc : « Tourne à fond vers la gauche ! » : Marty actionne la manivelle du
   bloc noir, et le manchon coulisse le long des tiges, sur la bobine.
4. Un jet de vapeur froide sort du conduit côtelé ; Doc présente la bassine
   dessous, un seul glaçon y tombe. Il le prend à la pince et le met dans son
   verre de thé : « Iced tea? »

**Dans la page** (`lib/sequence.ts`), le visiteur joue Doc et Marty, sur les
pièces seulement (l'interface n'affiche que la consigne et « Recommencer »).
Les pièces s'allument au survol, un signe au-dessus montre le geste
(`three/sequence/Handle.tsx`) : un clic, un glisser-déposer (bûches, bassine,
pince), ou un cercle de la souris, bouton enfoncé, autour d'une roue ou d'une
manivelle, dans le bon sens (la consigne le dit : les vannes alternent).

Les étapes, choix assumés au-delà du film :

1. glisser dans le poêle les trois bûches spéciales de Doc, dans l'ordre :
   verte, jaune, rouge (à la façon Playmobil, sur un tas de bûches ordinaires
   devant, le poêle étant caché ; `machine/LogPile.tsx`) ;
2. ouvrir la petite vanne en bas à droite (son manomètre grimpe) ;
3. monter à l'échelle (un clic, la vue se rapproche de la cuve), ouvrir la
   vanne du haut (ses tuyaux vibrent, leurs manomètres réagissent, puis le
   moteur démarre). La vanne du haut ne s'atteint que de l'échelle ; on peut
   y monter à tout moment (tant que la vanne est fermée), mais une fois en
   haut, seule cette vanne fait redescendre ;
4. tourner la manivelle (le manchon fait plusieurs allers-retours, la vapeur
   jaillit du haut) ;
5. ouvrir la grande vanne de cuivre (les engrenages tournent avec elle), puis
   baisser le grand levier derrière les engrenages (le froid jaillit du
   conduit, la vue plonge sur la bassine) ;
6. lever la bassine sous le conduit : le froid retombe, le glaçon tombe deux
   secondes plus tard, la bassine redescend avec lui ;
7. prendre le glaçon à la pince et le porter dans le verre : réussite.

Hors de l'ordre, toute pièce reste actionnable. Selon le cas, la machine casse
aussitôt, ou rien ne se passe mais la partie finira forcément par une casse
(au plus tard quand le froid devrait venir) : manomètres qui éclatent,
chaudière qui explose, gros tuyau arraché qui gicle, eau au lieu du glaçon,
glaçon par terre, ou froid sans glaçon (règles dans `lib/sequence.ts`). Le
petit volant à droite des engrenages ne sert à rien : le tourner, il reste
dans la main et l'axe fuit (`machine/SideWheel.tsx`).
L'échec s'affiche alors, sans détail, après deux secondes de casse.

Chaque fin (le thé glacé, et chaque casse) est numérotée (`lib/endings.ts`) et
gardée dans le localStorage une fois vue. Une coupe en bas à droite les liste
(« ???? » pour celles pas encore vues) et s'agite à chaque nouvelle fin.
Toutes vues, elle offre le mode rotation (la vue libre de `?orbit`). Les
fenêtres suivent le style de la machine : plaque de cuir sertie de laiton
riveté (`ui/Plate.tsx`). Le sifflet a été retiré du modèle, donc
de la séquence.

---

## Stack technique

| Outil                      | Usage                                                      |
| -------------------------- | ---------------------------------------------------------- |
| React 19 + TypeScript      | UI                                                         |
| Vite                       | Build / dev server                                         |
| React Three Fiber + drei   | Rendu 3D déclaratif (three.js), Outlines (contours)        |
| three                      | Moteur 3D sous-jacent                                      |
| Tailwind CSS v4            | Styles de l'interface superposée (via `@tailwindcss/vite`) |
| Vitest                     | Tests unitaires de la logique pure                         |
| Playwright                 | Tests e2e                                                  |
| Prettier                   | Formatage                                                  |
| ESLint (typescript-eslint) | Linting                                                    |
| Knip                       | Détection du code / dépendances inutilisés                 |

> `three` est **épinglé à `0.176.0`** : les versions plus récentes déprécient
> `THREE.Clock` (utilisé en interne par React Three Fiber), ce qui émettrait un
> avertissement en dev tant que R3F n'a pas migré vers `THREE.Timer`.

Node : version du `.nvmrc` (`source ~/.nvm/nvm.sh && nvm use`).

---

## Architecture

```
src/
  main.tsx              Point d'entrée
  App.tsx               Assemble la page
  index.css             Tailwind + base plein écran
  lib/                  Logique pure (aucun import React ni three.js)
    toonSteps.ts        Les paliers de lumière du cell shading
    geometry.ts         Segments, interpolation, angles, cercles, courroies, hélice
    gaugeDial.ts        Le dessin des cadrans de manomètre, tiré de leur taille
    framing.ts          Recul de caméra pour cadrer la scène
    sequence.ts         La séquence du film : étapes, clics, durées, ce que la machine montre
    endings.ts          Les fins, numérotées, et celles déjà vues
    language.ts         La langue à afficher : choix gardé, sinon celle du navigateur
    stoking.ts          Le minutage d'une bûche qui entre dans le poêle (porte, bûche)
  ui/Controls.tsx       L'interface superposée : consigne, fin de partie, « Recommencer »
  ui/Trophies.tsx       La coupe des fins vues ; endingsStore.ts les garde (localStorage)
  ui/LanguageSwitch.tsx Le sélecteur FR / EN ; LanguageProvider, useLanguage (contexte)
  ui/Plate.tsx          Plaque de cuir sertie de laiton : le style des fenêtres
  ui/Splash.tsx         Le panneau-titre « The Fridge Timeback Machine », 4 s à l'ouverture
  i18n/texts.ts         Tous les textes affichés, en français et en anglais
  three/                Rendu 3D (composants R3F, hooks three.js)
    Scene.tsx           Canvas et lumières
    FrontCamera.tsx     Caméra fixe de face, recadrée selon la fenêtre
    palette.ts          Les couleurs de la scène
    sequence/           La séquence en direct : store (état + horloge), context,
                        SequenceClock, Handle (pièce à cliquer, glisser ou tourner),
                        gestures (suivi de la souris), GestureSign, useTurn
    parts/              Briques réutilisables
      ToonMesh.tsx      Mesh cell shading + contour (base de tout le reste)
      Rod.tsx, Beam.tsx Barre ronde / poutre carrée d'un point à un autre
      Pipe.tsx          Tuyau d'un seul tube, coudes arrondis (roundedPath)
      Flange.tsx        Bride boulonnée, là où un tuyau se fixe à une cuve ou un appareil
      Wheel.tsx         Roue à rayons (roue de charrette, volant de vanne)
      Gear.tsx, BevelGear.tsx, Gauge.tsx Engrenage droit, conique, manomètre
      GaugeShatter.tsx  La vitre d'un manomètre qui éclate (fissures, éclats)
      MountedGauge.tsx  Manomètre monté sur un tuyau (tige ou raccord)
      Table.tsx         Plateau de table, sur quatre pieds ou non
      Belt.tsx          Courroie plate entre deux poulies
      RibbedSleeve.tsx  Manchon côtelé (bouche du conduit froid)
      Flask.tsx         Ballon de chimie, vide ou rempli
      Ladder.tsx        Échelle en bois
      Lashing.tsx       Tour de ficelle noué autour d'un tuyau
      RivetedFoot.tsx   Pied en tôle rivetée, plié sur le bord d'une table
      CopperCoil.tsx    Tube de cuivre enroulé en hélice
      Flame.tsx         Flamme de dessin animé, trois langues rouge à jaune
      NumberedLog.tsx   Bûche spéciale de Doc, peinte et numérotée
    machine/            La machine de Doc, une pièce par fichier
      layout.ts         Les points d'ancrage partagés (en mètres)
      Machine.tsx       Assemble les pièces + les manomètres épars
      Scaffold, Boiler, Pipework, Drive (pièces mobiles), ValveGear, WagonWheels (fixes),
      CrankCoil (unité de la bobine : blocs, bobine, manchon, manivelle),
      CoilStand (son bâti en bois), Tanks, Stove, Workbench
      BigLever.tsx      Le grand levier derrière les engrenages, qu'on baisse
      Bellows.tsx       Le soufflet rond du plancher, poussé par sa manivelle
      LogPile.tsx       Le tas de bûches et les trois bûches de Doc à glisser dans le poêle
      Basin.tsx, Tongs.tsx La bassine qu'on lève, la pince qui porte le glaçon
      FireDoor.tsx      La porte du poêle, qui s'ouvre sur les flammes à chaque bûche
      effects/          Vapeur et jet froid (PuffStream), glaçon, secousses, casses
                        (BoilerBlast, Burst, Tear, Vanish, Water)
      pipework/         Les tuyaux : anchors.ts (points partagés), pipes.ts (tracés
                        par série), PipeGauges (manomètres sur tuyau), PipeFittings
                        (bouche du conduit froid, ficelles, bague, sortie de vapeur)
    stable/Stable.tsx   L'écurie : sol, mur de planches, poutres
tests/
  unit/                 Tests Vitest de src/lib
  e2e/                  Tests Playwright
docs/references/        Images de référence du film
```

### Vue

**Vue fixe de face**, comme une scène de point and click : pas de caméra
orbitale. `FrontCamera` recule la caméra pour que le cadre (`FRAME`,
`three/viewFrame.ts`) tienne entier quelle que soit la forme de la fenêtre.

**Inspection** : ajouter `?orbit` à l'URL (http://localhost:1885/?orbit), ou
débloquer toutes les fins, rend la souris libre de tourner autour de la
machine, pour la vérifier pendant la modélisation. Sans cela, la vue reste
fixe.

**Toujours en paysage** : en portrait, `index.css` fait pivoter la page d'un
quart de tour, et le canvas mesure sa taille `offsetSize` (insensible à la
rotation). Le mobile n'est pas la cible : on ne le teste pas.

### Échelle et repère

Mètres, Y vers le haut, Z vers le spectateur, X vers la droite comme sur la
référence de face. Marty (environ 1,75 m) donne l'échelle. Les pièces se
raccordent par les ancres de `machine/layout.ts`.

**Profondeur** : comme dans le film, la chaudière, la plupart des tuyaux et la
roue de charrette centrale passent **devant** l'échafaudage. Les tuyaux courent
dans le plan `layout.pipesZ`, devant `layout.frameFront` (la face des poteaux).

### Cell shading

- Tout passe par `ToonMesh` : `meshToonMaterial` avec un dégradé partagé à 3
  paliers (filtre `Nearest` pour des bandes nettes), et un contour encre.
- Contours : `<Outlines>` de drei (coque inversée). **Piège** : dans cette
  version de drei, le drapeau `screenspace` est inversé. Laissé à `false`,
  l'épaisseur est en pixels du tampon de dessin (d'où le facteur `dpr`) ; à
  `true`, elle est en mètres.
- `outline={0}` pour les surfaces de fond (sol, planches du mur) et les petits
  détails, pour alléger.

---

## Contraintes techniques

- **100% front-end** : aucun appel réseau, pas de backend.
- **Pas de SSR** : Vite SPA uniquement.
- **Plein écran** : la scène occupe toute la fenêtre, rien ne défile.
- **Alias `@/`** vers `src/`. Toujours l'utiliser pour importer d'un autre
  dossier de premier niveau de `src/`.
- **`src/lib/` est pur** : aucun import React ni three.js. Le rendu dépend de
  `lib`, jamais l'inverse. La machine à états de la séquence y vit
  (`sequence.ts`).
- **Modélisation procédurale** : la géométrie est construite en code
  (primitives three.js), pas de modèle externe à importer.
- **Tailwind v4** : `@import 'tailwindcss'`, pas de `tailwind.config.js`.
- **TypeScript strict** : `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`. Ne pas les désactiver.

---

## Règles de développement

- **Code en anglais** (identifiants, commentaires) ; les textes affichés vivent
  dans `i18n/texts.ts`, en français et en anglais (rien d'affiché en dur).
- **Factoriser, pas dupliquer** ; un composant par fichier ; viser < ~300
  lignes par fichier.
- **Pas de code mort** : tout export est utilisé ou testé (`make knip`).
- **Logique pure entièrement testée** (`src/lib/`).
- **Commentaires utiles seulement** : le pourquoi et le non-évident, jamais
  une paraphrase du code.
- **Accessibilité** : cliquables = boutons étiquetés (`title` + `aria-label`
  sur les boutons icônes), focus visible, icônes décoratives en `aria-hidden`.
- **Commits** : pas de trailer `Co-Authored-By`.
- **Typographie** : ne jamais introduire de tiret long (`—` / `–`).

Avant de considérer une tâche terminée : `make check` doit passer.

---

## Commandes (Makefile)

| Commande                                     | Effet                                                       |
| -------------------------------------------- | ----------------------------------------------------------- |
| `make install`                               | Installe les dépendances                                    |
| `make start`                                 | Serveur de dev (http://localhost:1885)                      |
| `make build` / `make preview`                | Build de production / le servir en local                    |
| `make lint` / `make typecheck` / `make knip` | Vérifications (le typecheck couvre `src` et `tests`)        |
| `make format` / `make format-check`          | Prettier sur tout le dépôt (écrire / vérifier)              |
| `make test` (= `make test-unit`)             | Tests unitaires                                             |
| `make test-watch` / `make test-coverage`     | Tests en continu / avec couverture                          |
| `make test-e2e` / `make test-e2e-ui`         | Tests Playwright (installe Chromium au 1er run) / avec l'UI |
| `make fix`                                   | Format + lint                                               |
| `make check`                                 | build + lint + format-check + typecheck + knip + tests      |
| `make clean`                                 | Supprime `dist` et `node_modules`                           |
