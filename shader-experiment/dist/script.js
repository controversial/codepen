const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  float rows = floor(u_resolution.y / 50.);
  float cols = floor(u_resolution.x / 50.);
  float xOffset = (1. / cols) * (.5 * cos(PI * u_time) + .5) * mod(floor(u_time), 2.);
  float yOffset = (1. / rows) * (.5 * cos(PI * (u_time + 1.)) + .5) * mod(floor(u_time + 1.), 2.);

  st = vec2(
    fract(cols * (st.x + (step(0.5, mod(floor(st.y * rows), 2.)) * 2.0 - 1.0) * xOffset)),
    fract(rows * (st.y + (step(0.5, mod(floor(st.x * cols), 2.)) * 2.0 - 1.0) * yOffset))
  );
  float lightness = smoothstep(.22, .26, distance(st, vec2(0.5, 0.5)));
  gl_FragColor = vec4(vec3(lightness), 1.);
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