export type FC = (props: any) => JSX.Element | null | string;

export const jsx = function (type: string | FC, fullProps: any): JSX.Element {
  const { children, ...props } = fullProps;
  return {
    $$typeof: Symbol.for("fast.element"),
    type,
    props,
    key: props.key,
    ref: props.ref,
    children,
  };
};

export const Fragment = function (fullProps: any): JSX.Element {
  const { children, ...props } = fullProps;
  return {
    $$typeof: Symbol.for("fast.fragment"),
    type: null,
    props,
    key: props.key,
    ref: props.ref,
    children,
  };
};
