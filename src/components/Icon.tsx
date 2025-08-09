import { type IconNode } from "lucide";
import type { CSSProperties } from "~/types";

interface IconProps extends JSX.SvgProps {
  icon: IconNode;
  size?: CSSProperties["width"];
  color?: CSSProperties["color"];
}

export const Icon = ({
  icon,
  size = "$4",
  color = "white",
  style,
  ...svgProps
}: IconProps) => {
  return (
    <svg
      viewbox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size,
        height: size,
        color,
        ...style,
      }}
      {...svgProps}
    >
      {icon.map(([Tag, attrs]) => (
        <Tag {...attrs} />
      ))}
    </svg>
  );
};
