'use strict';

var canvas = document.getElementById('draw');
var ctx = canvas.getContext('2d');
var angleRange = document.getElementById('angleRange');
var angleLabel = document.getElementById('angleLabel');

var angle = 0;

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // 0, 0 is center
  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
  redraw();
});

angleRange.addEventListener('input', function () {
  angle = angleRange.valueAsNumber;
  redraw();
});

// Rotate a single point around the origin by a given number of degrees
function rotate(x, y, theta) {
  var deg2rad = Math.PI / 180;
  return [x * Math.cos(theta * deg2rad) - y * Math.sin(theta * deg2rad), y * Math.cos(theta * deg2rad) + x * Math.sin(theta * deg2rad)];
}

// Rotate a square of a given size around the origin and return the coordinates of its corners
function rotateSquare(size, theta) {
  return [rotate(-size / 2, -size / 2, theta), // Top left
  rotate(size / 2, -size / 2, theta), // Top right
  rotate(size / 2, size / 2, theta), // Bottom right
  rotate(-size / 2, size / 2, theta)];
}

// Get the size of the bounding box from a set of coordinates
// Bottom left
function getSquareBoundingDimensions(coords) {
  var _Math, _Math2, _Math3, _Math4, _ref;

  var _$zip = (_ref = _).zip.apply(_ref, coords);

  var xs = _$zip[0];
  var ys = _$zip[1];

  return [(_Math = Math).max.apply(_Math, xs) - (_Math2 = Math).min.apply(_Math2, xs), (_Math3 = Math).max.apply(_Math3, ys) - (_Math4 = Math).min.apply(_Math4, ys)];
}

function redraw() {
  angleLabel.innerHTML = 'Angle: ' + angle.toFixed(2);
  angleRange.value = angle;

  ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

  var size = Math.min(canvas.width * (2 / 3), canvas.height * (2 / 3));

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

  // Draw first rectangle
  ctx.beginPath();
  var corners = rotateSquare(size, angle);
  corners.forEach(function (c) {
    return ctx.lineTo.apply(ctx, c);
  });
  ctx.closePath();
  ctx.fill();

  // Find the ratio for fitting rectangle size by making an imaginary square, rotating it, and seeing how much it would overflow the bounds of its parent.
  var testCorners = rotateSquare(size, angle);
  var testDims = getSquareBoundingDimensions(testCorners);
  var ratio = size / testDims[0]; // Both dimensions are the same because it's a square

  // Draw inner rectangles
  var n = 10;
  for (var i = 1; i < n; i++) {
    var rot = (i + 1) * angle;
    ctx.beginPath();
    size *= ratio;

    var _corners = rotateSquare(size, rot);
    _corners.forEach(function (c) {
      return ctx.lineTo.apply(ctx, c);
    });
    ctx.closePath();
    ctx.fill();
  }
}

window.dispatchEvent(new Event('resize'));
angleRange.dispatchEvent(new Event('input'));

function step() {
  // Adjust the angle different amounts based on distance from 90° so that the animation moves more slowly when it's lined up as cooler patterns
  angle += (Math.min(angle, 90 - angle) + 2) / 100;
  angle %= 90;
  redraw();
}

var interval = setInterval(step, 10);
var running = true;

function toggle() {
  if (running) clearInterval(interval);else interval = setInterval(step, 10);
  running = !running;
}