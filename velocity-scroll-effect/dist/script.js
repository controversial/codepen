let history = [];
let stoppedTimeout = undefined;

window.addEventListener('scroll', e => {
  const historyLimit = 20;

  const y = window.scrollY;
  const [oldY] = history.length ?
  history[history.length - 1] :
  [];
  // Maintain history array
  history.push([y, Date.now()]);
  if (history.length > 10) history.shift();
  // Calculate direction
  const direction = Math.sign(y - oldY);
  // Calculate rolling average velocity (over the most recent 10 scroll events of the past 200ms)
  let avgVelocity;
  if (history.length) {
    const recents = history.
    filter(([y, time]) => Date.now() - time < historyLimit * 10);
    const deltas = recents.
    reduce((accum, _, i, arr) => {
      if (i === arr.length - 1) return accum;
      const [y2, t2] = arr[i + 1];
      const [y1, t1] = arr[i];
      accum.push([y2 - y1, t2 - t1]);
      return accum;
    }, []);
    const velocities = deltas.map(([d, t]) => d / t);
    avgVelocity = velocities.reduce((accum, curr, _, arr) => accum + curr / arr.length, 0);
    scrollCallback(parseFloat(avgVelocity.toFixed(2)));
  }
  // Notice when scrolling stops
  clearTimeout(stoppedTimeout);
  stoppedTimeout = setTimeout(() => {scrollCallback(0);}, historyLimit);
});


function scrollCallback(velocity) {
  document.body.style.transform = `skewY(${velocity * 3}deg)`;
}