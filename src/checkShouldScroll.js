import getNodePath from './getNodePath'
import isScrollable from './isScrollable'

const ERROR = 20;

function between(x, a, b) {
  return x > a && x < b;
}

function getRect(el) {
  if (el === document.documentElement) {
    return {
      top: 0,
      left: 0,
      right: el.clientWidth,
      bottom: el.clientHeight,
      width: el.clientWidth,
      height: el.clientHeight
    }
  }

  return el.getBoundingClientRect();
}

function checkShouldScroll(x, y, element) {
  let path = getNodePath(element)
    , res = { x: 0, y: 0 }
    , rect, i;

  for (i = path.length - 1; i >= 0; i--) {
    rect = getRect(path[i]);
    if (between(x - rect.left, 0, ERROR) && isScrollable(path[i], "left")) {
      res.x = -1;
    }
    if (between(x - rect.right, - ERROR, 0) && isScrollable(path[i], "right")) {
      res.x = 1;
    }

    if (between(y - rect.top, 0, ERROR) && isScrollable(path[i], "up")) {
      res.y = -1;
    }
    if (between(y - rect.bottom, - ERROR, 0) && isScrollable(path[i], "down")) {
      res.y = 1;
    }

    if (res.x || res.y) {
      return res;
    }
  }

  return res;
}

export default checkShouldScroll;