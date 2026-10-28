import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'

/**
 * The part that set the pointer's cursor last, and the parts the pointer is
 * on or working: shared by all the parts, as a part left hands over to the
 * next one before it has let go.
 */
let cursorOwner: symbol | null = null
const workedParts = new Set<symbol>()

/**
 * What a part the visitor works does to the pointer: while `working`, the free
 * view's controls hold still (they would turn the view instead); while
 * `cursor` is set, the page shows it. Parts hand both over cleanly: one left
 * never undoes what the next one, already under the pointer, has set.
 */
export function usePartPointer(working: boolean, cursor: string | null) {
  const get = useThree((state) => state.get)
  const [id] = useState(() => Symbol('part'))
  useEffect(() => {
    const controls = get().controls as { enabled: boolean } | null
    if (!controls || !working) return
    workedParts.add(id)
    controls.enabled = false
    return () => {
      workedParts.delete(id)
      if (workedParts.size === 0) controls.enabled = true
    }
  }, [get, working, id])
  useEffect(() => {
    if (cursor === null) return
    cursorOwner = id
    document.body.style.cursor = cursor
    return () => {
      if (cursorOwner !== id) return
      cursorOwner = null
      document.body.style.cursor = ''
    }
  }, [cursor, id])
}
