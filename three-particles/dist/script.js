NUM_PARTICLES = 2750;

// Averages multiple random values to simulate gaussian distribution. Higher values of n result in
// a tighter focus.
function gaussRand(samples = 6) {
  let rand = 0;
  for (let i = 0; i < samples; i += 1) rand += Math.random();
  return rand / samples;
}


// PARTICLE ENGINE

class Particle {
  constructor() {
    // Mechanical properties
    this.startProgress = Math.random(); // starting position from 0 to 1
    this.speed = Math.random() * .08 + .02; // speed from 0.02 to 0.1
    this.frequency = 1; // every particle completes 1 cycle
    this.amplitude = gaussRand(9) * .15; // amplitude from 0 to 0.15
    this.yShift = gaussRand(20) * .6 - .3; // vertical shift from -0.3 to 0.3
    // Visual properties
    this.opacity = Math.random() * .5 + .15; // opacity from 0.15 to 0.65
    this.size = (Math.random() * 6 + 1) * // size from 1px to 7px
    window.devicePixelRatio; // same size range on all screens
  }

  position(time) {
    const progress = (this.startProgress + time * this.speed) % 1;
    return [
    progress,
    0.5 + this.yShift - this.amplitude * Math.sin(progress * this.frequency * 2 * Math.PI),
    0];

  }}





// RENDERING ENGINE



const cameraDistance = 1.5;

const vertexShader = `
attribute float size;
attribute float particleOpacity;

varying float opacity;

void main() {
    opacity = particleOpacity;

    // Appear at 1x scale from a distance of 1.5
    float scale = 3. / (${cameraDistance.toFixed(5)} + 1.5);
    gl_PointSize = size * scale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying float opacity;

void main() {
    vec2 st = gl_PointCoord;
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5, 0.5));
    float inCircle = 1. - smoothstep(0.45, 0.55, distanceFromCenter);
    gl_FragColor = mix(vec4(1., 1., 1., 0.), vec4 (1., 1., 1., opacity), inCircle);
}
`;


class ParticleRenderer {
  constructor(container, numParticles) {
    // Set up scene

    this.scene = new THREE.Scene();
    // Define particles
    this.particles = new Array(numParticles).
    fill(null).
    map(() => new Particle());
    // Create geometry from particles
    this.points = new THREE.BufferGeometry();
    this.points.setAttribute('position',
    new THREE.BufferAttribute(this._getParticlePositions(0), 3));
    const sizes = new Float32Array(this.particles.length);
    const opacities = new Float32Array(this.particles.length);
    this.particles.forEach((p, i) => {
      sizes[i] = p.size;
      opacities[i] = p.opacity;
    });
    this.points.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.points.setAttribute('particleOpacity', new THREE.BufferAttribute(opacities, 1));
    // Define material
    const material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader,
      fragmentShader,
      depthTest: false,
      transparent: true });

    material.depthWrite = false;
    // Create points system from vertices and material
    this.system = new THREE.Points(this.points, material);
    // and add it to the scene
    this.scene.add(this.system);

    // Set up camera

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    this.camera.position.z = cameraDistance;

    // Set up renderer

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Set up stats

    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.classList.add('stats');
    container.appendChild(this.stats.domElement);

    // Misc

    this.startTime = 0;
    requestAnimationFrame(() => this.resize());
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    this.camera.updateProjectionMatrix();
  }

  get elapsedTime() {
    // First call
    if (!this.startTime) {
      this.startTime = new Date();
      return 0;
    }
    // Subsequent calls
    return (new Date() - this.startTime) / 1000;
  }

  // Get the final position in 3D space for each particle at a given time
  // Returns a Float32Array suitable for direct use in a THREE.BufferAttribute
  _getParticlePositions(elapsedTime) {
    return Float32Array.from(this.particles.
    flatMap(p => {
      // Get position
      let [x, y, z] = p.position(elapsedTime);
      // Scale X coordinates to make sure simulation fits viewport
      // Aspect ratio of 0.95 requires no adjustment; we scale X coords based on this ideal
      const { aspect } = this.camera || { aspect: 1.5 };
      const scaleFactor = aspect / 0.95;
      const xScale = Math.max(scaleFactor, 1); // don't squish, only stretch
      x = x * xScale - (xScale - 1) / 2;
      // Scale all coordinates from (0, 1) bounds to (-1, 1) bounds
      return [x, y, z].map(c => c * 2 - 1);
    }));
  }

  render() {
    this.stats.update();
    const time = this.elapsedTime;

    const positions = this._getParticlePositions(this.elapsedTime);
    this.points.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }}



const renderer = new ParticleRenderer(document.getElementById('container'), NUM_PARTICLES);
renderer.render();
