import getNodePath from './getNodePath'
import isScrollable from './isScrollable'

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

export default getCloestScrollableElement;