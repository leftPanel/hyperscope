const overflowRegex = /(auto|scroll|hidden)/

function needScroll(el, dir) {
  let { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;
  switch (dir) {
    case "left":
      return scrollLeft > 0
      break;
    case "right":
      return scrollLeft + clientWidth < scrollWidth
      break;
    case "up":
      return scrollTop > 0
      break;
    case "down":
      return scrollTop + clientHeight < scrollHeight
      break;
  }
  return false;
}

function canScroll(el) {
  let style = el.currentStyle || window.getComputedStyle(el, null);
  if (el === document.scrollingElement) {
    return true;
  }
  if (el === document.body) {
    return true;
  }
  if (el === document.documentElement) {
    return true;
  }
  return overflowRegex.test(style.overflow + style.overflowY + style.overflowX);
}

function isScrollable(el, dir) { // dir: left, right, up, down
  return canScroll(el) && needScroll(el, dir);
}

export default isScrollable;