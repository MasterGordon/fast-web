namespace JSX {
  interface FC {
    (
      props: any,
    ):
      | JSX.Element
      | string
      | null
      | Promise<JSX.Element>
      | Promise<string>
      | Promsie<null>;
  }
  type Children =
    | JSX.Element
    | (string | JSX.Element | JSX.Element[])[]
    | string
    | null
    | undefined;
  type BaseElementPropsWithoutChildren = {
    className?: string;
    id?: string;
    tabindex?: number | string;
    style?: import("./types").Styles;
    [`data-${string}`]?: string | boolean;
    onClick?: (event: MouseEvent) => void;
  } & Partial<ARIAMixin>;
  type BaseElementProps = BaseElementPropsWithoutChildren & {
    children?: JSX.Children;
  };
  type SvgProps = BaseElementProps & {
    ["xml:lang"]?: string;
    ["xml:space"]?: string;
    xmlns?: string;
    // XLink attributes
    ["xlink:hrefDeprecated"]?: string;
    ["xlink:type"]?: string;
    ["xlink:role"]?: string;
    ["xlink:arcrole"]?: string;
    ["xlink:title"]?: string;
    ["xlink:show"]?: string;
    ["xlink:actuate"]?: string;
    // Presentation attributes
    ["alignment-baseline"]?: string;
    ["baseline-shift"]?: string;
    ["clip"]?: string;
    ["clipPath"]?: string;
    ["clipRule"]?: string;
    ["color"]?: string;
    ["colorInterpolation"]?: string;
    ["colorInterpolationFilters"]?: string;
    ["cursor"]?: string;
    ["cx"]?: string;
    ["cy"]?: string;
    ["d"]?: string;
    ["direction"]?: string;
    ["display"]?: string;
    ["dominantBaseline"]?: string;
    ["fill"]?: string;
    ["fillOpacity"]?: string;
    ["fillRule"]?: string;
    ["filter"]?: string;
    ["floodColor"]?: string;
    ["floodOpacity"]?: string;
    ["fontFamily"]?: string;
    ["fontSize"]?: string;
    ["fontSize-adjust"]?: string;
    ["fontStretch"]?: string;
    ["fontStyle"]?: string;
    ["fontVariant"]?: string;
    ["fontWeight"]?: string;
    ["glyphOrientation-horizontal"]?: string;
    ["glyphOrientation-vertical"]?: string;
    ["height"]?: string;
    ["imageRendering"]?: string;
    ["letterSpacing"]?: string;
    ["lightingColor"]?: string;
    ["markerEnd"]?: string;
    ["markerMid"]?: string;
    ["markerStart"]?: string;
    ["mask"]?: string;
    ["maskType"]?: string;
    ["opacity"]?: string;
    ["overflow"]?: string;
    ["pointerEvents"]?: string;
    ["r"]?: string;
    ["rx"]?: string;
    ["ry"]?: string;
    ["shapeRendering"]?: string;
    ["stopColor"]?: string;
    ["stopOpacity"]?: string;
    ["stroke"]?: string;
    ["strokeDasharray"]?: string;
    ["strokeDashoffset"]?: string;
    ["strokeLinecap"]?: string;
    ["strokeLinejoin"]?: string;
    ["strokeMiterlimit"]?: string;
    ["strokeOpacity"]?: string;
    ["strokeWidth"]?: string;
    ["textAnchor"]?: string;
    ["textDecoration"]?: string;
    ["textOverflow"]?: string;
    ["textRendering"]?: string;
    ["transform"]?: string;
    ["transformOrigin"]?: string;
    ["unicodeBidi"]?: string;
    ["vectorEffect"]?: string;
    ["visibility"]?: string;
    ["whiteSpace"]?: string;
    ["width"]?: string;
    ["wordSpacing"]?: string;
    ["writingMode"]?: string;
    ["x"]?: string;
    ["y"]?: string;
    viewbox?: string;
  };
  interface IntrinsicElements {
    a: BaseElementProps & {
      href?: string;
      target?: HTMLAnchorElement["target"];
    };
    img: BaseElementProps & {
      src: string;
      alt?: string;
      width?: number;
      height?: number;
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
    svg: SvgProps;
    path: SvgProps;
    g: SvgProps;
    [tagName: string]: BaseElementProps;
  }
  interface Element {
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
