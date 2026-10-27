import { palette } from '@/three/palette'
import { Gauge } from '@/three/parts/Gauge'
import { Rod } from '@/three/parts/Rod'
import { Table } from '@/three/parts/Table'
import { ToonMesh } from '@/three/parts/ToonMesh'
import { Wheel } from '@/three/parts/Wheel'
import { layout } from '@/three/machine/layout'

const { table } = layout
const BOX = { x: -1.55, z: 0.05, width: 0.8, height: 0.6, depth: 0.6 }
const boxFront = BOX.z + BOX.depth / 2
const boxBottom = table.top + 0.03

/**
 * The left table and its iron box, where Marty stands: the big gauges, the
 * valve to turn "all the way to the left", and the engine lever.
 */
export function ControlBox() {
  return (
    <group>
      <Table {...table} />
      <ToonMesh position={[BOX.x, boxBottom + BOX.height / 2, BOX.z]} color={palette.iron}>
        <boxGeometry args={[BOX.width, BOX.height, BOX.depth]} />
      </ToonMesh>
      <Gauge
        position={[-1.75, boxBottom + BOX.height + 0.12, boxFront - 0.05]}
        rotation={[-0.25, 0, 0]}
        radius={0.14}
      />
      <Gauge
        position={[-1.42, boxBottom + BOX.height + 0.06, boxFront]}
        rotation={[-0.25, 0, 0]}
        radius={0.1}
        reading={0.4}
      />
      {/* The valve: stem out of the box's lower left, red handwheel. */}
      <Rod
        from={[-1.78, boxBottom + 0.18, boxFront]}
        to={[-1.78, boxBottom + 0.18, boxFront + 0.12]}
        radius={0.02}
        color={palette.steel}
      />
      <Wheel
        position={[-1.78, boxBottom + 0.18, boxFront + 0.12]}
        radius={0.11}
        spokes={5}
        tire={false}
        color={palette.rustDark}
      />
      {/* The engine lever, on the table's right. */}
      <group position={[-1.05, table.top + 0.03, 0.3]} rotation={[0, 0, -0.35]}>
        <ToonMesh position={[0, 0.03, 0]} color={palette.iron}>
          <boxGeometry args={[0.1, 0.06, 0.1]} />
        </ToonMesh>
        <Rod from={[0, 0.03, 0]} to={[0, 0.45, 0]} radius={0.015} color={palette.steel} />
        <ToonMesh position={[0, 0.47, 0]} color={palette.brass}>
          <sphereGeometry args={[0.035, 16, 12]} />
        </ToonMesh>
      </group>
    </group>
  )
}
