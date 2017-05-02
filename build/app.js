var Hyperscope = (function() {
        "use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Hyperscope = function () {

  //module X:\hyperscope\src\checkShouldScroll.js start: 

  //module X:\hyperscope\src\getNodePath.js start: 


  var getNodePath = function () {
    function getNodePath(el) {
      var node = void 0,
          path = [];

      for (node = el; node; node = node.parentNode) {
        if (node.nodeType === 1) {
          path.push(node);
        }
      }
      return path;
    }

    return getNodePath;
  }();

  //module X:\hyperscope\src\getNodePath.js end

  //module X:\hyperscope\src\isScrollable.js start: 


  var isScrollable = function () {
    var overflowRegex = /(auto|scroll|hidden)/;

    function needScroll(el, dir) {
      var scrollTop = el.scrollTop,
          scrollLeft = el.scrollLeft,
          scrollHeight = el.scrollHeight,
          scrollWidth = el.scrollWidth,
          clientHeight = el.clientHeight,
          clientWidth = el.clientWidth;

      switch (dir) {
        case "left":
          return scrollLeft > 0;
          break;
        case "right":
          return scrollLeft + clientWidth < scrollWidth;
          break;
        case "up":
          return scrollTop > 0;
          break;
        case "down":
          return scrollTop + clientHeight < scrollHeight;
          break;
      }
      return false;
    }

    function canScroll(el) {
      var style = el.currentStyle || window.getComputedStyle(el, null);
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

    function isScrollable(el, dir) {
      // dir: left, right, up, down
      return canScroll(el) && needScroll(el, dir);
    }

    return isScrollable;
  }();

  //module X:\hyperscope\src\isScrollable.js end

  var checkShouldScroll = function () {

    var ERROR = 20;

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
        };
      }

      return el.getBoundingClientRect();
    }

    function checkShouldScroll(x, y, element) {
      var path = getNodePath(element),
          res = { x: 0, y: 0 },
          rect = void 0,
          i = void 0;

      for (i = path.length - 1; i >= 0; i--) {
        rect = getRect(path[i]);
        if (between(x - rect.left, 0, ERROR) && isScrollable(path[i], "left")) {
          res.x = -1;
        }
        if (between(x - rect.right, -ERROR, 0) && isScrollable(path[i], "right")) {
          res.x = 1;
        }

        if (between(y - rect.top, 0, ERROR) && isScrollable(path[i], "up")) {
          res.y = -1;
        }
        if (between(y - rect.bottom, -ERROR, 0) && isScrollable(path[i], "down")) {
          res.y = 1;
        }

        if (res.x || res.y) {
          return res;
        }
      }

      return res;
    }

    return checkShouldScroll;
  }();

  //module X:\hyperscope\src\checkShouldScroll.js end

  //module X:\hyperscope\src\getCloestScrollableElement.js start: 


  var getCloestScrollableElement = function () {

    function getCloestScrollableElement(element, direction) {
      var path = getNodePath(element),
          i = void 0;

      for (i = 0; i < path.length; i++) {
        if (isScrollable(path[i], direction)) {
          return path[i];
        }
      }
      return null;
    }

    return getCloestScrollableElement;
  }();

  //module X:\hyperscope\src\getCloestScrollableElement.js end

  return function () {
    var Hyperscope = function () {
      function Hyperscope() {
        var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
        var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

        _classCallCheck(this, Hyperscope);

        this.step = step;
        this.interval = interval;
        this.delay = delay;
        this.timeoutHanler = null;
      }

      Hyperscope.prototype.request = function request(x, y, element) {
        var _this = this;

        this.cancel();
        this.timeoutHanler = setTimeout(function () {
          scroll(x, y, element, _this.step, _this.interval, function (handler) {
            _this.timeoutHanler = handler;
          });
        }, this.delay);
      };

      Hyperscope.prototype.cancel = function cancel() {
        clearTimeout(this.timeoutHanler);
      };

      return Hyperscope;
    }();

    function scroll(x, y, element, step, interval, setHandler) {
      //0. 判断是否需要滚动
      var _checkShouldScroll = checkShouldScroll(x, y, element),
          dx = _checkShouldScroll.x,
          dy = _checkShouldScroll.y,
          direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : dy > 0 ? "down" : "";

      if (dx || dy) {
        var scrollableElement = getCloestScrollableElement(element, direction);

        if (scrollableElement) {
          scrollableElement.scrollLeft += dx * step;
          scrollableElement.scrollTop += dy * step;

          setHandler(setTimeout(function () {
            scroll(x, y, element, step, interval, setHandler);
          }, interval));
        }
      }
    }

    return Hyperscope;
  }();
}(); 
        return Hyperscope
      } ());