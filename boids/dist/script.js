function pol2cart(r, theta) {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

function sum(arr) {
  let sum = 0;
  arr.forEach(i => sum += i);
  return sum;
}

function avg(arr) {
  return sum(arr) / arr.length;
}

function normalizeAngle(theta) {
  const full = Math.PI * 2;
  const simplestPositive = (theta % full + full) % full;
  return full - simplestPositive - full / 2;
}

class Boid {
  constructor(parent, visibleDistance = 100, visibleAngle = 1.5 * Math.PI) {
    this.parent = parent;
    this.visibleDistance = visibleDistance;
    this.visibleAngle = visibleAngle;
    // Direction (radians)
    this.heading = Math.PI; // (Math.random() * Math.PI * 2;)
    // How fast it's going
    this.speed = 5;
    // Initial position is random
    const width = this.parent.canvas.width;
    const height = this.parent.canvas.height;
    this.x = Math.random() * width - width / 2;
    this.y = Math.random() * height - height / 2;
  }

  // Get all the boids in the "neighborhood:" a slice of the surrounding area that represents
  // this bird's visibility. This means the other boid has to be within a certain distance of
  // this one, and within a certain angle from this boid's heading so that it can be seen (in
  // other words, birds that are behind this one don't count)
  getNeighbors() {
    const neighbors = [];
    this.parent.boids.forEach(boid => {
      // Make sure it's not this one
      if (boid.x !== this.x || boid.y !== this.y) {
        // yay fun trig !!!
        const opposite = boid.y - this.y;
        const adjacent = boid.x - this.x;
        // 1. Check distance
        const distance = Math.sqrt(opposite ** 2 + adjacent ** 2);
        const distancePass = distance <= this.visibleDistance;
        // 2. Calculate angle
        const angle = Math.atan2(opposite, adjacent) + this.heading;
        const minAngle = (this.heading - this.visibleAngle / 2) % (Math.PI * 2);
        const maxAngle = (this.heading + this.visibleAngle / 2) % (Math.PI * 2);
        const anglePass = angle >= minAngle && angle <= maxAngle;

        if (distancePass && anglePass) {
          neighbors.push(boid);
        }
      }
    });
    return neighbors;
  }

  // Move according to the following rules
  // 1. Separation: steer to avoid crowding local flockmates
  // 2. Alignment: steer towards the average heading of local flockmates
  // 3. Cohesion: steer to move toward the average position of local flockmates
  // 4. Tracking: steer kinda towards the mouse

  step() {
    // Don't overflow boundaries
    const width = this.parent.canvas.width;
    const height = this.parent.canvas.height;

    // Move forward
    const difference = pol2cart(this.speed, this.heading);
    this.x += difference[0];
    this.y += difference[1];
    // Get local flockmates
    const neighbors = this.getNeighbors();
    if (neighbors.length > 0) {

      // Separation
      neighbors.forEach(n => {
        const distanceTo = Math.sqrt((n.x - this.x) ** 2, (n.y - this.y) ** 2);
        const angleFrom = Math.abs(n.heading - this.heading);
        const angleTo = Math.atan2(n.y - this.y, n.x - this.x);

        if (distanceTo < this.visibleDistance / 3 && angleFrom < Math.PI / 8) {
          this.heading = this.heading * 0.95 - angleTo * 0.05; // weighted average
        }
      });

      // Alignment
      const averageNeighborHeading = avg(neighbors.map(n => n.heading));
      this.heading = this.heading * 0.8 + averageNeighborHeading * 0.2; // weighted average

      // Cohesion
      const averageNeighborX = avg(neighbors.map(n => n.x));
      const averageNeighborY = avg(neighbors.map(n => n.y));
      const angleToCenter = Math.atan2(averageNeighborY - this.y, averageNeighborX - this.x);
      this.heading = this.heading * 0.95 + angleToCenter * 0.05;

      // Tracking
      const angleToMouse = Math.atan2(this.parent.mouse[1] - this.y, this.parent.mouse[1] - this.x);
      // this.heading = (this.heading * 0.9) + (angleToMouse * 0.1);
    }

    // Teleport across walls
    if (this.x > width / 2 + this.visibleDistance && difference[0] > -1) this.x = -width / 2 - this.visibleDistance; // Right wall
    if (this.x < width / -2 - this.visibleDistance && difference[0] < 1) this.x = width / 2 + this.visibleDistance; // Left wall
    if (this.y > height / 2 + this.visibleDistance && difference[1] > -1) this.y = -height / 2 - this.visibleDistance; // Bottom wall
    if (this.y < height / -2 - this.visibleDistance && difference[1] < 1) this.y = height / 2 + this.visibleDistance; // Top wall

    // Keep heading in simplest terms
    this.heading %= Math.PI * 2;
  }

  // Get a list of points that make up an arrow pointing in the direction of this.heading
  get drawingCoordinates() {
    const head = this.heading - Math.PI / 2;
    const pointRotate = (x, y) => [
    x * Math.cos(head) - y * Math.sin(head),
    y * Math.cos(head) + x * Math.sin(head)];

    // Basic set of coordinates for a triangle
    const triCoords = [[0, 15], [-7, -7], [7, -7]];
    // Rotated
    const rotCoords = triCoords.map(c => pointRotate(...c));
    // Translated
    const transCoords = rotCoords.map(c => [this.x + c[0], this.y + c[1]]);
    return transCoords;
  }

  drawNeighborhood(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.visibleDistance, this.heading - this.visibleAngle / 2, this.heading + this.visibleAngle / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
  }}




class Boids {
  constructor(canvas, num = 300, fps = 10) {
    this.fps = fps;
    // Basic setup
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.boids = [];
    // Resizing
    window.addEventListener('resize', () => this.resize());
    this.resize();
    // Mouse position tracking
    this.mouse = [0, 0];
    this.canvas.addEventListener('mousemove', e => this.mousemove(e));
    // Populate boids
    for (let i = 0; i < num; i += 1) {
      this.boids.push(new Boid(this));
    }
    // First draw
    this.draw();
  }

  resize() {
    // Size based on actual element size (double for spaciousness and pretty retina display)
    this.canvas.width = this.canvas.offsetWidth * 2;
    this.canvas.height = this.canvas.offsetHeight * 2;
    // Put (0, 0) in the center
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    // Redraw
    this.draw();
  }

  mousemove(e) {
    const bounds = this.canvas.getBoundingClientRect();
    this.mouse = [
    2 * (e.clientX - bounds.left) - this.canvas.width / 2,
    2 * (e.clientY - bounds.top) - this.canvas.height / 2];

  }

  draw() {
    // Clear the last frame
    this.ctx.clearRect(
    -this.canvas.width / 2,
    -this.canvas.height / 2,
    this.canvas.width,
    this.canvas.height);

    // Move
    this.boids.forEach(boid => boid.step());
    // Draw
    // Neighborhoods first so that they go behind
    this.boids.forEach(boid => {
      boid.drawNeighborhood(this.ctx);
    });
    // Then draw triangles
    this.boids.forEach((boid, i) => {
      this.ctx.beginPath();
      const coords = boid.drawingCoordinates;
      this.ctx.moveTo(...coords[0]);
      this.ctx.lineTo(...coords[1]);
      this.ctx.lineTo(...coords[2]);
      this.ctx.closePath();
      this.ctx.fillStyle = i === 0 ? '#f00' : '#0f0';
      this.ctx.fill();
    });
  }

  start() {
    this.interval = setInterval(() => this.draw(), 1000 / this.fps);
  }

  stop() {
    clearInterval(this.interval);
  }}


const anim = new Boids(document.querySelector('canvas'));
anim.start();