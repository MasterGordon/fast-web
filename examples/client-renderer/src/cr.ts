interface FiberNode {
  child?: FiberNode;
  sibling?: FiberNode;
  parent?: FiberNode;
}

let unitOfWork: FiberNode | null = null;

function performUnitOfWork(fiber: FiberNode) {
  console.log("performUnitOfWork", fiber);

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: FiberNode | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

function workLoop(deadline: IdleDeadline) {
  while (unitOfWork && deadline.timeRemaining() > 0) {
    unitOfWork = performUnitOfWork(unitOfWork);
  }

  if (unitOfWork) {
    requestIdleCallback(workLoop);
  } else {
    // Commit all the changes that have accumulated.
  }
}

function linkParents(fiber: FiberNode, parent?: FiberNode) {
  fiber.parent = parent;
  if (fiber.child) {
    linkParents(fiber.child, fiber);
  }
  if (fiber.sibling) {
    linkParents(fiber.sibling, fiber);
  }
}

requestIdleCallback(workLoop);
