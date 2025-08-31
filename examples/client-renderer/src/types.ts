import { domProps, ElementSymbol, FiberNodeSymbol, domFiber } from "./symbols";

export type FC = (props: any) => JSXElement | string | null;

export type Child = JSXElement | string | null | undefined;
export type Children = Child | Child[];
export type ElementType = string | FC | null;

export interface JSXElement {
  $$typeof: typeof ElementSymbol;
  type: ElementType;
  key?: string;
  ref?: string;
  props: any;
  children?: Children;
}

export enum EffectTag {
  NoEffect = 0x0,
  Placement = 0x1,
  Update = 0x2,
  Deletion = 0x4,
  Hydration = 0x8,
  Passive = 0x10,
  Layout = 0x20,
}

export const debugEffectTag = (tag: EffectTag): string => {
  const effects = [];
  if (tag & EffectTag.Placement) effects.push("Placement");
  if (tag & EffectTag.Update) effects.push("Update");
  if (tag & EffectTag.Deletion) effects.push("Deletion");
  if (tag & EffectTag.Hydration) effects.push("Hydration");
  if (tag & EffectTag.Passive) effects.push("Passive");
  if (tag & EffectTag.Layout) effects.push("Layout");
  if (effects.length === 0) effects.push("NoEffect");
  return effects.join(" | ");
};

export const StateHook = Symbol.for("cr.state-hook");
export const EffectHook = Symbol.for("cr.effect-hook");
type Hook =
  | {
      type: typeof StateHook;
    }
  | {
      type: typeof EffectHook;
    };

export interface FiberNode {
  $$typeof: typeof FiberNodeSymbol;
  // Identity
  type: ElementType;
  key: string | null;
  isRoot?: boolean;

  child: FiberNode | null;
  sibling: FiberNode | null;
  parent: FiberNode | RootFiber | null;
  index: number;

  // State / Instance
  dom: Node | null;
  hooks: Hook[];
  pendingProps: any;

  effectTag: EffectTag;

  // Used for double buffering
  alternate: FiberNode | null;
  nextEffect: FiberNode | null;
}

export type FunctionFiber = FiberNode & {
  type: FC;
};

export type HostFiber = Omit<FiberNode, "dom"> & {
  type: string;
  dom: Node | null;
};

export type RootFiber = Omit<FiberNode, "type" | "dom" | "alternate"> & {
  type: undefined;
  dom: Node;
  isRoot: true;
  firstEffect: FiberNode | null;
  lastEffect: FiberNode | null;
  alternate: RootFiber | null;
};

export const isFiberNode = (fiber: any): fiber is FiberNode =>
  fiber && fiber.$$typeof === FiberNodeSymbol;

export const isElement = (fiber: any): fiber is JSXElement =>
  fiber && fiber.$$typeof === ElementSymbol;

export const isFunctionFiber = (fiber: any): fiber is FunctionFiber =>
  fiber.type instanceof Function;

export const isHostFiber = (fiber: any): fiber is HostFiber =>
  typeof fiber.type === "string";

declare global {
  interface HTMLElement {
    [domFiber]?: FiberNode;
    [domProps]?: any;
  }
}
