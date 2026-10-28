import type { ReactNode } from 'react'

/** The frame's metal: polished brass, or rusted iron for a breakdown. */
const FRAMES = {
  brass: 'from-[#f4dc98] via-[#b07d36] to-[#5c3a14]',
  rust: 'from-[#e09a6a] via-[#8f3b22] to-[#3d140b]',
}

const RIVET =
  'absolute h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff3c4,#c08f3e_45%,#4a2e10)] shadow-[0_1px_1px_rgba(0,0,0,0.7)]'

/**
 * A plate in the machine's own style: dark leather in a metal frame, riveted
 * at the corners, its writing in a serif face.
 */
export function Plate({
  metal = 'brass',
  compact = false,
  className = '',
  children,
}: {
  metal?: keyof typeof FRAMES
  /** A slim plate, for a line of text. */
  compact?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`pointer-events-auto rounded-2xl bg-linear-to-b p-[3px] shadow-[0_18px_50px_rgba(0,0,0,0.7)] ${FRAMES[metal]} ${className}`}
    >
      <div
        className={`relative rounded-[13px] bg-[radial-gradient(ellipse_at_top,#3a2516,#1c110a_70%)] font-serif text-[#f3e6cf] shadow-[inset_0_0_24px_rgba(0,0,0,0.8)] ${
          compact ? 'px-9 py-2.5' : 'px-8 py-5'
        }`}
      >
        {(compact
          ? ['top-1/2 left-3 -translate-y-1/2', 'top-1/2 right-3 -translate-y-1/2']
          : ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2']
        ).map((at) => (
          <span key={at} aria-hidden="true" className={`${RIVET} ${at}`} />
        ))}
        {children}
      </div>
    </div>
  )
}

/** An engraved title on a plate. */
export function PlateTitle({
  children,
  tone = 'brass',
  small = false,
}: {
  children: ReactNode
  tone?: 'brass' | 'rust'
  /** A smaller title, for a narrow plate (a long word must fit). */
  small?: boolean
}) {
  return (
    <p
      className={`text-center font-bold uppercase ${
        small ? 'text-2xl tracking-[0.12em]' : 'text-3xl tracking-[0.2em]'
      } [text-shadow:0_2px_0_rgba(0,0,0,0.8),0_0_18px_rgba(255,190,90,0.35)] ${
        tone === 'brass' ? 'text-[#f0cf7f]' : 'text-[#f08a5d]'
      }`}
    >
      {children}
    </p>
  )
}

/** A thin ornamental rule: a line with a little gear-like dot in the middle. */
export function PlateRule() {
  return (
    <div aria-hidden="true" className="my-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#b07d36]" />
      <span className="h-2 w-2 rotate-45 border border-[#d9b25f] bg-[#5c3a14]" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#b07d36]" />
    </div>
  )
}

/** A brass push button. */
export const BRASS_BUTTON =
  'pointer-events-auto rounded-md border border-[#f4dc98]/60 bg-linear-to-b from-[#d9b25f] to-[#8a5a22] px-5 py-1.5 font-serif font-semibold tracking-wide text-[#1c110a] shadow-[0_3px_0_#4a2e10,0_6px_14px_rgba(0,0,0,0.5)] transition hover:brightness-110 active:translate-y-[2px] active:shadow-[0_1px_0_#4a2e10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0cf7f]'
