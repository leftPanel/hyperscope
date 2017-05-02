import checkShouldScroll from './checkShouldScroll';
import getCloestScrollableElement from './getCloestScrollableElement'

class Hyperscope {
  constructor(step = 10, interval = 20, delay = 100) {
    this.step = step;
    this.interval = interval;
    this.delay = delay;
    this.timeoutHanler = null;
  }

  request(x, y, element) {
    this.timeoutHanler = setTimeout(() => {
      scroll(x, y, element, this.step, this.interval, handler => {
        this.timeoutHanler = handler;
      });
    }, this.delay)
  }

  cancel() {
    clearTimeout(this.timeoutHanler);
  }
}

function scroll(x, y, element, step, interval, setHandler) {
  //0. 判断是否需要滚动
  let { x: dx, y: dy } = checkShouldScroll(x, y, element)
    , direction = dx < 0
      ? "left"
      : dx > 0
        ? "right"
        : dy < 0
          ? "up"
          : dy > 0
            ? "down"
            : "";

  if (dx || dy) {
    let scrollableElement = getCloestScrollableElement(element, direction);

    if (scrollableElement) {
      scrollableElement.scrollLeft += (dx * step);
      scrollableElement.scrollTop += (dy * step);

      setHandler(setTimeout(function () {
        scroll(x, y, element, step, interval, setHandler);
      }, interval));
    }
  }
}

export default Hyperscope;