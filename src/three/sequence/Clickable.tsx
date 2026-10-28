import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import type { Action } from '@/lib/sequence'
import { useSequence } from '@/three/sequence/context'

interface ClickableProps {
  action: Action
  children: ReactNode
}

/**
 * Wraps a part the visitor works by clicking it: the click plays `action`
 * when the sequence waits for it, and the pointer shows a hand meanwhile.
 * The overlay offers the same actions as real buttons, for the keyboard.
 */
export function Clickable({ action, children }: ClickableProps) {
  const sequence = useSequence()
  const ready = () => sequence?.can(action) ?? false
  const setCursor = (pointer: boolean) => {
    document.body.style.cursor = pointer ? 'pointer' : ''
  }
  return (
    <group
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        if (ready()) {
          sequence?.act(action)
          setCursor(false)
        }
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setCursor(ready())
      }}
      onPointerOut={() => setCursor(false)}
    >
      {children}
    </group>
  )
}
