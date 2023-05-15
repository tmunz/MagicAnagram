const CURSOR_TAIL_MAX = 50;
const CURSOR_TAIL_TIME = 600;
let cursorPoints = [];
let lastUpdateTime = new Date();

function addPoint(e) {
  if (40 <= new Date() - lastUpdateTime) {
    cursorPoints.push([e.pageX, e.pageY]);
    CURSOR_TAIL_MAX < cursorPoints.length && cursorPoints.shift();
    update();
    lastUpdateTime = new Date();
    setTimeout(() => (0 < cursorPoints.length && (cursorPoints.shift() | update())), CURSOR_TAIL_TIME);
  }
};

function update() {
  const glow = document.getElementById("glow-path");
  const goo = document.getElementById("goo-path");
  const gradient = document.getElementById("fire-gradient");
  const calcAncor = (p2, p1, f) => [p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f];
  const l = cursorPoints.length;
  let path = l > 1 ? 'M' : 'M 0,0';
  for (let j = 0; j < l - 1; j++) {
    if (j != 0) {
      const p = calcAncor(cursorPoints[j], cursorPoints[j + 1], .5);
      path += ` Q ${cursorPoints[j][0]},${cursorPoints[j][1]} ${p[0]},${p[1]}`;
    } else {
      path += `${cursorPoints[j][0]},${cursorPoints[j][1]}`;
    }
  }
  if (1 < l) {
    const distX = cursorPoints[0][0] - cursorPoints[l - 1][0];
    const distY = cursorPoints[0][1] - cursorPoints[l - 1][1];
    const angle = Math.atan2(distY, distX) * (180 / Math.PI);
    gradient.setAttribute("gradientTransform", `rotate(${90 + angle} 0.5 0.5)`);
  }
  glow.setAttribute("d", path);
  goo.setAttribute("d", path);
  goo.setAttribute("stroke-width", Math.min(cursorPoints.length / CURSOR_TAIL_MAX * 5));

  const tailDistance = cursorPoints.reduce((agg, curr, i, arr) => {
    if (i !== 0) {
      return agg + Math.abs(curr[0] - arr[i - 1][0]) + Math.abs(curr[1] - arr[i - 1][1])
    }
    return 0;
  }, 0);
  if (1500 <= tailDistance && isUpdateable) {
    isUpdateable = false;
    animateText();
    setTimeout(() => isUpdateable = true, 4000);
  }
}

document.addEventListener('mousemove', function (event) {
  addPoint(event);
});

document.addEventListener('touchmove', function (event) {
  addPoint(event.targetTouches[0]);
});