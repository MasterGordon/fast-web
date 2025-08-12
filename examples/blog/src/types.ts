import * as CSS from "csstype";

export const pseudoClasses = {
  hover: "&:hover",
  focus: "&:focus",
  active: "&:active",
  visited: "&:visited",
  first: "&:first-child",
  last: "&:last-child",
  odd: "&:nth-child(odd)",
  even: "&:nth-child(even)",
  disabled: "&:disabled",
  checked: "&:checked",
  selected: "&:selected",
  readOnly: "&:read-only",
  empty: "&:empty",
  before: "&:before",
  after: "&:after",
  link: "&:link",
  visitedLink: "&:visited",
  activeLink: "&:active",
  focusWithin: "&:focus-within",
} as const;

export type PseudoClassProperty = `_${keyof typeof pseudoClasses}`;

export type BaseCSSProperty = CSS.Properties;
export type CSSProperties = CSS.Properties & {
  marginX?: CSS.Properties["marginLeft"];
  marginY?: CSS.Properties["marginTop"];
  paddingX?: CSS.Properties["paddingLeft"];
  paddingY?: CSS.Properties["paddingTop"];
  mX?: CSS.Properties["marginLeft"];
  mY?: CSS.Properties["marginTop"];
  pX?: CSS.Properties["paddingLeft"];
  pY?: CSS.Properties["paddingTop"];
  maxW?: CSS.Properties["maxWidth"];
  maxH?: CSS.Properties["maxHeight"];
  minW?: CSS.Properties["minWidth"];
  minH?: CSS.Properties["minHeight"];
};
export type CSSDuration = `${number}s` | `${number}ms`;
export type EasingFunction =
  | (string & {})
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-in-out"
  | "ease-out";

type ArbitrarySelectors = Record<`&${string}`, CSSProperties>;

type PseudoClassSelectors = Partial<Record<PseudoClassProperty, CSSProperties>>;

export type Styles = ArbitrarySelectors & PseudoClassSelectors & CSSProperties;
