function getNodePath(el) {
  let node, path = [];

  for (node = el; node; node = node.parentNode) {
    if (node.nodeType === 1) {
      path.push(node);
    }
  }
  return path;
}

export default getNodePath;