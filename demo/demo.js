if (window.AlienDragAndDrop) {
  window.alienDragAndDrop = new AlienDragAndDrop(document.body);

  alienDragAndDrop.subscribe("dragstart", function (payload) {
    var target = payload.target
      , canDrag = payload.canDrag
      , setDragGhost = payload.setDragGhost
    if (target === a)
      canDrag();
  });

  alienDragAndDrop.subscribe("dragover", function (payload) {
    var target = payload.target
      , canDrop = payload.canDrop

    if (target === window.b) {
      canDrop();
    }
  });
}