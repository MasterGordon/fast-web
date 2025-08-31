import { domFiber, domProps, ElementSymbol, FiberNodeSymbol } from "./symbols";
import {
  debugEffectTag,
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

let unitOfWork: FiberNode | RootFiber | null = null;
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

const getRootFiber = (fiber: FiberNode): RootFiber => {
  let root = fiber.parent;
  while (root) {
    if (root.isRoot) {
      return root as RootFiber;
    }
    root = root.parent;
  }
  throw "Can't find root";
};

function performUnitOfWork(fiber: FiberNode | RootFiber) {
  if (isFunctionFiber(fiber)) {
    updateFunctionComponent(fiber);
  } else if (isHostFiber(fiber)) {
    updateHostComponent(fiber);
  } else if (fiber.isRoot) {
    reconcileChildren(fiber, fiber.pendingProps.children);
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
  if (fiber.type !== textElementType) {
    reconcileChildren(fiber, fiber.pendingProps.children);
  }
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

function reconcileChildren(
  wipFiber: FiberNode | RootFiber,
  children: Child[] = [],
) {
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

function updateProps(fiber: HostFiber) {
  const dom = fiber.dom;
  if (dom instanceof Text) {
    dom.nodeValue = fiber.pendingProps.nodeValue;
    return;
  }
  if (!dom || !(dom instanceof HTMLElement)) {
    return;
  }
  const prevProps = fiber.alternate?.pendingProps ?? {};
  const nextProps = fiber.pendingProps ?? {};
  let propNames = new Set([
    ...Object.keys(prevProps),
    ...Object.keys(nextProps),
  ]);
  for (const propName of propNames) {
    if (
      propName === "children" ||
      propName === "ref" ||
      propName.startsWith("on")
    ) {
      continue;
    }
    const prevProp = prevProps[propName];
    const nextProp = nextProps[propName];
    if (nextProp === undefined) {
      dom.removeAttribute(propName);
      continue;
    }
    if (prevProp !== nextProp) {
      // Handle special cases
      if (propName === "className") {
        dom.className = nextProp;
      } else if (propName === "htmlFor") {
        (dom as HTMLLabelElement).htmlFor = nextProp;
      } else if (propName === "style" && typeof nextProp === "object") {
        Object.assign(dom.style, nextProp);
      } else {
        dom.setAttribute(propName, nextProp);
      }
    }
  }
}

export function scheduleRerender(fiber: FiberNode) {
  const root = getRootFiber(fiber);
  wipRoot = root.alternate;
  unitOfWork = root.alternate;
  requestIdleCallback(workLoop);
}

function commitRoot() {
  if (!wipRoot) return;
  effectFiber = wipRoot.firstEffect;
  while (effectFiber) {
    console.log(
      "commit",
      debugEffectTag(effectFiber.effectTag),
      typeof effectFiber.type !== "function"
        ? effectFiber.type
        : effectFiber.type.name,
    );
    // Do effect
    if (
      effectFiber.effectTag & EffectTag.Placement &&
      isHostFiber(effectFiber)
    ) {
      if (effectFiber.type === textElementType) {
        effectFiber.dom = document.createTextNode(
          effectFiber.pendingProps.nodeValue,
        );
      } else {
        effectFiber.dom = document.createElement(effectFiber.type as string);
        updateProps(effectFiber);
        (effectFiber.dom as HTMLElement)[domFiber] = effectFiber;
        (effectFiber.dom as HTMLElement)[domProps] = effectFiber.pendingProps;
        // TODO: Maybe add ref in far future might consider a general on mount and on unmount event
      }
      const parent = findDomParent(effectFiber);
      if (parent?.dom) {
        parent.dom.appendChild(effectFiber.dom);
      } else {
        throw "Can't commit without parent";
      }
    }
    if (effectFiber.effectTag & EffectTag.Deletion) {
      if (effectFiber.dom && effectFiber.dom instanceof HTMLElement) {
        effectFiber.dom.remove();
      }
    }
    if (effectFiber.effectTag & EffectTag.Update && isHostFiber(effectFiber)) {
      updateProps(effectFiber);
    }
    effectFiber = effectFiber.nextEffect;
    wipRoot.lastEffect = effectFiber;
  }

  wipRoot.firstEffect = null;
  wipRoot.lastEffect = null;
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
  if (target === root.dom) return;
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
  const alternate: RootFiber = {
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
    alternate,
    nextEffect: null,
    isRoot: true,
    firstEffect: null,
    lastEffect: null,
  };
  alternate.alternate = rootFiber;
  for (const event of events) {
    rootFiber.dom.addEventListener(event, (event) =>
      handleEvent(event, rootFiber),
    );
  }
  return rootFiber;
}

export function render(rootFiber: RootFiber, element: JSXElement) {
  wipRoot = rootFiber;
  rootFiber.pendingProps = {
    children: [element],
  };
  rootFiber.alternate!.pendingProps = {
    children: [element],
  };
  // const fiber = createFiberFromElement(element);
  // fiber.parent = rootFiber;
  // rootFiber.child = fiber;
  // wipRoot.child = fiber;
  unitOfWork = wipRoot;
}
