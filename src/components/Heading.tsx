import type { Styles } from "~/types";

interface HeadingProps {
  children: JSX.Children;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl";
  style?: Styles;
}

const Heading = ({
  children,
  as = "span",
  size = "base",
  style,
}: HeadingProps) => {
  const Tag = as;
  return (
    <Tag
      style={{
        fontSize: "$" + size,
        fontWeight: "$extrabold",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default Heading;
