import { AxesHelper,Clock, GridHelper, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer, DirectionalLight, WebGLRenderTarget, OrthographicCamera, PlaneGeometry, Mesh, MeshStandardMaterial, SphereGeometry, ShaderMaterial, Vector2, Color } from 'three'
import { OrbitControls } from 'three-stdlib'
import Stats from 'stats.js'
import './style.css'

import CompositionFragmentShader from './shader/composition/fragment.frag';
import CompositionVertexShader from './shader/composition/vertex.vert';
import GaussianBlurFragmentShader from './shader/GaussianBlur/fragment.frag'
import GaussianBlurVertexShader from './shader/GaussianBlur/vertex.vert'
import ContrastFragmentShader from './shader/Contrast/fragment.frag'
import ContrastVertexShader from './shader/Contrast/vertex.vert' 
import SphereFragmentShader from './shader/Sphere/fragment.frag'
import SphereVertexShader from './shader/Sphere/vertex.vert'

const stats = new Stats()
document.body.appendChild(stats.domElement)

const scene = new Scene()

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight,  0.1, 1000)

camera.position.y = 2
camera.position.z = 3


const renderer = new WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const axesHelper = new AxesHelper(10)
const gridHelper = new GridHelper()

// scene.add(axesHelper, gridHelper)

new OrbitControls(camera, renderer.domElement)

const hemLight = new HemisphereLight()
const dirLight = new DirectionalLight()

dirLight.position.set(2, 2, 1)

scene.add(hemLight, dirLight)


// FBO 1
const width = window.innerWidth
const height = window.innerHeight
const fbo_1 = new WebGLRenderTarget(width, height)

const sphereGeometry = new SphereGeometry( 1, 32, 16 )
const sphereMaterial = new MeshStandardMaterial({ color: '#07BEB8' })
const sphere = new Mesh(sphereGeometry, sphereMaterial)

scene.add(sphere)

// const palette = [
//   '#080708', 
//   '#3772ff',
//   '#DF2935',
//   '#FDCA40',
//   '#E6E8E6'
// ]
const palette = [
  '#07BEB8', 
  '#3DCCC7',
  '#68D8D6',
  '#9CEAEF',
  '#C4FFF9'
]
const spheres: Mesh<SphereGeometry, ShaderMaterial>[] = []

for (let i = 0; i < 10; i++) {
  const sphereShaderMaterial = new ShaderMaterial({
    vertexShader: SphereVertexShader,
    fragmentShader: SphereFragmentShader,
    uniforms: {
      uColor: {
        value: new Color( palette[Math.floor(Math.random() * palette.length)] )
      },
      uTime: {
        value: null
      },
      uStrengthX: {
        value: (Math.random() - 0.5) * 10
      },
      uStrengthY: {
        value: (Math.random() - 0.5) * 10
      }
    }
   })
  const _sphere = new Mesh(sphereGeometry, sphereShaderMaterial)

  const scale = Math.random() * 0.7
  _sphere.scale.set(
    scale, 
    scale, 
    scale
    )
    const x = (Math.random() - 0.5) * 4
    const y = (Math.random() - 0.5) * 4
    const z = (Math.random() - 0.5) * 4
  _sphere.position.set(
    x, 
    y, 
    z
    )
  scene.add(_sphere)
  spheres.push(_sphere)
}

// Composition

const compositScene = new Scene()
const compositCamera = new OrthographicCamera(-1, 1, 1,-1, 0.1, 10)
compositCamera.position.z = 5

compositScene.add(compositCamera)

// Apply Gaussian blur
const weight: number[] = []
let t = 0.0;
const blurRadius = 30


for(let i = blurRadius - 1; i >= 0; i--){
  let r = 1.0 + 2.0 * i;
  let w = Math.exp(-0.5 * (r * r) / (blurRadius * blurRadius));
  weight.push(w);
  if(i > 0){w *= 2.0;}
  t += w;
}

for(let i = 0; i < weight.length; i++){
  weight[i] /= t;
}

const fbo_2 = new WebGLRenderTarget(width, height);
const fbo_3 = new WebGLRenderTarget(width, height);
const step = new Vector2(1 / width, 1 / height)

const fboPlaneGeometry = new PlaneGeometry(2, 2);
const defines = {
  BLUR_RADIUS: blurRadius
}

const commonUniforms = {
  uStep: {
    value: step
  },
  uWeight: {
    value: weight
  }
}

const vertical = new Mesh(
  fboPlaneGeometry,
  new ShaderMaterial({
    vertexShader: GaussianBlurVertexShader,
    fragmentShader: GaussianBlurFragmentShader,
    uniforms: {
      uDiffuse: {
        value: fbo_1.texture
      },
      uStepSize: {
        value: new Vector2(1.0, 0.0)
      },
      ...commonUniforms
    },
    defines
  })
);

const horizontal = new Mesh(
  fboPlaneGeometry,
  new ShaderMaterial({
    vertexShader: GaussianBlurVertexShader,
    fragmentShader:GaussianBlurFragmentShader,
    uniforms: {
      uDiffuse: {
        value: fbo_2.texture
      },
      uStepSize: {
        value: new Vector2(0.0, 1.0)
      },
      ...commonUniforms
    },
    defines
  })
);

const outputMesh = new Mesh(
  new PlaneGeometry(2, 2),
  new ShaderMaterial({
      vertexShader: ContrastVertexShader,
      fragmentShader: ContrastFragmentShader,
      uniforms: {
          uDiffuse: {
              value: fbo_3.texture
          }
      },
      transparent: true
  })
);

const planeGeometry = new PlaneGeometry(2, 2);
// const planeMaterial = new MeshStandardMaterial({wireframe: true})
const planeMaterial = new ShaderMaterial({
    fragmentShader: CompositionFragmentShader,
    vertexShader: CompositionVertexShader,
    uniforms: {
      uDefaultTexture: {
        value: fbo_3.texture
      }
    }
    // wireframe: true,
  });
  const plane = new Mesh(planeGeometry, planeMaterial)

  compositScene.add(plane)

const clock = new Clock()

render()

function render() {
  stats.begin()

  const time = clock.getElapsedTime()
  spheres.forEach(sphere => {
    sphere.material.uniforms.uTime.value = time
  })

  renderer.setClearColor(0xffffff, 0.0)
  renderer.setRenderTarget(fbo_1);
  renderer.render(scene, camera);

  renderer.setRenderTarget(fbo_2);
  renderer.render(vertical, camera);

  renderer.setRenderTarget(fbo_3);
  renderer.render(horizontal, camera);

  //output to canvas
  //set the background color here
  renderer.setClearColor(0xe0e7ff, 1.0)
  renderer.setRenderTarget(null);
  renderer.render(outputMesh, camera);

  // renderer.setRenderTarget(null);
  // renderer.render(scene, camera)
  // renderer.render(compositScene, compositCamera)
  stats.end()
  requestAnimationFrame(render)
}

resize()
window.addEventListener('resize', resize)

function resize() {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}