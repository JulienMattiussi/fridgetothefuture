import { DoubleSide } from 'three'
import { palette } from '@/three/palette'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { layout } from '@/three/machine/layout'

const { bench, spout } = layout
const top = bench.top

/** The right workbench: the enamel basin under the spout, and Doc's glassware. */
export function Workbench() {
  return (
    <group>
      <Table {...bench} />
      {/* The basin where the ice cube lands. */}
      <ToonMesh
        position={[spout[0], top + 0.05, spout[2]]}
        color={palette.enamel}
        side={DoubleSide}
      >
        <cylinderGeometry args={[0.2, 0.13, 0.1, 32, 1, true]} />
      </ToonMesh>
      <ToonMesh position={[spout[0], top + 0.005, spout[2]]} color={palette.enamel} outline={0}>
        <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
      </ToonMesh>
      {/* Round-bottom flask. */}
      <ToonMesh position={[1.3, top + 0.08, 0.5]} color={palette.glass} opacity={0.5}>
        <sphereGeometry args={[0.08, 20, 14]} />
      </ToonMesh>
      <ToonMesh position={[1.3, top + 0.2, 0.5]} color={palette.glass} opacity={0.5}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
      </ToonMesh>
      {/* Conical flask. */}
      <ToonMesh position={[1.55, top + 0.09, 0.7]} color={palette.glass} opacity={0.5}>
        <cylinderGeometry args={[0.025, 0.09, 0.18, 20]} />
      </ToonMesh>
      {/* Doc's beaker of tea, waiting for its ice cube. */}
      <ToonMesh position={[1.05, top + 0.09, 0.78]} color={palette.glass} opacity={0.45}>
        <cylinderGeometry args={[0.05, 0.045, 0.18, 20]} />
      </ToonMesh>
      <ToonMesh position={[1.05, top + 0.06, 0.78]} color={palette.tea} outline={0}>
        <cylinderGeometry args={[0.043, 0.04, 0.11, 20]} />
      </ToonMesh>
    </group>
  )
}
