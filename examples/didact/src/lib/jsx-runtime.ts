import { createElement } from "./Didact";

export type FC = (props: any) => JSX.Element | null | string;

export const jsx = function (type: string | FC, fullProps: any): JSX.Element {
  const { children, ...props } = fullProps;
  return createElement(
    type,
    props,
    ...(Array.isArray(children) ? children : [children]),
  );
};

export const Fragment = createElement;
