# Fridge to the Future - Agent File

## Description du projet

Page web plein écran qui modélise en **3D cell shading** le **réfrigérateur à
vapeur de Doc Brown** dans _Retour vers le futur III_ (1885, l'écurie de
Hill Valley). La machine doit être **fidèle au film** et **interactive** :
mêmes mécanismes, mêmes leviers et roues à actionner.

Application **100% front-end**, sans backend. Interface en français.

### Références visuelles

- `docs/references/machine-face.webp` : la machine de face (Marty à gauche,
  Doc à droite). Source de vérité pour la disposition.
- `docs/references/iced-tea.webp` : Doc lève son bécher de thé glacé.

Ce qu'on y voit : un échafaudage en bois brut sur deux niveaux contre le mur ;
une grosse chaudière cylindrique rouillée au centre ; de longs tuyaux gris en
diagonale (du haut à droite vers la gauche) ; une dizaine de manomètres ; deux
roues de charrette à rayons en guise de volants en bas ; un volant à courroie
et des engrenages en haut à gauche ; une cuve en verre et un réservoir en haut
à droite ; un établi à droite avec une bassine émaillée blanche et de la
verrerie de chimie. Les côtés, l'arrière et le haut ne sont pas visibles :
on les complète de façon plausible.

### La séquence du film

1. Doc lance le moteur à vapeur : roues, engrenages et un long tapis roulant
   se mettent en marche par à-coups, de la fumée sort par le haut.
2. La machine cogne et vibre violemment ; le sifflet à vapeur retentit.
3. Doc : « Tourne cette vanne à fond vers la gauche ! » (en bas à gauche).
4. La machine tousse et un seul glaçon brunâtre tombe d'un bec sur la table.
   Doc le met dans son bécher de thé : « Iced tea? »

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
    geometry.ts         Segments, angles réguliers, points sur un cercle
    framing.ts          Recul de caméra pour cadrer la scène
  three/                Rendu 3D (composants R3F, hooks three.js)
    Scene.tsx           Canvas et lumières
    FrontCamera.tsx     Caméra fixe de face, recadrée selon la fenêtre
    palette.ts          Les couleurs de la scène
    parts/              Briques réutilisables
      ToonMesh.tsx      Mesh cell shading + contour (base de tout le reste)
      Rod.tsx, Beam.tsx Barre ronde / poutre carrée d'un point à un autre
      Pipe.tsx          Tuyau en segments, coudes arrondis
      Wheel.tsx         Roue à rayons (roue de charrette, volant de vanne)
      Gear.tsx, Gauge.tsx Engrenage, manomètre
      Table.tsx         Table sur quatre pieds
    machine/            La machine de Doc, une pièce par fichier
      layout.ts         Les points d'ancrage partagés (en mètres)
      Machine.tsx       Assemble les pièces + les manomètres épars
      Scaffold, Boiler, Pipework, Drive, ControlBox, Tanks, Workbench
    stable/Stable.tsx   L'écurie : sol, mur de planches, poutres
tests/
  unit/                 Tests Vitest de src/lib
  e2e/                  Tests Playwright
docs/references/        Images de référence du film
```

### Vue

**Vue fixe de face**, comme une scène de point and click : pas de caméra
orbitale. `FrontCamera` recule la caméra pour que le cadre (`FRAME`) tienne
entier quelle que soit la forme de la fenêtre.

**Toujours en paysage** : en portrait, `index.css` fait pivoter la page d'un
quart de tour, et le canvas mesure sa taille `offsetSize` (insensible à la
rotation). Le mobile n'est pas la cible : on ne le teste pas.

### Échelle et repère

Mètres, Y vers le haut, Z vers le spectateur, X vers la droite comme sur la
référence de face. Marty (environ 1,75 m) donne l'échelle. Les pièces se
raccordent par les ancres de `machine/layout.ts`.

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
  `lib`, jamais l'inverse. La machine à états de la séquence y vivra.
- **Modélisation procédurale** : la géométrie est construite en code
  (primitives three.js), pas de modèle externe à importer.
- **Tailwind v4** : `@import 'tailwindcss'`, pas de `tailwind.config.js`.
- **TypeScript strict** : `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`. Ne pas les désactiver.

---

## Règles de développement

- **Code en anglais** (identifiants, commentaires) ; seuls les textes affichés
  sont en français.
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
