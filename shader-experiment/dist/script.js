const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
#ifdef GL_ES
precision lowp float;
#endif

#define PI 3.141592653

uniform vec2 u_resolution;
uniform float u_time;


float random(float seed) { return fract(sin(seed) * 100000.); }


const int numParticles = 50;
vec4 particles[numParticles];

bool has_setup = false;
void setup() {
  for (int i = 0; i < numParticles; i++) {
    float seed = float(i);
    particles[i] = vec4(
      random(seed + .1),            // opacity
      random(seed + .2) * 20. + 5., // speed
      random(seed + .3) * .15,      // amplitude
      random(seed + .8) * .3 - .15  // y shift
    );
    // startProgress is given by (i/numParticles)
    // Where does radius come from?
  }
  has_setup = true;
}


vec2 particlePos(vec4 particle, int index, float time) {
  float this_startProgress = float(index) / float(numParticles);
  float this_speed = particle[1];
  float this_amplitude = particle[2];
  float this_yshift = particle[3];
  float progress = fract(this_startProgress + (time / 4.));

  return vec2(
    progress * 1.1 - 0.05, // go off left and right edge a little bit
    0.5 + this_yshift + (this_amplitude * sin(progress * 2. * PI))
  ) * u_resolution;
}


void main() {
  if (!has_setup) setup();

  vec3 color = vec3(0., 0., 0.);

  float radius;
  float opacity;
  vec2 center;
  float inCircle;

  for (int i = 0; i < numParticles; i += 1) {
    radius = 20.;
    opacity = particles[i][0];
    center = particlePos(particles[i], i, u_time);
    inCircle = smoothstep(radius - 1., radius + 1., distance(center, gl_FragCoord.xy));
    color += mix(
      vec3(opacity, opacity, opacity),
      vec3(0., 0., 0.),
      inCircle
    );
  }

  gl_FragColor = vec4(color, 1.);
}
`;




class Renderer {
  constructor(container) {
    // Set up scene

    this.scene = new THREE.Scene();
    // Define geometry
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    // Define material
    this.uniforms = {
      u_time: { type: "f", value: 0.0 },
      u_resolution: { type: "v2", value: new THREE.Vector2() } };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader });

    // Create mesh from the two
    const mesh = new THREE.Mesh(geometry, material);
    // and add it to the scene
    this.scene.add(mesh);

    // Set up camera

    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    // Set up renderer

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Set up stats

    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.classList.add('stats');
    container.appendChild(this.stats.domElement);

    // Misc

    this.startTime = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
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
    this.uniforms.u_time.value = this.elapsedTime;
    this.stats.update();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }}



const renderer = new Renderer(document.getElementById('container'));
renderer.render();