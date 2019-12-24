NUM_PARTICLES = 40000;

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
    this.speed = Math.random() * .075 + .025; // speed from .05 to .30
    this.frequency = 1; // every particle completes 1 cycle
    this.amplitude = gaussRand(7) * .2; // amplitude from 0 to .2
    this.yShift = gaussRand(20) * .6 - .3; // vertical shift from -.25 to .25
    this.z = gaussRand() * .5 + .25;
    // Visual properties
    this.opacity = Math.random() * .5 + .25; // opacity from .25 to .75
    this.size = Math.floor(Math.random() * 10 + 5); // size from 5px to 20px
  }

  position(time) {
    const progress = (this.startProgress + time * this.speed) % 1;
    return [
    // Go off front and back edge of screen a bit
    progress * 1.1 - 0.05,
    0.5 + this.yShift + this.amplitude * Math.sin(progress * 2 * Math.PI),
    this.z];

  }}





// RENDERING ENGINE




class ParticleRenderer {
  constructor(container, numParticles) {
    // Set up scene

    this.scene = new THREE.Scene();
    // Define particles
    this.particles = new Array(numParticles).
    fill(null).
    map(() => new Particle());
    // Create three.js vertices from particles
    this.points = new THREE.Geometry();
    this.points.vertices = this.particles.
    map(p => new THREE.Vector3(...p.position(0).map(c => c * 2 - 1)));
    this.points.dynamic = true;
    // Define material
    const material = new THREE.PointsMaterial({ size: .025, color: 0xFFFFFF, opacity: .25, transparent: true });
    material.depthWrite = false;
    // Create points system from vertices and material
    this.system = new THREE.Points(this.points, material);
    // and add it to the scene
    this.scene.add(this.system);

    // Set up camera

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    this.camera.position.z = 2.5;

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

    this.points.vertices.
    forEach((particle, i) => {
      particle.fromArray(this.particles[i].position(this.elapsedTime).map(c => c * 2 - 1));
    });
    this.points.verticesNeedUpdate = true;

    // this.system.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }}



const renderer = new ParticleRenderer(document.getElementById('container'), NUM_PARTICLES);
renderer.render();