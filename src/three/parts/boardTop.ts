/** A shelf board's thickness (ShelfBoard). */
export const BOARD_THICKNESS = 0.03

/** The height things stand at on a board whose middle is at `y`. */
export const onBoard = (y: number) => y + BOARD_THICKNESS / 2
