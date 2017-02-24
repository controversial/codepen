'use strict';

var codeBlock = document.getElementById('codeBlock');

// Set the contents of the <code> block to the source of this script
codeBlock.textContent = document.currentScript.textContent;

// syntax-highlight the source
hljs.highlightBlock(codeBlock);

for (var i = 0; i < codeBlock.childNodes.length; i++) {
  var node = codeBlock.childNodes[i];
  // Wrap Text nodes in spans
  if (node instanceof Text) {
    var newSpan = document.createElement('span');
    newSpan.textContent = node.textContent;
    codeBlock.replaceChild(newSpan, node);
    node = newSpan;
  }

  // Enable parallax
  node.classList.add('layer');
  node.setAttribute('data-depth', Math.random());

  // Position absolutely
  var rect = node.getBoundingClientRect();
  node.setAttribute('data-top', rect.top);
  node.setAttribute('data-left', rect.left);
}

for (var i = 0; i < codeBlock.childNodes.length; i++) {
  var node = codeBlock.childNodes[i];
  node.style.marginTop = node.getAttribute('data-top') + 'px';
  node.style.marginLeft = node.getAttribute('data-left') + 'px';
}

var parallax = new Parallax(codeBlock, {
  pointerEvents: false
});