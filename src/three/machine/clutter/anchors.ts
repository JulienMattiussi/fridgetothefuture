import { layout } from '@/three/machine/layout'

/** The clutter's pipes: a little thinner than the machine's. */
export const CLUTTER_PIPE = 0.04
/** Where pipes end in the deck's underside, the right shelf's, the wall, the floor. */
export const DECK_UNDER = layout.deckY - 0.035
export const SHELF_UNDER = layout.shelfY - 0.035
/** The wall's planks are set a little in and out: at its line, a flange sits on every one. */
export const WALL_FACE = layout.wallZ
