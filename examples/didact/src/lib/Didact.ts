import {
  Dom,
  Fiber,
  FunctionFiber,
  IntrinsicFiber,
  Props,
  Root,
  Element,
} from "./Types";
import { Signal } from "signal-polyfill";

export const createElement = (
  type: string,
  props?: Props,
  ...children: Element[] | string[]
): Element => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child),
      ),
    },
  };
};

export const createTextElement = (text: string): Element => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

export const render = (element: JSX.Element, container: HTMLElement) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
};

type PrevProps = Partial<Props>;

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: PrevProps, next: Props) => (key: string) =>
  prev[key] !== next[key];
const isGone = (_prev: PrevProps, next: Props) => (key: string) =>
  !(key in next);
const updateDom = (dom: Dom, prevProps: PrevProps, nextProps: Props) => {
  console.log("updateDom", dom, prevProps, nextProps);
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key: string) => !(key in nextProps) || isNew(prevProps, nextProps))
    .forEach((name: string) => {
      const eventType = name.toLowerCase().substring(2);
      // @ts-ignore
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name: string) => {
      // @ts-ignore
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name: string) => {
      // @ts-ignore
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name: string) => {
      const eventType = name.toLowerCase().substring(2);
      // @ts-ignore
      dom.addEventListener(eventType, nextProps[name]);
    });
};

const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot!.child);
  currentRoot = wipRoot!;
  wipRoot = undefined;
};

const commitWork = (fiber?: Fiber) => {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && typeof fiber.dom !== "undefined") {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && typeof fiber.dom !== "undefined") {
    updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitDeletion = (fiber: Fiber, domParent: Dom) => {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
};

export const createDom = (fiber: IntrinsicFiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
};

let nextUnitOfWork: Fiber | Root | undefined = undefined;
let wipRoot: Root | undefined = undefined;
let currentRoot: Root;
let deletions: Fiber[] = [];

const workLoop: IdleRequestCallback = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // @ts-ignore
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

requestIdleCallback(workLoop);

const performUnitOfWork = (fiber: Fiber | Root) => {
  if (isFunctionFiber(fiber)) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: Fiber | Root | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
};

let wipFiber: Fiber;
let hookIndex: number;

const updateFunctionComponent = (fiber: FunctionFiber) => {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

export const useState = <T>(initial: T) => {
  type Action = T | ((prev: T) => T);
  const oldHook = (wipFiber as FunctionFiber).alternate?.hooks?.[hookIndex];
  if (oldHook?.state) {
    console.log("oldHook.state", oldHook.state);
  }
  const signal: Signal.State<T> =
    oldHook?.state ?? new Signal.State<T>(initial);
  const hook: {
    state: Signal.State<T>;
    queue: Action[];
  } = {
    state: signal,
    queue: [],
  };
  const actions: Action[] = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (action instanceof Function) {
      hook.state.set(action(hook.state.get()));
    } else {
      hook.state.set(action);
    }
  });

  const setState = (action: Action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  (wipFiber as FunctionFiber).hooks.push(hook);
  hookIndex++;
  const getState = () => hook.state.get();
  getState.toString = () => {
    throw "please use getState()";
  };
  return [getState, setState] as const;
};

const updateHostComponent = (fiber: IntrinsicFiber | Root) => {
  if (!fiber.dom) {
    // Case because Root always has a dom
    fiber.dom = createDom(fiber as IntrinsicFiber);
  }
  reconcileChildren(fiber, fiber.props.children);
};

const reconcileChildren = (wipFiber: Fiber | Root, elements: Fiber[]) => {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  // let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber: Fiber | undefined;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType && oldFiber) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      } as Fiber;
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: "PLACEMENT",
      } as Fiber;
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      // @ts-ignore
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
};

const isFunctionFiber = (fiber: Fiber | Root): fiber is FunctionFiber => {
  return fiber.type instanceof Function;
};

export const Didact = {
  createElement,
  render,
  useState,
};
