import { domFiber, ElementSymbol, FiberNodeSymbol } from "./symbols";
import {
  EffectTag,
  isFunctionFiber,
  isHostFiber,
  type Child,
  type FiberNode,
  type FunctionFiber,
  type HostFiber,
  type JSXElement,
  type RootFiber,
} from "./types";

let unitOfWork: FiberNode | null = null;
let wipFiber: FiberNode;
let hookIndex: number;
let effectFiber: FiberNode | null = null;
let wipRoot: RootFiber | null = null;

const textElementType = "$$TEXT_ELEMENT$$";
const createTextElement = (text: string): JSXElement => ({
  $$typeof: ElementSymbol,
  type: textElementType,
  props: {
    nodeValue: text,
    children: [],
  },
});

function performUnitOfWork(fiber: FiberNode) {
  if (isFunctionFiber(fiber)) {
    updateFunctionComponent(fiber);
  } else if (isHostFiber(fiber)) {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: FiberNode | RootFiber | null = fiber;
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
  } else if (wipRoot) {
    commitRoot();
  }
}

function createFiberFromElement(element: JSXElement): FiberNode {
  return {
    $$typeof: FiberNodeSymbol,
    type: element.type,
    key: element.key ?? null,
    child: null,
    sibling: null,
    parent: null,
    index: 0,
    dom: null,
    hooks: [],
    pendingProps: element.props,
    effectTag: EffectTag.NoEffect,
    alternate: null,
    nextEffect: null,
  };
}

function updateFunctionComponent(fiber: FunctionFiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  wipFiber.effectTag = EffectTag.NoEffect;
  const children = [fiber.type(fiber.pendingProps)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: HostFiber) {
  wipFiber = fiber;
  reconcileChildren(fiber, fiber.pendingProps.children);
}

function pushEffect(fiber: FiberNode) {
  if (!wipRoot) {
    throw "pushEffect() must be called inside a root";
  }
  if (effectFiber) {
    effectFiber.nextEffect = fiber;
    effectFiber = fiber;
  } else {
    effectFiber = fiber;
    // @ts-ignore // HACK: Only for debugging
    window.effectFiber = fiber;
    unitOfWork = fiber;
  }
  if (!wipRoot.firstEffect) {
    wipRoot.firstEffect = fiber;
  }
  wipRoot.lastEffect = fiber;
}

function reconcileChildren(wipFiber: FiberNode, children: Child[] = []) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: FiberNode | null = null;
  const elements = children
    .filter((child) => child !== null && child !== undefined)
    .map((child) => {
      if (typeof child === "string") {
        return createTextElement(child);
      }
      return child;
    });

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber: FiberNode | null = null;

    const isSameType = oldFiber && element && element.type === oldFiber.type;
    if (isSameType && oldFiber) {
      newFiber = {
        $$typeof: FiberNodeSymbol,
        type: oldFiber.type,
        key: element.key ?? null,
        child: null,
        sibling: null,
        parent: wipFiber,
        index: 0,
        dom: oldFiber.dom,
        hooks: [],
        pendingProps: element.props,
        effectTag: EffectTag.Update,
        alternate: oldFiber,
        nextEffect: null,
      };
      pushEffect(newFiber);
    }

    if (element && !isSameType) {
      newFiber = {
        $$typeof: FiberNodeSymbol,
        type: element.type,
        key: element.key ?? null,
        child: null,
        sibling: null,
        parent: wipFiber,
        index: 0,
        dom: null,
        hooks: [],
        pendingProps: element.props,
        effectTag: EffectTag.Placement,
        alternate: null,
        nextEffect: null,
      };
      pushEffect(newFiber);
    }

    if (oldFiber && !isSameType) {
      oldFiber.effectTag = EffectTag.Deletion;
      pushEffect(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

requestIdleCallback(workLoop);

// TODO: Maybe store next parent HostFiber
function findDomParent(fiber: FiberNode) {
  let parent = fiber.parent;
  while (parent) {
    if (parent.dom) {
      return parent;
    }
    parent = parent.parent;
  }
  return null;
}

function commitRoot() {
  if (!wipRoot) return;
  effectFiber = wipRoot.firstEffect;
  while (effectFiber) {
    // Do effect
    if (effectFiber.effectTag & EffectTag.Placement) {
      let dom: Node;
      if (effectFiber.type === textElementType) {
        dom = document.createTextNode(effectFiber.pendingProps.nodeValue);
      } else {
        dom = document.createElement(effectFiber.type as string);
        // TODO: Set props
        // TODO: Maybe add event section
        // TODO: Maybe add ref in far future might consider a general on mount and on unmount event
      }
      effectFiber.dom = dom;
      const parent = findDomParent(effectFiber);
      if (parent?.dom) {
        console.log("Appending", dom, "into", parent.dom);
        parent.dom.appendChild(dom);
      } else {
        throw "Can't commit without parent";
      }
    }
    effectFiber = effectFiber.nextEffect;
  }
  wipRoot = null;
}

const events: (keyof GlobalEventHandlersEventMap)[] = [
  "click",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "mousedown",
  "mouseup",
  "pointermove",
  "pointerenter",
  "pointerleave",
  "pointerover",
  "pointerout",
  "blur",
  "focus",
  "drag",
  "dragend",
  "dragenter",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "touchcancel",
  "touchend",
  "touchmove",
  "touchstart",
];
const getEventProp = (eventType: string) => {
  return `on${eventType.substring(0, 1).toUpperCase()}${eventType.substring(1)}`;
};
function handleEvent(event: Event, root: RootFiber) {
  const target = event.target as HTMLElement;
  const type = event.type;
  let node: FiberNode | RootFiber | null = target[domFiber] ?? null;
  let propagationStopped = false;
  const ogStopPropagation = event.stopPropagation;
  event.stopPropagation = () => {
    propagationStopped = true;
    ogStopPropagation.call(event);
  };
  do {
    node?.pendingProps[getEventProp(type)]?.(event);
    if (propagationStopped) {
      break;
    }
    if (event.bubbles) {
      node = node?.parent ?? null;
    }
  } while (node?.dom !== root.dom);
}

export function createRootFiber(root: HTMLElement): RootFiber {
  const rootFiber: RootFiber = {
    $$typeof: FiberNodeSymbol,
    type: undefined,
    key: null,
    child: null,
    sibling: null,
    parent: null,
    index: 0,
    dom: root,
    hooks: [],
    pendingProps: null,
    effectTag: EffectTag.NoEffect,
    alternate: null,
    nextEffect: null,
    isRoot: true,
    firstEffect: null,
    lastEffect: null,
  };
  for (const event of events) {
    rootFiber.dom.addEventListener(event, (event) =>
      handleEvent(event, rootFiber),
    );
  }
  return rootFiber;
}

export function render(rootFiber: RootFiber, element: JSXElement) {
  wipRoot = rootFiber;
  const fiber = createFiberFromElement(element);
  fiber.parent = rootFiber;
  rootFiber.child = fiber;
  wipRoot.child = fiber;
  unitOfWork = fiber;
  console.log(fiber);
}
