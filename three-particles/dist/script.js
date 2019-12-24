NUM_PARTICLES = 2500;

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
    this.amplitude = gaussRand(7) * .2; // amplitude from 0 to 0.2
    this.yShift = gaussRand(20) * .6 - .3; // vertical shift from -0.3 to 0.3
    this.z = gaussRand() * .5 - .25; // z position from -0.25 to 0.25
    // Visual properties
    this.opacity = Math.random() * .5 + .15; // opacity from 0.15 to 0.65
    this.size = (Math.random() ** 2 * 5 + 4) // size from 4px to 9px (focused lower)
      * window.devicePixelRatio; // same size range on all screens
  }

  position(time) {
    const progress = (this.startProgress + time * this.speed) % 1;
    return [
    progress,
    0.5 + this.yShift + this.amplitude * Math.sin(progress * this.frequency * 2 * Math.PI),
    this.z];

  }}





// RENDERING ENGINE



const cameraDistance = 1.5;

const vertexShader = `
attribute float size;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Appear at 1x scale from a distance of 1.5
    float scale = 3. / (${cameraDistance.toFixed(5)} + 1.5);
    gl_PointSize = size * scale;

    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
void main() {
    vec2 st = gl_PointCoord;
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5, 0.5));
    float inCircle = 1. - smoothstep(0.45, 0.55, distanceFromCenter);
    gl_FragColor = mix(vec4(0., 0., 0., 0.), vec4 (1., 1., 1., .25), inCircle);
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
    // Create three.js vertices from particles
    this.points = new THREE.BufferGeometry();
    const initialPositions = this.particles.flatMap(p => p.position(0).map(c => c * 2 - 1));
    this.points.setAttribute(
    'position',
    new THREE.BufferAttribute(Float32Array.from(initialPositions), 3));

    const sizes = this.particles.map(p => p.size);
    this.points.setAttribute('size', new THREE.BufferAttribute(Float32Array.from(sizes), 1));
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

  render() {
    this.stats.update();
    const time = this.elapsedTime;

    const positions = Float32Array.from(this.particles.flatMap(p => p.position(this.elapsedTime).map(c => c * 2 - 1)));
    this.points.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }}



const renderer = new ParticleRenderer(document.getElementById('container'), NUM_PARTICLES);
renderer.render();
