'use strict';

var laptop = document.getElementById('a');

function move() {
  var _loop = function _loop(i) {
    setTimeout(function () {
      laptop.style.transform = 'rotateZ(60deg) rotateX(30deg) rotateY(-45deg) translateX(' + (i < 1500 ? i : -3000 + i) + 'px)';
    }, i);
  };

  for (var i = 0; i < 3000; i++) {
    _loop(i);
  }
}

function close() {
  laptop.querySelector('.lid').classList.toggle('closed');
}

laptop.addEventListener('click', close);
laptop.addEventListener('contextmenu', function (e) {
  e.preventDefault();move();
});