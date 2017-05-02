const AlienDragAndDrop = (function() {
        
      //module X:\alien-drag-and-drop\src\listen.js start: 

      
      const listen = (function() {
        function listenOne(node, eventType, listener) {
  if (window.jQuery) {
    let $node = $(node);
    $node.on(eventType, listener);
    return function () {
      $node.off(eventType, listener);
      $node = null;
      node = null;
    };
  }

  if (document.addEventListener) {
    let shouldCapture = eventType === "focus";
    node.addEventListener(eventType, listener, shouldCapture);
    return function () {
      node.removeEventListener(eventType, listener, shouldCapture);
      node = null;
    };
  }

  if (document.attachEvent) {
    var fn = compatible(listener, node);
    node.attachEvent(`on${eventType}`, fn);
    return function () {
      node.detachEvent(`on${eventType}`, fn);
      node = null;
    }
  }
}

function listen(node, eventTypes, listener) {
  let types = eventTypes.split(/\s+/g)
    , i, unlisteners = [];
  for (i = 0; i < types.length; i++) {
    unlisteners.push(listenOne(node, types[i], listener));
  }
  return function () {
    let i;
    for (i = 0; i < unlisteners.length; i++) {
      unlisteners[i]();
    }
  }
}

function compatible(fn, node) {
  return function (e) {
    e = e || window.event;

    e.target = e.target || e.srcElement || node;

    e.preventDefault = function () {
      e.returnValue = false;
    };

    e.stopPropagation = function () {
      e.cancelBubble = true;
    };

    e.which = e.keyCode
      ? e.keyCode
      : isNaN(e.button)
        ? undefined
        : e.button + 1;

    e.relatedTarget = e.type === "mouseover"
      ? e.fromElement
      : e.type === "mouseout"
        ? e.toElement
        : null;

    return fn(e);
  }
}

 
        return listen
      } ());
    
//module X:\alien-drag-and-drop\src\listen.js end

//module X:\alien-drag-and-drop\src\tomato.js start: 

      
      const tomato = (function() {
        class Tomato {
  map(list, fn) {
    var l, i, res;
    for (l = list.length, i = 0, res = []; i < l; i++) {
      res.push(fn(list[i], i, list));
    }

    return res;
  }

  each(list, fn) {
    var l, i, li = list;
    for (l = li.length, i = 0; i < l; i++) {
      fn(li[i], i, li);
    }
  }

  consume(list, fn) {
    while (list.length) {
      fn(list.shift());
    }
  }

  findRight(list, fn) {
    let i;
    for (i = list.length - 1; i >= 0; i--) {
      if (fn(list[i], i, list)) {
        return list[i];
      }
    }
    return null;
  }

  closest(el, sel) {
    if (el.closest) {
      return el.closest(sel);
    }
    let e;
    for (e = el; e; e = e.parentNode) {
      if (this.matches(e, sel)) {
        return e;
      }
    }
    return null;
  }

  matches(el, sel) {
    let useRaw, res;
    this.each(
      ["matches", "matchesSelector", "msMatchesSelector", "oMatchesSelector", "webkitMatchesSelector"],
      function (fn) {
        if (el[fn]) {
          useRaw = true;
          res = el[fn](sel);
        }
      }
    );

    if (useRaw) {
      return res;
    }

    var els = (el.parentNode || el.ownerDocument || document).querySelectorAll(sel),
      i = els.length;
    while (--i >= 0 && els.item(i) !== el) { }
    return i > -1;
  }

  prev(el, sel) {
    let e;
    for (e = el.previousSibling; e; e = e.previousSibling) {
      if (e.nodeType === 1 && sel(e)) {
        return e;
      }
    }
    return null;
  }

  next(el, sel) {
    let e;
    for (e = el.nextSibling; e; e = e.nextSibling) {
      if (e.nodeType === 1 && sel(e)) {
        return e;
      }
    }
    return null;
  }

  lastChild(el, sel) {
    let e;

    for (e = el.lastChild; e; e = e.previousSibling) {
      if (e.nodeType === 1 && sel(e)) {
        return e;
      }
    }
    return null;
  }

  firstChild(el, sel) {
    let e;

    for (e = el.firstChild; e; e = e.nextSibling) {
      if (e.nodeType === 1 && sel(e)) {
        return e;
      }
    }
    return null;
  }
}

const tomato = new Tomato;

 
        return tomato
      } ());
    
//module X:\alien-drag-and-drop\src\tomato.js end

//module X:\alien-drag-and-drop\src\Subscribable.js start: 

      
      const Subscribable = (function() {
        class Subscribable {
  constructor() {
    this.store = {};
  }

  subscribe(type, callback) {
    if (!this.store[type]) {
      this.store[type] = [];
    }
    this.store[type].push(callback);
    return () => {
      if (!this.store[type]) {
        return;
      }
      for (let i = 0; i < this.store[type].length; i++) {
        if (this.store[type][i] === callback) {
          this.store[type].splice(i, 1);
          i--;
        }
      }
    }
  }

  broadcast(type, payload = {}) {
    if (this.store[type]) {
      for (let i = 0; i < this.store[type].length; i++) {
        if (this.radioFilter(type, payload)) {
          this.store[type][i](payload);
        }
      }
    }
  }

  unSubscribeAll() {
    this.store = {};
  }

  radioFilter(type, payload) {
    return true;
  }
}

 
        return Subscribable
      } ());
    
//module X:\alien-drag-and-drop\src\Subscribable.js end

//module X:\alien-drag-and-drop\src\getMousePositionRelatedToItsTarget.js start: 

      //module X:\alien-drag-and-drop\src\getMousePositionRelatingToBoudingBox.js start: 

      
      const getMousePositionRelatingToBoudingBox = (function() {
        function getMousePositionRelatingToBoudingBox(x, y, el) {
  var target = el
    , style = target.currentStyle || window.getComputedStyle(target, null)
    , borderLeftWidth = parseInt(style['borderLeftWidth'], 10)
    , borderTopWidth = parseInt(style['borderTopWidth'], 10)
    , rect = target.getBoundingClientRect()
    , offsetX = x - borderLeftWidth - rect.left
    , offsetY = y - borderTopWidth - rect.top;

  return [offsetX, offsetY];
}

 
        return getMousePositionRelatingToBoudingBox
      } ());
    
//module X:\alien-drag-and-drop\src\getMousePositionRelatingToBoudingBox.js end

      const getMousePositionRelatedToItsTarget = (function() {
        

function getMousePositionRelatedToItsTarget(e) {
  return getMousePositionRelatingToBoudingBox(e.clientX, e.clientY, e.target || e.srcElement)
}

 
        return getMousePositionRelatedToItsTarget
      } ());
    
//module X:\alien-drag-and-drop\src\getMousePositionRelatedToItsTarget.js end

//module X:\alien-drag-and-drop\src\DragLayer.js start: 

      //module X:\alien-drag-and-drop\src\DROP_NO.js start: 

      
      const DROP_NO = (function() {
        const DROP_NO = `data:image/gif;base64,R0lGODlhEAAQAIcAAMAAAMEEBMQQEMUUFMccHMkkJM00NM88PNRQUNVUVNlkZNpoaNxwcN10dOSQkOecnOmkpOuwsO24uO68vO/AwPDExPHIyPLMzPXY2Pfg4Pjk5Pno6Pvw8Pz09P34+P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAB8ALAAAAAAQABAAAAiSAD8IHNiBAoUOAxMOjGAAgMMAByoo/LABAQACDSA8YCAAgAKEAy0u4JBQg0MGCwE0mOgQQIALAg0UADmwpYYBCT50AOBAYUuBDAZ8oABgQsKfAh8AyCChaE2HCZVi4MBTINKBQWPOvCrwZs4PEVoCmJjgZUiHJAdqSAAA5cCKFzNu7PhxIsOWECVOJCjBgoeJAQEAOw==`;

 
        return DROP_NO
      } ());
    
//module X:\alien-drag-and-drop\src\DROP_NO.js end

//module X:\alien-drag-and-drop\src\DROP_YES.js start: 

      
      const DROP_YES = (function() {
        const DROP_YES = "data:image/gif;base64,R0lGODlhEAAQAIcAACdyJCZ/Iyl3JSl6JTR8MDV/MSaEIyqPJTWPMT+FOz+LOz+NOz+ZPDuhJ0yXPUKhM0ShM0mwJ1G3LlWzNV21P1q+N06bQVKgQl6pSGSwTGy2Vm23V261WG+1WG+1WWq5UHS3W3S3XHC/V3C4WXG5W3K5W3O6XHG+X3e8YH23Zny6ZH28Zn2+Z3+4aVzAO1zDPWbFSWrDSWzFS2nISnTCWXLLVW/CYW/DYW7EYW7EYm7FY2/GZHDBY3HEY3DHZXPHZnTDZHLIaHTIaHXIaHbJaXbKannBZH7BaX7Hb3nJa3rMbX/KcIO+bYfCcoXFdYDKc4DMcoPOd4fJeYnEdovIeJDOf5G5j5C8jpbHg5HAj5bLhpfMhZTIj5bNiJrHh5jLhprKh5jMh5nNip3Oi5nRi5nQjJrUjZvXkZ/SkJ/SkZ3YkqHWlaHXlaPXlqvSm6vTm6rcl63fm67Xoa/XoK7cpa/cprPZpbHdp7TZpbTaprLbqLXbqLTdqrTfrLXfrLbQtbbRtbfZtbrbtb7ftbDjn7Xhrrfhr7fhsL7jtr/juMHjtsDkucvsv8DAwMvtwNbu0tns1Ob04+336/H58PT68vz9+/3+/f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAI0ALAAAAAAQABAAAAjVABsJHEiwoEFCNVxUiAHHoEBHM2i0oUNnzYcJigoyelHFkJooUdQUotJgEEEYVQopKRJEyJAkfaY8GBhHhCElQXzoyNEDERI/GLgIlMHmDJEdOG7YWHQpEpkxDARKuAPlx6FHPBJdqlTmiBwDAiPUWfJk0iVJW7uQYDEngEAKacwAkULpkiUtG0ps8aJAIJoMfIyccAJJjAYOIfJYuDIQQhM9KEyM8NABhJ0WBQgKOsBkT5gVKr7gSQEAUMFACC6AeeMGiwMCfxw2yrJggIAEVmTrJhgQADs=";

 
        return DROP_YES
      } ());
    
//module X:\alien-drag-and-drop\src\DROP_YES.js end


//module X:\alien-drag-and-drop\src\setStyle.js start: 

      
      const setStyle = (function() {
        function setStyle(el, style) {
  let text = el.style.cssText
    , rcss = parse(text)
    , mcss = {...rcss, ...style}
    
  el.style.cssText = stringify(mcss);
}

function parse(text) {
  let css = {}
    , list = text.split(/\s*;\s*/g)
    , i;

  for (i = 0; i < list.length; i++) {
    let [name, value] = list[i].split(/\s*:\s*/g);
    css[name] = value;
  }
  return css;
}

function stringify(css) {
  let text = ""
    , name;
  for (name in css) {
    if (css.hasOwnProperty(name)) {
      text += `${name}:${css[name]};`
    }
  }
  return text;
}


 
        return setStyle
      } ());
    
//module X:\alien-drag-and-drop\src\setStyle.js end

      const DragLayer = (function() {
        



  
  class DragLayer {
    constructor(node, offsetX, offsetY) {
      const CursorOffset = 20;

      let wrapper = document.createElement("div")
        , cursorDomNode = document.createElement("img")
        , clonedNode = node.cloneNode(true);

      // wrapper.style.position = "fixed";
      // wrapper.style.zIndex = 9999;
      // wrapper.style.width = node.offsetWidth + "px";
      // wrapper.style.height = node.offsetHeight + "px";
      wrapper.style.cssText = `position:fixed;z-index:9999;width:${node.offsetWidth}px;height:${node.offsetHeight}px;display:none;`

      // clonedNode.style.position = "absolute";
      // clonedNode.style.top = 0;
      // clonedNode.style.left = 0;
      setStyle(clonedNode, {
        position: "absolute",
        top: 0,
        left: 0
      });

      cursorDomNode.width = CursorOffset;
      cursorDomNode.height = CursorOffset;
      // cursorDomNode.style.position = "absolute";
      // cursorDomNode.style.top = `${-CursorOffset / 3}px`;
      // cursorDomNode.style.left = `${-CursorOffset / 3}px`;
      // cursorDomNode.style.opacity = 0.8;
      cursorDomNode.style.cssText = `position:absolute;top:${-CursorOffset / 3}px;left:${-CursorOffset / 3}px;opacity:.8;`
      cursorDomNode.src = DROP_NO

      wrapper.appendChild(clonedNode);
      wrapper.appendChild(cursorDomNode);

      document.body.appendChild(wrapper);

      this.wrapper = wrapper;
      this.cursorDomNode = cursorDomNode;
      this.offsetX = offsetX;
      this.offsetY = offsetY;

      this.listener = listen(this.wrapper, "selectstart dragstart mousemove", function(e) {
        e.preventDefault();
      });
    }

    setPosition(x, y) {
      this.wrapper.style.top = y - this.offsetY + "px";
      this.wrapper.style.left = x - this.offsetX + "px";
    }

    hide() {
      this.wrapper.style.display = "none";
    }

    show() {
      this.wrapper.style.display = "block";
    }

    destroy() {
      this.listener();
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    setCursor() {
      this.cursorDomNode.src = DROP_YES;
    }

    unsetCursor() {
      this.cursorDomNode.src = DROP_NO;
    }
  }

 
        return DragLayer
      } ());
    
//module X:\alien-drag-and-drop\src\DragLayer.js end



//module X:\alien-drag-and-drop\src\Hyperscope\test.js start: 

      
//module X:\alien-drag-and-drop\src\Hyperscope\index.js start: 

      //module X:\alien-drag-and-drop\src\Hyperscope\checkShouldScroll.js start: 

      //module X:\alien-drag-and-drop\src\Hyperscope\getNodePath.js start: 

      
      const getNodePath = (function() {
        function getNodePath(el) {
  let node, path = [];

  for (node = el; node; node = node.parentNode) {
    if (node.nodeType === 1) {
      path.push(node);
    }
  }
  return path;
}

 
        return getNodePath
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\getNodePath.js end

//module X:\alien-drag-and-drop\src\Hyperscope\isScrollable.js start: 

      
      const isScrollable = (function() {
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

 
        return isScrollable
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\isScrollable.js end

      const checkShouldScroll = (function() {
        


const ERROR = 20;

function between(x, a, b) {
  return x > a && x < b;
}

function checkShouldScroll(x, y, element) {
  let path = getNodePath(element)
    , res = { x: 0, y: 0 }
    , rect, i;

  for (i = path.length - 1; i >= 0; i--) {
    rect = path[i].getBoundingClientRect();
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

 
        return checkShouldScroll
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\checkShouldScroll.js end

//module X:\alien-drag-and-drop\src\Hyperscope\getCloestScrollableElement.js start: 

      

      const getCloestScrollableElement = (function() {
        


function getCloestScrollableElement(element, direction) {
  let path = getNodePath(element)
  , i;

  for (i = 0; i < path.length; i ++) {
    if (isScrollable(path[i],  direction)) {
      return path[i];
    }
  }
  return null;
}

 
        return getCloestScrollableElement
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\getCloestScrollableElement.js end

      const Hyperscope = (function() {
        


class Hyperscope {
  constructor(step = 10, interval = 10, delay = 100) {
    this.step = step;
    this.interval = interval;
    this.delay = delay;
    this.timeoutHanler = null;
  }

  request(x, y, element) {
    //0. 判断是否需要滚动
    let {x: dx, y: dy} = checkShouldScroll(x, y, element)
    , direction = "";

    direction += dx < 0
    ? " left "
    : dx > 0
    ? " right "
    : dy < 0
    ? " up "
    : dy > 0 
    ? " down "

    if (dx || dy) {
      let scrollableElement = getCloestScrollableElement(element);

      if (scrollableElement) {

      }
    }
  }

  cancel() {
    clearTimeout(this.timeoutHanler);
  }
}

 
        return Hyperscope
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\index.js end

      const hyperscopeTest = (function() {
        


function hyperscopeTest () {
  let h = new Hyperscope();
  listen(document.body, "mousemove", function(e) {
    h.cancel();
    h.request(e.clientX, e.clientY, document.elementFromPoint(e.clientX, e.clientY));
  });
}

 
        return hyperscopeTest
      } ());
    
//module X:\alien-drag-and-drop\src\Hyperscope\test.js end

      return (function() {
          









hyperscopeTest();

class AlienDragAndDrop extends Subscribable {
  constructor(mountPoint) {
    super();

    let gDragSource = null
      , gDragLayer = null
      , gDragStarted = false
      , gAutoScrollHandler = null
      , gCanDropTarget = null
      , gTransferData = null
      , gStartPoint = {}
      , gListeners = []

      , handleMouseDown = e => {
        if (gDragStarted) {
          // when hold the left button and press the right button?
          handleMouseUp(e);
          return;
        }
        let target = e.target
          , canDrag = false
          , ghostNode = null
          , ghostOffsetX = null
          , ghostOffsetY = null;

        this.broadcast("dragstart", {
          target,
          canDrag: () => canDrag = true,
          setDragGhost: (ghost, x, y) => (ghostNode = ghost, ghostOffsetX = x, ghostOffsetY = y),
          setTransferData: data => gTransferData = data
        });

        if (canDrag) {
          gListeners = [
            listen(document, "selectstart", handleSelectStart),
            listen(document, "mousemove", handleMouseMove),
            listen(document, "dragstart", handleDragStart),
            listen(document, "mouseup", handleMouseUp),
            listen(document, "mousewheel", handleMouseWheel),
          ]
          gDragSource = target;

          let [ofx, ofy] = getMousePositionRelatedToItsTarget(e);

          ghostNode = ghostNode || target.cloneNode(true);
          setStyle(ghostNode, {
            width: `${target.offsetWidth}px`,
            height: `${target.offsetHeight}px`,
            display: "block"
          });
          ghostNode.id = "";
          ghostOffsetX = ghostOffsetX == null ? ofx : ghostOffsetX;
          ghostOffsetY = ghostOffsetY == null ? ofy : ghostOffsetY;

          gDragLayer = new DragLayer(ghostNode, ghostOffsetX, ghostOffsetY);
          gDragLayer.hide();
          gStartPoint = {
            x: e.clientX,
            y: e.clientY
          }

        }
      }
      , handleMouseMove = e => {
        e.preventDefault();
        let { clientX: x, clientY: y } = e
          , canDrop = false
          , elementUnderMouse = null;

        clearTimeout(gAutoScrollHandler);

        if (Math.max(
          Math.abs(x - gStartPoint.x),
          Math.abs(y - gStartPoint.y)
        ) < 5) {
          // 手抖的不算!!!!!
          return;
        }

        gDragLayer.setPosition(x, y); // relative to current view

        // show the ghost  only after the mouse first moves 
        if (!gDragStarted) {
          gDragLayer.show();
          gDragStarted = true;
        }

        // fire alien-drag event on the source node
        this.broadcast("drag", {
          target: gDragSource,
          clientX: e.clientX,
          clientY: e.clientY
        });

        // fire alien-dragover event on the element under mouse 
        gDragLayer.unsetCursor();
        gCanDropTarget = null;
        gDragLayer.hide();
        elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
        gDragLayer.show();
        if (elementUnderMouse) {
          this.broadcast("dragover", {
            target: elementUnderMouse,
            canDrop: () => canDrop = true,
            dragSource: this.dragSource,
            transferData: this.transferData
          })

          if (canDrop) {
            gCanDropTarget = elementUnderMouse;
            gDragLayer.setCursor()
          }
        }
        // if (elementUnderMouse) {
        //   // auto scroll when the mouse is under the edge of scrollable element 
        //   let scrollable = getClosestScrollableElement(elementUnderMouse);
        //   // 从左边拖进来的时候经过左边缘不要滚动，通过延迟来过滤掉这种情况
        //   this.autoScrollHandler = setTimeout(() => {
        //     this.checkScroll(scrollable, this.getPointRelatingToVisibleBoudingBox(x, y, scrollable))
        //   }, 100)
        // }
      }
      , handleMouseWheel = function (e) {
        clearTimeout(gAutoScrollHandler);
      }
      , handleMouseUp = e => {
        tomato.consume(gListeners, fn => fn());

        clearTimeout(gAutoScrollHandler);
        gDragLayer.destroy();
        gDragLayer = null;

        // fire drop event 
        let elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
          , offset = elementUnderMouse && getMousePositionRelatingToBoudingBox(e.clientX, e.clientY, elementUnderMouse) || {};

        if (elementUnderMouse === gCanDropTarget && gCanDropTarget !== null) {
          this.broadcast("drop", {
            target: gCanDropTarget,
            dragSource: gDragSource,
            transferData: gTransferData,
            offsetX: offset.left,
            offsetY: offset.top
          });
        }

        // fire dragend event 
        this.broadcast("dragend", {
          target: gDragSource
        })

        // clear source
        gDragSource = null;
        gDragStarted = false;
        gTransferData = null;
        gStartPoint = {};
      }
      , handleDragStart = function (e) {
        e.preventDefault();
      }
      , handleSelectStart = function (e) {
        e.preventDefault();
      };

    this.listeners = [listen(mountPoint, "mousedown", handleMouseDown)];

  }


  destroy() {
    tomato.consume(this.listeners, fn => fn());
    this.unSubscribeAll();
  }


  checkScroll(element, { left, right, top, bottom, vsbw, hsbw }) {
    const gate = 20
      , F = gate
      , timeout = 10
      , f = .3;
    let dx = 0
      , dy = 0
      , rb = bottom - hsbw
      , rr = right - vsbw;
    if (rb < gate) {
      dy += (F - rb) * f;
    } else if (top < gate) {
      dy -= (F - top) * f;
    }
    if (rr < gate) {
      dx += (F - rr) * f;
    } else if (left < gate) {
      dx -= (F - left) * f;
    }
    if (dx || dy) {
      element.scrollLeft += dx;
      element.scrollTop += dy;
      // console.log("yes , im scrolling")

      clearTimeout(this.autoScrollHandler);
      this.autoScrollHandler = setTimeout(() => {
        this.checkScroll(element, {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          vsbw,
          hsbw
        })
      }, timeout)
    }
  }
}


 
          return AlienDragAndDrop
        } ());
     
        
      } ());