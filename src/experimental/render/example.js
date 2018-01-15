import {triangulate as triangulateSN} from "../isosurface/surfacenets"
import {triangulate as triangulateMC} from "../isosurface/marchingcubes";
import {triangulate as triangulateTT} from "../isosurface/marchingtetrahedra";
import mat4 from "gl-mat4"
import initREGL from "regl"
const regl = initREGL(document.body)
const d = 16, dims = [d, d, d], bounds = [[-10, -10, -10], [10, 10, 10]] // dims and bounds of the sphere
const sphereSN = triangulateSN(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphereMC = triangulateMC(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphereTT = triangulateTT(dims, (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const sphere = sphereSN
const draw = regl({
  primitive: "lines",
  vert: `
  precision mediump float;
  attribute vec3 position;
  uniform mat4 model, view, projection;
  void main() {
    gl_Position = projection * view * model * vec4(position, 1);
  }`,
  frag: `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
  }`,
  attributes: {position: sphere.positions},
  elements: sphere.cells,
  uniforms: {
    model: mat4.identity([]),
    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([],
        [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
        [0, 2.5, 0],
        [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000)
  }
})
regl.frame(() => {
  regl.clear({
    depth: 1,
    color: [0, 0, 0, 1]
  })
  draw()
})
