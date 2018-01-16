import {triangulate as triangulateSN} from "../isosurface/surfacenets"
import {triangulate as triangulateMC} from "../isosurface/marchingcubes";
import {triangulate as triangulateTT} from "../isosurface/marchingtetrahedra";
import mat4 from "gl-mat4"
import initREGL from "regl"
import initOCAM from "canvas-orbit-camera"
import fit from "canvas-fit"

const canvas = document.body.appendChild(document.createElement("canvas"))
const regl = initREGL(canvas)
const camera = initOCAM(canvas)
window.addEventListener("resize", fit(canvas), false)
const d = 16, dims = [d, d, d], bounds = [[-10, -10, -10], [10, 10, 10]] // dims and bounds of the sphere
const sphereSN = triangulateSN(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphereMC = triangulateMC(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphereTT = triangulateTT(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphere = sphereSN
// configure intial camera view.
camera.rotate([0.0, 0.0], [0.0, -0.4])
camera.zoom(15.0)
// all the positions of a single block.
let blockPosition = [
  [[-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5]],
  [[+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5]],
  [[+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5]],
  [[-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5]],
  [[-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5]]
]
// all the uvs of a single block.
let blockUv = [
  [[0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [0.0, 1.0]],
  [[0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [0.0, 1.0]],
  [[0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [0.0, 1.0]],
  [[0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [0.0, 1.0]],
  [[0.0, 0.0], [0.5, 0.0], [0.5, 0.5], [0.0, 0.5]]
]
// all the normals of a single block.
let blockNormal = [
  [[0.0, 0.0, +1.0], [0.0, 0.0, +1.0], [0.0, 0.0, +1.0], [0.0, 0.0, +1.0]],
  [[+1.0, 0.0, 0.0], [+1.0, 0.0, 0.0], [+1.0, 0.0, 0.0], [+1.0, 0.0, 0.0]],
  [[0.0, 0.0, -1.0], [0.0, 0.0, -1.0], [0.0, 0.0, -1.0], [0.0, 0.0, -1.0]],
  [[-1.0, 0.0, 0.0], [-1.0, 0.0, 0.0], [-1.0, 0.0, 0.0], [-1.0, 0.0, 0.0]],
  [[0.0, +1.0, 0.0], [0.0, +1.0, 0.0], [0.0, +1.0, 0.0], [0.0, +1.0, 0.0]]
]
// the terrain is just described by some sine functions.
let evalHeight = (x, z) => {
  let freq = 30.0
  return Math.round(
    2.0 * Math.sin(freq * 3.14 * x) * Math.sin(freq * 2.0 * 3.14 * z) +
    3.0 * Math.cos(freq * 4.0 * 3.14 * x + 2.1) * Math.sin(freq * 5.0 * 3.14 * z + 0.9) +
    Math.cos(freq * 8.0 * 3.14 * x + 43.43) * Math.cos(freq * 3.0 * 3.14 * z + 34.3))
}
// these contains all the geometry of the world.
// you can add blocks to these arrays by calling addBlock()
let uv = []
let elements = []
let position = []
let normal = []
let addBlock = (x, y, z) => {
  let index = position.length
  for (let i = 0; i < 5; i++) {
    if (i === 0 && y <= evalHeight(x, z + 1)) { // positive z face
      continue // not visible, skip
    }
    if (i === 1 && y <= evalHeight(x + 1, z)) { // positive x face
      continue // not visible, skip
    }
    if (i === 2 && y <= evalHeight(x, z - 1)) { // negative z face
      continue // not visible, skip
    }
    if (i === 3 && y <= evalHeight(x - 1, z)) { // negative x face
      continue // not visible, skip
    }
    let j
    // add positions.
    for (j = 0; j < blockPosition[i].length; j++) {
      let p = blockPosition[i][j]
      position.push([p[0] + x, p[1] + y, p[2] + z])
    }
    // add normals.
    for (j = 0; j < blockNormal[i].length; j++) {
      let n = blockNormal[i][j]
      normal.push([n[0], n[1], n[2]])
    }
    // add uvs.
    for (j = 0; j < blockUv[i].length; j++) {
      let a = blockUv[i][j]
      uv.push([a[0], a[1]])
    }
    // add quad face.
    elements.push([2 + index, 1 + index, index])
    elements.push([2 + index, index, 3 + index])
    index += 4 // next quad.
  }
}
const S = 10 // world size.
// create world:
for (let x = -S; x <= S; x++) {
  for (let z = -S; z <= S; z++) {
    let y = evalHeight(x, z)
    addBlock(x, y, z)
  }
}
// now the world has been created. Now create the draw call.
const drawWorld = regl({
  cull: {
    enable: true,
    face: 'back'
  },
  context: {
    view: () => camera.view()
  },
  vert: `
  precision mediump float;
  attribute vec3 position, normal;
  attribute vec2 uv;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform mat4 projection, view;
  void main() {
    vUv = uv;
    vNormal = normal;
    gl_Position = projection * view * vec4(position, 1);
  }`,
  frag: `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main () {
    vec3 lightDir = normalize(vec3(0.4, 0.9, 0.3));
    vec3 tex = vec3(1.0, 1.0, 1.0);
    vec3 ambient = 0.3 * tex;
    vec3 diffuse = 0.7 * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
    gl_FragColor = vec4(ambient + diffuse, 1.0);
  }`,
  uniforms: {
    view: regl.context('view'),
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000)
  },
  attributes: {
    position: regl.prop('position'),
    uv: regl.prop('uv'),
    normal: regl.prop('normal')
  },
  elements: regl.prop('elements')
})

regl.frame(() => {
  drawWorld({position, elements, uv, normal})
  camera.tick()
})
