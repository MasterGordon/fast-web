export const ElementSymbol = Symbol.for("cr.element");
export const FragmentSymbol = Symbol.for("cr.fragment");
export const FiberNodeSymbol = Symbol.for("cr.fiber-node");
export type DomFiberKey = "__cr_fiber";
export type DomPropsKey = "__cr_props";
export const domFiber = "__cr_fiber" satisfies DomFiberKey;
export const domProps = "__cr_props" satisfies DomPropsKey;
