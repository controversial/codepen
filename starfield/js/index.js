'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Starfield = function () {
  function Starfield(elem, starCount, speed, fps) {
    var _this = this;

    _classCallCheck(this, Starfield);

    this.elem = elem;
    this.ctx = this.elem.getContext('2d');
    this.starCount = starCount || 500;
    this.fps = fps || 25;
    this.speed = speed || 0.25;

    // Set up resizing
    this.elem.width = this.elem.offsetWidth;
    this.elem.height = this.elem.offsetHeight;
    window.addEventListener('resize', function () {
      return _this.resize();
    });

    // Build a list of stars with X Y and Z coordinates
    this.stars = [];
    for (var i = 0; i < this.starCount; i++) {
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
      z: back ? 25 : rand(0, 25),
      text: String.fromCharCode(Math.floor(Math.random() * 96 + 33))
    };
  };

  // When the window is resized, adjust canvas coordinate system

  Starfield.prototype.resize = function resize() {
    this.elem.width = this.elem.offsetWidth;
    this.elem.height = this.elem.offsetHeight;
    this.draw();
  };

  // Render

  Starfield.prototype.draw = function draw() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.elem.width, this.elem.height);

    for (var i = 0; i < this.stars.length; i++) {
      var star = this.stars[i];
      var progress = 1 - star.z / 25;
      var value = Math.round(progress * 255);
      this.ctx.fillStyle = 'rgb(' + value + ', ' + value + ', ' + value + ')';
      this.ctx.font = '300 ' + progress * 20 + 'px Roboto Mono';

      var projectedX = 100 / star.z * star.x;
      var projectedY = 100 / star.z * star.y;
      var finalX = projectedX + this.elem.width / 2;
      var finalY = projectedY + this.elem.height / 2;

      this.ctx.fillText(star.text, finalX, finalY);

      star.z -= this.speed;
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

// Initialize a starfield

var canvas = document.querySelector('canvas');
window.stars = new Starfield(canvas, 1500, 0.1, 25);