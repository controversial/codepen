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
      this.stars.push(Starfield.getStar());
    }

    // Begin render loop
    this.start();
  }

  Starfield.getStar = function getStar(back) {
    return {
      x: Math.random() * .165 - .0825,
      y: Math.random() * .165 - .0825,
      z: back ? 25 : Math.random() * 25,
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
      this.ctx.font = '300 ' + (10 * progress + 4) + 'px Roboto Mono';
      var size = 5 * progress;

      var absoluteX = star.x * this.elem.width;
      var absoluteY = star.y * this.elem.height;
      var projectedX = 100 / star.z * absoluteX;
      var projectedY = 100 / star.z * absoluteY;
      var finalX = projectedX + this.elem.width / 2;
      var finalY = projectedY + this.elem.height / 2;

      this.ctx.fillText(star.text, finalX, finalY);

      star.z -= this.speed;
      if (star.z < 0) {
        this.stars[i] = Starfield.getStar(true);
      }
    }
  };

  // Begin render loop

  Starfield.prototype.start = function start() {
    var _this2 = this;

    this.interval = setInterval(function () {
      return _this2.draw();
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
window.stars = new Starfield(canvas, 5000);