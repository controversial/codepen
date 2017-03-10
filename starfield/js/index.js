'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Starfield = function () {
  function Starfield(elem, starCount, speed, fps) {
    var _this = this;

    _classCallCheck(this, Starfield);

    this.elem = elem;
    this.ctx = this.elem.getContext('2d');
    this.starCount = starCount || 2000;
    this.fps = fps || 60;
    this.speed = speed || 1;

    // Set up resizing
    this.elem.width = window.innerWidth;
    this.elem.height = window.innerHeight;
    window.addEventListener('resize', function () {
      return _this.resize();
    });

    // Build a list of stars with X Y and Z coordinates
    this.stars = [];
    for (var i = 0; i < this.starCount; i += 1) {
      this.stars.push(this.getStar(false));
    }

    // Begin render loop
    this.start();
  }

  Starfield.prototype.getStar = function getStar(back) {
    var rand = function rand(low, high) {
      return Math.random() * (high - low) + low;
    };
    var polToCart = function polToCart(r, theta) {
      return [r * Math.cos(theta), r * Math.sin(theta)];
    };

    var maxRadius = Math.min(this.elem.width, this.elem.height) / 4 / 2;
    var pos = polToCart(rand(maxRadius / 25, maxRadius), rand(0, Math.PI * 2));

    return {
      x: pos[0],
      y: pos[1],
      z: back ? 25 : rand(0, 25)
    };
  };

  // When the window is resized, adjust canvas coordinate system

  Starfield.prototype.resize = function resize() {
    this.elem.width = window.innerWidth;
    this.elem.height = window.innerHeight;
    this.draw();
  };

  // Render

  Starfield.prototype.draw = function draw() {
    this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);

    for (var i = 0; i < this.stars.length; i += 1) {
      var star = this.stars[i];
      var progress = 1 - star.z / 25;
      var lightness = Math.round(progress * 255);
      this.ctx.fillStyle = 'rgb(' + lightness + ', ' + lightness + ', ' + lightness + ')';

      var projectedX = 100 / star.z * star.x;
      var projectedY = 100 / star.z * star.y;
      var finalX = projectedX + this.elem.width / 2;
      var finalY = projectedY + this.elem.height / 2;

      this.ctx.fillRect(finalX, finalY, 5 * progress, 5 * progress);

      star.z -= this.speed / 20;
      if (star.z < 0 || finalX < 0 || finalY < 0 || finalX > this.elem.width || finalY > this.elem.height) {
        this.stars[i] = this.getStar(true);
      }
    }
  };

  // Begin render loop

  Starfield.prototype.start = function start() {
    var _this2 = this;

    this.interval = setInterval(function () {
      return requestAnimationFrame(function () {
        return _this2.draw();
      });
    }, 1000 / this.fps);
  };

  // Pause render loop

  Starfield.prototype.stop = function stop() {
    clearInterval(this.interval);
  };

  return Starfield;
}();

var canvas = document.querySelector('canvas');
window.stars = new Starfield(canvas);