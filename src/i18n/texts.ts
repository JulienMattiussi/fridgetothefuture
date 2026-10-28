import type { Ending } from '@/lib/endings'
import type { Language } from '@/lib/language'

/** Every text the page shows, in one language. */
export interface Texts {
  /** The page's title, and the 3D scene's label. */
  title: string
  scene: string
  /** What to do or what happens, phase by phase. */
  hints: Record<string, string>
  success: string
  failure: string
  mishandled: string
  unlocked: (n: number) => string
  ending: (n: number) => string
  restart: string
  trophies: string
  count: (seen: number, total: number) => string
  endings: Record<Ending, string>
  hidden: string
  orbit: string
  secret: string
  language: string
}

export const TEXTS: Record<Language, Texts> = {
  fr: {
    title: 'Fridge to the Future : le réfrigérateur de Doc Brown',
    scene: 'Le réfrigérateur de Doc Brown',
    hints: {
      idle: 'Glissez les bûches de Doc dans le poêle, dans l’ordre : verte, jaune, rouge.',
      stoking: 'Le feu prend...',
      lit: 'Ouvrez la petite vanne en bas à droite : tournez vers la gauche.',
      primed: 'Montez à l’échelle de la cuve.',
      climbed: 'Ouvrez la vanne du haut pour lancer le moteur : tournez vers la droite.',
      starting: 'Le moteur démarre par à-coups...',
      running: '« Tourne à fond vers la gauche ! »',
      cranked: 'Ouvrez la grande vanne de cuivre : tournez vers la droite.',
      jet: 'Le froid jaillit du conduit : levez la bassine dessous.',
      waiting: 'Le froid retombe... attendez.',
      dropping: 'Un glaçon tombe !',
      caught: 'Prenez le glaçon à la pince et mettez-le dans le verre.',
      served: '« Thé glacé ? »',
    },
    success: 'Réussite',
    failure: 'Échec',
    mishandled: 'Il y a eu une erreur de manipulation.',
    unlocked: (n) => `Fin n°${n} débloquée !`,
    ending: (n) => `Fin n°${n}`,
    restart: 'Recommencer',
    trophies: 'Succès',
    count: (seen, total) => `${seen} / ${total} fins`,
    endings: {
      served: 'Thé glacé',
      boilerExplodes: 'Explosion',
      gaugesBurst: 'Manomètres en éclats',
      pipeBurst: 'Tuyau arraché',
      water: 'Eau du robinet',
      cubeOnFloor: 'Glaçon par terre',
      noIce: 'Froid sans glaçon',
    },
    hidden: '????',
    orbit: 'Mode rotation',
    secret: 'Toutes les fins débloquent un mode secret.',
    language: 'Langue',
  },
  en: {
    title: 'Fridge to the Future: Doc Brown’s refrigerator',
    scene: 'Doc Brown’s refrigerator',
    hints: {
      idle: 'Drag Doc’s logs into the stove, in order: green, yellow, red.',
      stoking: 'The fire is catching...',
      lit: 'Open the small valve, bottom right: turn it left.',
      primed: 'Climb the vat’s ladder.',
      climbed: 'Open the top valve to start the engine: turn it right.',
      starting: 'The engine starts up by fits...',
      running: '“Turn it hard to the left!”',
      cranked: 'Open the big copper valve: turn it right.',
      jet: 'The cold gushes out of the duct: lift the basin under it.',
      waiting: 'The cold dies down... wait.',
      dropping: 'An ice cube drops!',
      caught: 'Take the ice cube with the tongs and put it in the glass.',
      served: '“Iced tea?”',
    },
    success: 'Success',
    failure: 'Failure',
    mishandled: 'Something was handled wrong.',
    unlocked: (n) => `Ending #${n} unlocked!`,
    ending: (n) => `Ending #${n}`,
    restart: 'Start over',
    trophies: 'Achievements',
    count: (seen, total) => `${seen} / ${total} endings`,
    endings: {
      served: 'Iced tea',
      boilerExplodes: 'Explosion',
      gaugesBurst: 'Shattered gauges',
      pipeBurst: 'Torn-off pipe',
      water: 'Tap water',
      cubeOnFloor: 'Ice on the floor',
      noIce: 'Cold, no ice',
    },
    hidden: '????',
    orbit: 'Rotation mode',
    secret: 'Every ending unlocks a secret mode.',
    language: 'Language',
  },
}
