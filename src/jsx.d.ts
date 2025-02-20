namespace JSX {
  interface FC {
    (props: any): JSX.Element | string | null;
  }
  type Children =
    | JSX.Element
    | (string | JSX.Element | JSX.Element[])[]
    | string
    | null
    | undefined;
  type CSSTypeProperties = import("csstype").Properties;
  type CSSProperties = import("csstype").Properties & {
    marginX?: CSSTypeProperties["marginLeft"];
    marginY?: CSSTypeProperties["marginTop"];
    paddingX?: CSSTypeProperties["paddingLeft"];
    paddingY?: CSSTypeProperties["paddingTop"];
  };
  type BaseElementPropsWithoutChildren = {
    className?: string;
    style?: CSSProperties;
  } & Partial<ARIAMixin>;
  type BaseElementProps = BaseElementPropsWithoutChildren & {
    children?: JSX.Children;
  };
  interface IntrinsicElements {
    a: BaseElementProps & {
      href?: string;
      target?: HTMLAnchorElement["target"];
    };

    // Void IntrinsicElements
    // https://github.com/wooorm/html-void-elements
    area: BaseElementPropsWithoutChildren;
    base: BaseElementPropsWithoutChildren;
    basefont: BaseElementPropsWithoutChildren;
    bgsound: BaseElementPropsWithoutChildren;
    br: BaseElementPropsWithoutChildren;
    col: BaseElementPropsWithoutChildren;
    command: BaseElementPropsWithoutChildren;
    embed: BaseElementPropsWithoutChildren;
    frame: BaseElementPropsWithoutChildren;
    hr: BaseElementPropsWithoutChildren;
    image: BaseElementPropsWithoutChildren;
    img: BaseElementPropsWithoutChildren;
    input: BaseElementPropsWithoutChildren;
    keygen: BaseElementPropsWithoutChildren;
    link: BaseElementPropsWithoutChildren;
    meta: BaseElementPropsWithoutChildren;
    param: BaseElementPropsWithoutChildren;
    source: BaseElementPropsWithoutChildren;
    track: BaseElementPropsWithoutChildren;
    wbr: BaseElementPropsWithoutChildren;
    [tagName: string]: BaseElementProps;
  }
  interface Element {
    $$typeof: Symbol;
    type: string | FC | null;
    key?: string;
    ref?: string;
    children?: JSX.Children;
    props: any;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}
