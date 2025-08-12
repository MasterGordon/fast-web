export interface Props {
  children: Fiber[];
  nodeValue?: string;
  [key: string]: any;
}

export interface Element {
  type: string;
  props: {
    children: Element[];
    nodeValue?: string;
    [key: string]: any;
  };
}

export type Dom = HTMLElement | Text;

type Hook = any;

export interface IntrinsicFiber extends BaseFiber {
  dom?: Dom;
  type: string;
  alternate?: IntrinsicFiber;
}

export interface FunctionFiber extends BaseFiber {
  dom?: undefined;
  type: JSX.FC;
  hooks: Hook[];
  alternate?: FunctionFiber;
}

export type Fiber = IntrinsicFiber | FunctionFiber;

export interface BaseFiber extends JSX.Element {
  parent: Fiber | Root;
  alternate?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  props: Props;
  effectTag: "PLACEMENT" | "UPDATE" | "DELETION";
}

export interface Root
  extends Omit<Fiber, "parent" | "type" | "effectTag" | "alternate" | "dom"> {
  dom: Dom;
  child?: Fiber;
  alternate?: Root;
  type?: undefined;
  parent?: undefined;
}
