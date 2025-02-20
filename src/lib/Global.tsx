import { getStyleRules } from "~/system/style-rules";
import { pushStyle } from "./fast-web";

interface GlobalProps {
  css?: Record<string, JSX.CSSProperties>;
}

export default function Global({ css = {} }: GlobalProps) {
  const stylesArray = Object.entries(css).map<[string, string[]]>(
    ([key, value]) => {
      return [key, getStyleRules(value)];
    },
  );

  stylesArray.forEach(([key, value]) => {
    pushStyle(`${key} {${value.join(" ")}}`);
  });

  return null;
}
