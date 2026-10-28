/** The gestures a part is worked by. */
export type Gesture = 'click' | 'turnLeft' | 'turnRight' | 'drag'

/**
 * The sign over a part the visitor can work, showing the gesture: a circling
 * arrow to turn it (its way), a tap to click it, a hand moving off to drag it.
 */
export function GestureSign({ gesture }: { gesture: Gesture }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-amber-200"
    >
      {gesture === 'turnLeft' || gesture === 'turnRight' ? (
        // Mirrored, the clockwise arrow spinning clockwise turns the other way round.
        <div style={gesture === 'turnRight' ? undefined : { transform: 'scaleX(-1)' }}>
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 animate-[spin_1.5s_linear_infinite]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* A three-quarter circle, clockwise from the top, its arrowhead at the left. */}
            <path d="M12 4a8 8 0 1 1-8 8" />
            <path d="M1 15l3-3 3 3" />
          </svg>
        </div>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className={`h-7 w-7 ${gesture === 'drag' ? 'animate-pulse' : 'animate-bounce'}`}
          fill="currentColor"
        >
          {/* A pointing hand's finger and palm. */}
          <path d="M10 3a1.5 1.5 0 0 1 3 0v7l4.2.8a2 2 0 0 1 1.6 2.3L18 18a3 3 0 0 1-3 2.5h-3.6a3 3 0 0 1-2.4-1.2l-3.6-4.8a1.4 1.4 0 0 1 2.1-1.8L10 15V3z" />
          {gesture === 'drag' && (
            // An arrow off to the side: take it somewhere.
            <path
              d="M18 5h5m0 0l-2-2m2 2l-2 2"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
          )}
        </svg>
      )}
    </div>
  )
}

/**
 * Where a dragged part goes: a pulsing ring, see-through so the part shows in
 * it; with the part over it, it swells and lights up, ready to take it.
 */
export function DropSign({ over }: { over: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`h-14 w-14 rounded-full border-4 transition-transform duration-150 ${
        over
          ? 'scale-150 border-amber-200 bg-amber-300/25 shadow-[0_0_24px_8px_rgba(252,211,77,0.7)]'
          : 'animate-pulse border-amber-300'
      }`}
    />
  )
}
