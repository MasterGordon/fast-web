import { ElementSymbol } from "~/symbols";
import type { FC, JSXElement } from "~/types";

export const jsx = function (type: string | FC, fullProps: any): JSXElement {
  const { key, children, ref, ...props } = fullProps;
  return {
    $$typeof: ElementSymbol,
    type,
    props: {
      ...props,
      children: Array.isArray(children) ? children : [children],
    },
    key: key,
    ref: ref,
  };
};

export const Fragment = function (fullProps: any): JSXElement {
  const { children, ...props } = fullProps;
  return {
    $$typeof: ElementSymbol,
    type: null,
    props,
    key: props.key,
    ref: props.ref,
    children,
  };
};
